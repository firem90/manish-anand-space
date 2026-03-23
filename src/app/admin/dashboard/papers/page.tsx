"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function PaperAdminPage() {
  const [papers, setPapers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPaper, setEditingPaper] = useState<any | null>(null);

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/papers");
      const data = await res.json();
      setPapers(data.papers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete "${slug}"?`)) return;
    
    try {
      const res = await fetch(`/api/admin/papers?slug=${slug}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      fetchPapers();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const paperData = {
      slug: formData.get("slug"),
      originalSlug: editingPaper?.isNew ? null : editingPaper?.slug,
      title: formData.get("title"),
      authors: formData.get("authors"),
      year: parseInt(formData.get("year") as string),
      paperUrl: formData.get("paperUrl"),
      date: formData.get("date"),
      tags: (formData.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
      summary: formData.get("summary"),
      content: formData.get("content"),
    };

    try {
      const res = await fetch("/api/admin/papers", {
        method: editingPaper?.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperData),
      });
      
      if (res.ok) {
        setEditingPaper(null);
        fetchPapers();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Failed to save paper");
    }
  };

  if (editingPaper) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editingPaper.isNew ? "New Paper Insight" : "Edit Paper Insight"}</h1>
          <button 
            onClick={() => setEditingPaper(null)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 bg-background border border-muted/20 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-mono text-muted">Title</label>
              <input id="title" name="title" defaultValue={editingPaper.title} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="slug" className="text-sm font-mono text-muted">Slug (URL)</label>
              <input id="slug" name="slug" defaultValue={editingPaper.slug} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="authors" className="text-sm font-mono text-muted">Authors</label>
              <input id="authors" name="authors" defaultValue={editingPaper.authors} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="year" className="text-sm font-mono text-muted">Publish Year</label>
              <input id="year" name="year" type="number" defaultValue={editingPaper.year || new Date().getFullYear()} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="paperUrl" className="text-sm font-mono text-muted">Original Paper URL (PDF usually)</label>
              <input id="paperUrl" name="paperUrl" type="url" defaultValue={editingPaper.paperUrl} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" placeholder="https://..." />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="date" className="text-sm font-mono text-muted">Insight Date (YYYY-MM-DD)</label>
              <input id="date" name="date" type="date" defaultValue={editingPaper.date || new Date().toISOString().split('T')[0]} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label htmlFor="tags" className="text-sm font-mono text-muted">Tags (comma separated)</label>
              <input id="tags" name="tags" defaultValue={editingPaper.tags?.join(", ")} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" placeholder="distributed-systems, consensus" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="summary" className="text-sm font-mono text-muted">Short Summary / TLDR</label>
            <textarea id="summary" name="summary" defaultValue={editingPaper.summary} required rows={2} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none resize-y" />
          </div>

          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="content" className="text-sm font-mono text-muted">Your Insights (Markdown)</label>
            <textarea id="content" name="content" defaultValue={editingPaper.content} required rows={15} className="bg-transparent border border-muted/30 focus:border-accent p-3 rounded-sm outline-none font-mono text-sm resize-y" placeholder="Write your insights here in Markdown..." />
          </div>

          <button type="submit" className="bg-accent text-white font-bold py-2.5 rounded-sm hover:brightness-110 flex items-center justify-center gap-2">
            <Check size={18} /> Save Paper Insight
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paper Rack</h1>
        <button 
          onClick={() => setEditingPaper({ isNew: true, tags: [] })}
          className="flex items-center gap-2 bg-accent/10 text-accent hover:bg-accent hover:text-white px-4 py-2 rounded-sm transition-colors text-sm font-mono font-bold"
        >
          <Plus size={16} /> Add Paper
        </button>
      </div>

      {loading ? (
        <div className="text-muted font-mono animate-pulse">Loading papers...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {papers.map((paper) => (
            <div key={paper.slug} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-muted/20 rounded-md bg-background/50 hover:bg-background transition-colors group">
              <div className="flex flex-col">
                <h3 className="font-bold">{paper.title}</h3>
                <div className="flex items-center gap-3 text-xs font-mono text-muted mt-1">
                  <span>{paper.year}</span>
                  <span>/</span>
                  <span className="truncate max-w-[200px]">{paper.authors}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                <a 
                  href={paper.paperUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-foreground bg-muted/10 rounded-sm transition-colors text-xs font-mono"
                >
                  PDF ↗
                </a>
                <button 
                  onClick={() => setEditingPaper(paper)}
                  className="p-2 text-muted hover:text-accent bg-muted/10 rounded-sm transition-colors"
                  aria-label="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(paper.slug)}
                  className="p-2 text-muted hover:text-red-400 bg-muted/10 rounded-sm transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {papers.length === 0 && <p className="text-muted font-mono">No papers found.</p>}
        </div>
      )}
    </div>
  );
}
