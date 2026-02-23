# HLD (High Level Design) - Aurelux Beauty

Baseline dokumen ini disusun berdasarkan implementasi project pada 23 Februari 2026.

## 1. Tujuan Sistem

Aurelux Beauty adalah website katalog produk skincare dengan admin panel terintegrasi untuk mengelola:
- katalog produk
- konten hero/banner (teks, video, poster, gambar produk hero)
- profil perusahaan, kontak, dan sosial media
- media upload (image/video)

Tujuan utama arsitektur:
- konten public website dapat diubah tanpa edit code
- admin panel sederhana, cepat, dan aman untuk operasional harian
- storage konten terpusat di MongoDB
- media storage fleksibel (local filesystem atau Vercel Blob)

## 2. Scope Sistem

### In Scope
- Public landing page (`/`)
- Admin panel (`/admin/*`)
- API internal admin (`/api/admin/*`)
- Autentikasi admin berbasis email/password + session cookie
- Penyimpanan konten dan produk di MongoDB
- Upload media image/video
- Activity log perubahan konten

### Out of Scope (saat ini)
- Multi-role selain `admin`
- Multi-tenant / multi-brand
- Checkout/payment e-commerce
- RBAC granular
- CDN/image optimization khusus (Next Image diset `unoptimized`)

## 3. Gambaran Arsitektur Tingkat Tinggi

```text
+---------------------+          +---------------------------+
| Browser Public User | -------> | Next.js App (apps/)       |
| Browser Admin User  |          | - App Router              |
+---------------------+          | - Public UI (/ )          |
                                 | - Admin UI (/admin/*)     |
                                 | - Admin API (/api/admin/*)|
                                 +-------------+-------------+
                                               |
                 +-----------------------------+-----------------------------+
                 |                                                           |
                 v                                                           v
      +-------------------------+                              +------------------------+
      | MongoDB                 |                              | Media Storage          |
      | - products              |                              | - Local /public/uploads|
      | - site_settings         |                              | - Vercel Blob          |
      | - media_assets          |                              +------------------------+
      | - activity_logs         |
      | - admins                |
      +-------------------------+
```

## 4. Komponen Utama

### 4.1 Public Website
- Route utama: `/`
- Data source: `readContent()` dari repository (MongoDB)
- Render mode: server component untuk fetch awal, client component untuk interaksi UI
- Fitur utama:
  - hero banner
  - promo video
  - product list + modal quick view
  - about section
  - contact + CTA WhatsApp
  - footer + social links

### 4.2 Admin Panel
- Route utama:
  - `/admin/products`
  - `/admin/profile`
  - `/admin/video`
- UI berbasis client-side fetch ke API internal
- Fitur:
  - CRUD produk
  - edit profile/contact/social
  - edit teks dan media banner/video
  - upload/hapus media

### 4.3 Admin API Layer
- Namespace: `/api/admin/*`
- Tanggung jawab:
  - autentikasi session
  - validasi request
  - akses repository konten/produk
  - activity logging
  - upload/hapus media

### 4.4 Content Repository Layer
- Abstraksi akses data aplikasi
- Saat ini dipaksa menggunakan MongoDB (`CONTENT_STORE_DRIVER=mongo`)
- Menyediakan fungsi:
  - read/write konten komposit
  - CRUD produk
  - read/update settings
  - register/remove media metadata
  - append activity log

### 4.5 Persistence Layer (MongoDB)
- Menyimpan data operasional utama
- Koleksi tervalidasi via script schema setup
- Menyimpan audit trail dasar (`activity_logs`)

### 4.6 Media Storage Layer
- `local` driver:
  - file disimpan ke `apps/public/uploads/{images|videos}`
  - cocok untuk local dev / server persisten
- `blob` driver:
  - upload langsung ke Vercel Blob (direct upload)
  - metadata tetap dicatat ke MongoDB

## 5. Alur Bisnis Utama (High Level)

### 5.1 Public Page Load
1. User membuka `/`
2. Next.js server memanggil `readContent()`
3. Repository membaca data dari MongoDB (`products` + `site_settings`)
4. Data digabung dan dinormalisasi
5. Halaman public dirender dan dikirim ke browser

### 5.2 Admin Login
1. Admin submit email/password di `/admin/login`
2. API `/api/admin/auth/login` verifikasi kredensial ke koleksi `admins`
3. Sistem membuat session token HMAC
4. Token disimpan pada cookie httpOnly
5. Admin diarahkan ke halaman admin yang dituju

### 5.3 Update Konten / Produk
1. Admin mengubah data dari UI
2. Admin UI memanggil API admin terkait (`products`, `settings`, atau `content`)
3. API verifikasi session
4. Repository menulis perubahan ke MongoDB
5. Activity log ditambahkan (best effort)
6. UI memuat ulang data terbaru

### 5.4 Upload Media
1. Admin upload file dari UI
2. Jika `local`: file dikirim ke `/api/admin/media`
3. Jika `blob`: client direct upload via `/api/admin/media/upload`
4. Metadata media disimpan di `media_assets`
5. URL media dipakai di form produk/hero/settings

## 6. Keamanan (High Level)

- Middleware melindungi `/admin/*` dan `/api/admin/*`
- Pengecualian hanya untuk endpoint auth (`/api/admin/auth/*`)
- Session cookie:
  - httpOnly
  - sameSite `lax`
  - `secure` di production
- Password admin disimpan sebagai hash `scrypt`
- Validasi URL media untuk mencegah penggunaan URL arbitrer non-managed

## 7. Ketersediaan dan Operasional

- Arsitektur sederhana (monolith Next.js + MongoDB) memudahkan deployment
- Tidak ada queue/worker terpisah saat ini
- Logging aktivitas aplikasi disimpan ke MongoDB (bukan observability platform)
- File upload local tidak cocok untuk runtime ephemeral (mis. Vercel)

## 8. Kelebihan Arsitektur Saat Ini

- Implementasi cepat dan fokus pada kebutuhan bisnis
- Admin panel langsung terhubung ke model konten nyata
- MongoDB schema/index sudah disiapkan dengan script
- Media storage fleksibel (local/blob)
- Audit log perubahan sudah tersedia (basic)

## 9. Batasan Arsitektur Saat Ini

- Belum ada RBAC granular dan multi-user workflow
- Belum ada rate limiting / CSRF protection eksplisit
- Tidak ada observability terpusat (metrics/tracing)
- Belum ada caching strategy yang formal
- Test coverage masih fokus ke util/store tertentu, belum end-to-end

## 10. Rekomendasi Arsitektur Berikutnya (Ringkas)

- Tambah validasi schema request API (Zod/JSON schema runtime)
- Tambah audit viewer dan admin activity dashboard
- Tambah integration test untuk API auth/products/settings/media
- Tambah monitoring error dan health checks produksi
- Definisikan strategi backup MongoDB dan lifecycle media

