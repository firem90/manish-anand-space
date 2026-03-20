"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type BookType = "technical" | "personal";

export function BooksClient({ books }: { books: any[] }) {
  const [bookType, setBookType] = useState<BookType | "all">("all");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "a-z" | "z-a">("latest");

  const booksWithIndex = books.map((b, i) => ({ ...b, _index: i }));

  const filteredBooks = booksWithIndex.filter((b) => {
    // Search filter
    if (search && !b.title.toLowerCase().includes(search.toLowerCase()) && !b.author.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // Type filter
    if (bookType !== "all" && b.type !== bookType) {
      return false;
    }
    // Category filter
    if (activeCategory && b.category !== activeCategory) {
      return false;
    }
    return true;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "oldest") return b._index - a._index;
    if (sortBy === "latest") return a._index - b._index;
    if (sortBy === "a-z") return a.title.localeCompare(b.title);
    if (sortBy === "z-a") return b.title.localeCompare(a.title);
    return 0;
  });

  const typeForCategories = bookType === "all" ? books : books.filter((b: any) => b.type === bookType);
  const categories = Array.from(new Set(typeForCategories.map((b: any) => b.category)));

  const reading = sortedBooks.filter((b: any) => b.status === "reading");
  const read = sortedBooks.filter((b: any) => b.status === "read");
  const wantToRead = sortedBooks.filter((b: any) => b.status === "want-to-read");

  return (
    <div className="flex flex-col gap-10">
      {/* Filters & Search */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center w-full">
          {/* Type Toggle */}
          <div className="flex gap-1 p-1 bg-muted/10 rounded-sm font-mono text-sm self-start">
            <button
              onClick={() => { setBookType("all"); setActiveCategory(null); }}
              className={`px-3 py-1.5 rounded-sm transition-colors ${bookType === "all" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
            >
              All Types
            </button>
            <button
              onClick={() => { setBookType("technical"); setActiveCategory(null); }}
              className={`px-3 py-1.5 rounded-sm transition-colors ${bookType === "technical" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
            >
              Technical
            </button>
            <button
              onClick={() => { setBookType("personal"); setActiveCategory(null); }}
              className={`px-3 py-1.5 rounded-sm transition-colors ${bookType === "personal" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                }`}
            >
              Personal
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 md:w-48 bg-background border border-muted/30 focus:border-accent px-3 py-1.5 rounded-sm text-foreground font-mono placeholder:text-muted/50 outline-none transition-colors text-sm"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="font-mono text-sm bg-background border border-muted/30 text-muted px-2 py-1.5 rounded-sm outline-none focus:border-accent transition-colors cursor-pointer shrink-0"
            >
              <option value="latest">Latest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="a-z">Title (A-Z)</option>
              <option value="z-a">Title (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 pb-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`font-mono text-xs px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${activeCategory === null
              ? "bg-accent text-white"
              : "bg-muted/10 text-muted hover:text-foreground"
              }`}
          >
            all
          </button>
          {categories.map((cat) => (
            <button
              key={cat as string}
              onClick={() => setActiveCategory(cat as string)}
              className={`font-mono text-xs px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${activeCategory === cat
                ? "bg-accent text-white"
                : "bg-muted/10 text-muted hover:text-foreground"
                }`}
            >
              {cat as string}
            </button>
          ))}
        </div>
      </div>

      {reading.length > 0 && <BookSection title="Currently Reading" books={reading} showNotes={bookType !== "personal"} />}
      {read.length > 0 && <BookSection title="Read" books={read} showNotes={bookType !== "personal"} />}
      {wantToRead.length > 0 && <BookSection title="Want to Read" books={wantToRead} showNotes={bookType !== "personal"} />}
      {sortedBooks.length === 0 && <p className="text-muted font-mono">No books found.</p>}
    </div>
  );
}

function BookSection({ title, books, showNotes }: { title: string; books: any[]; showNotes: boolean }) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold mb-6 border-b border-muted/20 pb-2">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {books.map((book: any) => (
          <article key={book.isbn} className="flex flex-col gap-3 group">
            <div className="aspect-[2/3] w-full relative object-cover bg-muted/10 rounded overflow-hidden">
              <Image
                src={`https://books.google.com/books/content?vid=ISBN${book.isbn}&printsec=frontcover&img=1&zoom=1`}
                alt={`Cover of ${book.title}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              // unoptimized
              />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base leading-tight line-clamp-2" title={book.title}>
                {book.title}
              </h3>
              <p className="text-muted font-mono text-xs mt-1">{book.author}</p>
            </div>
            {book.take && (
              <div className="mt-auto flex items-center gap-3">
                <details className="flex-1">
                  <summary className="text-xs font-mono text-accent cursor-pointer hover:underline min-h-[44px] flex items-center">
                    My Take
                  </summary>
                  <p className="text-sm font-serif italic text-foreground/90 mt-2 bg-muted/5 p-3 rounded-sm border border-muted/10">
                    &quot;{book.take}&quot;
                  </p>
                </details>
                {showNotes && book.notesSlug && (
                  <Link
                    href={`/bookshelf/${book.notesSlug}`}
                    className="text-xs font-mono text-accent hover:underline shrink-0 min-h-[44px] flex items-center"
                  >
                    Notes →
                  </Link>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
