import { getServerSession } from "next-auth";

import { authConfig } from "@/lib/auth/auth";
import {
  registerClient,
  unregisterClient,
} from "@/lib/ws/boardBroadcaster.lib";

export const dynamic = "force-dynamic";

const HEARTBEAT_INTERVAL_MS = 25_000;
const encoder = new TextEncoder();

export async function GET(req: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("project_id");

  if (!projectId) {
    return new Response("Missing project_id", { status: 400 });
  }

  let ctrl: ReadableStreamDefaultController<Uint8Array>;
  let heartbeatTimer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      ctrl = c;
      registerClient(projectId, ctrl);

      // Signal to the client that the stream is open
      ctrl.enqueue(encoder.encode(": connected\n\n"));

      heartbeatTimer = setInterval(() => {
        try {
          ctrl.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, HEARTBEAT_INTERVAL_MS);
    },
    cancel() {
      clearInterval(heartbeatTimer);
      unregisterClient(projectId, ctrl);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
