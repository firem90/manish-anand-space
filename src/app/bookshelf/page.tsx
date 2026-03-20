import fs from "fs";
import path from "path";
import { BooksClient } from "@/components/BooksClient";

const booksData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "src/content/books/books.json"), "utf8")
);

export default function BookshelfPage() {
  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-3xl md:text-5xl mb-4">Bookshelf</h1>
        <p className="text-muted font-mono">
          What I&apos;m reading and what I recommend.
        </p>
      </header>
      
      <BooksClient books={booksData} />
    </div>
  );
}
