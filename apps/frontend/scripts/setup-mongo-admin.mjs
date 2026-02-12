import { MongoClient } from "mongodb";
import { randomBytes, scryptSync } from "node:crypto";
import { loadEnvFromLocalFile } from "./load-env.mjs";

await loadEnvFromLocalFile();

function getEnv(name, fallback = "") {
  const value = process.env[name];
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return fallback;
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return "";
  }
  return email.trim().toLowerCase();
}

function createPasswordHash(rawPassword) {
  if (typeof rawPassword !== "string" || !rawPassword) {
    throw new Error("Password admin wajib diisi.");
  }

  const salt = randomBytes(16);
  const key = scryptSync(rawPassword, salt, 64, {
    N: 16384,
    r: 8,
    p: 1
  });

  return `scrypt$16384$8$1$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function main() {
  const mongoUri = getEnv("MONGODB_URI");
  if (!mongoUri) {
    throw new Error("MONGODB_URI belum diset.");
  }

  const dbName = getEnv("MONGODB_DB_NAME", "aurelux_beauty");
  const adminsCollectionName = getEnv("MONGODB_ADMINS_COLLECTION", "admins");
  const email = normalizeEmail(getEnv("ADMIN_SEED_EMAIL"));
  const password = getEnv("ADMIN_SEED_PASSWORD");
  const role = getEnv("ADMIN_SEED_ROLE", "admin").toLowerCase();

  if (!email) {
    throw new Error("ADMIN_SEED_EMAIL belum diset.");
  }

  if (!password) {
    throw new Error("ADMIN_SEED_PASSWORD belum diset.");
  }

  if (role !== "admin") {
    throw new Error("Saat ini hanya role 'admin' yang didukung.");
  }

  const passwordHash = createPasswordHash(password);
  const now = new Date();
  const actor = "seed-script";

  const client = new MongoClient(mongoUri);
  await client.connect();

  try {
    const db = client.db(dbName);
    const admins = db.collection(adminsCollectionName);

    await admins.updateOne(
      { email },
      {
        $set: {
          role,
          isActive: true,
          passwordHash,
          updatedAt: now,
          updatedBy: actor
        },
        $setOnInsert: {
          _id: email,
          email,
          createdAt: now,
          createdBy: actor
        }
      },
      { upsert: true }
    );

    console.log("[admin-setup] done");
    console.log("[admin-setup] database   :", dbName);
    console.log("[admin-setup] collection :", adminsCollectionName);
    console.log("[admin-setup] email      :", email);
    console.log("[admin-setup] role       :", role);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("[admin-setup] failed:", error.message);
  process.exit(1);
});
