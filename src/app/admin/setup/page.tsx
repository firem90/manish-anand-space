"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminSetup() {
  const [setupData, setSetupData] = useState<{ secret: string; qrUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch QR code on mount
    fetch("/api/admin/setup")
      .then((res) => res.json())
      .then((data) => {
        if (data.alreadyConfigured) {
          router.push("/admin");
        } else {
          setSetupData(data);
        }
      })
      .catch((err) => setError("Failed to initialize setup"));
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData) return;
    
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We pass the secret back just to verify it and save it server-side if correct
        body: JSON.stringify({ secret: setupData.secret, code }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!setupData && !error) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading setup...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] max-w-[500px] mx-auto w-full px-4">
      <div className="w-full bg-background border border-muted/20 p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-2 text-center">Setup Authenticator</h1>
        <p className="text-center text-muted text-sm mb-6">
          Scan this QR code with Microsoft Authenticator (or any TOTP app). This is a one-time setup.
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-sm mb-6 text-center">
            {error}
          </div>
        )}

        {setupData && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-lg">
              <Image 
                src={setupData.qrUrl} 
                alt="Authenticator QR Code" 
                width={200} 
                height={200}
                className="select-none pointer-events-none"
              />
            </div>

            <div className="bg-muted/10 p-3 rounded-sm w-full text-center">
              <span className="text-xs text-muted block mb-1 uppercase font-bold tracking-wider">Manual Entry Code</span>
              <code className="font-mono text-accent">{setupData.secret}</code>
            </div>

            <div className="bg-accent/10 border border-accent/20 p-4 rounded-sm w-full text-sm">
              <strong className="text-accent block mb-1">Deploying to Vercel?</strong>
              <p className="text-muted leading-relaxed font-mono text-xs">
                Copy the code above and save it as <code>ADMIN_TOTP_SECRET</code> in your Vercel Environment Variables. The local file fallback won't persist across serverless deployments.
              </p>
            </div>

            <form onSubmit={handleVerify} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="code" className="text-sm font-mono text-muted text-center">Enter the 6-digit code from the app</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                  className="bg-transparent border border-muted/30 focus:border-accent p-2.5 rounded-sm text-foreground outline-none transition-colors text-center font-mono tracking-widest text-xl"
                  placeholder="000000"
                />
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-2 bg-accent text-white font-bold py-3 rounded-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify and Save"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
