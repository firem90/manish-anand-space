import fs from "fs";
import path from "path";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function syncBookCovers() {
  console.log("Starting book covers sync...");
  const dataPath = path.join(process.cwd(), "src/content/books/books.json");
  const booksData = JSON.parse(fs.readFileSync(dataPath, "utf8"));

  let updatedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const book of booksData) {
    if (book.googleBooksId) {
      skippedCount++;
      continue;
    }

    if (!book.isbn) {
      console.warn(`[Skip] Book "${book.title}" has no ISBN.`);
      skippedCount++;
      continue;
    }

    console.log(`[Fetch] Looking up ID for: "${book.title}" (ISBN: ${book.isbn})`);
    
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`);
      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const id = data.items[0].id;
        book.googleBooksId = id;
        updatedCount++;
        console.log(`  -> Found ID: ${id}`);
      } else {
        failedCount++;
        console.log(`  -> No results on Google Books.`);
      }
    } catch (error) {
      failedCount++;
      console.error(`  -> Failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Delay slightly to prevent rate limits
    await delay(1000); // wait 1 second between each request
  }

  if (updatedCount > 0) {
    fs.writeFileSync(dataPath, JSON.stringify(booksData, null, 2) + "\n");
    console.log(`\nSync complete! Updated ${updatedCount} books. Saved to books.json.`);
  } else {
    console.log(`\nSync complete! No books needed updating.`);
  }

  console.log(`Summary: ${updatedCount} updated, ${failedCount} missing/failed, ${skippedCount} skipped.`);
}

syncBookCovers().catch((error) => {
  console.error("Fatal error running sync:", error);
  process.exit(1);
});
