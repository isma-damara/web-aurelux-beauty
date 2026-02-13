let sharedClientPromise = null;

function getMongoUriOrThrow() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI belum diset.");
  }
  return uri;
}

async function loadMongoClientClass() {
  try {
    const dynamicImport = new Function("moduleName", "return import(moduleName);");
    const mongoModule = await dynamicImport("mongodb");
    return mongoModule.MongoClient;
  } catch (_error) {
    throw new Error('Package "mongodb" belum terinstall. Jalankan: npm run install:frontend');
  }
}

async function buildClientPromise() {
  const uri = getMongoUriOrThrow();
  const MongoClient = await loadMongoClientClass();
  const client = new MongoClient(uri);
  return client.connect();
}

function getClientPromise() {
  if (process.env.NODE_ENV === "development") {
    if (!globalThis.__aureluxMongoClientPromise) {
      globalThis.__aureluxMongoClientPromise = buildClientPromise();
    }
    return globalThis.__aureluxMongoClientPromise;
  }

  if (!sharedClientPromise) {
    sharedClientPromise = buildClientPromise();
  }

  return sharedClientPromise;
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export function getMongoDbName() {
  return process.env.MONGODB_DB_NAME || "aurelux_beauty";
}

export async function getMongoDb() {
  const client = await getClientPromise();
  return client.db(getMongoDbName());
}
