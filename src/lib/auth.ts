import { createHash, createPublicKey, verify as cryptoVerify } from "crypto";
import { db } from "@/db";
import { admins, type Admin } from "@/db/schema";
import { eq } from "drizzle-orm";

export function hashPassword(pw: string): string {
  return createHash("sha256").update(pw).digest("hex");
}

export function newSessionToken(): string {
  const bytes = Buffer.from(
    require("crypto").randomBytes(24).toString("hex") + Date.now().toString(36),
    "hex"
  ).toString("base64url");
  return `adm-${bytes}`;
}

export function publicProfile(a: Admin) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    permissions: a.permissions,
  };
}

export async function getAdminForRequest(req: Request): Promise<Admin | null> {
  const token = req.headers.get("x-admin-token");
  if (!token) return null;
  try {
    const rows = await db
      .select()
      .from(admins)
      .where(eq(admins.sessionToken, token));
    const a = rows[0];
    if (!a || !a.active) return null;
    return a;
  } catch {
    return null;
  }
}

/** Verify a Google ID token (RS256) against Google's JWKS. Returns identity or null. */
export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string
): Promise<{ email: string; name?: string; picture?: string } | null> {
  try {
    if (!clientId) return null;
    const parts = idToken.split(".");
    if (parts.length !== 3) return null;
    const header = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8")
    );
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8")
    );
    if (!payload?.email || payload.aud !== clientId) return null;
    const exp = Number(payload.exp ?? 0);
    if (exp && exp * 1000 < Date.now()) return null;

    const jwks = await (
      await fetch("https://www.googleapis.com/oauth2/v3/certs", {
        cache: "no-store",
      })
    ).json();
    const key = (jwks.keys ?? []).find((k: { kid?: string }) => k.kid === header.kid) ?? jwks.keys[0];
    if (!key) return null;
    const pub = createPublicKey({
      key: { kty: key.kty, n: key.n, e: key.e },
      format: "jwk",
    });
    const valid = cryptoVerify(
      "RSA-SHA256",
      Buffer.from(`${parts[0]}.${parts[1]}`, "utf8"),
      pub,
      Buffer.from(parts[2], "base64url")
    );
    if (!valid) return null;
    return {
      email: String(payload.email).toLowerCase(),
      name: payload.name ? String(payload.name) : undefined,
      picture: payload.picture ? String(payload.picture) : undefined,
    };
  } catch {
    return null;
  }
}

export async function issueSession(adminId: number): Promise<string> {
  const token = newSessionToken();
  await db.update(admins).set({ sessionToken: token }).where(eq(admins.id, adminId));
  return token;
}

export async function getAdminByEmail(email: string) {
  const rows = await db
    .select()
    .from(admins)
    .where(eq(admins.email, String(email).trim().toLowerCase()));
  return rows[0] ?? null;
}
