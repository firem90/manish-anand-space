"use client";

import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-12 max-w-[600px] w-full mx-auto pb-20">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Contact</h1>
        <p className="text-muted font-mono">
          If you've read something here that you want to talk about, I'm reachable.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 font-sans">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-sm text-foreground">Name</span>
          <input
            type="text"
            name="name"
            required
            disabled={status === "loading" || status === "success"}
            className="w-full bg-background border border-muted/30 focus:border-accent p-3 rounded-sm text-foreground outline-none transition-colors disabled:opacity-50 min-h-[44px]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-sm text-foreground">Email</span>
          <input
            type="email"
            name="email"
            required
            disabled={status === "loading" || status === "success"}
            className="w-full bg-background border border-muted/30 focus:border-accent p-3 rounded-sm text-foreground outline-none transition-colors disabled:opacity-50 min-h-[44px]"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-mono text-sm text-foreground">Message</span>
          <textarea
            name="message"
            required
            rows={5}
            disabled={status === "loading" || status === "success"}
            className="w-full bg-background border border-muted/30 focus:border-accent p-3 rounded-sm text-foreground outline-none transition-colors disabled:opacity-50 min-h-[44px]"
          />
        </label>

        <button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-foreground text-background font-mono font-bold py-4 rounded-sm hover:bg-accent hover:text-white transition-colors disabled:opacity-50 mt-4 min-h-[44px]"
        >
          {status === "loading" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {/* Inline Toast Notifications */}
      {status === "success" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-4 md:bottom-4 bg-green-500/10 border border-green-500 text-green-500 font-mono text-sm px-6 py-4 rounded-sm w-[90vw] md:w-auto text-center md:text-left z-50">
          Sent. I'll get back to you.
        </div>
      )}

      {status === "error" && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-4 md:bottom-4 bg-red-500/10 border border-red-500 text-red-500 font-mono text-sm px-6 py-4 rounded-sm w-[90vw] md:w-auto text-center md:text-left z-50">
          Something broke. Email me directly at manish.anandaeswaran@gmail.com
        </div>
      )}
    </div>
  );
}
