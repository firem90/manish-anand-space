import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import fs from "fs";
import path from "path";
import { saveFile } from "@/lib/github";

const BOOKS_FILE = path.join(process.cwd(), "src/content/books/books.json");

function getBooks() {
  if (!fs.existsSync(BOOKS_FILE)) {
    return [];
  }
  const data = fs.readFileSync(BOOKS_FILE, "utf8");
  return JSON.parse(data);
}

async function saveBooks(books: any[]) {
  await saveFile(BOOKS_FILE, JSON.stringify(books, null, 2), "Update books library");
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const books = getBooks();
    return NextResponse.json({ books });
  } catch (err) {
    console.error("Failed to read books:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const book = await req.json();
    if (!book.title || !book.author || !book.isbn) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const books = getBooks();
    
    // Check for duplicate ISBN
    if (books.some((b: any) => b.isbn === book.isbn)) {
      return NextResponse.json({ error: "Book with this ISBN already exists" }, { status: 400 });
    }

    // Add new book to the top of the list
    books.unshift({
      title: book.title,
      author: book.author,
      isbn: book.isbn.replace(/-/g, ""), // clean ISBN
      status: book.status || "want-to-read",
      category: book.category || "uncategorized",
      type: book.type || "technical",
      take: book.take || undefined,
      notesSlug: book.notesSlug || undefined,
      draft: book.draft,
    });

    await saveBooks(books);
    return NextResponse.json({ success: true, book: books[0] });
  } catch (err: any) {
    console.error("Failed to add book:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const bookUpdate = await req.json();
    const { originalIsbn, ...updatedFields } = bookUpdate;

    if (!originalIsbn || !updatedFields.isbn) {
      return NextResponse.json({ error: "Missing ISBN" }, { status: 400 });
    }

    const books = getBooks();
    const index = books.findIndex((b: any) => b.isbn === originalIsbn);
    
    if (index === -1) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // If changing ISBN, check for duplicates
    if (originalIsbn !== updatedFields.isbn && books.some((b: any) => b.isbn === updatedFields.isbn)) {
       return NextResponse.json({ error: "Another book with this ISBN already exists" }, { status: 400 });
    }

    books[index] = {
      ...books[index],
      ...updatedFields,
      isbn: updatedFields.isbn.replace(/-/g, ""),
      take: updatedFields.take || undefined,
      notesSlug: updatedFields.notesSlug || undefined,
    };

    await saveBooks(books);
    return NextResponse.json({ success: true, book: books[index] });
  } catch (err: any) {
    console.error("Failed to update book:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const isbn = searchParams.get("isbn");

    if (!isbn) {
      return NextResponse.json({ error: "Missing isbn" }, { status: 400 });
    }

    let books = getBooks();
    books = books.filter((b: any) => b.isbn !== isbn);
    await saveBooks(books);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete book:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
