/**
 * Single source of truth for the backend API base URL.
 *
 * `NEXT_PUBLIC_API_URL` is inlined into the bundle at build time. We fall back
 * to localhost so local development works with no env file, while a deployed
 * build (with the env var set) points at the real backend automatically.
 *
 * Import this everywhere instead of reading `process.env.NEXT_PUBLIC_API_URL`
 * directly — that's how the base URL drifted (some call sites had a fallback,
 * others sent requests to `undefined/...`).
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
