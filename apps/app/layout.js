import "./globals.css";

function resolveMetadataBase() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "",
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate);
    } catch (_error) {
      // Skip malformed URL and continue to next fallback.
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Metadata base URL tidak valid di production. Set NEXT_PUBLIC_APP_URL (contoh: https://domain-anda.com)."
    );
  }

  return new URL("http://localhost:3000");
}

export const metadata = {
  metadataBase: resolveMetadataBase(),
  title: "Aurelux Beauty | Katalog Produk Skincare",
  description:
    "Website katalog resmi Aurelux Beauty untuk menampilkan produk unggulan skincare harian dan konsultasi langsung via WhatsApp.",
  openGraph: {
    title: "Aurelux Beauty",
    description:
      "Tenangkan Kulitmu, Jalani Harimu. Jelajahi katalog produk unggulan Aurelux Beauty.",
    images: ["/product/product2.jpeg"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
