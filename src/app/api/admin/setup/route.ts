import { NextRequest, NextResponse } from "next/server";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { getTotpSecret, saveTotpSecret, verifyTotpToken, createSession } from "@/lib/admin";

export async function GET() {
  try {
    const existingSecret = await getTotpSecret();
    
    if (existingSecret) {
      return NextResponse.json({ alreadyConfigured: true });
    }

    // Generate a new secure secret using OTPAuth
    const secret = new OTPAuth.Secret({ size: 20 });
    const secretBase32 = secret.base32;

    const totp = new OTPAuth.TOTP({
      issuer: "manish.dev",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    const uri = totp.toString();
    const qrUrl = await QRCode.toDataURL(uri);

    return NextResponse.json({ 
      secret: secretBase32,
      qrUrl 
    });
  } catch (err) {
    console.error("Setup generation error:", err);
    return NextResponse.json({ error: "Failed to generate setup" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { secret, code } = await req.json();

    if (!secret || !code) {
      return NextResponse.json({ error: "Missing secret or code" }, { status: 400 });
    }

    // Verify the secret actually works before saving it
    const isValid = verifyTotpToken(secret, code.replace(/\s+/g, ""));

    if (!isValid) {
      return NextResponse.json({ error: "Invalid code. Try again." }, { status: 400 });
    }

    // If valid, save it to disk permanently
    const saved = await saveTotpSecret(secret);
    
    if (!saved) {
      return NextResponse.json({ error: "Failed to save secret to disk" }, { status: 500 });
    }

    // Also issue a session so they are logged in immediately
    await createSession();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Setup save error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
