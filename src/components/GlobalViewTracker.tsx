"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function GlobalViewTracker() {
  const pathname = usePathname();
  const trackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname?.startsWith("/admin") && pathname !== trackedPathRef.current) {
      trackedPathRef.current = pathname;
      fetch("/api/views/global", { method: "POST" }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
