"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "TIL", href: "/til" },
  { name: "Bookshelf", href: "/bookshelf" },
  { name: "Paper Rack", href: "/papers" },
  { name: "Projects", href: "/projects" },
  { name: "Stack", href: "/stack" },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 w-full py-6 md:py-10 border-b border-muted/10" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-[900px] mx-auto px-6 w-full flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-xl md:text-2xl tracking-tight hover:text-accent transition-colors">
          Manish Anand
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-mono text-sm">
          {navLinks.map((link) => {
            if (link.name === "Home") return null;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative pb-1 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  active ? "text-accent" : "text-muted hover:text-accent"
                }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
                )}
              </Link>
            );
          })}
          
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted hover:text-foreground transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
            ) : (
              <div className="w-[18px] h-[18px]" />
            )}
          </button>
        </nav>

        {/* Mobile Nav Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted hover:text-foreground transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {mounted ? (
              theme === "dark" ? <Sun size={18} /> : <Moon size={18} />
            ) : (
              <div className="w-[18px] h-[18px]" />
            )}
          </button>
          
          <details 
            className="group [&_summary::-webkit-details-marker]:hidden"
            open={isOpen}
            onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer list-none min-h-[44px] min-w-[44px] flex items-center justify-center font-mono">
              Menu
            </summary>
            
            <div className="absolute top-full left-0 w-full border-b border-muted/20 px-4 py-6 flex flex-col gap-4 shadow-xl z-50" style={{ backgroundColor: 'var(--background)' }}>
              <nav className="flex flex-col items-center gap-2 font-mono text-base">
                {navLinks.map((link) => {
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`relative py-3 block min-h-[44px] flex items-center justify-center w-full text-center transition-colors ${
                        active ? "text-accent" : "text-foreground hover:text-accent"
                      }`}
                    >
                      {link.name}
                      {active && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-accent rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
