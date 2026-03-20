import { NextResponse } from "next/server";
import { verifySession } from "@/lib/admin";
import { Redis } from "@upstash/redis";

export async function GET() {
  const isAuth = await verifySession();
  if (!isAuth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return NextResponse.json({ totalViews: 0, error: "Redis not configured" });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const keys = await redis.keys('pageviews:blog:*');
    const globalViewsStr = await redis.get('pageviews:global');
    const globalViews = globalViewsStr ? Number(globalViewsStr) : 0;

    if (!keys || keys.length === 0) {
      return NextResponse.json({ totalViews: globalViews, breakdown: [] });
    }

    const values = await redis.mget<number[]>(...keys);
    
    const breakdown = keys.map((key, index) => {
      const views = Number(values[index]) || 0;
      return {
        slug: key.replace('pageviews:blog:', ''),
        views
      };
    });

    // Sort by most popular
    breakdown.sort((a, b) => b.views - a.views);

    return NextResponse.json({ totalViews: globalViews, breakdown });
  } catch (err) {
    console.error("Failed to fetch stats:", err);
    return NextResponse.json({ error: "Server error", totalViews: 0 }, { status: 500 });
  }
}
