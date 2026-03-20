import { getAllPosts } from "@/lib/blog";
import { BlogListClient } from "@/components/BlogListClient";

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Blog</h1>
        <p className="text-muted font-mono">
          Longer form writing on engineering and architecture.
        </p>
      </header>
      
      <BlogListClient posts={posts} />
    </div>
  );
}
