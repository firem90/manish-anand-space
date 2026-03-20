"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type SortOption = "latest" | "oldest" | "year-desc" | "year-asc";

export function PaperListClient({ papers }: { papers: any[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const allTags = Array.from(new Set(papers.flatMap((p: any) => p.tags)));

  const filteredAndSorted = useMemo(() => {
    let result = activeTag
      ? papers.filter((p: any) => p.tags.includes(activeTag))
      : [...papers];

    switch (sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "year-desc":
        result.sort((a, b) => b.year - a.year);
        break;
      case "year-asc":
        result.sort((a, b) => a.year - b.year);
        break;
    }
    return result;
  }, [papers, activeTag, sortBy]);

  return (
    <div className="flex flex-col gap-8">
      {/* Filters + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`font-mono text-xs px-3 py-1.5 rounded-sm transition-colors ${
              activeTag === null
                ? "bg-accent text-white"
                : "bg-muted/10 text-muted hover:text-foreground"
            }`}
          >
            all
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm transition-colors ${
                activeTag === tag
                  ? "bg-accent text-white"
                  : "bg-muted/10 text-muted hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="font-mono text-xs bg-background border border-muted/30 text-muted px-3 py-1.5 rounded-sm outline-none focus:border-accent transition-colors cursor-pointer shrink-0"
        >
          <option value="latest">Latest insights</option>
          <option value="oldest">Oldest insights</option>
          <option value="year-desc">Paper year ↓</option>
          <option value="year-asc">Paper year ↑</option>
        </select>
      </div>

      {/* List */}
      <div className="flex flex-col gap-8 md:gap-10">
        {filteredAndSorted.map((paper: any) => (
          <article key={paper.slug} className="group flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
              <Link
                href={`/papers/${paper.slug}`}
                className="text-xl font-bold group-hover:text-accent transition-colors"
              >
                {paper.title}
              </Link>
              <div className="flex items-center gap-3 text-sm font-mono text-muted shrink-0 mt-1 sm:mt-0">
                <span>{paper.year}</span>
                <span className="hidden sm:inline">·</span>
                <span>{paper.readTime} min read</span>
              </div>
            </div>
            <p className="font-mono text-sm text-muted">{paper.authors}</p>
            <p className="text-foreground/80 font-serif italic text-sm mt-1">
              &quot;{paper.summary}&quot;
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {paper.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-mono text-muted">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
        {filteredAndSorted.length === 0 && (
          <p className="text-muted font-mono">No papers found.</p>
        )}
      </div>
    </div>
  );
}
