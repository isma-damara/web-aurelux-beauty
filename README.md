# Aurelux Beauty

Monorepo untuk website katalog Aurelux Beauty (public site) dan admin panel pengelolaan konten.

## Ringkasan

- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS
- Admin panel: route `/admin` dengan login berbasis MongoDB
- Konten: MongoDB (`CONTENT_STORE_DRIVER=mongo`, runtime mongo-only)
- Media upload: disimpan ke `apps/frontend/public/uploads`

## Fitur Utama

### Public Website

- Sticky header + navigasi anchor section
- Hero banner (title, subtitle, video/poster/image)
- Section produk + quick view modal
- Section tentang kami, kontak, sosial media
- Floating WhatsApp button
- Responsive desktop/tablet/mobile

### Admin Panel

- Login admin (`/admin/login`)
- Produk: tambah, edit, hapus (hard delete)
- Media produk: upload/ganti gambar card dan detail
- Profil: edit tentang kami, kontak, sosial media
- Video Banner: edit teks banner terpisah dari media banner
- Upload media via API admin (`/api/admin/media`)

## Arsitektur Repo

```text
aurelux-beauty/
|-- apps/
|   |-- frontend/                      # Next.js app aktif
|   |   |-- app/
|   |   |   |-- page.js               # Home page entry
|   |   |   |-- home/                 # Komponen halaman home
|   |   |   |-- admin/                # Halaman admin panel
|   |   |   `-- api/admin/            # API admin (auth/content/products/media/settings)
|   |   |-- lib/                      # Content store, mongo client, auth, media
|   |   |-- scripts/                  # Setup schema/admin/migrasi mongo
|   |   |-- data/site-content.json    # Arsip konten awal untuk migrasi ke MongoDB
|   |   `-- public/                   # Aset statis + uploads
|   `-- backend/                      # Placeholder (belum dipakai)
`-- docs/                             # Dokumen konsep & HLD
```

## Prasyarat

- Node.js `>= 18.17` (disarankan 20 LTS)
- npm `>= 9`
- MongoDB (wajib)

## Quick Start (Lokal)

1. Install dependency frontend:

```bash
npm run install:frontend
```

2. Salin env:

```powershell
Copy-Item apps/frontend/.env.example apps/frontend/.env.local
```

3. Jalankan app:

```bash
npm run dev
```

4. Buka:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Konfigurasi Environment

Lokasi file: `apps/frontend/.env.local`

| Variable | Default | Keterangan |
|---|---|---|
| `CONTENT_STORE_DRIVER` | `mongo` | Wajib `mongo` (runtime mongo-only) |
| `MONGODB_URI` | `mongodb://localhost:27017` | URI koneksi MongoDB |
| `MONGODB_DB_NAME` | `aurelux_beauty` | Nama database |
| `MONGODB_PRODUCTS_COLLECTION` | `products` | Collection produk |
| `MONGODB_SETTINGS_COLLECTION` | `site_settings` | Collection settings konten |
| `MONGODB_SETTINGS_DOCUMENT_ID` | `main` | ID dokumen settings tunggal |
| `MONGODB_MEDIA_COLLECTION` | `media_assets` | Collection metadata media |
| `MONGODB_ACTIVITY_COLLECTION` | `activity_logs` | Collection activity log |
| `MONGODB_ADMINS_COLLECTION` | `admins` | Collection akun admin |
| `ADMIN_SEED_EMAIL` | `admin@aurelux.local` | Email admin awal (seed) |
| `ADMIN_SEED_PASSWORD` | `Admin123#` | Password admin awal (seed) |
| `ADMIN_SEED_ROLE` | `admin` | Role admin (saat ini hanya `admin`) |
| `ADMIN_SESSION_SECRET` | - | Secret cookie session admin (wajib kuat di production) |

## Setup MongoDB (Disarankan Untuk Production)

1. Isi `MONGODB_URI` dan variabel Mongo lain di `.env.local`.
2. Cek koneksi:

```bash
npm run check:mongo
```

3. Buat/upgrade schema + index:

```bash
npm run setup:mongo:schema
```

4. Seed akun admin:

```bash
npm run setup:mongo:admin
```

5. (Opsional) Migrasi konten awal dari JSON lokal ke MongoDB:

```bash
npm run migrate:content:mongo
```

6. Pastikan driver Mongo aktif:

```env
CONTENT_STORE_DRIVER=mongo
```

7. Restart dev server.

Catatan:
- Data settings/produk/admin dibaca dan ditulis ke MongoDB.
- File media upload tetap di filesystem (`public/uploads`), sedangkan metadata disimpan di collection `media_assets`.

## Model Data MongoDB

| Collection | Fungsi |
|---|---|
| `products` | Data produk (nama, USP, deskripsi, ingredients, usage, media) |
| `site_settings` | Hero/banner, about, contact, socials, footer |
| `media_assets` | Metadata file media upload + relasi penggunaan |
| `activity_logs` | Log aktivitas admin di API |
| `admins` | User admin + password hash + status aktif |

## Auth & Akses Admin

- Route yang diproteksi: `/admin/*` dan `/api/admin/*`
- Route publik: website utama (`/`) tidak perlu login
- Login memakai email/password dari collection `admins`
- Session disimpan pada cookie httpOnly `aurelux_admin_session`
- Role yang diizinkan saat ini: `admin`

## Scripts (Root)

| Script | Fungsi |
|---|---|
| `npm run dev` | Menjalankan frontend dev server |
| `npm run build` | Build production frontend |
| `npm run start` | Menjalankan hasil build frontend |
| `npm run lint` | Lint frontend |
| `npm run install:frontend` | Install dependency frontend |
| `npm run check:mongo` | Cek koneksi MongoDB |
| `npm run setup:mongo:schema` | Setup validator + index MongoDB |
| `npm run setup:mongo:admin` | Seed/update akun admin |
| `npm run migrate:content:mongo` | Migrasi konten local JSON ke MongoDB |

## Troubleshooting Singkat

- Error `Module not found: Can't resolve 'mongodb'`:
  jalankan `npm run install:frontend`.
- Muncul error `Aplikasi dikunci ke MongoDB`:
  set `CONTENT_STORE_DRIVER=mongo` di `apps/frontend/.env.local`.
- Login admin gagal:
  pastikan `setup:mongo:admin` sudah dijalankan dan koleksi `admins` terisi.
- Install npm gagal karena proxy/offline:
  nonaktifkan sementara proxy env (`HTTP_PROXY`, `HTTPS_PROXY`, `ALL_PROXY`) lalu install ulang.

## Deployment

### Vercel

- Root directory: `apps/frontend`
- Build command: `npm run build`
- Start command: `npm run start` (default Next.js)
- Set semua env di dashboard Vercel (terutama Mongo dan session secret)

### VPS / Node Server

```bash
npm run install:frontend
npm run build
npm run start
```

## Dokumen Referensi

- `docs/konsep/KAK_Aurelux_Beauty.md`
- `docs/konsep/Konsep_Bisnis_Aurelux_Beauty.md`
- `docs/HLD.md`
