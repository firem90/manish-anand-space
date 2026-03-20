import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// We use a mock/in-memory if env vars are missing so the build doesn't break
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (e) {
  console.warn("Upstash Redis not configured.");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!redis) return NextResponse.json({ views: Math.floor(Math.random() * 1000) });
  
  try {
    const views = await redis.get(`pageviews:blog:${slug}`);
    return NextResponse.json({ views: views ? Number(views) : 0 });
  } catch (error) {
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!redis) {
    // mock increment
    return NextResponse.json({ views: Math.floor(Math.random() * 1000) });
  }

  try {
    const views = await redis.incr(`pageviews:blog:${slug}`);
    return NextResponse.json({ views });
  } catch (error) {
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

