"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";

export default function TilAdminPage() {
  const [tils, setTils] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingTil, setEditingTil] = useState<any | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployCountdown, setDeployCountdown] = useState(60);

  const fetchTils = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/til");
      const data = await res.json();
      setTils(data.tils || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTils();
  }, []);

  const handleDelete = async (title: string, date: string) => {
    if (!confirm(`Are you sure you want to remove TIL from ${date}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/til?title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      fetchTils();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Parse tags correctly by splitting on comma
    const tagsString = formData.get("tags")?.toString() || "";
    const tags = tagsString.split(",").map(t => t.trim()).filter(Boolean);

    const tilData = {
      originalTitle: editingTil?.isNew ? null : editingTil?.title,
      originalDate: editingTil?.isNew ? null : editingTil?.date,
      title: formData.get("title"),
      date: formData.get("date"),
      content: formData.get("content"),
      tags,
      draft: formData.get("draft") === "on",
    };

    try {
      const res = await fetch("/api/admin/til", {
        method: editingTil?.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tilData),
      });
      
      if (res.ok) {
        setEditingTil(null);
        if (window.location.hostname !== "localhost") {
            setIsDeploying(true);
            setDeployCountdown(60);
            const interval = setInterval(() => {
                setDeployCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setIsDeploying(false);
                        fetchTils();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            fetchTils();
        }
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Failed to save TIL");
    }
  };

  const startEdit = (til: any) => {
    setEditingTil(til);
  };

  if (editingTil) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editingTil.isNew ? "Add TIL Note" : "Edit TIL Note"}</h1>
          <button 
            onClick={() => setEditingTil(null)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>

        <div className="flex flex-col gap-8 items-start">
          <form onSubmit={handleSave} className="flex-1 w-full flex flex-col gap-6 bg-background border border-muted/20 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="title" className="text-sm font-mono text-muted">Title (required)</label>
                <input id="title" name="title" defaultValue={editingTil.title} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-bold" placeholder="Caffeine uses Window TinyLFU..." />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="date" className="text-sm font-mono text-muted">Date (YYYY-MM-DD)</label>
                <input id="date" name="date" type="date" defaultValue={editingTil.date || new Date().toISOString().split('T')[0]} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm [color-scheme:dark]" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="tags" className="text-sm font-mono text-muted">Tags (comma separated)</label>
                <input id="tags" name="tags" defaultValue={editingTil.tags?.join(", ")} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" placeholder="java, distributed-systems" />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="content" className="text-sm font-mono text-muted">Content note</label>
                <textarea 
                  id="content" 
                  name="content" 
                  defaultValue={editingTil.content} 
                  required 
                  rows={6}
                  className="bg-transparent border border-muted/30 focus:border-accent p-3 rounded-sm outline-none font-serif text-sm resize-y" 
                  placeholder="Drop a quick note about what you learned..." 
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input type="checkbox" name="draft" defaultChecked={editingTil.draft} className="w-4 h-4 accent-accent" />
                  <span className="font-mono text-sm font-bold">Archive / Hide from public view</span>
                </label>
              </div>
            </div>

            <button type="submit" className="bg-accent text-white font-bold py-2.5 rounded-sm hover:brightness-110 flex items-center justify-center gap-2 mt-4">
              <Check size={18} /> Save Note
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Today I Learned</h1>
            <p className="text-sm text-muted font-mono">
              Manage short notes and learnings.
            </p>
          </div>
          <button 
            onClick={() => setEditingTil({ isNew: true })}
            className="flex items-center gap-2 bg-accent text-white font-bold px-4 py-2.5 rounded-sm hover:brightness-110 transition-all text-sm whitespace-nowrap"
          >
            <Plus size={18} /> Add Note
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted font-mono animate-pulse">Loading notes...</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {tils.map((til: any, idx: number) => (
              <div key={`${til.title}-${idx}`} className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border border-muted/20 rounded-md bg-background/50 hover:bg-background transition-colors group">
                
                <div className="flex flex-col min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <time className="text-xs font-mono text-accent shrink-0">{til.date}</time>
                    <h3 className="font-bold text-base flex items-center gap-2">
                      {til.title}
                      {til.draft && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Archived</span>}
                    </h3>
                  </div>
                  <p className="text-sm font-serif text-foreground/80 my-2 line-clamp-2">{til.content}</p>
                  {til.tags && til.tags.length > 0 && (
                     <div className="flex flex-wrap gap-2 mt-1">
                       {til.tags.map((tag: string) => (
                         <span key={tag} className="text-[10px] font-mono bg-muted/10 px-2 py-0.5 rounded-sm text-muted">
                           {tag}
                         </span>
                       ))}
                     </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(til)}
                    className="p-2 text-muted hover:text-accent bg-muted/10 rounded-sm transition-colors"
                    aria-label="Edit note"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(til.title, til.date)}
                    className="p-2 text-muted hover:text-red-400 bg-muted/10 rounded-sm transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {tils.length === 0 && <p className="text-muted font-mono">No TIL notes found.</p>}
          </div>
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
