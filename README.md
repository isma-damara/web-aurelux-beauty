# Aurelux Beauty Website

Website katalog resmi Aurelux Beauty berbasis Next.js (App Router), difokuskan untuk branding dan product showcase dengan CTA ke WhatsApp.

## Ringkasan

- Tipe aplikasi: single-page catalog website (bukan e-commerce)
- Stack utama: Next.js 14, React 18, CSS global (tanpa UI framework)
- Arsitektur repo: monorepo sederhana (`apps/frontend` + placeholder `apps/backend`)
- Referensi brief: `docs/konsep/KAK_Aurelux_Beauty.md`

## Fitur Frontend Saat Ini

- Sticky header + anchor navigation (`#home`, `#produk`, `#tentang`, `#kontak`)
- Smooth scroll antar section
- Hero section dengan background video (fallback poster image)
- Product showcase 2 produk unggulan
- Quick View modal (overlay, close via klik backdrop/tombol `X`/tombol `Escape`)
- CTA WhatsApp per produk dan CTA global
- Floating WhatsApp button pada mobile
- Responsive layout untuk desktop/tablet/mobile
- SEO metadata dasar di `app/layout.js` (title, description, Open Graph image)

## Struktur Proyek

```text
aurelux-beauty/
|-- apps/
|   |-- frontend/                 # Next.js app (aktif)
|   |   |-- app/
|   |   |   |-- layout.js
|   |   |   |-- page.js
|   |   |   `-- globals.css
|   |   |-- components/
|   |   |   `-- home-page.jsx
|   |   `-- public/
|   |       |-- product/          # Aset gambar produk
|   |       |-- logo/             # Logo BPOM & Halal
|   |       `-- assets/           # Folder aset tambahan (opsional)
|   `-- backend/                  # Placeholder (belum diimplementasi)
`-- docs/
    |-- HLD.md
    `-- konsep/
        |-- KAK_Aurelux_Beauty.md
        `-- Konsep_Bisnis_Aurelux_Beauty.md
```

## Prasyarat

- Node.js `>= 18.17` (disarankan Node.js 20 LTS)
- npm `>= 9`

## Menjalankan Secara Lokal

1. Install dependency frontend:

```bash
npm run install:frontend
```

2. Jalankan development server dari root:

```bash
npm run dev
```

3. Akses aplikasi:

```text
http://localhost:3000
```

## Scripts (Root)

| Script | Perintah | Fungsi |
|---|---|---|
| `npm run dev` | `npm --prefix apps/frontend run dev` | Menjalankan Next.js dev server |
| `npm run build` | `npm --prefix apps/frontend run build` | Build production |
| `npm run start` | `npm --prefix apps/frontend run start` | Menjalankan hasil build |
| `npm run lint` | `npm --prefix apps/frontend run lint` | Linting frontend |
| `npm run install:frontend` | `npm --prefix apps/frontend install` | Install dependency frontend |

## Scripts (Frontend)

Lokasi: `apps/frontend/package.json`

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Konvensi Aset

- Gambar produk: simpan di `apps/frontend/public/product`
- Logo BPOM/Halal: simpan di `apps/frontend/public/logo`
- Hero video yang dipakai komponen saat ini: `/assets/media/hero-teaser.mp4`
- Saat ini file video hero belum tersedia pada path tersebut, sehingga frontend menggunakan poster image

## Konfigurasi Konten

- Data menu, kontak, dan produk saat ini hardcoded di `apps/frontend/components/home-page.jsx`
- Styling global ada di `apps/frontend/app/globals.css`
- Metadata SEO dasar ada di `apps/frontend/app/layout.js`

## Scope Saat Ini

- Frontend katalog: aktif
- Admin panel/backend: belum aktif (folder `apps/backend` masih placeholder)

## Deployment

### Opsi 1: Vercel (disarankan)

- Root Directory: `apps/frontend`
- Build Command: `npm run build`
- Output: default Next.js

### Opsi 2: Node Server / VPS

```bash
npm run install:frontend
npm run build
npm run start
```

## Referensi Dokumen

- Brief utama: `docs/konsep/KAK_Aurelux_Beauty.md`
- Konsep bisnis: `docs/konsep/Konsep_Bisnis_Aurelux_Beauty.md`
- High-level design: `docs/HLD.md`

## Lisensi

Belum ditentukan. Tambahkan file `LICENSE` sebelum publikasi open-source.
