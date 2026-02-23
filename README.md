# Aurelux Beauty

Website katalog produk Aurelux Beauty dengan admin panel terintegrasi untuk pengelolaan konten, produk, dan media.

## Ringkasan

Project ini dibangun sebagai satu aplikasi Next.js (App Router) yang melayani dua area utama:

- `Public Website` (`/`): landing page katalog produk, hero banner, konten brand, kontak, dan CTA WhatsApp.
- `Admin Panel` (`/admin/*`): pengelolaan produk, profil bisnis, sosial media, serta media/video banner.

Konten runtime menggunakan MongoDB sebagai sumber data utama (`CONTENT_STORE_DRIVER=mongo`).

## Fitur Utama

### Public Website

- Hero banner dinamis (judul, subtitle, video, poster, gambar produk hero)
- Promo video section
- Daftar produk + quick view modal
- About, contact, social links, dan footer yang dapat diubah dari admin
- Floating WhatsApp CTA
- Responsive (desktop dan mobile)

### Admin Panel

- Login admin berbasis MongoDB
- CRUD produk
- Upload/ganti media produk (card image + detail images)
- Edit profil bisnis (Tentang Kami, Kontak, Sosial Media)
- Edit teks dan media video/banner hero
- Activity log perubahan melalui API admin

## Tech Stack

- `Next.js 14` (App Router)
- `React 18`
- `Tailwind CSS`
- `MongoDB` (content, settings, media metadata, admin, activity logs)
- `Vercel Blob` (opsional untuk media storage produksi)

## Arsitektur Singkat

```text
Browser (Public/Admin)
        |
        v
Next.js App (apps/)
- Public UI (/)
- Admin UI (/admin/*)
- API Admin (/api/admin/*)
        |
        +--> MongoDB (products, site_settings, media_assets, activity_logs, admins)
        |
        +--> Media Storage
             - Local filesystem (/public/uploads)
             - Vercel Blob (opsional)
```

## Struktur Repository

```text
aurelux-beauty/
|-- apps/
|   |-- app/
|   |   |-- page.js                  # Public home page
|   |   |-- home/                    # Komponen halaman publik
|   |   |-- admin/                   # UI admin panel
|   |   `-- api/admin/               # API admin (auth/content/products/media/settings)
|   |-- lib/                         # Auth, Mongo, repository, media store
|   |-- scripts/                     # Setup schema/admin/migrasi/cek koneksi
|   |-- tests/                       # Unit tests util/store
|   |-- data/site-content.json       # Data awal (opsional migrasi)
|   `-- public/                      # Static assets + uploads (local media driver)
`-- docs/                            # Dokumen konsep & arsitektur
```

## Prasyarat

- `Node.js >= 18.17` (disarankan `20 LTS`)
- `npm >= 9`
- MongoDB aktif (lokal atau remote)

## Quick Start (Local Development)

Jalankan dari root project:

1. Install dependency

```bash
cd apps
npm install
```

2. Siapkan environment file

```powershell
Copy-Item .env.example .env.local
```

3. Review dan ganti nilai sensitif di `apps/.env.local`

- jangan gunakan kredensial/token contoh untuk environment produksi
- pastikan `ADMIN_SESSION_SECRET` menggunakan secret acak yang kuat
- pastikan token Blob valid jika menggunakan mode `blob`

4. Validasi koneksi MongoDB (opsional tapi disarankan)

```bash
npm run check:mongo
```

5. Setup schema/index MongoDB

```bash
npm run setup:mongo:schema
```

6. Seed/update akun admin

```bash
npm run setup:mongo:admin
```

7. Jalankan aplikasi

```bash
npm run dev
```

8. Akses aplikasi

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Konfigurasi Environment

Lokasi file runtime lokal: `apps/.env.local`

### Variabel Wajib (Minimum)

| Variable | Keterangan |
| --- | --- |
| `CONTENT_STORE_DRIVER` | Wajib `mongo` |
| `MONGODB_URI` | URI MongoDB |
| `MONGODB_DB_NAME` | Nama database |
| `ADMIN_SESSION_SECRET` | Secret cookie session admin (wajib, random kuat) |
| `NEXT_PUBLIC_APP_URL` | Base URL aplikasi untuk metadata/link absolut |

### Variabel Media Storage

| Variable | Keterangan |
| --- | --- |
| `MEDIA_STORAGE_DRIVER` | `local` atau `blob` |
| `NEXT_PUBLIC_MEDIA_STORAGE_DRIVER` | Driver media untuk client upload |
| `BLOB_READ_WRITE_TOKEN` | Wajib jika `MEDIA_STORAGE_DRIVER=blob` |
| `BLOB_UPLOAD_FOLDER` | Prefix folder upload di Blob |
| `NEXT_PUBLIC_BLOB_UPLOAD_FOLDER` | Prefix folder upload Blob untuk client |
| `BLOB_PUBLIC_BASE_URL` | Opsional, memperketat validasi URL Blob managed |

### Variabel Koleksi MongoDB (Opsional, default tersedia)

| Variable |
| --- |
| `MONGODB_PRODUCTS_COLLECTION` |
| `MONGODB_SETTINGS_COLLECTION` |
| `MONGODB_SETTINGS_DOCUMENT_ID` |
| `MONGODB_MEDIA_COLLECTION` |
| `MONGODB_ACTIVITY_COLLECTION` |
| `MONGODB_ADMINS_COLLECTION` |

### Variabel Seed Admin (Gunakan Nilai Anda Sendiri)

| Variable | Keterangan |
| --- | --- |
| `ADMIN_SEED_EMAIL` | Email admin untuk script seed |
| `ADMIN_SEED_PASSWORD` | Password admin untuk script seed |
| `ADMIN_SEED_ROLE` | Saat ini gunakan `admin` |

## MongoDB Setup & Inisialisasi

Semua perintah dijalankan dari folder `apps/`.

1. Cek koneksi MongoDB

```bash
npm run check:mongo
```

2. Setup validator & index

```bash
npm run setup:mongo:schema
```

3. Seed/update akun admin

```bash
npm run setup:mongo:admin
```

4. Migrasi konten awal dari JSON (opsional)

```bash
npm run migrate:content:mongo
```

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan app mode development |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | Lint project (Next.js) |
| `npm run test` | Menjalankan test util/store (`node --test`) |
| `npm run check:mongo` | Validasi koneksi MongoDB |
| `npm run setup:mongo:schema` | Setup validator + index MongoDB |
| `npm run setup:mongo:admin` | Seed / update akun admin |
| `npm run migrate:content:mongo` | Migrasi konten awal JSON ke MongoDB |

## Data Model (Ringkas)

| Collection | Fungsi |
| --- | --- |
| `products` | Data produk dan media produk |
| `site_settings` | Hero, about, contact, socials, footer |
| `media_assets` | Metadata media upload + relasi penggunaan |
| `activity_logs` | Audit log perubahan dari API admin |
| `admins` | Akun admin, role, hash password, status |

## Keamanan (Ringkas)

- Route terproteksi: `/admin/*` dan `/api/admin/*`
- Session disimpan di cookie httpOnly: `aurelux_admin_session`
- Password admin disimpan sebagai hash `scrypt`
- Role yang didukung saat ini: `admin`
- URL media divalidasi agar hanya menerima media managed/internal yang diizinkan

## Deployment

### Vercel (Disarankan untuk Frontend + Blob)

1. Import repository ke Vercel
2. Set `Root Directory` ke `apps`
3. Install command: `npm install`
4. Build command: `npm run build`
5. Konfigurasi environment variables produksi (minimal):

```env
CONTENT_STORE_DRIVER=mongo
MEDIA_STORAGE_DRIVER=blob
NEXT_PUBLIC_MEDIA_STORAGE_DRIVER=blob
MONGODB_URI=<mongodb-atlas-uri>
MONGODB_DB_NAME=aurelux_beauty
ADMIN_SESSION_SECRET=<strong-random-secret>
NEXT_PUBLIC_APP_URL=https://domain-anda.com
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
BLOB_UPLOAD_FOLDER=aurelux-beauty
NEXT_PUBLIC_BLOB_UPLOAD_FOLDER=aurelux-beauty
```

Opsional (disarankan untuk validasi URL Blob lebih ketat):

```env
BLOB_PUBLIC_BASE_URL=https://<store-id>.public.blob.vercel-storage.com
```

Catatan:
- Upload media admin pada mode `blob` menggunakan direct upload via `/api/admin/media/upload`.

### VPS / Node Server

```bash
cd apps
npm install
npm run build
npm run start
```

Jika memakai upload media lokal (`MEDIA_STORAGE_DRIVER=local`), pastikan storage filesystem bersifat persisten.

## Troubleshooting

### `Module not found: Can't resolve 'mongodb'`

Jalankan:

```bash
cd apps
npm install
```

### Error runtime terkait content store

Pastikan:

- `CONTENT_STORE_DRIVER=mongo`
- `MONGODB_URI` terisi dan dapat diakses

### Login admin gagal

Periksa:

- koleksi `admins` sudah terisi (`npm run setup:mongo:admin`)
- `ADMIN_SESSION_SECRET` terisi
- data MongoDB yang digunakan sesuai environment aktif

### Perubahan konten tidak muncul

- refresh browser
- verifikasi data tersimpan dari admin panel
- pastikan request ke API admin tidak gagal (cek Network tab / server log)

## Dokumentasi

### Arsitektur & Plan

- `docs/HLD.md`
- `docs/LLD.md`
- `docs/Implementation-Plan.md`
- `docs/HLD.pdf`
- `docs/LLD.pdf`
- `docs/Implementation-Plan.pdf`

### Dokumen Konsep

- `docs/konsep/KAK_Aurelux_Beauty.md`
- `docs/konsep/Konsep_Bisnis_Aurelux_Beauty.md`
- `docs/Guidebook-Admin.pdf`

## Catatan Keamanan Penting

- Jangan commit `.env.local` ke repository.
- Jangan menyimpan kredensial produksi (MongoDB, Blob, session secret) di dokumentasi publik.
- Jika kredensial/token sempat terekspos, lakukan rotasi secepatnya.
