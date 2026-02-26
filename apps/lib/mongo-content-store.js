import { DEFAULT_CONTENT, normalizeContent, normalizeProduct } from "./content-store.js";
import { getMongoDb } from "./mongo-client.js";
import { upsertMediaAsset } from "./mongo-media-asset-store.js";
import { isManagedUploadUrl } from "./media-store.js";

const DEFAULT_ACTOR = "system@aurelux.local";
const LEGACY_STATIC_MEDIA_PREFIXES = ["/assets/", "/product/", "/logo/"];

function getProductsCollectionName() {
  return process.env.MONGODB_PRODUCTS_COLLECTION || "products";
}

function getSettingsCollectionName() {
  return process.env.MONGODB_SETTINGS_COLLECTION || "site_settings";
}

function getSettingsDocumentId() {
  return process.env.MONGODB_SETTINGS_DOCUMENT_ID || "main";
}

function normalizeActor(actor) {
  if (typeof actor === "string" && actor.trim()) {
    return actor.trim();
  }
  return DEFAULT_ACTOR;
}

function isLegacyStaticMediaUrl(url) {
  if (typeof url !== "string") {
    return false;
  }

  return LEGACY_STATIC_MEDIA_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export function isAllowedMediaUrl(url) {
  if (typeof url !== "string" || !url.trim()) {
    return true;
  }

  return isManagedUploadUrl(url) || isLegacyStaticMediaUrl(url);
}

function assertAllowedMediaUrl(url, fieldName) {
  if (!isAllowedMediaUrl(url)) {
    throw new Error(
      `${fieldName} tidak valid. Upload media melalui admin panel (upload-only) atau gunakan path aset internal yang diizinkan.`
    );
  }
}

function validateProductMediaUrls(product) {
  assertAllowedMediaUrl(product?.cardImage, "cardImage");
  assertAllowedMediaUrl(product?.detailImage, "detailImage");

  const detailImages = Array.isArray(product?.detailImages) ? product.detailImages : [];
  for (const detailImageUrl of detailImages) {
    assertAllowedMediaUrl(detailImageUrl, "detailImages");
  }
}

function validateHeroMediaUrls(hero) {
  assertAllowedMediaUrl(hero?.videoUrl, "hero.videoUrl");
  assertAllowedMediaUrl(hero?.promoVideoUrl, "hero.promoVideoUrl");
  assertAllowedMediaUrl(hero?.posterImage, "hero.posterImage");
  assertAllowedMediaUrl(hero?.heroProductImage, "hero.heroProductImage");
}

function validateBrandMediaUrls(brand) {
  assertAllowedMediaUrl(brand?.logoImage, "brand.logoImage");
}

async function getNextProductCode(productsCollection) {
  const docs = await productsCollection.find({ isDeleted: { $ne: true } }, { projection: { _id: 1 } }).toArray();
  const maxUsedNumber = docs.reduce((highest, doc) => {
    const match = String(doc?._id || "").match(/^PROD(\d+)$/i);
    if (!match) {
      return highest;
    }
    return Math.max(highest, Number(match[1]));
  }, 0);

  let candidate = maxUsedNumber + 1;
  while (true) {
    const candidateId = `PROD${candidate}`;
    const exists = await productsCollection.findOne({ _id: candidateId }, { projection: { _id: 1 } });
    if (!exists) {
      return candidateId;
    }
    candidate += 1;
  }
}

async function getCollections() {
  const db = await getMongoDb();
  return {
    db,
    products: db.collection(getProductsCollectionName()),
    settings: db.collection(getSettingsCollectionName())
  };
}

function mapProductDocToContentProduct(doc) {
  return normalizeProduct(
    {
      id: doc?._id,
      name: doc?.name,
      fullName: doc?.fullName,
      cardImage: doc?.media?.cardImageUrl,
      detailImage: doc?.media?.detailImageUrl,
      detailImages: doc?.media?.detailImageUrls,
      usp: doc?.usp,
      shortList: doc?.shortList,
      description: doc?.description,
      ingredients: doc?.ingredients,
      usage: doc?.usage
    },
    0
  );
}

function mapContentProductToProductDoc(product, index, actor, previousDoc = null) {
  const now = new Date();
  const normalized = normalizeProduct(product, index);

  return {
    _id: normalized.id,
    slug: normalized.id,
    name: normalized.name,
    fullName: normalized.fullName,
    usp: normalized.usp,
    description: normalized.description,
    usage: normalized.usage,
    shortList: normalized.shortList,
    ingredients: normalized.ingredients,
    media: {
      cardImageUrl: normalized.cardImage,
      detailImageUrl: normalized.detailImage,
      detailImageUrls: normalized.detailImages
    },
    status: "published",
    sortOrder: (index + 1) * 10,
    updatedAt: now,
    updatedBy: normalizeActor(actor),
    isDeleted: false,
    createdAt: previousDoc?.createdAt || now,
    createdBy: previousDoc?.createdBy || normalizeActor(actor)
  };
}

function mapSettingsDocToContentParts(settingsDoc) {
  return {
    hero: settingsDoc?.hero ?? DEFAULT_CONTENT.hero,
    about: settingsDoc?.about ?? DEFAULT_CONTENT.about,
    contact: settingsDoc?.contact ?? DEFAULT_CONTENT.contact,
    socials: settingsDoc?.socials ?? DEFAULT_CONTENT.socials,
    brand: settingsDoc?.brand ?? DEFAULT_CONTENT.brand,
    footer: settingsDoc?.footer ?? DEFAULT_CONTENT.footer
  };
}

function getMediaTypeFromUrl(url) {
  if (typeof url !== "string") {
    return "image";
  }
  if (/\/uploads\/videos\//.test(url) || /\/videos\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url)) {
    return "video";
  }
  return "image";
}

async function linkManagedMedia(url, { usage, linkedEntity, actor }) {
  if (!isManagedUploadUrl(url)) {
    return;
  }

  await upsertMediaAsset(
    {
      url,
      type: getMediaTypeFromUrl(url),
      usage,
      linkedEntity
    },
    { actor }
  );
}

async function syncProductMediaLinksFromContent(products, actor) {
  for (const product of products) {
    const normalized = normalizeProduct(product);

    await linkManagedMedia(normalized.cardImage, {
      usage: "product_card",
      linkedEntity: { collection: getProductsCollectionName(), id: normalized.id },
      actor
    });

    for (const detailImageUrl of normalized.detailImages) {
      await linkManagedMedia(detailImageUrl, {
        usage: "product_detail",
        linkedEntity: { collection: getProductsCollectionName(), id: normalized.id },
        actor
      });
    }
  }
}

async function syncHeroMediaLinks(hero, actor) {
  const settingsId = getSettingsDocumentId();

  await linkManagedMedia(hero?.videoUrl, {
    usage: "hero_video",
    linkedEntity: { collection: getSettingsCollectionName(), id: settingsId },
    actor
  });

  await linkManagedMedia(hero?.promoVideoUrl, {
    usage: "promo_video",
    linkedEntity: { collection: getSettingsCollectionName(), id: settingsId },
    actor
  });

  await linkManagedMedia(hero?.posterImage, {
    usage: "hero_poster",
    linkedEntity: { collection: getSettingsCollectionName(), id: settingsId },
    actor
  });

  await linkManagedMedia(hero?.heroProductImage, {
    usage: "hero_product",
    linkedEntity: { collection: getSettingsCollectionName(), id: settingsId },
    actor
  });
}

async function syncBrandMediaLinks(brand, actor) {
  const settingsId = getSettingsDocumentId();

  await linkManagedMedia(brand?.logoImage, {
    usage: "brand_logo",
    linkedEntity: { collection: getSettingsCollectionName(), id: settingsId },
    actor
  });
}

export async function readContentFromMongo() {
  const { products, settings } = await getCollections();
  const [settingsDoc, productDocs] = await Promise.all([
    settings.findOne({ _id: getSettingsDocumentId() }),
    products
      .find({ isDeleted: { $ne: true } })
      .sort({ sortOrder: 1, updatedAt: -1 })
      .toArray()
  ]);

  if (!settingsDoc && productDocs.length === 0) {
    return normalizeContent(DEFAULT_CONTENT);
  }

  const base = mapSettingsDocToContentParts(settingsDoc);
  const merged = {
    ...DEFAULT_CONTENT,
    ...base,
    products: productDocs.map((doc) => mapProductDocToContentProduct(doc))
  };

  return normalizeContent(merged);
}

export async function writeContentToMongo(nextContent, options = {}) {
  const actor = normalizeActor(options?.actor);
  const normalized = normalizeContent(nextContent);
  const now = new Date();

  validateHeroMediaUrls(normalized.hero);
  validateBrandMediaUrls(normalized.brand);
  normalized.products.forEach((product) => validateProductMediaUrls(product));

  const { products, settings } = await getCollections();
  const existingDocs = await products.find({}, { projection: { _id: 1, createdAt: 1, createdBy: 1 } }).toArray();
  const existingMap = new Map(existingDocs.map((doc) => [doc._id, doc]));

  const upserts = normalized.products.map((product, index) => {
    const doc = mapContentProductToProductDoc(product, index, actor, existingMap.get(product.id));

    return {
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
            updatedAt: doc.updatedAt,
            updatedBy: doc.updatedBy,
            isDeleted: false
          },
          $setOnInsert: {
            createdAt: doc.createdAt,
            createdBy: doc.createdBy
          }
        },
        upsert: true
      }
    };
  });

  if (upserts.length > 0) {
    await products.bulkWrite(upserts, { ordered: false });
  }

  const nextIds = new Set(normalized.products.map((item) => item.id));
  const toDelete = existingDocs.map((doc) => doc._id).filter((id) => !nextIds.has(id));

  if (toDelete.length > 0) {
    await products.deleteMany({ _id: { $in: toDelete } });
  }

  await settings.updateOne(
    { _id: getSettingsDocumentId() },
    {
      $set: {
        hero: normalized.hero,
        about: normalized.about,
        contact: normalized.contact,
        socials: normalized.socials,
        brand: normalized.brand,
        footer: normalized.footer,
        updatedAt: now,
        updatedBy: actor,
        schemaVersion: 1
      },
      $setOnInsert: {
        createdAt: now,
        createdBy: actor
      }
    },
    { upsert: true }
  );

  await syncProductMediaLinksFromContent(normalized.products, actor);
  await syncHeroMediaLinks(normalized.hero, actor);
  await syncBrandMediaLinks(normalized.brand, actor);

  return normalized;
}

export async function listProductsFromMongo() {
  const { products } = await getCollections();
  const docs = await products
    .find({ isDeleted: { $ne: true } })
    .sort({ sortOrder: 1, updatedAt: -1 })
    .toArray();

  return docs.map((doc) => mapProductDocToContentProduct(doc));
}

export async function createProductInMongo(payload, options = {}) {
  const actor = normalizeActor(options?.actor);
  const normalized = normalizeProduct(payload, 0);
  validateProductMediaUrls(normalized);

  if (!normalized.name) {
    throw new Error("Nama produk wajib diisi.");
  }

  const { products } = await getCollections();
  const nextId = await getNextProductCode(products);

  const last = await products.find({ isDeleted: { $ne: true } }).sort({ sortOrder: -1 }).limit(1).toArray();
  const sortOrder = (last[0]?.sortOrder || 0) + 10;
  const now = new Date();

  await products.insertOne({
    _id: nextId,
    slug: nextId,
    name: normalized.name,
    fullName: normalized.fullName,
    usp: normalized.usp,
    description: normalized.description,
    usage: normalized.usage,
    shortList: normalized.shortList,
    ingredients: normalized.ingredients,
    media: {
      cardImageUrl: normalized.cardImage,
      detailImageUrl: normalized.detailImage,
      detailImageUrls: normalized.detailImages
    },
    status: "published",
    sortOrder,
    createdAt: now,
    createdBy: actor,
    updatedAt: now,
    updatedBy: actor,
    isDeleted: false
  });

  await syncProductMediaLinksFromContent([
    {
      ...normalized,
      id: nextId
    }
  ], actor);

  return listProductsFromMongo();
}

export async function updateProductInMongo(productId, payload, options = {}) {
  const actor = normalizeActor(options?.actor);
  const { products } = await getCollections();
  const current = await products.findOne({ _id: productId, isDeleted: { $ne: true } });

  if (!current) {
    return null;
  }

  const merged = normalizeProduct(
    {
      ...mapProductDocToContentProduct(current),
      ...payload,
      id: productId
    },
    0
  );
  validateProductMediaUrls(merged);

  await products.updateOne(
    { _id: productId },
    {
      $set: {
        slug: merged.id,
        name: merged.name,
        fullName: merged.fullName,
        usp: merged.usp,
        description: merged.description,
        usage: merged.usage,
        shortList: merged.shortList,
        ingredients: merged.ingredients,
        media: {
          cardImageUrl: merged.cardImage,
          detailImageUrl: merged.detailImage,
          detailImageUrls: merged.detailImages
        },
        updatedAt: new Date(),
        updatedBy: actor,
        isDeleted: false,
        status: "published"
      }
    }
  );

  await syncProductMediaLinksFromContent([merged], actor);

  return merged;
}

export async function deleteProductInMongo(productId) {
  const { products } = await getCollections();
  const result = await products.deleteOne({ _id: productId });

  if (!result.deletedCount) {
    return null;
  }

  return listProductsFromMongo();
}

export async function readSettingsFromMongo() {
  const { settings } = await getCollections();
  const settingsDoc = await settings.findOne({ _id: getSettingsDocumentId() });

  if (!settingsDoc) {
    return {
      hero: DEFAULT_CONTENT.hero,
      about: DEFAULT_CONTENT.about,
      contact: DEFAULT_CONTENT.contact,
      socials: DEFAULT_CONTENT.socials,
      brand: DEFAULT_CONTENT.brand,
      footer: DEFAULT_CONTENT.footer
    };
  }

  const parts = mapSettingsDocToContentParts(settingsDoc);
  return {
    hero: parts.hero,
    about: parts.about,
    contact: parts.contact,
    socials: parts.socials,
    brand: parts.brand,
    footer: parts.footer
  };
}

export async function updateSettingsInMongo(partialSettings, options = {}) {
  const actor = normalizeActor(options?.actor);
  const current = await readSettingsFromMongo();

  const merged = {
    hero: partialSettings?.hero ? { ...current.hero, ...partialSettings.hero } : current.hero,
    about: partialSettings?.about ? { ...current.about, ...partialSettings.about } : current.about,
    contact: partialSettings?.contact ? { ...current.contact, ...partialSettings.contact } : current.contact,
    socials: partialSettings?.socials ? { ...current.socials, ...partialSettings.socials } : current.socials,
    brand: partialSettings?.brand ? { ...current.brand, ...partialSettings.brand } : current.brand,
    footer: partialSettings?.footer ? { ...current.footer, ...partialSettings.footer } : current.footer
  };

  const normalized = normalizeContent({
    ...DEFAULT_CONTENT,
    ...merged,
    products: []
  });
  validateHeroMediaUrls(normalized.hero);
  validateBrandMediaUrls(normalized.brand);

  const { settings } = await getCollections();
  const now = new Date();

  await settings.updateOne(
    { _id: getSettingsDocumentId() },
    {
      $set: {
        hero: normalized.hero,
        about: normalized.about,
        contact: normalized.contact,
        socials: normalized.socials,
        brand: normalized.brand,
        footer: normalized.footer,
        updatedAt: now,
        updatedBy: actor,
        schemaVersion: 1
      },
      $setOnInsert: {
        createdAt: now,
        createdBy: actor
      }
    },
    { upsert: true }
  );

  await syncHeroMediaLinks(normalized.hero, actor);
  await syncBrandMediaLinks(normalized.brand, actor);

  const fullContent = await readContentFromMongo();
  return normalizeContent(fullContent);
}

