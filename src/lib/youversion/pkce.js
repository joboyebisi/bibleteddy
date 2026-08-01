import { createHash, randomBytes } from "crypto";

/**
 * Generate PKCE code_verifier (43–128 chars, URL-safe)
 */
export function generateCodeVerifier() {
  return randomBytes(32).toString("base64url");
}

/**
 * S256 code_challenge from code_verifier
 */
export function generateCodeChallenge(codeVerifier) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

/**
 * Random state/nonce for CSRF and replay protection
 */
export function generateRandomString(length = 32) {
  return randomBytes(length).toString("base64url");
}
