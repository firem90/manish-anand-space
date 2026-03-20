import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    const filePath = path.join(process.cwd(), "src/content/diagrams", `${file}.excalidraw`);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Diagram not found" }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(fileContents);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load diagram" }, { status: 500 });
  }
}
