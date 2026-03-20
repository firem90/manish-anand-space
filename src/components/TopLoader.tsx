"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(20);
  }, []);

  useEffect(() => {
    // When pathname/searchParams change, the new page has loaded
    setLoading(false);
    setProgress(100);

    const timeout = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!loading) return;

    // Simulate progress ticking up slowly
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [loading]);

  // Intercept link clicks to start the loader
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;

      // Internal navigation — start loader
      if (href !== pathname) {
        startLoading();
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, startLoading]);

  if (progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
    >
      <div
        className="h-full bg-accent transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: loading ? 1 : 0,
          transition: loading
            ? "width 400ms ease-out"
            : "width 200ms ease-out, opacity 300ms ease-out 100ms",
        }}
      />
    </div>
  );
}
