import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import fs from "fs";
import path from "path";

const TIL_FILE = path.join(process.cwd(), "src/content/til/til.json");

function getTils() {
  if (!fs.existsSync(TIL_FILE)) {
    return [];
  }
  const data = fs.readFileSync(TIL_FILE, "utf8");
  return JSON.parse(data);
}

function saveTils(tils: any[]) {
  const dir = path.dirname(TIL_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TIL_FILE, JSON.stringify(tils, null, 2), "utf8");
}

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tils = getTils();
    return NextResponse.json({ tils });
  } catch (err) {
    console.error("Failed to read TILs:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const til = await req.json();
    if (!til.title || !til.content || !til.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const tils = getTils();
    
    // Check for duplicate title (or maybe just allow duplicates, but let's prevent exact same title on same date)
    if (tils.some((t: any) => t.title === til.title && t.date === til.date)) {
      return NextResponse.json({ error: "TIL with this title and date already exists" }, { status: 400 });
    }

    tils.unshift({
      date: til.date,
      title: til.title,
      content: til.content,
      tags: til.tags || [],
    });

    // Keep sorted by date descending just in case
    tils.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    saveTils(tils);
    return NextResponse.json({ success: true, til: tils[0] });
  } catch (err) {
    console.error("Failed to add TIL:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const tilUpdate = await req.json();
    const { originalTitle, originalDate, ...updatedFields } = tilUpdate;

    if (!originalTitle || !originalDate) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    const tils = getTils();
    const index = tils.findIndex((t: any) => t.title === originalTitle && t.date === originalDate);
    
    if (index === -1) {
      return NextResponse.json({ error: "TIL not found" }, { status: 404 });
    }

    tils[index] = {
      ...tils[index],
      ...updatedFields,
    };

    tils.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    saveTils(tils);
    return NextResponse.json({ success: true, til: tils[index] });
  } catch (err) {
    console.error("Failed to update TIL:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const date = searchParams.get("date");

    if (!title || !date) {
      return NextResponse.json({ error: "Missing identifiers" }, { status: 400 });
    }

    let tils = getTils();
    tils = tils.filter((t: any) => !(t.title === title && t.date === date));
    saveTils(tils);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete TIL:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
