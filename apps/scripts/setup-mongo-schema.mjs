import { MongoClient } from "mongodb";
import { loadEnvFromLocalFile } from "./load-env.mjs";

await loadEnvFromLocalFile();

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

const mongoUri = getEnv("MONGODB_URI");
if (!mongoUri) {
  throw new Error("MONGODB_URI belum diset. Isi env terlebih dahulu.");
}

const dbName = getEnv("MONGODB_DB_NAME", "aurelux_beauty");
const productsCollectionName = getEnv("MONGODB_PRODUCTS_COLLECTION", "products");
const settingsCollectionName = getEnv("MONGODB_SETTINGS_COLLECTION", "site_settings");
const mediaCollectionName = getEnv("MONGODB_MEDIA_COLLECTION", "media_assets");
const activityCollectionName = getEnv("MONGODB_ACTIVITY_COLLECTION", "activity_logs");
const adminsCollectionName = getEnv("MONGODB_ADMINS_COLLECTION", "admins");

const validators = {
  [productsCollectionName]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["slug", "name", "fullName", "status", "updatedAt", "isDeleted"],
      properties: {
        slug: { bsonType: "string" },
        name: { bsonType: "string" },
        fullName: { bsonType: "string" },
        usp: { bsonType: "string" },
        description: { bsonType: "string" },
        usage: { bsonType: "string" },
        shortList: { bsonType: "array" },
        ingredients: { bsonType: "array" },
        media: { bsonType: "object" },
        status: { enum: ["draft", "published", "archived"] },
        sortOrder: { bsonType: ["int", "long", "double"] },
        isDeleted: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  [settingsCollectionName]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["hero", "about", "contact", "socials", "footer", "updatedAt"],
      properties: {
        hero: { bsonType: "object" },
        about: { bsonType: "object" },
        contact: { bsonType: "object" },
        socials: { bsonType: "object" },
        footer: { bsonType: "object" },
        schemaVersion: { bsonType: ["int", "long", "double"] },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  [mediaCollectionName]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "url", "updatedAt", "isDeleted"],
      properties: {
        type: { enum: ["image", "video"] },
        url: { bsonType: "string" },
        mimeType: { bsonType: "string" },
        sizeBytes: { bsonType: ["int", "long", "double", "null"] },
        originalName: { bsonType: "string" },
        usage: { bsonType: "string" },
        linkedEntity: { bsonType: ["object", "null"] },
        linkedEntities: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["collection", "id"],
            properties: {
              collection: { bsonType: "string" },
              id: { bsonType: "string" }
            }
          }
        },
        isDeleted: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  },
  [activityCollectionName]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["actor", "action", "createdAt"],
      properties: {
        actor: { bsonType: "string" },
        action: { bsonType: "string" },
        target: { bsonType: ["object", "null"] },
        changes: { bsonType: ["object", "null"] },
        metadata: { bsonType: ["object", "null"] },
        createdAt: { bsonType: "date" }
      }
    }
  },
  [adminsCollectionName]: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "role", "passwordHash", "isActive", "updatedAt"],
      properties: {
        email: { bsonType: "string" },
        role: { enum: ["admin"] },
        passwordHash: { bsonType: "string" },
        isActive: { bsonType: "bool" },
        lastLoginAt: { bsonType: ["date", "null"] },
        createdAt: { bsonType: "date" },
        createdBy: { bsonType: "string" },
        updatedAt: { bsonType: "date" },
        updatedBy: { bsonType: "string" }
      }
    }
  }
};

async function ensureCollection(db, collectionName, validator) {
  const exists = await db.listCollections({ name: collectionName }, { nameOnly: true }).toArray();

  if (exists.length === 0) {
    await db.createCollection(collectionName, {
      validator,
      validationLevel: "moderate"
    });
    return "created";
  }

  await db.command({
    collMod: collectionName,
    validator,
    validationLevel: "moderate"
  });
  return "updated";
}

async function createIndexes(db) {
  await db.collection(productsCollectionName).createIndexes([
    { key: { slug: 1 }, name: "uniq_slug", unique: true },
    { key: { status: 1, sortOrder: 1 }, name: "status_sort_order" },
    { key: { isDeleted: 1, updatedAt: -1 }, name: "deleted_updated" }
  ]);

  await db.collection(mediaCollectionName).createIndexes([
    { key: { url: 1 }, name: "uniq_url", unique: true },
    { key: { "linkedEntity.collection": 1, "linkedEntity.id": 1 }, name: "linked_entity_idx" },
    { key: { "linkedEntities.collection": 1, "linkedEntities.id": 1 }, name: "linked_entities_idx" },
    { key: { isDeleted: 1, updatedAt: -1 }, name: "media_deleted_updated" }
  ]);

  await db.collection(activityCollectionName).createIndexes([
    { key: { "target.collection": 1, "target.id": 1, createdAt: -1 }, name: "target_createdAt" },
    { key: { actor: 1, createdAt: -1 }, name: "actor_createdAt" }
  ]);

  await db.collection(adminsCollectionName).createIndexes([
    { key: { email: 1 }, name: "uniq_email", unique: true },
    { key: { role: 1, isActive: 1 }, name: "role_active" }
  ]);
}

async function main() {
  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);

    for (const [collectionName, validator] of Object.entries(validators)) {
      const action = await ensureCollection(db, collectionName, validator);
      console.log(`[schema] ${collectionName}: ${action}`);
    }

    await createIndexes(db);
    console.log("[schema] indexes ensured");
    console.log("[schema] done");
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("[schema] failed:", error.message);
  process.exit(1);
});
