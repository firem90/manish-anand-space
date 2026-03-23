import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import fs from "fs";
import path from "path";
import { saveFile, deleteFile, fileExists } from "@/lib/github";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

/** Sanitize a slug: lowercase, replace spaces/special chars with hyphens, strip invalid chars */
function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/https?:\/\//g, "")    // strip protocol
    .replace(/[^a-z0-9\s-]/g, "")   // remove non-alphanumeric (except spaces, hyphens)
    .trim()
    .replace(/[\s_]+/g, "-")        // spaces/underscores → hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .replace(/^-|-$/g, "");         // trim leading/trailing hyphens
}

function generateMdxContent(data: any) {
  return `---
title: "${data.title.replace(/"/g, '\\"')}"
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

  // Get all posts including content
  const posts = getAllPosts();
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    if (!data.slug || !data.title || !data.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = sanitizeSlug(data.slug);
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug — must contain at least one alphanumeric character" }, { status: 400 });
    }

    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    if (await fileExists(filePath)) {
      return NextResponse.json({ error: "Post with this slug already exists" }, { status: 400 });
    }

    await saveFile(filePath, generateMdxContent({ ...data, slug }), `Create post: ${slug}`);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error("Failed to create post:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
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

    const slug = sanitizeSlug(data.slug);
    const originalSlug = sanitizeSlug(data.originalSlug);
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const newFilePath = path.join(BLOG_DIR, `${slug}.mdx`);
    const oldFilePath = path.join(BLOG_DIR, `${originalSlug}.mdx`);

    if (slug !== originalSlug) {
      if (await fileExists(newFilePath)) {
        return NextResponse.json({ error: "Target slug already exists" }, { status: 400 });
      }
      if (await fileExists(oldFilePath)) {
        await deleteFile(oldFilePath, `Delete old post: ${originalSlug}`);
      }
    }

    await saveFile(newFilePath, generateMdxContent({ ...data, slug }), `Update post: ${slug}`);
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    console.error("Failed to update post:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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

    const safeSlug = sanitizeSlug(slug);
    const filePath = path.join(BLOG_DIR, `${safeSlug}.mdx`);
    if (await fileExists(filePath)) {
      await deleteFile(filePath, `Delete post: ${safeSlug}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete post:", err);
    if (err.message === "GitHub token expired or invalid") return NextResponse.json({ error: err.message }, { status: 401 });
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
