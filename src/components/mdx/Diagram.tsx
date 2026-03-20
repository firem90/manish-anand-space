"use client";

import { useEffect, useState, useRef } from "react";

// Patch Worker at the module level so it intercepts before any Excalidraw
// chunks are evaluated. Turbopack sometimes resolves the font subsetting
// worker to a file:// URL, causing an uncatchable SecurityError.
if (typeof window !== "undefined") {
  const OriginalWorker = window.Worker;
  window.Worker = class PatchedWorker extends OriginalWorker {
    constructor(url: string | URL, opts?: WorkerOptions) {
      if (url.toString().startsWith("file://")) {
        // Provide a no-op blob worker to suppress the SecurityError
        const blob = new Blob(["self.onmessage = () => {};"], {
          type: "text/javascript",
        });
        super(URL.createObjectURL(blob), opts);
      } else {
        try {
          super(url, opts);
        } catch {
          const blob = new Blob(["self.onmessage = () => {};"], {
            type: "text/javascript",
          });
          super(URL.createObjectURL(blob), opts);
        }
      }
    }
  } as typeof Worker;
}

export function Diagram({ file, caption }: { file: string; caption?: string }) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        // 1. Fetch the excalidraw JSON
        const res = await fetch(`/api/diagrams/${encodeURIComponent(file)}`);
        if (!res.ok) throw new Error("Diagram not found");
        const data = await res.json();

        if (cancelled) return;

        // 2. Dynamically import excalidraw's exportToSvg
        const { exportToSvg } = await import("@excalidraw/excalidraw");

        if (cancelled) return;

        // 3. Export to SVG (static, no interactive canvas)
        const svg = await exportToSvg({
          elements: data.elements || [],
          appState: {
            ...(data.appState || {}),
            exportWithDarkMode: true,
            exportBackground: true,
            viewBackgroundColor:
              data.appState?.viewBackgroundColor || "#111111",
          },
          files: data.files || {},
        });

        if (cancelled) return;

        // 4. Make the SVG responsive
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        svg.setAttribute("width", "100%");
        svg.style.maxWidth = "100%";
        svg.style.height = "auto";

        setSvgHtml(svg.outerHTML);
        setLoading(false);
      } catch (err) {
        console.error("Diagram render error:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    renderDiagram();
    return () => {
      cancelled = true;
    };
  }, [file]);

  if (error) {
    return (
      <div className="my-8 border border-muted/20 bg-muted/5 p-8 flex items-center justify-center rounded text-muted font-mono text-sm">
        [Diagram &quot;{file}&quot; not found]
      </div>
    );
  }

  return (
    <figure className="my-10 flex flex-col items-center">
      <div className="w-full border border-muted/20 rounded relative overflow-hidden bg-[#111111]">
        {loading ? (
          <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center font-mono text-sm text-muted animate-pulse">
            Loading diagram...
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full p-4"
            dangerouslySetInnerHTML={{ __html: svgHtml || "" }}
          />
        )}
      </div>
      {caption && (
        <figcaption className="mt-4 text-center text-sm text-muted font-mono max-w-[80%]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
