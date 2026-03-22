import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const filePath = path.join(process.cwd(), "src/content/books/books.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, message: "books.json not found" }, { status: 404 });
    }

    const booksData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    let updated = false;

    // We process sequentially to avoid rate-limiting issues on Google API
    for (const book of booksData) {
      if (!book.googleBooksId && book.isbn) {
        try {
          const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`);
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              book.googleBooksId = data.items[0].id;
              updated = true;
            }
          }
        } catch (error) {
          console.error(`Failed to sync ID for ISBN: ${book.isbn}`, error);
        }
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(booksData, null, 2) + "\n");
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Error in sync-book-covers API:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
