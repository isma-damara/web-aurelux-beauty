export const NAV_ITEMS = [
  { label: "HOME", href: "#home" },
  { label: "PRODUK", href: "#produk" },
  { label: "TENTANG KAMI", href: "#tentang" },
  { label: "KONTAK", href: "#kontak" }
];

export const LEFT_NAV_ITEMS = NAV_ITEMS.slice(0, 2);
export const RIGHT_NAV_ITEMS = NAV_ITEMS.slice(2);

export const DEFAULT_HEADER_OFFSET = 96;
export const SCROLL_GAP = 10;
export const SCROLL_DURATION_MIN_MS = 1050;
export const SCROLL_DURATION_MAX_MS = 2400;
export const SCROLL_PIXELS_PER_MS = 0.85;
export const MOBILE_SCROLL_SPEED_MULTIPLIER = 8;
