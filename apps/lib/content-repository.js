import { isMongoConfigured } from "./mongo-client";
import {
  createProductInMongo,
  deleteProductInMongo,
  listProductsFromMongo,
  readContentFromMongo,
  readSettingsFromMongo,
  updateProductInMongo,
  updateSettingsInMongo,
  writeContentToMongo
} from "./mongo-content-store";
import { addActivityLog } from "./mongo-activity-log-store";
import { markMediaAssetDeleted, upsertMediaAsset } from "./mongo-media-asset-store";

function resolveContentStoreDriver() {
  const configured = (process.env.CONTENT_STORE_DRIVER || "mongo").toLowerCase();
  if (configured !== "mongo") {
    throw new Error("Aplikasi dikunci ke MongoDB. Set CONTENT_STORE_DRIVER=mongo.");
  }
  return "mongo";
}

function assertMongoReady() {
  if (!isMongoConfigured()) {
    throw new Error("CONTENT_STORE_DRIVER=mongo aktif, tetapi MONGODB_URI belum diset.");
  }
}

export function getContentStoreDriver() {
  return resolveContentStoreDriver();
}

export async function readContent() {
  resolveContentStoreDriver();
  assertMongoReady();
  return readContentFromMongo();
}

export async function writeContent(nextContent, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return writeContentToMongo(nextContent, options);
}

export async function updateContent(updater, options = {}) {
  const current = await readContent();
  const draft = JSON.parse(JSON.stringify(current));
  const updated = await updater(draft);
  return writeContent(updated ?? draft, options);
}

export async function listProducts() {
  resolveContentStoreDriver();
  assertMongoReady();
  return listProductsFromMongo();
}

export async function createProduct(payload, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return createProductInMongo(payload, options);
}

export async function updateProduct(productId, payload, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return updateProductInMongo(productId, payload, options);
}

export async function deleteProduct(productId) {
  resolveContentStoreDriver();
  assertMongoReady();
  return deleteProductInMongo(productId);
}

export async function readSettings() {
  resolveContentStoreDriver();
  assertMongoReady();
  return readSettingsFromMongo();
}

export async function updateSettings(partialSettings, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return updateSettingsInMongo(partialSettings, options);
}

export async function registerMediaAsset(mediaPayload, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return upsertMediaAsset(mediaPayload, options);
}

export async function removeMediaAsset(url, options = {}) {
  resolveContentStoreDriver();
  assertMongoReady();
  return markMediaAssetDeleted(url, options);
}

export async function appendActivityLog(logEntry = {}) {
  resolveContentStoreDriver();
  assertMongoReady();

  try {
    await addActivityLog(logEntry);
  } catch (_error) {
    // Logging must never block main transaction flow.
  }
}
