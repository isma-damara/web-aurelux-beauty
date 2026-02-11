import "./globals.css";

export const metadata = {
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
