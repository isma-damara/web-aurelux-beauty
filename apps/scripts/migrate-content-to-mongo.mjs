import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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

const scriptFilePath = fileURLToPath(import.meta.url);
const scriptDirectory = path.dirname(scriptFilePath);
const contentFilePath = path.resolve(scriptDirectory, "..", "data", "site-content.json");

function toArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item) => typeof item === "string" && item.trim());
}

function toDetailImageUrls(product) {
  const fromArray = toArray(product?.detailImages);
  const legacy = typeof product?.detailImage === "string" ? product.detailImage.trim() : "";
  const cardImage = typeof product?.cardImage === "string" ? product.cardImage.trim() : "";
  const merged = [...fromArray];

  if (legacy) {
    merged.push(legacy);
  }

  const unique = [...new Set(merged.filter(Boolean))].slice(0, 5);
  if (unique.length > 0) {
    return unique;
  }

  if (cardImage) {
    return [cardImage];
  }

  return [];
}

function mapProductDoc(product, index, now) {
  const id = typeof product?.id === "string" && product.id.trim() ? product.id.trim() : `product-${index + 1}`;
  const detailImageUrls = toDetailImageUrls(product);

  return {
    _id: id,
    slug: id,
    name: product?.name || "",
    fullName: product?.fullName || product?.name || "",
    usp: product?.usp || "",
    description: product?.description || "",
    usage: product?.usage || "",
    shortList: toArray(product?.shortList),
    ingredients: toArray(product?.ingredients),
    media: {
      cardImageUrl: product?.cardImage || "",
      detailImageUrl: detailImageUrls[0] || product?.cardImage || "",
      detailImageUrls
    },
    status: "published",
    sortOrder: (index + 1) * 10,
    createdAt: now,
    createdBy: "migration-script",
    updatedAt: now,
    updatedBy: "migration-script",
    isDeleted: false
  };
}

async function main() {
  const mongoUri = getEnv("MONGODB_URI");
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diset. Isi env terlebih dahulu sebelum migrasi.");
  }

  const dbName = getEnv("MONGODB_DB_NAME", "aurelux_beauty");
  const productsCollectionName = getEnv("MONGODB_PRODUCTS_COLLECTION", "products");
  const settingsCollectionName = getEnv("MONGODB_SETTINGS_COLLECTION", "site_settings");
  const settingsDocumentId = getEnv("MONGODB_SETTINGS_DOCUMENT_ID", "main");

  console.log("[migrate] Reading local content from:", contentFilePath);
  const raw = await readFile(contentFilePath, "utf8");
  const localContent = JSON.parse(raw);

  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const products = db.collection(productsCollectionName);
    const settings = db.collection(settingsCollectionName);
    const now = new Date();

    const localProducts = Array.isArray(localContent?.products) ? localContent.products : [];
    const productDocs = localProducts.map((product, index) => mapProductDoc(product, index, now));

    const existing = await products.find({}, { projection: { _id: 1 } }).toArray();
    const existingIds = new Set(existing.map((item) => item._id));
    const nextIds = new Set(productDocs.map((item) => item._id));

    if (productDocs.length > 0) {
      const operations = productDocs.map((doc) => ({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              slug: doc.slug,
              name: doc.name,
              fullName: doc.fullName,
              usp: doc.usp,
              description: doc.description,
              usage: doc.usage,
              shortList: doc.shortList,
              ingredients: doc.ingredients,
              media: doc.media,
              status: doc.status,
              sortOrder: doc.sortOrder,
              updatedAt: now,
              updatedBy: "migration-script",
              isDeleted: false
            },
            $setOnInsert: {
              createdAt: now,
              createdBy: "migration-script"
            }
          },
          upsert: true
        }
      }));

      await products.bulkWrite(operations, { ordered: false });
    }

    const idsToArchive = [...existingIds].filter((id) => !nextIds.has(id));
    if (idsToArchive.length > 0) {
      await products.updateMany(
        { _id: { $in: idsToArchive } },
        {
          $set: {
            isDeleted: true,
            status: "archived",
            updatedAt: now,
            updatedBy: "migration-script"
          }
        }
      );
    }

    await settings.updateOne(
      { _id: settingsDocumentId },
      {
        $set: {
          hero: localContent?.hero || {},
          about: localContent?.about || {},
          contact: localContent?.contact || {},
          socials: localContent?.socials || {},
          footer: localContent?.footer || {},
          schemaVersion: 1,
          updatedAt: now,
          updatedBy: "migration-script"
        },
        $setOnInsert: {
          createdAt: now,
          createdBy: "migration-script"
        }
      },
      { upsert: true }
    );

    console.log("[migrate] Done.");
    console.log("[migrate] Database        :", dbName);
    console.log("[migrate] Products coll   :", productsCollectionName);
    console.log("[migrate] Settings coll   :", settingsCollectionName);
    console.log("[migrate] Settings doc id :", settingsDocumentId);
    console.log("[migrate] Products upsert :", productDocs.length);
    console.log("[migrate] Products archive:", idsToArchive.length);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("[migrate] Failed:", error.message);
  process.exit(1);
});
