// SessionHydrator.tsx
"use client";

import { useEffect } from "react";
import { useSessionStore } from "@/store/session.store";

export default function SessionHydrator({
  userId,
}: {
  userId?: string | null;
}) {
  const setUserId = useSessionStore((s) => s.setUserId);

  useEffect(() => {
    if (userId) setUserId(userId);
  }, [userId, setUserId]);

  return null;
}
