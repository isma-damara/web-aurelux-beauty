import { getMongoDb } from "./mongo-client.js";

const DEFAULT_ACTOR = "system@aurelux.local";

function getMediaCollectionName() {
  return process.env.MONGODB_MEDIA_COLLECTION || "media_assets";
}

function normalizeActor(actor) {
  if (typeof actor === "string" && actor.trim()) {
    return actor.trim();
  }
  return DEFAULT_ACTOR;
}

function normalizeMediaType(type) {
  if (type === "videos" || type === "video") {
    return "video";
  }
  return "image";
}

async function getCollection() {
  const db = await getMongoDb();
  return db.collection(getMediaCollectionName());
}

export async function upsertMediaAsset(media, options = {}) {
  if (!media?.url) {
    return null;
  }

  const collection = await getCollection();
  const now = new Date();
  const actor = normalizeActor(options?.actor);

  const payload = {
    type: normalizeMediaType(media?.type),
    url: media.url,
    mimeType: media?.mimeType || "",
    sizeBytes: Number.isFinite(media?.sizeBytes) ? media.sizeBytes : null,
    originalName: media?.originalName || "",
    usage: media?.usage || "generic",
    linkedEntity: media?.linkedEntity || null,
    isDeleted: false,
    updatedAt: now,
    updatedBy: actor
  };

  const update = {
    $set: payload,
    $setOnInsert: {
      createdAt: now,
      createdBy: actor
    }
  };

  if (media?.linkedEntity) {
    update.$addToSet = {
      linkedEntities: media.linkedEntity
    };
  }

  await collection.updateOne(
    { url: media.url },
    update,
    { upsert: true }
  );

  return payload;
}

export async function markMediaAssetDeleted(url, options = {}) {
  if (!url) {
    return false;
  }

  const collection = await getCollection();
  const actor = normalizeActor(options?.actor);
  const now = new Date();

  const result = await collection.updateOne(
    { url },
    {
      $set: {
        isDeleted: true,
        updatedAt: now,
        updatedBy: actor
      }
    }
  );

  return result.matchedCount > 0;
}

