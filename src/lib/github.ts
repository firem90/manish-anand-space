import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

// Only use GitHub API when deployed on Vercel (or explicitly enabled)
const isProd = process.env.VERCEL === "1" || process.env.USE_GITHUB_API === "true";

export async function saveFile(absolutePath: string, content: string, commitMessage: string) {
  if (isProd) {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO environment variables.");
    }

    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: relativePath,
      });
      if (typeof data === "object" && !Array.isArray(data) && "sha" in data) {
        sha = data.sha;
      }
    } catch (e: any) {
      if (e.status === 401) throw new Error("GitHub token expired or invalid");
      if (e.status !== 404) throw e;
    }

    try {
      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: relativePath,
        message: commitMessage,
        content: Buffer.from(content).toString("base64"),
        sha,
      });
    } catch (e: any) {
      if (e.status === 401) throw new Error("GitHub token expired or invalid");
      throw e;
    }
  } else {
    // Ensure dir exists
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    fs.writeFileSync(absolutePath, content, "utf8");
  }
}

export async function deleteFile(absolutePath: string, commitMessage: string) {
  if (isProd) {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
      throw new Error("Missing GITHUB_TOKEN or GITHUB_REPO environment variables.");
    }
    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");

    let sha: string;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path: relativePath,
      });
      if (typeof data === "object" && !Array.isArray(data) && "sha" in data) {
        sha = data.sha;
      } else {
        throw new Error("Could not find file sha");
      }
    } catch (e: any) {
      if (e.status === 401) throw new Error("GitHub token expired or invalid");
      if (e.status === 404) return;
      throw e;
    }

    try {
      await octokit.repos.deleteFile({
        owner,
        repo,
        path: relativePath,
        message: commitMessage,
        sha,
      });
    } catch (e: any) {
      if (e.status === 401) throw new Error("GitHub token expired or invalid");
      throw e;
    }
  } else {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }
}

export async function fileExists(absolutePath: string): Promise<boolean> {
  if (isProd) {
    if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) return false;
    const [owner, repo] = process.env.GITHUB_REPO.split("/");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, "/");
    try {
      await octokit.repos.getContent({ owner, repo, path: relativePath });
      return true;
    } catch (e: any) {
      if (e.status === 401) throw new Error("GitHub token expired or invalid");
      return false;
    }
  } else {
    return fs.existsSync(absolutePath);
  }
}
