# Aurelux Beauty

Website katalog Aurelux Beauty dengan admin panel untuk manajemen konten terpusat.

## Overview

Aplikasi ini terdiri dari 2 area utama:
- Public website (`/`): landing page produk, hero banner, profil brand, dan CTA WhatsApp.
- Admin panel (`/admin`): pengelolaan produk, profil perusahaan, serta media/text video banner.

Seluruh data konten utama dijalankan dengan MongoDB (`CONTENT_STORE_DRIVER=mongo`).

## Core Features

### Public Website
- Hero banner dinamis (title, subtitle, video, poster, hero product image).
- Product section + quick view modal.
- About, contact, social links, dan footer yang bisa diubah dari admin.
- Floating WhatsApp CTA.
- Responsive untuk desktop dan mobile.

### Admin Panel
- Login admin berbasis MongoDB.
- CRUD produk (tambah, edit, hapus).
- Upload/ganti media produk (card + detail).
- Edit profil bisnis (Tentang Kami, Kontak, Sosial Media).
- Edit teks dan media video banner.
- Activity log untuk perubahan melalui API admin.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- MongoDB (runtime data store)

## Repository Structure

```text
aurelux-beauty/
|-- apps/
|   |-- app/
|   |   |-- page.js                  # Public home page
|   |   |-- home/                    # Komponen halaman publik
|   |   |-- admin/                   # UI admin panel
|   |   `-- api/admin/               # API admin (auth/content/products/media/settings)
|   |-- lib/                         # Mongo client, auth, content/media repository
|   |-- scripts/                     # Script setup schema/admin/migrasi
|   |-- data/site-content.json       # Sumber konten awal (untuk migrasi)
|   `-- public/                      # Aset statis + uploads
`-- docs/                            # Dokumen konsep, HLD, panduan admin
```

## Prerequisites

- Node.js `>= 18.17` (disarankan 20 LTS)
- npm `>= 9`
- MongoDB aktif

## Local Development

1. Install dependency:

```bash
cd apps
npm install
```

2. Salin environment file:

```powershell
Copy-Item .env.example .env.local
```

3. Jalankan development server:

```bash
npm run dev
```

4. Akses aplikasi:
- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Environment Variables

Lokasi: `apps/.env.local`

| Variable | Default | Keterangan |
| --- | --- | --- |
| `CONTENT_STORE_DRIVER` | `mongo` | Wajib `mongo` |
| `MEDIA_STORAGE_DRIVER` | `local` | `local` (dev) atau `cloudinary` (production) |
| `MONGODB_URI` | `mongodb://localhost:27017` | URI MongoDB |
| `MONGODB_DB_NAME` | `aurelux_beauty` | Nama database |
| `MONGODB_PRODUCTS_COLLECTION` | `products` | Collection produk |
| `MONGODB_SETTINGS_COLLECTION` | `site_settings` | Collection settings situs |
| `MONGODB_SETTINGS_DOCUMENT_ID` | `main` | ID dokumen settings |
| `MONGODB_MEDIA_COLLECTION` | `media_assets` | Collection metadata media |
| `MONGODB_ACTIVITY_COLLECTION` | `activity_logs` | Collection audit log |
| `MONGODB_ADMINS_COLLECTION` | `admins` | Collection akun admin |
| `ADMIN_SEED_EMAIL` | `Aureluxbeautycare@gmail.com` | Email akun admin seed |
| `ADMIN_SEED_PASSWORD` | `Admin123#` | Password akun admin seed |
| `ADMIN_SEED_ROLE` | `admin` | Role admin |
| `ADMIN_SESSION_SECRET` | (required) | Secret cookie session admin |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Base URL publik untuk metadata/link absolut |
| `CLOUDINARY_CLOUD_NAME` | - | Wajib jika `MEDIA_STORAGE_DRIVER=cloudinary` |
| `CLOUDINARY_API_KEY` | - | Wajib jika `MEDIA_STORAGE_DRIVER=cloudinary` |
| `CLOUDINARY_API_SECRET` | - | Wajib jika `MEDIA_STORAGE_DRIVER=cloudinary` |
| `CLOUDINARY_UPLOAD_FOLDER` | `aurelux-beauty` | Prefix folder upload di Cloudinary |

## MongoDB Setup

Jalankan dari folder `apps/`:

1. Validasi koneksi MongoDB:

```bash
npm run check:mongo
```

2. Setup validator + index:

```bash
npm run setup:mongo:schema
```

3. Seed atau update akun admin:

```bash
npm run setup:mongo:admin
```

4. (Opsional) migrasi konten awal JSON ke MongoDB:

```bash
npm run migrate:content:mongo
```

## Available Scripts

Semua dijalankan dari folder `apps/`.

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Jalankan app mode development |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | Lint project (Next.js) |
| `npm run check:mongo` | Cek koneksi MongoDB |
| `npm run setup:mongo:schema` | Setup schema/index MongoDB |
| `npm run setup:mongo:admin` | Seed/update akun admin |
| `npm run migrate:content:mongo` | Migrasi konten JSON ke MongoDB |

## Data Model (MongoDB)

| Collection | Fungsi |
| --- | --- |
| `products` | Data produk (nama, USP, deskripsi, ingredients, usage, media) |
| `site_settings` | Hero, about, contact, socials, footer |
| `media_assets` | Metadata file upload dan relasi penggunaan |
| `activity_logs` | Log aktivitas admin |
| `admins` | Akun admin, hash password, status aktif |

## Admin Access & Security

- Route terproteksi: `/admin/*` dan `/api/admin/*`.
- Auth menggunakan email/password dari collection `admins`.
- Session disimpan dalam cookie httpOnly: `aurelux_admin_session`.
- Role yang didukung saat ini: `admin`.

## Deployment

### Vercel

1. Import repository ke Vercel.
2. Set `Root Directory` ke `apps`.
3. Install command: `npm install`
4. Build command: `npm run build`
5. Tambahkan environment variables produksi (minimal):
- `CONTENT_STORE_DRIVER=mongo`
- `MEDIA_STORAGE_DRIVER=cloudinary`
- `MONGODB_URI=<mongodb-atlas-uri>`
- `MONGODB_DB_NAME=aurelux_beauty`
- `MONGODB_PRODUCTS_COLLECTION=products`
- `MONGODB_SETTINGS_COLLECTION=site_settings`
- `MONGODB_SETTINGS_DOCUMENT_ID=main`
- `MONGODB_MEDIA_COLLECTION=media_assets`
- `MONGODB_ACTIVITY_COLLECTION=activity_logs`
- `MONGODB_ADMINS_COLLECTION=admins`
- `ADMIN_SESSION_SECRET=<strong-random-secret>`
- `NEXT_PUBLIC_APP_URL=https://domain-anda.com`
- `CLOUDINARY_CLOUD_NAME=<cloud-name>`
- `CLOUDINARY_API_KEY=<api-key>`
- `CLOUDINARY_API_SECRET=<api-secret>`
- `CLOUDINARY_UPLOAD_FOLDER=aurelux-beauty`

Catatan media upload di Vercel:
- Upload lokal ke `public/uploads` tidak persisten pada serverless filesystem.
- Gunakan `MEDIA_STORAGE_DRIVER=cloudinary` agar upload/hapus media persisten.

### VPS / Node Server

```bash
cd apps
npm install
npm run build
npm run start
```

## Troubleshooting

- `Module not found: Can't resolve 'mongodb'`:
  jalankan `cd apps && npm install`.
- Error runtime terkait content store:
  pastikan `CONTENT_STORE_DRIVER=mongo`.
- Login admin gagal:
  pastikan koleksi admin terisi (`npm run setup:mongo:admin`).
- Perubahan konten tidak muncul:
  refresh browser dan verifikasi data tersimpan di admin panel.

## Documentation

- `docs/HLD.md`
- `docs/konsep/KAK_Aurelux_Beauty.md`
- `docs/konsep/Konsep_Bisnis_Aurelux_Beauty.md`
- `docs/Panduan_Penggunaan_Admin_Panel_Aurelux_Beauty.md`
- `docs/Panduan_Penggunaan_Admin_Panel_Aurelux_Beauty_Client.pdf`
