import { MongoClient } from "mongodb";
import { loadEnvFromLocalFile } from "./load-env.mjs";

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

await loadEnvFromLocalFile();

async function main() {
  const mongoUri = getEnv("MONGODB_URI");
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diset. Isi env terlebih dahulu.");
  }

  const dbName = getEnv("MONGODB_DB_NAME", "aurelux_beauty");
  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);
    await db.command({ ping: 1 });
    const collections = await db.listCollections({}, { nameOnly: true }).toArray();

    console.log("[mongo-check] Koneksi berhasil.");
    console.log("[mongo-check] DB:", dbName);
    console.log("[mongo-check] Collections:", collections.length);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("[mongo-check] Gagal:", error.message);
  process.exit(1);
});
