import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import { getAllPapers } from "@/lib/papers";
import fs from "fs";
import path from "path";

const PAPERS_DIR = path.join(process.cwd(), "src/content/papers");

function generateMdxContent(data: any) {
  return `---
title: "${data.title.replace(/"/g, '\\"')}"
authors: "${data.authors.replace(/"/g, '\\"')}"
year: ${data.year}
paperUrl: "${data.paperUrl.replace(/"/g, '\\"')}"
date: "${data.date}"
tags: [${data.tags.map((t: string) => `"${t}"`).join(", ")}]
summary: "${(data.summary || "").replace(/"/g, '\\"')}"
---

${data.content}
`;
}

export async function GET(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const papers = getAllPapers();
  return NextResponse.json({ papers });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    if (!data.slug || !data.title || !data.content || !data.authors || !data.year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const filePath = path.join(PAPERS_DIR, `${data.slug}.mdx`);
    if (fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Paper with this slug already exists" }, { status: 400 });
    }

    fs.writeFileSync(filePath, generateMdxContent(data), "utf8");
    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create paper insight" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    if (!data.slug || !data.originalSlug || !data.title || !data.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newFilePath = path.join(PAPERS_DIR, `${data.slug}.mdx`);
    const oldFilePath = path.join(PAPERS_DIR, `${data.originalSlug}.mdx`);

    if (data.slug !== data.originalSlug) {
      if (fs.existsSync(newFilePath)) {
        return NextResponse.json({ error: "Target slug already exists" }, { status: 400 });
      }
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    fs.writeFileSync(newFilePath, generateMdxContent(data), "utf8");
    return NextResponse.json({ success: true, slug: data.slug });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update paper insight" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    
    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const filePath = path.join(PAPERS_DIR, `${slug}.mdx`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete paper insight" }, { status: 500 });
  }
}
