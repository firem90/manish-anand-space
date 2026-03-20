import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import fs from "fs";
import path from "path";

const DIAGRAMS_DIR = path.join(process.cwd(), "src/content/diagrams");

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!fs.existsSync(DIAGRAMS_DIR)) {
      return NextResponse.json({ diagrams: [] });
    }
    const files = fs.readdirSync(DIAGRAMS_DIR)
      .filter((f) => f.endsWith(".excalidraw"))
      .map((f) => f.replace(/\.excalidraw$/, ""));
    return NextResponse.json({ diagrams: files });
  } catch (err) {
    console.error("Failed to list diagrams:", err);
    return NextResponse.json({ error: "Failed to list diagrams" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;

    if (!file || !name) {
      return NextResponse.json({ error: "Missing file or name" }, { status: 400 });
    }

    // Validate name: only allow alphanumeric, spaces, hyphens, underscores
    const sanitizedName = name.trim();
    if (!sanitizedName || !/^[a-zA-Z0-9\s\-_]+$/.test(sanitizedName)) {
      return NextResponse.json(
        { error: "Invalid name — use only letters, numbers, spaces, hyphens, and underscores" },
        { status: 400 }
      );
    }

    // Validate file: must be valid JSON with excalidraw structure
    const text = await file.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "Invalid file — must be valid JSON" }, { status: 400 });
    }

    if (parsed.type !== "excalidraw") {
      return NextResponse.json(
        { error: "Invalid file — not a valid Excalidraw file (missing \"type\": \"excalidraw\")" },
        { status: 400 }
      );
    }

    if (!Array.isArray(parsed.elements) || parsed.elements.length === 0) {
      return NextResponse.json(
        { error: "Invalid file — Excalidraw file has no elements" },
        { status: 400 }
      );
    }

    // Ensure directory exists
    if (!fs.existsSync(DIAGRAMS_DIR)) {
      fs.mkdirSync(DIAGRAMS_DIR, { recursive: true });
    }

    const filePath = path.join(DIAGRAMS_DIR, `${sanitizedName}.excalidraw`);
    const exists = fs.existsSync(filePath);

    fs.writeFileSync(filePath, text, "utf8");

    return NextResponse.json({
      success: true,
      name: sanitizedName,
      replaced: exists,
      usage: `<Diagram file="${sanitizedName}" caption="Your caption here" />`,
    });
  } catch (err) {
    console.error("Failed to upload diagram:", err);
    return NextResponse.json({ error: "Failed to upload diagram" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json({ error: "Missing name" }, { status: 400 });
    }

    const filePath = path.join(DIAGRAMS_DIR, `${name}.excalidraw`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete diagram:", err);
    return NextResponse.json({ error: "Failed to delete diagram" }, { status: 500 });
  }
}
