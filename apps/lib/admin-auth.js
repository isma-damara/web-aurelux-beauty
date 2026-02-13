const ADMIN_ROLE = "admin";
const ADMIN_SESSION_COOKIE = "aurelux_admin_session";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return "";
  }
  return email.trim().toLowerCase();
}

function getAdminSessionSecret() {
  const configuredSecret = getEnv("ADMIN_SESSION_SECRET", "");
  if (configuredSecret) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_SESSION_SECRET belum diset.");
  }

  return "dev-admin-session-secret-change-me";
}

function toBase64(binaryString) {
  if (typeof btoa === "function") {
    return btoa(binaryString);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(binaryString, "binary").toString("base64");
  }

  throw new Error("Base64 encoder tidak tersedia.");
}

function fromBase64(base64String) {
  if (typeof atob === "function") {
    return atob(base64String);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64String, "base64").toString("binary");
  }

  throw new Error("Base64 decoder tidak tersedia.");
}

function bytesToBinary(bytes) {
  let result = "";
  for (const byte of bytes) {
    result += String.fromCharCode(byte);
  }
  return result;
}

function binaryToBytes(binary) {
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toBase64UrlFromBytes(bytes) {
  return toBase64(bytesToBinary(bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function toBase64UrlFromString(value) {
  const encoder = new TextEncoder();
  return toBase64UrlFromBytes(encoder.encode(value));
}

function fromBase64UrlToString(value) {
  const normalized = `${value}`.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = fromBase64(padded);
  const decoder = new TextDecoder();
  return decoder.decode(binaryToBytes(binary));
}

async function signValue(value, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64UrlFromBytes(new Uint8Array(signature));
}

function parseCookie(cookieHeader, cookieName) {
  if (typeof cookieHeader !== "string" || !cookieHeader) {
    return "";
  }

  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rawValue] = part.split("=");
    const name = rawName?.trim();
    if (name !== cookieName) {
      continue;
    }
    return decodeURIComponent(rawValue.join("=").trim());
  }

  return "";
}

export async function createAdminSessionToken(user, options = {}) {
  const email = normalizeEmail(user?.email);
  if (!email) {
    throw new Error("Email admin tidak valid.");
  }

  const role = user?.role || ADMIN_ROLE;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const maxAgeSeconds = Number.isFinite(options?.maxAgeSeconds)
    ? Math.max(60, Math.floor(options.maxAgeSeconds))
    : DEFAULT_SESSION_MAX_AGE_SECONDS;

  const payload = {
    email,
    role,
    iat: nowInSeconds,
    exp: nowInSeconds + maxAgeSeconds
  };

  const encodedPayload = toBase64UrlFromString(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, getAdminSessionSecret());
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token) {
  if (typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = await signValue(encodedPayload, getAdminSessionSecret());
  if (providedSignature !== expectedSignature) {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64UrlToString(encodedPayload));
  } catch (_error) {
    return null;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const email = normalizeEmail(payload?.email);
  const role = payload?.role;
  const exp = Number(payload?.exp || 0);

  if (!email || role !== ADMIN_ROLE || !Number.isFinite(exp) || exp <= nowInSeconds) {
    return null;
  }

  return {
    email,
    role,
    exp
  };
}

export async function readAdminSessionFromRequest(request) {
  const cookieHeader = request?.headers?.get?.("cookie") || "";
  const token = parseCookie(cookieHeader, ADMIN_SESSION_COOKIE);

  if (!token) {
    return null;
  }

  return verifyAdminSessionToken(token);
}

export function buildAdminSessionCookie(token, options = {}) {
  const maxAge = Number.isFinite(options?.maxAgeSeconds)
    ? Math.max(60, Math.floor(options.maxAgeSeconds))
    : DEFAULT_SESSION_MAX_AGE_SECONDS;

  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge
  };
}

export function clearAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  };
}

export function resolveAdminActor(request, session) {
  const headerActor = request?.headers?.get?.("x-admin-user");
  if (typeof headerActor === "string" && headerActor.trim()) {
    return headerActor.trim();
  }

  return session?.email || "admin@aurelux.local";
}

export function normalizeAdminNextPath(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.startsWith("/")) {
    return "/admin/products";
  }

  if (!rawPath.startsWith("/admin")) {
    return "/admin/products";
  }

  if (rawPath.startsWith("/admin/login")) {
    return "/admin/products";
  }

  return rawPath;
}

export { ADMIN_ROLE, ADMIN_SESSION_COOKIE, DEFAULT_SESSION_MAX_AGE_SECONDS };
