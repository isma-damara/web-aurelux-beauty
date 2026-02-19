import { existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";

export const DEFAULT_CONTENT = {
  hero: {
    title: "",
    subtitle: "",
    videoUrl: "",
    posterImage: "",
    heroProductImage: ""
  },
  products: [],
  about: {
    title: "",
    description: "",
    highlights: []
  },
  contact: {
    headline: "",
    description: "",
    whatsapp: "",
    email: "",
    phone: "",
    pic: "",
    address: ""
  },
  socials: {
    instagram: "",
    facebook: "",
    tiktok: ""
  },
  footer: {
    tagline: "",
    copyright: ""
  }
};
const MAX_DETAIL_IMAGES = 5;

function resolveFirstExistingPath(paths) {
  return paths.find((candidate) => existsSync(candidate)) ?? paths[0];
}

export function resolveContentFilePath() {
  return resolveFirstExistingPath([
    path.join(process.cwd(), "data", "site-content.json"),
    path.join(process.cwd(), "apps", "frontend", "data", "site-content.json")
  ]);
}

export function resolvePublicDirectoryPath() {
  return resolveFirstExistingPath([
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "apps", "frontend", "public")
  ]);
}

function toStringValue(value, fallback = "") {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return String(value);
  }
  return fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => toStringValue(item)).filter(Boolean);
}

function normalizeDetailImages(product, cardImage) {
  const fromArray = toStringArray(product?.detailImages);
  const fromLegacyField = toStringValue(product?.detailImage);
  const merged = [...fromArray];

  if (fromLegacyField) {
    merged.push(fromLegacyField);
  }

  const unique = [...new Set(merged.filter(Boolean))].slice(0, MAX_DETAIL_IMAGES);
  if (unique.length > 0) {
    return unique;
  }

  if (cardImage) {
    return [cardImage];
  }

  return [];
}

function normalizeHighlights(value) {
  if (!Array.isArray(value)) {
    return DEFAULT_CONTENT.about.highlights;
  }

  return value
    .map((item) => ({
      value: toStringValue(item?.value),
      label: toStringValue(item?.label)
    }))
    .filter((item) => item.value || item.label);
}

function normalizeProductId(value, index = 0) {
  const raw = toStringValue(value).replace(/^#/, "").trim();
  if (!raw) {
    return `PROD${index + 1}`;
  }

  const prodMatch = raw.match(/^prod[\s_-]*(\d+)$/i);
  if (prodMatch) {
    return `PROD${Number(prodMatch[1])}`;
  }

  return raw;
}

export function normalizeProduct(product, index = 0) {
  const normalizedName = toStringValue(product?.name) || toStringValue(product?.fullName);
  const cardImage = toStringValue(product?.cardImage);
  const detailImages = normalizeDetailImages(product, cardImage);

  return {
    id: normalizeProductId(product?.id, index),
    name: normalizedName,
    fullName: toStringValue(product?.fullName) || normalizedName,
    cardImage,
    detailImage: detailImages[0] || cardImage,
    detailImages,
    usp: toStringValue(product?.usp),
    shortList: toStringArray(product?.shortList),
    description: toStringValue(product?.description),
    ingredients: toStringArray(product?.ingredients),
    usage: toStringValue(product?.usage)
  };
}

export function normalizeContent(rawContent) {
  const source = rawContent && typeof rawContent === "object" ? rawContent : {};
  const hero = source.hero && typeof source.hero === "object" ? source.hero : {};
  const about = source.about && typeof source.about === "object" ? source.about : {};
  const contact = source.contact && typeof source.contact === "object" ? source.contact : {};
  const socials = source.socials && typeof source.socials === "object" ? source.socials : {};
  const footer = source.footer && typeof source.footer === "object" ? source.footer : {};

  const products = Array.isArray(source.products) ? source.products : DEFAULT_CONTENT.products;

  return {
    hero: {
      ...DEFAULT_CONTENT.hero,
      ...hero,
      title: toStringValue(hero.title, DEFAULT_CONTENT.hero.title),
      subtitle: toStringValue(hero.subtitle, DEFAULT_CONTENT.hero.subtitle),
      videoUrl: toStringValue(hero.videoUrl, DEFAULT_CONTENT.hero.videoUrl),
      posterImage: toStringValue(hero.posterImage, DEFAULT_CONTENT.hero.posterImage),
      heroProductImage: toStringValue(hero.heroProductImage, DEFAULT_CONTENT.hero.heroProductImage)
    },
    products: products.map((product, index) => normalizeProduct(product, index)),
    about: {
      ...DEFAULT_CONTENT.about,
      ...about,
      title: toStringValue(about.title, DEFAULT_CONTENT.about.title),
      description: toStringValue(about.description, DEFAULT_CONTENT.about.description),
      highlights: normalizeHighlights(about.highlights)
    },
    contact: {
      ...DEFAULT_CONTENT.contact,
      ...contact,
      headline: toStringValue(contact.headline, DEFAULT_CONTENT.contact.headline),
      description: toStringValue(contact.description, DEFAULT_CONTENT.contact.description),
      whatsapp: toStringValue(contact.whatsapp, DEFAULT_CONTENT.contact.whatsapp),
      email: toStringValue(contact.email, DEFAULT_CONTENT.contact.email),
      phone: toStringValue(contact.phone, DEFAULT_CONTENT.contact.phone),
      pic: toStringValue(contact.pic, DEFAULT_CONTENT.contact.pic),
      address: toStringValue(contact.address, DEFAULT_CONTENT.contact.address)
    },
    socials: {
      ...DEFAULT_CONTENT.socials,
      ...socials,
      instagram: toStringValue(socials.instagram, DEFAULT_CONTENT.socials.instagram),
      facebook: toStringValue(socials.facebook, DEFAULT_CONTENT.socials.facebook),
      tiktok: toStringValue(socials.tiktok, DEFAULT_CONTENT.socials.tiktok)
    },
    footer: {
      ...DEFAULT_CONTENT.footer,
      ...footer,
      tagline: toStringValue(footer.tagline, DEFAULT_CONTENT.footer.tagline),
      copyright: toStringValue(footer.copyright, DEFAULT_CONTENT.footer.copyright)
    }
  };
}

async function ensureContentFileExists() {
  const contentFilePath = resolveContentFilePath();
  await fs.mkdir(path.dirname(contentFilePath), { recursive: true });

  if (!existsSync(contentFilePath)) {
    await fs.writeFile(contentFilePath, JSON.stringify(DEFAULT_CONTENT, null, 2), "utf8");
  }

  return contentFilePath;
}

let writeQueue = Promise.resolve();

export async function readContent() {
  const contentFilePath = await ensureContentFileExists();
  const raw = await fs.readFile(contentFilePath, "utf8");
  const parsed = JSON.parse(raw);
  return normalizeContent(parsed);
}

export async function writeContent(nextContent) {
  const contentFilePath = await ensureContentFileExists();
  const normalized = normalizeContent(nextContent);

  writeQueue = writeQueue
    .catch(() => null)
    .then(async () => {
      await fs.writeFile(contentFilePath, JSON.stringify(normalized, null, 2), "utf8");
      return normalized;
    });

  return writeQueue;
}

export async function updateContent(updater) {
  const currentContent = await readContent();
  const draft = JSON.parse(JSON.stringify(currentContent));
  const updated = await updater(draft);
  return writeContent(updated ?? draft);
}
