"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "@heroui/react/toast";

export function ProjectToast() {
  const searchParams = useSearchParams();

  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const toastKey = searchParams.get("toast");
    const msg = searchParams.get("msg");

    if (!toastKey) return;

    handled.current = true;

    if (toastKey === "1" && msg) {
      toast.danger("Project not found");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
