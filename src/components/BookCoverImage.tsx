"use client";

import { useState } from "react";

export function BookCoverImage({ book }: { book: any }) {
  const [src, setSrc] = useState(
    `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
  );
  const [fallbackStage, setFallbackStage] = useState(0);

  const handleError = () => {
    if (fallbackStage === 0 && book.googleBooksId) {
      // Fall back to Google Books
      setSrc(
        `https://books.google.com/books?id=${book.googleBooksId}&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api`
      );
      setFallbackStage(1);
    } else {
      // Both failed — show placeholder
      setFallbackStage(2);
    }
  };

  if (fallbackStage === 2) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/10 p-4 text-center rounded border border-muted/20">
        <p className="font-bold text-sm line-clamp-3">{book.title}</p>
        <p className="text-xs text-muted mt-1">{book.author}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Cover of ${book.title}`}
      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
      onError={handleError}
      loading="lazy"
    />
  );
}
