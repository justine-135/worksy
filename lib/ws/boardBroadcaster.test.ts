import type { BoardEvent } from "./boardBroadcaster.lib";
import {
  broadcastToProject,
  registerClient,
  unregisterClient,
} from "./boardBroadcaster.lib";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SseController = ReadableStreamDefaultController<Uint8Array>;

interface MockCtrlHandle {
  ctrl: SseController;
  enqueue: jest.Mock;
  close: jest.Mock;
  error: jest.Mock;
}

function makeMockCtrl(): MockCtrlHandle {
  const enqueue = jest.fn();
  const close = jest.fn();
  const error = jest.fn();
  const ctrl = { enqueue, close, error, desiredSize: 1 } as unknown as SseController;
  return { ctrl, enqueue, close, error };
}

afterEach(() => {
  jest.clearAllMocks();
});

const SAMPLE_EVENT: BoardEvent = {
  type: "task:created",
  projectId: "proj-1",
  taskBoardId: "board-1",
};

// ---------------------------------------------------------------------------
// registerClient
// ---------------------------------------------------------------------------

describe("registerClient", () => {
  it("adds a client to the project bucket", () => {
    const { ctrl, enqueue } = makeMockCtrl();
    registerClient("proj-register", ctrl);

    broadcastToProject("proj-register", SAMPLE_EVENT);
    expect(enqueue).toHaveBeenCalledTimes(1);

    unregisterClient("proj-register", ctrl);
  });

  it("adds multiple clients to the same project", () => {
    const h1 = makeMockCtrl();
    const h2 = makeMockCtrl();

    registerClient("proj-multi", h1.ctrl);
    registerClient("proj-multi", h2.ctrl);

    broadcastToProject("proj-multi", SAMPLE_EVENT);

    expect(h1.enqueue).toHaveBeenCalledTimes(1);
    expect(h2.enqueue).toHaveBeenCalledTimes(1);

    unregisterClient("proj-multi", h1.ctrl);
    unregisterClient("proj-multi", h2.ctrl);
  });
});

// ---------------------------------------------------------------------------
// unregisterClient
// ---------------------------------------------------------------------------

describe("unregisterClient", () => {
  it("removes a client so it no longer receives broadcasts", () => {
    const { ctrl, enqueue } = makeMockCtrl();
    registerClient("proj-unreg", ctrl);
    unregisterClient("proj-unreg", ctrl);

    broadcastToProject("proj-unreg", SAMPLE_EVENT);
    expect(enqueue).not.toHaveBeenCalled();
  });

  it("is a no-op when the project bucket does not exist", () => {
    const { ctrl } = makeMockCtrl();
    expect(() => unregisterClient("proj-nonexistent", ctrl)).not.toThrow();
  });

  it("removes the project bucket when the last client unregisters", () => {
    const { ctrl, enqueue } = makeMockCtrl();
    registerClient("proj-last", ctrl);
    unregisterClient("proj-last", ctrl);

    expect(() => broadcastToProject("proj-last", SAMPLE_EVENT)).not.toThrow();
    expect(enqueue).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// broadcastToProject
// ---------------------------------------------------------------------------

describe("broadcastToProject", () => {
  it("sends SSE-encoded event to all clients in the project", () => {
    const h1 = makeMockCtrl();
    const h2 = makeMockCtrl();

    registerClient("proj-broadcast", h1.ctrl);
    registerClient("proj-broadcast", h2.ctrl);

    broadcastToProject("proj-broadcast", SAMPLE_EVENT);

    expect(h1.enqueue).toHaveBeenCalledTimes(1);
    expect(h2.enqueue).toHaveBeenCalledTimes(1);

    // Verify the payload is an SSE-formatted Uint8Array containing the event JSON
    const [payload] = h1.enqueue.mock.calls[0] as [Uint8Array];
    const text = new TextDecoder().decode(payload);
    expect(text).toMatch(/^data: /);
    expect(text).toContain(JSON.stringify(SAMPLE_EVENT));
    expect(text).toMatch(/\n\n$/);

    unregisterClient("proj-broadcast", h1.ctrl);
    unregisterClient("proj-broadcast", h2.ctrl);
  });

  it("silently removes a dead controller whose enqueue throws", () => {
    const deadEnqueue = jest.fn().mockImplementation(() => {
      throw new Error("stream closed");
    });
    const deadCtrl = {
      enqueue: deadEnqueue,
      close: jest.fn(),
      error: jest.fn(),
      desiredSize: 0,
    } as unknown as SseController;

    const alive = makeMockCtrl();

    registerClient("proj-dead", deadCtrl);
    registerClient("proj-dead", alive.ctrl);

    expect(() => broadcastToProject("proj-dead", SAMPLE_EVENT)).not.toThrow();
    expect(alive.enqueue).toHaveBeenCalledTimes(1);

    // Subsequent broadcast no longer attempts the dead controller
    alive.enqueue.mockClear();
    deadEnqueue.mockClear();
    broadcastToProject("proj-dead", SAMPLE_EVENT);
    expect(deadEnqueue).not.toHaveBeenCalled();
    expect(alive.enqueue).toHaveBeenCalledTimes(1);

    unregisterClient("proj-dead", alive.ctrl);
  });

  it("does not send to clients in a different project", () => {
    const hA = makeMockCtrl();
    const hB = makeMockCtrl();

    registerClient("proj-A", hA.ctrl);
    registerClient("proj-B", hB.ctrl);

    broadcastToProject("proj-A", { ...SAMPLE_EVENT, projectId: "proj-A" });

    expect(hA.enqueue).toHaveBeenCalledTimes(1);
    expect(hB.enqueue).not.toHaveBeenCalled();

    unregisterClient("proj-A", hA.ctrl);
    unregisterClient("proj-B", hB.ctrl);
  });

  it("is a no-op when the project has no registered clients", () => {
    expect(() => broadcastToProject("proj-empty", SAMPLE_EVENT)).not.toThrow();
  });
});
