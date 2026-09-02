import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_DURATION_SECONDS } from "@/lib/constants";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/** Checks the submitted credentials against the server-only admin env vars. */
export function verifyAdminCredentials(username: string, password: string) {
  const validUser = process.env.ADMIN_USERNAME;
  const validPass = process.env.ADMIN_PASSWORD;
  if (!validUser || !validPass) throw new Error("Admin credentials are not configured");
  return username === validUser && password === validPass;
}

/** Issues a signed, short-lived session token for the single admin "user". */
export async function createSessionToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Returns true if the token is a valid, unexpired admin session. */
export async function verifySessionToken(token: string | undefined) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.role === "admin";
  } catch {
    return false;
  }
}
