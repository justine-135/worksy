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
  const fetchPermissions = useSessionStore((s) => s.fetchPermissions);

  useEffect(() => {
    if (userId) setUserId(userId);
    if (projectId) {
      setProjectId(projectId);
      fetchPermissions(projectId, userId);
    }
  }, [userId, setUserId, projectId, setProjectId, fetchPermissions]);

  return null;
}
