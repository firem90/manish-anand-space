"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

type SortOption = "latest" | "oldest" | "title";

export function BlogListClient({ posts }: { posts: any[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  
  const allTags = Array.from(new Set(posts.flatMap((p: any) => p.tags)));
  
  const filteredAndSorted = useMemo(() => {
    let result = activeTag 
      ? posts.filter((p: any) => p.tags.includes(activeTag))
      : [...posts];

    switch (sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case "title":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return result;
  }, [posts, activeTag, sortBy]);

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
          {allTags.map(tag => (
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
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">A → Z</option>
        </select>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAndSorted.map((post: any) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col border border-muted/20 rounded-lg p-5 hover:border-accent/40 transition-all duration-200 hover:shadow-[0_0_20px_rgba(229,136,62,0.06)]"
            style={{ backgroundColor: 'var(--background)' }}
          >
            <h3 className="font-bold text-base md:text-lg leading-snug line-clamp-2 group-hover:text-accent transition-colors mb-3">
              {post.title}
            </h3>
            
            {post.summary && (
              <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4 flex-1">
                {post.summary}
              </p>
            )}

            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-[10px] font-mono text-muted bg-muted/10 px-1.5 py-0.5 rounded-sm">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-muted mt-auto pt-3 border-t border-muted/10">
              <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
              <span>·</span>
              <span>{post.readTime} min read</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
