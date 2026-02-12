import { getMongoDb } from "./mongo-client";
import { createPasswordHash, verifyPasswordHash } from "./admin-password";

const DEFAULT_ADMIN_ROLE = "admin";
const DEFAULT_ACTOR = "system@aurelux.local";

function getAdminCollectionName() {
  return process.env.MONGODB_ADMINS_COLLECTION || "admins";
}

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return "";
  }
  return email.trim().toLowerCase();
}

function normalizeRole(role) {
  if (typeof role !== "string" || !role.trim()) {
    return DEFAULT_ADMIN_ROLE;
  }
  return role.trim().toLowerCase();
}

function normalizeActor(actor) {
  if (typeof actor !== "string" || !actor.trim()) {
    return DEFAULT_ACTOR;
  }
  return actor.trim();
}

async function getCollection() {
  const db = await getMongoDb();
  return db.collection(getAdminCollectionName());
}

function mapAdminUser(doc) {
  return {
    id: doc?._id || doc?.email || "",
    email: doc?.email || "",
    role: doc?.role || DEFAULT_ADMIN_ROLE,
    isActive: doc?.isActive !== false
  };
}

export async function findAdminByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const collection = await getCollection();
  const adminDoc = await collection.findOne({ email: normalizedEmail });
  if (!adminDoc) {
    return null;
  }

  return mapAdminUser(adminDoc);
}

export async function verifyAdminCredentialsFromMongo(email, password) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || typeof password !== "string" || !password) {
    return null;
  }

  const collection = await getCollection();
  const adminDoc = await collection.findOne({ email: normalizedEmail, isActive: { $ne: false } });

  if (!adminDoc || !adminDoc.passwordHash) {
    return null;
  }

  const isPasswordMatch = verifyPasswordHash(password, adminDoc.passwordHash);
  if (!isPasswordMatch) {
    return null;
  }

  await collection.updateOne(
    { _id: adminDoc._id },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  return mapAdminUser(adminDoc);
}

export async function upsertAdminUser(payload = {}, options = {}) {
  const email = normalizeEmail(payload.email);
  const password = typeof payload.password === "string" ? payload.password : "";
  const role = normalizeRole(payload.role);
  const isActive = payload.isActive !== false;
  const actor = normalizeActor(options.actor);

  if (!email) {
    throw new Error("Email admin wajib diisi.");
  }

  if (!password) {
    throw new Error("Password admin wajib diisi.");
  }

  const passwordHash = createPasswordHash(password);
  const now = new Date();

  const collection = await getCollection();
  await collection.updateOne(
    { email },
    {
      $set: {
        role,
        isActive,
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

  const saved = await collection.findOne({ email });
  return mapAdminUser(saved);
}
