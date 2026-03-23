"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Search, BookOpen } from "lucide-react";

export default function BooksAdminPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit & Add state
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [showMyTake, setShowMyTake] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Library view state
  const [libraryType, setLibraryType] = useState<"all" | "technical" | "personal">("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [librarySort, setLibrarySort] = useState<"latest" | "oldest" | "a-z" | "z-a">("latest");

  const libraryBooksWithIndex = books.map((b, i) => ({ ...b, _index: i }));
  const filteredLibraryBooks = libraryBooksWithIndex
    .filter(b => {
      if (librarySearch && !b.title.toLowerCase().includes(librarySearch.toLowerCase()) && !b.author.toLowerCase().includes(librarySearch.toLowerCase())) return false;
      if (libraryType !== "all" && b.type !== libraryType) return false;
      return true;
    })
    .sort((a, b) => {
      if (librarySort === "oldest") return b._index - a._index;
      if (librarySort === "latest") return a._index - b._index;
      if (librarySort === "a-z") return a.title.localeCompare(b.title);
      if (librarySort === "z-a") return b.title.localeCompare(a.title);
      return 0;
    });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/books");
      const data = await res.json();
      setBooks(data.books || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleDelete = async (isbn: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from your bookshelf?`)) return;
    
    try {
      const res = await fetch(`/api/admin/books?isbn=${isbn}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(`Error: ${err.error}`);
        return;
      }
      fetchBooks();
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setSearchResults([]);

    try {
      // Use OpenLibrary Search API with explicit fields
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&fields=title,author_name,isbn,cover_i&limit=10`);
      const data = await res.json();
      
      // Filter out results without an ISBN, pick the first ISBN for each book
      const results = data.docs
        .filter((doc: any) => doc.isbn && doc.isbn.length > 0)
        .map((doc: any) => ({
          title: doc.title,
          author: doc.author_name ? doc.author_name[0] : "Unknown Author",
          isbn: doc.isbn[0],
          cover_i: doc.cover_i
        }));

      if (results.length === 0) {
        setSearchError("No books found with covers/ISBNs.");
      } else {
        setSearchResults(results);
      }
    } catch (err) {
      setSearchError("Failed to search OpenLibrary.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    setEditingBook({
      isNew: true,
      title: result.title,
      author: result.author,
      isbn: result.isbn,
      type: "technical",
      status: "want-to-read",
      category: "",
    });
    setShowMyTake(false);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const bookData = {
      originalIsbn: editingBook?.isNew ? null : editingBook?.isbn,
      title: formData.get("title"),
      author: formData.get("author"),
      isbn: formData.get("isbn"),
      type: formData.get("type"),
      category: formData.get("category"),
      status: formData.get("status"),
      take: showMyTake ? formData.get("take") : undefined,
      notesSlug: formData.get("notesSlug") || undefined,
    };

    try {
      const res = await fetch("/api/admin/books", {
        method: editingBook?.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });
      
      if (res.ok) {
        setEditingBook(null);
        fetchBooks();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      alert("Failed to save book");
    }
  };

  const startEdit = (book: any) => {
    setEditingBook(book);
    setShowMyTake(!!book.take);
  };

  if (editingBook) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{editingBook.isNew ? "Add Book" : "Edit Book"}</h1>
          <button 
            onClick={() => setEditingBook(null)}
            className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            <X size={16} /> Cancel
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Cover Preview */}
          <div className="w-full md:w-48 shrink-0 flex flex-col gap-2">
            <div className="aspect-[2/3] w-full bg-muted/10 rounded overflow-hidden border border-muted/20 relative">
              {editingBook.isbn ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={`https://covers.openlibrary.org/b/isbn/${editingBook.isbn}-L.jpg`} 
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted font-mono text-xs gap-2">
                  <BookOpen size={24} />
                  <span>No ISBN</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted font-mono text-center">OpenLibrary Cover Preview</p>
          </div>

          <form onSubmit={handleSave} className="flex-1 w-full flex flex-col gap-6 bg-background border border-muted/20 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label htmlFor="title" className="text-sm font-mono text-muted">Title (required)</label>
                <input id="title" name="title" defaultValue={editingBook.title} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-bold" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="author" className="text-sm font-mono text-muted">Author (required)</label>
                <input id="author" name="author" defaultValue={editingBook.author} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="isbn" className="text-sm font-mono text-muted">ISBN-10 or ISBN-13 (required)</label>
                <input 
                  id="isbn" 
                  name="isbn" 
                  defaultValue={editingBook.isbn} 
                  required 
                  className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" 
                  onChange={(e) => setEditingBook({ ...editingBook, isbn: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="type" className="text-sm font-mono text-muted">Type</label>
                <select id="type" name="type" defaultValue={editingBook.type || "technical"} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm [&>option]:bg-background">
                  <option value="technical">Technical</option>
                  <option value="personal">Personal</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-mono text-muted">Category (e.g. sci-fi, distributed-systems)</label>
                <input id="category" name="category" defaultValue={editingBook.category} required className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="status" className="text-sm font-mono text-muted">Status</label>
                <select id="status" name="status" defaultValue={editingBook.status || "want-to-read"} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm [&>option]:bg-background">
                  <option value="reading">Currently Reading</option>
                  <option value="read">Read</option>
                  <option value="want-to-read">Want to Read</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="notesSlug" className="text-sm font-mono text-muted">Optional: Notes Blog Post Slug</label>
                <input id="notesSlug" name="notesSlug" defaultValue={editingBook.notesSlug} className="bg-transparent border border-muted/30 focus:border-accent p-2 rounded-sm outline-none font-mono text-sm" placeholder="e.g. ddia-notes" />
              </div>
            </div>

            <div className="pt-4 border-t border-muted/20">
              <label className="flex items-center gap-3 cursor-pointer select-none mb-4">
                <input 
                  type="checkbox" 
                  checked={showMyTake}
                  onChange={(e) => setShowMyTake(e.target.checked)}
                  className="w-4 h-4 accent-accent"
                />
                <span className="font-mono text-sm font-bold">Include "My Take"</span>
              </label>

              {showMyTake && (
                <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2">
                  <label htmlFor="take" className="text-sm font-mono text-muted">Your Review / Takeaway</label>
                  <textarea 
                    id="take" 
                    name="take" 
                    defaultValue={editingBook.take} 
                    required={showMyTake}
                    rows={4} 
                    className="bg-transparent border border-muted/30 focus:border-accent p-3 rounded-sm outline-none font-serif text-sm resize-y" 
                    placeholder="This book profoundly changed how I view..." 
                  />
                </div>
              )}
            </div>

            <button type="submit" className="bg-accent text-white font-bold py-2.5 rounded-sm hover:brightness-110 flex items-center justify-center gap-2 mt-4">
              <Check size={18} /> Save Book
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header and Lookup */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Bookshelf</h1>
          <p className="text-sm text-muted font-mono">
            Manage your reading list. Search below to auto-fill book details via OpenLibrary.
          </p>
        </div>
        
        <div className="bg-muted/5 border border-muted/20 p-6 rounded-lg flex flex-col gap-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search by title or author..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-muted/30 focus:border-accent pl-10 pr-4 py-2.5 rounded-sm outline-none font-mono text-sm"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching || !searchQuery.trim()}
              className="bg-accent text-white font-bold px-6 py-2.5 rounded-sm hover:brightness-110 transition-all disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {isSearching ? "Searching..." : "Lookup Book"}
            </button>
          </form>

          {searchError && <p className="text-red-400 font-mono text-sm">{searchError}</p>}
          
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 animate-in fade-in">
              {searchResults.map((res, i) => (
                <button 
                  key={i}
                  onClick={() => selectSearchResult(res)}
                  className="flex flex-col gap-2 text-left group"
                >
                  <div className="aspect-[2/3] w-full bg-background border border-muted/30 group-hover:border-accent rounded overflow-hidden relative transition-colors">
                    {res.cover_i ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`https://covers.openlibrary.org/b/id/${res.cover_i}-M.jpg`} alt="cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted font-mono text-[10px]">No Cover</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs line-clamp-2 leading-tight group-hover:text-accent transition-colors">{res.title}</h4>
                    <p className="text-muted font-mono text-[10px] truncate mt-0.5">{res.author}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => setEditingBook({ isNew: true, status: "want-to-read", type: "technical" })}
            className="flex items-center gap-2 text-muted hover:text-foreground px-4 py-2 rounded-sm transition-colors text-sm font-mono"
          >
            <Plus size={16} /> Enter book manually instead
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-muted font-mono animate-pulse">Loading books...</div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h2 className="text-lg font-bold whitespace-nowrap shrink-0">Your Library ({filteredLibraryBooks.length})</h2>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto pb-1 md:pb-0">
              {/* Type Filter */}
              <div className="flex gap-1 p-1 bg-muted/10 rounded-sm font-mono text-sm shrink-0">
                <button
                  onClick={() => setLibraryType("all")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    libraryType === "all" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setLibraryType("technical")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    libraryType === "technical" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  Technical
                </button>
                <button
                  onClick={() => setLibraryType("personal")}
                  className={`px-3 py-1.5 rounded-sm transition-colors ${
                    libraryType === "personal" ? "bg-accent text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  Personal
                </button>
              </div>

              {/* Search & Sort */}
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  className="flex-1 sm:w-32 lg:w-48 bg-background border border-muted/30 focus:border-accent px-3 py-1.5 rounded-sm text-sm font-mono outline-none"
                />
                <select
                  value={librarySort}
                  onChange={(e) => setLibrarySort(e.target.value as any)}
                  className="bg-background border border-muted/30 focus:border-accent px-2 py-1.5 rounded-sm text-sm font-mono text-muted outline-none w-28 shrink-0"
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                  <option value="a-z">A-Z</option>
                  <option value="z-a">Z-A</option>
                </select>
              </div>
            </div>
          </div>
          
        <div className="flex flex-col gap-3">
            {filteredLibraryBooks.map((book) => (
              <div key={book.isbn} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-muted/20 rounded-md bg-background/50 hover:bg-background transition-colors group">
                
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 sm:w-12 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted/10 border border-muted/20 hidden sm:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://covers.openlibrary.org/b/isbn/${book.isbn}-S.jpg`} alt="cover" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm md:text-base truncate">{book.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-muted mt-1">
                      <span className="truncate max-w-[150px] sm:max-w-none">{book.author}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="text-accent uppercase whitespace-nowrap">{book.status.replace(/-/g, " ")}</span>
                      <span className="hidden sm:inline">·</span>
                      <span className="capitalize">{book.type}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(book)}
                    className="p-2 text-muted hover:text-accent bg-muted/10 rounded-sm transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(book.isbn, book.title)}
                    className="p-2 text-muted hover:text-red-400 bg-muted/10 rounded-sm transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {books.length === 0 && <p className="text-muted font-mono col-span-full">No books added yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
