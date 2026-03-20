"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      if (documentHeight > 0) {
        const scrolled = window.scrollY;
        setProgress((scrolled / documentHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-accent z-50 transition-all duration-150 ease-out"
      style={{ width: `${progress}%` }}
    />
  );
}
