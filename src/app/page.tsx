import Link from "next/link";
import Image from "next/image";
import { BookCoverImage } from "@/components/BookCoverImage";
import { getAllPosts } from "@/lib/blog";
import fs from "fs";
import path from "path";

// Read data
const tilData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/til/til.json"), "utf8")
);
const projectsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/projects/projects.json"), "utf8")
);
const booksData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/books/books.json"), "utf8")
);

export default function Home() {
  const latestPosts = getAllPosts().slice(0, 3);
  const recentTils = tilData.slice(0, 5);
  const currentProject = projectsData.find((p: any) => p.status === "in-progress");
  const currentlyReading = booksData.find((b: any) => b.status === "reading");

  return (
    <div className="flex flex-col gap-16 md:gap-24">
      {/* 1. Identity block — side-by-side layout */}
      <section className="flex flex-col-reverse md:flex-row items-start gap-8 md:gap-12">
        <div className="flex-1">
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-[1.1]">
            Hey, I am Manish
          </h1>
          <p className="text-accent font-serif italic text-lg md:text-xl mb-6">
            java, distributed systems, fintech. i build backends.
          </p>
          <div className="space-y-4 text-foreground/85 leading-relaxed">
            <p>
              I am a backend engineer based in Bengaluru. I've spent the last four
              years building systems that handle real workloads — batch jobs that process
              millions of records, APIs that need to stay up, migrations that cannot fail,
              and services that integrate with more external systems than you'd want.
            </p>
            <p>
              I currently work at Blackhawk Network on backend infrastructure for digital
              wallet platforms. Before that I was at Infosys working on US healthcare systems —
              large scale, high stakes, the kind of environment where you learn that
              understanding the system matters more than knowing the syntax.
            </p>
            <p>
              Most of my day is Java. Spring Boot, distributed systems, databases, caching,
              message queues, Kubernetes. I care about how systems are designed, why they
              fail under pressure, and what it takes to keep them running reliably over time.
            </p>
            <p>
              I'm from Tiruchirappalli, studied EEE at Anna University, and somehow ended
              up writing batch jobs and designing microservices for a living. No complaints.
            </p>
          </div>
        </div>
        <div className="w-48 h-48 md:w-72 md:h-72 lg:w-[320px] lg:h-[320px] shrink-0 rounded-2xl overflow-hidden shadow-2xl bg-muted/5 relative">
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl z-10 pointer-events-none"></div>
          <Image
            src="/profile_picture.png"
            alt="Manish Anandaeswaran"
            width={320}
            height={320}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </section>

      {/* 2. Currently Building */}
      {currentProject && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl">Currently Building</h2>
            <span className="text-xs uppercase tracking-wider font-mono text-accent border border-accent/30 px-2 py-1 rounded">
              In Progress
            </span>
          </div>
          <div className="border border-muted/20 p-6 rounded-sm bg-background/50 hover:bg-background transition-colors">
            <h3 className="text-lg font-bold mb-3">{currentProject.name}</h3>
            <p className="text-muted leading-relaxed mb-6">
              &quot;{currentProject.description}&quot;
            </p>
            <div className="flex flex-wrap gap-2">
              {currentProject.stack.map((tech: string) => (
                <span
                  key={tech}
                  className="text-xs font-mono bg-muted/10 text-foreground px-2 py-1 rounded-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Latest Writings */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl">Latest Writings</h2>
          <Link href="/blog" className="text-sm font-mono text-muted hover:text-accent transition-colors">
            View all →
          </Link>
        </div>
        <div className="flex flex-col gap-6">
          {latestPosts.map((post) => (
            <article key={post.slug} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 group">
              <Link href={`/blog/${post.slug}`} className="text-lg font-bold group-hover:text-accent transition-colors">
                {post.title}
              </Link>
              <div className="flex items-center gap-3 text-sm font-mono text-muted shrink-0">
                <time>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</time>
                <span className="hidden sm:inline">•</span>
                <span>{post.readTime} min read</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Recent TILs */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl">Recent Notes</h2>
          <Link href="/til" className="text-sm font-mono text-muted hover:text-accent transition-colors">
            View all →
          </Link>
        </div>
        <ul className="flex flex-col gap-4">
          {recentTils.map((til: any, idx: number) => (
            <li key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
              <time className="text-sm font-mono text-muted shrink-0 w-24">
                {new Date(til.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
              </time>
              <span className="font-bold">{til.title}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 5. Currently Reading */}
      {currentlyReading && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl">Currently Reading</h2>
            <Link href="/bookshelf" className="text-sm font-mono text-muted hover:text-accent transition-colors">
              Bookshelf →
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-24 md:w-32 aspect-[2/3] rounded shadow-sm opacity-90 hover:opacity-100 transition-opacity overflow-hidden shrink-0">
              <BookCoverImage book={currentlyReading} />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <h3 className="font-bold text-lg">{currentlyReading.title}</h3>
              <p className="text-muted font-mono text-sm">{currentlyReading.author}</p>
              <p className="mt-2 italic text-foreground/90">
                &quot;{currentlyReading.take}&quot;
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
