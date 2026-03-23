import fs from "fs";
import path from "path";

export type PaperPost = {
  slug: string;
  title: string;
  authors: string;
  year: number;
  paperUrl: string;
  date: string;
  tags: string[];
  summary: string;
  content: string;
  readTime: number;
  draft?: boolean;
};

const PAPERS_DIR = path.join(process.cwd(), "src/content/papers");

export function getPaperBySlug(slug: string): PaperPost | null {
  try {
    const fullPath = path.join(PAPERS_DIR, `${slug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const match = /---\n([\s\S]*?)\n---\n([\s\S]*)/.exec(fileContents);
    if (!match) return null;

    const frontmatterText = match[1];
    const content = match[2];

    const titleMatch = /title:\s*"(.*)"/.exec(frontmatterText);
    const authorsMatch = /authors:\s*"(.*)"/.exec(frontmatterText);
    const yearMatch = /year:\s*(\d+)/.exec(frontmatterText);
    const paperUrlMatch = /paperUrl:\s*"(.*)"/.exec(frontmatterText);
    const dateMatch = /date:\s*"(.*)"/.exec(frontmatterText);
    const tagsMatch = /tags:\s*\[(.*)\]/.exec(frontmatterText);
    const summaryMatch = /summary:\s*"(.*)"/.exec(frontmatterText);
    const draftMatch = /draft:\s*(true|false)/.exec(frontmatterText);

    if (!titleMatch || !authorsMatch || !yearMatch || !paperUrlMatch || !dateMatch || !tagsMatch || !summaryMatch) {
      return null;
    }

    const tags = tagsMatch[1].split(",").map(t => t.replace(/"/g, "").trim());
    const draft = draftMatch ? draftMatch[1] === "true" : false;
    const words = content.split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    return {
      slug,
      title: titleMatch[1],
      authors: authorsMatch[1],
      year: parseInt(yearMatch[1]),
      paperUrl: paperUrlMatch[1],
      date: dateMatch[1],
      tags,
      summary: summaryMatch[1],
      content,
      readTime,
      draft,
    };
  } catch (e) {
    return null;
  }
}

export function getAllPapers(): PaperPost[] {
  try {
    const files = fs.readdirSync(PAPERS_DIR);
    const papers = files
      .filter((file) => file.endsWith(".mdx"))
      .map((file) => getPaperBySlug(file.replace(/\.mdx$/, "")))
      .filter((paper): paper is PaperPost => paper !== null && !paper.draft)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return papers;
  } catch (e) {
    return [];
  }
}
