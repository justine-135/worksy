"use client";

import { toast } from "@heroui/react";
import { signOut } from "next-auth/react";
import { useEffect, useRef } from "react";

const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

export function useIdleTimeout(timeoutMs = 2 * 60 * 60 * 1000) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        toast.danger("Your session has expired due to inactivity.");
        setTimeout(() => signOut({ callbackUrl: "/sign-in" }), 2000);
      }, timeoutMs);
    };

    reset();
    IDLE_EVENTS.forEach((e) =>
      window.addEventListener(e, reset, { passive: true }),
    );

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [timeoutMs]);
}
