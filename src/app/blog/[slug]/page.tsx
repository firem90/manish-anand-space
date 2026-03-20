import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import { MdxRenderer } from "@/components/mdx/MdxRenderer";
import { ViewCounter } from "@/components/ViewCounter";
import { ProgressBar } from "@/components/ProgressBar";
import Link from "next/link";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <ProgressBar />
      <article>
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-mono text-muted hover:text-accent transition-colors mb-8"
        >
          ← Back to blog
        </Link>
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm font-mono text-muted mb-6">
            <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span className="hidden sm:inline">·</span>
            <span>{post.readTime} min read</span>
            <span className="hidden sm:inline">·</span>
            <ViewCounter slug={post.slug} />
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
               <span key={tag} className="text-xs font-mono bg-muted/10 px-2 py-1 rounded-sm text-muted">
                 #{tag}
               </span>
            ))}
          </div>
        </header>

        <main className="text-lg">
          <MdxRenderer source={post.content} />
        </main>
      </article>
    </>
  );
}
