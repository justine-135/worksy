"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import { BoardEvent } from "@/lib/ws/boardBroadcaster.lib";

interface UseBoardWebSocketOptions {
  projectId?: string | null;
}

interface UseBoardWebSocketResult {
  isConnected: boolean;
}

export function useBoardWebSocket({
  projectId,
}: UseBoardWebSocketOptions): UseBoardWebSocketResult {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);
  const unmountedRef = useRef(false);

  const invalidateBoard = useCallback(() => {
    if (!projectId) return;
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.TASK_BOARDS(projectId),
    });
  }, [queryClient, projectId]);

  const handleEvent = useCallback(
    (event: BoardEvent) => {
      switch (event.type) {
        case "task:created":
        case "task:deleted":
        case "task:moved":
        case "task:updated":
        case "task:status_changed":
        case "board:created":
        case "board:updated":
        case "board:deleted":
        case "board:reordered":
          invalidateBoard();
          break;
        default:
          break;
      }
    },
    [invalidateBoard],
  );

  useEffect(() => {
    if (!projectId) return;
    unmountedRef.current = false;

    const url = `/api/ws/board?project_id=${encodeURIComponent(projectId)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      if (unmountedRef.current) {
        es.close();
        return;
      }
      setIsConnected(true);
    };

    es.onerror = () => {
      // EventSource will auto-reconnect; reflect disconnected state while retrying.
      setIsConnected(false);
    };

    es.onmessage = (ev: MessageEvent<string>) => {
      try {
        const raw = JSON.parse(ev.data) as { type: string };
        handleEvent(raw as BoardEvent);
      } catch {
        // Malformed message — ignore
      }
    };

    return () => {
      unmountedRef.current = true;
      es.close();
      esRef.current = null;
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return { isConnected };
}
