/** Singleton in-process SSE broadcaster for board events. */

export type BoardEvent =
  | { type: "task:created"; projectId: string; taskBoardId: string }
  | { type: "task:updated"; projectId: string; taskId: string }
  | { type: "task:deleted"; projectId: string; taskId: string; taskBoardId: string }
  | { type: "task:moved"; projectId: string; taskId: string; taskBoardId: string }
  | { type: "task:status_changed"; projectId: string; taskId: string; taskBoardId: string }
  | { type: "board:created"; projectId: string }
  | { type: "board:updated"; projectId: string; taskBoardId: string }
  | { type: "board:deleted"; projectId: string; taskBoardId: string }
  | { type: "board:reordered"; projectId: string };

type SseController = ReadableStreamDefaultController<Uint8Array>;

// Keyed by projectId → set of active SSE stream controllers
const channels = new Map<string, Set<SseController>>();

const encoder = new TextEncoder();

export function registerClient(projectId: string, ctrl: SseController): void {
  if (!channels.has(projectId)) {
    channels.set(projectId, new Set());
  }
  channels.get(projectId)!.add(ctrl);
}

export function unregisterClient(projectId: string, ctrl: SseController): void {
  const bucket = channels.get(projectId);
  if (!bucket) return;
  bucket.delete(ctrl);
  if (bucket.size === 0) {
    channels.delete(projectId);
  }
}

export function broadcastToProject(
  projectId: string,
  event: BoardEvent,
  sourceClientId?: string,
): void {
  const bucket = channels.get(projectId);
  if (!bucket || bucket.size === 0) return;

  const payload = encoder.encode(
    `data: ${JSON.stringify({ ...event, sourceClientId })}\n\n`,
  );
  const dead: SseController[] = [];

  for (const ctrl of bucket) {
    try {
      ctrl.enqueue(payload);
    } catch {
      dead.push(ctrl);
    }
  }

  for (const d of dead) {
    bucket.delete(d);
  }

  if (bucket.size === 0) {
    channels.delete(projectId);
  }
}
