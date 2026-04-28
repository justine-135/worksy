"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session.store";

export default function SessionHydrator({
  userId,
  projectId,
}: {
  userId: string;
  projectId?: string | null;
}) {
  const setUserId = useSessionStore((s) => s.setUserId);
  const setProjectId = useSessionStore((s) => s.setProjectId);

  useEffect(() => {
    if (userId) setUserId(userId);
    if (projectId) setProjectId(projectId);
  }, [userId, setUserId, projectId, setProjectId]);

  return null;
}
