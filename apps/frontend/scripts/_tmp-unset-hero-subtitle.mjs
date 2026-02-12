import { MongoClient } from "mongodb";
import { loadEnvFromLocalFile } from "./load-env.mjs";

await loadEnvFromLocalFile();

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MONGODB_URI belum diset");
}

const dbName = process.env.MONGODB_DB_NAME || "aurelux_beauty";
const settingsCollection = process.env.MONGODB_SETTINGS_COLLECTION || "site_settings";
const settingsId = process.env.MONGODB_SETTINGS_DOCUMENT_ID || "main";

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);
  const updateResult = await db.collection(settingsCollection).updateOne(
    { _id: settingsId },
    { $unset: { "hero.subtitle": "" } }
  );

  const doc = await db.collection(settingsCollection).findOne(
    { _id: settingsId },
    {
      projection: {
        _id: 1,
        "hero.title": 1,
        "hero.subtitle": 1,
        "hero.videoUrl": 1,
        "hero.posterImage": 1,
        "hero.heroProductImage": 1
      }
    }
  );

  console.log(
    JSON.stringify(
      {
        dbName,
        settingsCollection,
        settingsId,
        matched: updateResult.matchedCount,
        modified: updateResult.modifiedCount,
        hasSubtitle: Object.prototype.hasOwnProperty.call(doc?.hero || {}, "subtitle"),
        hero: doc?.hero || null
      },
      null,
      2
    )
  );
} finally {
  await client.close();
}
