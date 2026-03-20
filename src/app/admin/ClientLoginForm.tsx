"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLogin({ needsSetup = false }: { needsSetup?: boolean }) {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code: needsSetup ? "000000" : code }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.needsSetup) {
          router.push("/admin/setup");
        } else {
          router.push("/admin/dashboard");
          router.refresh();
        }
      } else {
        if (data.needsSetup) {
          router.push("/admin/setup");
        } else {
          setError(data.error || "Login failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-[400px] mx-auto w-full px-4">
      <Link href="/" className="font-serif font-bold text-2xl tracking-tight hover:text-accent transition-colors mb-12">
        Manish Anand
      </Link>
      
      <div className="w-full bg-background border border-muted/20 p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-mono text-muted">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-transparent border border-muted/30 focus:border-accent p-2.5 rounded-sm text-foreground outline-none transition-colors"
              placeholder="Admin Username"
            />
          </div>
          
          {!needsSetup && (
            <div className="flex flex-col gap-1.5 animate-in fade-in">
              <label htmlFor="code" className="text-sm font-mono text-muted">Authenticator Code (6 digits)</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required={!needsSetup}
                maxLength={6}
                className="bg-transparent border border-muted/30 focus:border-accent p-2.5 rounded-sm text-foreground outline-none transition-colors text-center font-mono tracking-widest text-lg"
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-accent text-white font-bold py-3 rounded-sm hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? "Verifying..." : (needsSetup ? "Start Setup" : "Login via Authenticator")}
          </button>
        </form>
      </div>
    </div>
  );
}
