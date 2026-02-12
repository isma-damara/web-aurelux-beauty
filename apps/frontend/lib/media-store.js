import { promises as fs } from "fs";
import path from "path";
import { resolvePublicDirectoryPath } from "./content-store";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;

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

export function isManagedUploadUrl(url) {
  return typeof url === "string" && /^\/uploads\/(images|videos)\//.test(url);
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

  const ext = extensionFromName(file.name) || extensionFromMime(file.type);
  if (!ext) {
    throw new Error("Ekstensi file tidak didukung.");
  }

  const safeName = sanitizeBaseName(path.basename(file.name, ext)) || "media";
  const fileName = `${Date.now()}-${Math.floor(Math.random() * 1e6)}-${safeName}${ext}`;
  const publicDir = resolvePublicDirectoryPath();
  const uploadDir = path.join(publicDir, "uploads", uploadType);
  const absolutePath = path.join(uploadDir, fileName);

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

export async function deleteManagedUpload(url) {
  if (!isManagedUploadUrl(url)) {
    return false;
  }

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
