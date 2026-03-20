export default function BlogPostLoading() {
  return (
    <article className="max-w-[65ch] mx-auto w-full animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-muted/10 rounded mb-8" />

      {/* Title */}
      <header className="mb-12">
        <div className="h-10 w-full bg-muted/10 rounded mb-3" />
        <div className="h-10 w-3/4 bg-muted/10 rounded mb-6" />

        {/* Meta row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-4 w-32 bg-muted/10 rounded" />
          <div className="h-4 w-20 bg-muted/10 rounded" />
          <div className="h-4 w-24 bg-muted/10 rounded" />
        </div>

        {/* Tags */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-muted/10 rounded-sm" />
          <div className="h-6 w-20 bg-muted/10 rounded-sm" />
          <div className="h-6 w-14 bg-muted/10 rounded-sm" />
        </div>
      </header>

      {/* Content skeleton */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-muted/10 rounded"
            style={{ width: `${65 + Math.sin(i) * 25}%` }}
          />
        ))}
        <div className="h-4 bg-transparent my-2" /> {/* paragraph break */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`p2-${i}`}
            className="h-4 bg-muted/10 rounded"
            style={{ width: `${70 + Math.cos(i) * 20}%` }}
          />
        ))}
      </div>
    </article>
  );
}
