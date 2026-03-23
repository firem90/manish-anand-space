"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function BlogAdminPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [stats, setStats] = useState<{ totalViews: number; breakdown: any[] } | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployCountdown, setDeployCountdown] = useState(60);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStats();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;
    
    try {
      const res = await fetch(`/api/admin/posts?slug=${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      fetchPosts();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const postData = {
      slug: formData.get("slug"),
      originalSlug: editingPost?.isNew ? null : editingPost?.slug,
      title: formData.get("title"),
      date: formData.get("date"),
      tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
      summary: formData.get("summary"),
      content: formData.get("content"),
      draft: formData.get("draft") === "on",
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: editingPost?.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      
      if (res.ok) {
        setEditingPost(null);
        if (window.location.hostname !== "localhost") {
            setIsDeploying(true);
            setDeployCountdown(60);
            const interval = setInterval(() => {
                setDeployCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsDeploying(false);
                        fetchPosts();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            fetchPosts();
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Failed to save post");
    }
  };

  if (editingPost) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editingPost.isNew ? "New Post" : "Edit Post"}</h1>
          <button 
            onClick={() => setEditingPost(null)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 bg-background border border-muted/20 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-mono text-muted">Title</label>
              <input id="title" name="title" defaultValue={editingPost.title} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-sm font-mono text-muted">Slug (URL)</label>
              <input id="slug" name="slug" defaultValue={editingPost.slug} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm font-mono text-muted">Date (YYYY-MM-DD)</label>
              <input id="date" name="date" type="date" defaultValue={editingPost.date || new Date().toISOString().split('T')[0]} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tags" className="text-sm font-mono text-muted">Tags (comma separated)</label>
              <input id="tags" name="tags" defaultValue={editingPost.tags?.join(", ")} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" placeholder="tech, systems, random" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="summary" className="text-sm font-mono text-muted">Summary (for cards)</label>
            <textarea id="summary" name="summary" defaultValue={editingPost.summary} required rows={2} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none resize-y" />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="content" className="text-sm font-mono text-muted">Markdown Content</label>
            <textarea id="content" name="content" defaultValue={editingPost.content} required rows={15} className="bg-transparent border border-muted/30 focus:border-accent p-3 rounded-sm outline-none font-mono text-sm resize-y" placeholder="Write your post here in Markdown..." />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" name="draft" defaultChecked={editingPost.draft} className="w-4 h-4 accent-accent" />
            <span className="font-mono text-sm font-bold">Archive / Hide from public view</span>
          </label>

          <button type="submit" className="bg-accent text-white font-bold py-2.5 rounded-sm hover:brightness-110 flex items-center justify-center gap-2">
            <Check size={18} /> Save Post
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <button 
          onClick={() => setEditingPost({ isNew: true, tags: [] })}
          className="flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent hover:text-white px-4 py-2 rounded-sm transition-colors text-sm font-mono font-bold"
        >
          <Plus size={16} /> New Post
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2 animate-in fade-in">
          <div className="bg-muted/10 border border-muted/20 p-5 rounded-lg flex flex-col justify-center gap-1">
            <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold">Total Site Views</span>
            <span className="text-3xl font-bold font-mono text-accent">{new Intl.NumberFormat().format(stats.totalViews)}</span>
          </div>
          {stats.breakdown.slice(0, 2).map((b, i) => (
            <div key={b.slug} className="bg-background border border-muted/20 p-5 rounded-lg flex flex-col justify-between gap-3 max-w-full min-w-0 shadow-sm">
              <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold truncate block w-full" title={b.slug}>Top Post #{i+1}: {b.slug}</span>
              <span className="text-2xl font-bold font-mono text-foreground">{new Intl.NumberFormat().format(b.views)}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-muted font-mono animate-pulse">Loading posts...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div key={post.slug} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-muted/20 rounded-md bg-background/50 hover:bg-background transition-colors group">
              <div className="flex flex-col">
                <h3 className="font-bold flex items-center gap-2">
                  {post.title}
                  {post.draft && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Archived</span>}
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-muted mt-1">
                  <span>{post.date}</span>
                  <span>/{post.slug}.mdx</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingPost(post)}
                  className="p-2 text-muted hover:text-accent bg-muted/10 rounded-sm transition-colors"
                  aria-label="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(post.slug)}
                  className="p-2 text-muted hover:text-red-400 bg-muted/10 rounded-sm transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-muted font-mono">No posts found.</p>}
        </div>
      )}

      {isDeploying && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-background border border-accent/20 rounded-xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-4 animate-in zoom-in-95">
             <div className="w-12 h-12 border-4 border-accent/30 border-t-accent rounded-full animate-spin"></div>
             <h2 className="text-xl font-bold">Deploying to Vercel...</h2>
             <p className="text-sm font-mono text-muted">Please wait while the site rebuilds. Data will refresh instantly when complete (~{deployCountdown}s).</p>
           </div>
        </div>
      )}
    </div>
  );
}
