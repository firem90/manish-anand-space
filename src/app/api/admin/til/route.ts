import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import fs from "fs";
import path from "path";
import { saveFile } from "@/lib/github";

const TIL_FILE = path.join(process.cwd(), "src/content/til/til.json");

function getTils() {
  if (!fs.existsSync(TIL_FILE)) {
    return [];
  }
  const data = fs.readFileSync(TIL_FILE, "utf8");
  return JSON.parse(data);
}

async function saveTils(tils: any[]) {
  await saveFile(TIL_FILE, JSON.stringify(tils, null, 2), "Update TILs");
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
      draft: til.draft,
    });

    // Keep sorted by date descending just in case
    tils.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    await saveTils(tils);
    return NextResponse.json({ success: true, til: tils[0] });
  } catch (err: any) {
    console.error("Failed to add TIL:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
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

    await saveTils(tils);
    return NextResponse.json({ success: true, til: tils[index] });
  } catch (err: any) {
    console.error("Failed to update TIL:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
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
    await saveTils(tils);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete TIL:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
