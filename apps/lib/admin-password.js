import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const HASH_ALGORITHM = "scrypt";
const HASH_KEY_LENGTH = 64;
const HASH_SALT_BYTES = 16;
const HASH_N = 16384;
const HASH_R = 8;
const HASH_P = 1;

function normalizePassword(password) {
  if (typeof password !== "string") {
    return "";
  }
  return password;
}

function toHex(buffer) {
  return Buffer.from(buffer).toString("hex");
}

function fromHex(value) {
  return Buffer.from(value, "hex");
}

function buildHashPayload({ saltHex, keyHex }) {
  return `${HASH_ALGORITHM}$${HASH_N}$${HASH_R}$${HASH_P}$${saltHex}$${keyHex}`;
}

function parseHashPayload(value) {
  if (typeof value !== "string") {
    return null;
  }

  const [algorithm, nRaw, rRaw, pRaw, saltHex, keyHex] = value.split("$");
  if (!algorithm || !nRaw || !rRaw || !pRaw || !saltHex || !keyHex) {
    return null;
  }

  if (algorithm !== HASH_ALGORITHM) {
    return null;
  }

  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return null;
  }

  return {
    n,
    r,
    p,
    saltHex,
    keyHex
  };
}

export function createPasswordHash(rawPassword) {
  const password = normalizePassword(rawPassword);
  if (!password) {
    throw new Error("Password admin wajib diisi.");
  }

  const salt = randomBytes(HASH_SALT_BYTES);
  const derivedKey = scryptSync(password, salt, HASH_KEY_LENGTH, {
    N: HASH_N,
    r: HASH_R,
    p: HASH_P
  });

  return buildHashPayload({
    saltHex: toHex(salt),
    keyHex: toHex(derivedKey)
  });
}

export function verifyPasswordHash(rawPassword, storedHash) {
  const password = normalizePassword(rawPassword);
  if (!password) {
    return false;
  }

  const parsed = parseHashPayload(storedHash);
  if (!parsed) {
    return false;
  }

  const salt = fromHex(parsed.saltHex);
  const expectedKey = fromHex(parsed.keyHex);
  const actualKey = scryptSync(password, salt, expectedKey.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p
  });

  if (expectedKey.length !== actualKey.length) {
    return false;
  }

  return timingSafeEqual(expectedKey, actualKey);
}
