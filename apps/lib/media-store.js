import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { resolvePublicDirectoryPath } from "./content-store.js";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const LOCAL_MEDIA_DRIVER = "local";
const CLOUDINARY_MEDIA_DRIVER = "cloudinary";

function resolveMediaStorageDriver() {
  const configured = (process.env.MEDIA_STORAGE_DRIVER || LOCAL_MEDIA_DRIVER).toLowerCase();
  if (configured === CLOUDINARY_MEDIA_DRIVER) {
    return CLOUDINARY_MEDIA_DRIVER;
  }
  return LOCAL_MEDIA_DRIVER;
}

function assertUploadWritableRuntime() {
  if (process.env.VERCEL === "1") {
    throw new Error(
      "Upload filesystem tidak persisten di Vercel. Set MEDIA_STORAGE_DRIVER=cloudinary dan isi CLOUDINARY_* env."
    );
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isCloudinaryManagedUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return false;
  }

  return new RegExp(`^https://res\\.cloudinary\\.com/${escapeRegExp(cloudName)}/`).test(url);
}

export function isManagedUploadUrl(url) {
  return isLocalManagedUploadUrl(url) || isCloudinaryManagedUrl(url);
}

function resolveCloudinaryConfig() {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();
  const folderPrefix = (process.env.CLOUDINARY_UPLOAD_FOLDER || "aurelux-beauty").trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Konfigurasi Cloudinary belum lengkap. Isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folderPrefix: folderPrefix || "aurelux-beauty"
  };
}

function buildCloudinarySignature(params, apiSecret) {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

function resolveCloudinaryResourceType(uploadType) {
  return uploadType === "videos" ? "video" : "image";
}

async function saveUploadedFileToCloudinary(file, uploadType) {
  const { cloudName, apiKey, apiSecret, folderPrefix } = resolveCloudinaryConfig();
  const ext = extensionFromName(file.name) || extensionFromMime(file.type);
  if (!ext) {
    throw new Error("Ekstensi file tidak didukung.");
  }

  const safeName = sanitizeBaseName(path.basename(file.name, ext)) || "media";
  const publicId = `${folderPrefix}/${uploadType}/${Date.now()}-${Math.floor(Math.random() * 1e6)}-${safeName}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildCloudinarySignature(
    {
      public_id: publicId,
      timestamp
    },
    apiSecret
  );

  const resourceType = resolveCloudinaryResourceType(uploadType);
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const formData = new FormData();
  formData.set("public_id", publicId);
  formData.set("api_key", apiKey);
  formData.set("timestamp", String(timestamp));
  formData.set("signature", signature);
  formData.set("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.secure_url) {
    throw new Error(result?.error?.message || "Upload ke Cloudinary gagal.");
  }

  return {
    url: result.secure_url,
    type: result.resource_type === "video" ? "videos" : "images",
    originalName: file.name || "",
    mimeType: file.type || "",
    sizeBytes: typeof result.bytes === "number" ? result.bytes : typeof file.size === "number" ? file.size : null
  };
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

function resolveCloudinaryResourceTypeFromUrl(url) {
  if (typeof url !== "string") {
    return "image";
  }
  if (/\/video\/upload\//.test(url)) {
    return "video";
  }
  return "image";
}

function extractCloudinaryPublicId(url, cloudName) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") {
      return "";
    }

    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    if (pathSegments[0] !== cloudName) {
      return "";
    }

    const uploadIndex = pathSegments.indexOf("upload");
    if (uploadIndex < 0 || uploadIndex === pathSegments.length - 1) {
      return "";
    }

    const afterUpload = pathSegments.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((segment) => /^v\d+$/.test(segment));
    const publicIdSegments = (versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload).filter(Boolean);
    if (publicIdSegments.length === 0) {
      return "";
    }

    const last = publicIdSegments[publicIdSegments.length - 1];
    publicIdSegments[publicIdSegments.length - 1] = last.replace(/\.[^.]+$/, "");
    return publicIdSegments.join("/");
  } catch (_error) {
    return "";
  }
}

async function deleteCloudinaryUpload(url) {
  const { cloudName, apiKey, apiSecret } = resolveCloudinaryConfig();
  const publicId = extractCloudinaryPublicId(url, cloudName);
  if (!publicId) {
    return false;
  }

  const resourceType = resolveCloudinaryResourceTypeFromUrl(url);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildCloudinarySignature(
    {
      public_id: publicId,
      timestamp
    },
    apiSecret
  );

  const destroyUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
  const payload = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature,
    invalidate: "true"
  });

  const response = await fetch(destroyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: payload
  });

  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(result?.error?.message || "Gagal menghapus media di Cloudinary.");
  }

  return result?.result === "ok" || result?.result === "not found";
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

  if (resolveMediaStorageDriver() === CLOUDINARY_MEDIA_DRIVER) {
    return saveUploadedFileToCloudinary(file, uploadType);
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

export async function deleteManagedUpload(url) {
  if (!isManagedUploadUrl(url)) {
    return false;
  }

  if (isLocalManagedUploadUrl(url)) {
    return deleteLocalManagedUpload(url);
  }

  if (isCloudinaryManagedUrl(url)) {
    return deleteCloudinaryUpload(url);
  }

  return false;
}
