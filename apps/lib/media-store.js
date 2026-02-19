import { del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { resolvePublicDirectoryPath } from "./content-store.js";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const LOCAL_MEDIA_DRIVER = "local";
const BLOB_MEDIA_DRIVER = "blob";
const BLOB_PUBLIC_HOST_PATTERN = /^https:\/\/[^/]+\.public\.blob\.vercel-storage\.com\//i;

function resolveMediaStorageDriver() {
  const configured = (process.env.MEDIA_STORAGE_DRIVER || LOCAL_MEDIA_DRIVER).toLowerCase();
  if (configured === BLOB_MEDIA_DRIVER) {
    return BLOB_MEDIA_DRIVER;
  }
  return LOCAL_MEDIA_DRIVER;
}

function normalizeOptionalUrlBase(value) {
  if (typeof value !== "string") {
    return "";
  }

  const raw = value.trim();
  if (!raw) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/+/, "")}`;

  try {
    const parsed = new URL(withProtocol);
    return `${parsed.protocol}//${parsed.host}`;
  } catch (_error) {
    return "";
  }
}

function resolveBlobReadWriteToken() {
  const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
  if (!token) {
    throw new Error("Konfigurasi Vercel Blob belum lengkap. Isi BLOB_READ_WRITE_TOKEN.");
  }
  return token;
}

function assertUploadWritableRuntime() {
  if (process.env.VERCEL === "1") {
    throw new Error("Upload filesystem tidak persisten di Vercel. Gunakan MEDIA_STORAGE_DRIVER=blob.");
  }
}

function sanitizeBaseName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extensionFromName(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  return ext || "";
}

function extensionFromMime(mimeType) {
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
    "video/quicktime": ".mov"
  };

  return map[mimeType] ?? "";
}

function resolveUploadType(mimeType) {
  if (mimeType?.startsWith("image/")) {
    return "images";
  }
  if (mimeType?.startsWith("video/")) {
    return "videos";
  }
  return null;
}

function isLocalManagedUploadUrl(url) {
  return typeof url === "string" && /^\/uploads\/(images|videos)\//.test(url);
}

function isBlobManagedUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  const blobPublicBaseUrl = normalizeOptionalUrlBase(process.env.BLOB_PUBLIC_BASE_URL);
  if (blobPublicBaseUrl) {
    return url === blobPublicBaseUrl || url.startsWith(`${blobPublicBaseUrl}/`);
  }

  return BLOB_PUBLIC_HOST_PATTERN.test(url);
}

export function isManagedUploadUrl(url) {
  return isLocalManagedUploadUrl(url) || isBlobManagedUrl(url);
}

async function saveUploadedFileToLocal(file, uploadType) {
  const ext = extensionFromName(file.name) || extensionFromMime(file.type);
  if (!ext) {
    throw new Error("Ekstensi file tidak didukung.");
  }

  const safeName = sanitizeBaseName(path.basename(file.name, ext)) || "media";
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1e6)}-${safeName}${ext}`;
  const publicDir = resolvePublicDirectoryPath();
  const uploadDir = path.join(publicDir, "uploads", uploadType);
  const absolutePath = path.join(uploadDir, fileName);

  assertUploadWritableRuntime();
  await fs.mkdir(uploadDir, { recursive: true });
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(absolutePath, Buffer.from(arrayBuffer));

  return {
    url: `/uploads/${uploadType}/${fileName}`,
    type: uploadType,
    originalName: file.name || "",
    mimeType: file.type || "",
    sizeBytes: typeof file.size === "number" ? file.size : null
  };
}

export async function saveUploadedFile(file) {
  if (!file) {
    throw new Error("File tidak ditemukan.");
  }

  const uploadType = resolveUploadType(file.type);
  if (!uploadType) {
    throw new Error("Hanya file gambar atau video yang diizinkan.");
  }

  if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Ukuran file melebihi batas 25MB.");
  }

  if (resolveMediaStorageDriver() === BLOB_MEDIA_DRIVER) {
    throw new Error("Upload file via API lokal tidak aktif saat MEDIA_STORAGE_DRIVER=blob. Gunakan upload langsung ke Vercel Blob.");
  }

  return saveUploadedFileToLocal(file, uploadType);
}

async function deleteLocalManagedUpload(url) {
  const publicDir = resolvePublicDirectoryPath();
  const uploadsRoot = path.resolve(path.join(publicDir, "uploads"));
  const targetPath = path.resolve(path.join(publicDir, url.replace(/^\//, "")));

  if (!targetPath.startsWith(uploadsRoot)) {
    return false;
  }

  try {
    await fs.unlink(targetPath);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function deleteBlobManagedUpload(url) {
  const token = resolveBlobReadWriteToken();

  try {
    await del(url, { token });
    return true;
  } catch (error) {
    if (/not found/i.test(error?.message || "")) {
      return false;
    }
    throw error;
  }
}

export async function deleteManagedUpload(url) {
  if (!isManagedUploadUrl(url)) {
    return false;
  }

  if (isLocalManagedUploadUrl(url)) {
    return deleteLocalManagedUpload(url);
  }

  if (isBlobManagedUrl(url)) {
    return deleteBlobManagedUpload(url);
  }

  return false;
}
