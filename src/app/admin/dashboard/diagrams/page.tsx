"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Copy, Check, FileJson } from "lucide-react";

export default function DiagramsAdminPage() {
  const [diagrams, setDiagrams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchDiagrams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/diagrams");
      const data = await res.json();
      setDiagrams(data.diagrams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagrams();
  }, []);

  const handleUpload = async (file: File, name: string) => {
    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    try {
      const res = await fetch("/api/admin/diagrams", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Uploaded "${name}"! Use in posts: ${data.usage}`,
        });
        setSelectedFile(null);
        setCustomName("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchDiagrams();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Upload failed — network error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Delete diagram "${name}"?`)) return;

    try {
      await fetch(`/api/admin/diagrams?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      fetchDiagrams();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const copyUsage = (name: string, index: number) => {
    const usage = `<Diagram file="${name}" caption="Your caption here" />`;
    navigator.clipboard.writeText(usage);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Auto-fill name from filename (strip extension)
    const baseName = file.name.replace(/\.excalidraw$/, "").replace(/\.json$/, "");
    setCustomName(baseName);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Diagrams</h1>
        <p className="text-sm text-muted font-mono">
          Upload Excalidraw files to embed in blog posts via{" "}
          <code className="bg-muted/10 px-1.5 py-0.5 rounded text-accent">
            {"<Diagram file=\"name\" />"}
          </code>
        </p>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-accent bg-accent/5"
            : "border-muted/30 hover:border-muted/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {!selectedFile ? (
          <>
            <FileJson size={40} className="mx-auto mb-4 text-muted" />
            <p className="text-muted mb-4 font-mono text-sm">
              Drag & drop an <span className="text-foreground">.excalidraw</span> file here, or
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-accent/10 text-accent hover:bg-accent hover:text-white px-6 py-2.5 rounded-sm transition-colors text-sm font-mono font-bold"
            >
              Browse Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".excalidraw,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </>
        ) : (
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-sm font-mono">
              <FileJson size={20} className="text-accent shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-muted">
                ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-mono text-muted">
                Diagram Name (used in {`<Diagram file="..." />`})
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="bg-transparent border border-muted/30 focus:border-accent p-2.5 rounded-sm outline-none font-mono text-sm"
                placeholder="e.g. logger-system"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleUpload(selectedFile, customName)}
                disabled={uploading || !customName.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-accent text-white font-bold py-2.5 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 text-sm"
              >
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload Diagram"}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setCustomName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-4 py-2.5 text-sm text-muted hover:text-foreground border border-muted/30 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status message */}
      {message && (
        <div
          className={`text-sm p-4 rounded-sm font-mono ${
            message.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Diagrams list */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          Uploaded Diagrams{" "}
          <span className="text-muted font-normal text-sm">({diagrams.length})</span>
        </h2>

        {loading ? (
          <div className="text-muted font-mono animate-pulse">Loading diagrams...</div>
        ) : diagrams.length === 0 ? (
          <p className="text-muted font-mono text-sm">No diagrams uploaded yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {diagrams.map((name, i) => (
              <div
                key={name}
                className="flex items-center justify-between p-4 border border-muted/20 rounded-md bg-background/50 hover:bg-background transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileJson size={18} className="text-accent shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-mono font-bold text-sm truncate">
                      {name}
                    </span>
                    <span className="text-xs text-muted font-mono truncate">
                      {`<Diagram file="${name}" />`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyUsage(name, i)}
                    className="p-2 text-muted hover:text-accent bg-muted/10 rounded-sm transition-colors"
                    title="Copy usage snippet"
                  >
                    {copiedIndex === i ? (
                      <Check size={16} className="text-green-400" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(name)}
                    className="p-2 text-muted hover:text-red-400 bg-muted/10 rounded-sm transition-colors"
                    title="Delete diagram"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
