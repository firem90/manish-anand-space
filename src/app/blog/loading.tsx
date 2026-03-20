export default function BlogListLoading() {
  return (
    <div className="flex flex-col gap-12">
      <header>
        <div className="h-10 w-32 bg-muted/10 rounded animate-pulse mb-4" />
        <div className="h-5 w-80 bg-muted/10 rounded animate-pulse" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border border-muted/20 rounded-lg p-6 flex flex-col gap-3 animate-pulse"
          >
            <div className="h-5 w-3/4 bg-muted/10 rounded" />
            <div className="h-4 w-1/2 bg-muted/10 rounded" />
            <div className="h-3 w-full bg-muted/10 rounded mt-2" />
            <div className="h-3 w-5/6 bg-muted/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
