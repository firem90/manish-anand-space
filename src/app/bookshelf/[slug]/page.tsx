import { notFound } from "next/navigation";
import Link from "next/link";

// Add your book notes here. The key is the notesSlug from books.json.
const NOTES: Record<string, { title: string; author: string; content: string }> = {
  "ddia-notes": {
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    content: "Notes coming soon...",
  },
  "release-it-notes": {
    title: "Release It!",
    author: "Michael Nygard",
    content: "Notes coming soon...",
  },
};

export default async function BookNotes({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const note = NOTES[slug];

  if (!note) {
    notFound();
  }

  return (
    <article className="max-w-[65ch] mx-auto w-full">
      <Link
        href="/bookshelf"
        className="inline-flex items-center gap-1 text-sm font-mono text-muted hover:text-accent transition-colors mb-8"
      >
        ← Back to bookshelf
      </Link>
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          {note.title}
        </h1>
        <p className="font-mono text-sm text-muted">Notes on {note.author}&apos;s book</p>
      </header>

      <main className="text-lg text-foreground/90 leading-relaxed">
        <p>{note.content}</p>
      </main>
    </article>
  );
}
