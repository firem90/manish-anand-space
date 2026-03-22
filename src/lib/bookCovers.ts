export async function getBookCoverUrl(book: { isbn: string; googleBooksId?: string }): Promise<string | null> {
  const openLibUrl = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;

  try {
    const response = await fetch(openLibUrl, {
      method: "HEAD",
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (response.ok) {
      const contentLength = response.headers.get("content-length");
      // Open Library returns a 1x1 gif when no cover exists, which usually has a length around 43 bytes
      if (contentLength && parseInt(contentLength, 10) > 1000) {
        return openLibUrl;
      }
    }
  } catch (error) {
    console.error(`[BookCovers] Open Library validation failed for ${book.isbn}`, error);
  }

  // 2. Try Google Books API internal ID if already available
  if (book.googleBooksId) {
    return `https://books.google.com/books?id=${book.googleBooksId}&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api`;
  }

  // Fetch from Google API if not found (also triggers auto-sync)
  try {
    const googleApiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`;
    const response = await fetch(googleApiUrl, {
      next: { revalidate: 86400 },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const id = data.items[0].id;

        // Auto-persist: trigger Next.js API route to save the newly discovered ID
        // Note: Not awaiting this, letting it resolve asynchronously.
        const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
        fetch(`${baseUrl}/api/admin/sync-book-covers`, { method: "POST" }).catch(() => {});

        return `https://books.google.com/books?id=${id}&printsec=frontcover&img=1&zoom=4&edge=curl&source=gbs_api`;
      }
    }
  } catch (error) {
    console.error(`[BookCovers] Google Books API failed for ${book.isbn}`, error);
  }

  // 3. If both fail -> return null (placeholder will be shown)
  return null;
}
