import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";

import { useBoardWebSocket } from "./useBoardWebSocket";

// ---------------------------------------------------------------------------
// Mock EventSource
// ---------------------------------------------------------------------------

interface MockEsInstance {
  url: string;
  onopen: ((e: Event) => void) | null;
  onerror: ((e: Event) => void) | null;
  onmessage: ((e: MessageEvent) => void) | null;
  close: jest.Mock;
  /** Helper: simulate the stream opening */
  triggerOpen(): void;
  /** Helper: simulate an error (connection failure) */
  triggerError(): void;
  /** Helper: simulate an incoming data event */
  triggerMessage(data: unknown): void;
}

let esInstances: MockEsInstance[] = [];

function createMockEs(url: string): MockEsInstance {
  const instance: MockEsInstance = {
    url,
    onopen: null,
    onerror: null,
    onmessage: null,
    close: jest.fn(),
    triggerOpen() {
      this.onopen?.({} as Event);
    },
    triggerError() {
      this.onerror?.({} as Event);
    },
    triggerMessage(data: unknown) {
      this.onmessage?.({ data: JSON.stringify(data) } as MessageEvent<string>);
    },
  };
  esInstances.push(instance);
  return instance;
}

const MockEsConstructor = jest.fn((url: string) => createMockEs(url));

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return { queryClient, wrapper };
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  esInstances = [];
  MockEsConstructor.mockClear();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).EventSource = MockEsConstructor;
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useBoardWebSocket", () => {
  describe("connection lifecycle", () => {
    it("connects to the correct URL on mount", () => {
      const { wrapper } = makeWrapper();
      renderHook(() => useBoardWebSocket({ projectId: "proj-123" }), {
        wrapper,
      });

      expect(MockEsConstructor).toHaveBeenCalledWith(
        "/api/ws/board?project_id=proj-123",
      );
    });

    it("does not connect when projectId is null", () => {
      const { wrapper } = makeWrapper();
      renderHook(() => useBoardWebSocket({ projectId: null }), { wrapper });
      expect(MockEsConstructor).not.toHaveBeenCalled();
    });

    it("does not connect when projectId is undefined", () => {
      const { wrapper } = makeWrapper();
      renderHook(() => useBoardWebSocket({ projectId: undefined }), { wrapper });
      expect(MockEsConstructor).not.toHaveBeenCalled();
    });

    it("isConnected is false before onopen fires", () => {
      const { wrapper } = makeWrapper();
      const { result } = renderHook(
        () => useBoardWebSocket({ projectId: "proj-123" }),
        { wrapper },
      );
      expect(result.current.isConnected).toBe(false);
    });

    it("isConnected becomes true after onopen fires", async () => {
      const { wrapper } = makeWrapper();
      const { result } = renderHook(
        () => useBoardWebSocket({ projectId: "proj-123" }),
        { wrapper },
      );

      act(() => esInstances[0].triggerOpen());

      await waitFor(() => expect(result.current.isConnected).toBe(true));
    });

    it("isConnected becomes false after onerror fires", async () => {
      const { wrapper } = makeWrapper();
      const { result } = renderHook(
        () => useBoardWebSocket({ projectId: "proj-123" }),
        { wrapper },
      );

      act(() => esInstances[0].triggerOpen());
      await waitFor(() => expect(result.current.isConnected).toBe(true));

      act(() => esInstances[0].triggerError());
      await waitFor(() => expect(result.current.isConnected).toBe(false));
    });

    it("closes the EventSource on unmount", () => {
      const { wrapper } = makeWrapper();
      const { unmount } = renderHook(
        () => useBoardWebSocket({ projectId: "proj-123" }),
        { wrapper },
      );

      act(() => esInstances[0].triggerOpen());
      unmount();

      expect(esInstances[0].close).toHaveBeenCalled();
    });

    it("re-connects when projectId changes", () => {
      const { wrapper } = makeWrapper();
      const { rerender } = renderHook(
        ({ projectId }: { projectId: string }) =>
          useBoardWebSocket({ projectId }),
        { wrapper, initialProps: { projectId: "proj-A" } },
      );

      expect(MockEsConstructor).toHaveBeenCalledTimes(1);
      expect(esInstances[0].url).toBe("/api/ws/board?project_id=proj-A");

      rerender({ projectId: "proj-B" });

      expect(MockEsConstructor).toHaveBeenCalledTimes(2);
      expect(esInstances[1].url).toBe("/api/ws/board?project_id=proj-B");
      // Old source was closed
      expect(esInstances[0].close).toHaveBeenCalled();
    });
  });

  describe("message handling", () => {
    it("calls invalidateQueries with TASK_BOARDS key on a BoardEvent", async () => {
      const { wrapper, queryClient } = makeWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      renderHook(() => useBoardWebSocket({ projectId: "proj-123" }), {
        wrapper,
      });

      act(() => esInstances[0].triggerOpen());
      act(() =>
        esInstances[0].triggerMessage({
          type: "task:created",
          projectId: "proj-123",
          taskBoardId: "board-1",
        }),
      );

      await waitFor(() => expect(invalidateSpy).toHaveBeenCalledTimes(1));
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: QUERY_KEYS.TASK_BOARDS("proj-123"),
      });
    });

    it.each([
      "task:created",
      "task:updated",
      "task:deleted",
      "task:moved",
      "task:status_changed",
      "board:created",
      "board:updated",
      "board:deleted",
      "board:reordered",
    ] as const)(
      "invalidates queries on event type '%s'",
      async (eventType) => {
        const { wrapper, queryClient } = makeWrapper();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

        renderHook(() => useBoardWebSocket({ projectId: "proj-ev" }), {
          wrapper,
        });

        act(() => esInstances[0].triggerOpen());
        act(() =>
          esInstances[0].triggerMessage({
            type: eventType,
            projectId: "proj-ev",
            taskBoardId: "board-x",
            taskId: "task-x",
          }),
        );

        await waitFor(() => expect(invalidateSpy).toHaveBeenCalledTimes(1));
      },
    );

    it("ignores malformed (non-JSON) messages without throwing", () => {
      const { wrapper } = makeWrapper();
      renderHook(() => useBoardWebSocket({ projectId: "proj-123" }), {
        wrapper,
      });

      act(() => esInstances[0].triggerOpen());

      expect(() => {
        esInstances[0].onmessage?.({ data: "not-json{{" } as MessageEvent);
      }).not.toThrow();
    });

    it("does not invalidate queries for unknown event types", async () => {
      const { wrapper, queryClient } = makeWrapper();
      const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

      renderHook(() => useBoardWebSocket({ projectId: "proj-123" }), {
        wrapper,
      });

      act(() => esInstances[0].triggerOpen());
      act(() =>
        esInstances[0].triggerMessage({ type: "unknown:event", projectId: "proj-123" }),
      );

      await act(async () => {});

      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });
});
