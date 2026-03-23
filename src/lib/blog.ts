import fs from "fs";
import path from "path";

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  readTime: number;
  draft: boolean;
};

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(BLOG_DIR, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Basic frontmatter parser for the strict format
    const match = /---\n([\s\S]*?)\n---\n([\s\S]*)/.exec(fileContents);
    if (!match) return null;

    const frontmatterText = match[1];
    const content = match[2];

    const titleMatch = /title:\s*"(.*)"/.exec(frontmatterText);
    const dateMatch = /date:\s*"(.*)"/.exec(frontmatterText);
    const tagsMatch = /tags:\s*\[(.*)\]/.exec(frontmatterText);
    const summaryMatch = /summary:\s*"(.*)"/.exec(frontmatterText);
    const draftMatch = /draft:\s*(true|false)/.exec(frontmatterText);

    if (!titleMatch || !dateMatch || !tagsMatch) {
      return null;
    }

    const tags = tagsMatch[1].split(",").map(t => t.replace(/"/g, "").trim());
    const summary = summaryMatch ? summaryMatch[1] : "";
    const draft = draftMatch ? draftMatch[1] === "true" : false;
    
    // estimate read time (avg 200 words per minute)
    const words = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    return {
      slug,
      title: titleMatch[1],
      date: dateMatch[1],
      tags,
      summary,
      content,
      readTime,
      draft
    };
  } catch (e) {
    return null;
  }
}

export function getAllPosts(): BlogPost[] {
  try {
    const files = fs.readdirSync(BLOG_DIR);
    const posts = files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => getPostBySlug(file.replace(/\.mdx$/, "")))
      .filter((post): post is BlogPost => post !== null && !post.draft)
      .sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime()));
    return posts;
  } catch (e) {
    return [];
  }
}
