import { getPaperBySlug, getAllPapers } from "@/lib/papers";
import { notFound } from "next/navigation";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { ProgressBar } from "@/components/ProgressBar";
import Link from "next/link";

export async function generateStaticParams() {
  const papers = getAllPapers();
  return papers.map((paper) => ({
    slug: paper.slug,
  }));
}

export default async function PaperPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const paper = getPaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  return (
    <>
      <ProgressBar />
      <article>
        <Link
          href="/papers"
          className="inline-flex items-center gap-1 text-sm font-mono text-muted hover:text-accent transition-colors mb-8"
        >
          ← Back to paper rack
        </Link>
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {paper.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-mono text-muted mb-6">
            <span>{paper.authors} ({paper.year})</span>
            <span className="hidden sm:inline">·</span>
            <span>{paper.readTime} min read</span>
            <span className="hidden sm:inline">·</span>
            <a
              href={paper.paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline underline-offset-4"
            >
              Read paper ↗
            </a>
          </div>
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag) => (
              <span key={tag} className="text-xs font-mono bg-muted/10 px-2 py-1 rounded-sm text-muted">
                #{tag}
              </span>
            ))}
          </div>
        </header>

        <main className="text-lg">
          <MdxRenderer source={paper.content} />
        </main>
      </article>
    </>
  );
}
