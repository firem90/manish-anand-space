import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <h1 className="text-6xl md:text-8xl font-mono font-bold text-accent">
        404
      </h1>
      <p className="text-lg md:text-xl text-muted font-mono">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="mt-4 font-mono text-sm text-foreground border border-muted/30 px-6 py-3 rounded-sm hover:border-accent hover:text-accent transition-colors"
      >
        ← Back to home
      </Link>
    </div>
  );
}
