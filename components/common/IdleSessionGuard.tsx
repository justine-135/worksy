"use client";

import { useIdleTimeout } from "@/hooks/common/useIdleTimeout";

export default function IdleSessionGuard() {
  useIdleTimeout();
  return null;
}
