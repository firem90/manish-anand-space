import Link from "next/link";
import { Mail, Github, Linkedin, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto py-12 md:py-20 text-muted font-mono text-sm max-w-[900px] mx-auto px-6 w-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-5">
            <a
              href="mailto:manish.anandaeswaran@gmail.com"
              className="hover:text-accent transition-colors min-h-[44px] flex items-center gap-2"
              aria-label="Email"
            >
              <Mail size={18} />
              <span className="hidden sm:inline">Email</span>
            </a>
            <a
              href="https://github.com/firem90"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors min-h-[44px] flex items-center gap-2"
              aria-label="GitHub"
            >
              <Github size={18} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a
              href="https://linkedin.com/in/manish-a-e"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors min-h-[44px] flex items-center gap-2"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
              <span className="hidden sm:inline">LinkedIn</span>
            </a>
            <a
              href="https://www.instagram.com/mantel.of.mind?igsh=Y3ZobTY0cTVyMWJ0&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors min-h-[44px] flex items-center gap-2"
              aria-label="Instagram"
            >
              <Instagram size={18} />
              <span className="hidden sm:inline">Instagram</span>
            </a>
          </div>

          <Link
            href="/contact"
            className="text-muted hover:text-accent transition-colors min-h-[44px] flex items-center font-mono text-sm"
          >
            Contact me →
          </Link>
        </div>

        <div className="border-t border-muted/20 pt-6 text-xs text-muted/70">
          © {new Date().getFullYear()} Manish Anandaeswaran. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
