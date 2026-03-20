import { NextRequest, NextResponse } from "next/server";
import { getTotpSecret, verifyTotpToken, createSession } from "@/lib/admin";

export async function POST(req: NextRequest) {
  try {
    const { username, code } = await req.json();

    if (!username || !code) {
      return NextResponse.json({ error: "Missing username or code" }, { status: 400 });
    }

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    if (username !== expectedUsername) {
      return NextResponse.json({ error: "Invalid username" }, { status: 401 });
    }

    const secret = await getTotpSecret();
    
    if (!secret) {
      return NextResponse.json({ 
        error: "TOTP not configured", 
        needsSetup: true 
      }, { status: 403 });
    }

    const isValid = verifyTotpToken(secret, code.replace(/\s+/g, ""));

    if (!isValid) {
      return NextResponse.json({ error: "Invalid authenticator code" }, { status: 401 });
    }

    // Auth successful, create session cookie
    await createSession();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
