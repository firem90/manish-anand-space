import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import * as OTPAuth from "otpauth";

const SECRET_FILE = path.join(process.cwd(), "src/content/.admin-secret.json");

// JWT secret key - in production this should be an env var
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "fallback-secret-development-only-change-in-prod"
);

export async function getTotpSecret(): Promise<string | null> {
  if (process.env.ADMIN_TOTP_SECRET) {
    return process.env.ADMIN_TOTP_SECRET;
  }
  try {
    if (fs.existsSync(SECRET_FILE)) {
      const data = JSON.parse(fs.readFileSync(SECRET_FILE, "utf8"));
      return data.secret;
    }
  } catch (e) {
    console.error("Error reading TOTP secret", e);
  }
  return null;
}

export async function saveTotpSecret(secret: string): Promise<boolean> {
  try {
    const dir = path.dirname(SECRET_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SECRET_FILE, JSON.stringify({ secret }), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving TOTP secret", e);
    return false;
  }
}

export function verifyTotpToken(secretBase32: string, token: string): boolean {
  try {
    let totp = new OTPAuth.TOTP({
      issuer: "manish.dev",
      label: "Admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secretBase32),
    });

    // Validate with a window of 1 (allows 30s before/after)
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  } catch (e) {
    console.error("Error verifying TOTP", e);
    return false;
  }
}

export async function createSession() {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function verifySession() {
  if (process.env.DISABLE_ADMIN_AUTH === "true") {
    return true;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!session) return false;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET);
    return payload.admin === true;
  } catch (error) {
    return false;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}
