import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { appendActivityLog, registerMediaAsset } from "../../../../../lib/content-repository";
import { resolveAdminActor } from "../../../../../lib/admin-auth";
import { requireAdminSession } from "../../../../../lib/admin-route-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 25 * 1024 * 1024;
const LOCAL_MEDIA_DRIVER = "local";
const BLOB_MEDIA_DRIVER = "blob";
const DEFAULT_UPLOAD_FOLDER = "aurelux-beauty";
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime"
];

function resolveMediaStorageDriver() {
  const configured = (process.env.MEDIA_STORAGE_DRIVER || LOCAL_MEDIA_DRIVER).toLowerCase();
  if (configured === BLOB_MEDIA_DRIVER) {
    return BLOB_MEDIA_DRIVER;
  }
  return LOCAL_MEDIA_DRIVER;
}

function resolveUploadType(mimeType) {
  if (typeof mimeType !== "string") {
    return null;
  }

  if (mimeType.startsWith("image/")) {
    return "images";
  }

  if (mimeType.startsWith("video/")) {
    return "videos";
  }

  return null;
}

function resolveBlobUploadFolder() {
  const configured = (process.env.BLOB_UPLOAD_FOLDER || DEFAULT_UPLOAD_FOLDER).trim();
  const normalized = configured.replace(/^\/+/, "").replace(/\/+$/, "");
  return normalized || DEFAULT_UPLOAD_FOLDER;
}

function isAllowedBlobPathname(pathname) {
  if (typeof pathname !== "string" || !pathname.trim()) {
    return false;
  }

  const folder = resolveBlobUploadFolder();
  return pathname.startsWith(`${folder}/images/`) || pathname.startsWith(`${folder}/videos/`);
}

function parseClientPayload(clientPayload) {
  if (!clientPayload) {
    return {};
  }

  if (typeof clientPayload === "string") {
    try {
      return JSON.parse(clientPayload);
    } catch (_error) {
      return {};
    }
  }

  if (typeof clientPayload === "object") {
    return clientPayload;
  }

  return {};
}

function parseTokenPayload(tokenPayload) {
  if (typeof tokenPayload !== "string") {
    return {};
  }

  try {
    const parsed = JSON.parse(tokenPayload);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (_error) {
    return {};
  }

  return {};
}

function normalizeUsage(value) {
  if (typeof value !== "string") {
    return "generic";
  }

  const trimmed = value.trim();
  return trimmed || "generic";
}

function normalizeActor(value) {
  if (typeof value !== "string") {
    return "system@aurelux.local";
  }

  const trimmed = value.trim();
  return trimmed || "system@aurelux.local";
}

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch (_error) {
    return NextResponse.json({ message: "Payload upload tidak valid." }, { status: 400 });
  }

  let actorFromSession = "";

  if (body?.type === "blob.generate-client-token") {
    const { session, unauthorizedResponse } = await requireAdminSession(request);
    if (unauthorizedResponse) {
      return unauthorizedResponse;
    }

    actorFromSession = resolveAdminActor(request, session);
  }

  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (resolveMediaStorageDriver() !== BLOB_MEDIA_DRIVER) {
          throw new Error("MEDIA_STORAGE_DRIVER harus bernilai blob.");
        }

        if (!actorFromSession) {
          throw new Error("Unauthorized");
        }

        if (!isAllowedBlobPathname(pathname)) {
          throw new Error("Path upload tidak valid.");
        }

        const parsedPayload = parseClientPayload(clientPayload);

        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_SIZE,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            actor: actorFromSession,
            usage: normalizeUsage(parsedPayload?.usage),
            originalName: typeof parsedPayload?.originalName === "string" ? parsedPayload.originalName : ""
          })
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsedPayload = parseTokenPayload(tokenPayload);
        const actor = normalizeActor(parsedPayload?.actor);
        const mediaType = resolveUploadType(blob?.contentType);

        if (!blob?.url || !mediaType) {
          throw new Error("Tipe media upload tidak didukung.");
        }

        await registerMediaAsset(
          {
            url: blob.url,
            type: mediaType,
            originalName: parsedPayload?.originalName || "",
            mimeType: blob.contentType || "",
            sizeBytes: typeof blob.size === "number" ? blob.size : null,
            usage: normalizeUsage(parsedPayload?.usage)
          },
          { actor }
        );

        await appendActivityLog({
          actor,
          action: "media.upload",
          target: { collection: "media_assets", id: blob.url },
          metadata: { type: mediaType, url: blob.url }
        });
      }
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error?.message || "Gagal memproses upload media.";
    const status = /unauthorized/i.test(message) ? 401 : /valid|blob|path|tipe/i.test(message) ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
