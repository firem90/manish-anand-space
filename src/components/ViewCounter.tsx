"use client";

import { useEffect, useState } from "react";

export function ViewCounter({ slug }: { slug: string }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/views/${slug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch((err) => console.error("View count error", err));
  }, [slug]);

  if (views === null) {
    return <span className="text-muted font-mono bg-transparent">--- views</span>;
  }

  return (
    <span className="text-accent font-mono border border-accent/20 px-2 py-1 rounded bg-accent/5 transition-opacity duration-300">
      {new Intl.NumberFormat().format(views)} views
    </span>
  );
}
