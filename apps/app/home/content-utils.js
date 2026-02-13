export const FALLBACK_CONTENT = {
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

export function toStringValue(value, fallback = "") {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function toArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => toStringValue(item).trim()).filter(Boolean);
}

function toHighlights(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => ({
      value: toStringValue(item?.value).trim(),
      label: toStringValue(item?.label).trim()
    }))
    .filter((item) => item.value || item.label);
}

export function buildWhatsAppLink(whatsapp, message) {
  const normalized = toStringValue(whatsapp).replace(/\D/g, "");

  if (!normalized) {
    return "#";
  }

  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function resolveContentData(content) {
  const hero = { ...FALLBACK_CONTENT.hero, ...(content?.hero ?? {}) };
  const about = {
    ...FALLBACK_CONTENT.about,
    ...(content?.about ?? {}),
    highlights: toHighlights(content?.about?.highlights)
  };
  const contact = { ...FALLBACK_CONTENT.contact, ...(content?.contact ?? {}) };
  const socials = { ...FALLBACK_CONTENT.socials, ...(content?.socials ?? {}) };
  const footer = { ...FALLBACK_CONTENT.footer, ...(content?.footer ?? {}) };

  const products = Array.isArray(content?.products) ? content.products : FALLBACK_CONTENT.products;

  return {
    hero,
    about,
    contact,
    socials,
    footer,
    products: products.map((item, index) => ({
      ...item,
      id: toStringValue(item?.id, `product-${index + 1}`),
      name: toStringValue(item?.name),
      fullName: toStringValue(item?.fullName, toStringValue(item?.name)),
      cardImage: toStringValue(item?.cardImage),
      detailImage: toStringValue(item?.detailImage, toStringValue(item?.cardImage)),
      usp: toStringValue(item?.usp),
      shortList: toArray(item?.shortList),
      description: toStringValue(item?.description),
      ingredients: toArray(item?.ingredients),
      usage: toStringValue(item?.usage)
    }))
  };
}

export function asExternalLink(url) {
  if (typeof url !== "string" || !url.trim() || url === "#") {
    return "#";
  }
  return url;
}

export function easeInOutCubic(progress) {
  if (progress < 0.5) {
    return 4 * progress * progress * progress;
  }
  return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}

export function easeInOutQuint(progress) {
  if (progress < 0.5) {
    return 16 * Math.pow(progress, 5);
  }
  return 1 - Math.pow(-2 * progress + 2, 5) / 2;
}

export function easeInOutSine(progress) {
  return -(Math.cos(Math.PI * progress) - 1) / 2;
}
