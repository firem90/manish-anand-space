"use client";

import { useState, useMemo } from "react";

type SortOption = "latest" | "oldest";

export function TilList({ entries }: { entries: any[] }) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filtered = entries.filter((entry) => 
    entry.title.toLowerCase().includes(search.toLowerCase()) || 
    entry.content.toLowerCase().includes(search.toLowerCase()) ||
    (entry.tags && entry.tags.some((t: string) => t.toLowerCase().includes(search.toLowerCase())))
  );

  const sorted = useMemo(() => {
    const result = [...filtered];
    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return result;
  }, [filtered, sortBy]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof entries> = {};
    sorted.forEach((entry) => {
      const date = new Date(entry.date);
      const monthYear = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(entry);
    });
    return groups;
  }, [sorted]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-background border border-muted/30 focus:border-accent p-3 rounded-sm text-foreground font-mono placeholder:text-muted/50 outline-none transition-colors"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="font-mono text-xs bg-background border border-muted/30 text-muted px-3 py-1.5 rounded-sm outline-none focus:border-accent transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="flex flex-col gap-12">
        {Object.entries(grouped).map(([month, monthEntries]) => (
          <div key={month} className="flex flex-col gap-6">
            <h2 className="sticky top-0 bg-background/90 backdrop-blur py-2 text-lg font-mono text-muted border-b border-muted/10">
              {month}
            </h2>
            <div className="flex flex-col gap-8">
              {monthEntries.map((entry: any, i: number) => (
                <article key={i} className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-3">
                    <time className="text-sm font-mono text-muted shrink-0 w-24">
                      {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                    </time>
                    <h3 className="font-bold text-lg">{entry.title}</h3>
                  </div>
                  <div className="pl-0 sm:pl-[6.75rem]">
                    <p className="text-foreground/90 font-serif leading-relaxed mb-3">
                      {entry.content}
                    </p>
                    {entry.tags && (
                      <div className="flex gap-2">
                        {entry.tags.map((tag: string) => (
                          <span key={tag} className="text-xs font-mono text-muted bg-muted/10 px-1.5 py-0.5 rounded-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="text-muted font-mono">No notes found for &quot;{search}&quot;</p>
        )}
      </div>
    </div>
  );
}
