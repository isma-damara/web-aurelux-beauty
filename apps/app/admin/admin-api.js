import { upload } from "@vercel/blob/client";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const LOCAL_MEDIA_DRIVER = "local";
const BLOB_MEDIA_DRIVER = "blob";
const DEFAULT_BLOB_UPLOAD_FOLDER = "aurelux-beauty";

function sanitizeBaseName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extensionFromName(fileName) {
  const match = String(fileName || "").toLowerCase().match(/\.[a-z0-9]+$/);
  return match?.[0] || "";
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
  if (typeof mimeType === "string" && mimeType.startsWith("image/")) {
    return "images";
  }

  if (typeof mimeType === "string" && mimeType.startsWith("video/")) {
    return "videos";
  }

  return null;
}

function resolveClientMediaStorageDriver() {
  const configured = (process.env.NEXT_PUBLIC_MEDIA_STORAGE_DRIVER || LOCAL_MEDIA_DRIVER).toLowerCase();
  if (configured === BLOB_MEDIA_DRIVER) {
    return BLOB_MEDIA_DRIVER;
  }
  return LOCAL_MEDIA_DRIVER;
}

function resolveBlobUploadFolder() {
  const configured = (process.env.NEXT_PUBLIC_BLOB_UPLOAD_FOLDER || DEFAULT_BLOB_UPLOAD_FOLDER).trim();
  const normalized = configured.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalized || DEFAULT_BLOB_UPLOAD_FOLDER;
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    cache: "no-store"
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401 && typeof window !== "undefined") {
    const nextPath = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.href = `/admin/login?next=${nextPath}`;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Permintaan gagal.");
  }

  return data;
}

export function fetchContent() {
  return requestJson("/api/admin/content");
}

export function fetchProducts() {
  return requestJson("/api/admin/products");
}

export function createProduct(payload) {
  return requestJson("/api/admin/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function updateProduct(productId, payload) {
  return requestJson(`/api/admin/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function removeProduct(productId) {
  return requestJson(`/api/admin/products/${productId}`, {
    method: "DELETE"
  });
}

export function updateSettings(payload) {
  return requestJson("/api/admin/settings", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

async function uploadMediaToBlob(file) {
  const uploadType = resolveUploadType(file?.type);
  if (!uploadType) {
    throw new Error("Hanya file gambar atau video yang diizinkan.");
  }

  const ext = extensionFromName(file?.name) || extensionFromMime(file?.type);
  if (!ext) {
    throw new Error("Ekstensi file tidak didukung.");
  }

  const safeName = sanitizeBaseName(String(file?.name || "").replace(/\.[^.]+$/, "")) || "media";
  const pathname = `${resolveBlobUploadFolder()}/${uploadType}/${Date.now()}-${Math.floor(Math.random() * 1e6)}-${safeName}${ext}`;

  const uploaded = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/admin/media/upload",
    clientPayload: JSON.stringify({
      usage: "generic",
      originalName: file?.name || ""
    })
  });

  return {
    url: uploaded.url,
    type: uploadType,
    originalName: file?.name || "",
    mimeType: file?.type || "",
    sizeBytes: typeof file?.size === "number" ? file.size : null
  };
}

export async function uploadMedia(file) {
  if (!file) {
    throw new Error("File tidak ditemukan.");
  }

  if (typeof file.size === "number" && file.size > MAX_UPLOAD_SIZE) {
    throw new Error("Ukuran file melebihi batas 25MB.");
  }

  if (resolveClientMediaStorageDriver() === BLOB_MEDIA_DRIVER) {
    return uploadMediaToBlob(file);
  }

  const formData = new FormData();
  formData.append("file", file);

  return requestJson("/api/admin/media", {
    method: "POST",
    body: formData
  });
}

export function removeMedia(url) {
  return requestJson("/api/admin/media", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });
}
