import { getMongoDb } from "./mongo-client";

const DEFAULT_ACTOR = "system@aurelux.local";

function getActivityCollectionName() {
  return process.env.MONGODB_ACTIVITY_COLLECTION || "activity_logs";
}

function normalizeActor(actor) {
  if (typeof actor === "string" && actor.trim()) {
    return actor.trim();
  }
  return DEFAULT_ACTOR;
}

async function getCollection() {
  const db = await getMongoDb();
  return db.collection(getActivityCollectionName());
}

export async function addActivityLog(entry = {}) {
  const collection = await getCollection();

  await collection.insertOne({
    actor: normalizeActor(entry.actor),
    action: entry.action || "unknown.action",
    target: entry.target || null,
    changes: entry.changes || null,
    metadata: entry.metadata || null,
    createdAt: new Date()
  });
}
