"use client";

import { useState } from "react";

export function PapersClient({ papers }: { papers: any[] }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tags = Array.from(new Set(papers.flatMap((p: any) => p.tags)));
  
  const filteredPapers = activeTag 
    ? papers.filter((p: any) => p.tags.includes(activeTag))
    : papers;

  return (
    <div className="flex flex-col gap-8">
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
        {tags.map(tag => (
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

      <div className="flex flex-col gap-6">
        {filteredPapers.map((paper: any, idx: number) => (
          <article 
            key={idx} 
            className="flex flex-col gap-3 p-5 md:p-6 border border-muted/20 rounded-sm hover:border-accent/40 transition-colors group bg-background/50"
          >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold group-hover:text-accent transition-colors">
                <a href={paper.url} target="_blank" rel="noopener noreferrer">
                  {paper.title} ↗
                </a>
              </h2>
              <span className="font-mono text-sm text-muted shrink-0">
                {paper.year}
              </span>
            </div>
            
            <p className="font-mono text-sm text-muted">
              {paper.authors}
            </p>
            
            <p className="font-serif text-foreground/90 mt-2 italic">
              &quot;{paper.why}&quot;
            </p>
            
            <div className="flex flex-wrap gap-2 mt-4">
              {paper.tags.map((tag: string) => (
                <span key={tag} className="text-xs font-mono bg-muted/10 text-muted px-2 py-1 rounded-sm">
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        ))}
        {filteredPapers.length === 0 && (
          <p className="text-muted font-mono">No papers found.</p>
        )}
      </div>
    </div>
  );
}
