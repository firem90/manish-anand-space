import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return NextResponse.json({ success: false });
  }
  
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    
    // Increment global view counter
    await redis.incr("pageviews:global");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false });
  }
}
