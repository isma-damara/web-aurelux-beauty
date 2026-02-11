# High Level Design (HLD) - Aurelux Beauty

Tanggal: 2026-02-11  
Repo: `aurelux-beauty` (monorepo)

## 1. Tujuan & Ruang Lingkup

**Tujuan**

- Menyediakan katalog produk kecantikan yang ringan dan cepat untuk browsing.
- Memudahkan user melihat detail produk, menyimpan wishlist, dan lanjut order via WhatsApp / marketplace.

**Di dalam scope (saat ini)**

- Frontend katalog berbasis Next.js App Router.
- Sumber data **dummy** (code-driven) untuk produk dan promo.
- Wishlist berbasis `localStorage` (tanpa login).
- Deep-linking untuk modal (menggunakan query param `pid`) dan halaman detail produk (`/products/[id]`).

**Di luar scope (saat ini)**

- Backend/API produksi, database, admin panel, autentikasi, pembayaran, manajemen stok real-time.

## 2. Gambaran Sistem

Monorepo berisi:

- `apps/frontend`: aplikasi Next.js (katalog).
- `apps/backend`: placeholder (belum diimplementasi).
- `docs`: dokumentasi.

Frontend saat ini berjalan tanpa backend. Data produk/promo disimpan sebagai file JS dan dibaca lewat service layer internal.

## 3. Arsitektur High-Level

### 3.1 Context Diagram

```mermaid
flowchart LR
  U[User (Browser)] -->|HTTP/HTTPS| FE[Next.js Frontend]
  FE -->|Open link| WA[WhatsApp wa.me]
  FE -->|Open link| SH[Shopee]
  FE -->|Open link| TP[Tokopedia]
```

### 3.2 Logical Architecture (Frontend)

```mermaid
flowchart TB
  subgraph NEXT[Next.js App (apps/frontend)]
    A[App Router Pages\napps/frontend/app] --> C[UI Components\napps/frontend/components]
    A --> S[Service Layer\napps/frontend/server/*/service.js]
    S --> D[Dummy Content\napps/frontend/content/*.js]
    C --> L[Client-side State\napps/frontend/lib/wishlist.js\n(localStorage)]
    C --> O[Order Link Builder\napps/frontend/lib/orderLinks.js]
  end
```

## 4. Komponen Utama

### 4.1 Routing / Pages (App Router)

Sumber: `apps/frontend/app/`

- `/` (Home): `apps/frontend/app/page.js`
  - Menampilkan hero, kategori, promo aktif, featured/trending, testimonial, notes.
  - Fetch data via:
    - `apps/frontend/server/products/service.js` -> `listProducts()`
    - `apps/frontend/server/promos/service.js` -> `listActivePromos()`
- `/products`: `apps/frontend/app/products/page.js`
  - Menampilkan grid produk + filter/sort.
  - Membuka modal detail via query param `?pid=<productId>`.
- `/products/[id]`: `apps/frontend/app/products/[id]/page.js`
  - Halaman detail produk yang bisa di-share.
  - Fetch data via `getProductById(id)`.
- `/wishlist`: `apps/frontend/app/wishlist/page.js`
  - Menampilkan wishlist dari browser.
- `/about`: `apps/frontend/app/about/page.js`
  - Halaman info brand (konten dummy) + CTA WhatsApp bila env tersedia.

### 4.2 Service Layer (Server-side Modules)

Sumber: `apps/frontend/server/`

- `apps/frontend/server/products/service.js`
  - `listProducts()`: membaca array produk dari `apps/frontend/content/products.js`, melakukan normalisasi field.
  - `getProductById(id)`: lookup by `id` lalu normalisasi.
  - Catatan: mutasi sengaja dihapus (catalog code-driven).
- `apps/frontend/server/promos/service.js`
  - `listPromos()` dan `listActivePromos()`: membaca dari `apps/frontend/content/promos.js`.

Karena sumber data lokal (file), service ini deterministik dan tidak melakukan I/O jaringan/database.

### 4.3 UI Components (Client & Server Components)

Sumber: `apps/frontend/components/`

- `CatalogClient.jsx` (**client component**)
  - Filter kategori dari URL (`cat`) dan state internal.
  - Sort (featured/price/name).
  - Mengubah link kartu produk menjadi `/products?pid=...` agar modal bisa dibuka tanpa pindah page.
- `ProductModal.jsx` (**client component**)
  - Membaca `pid` dari query string.
  - Menutup modal dengan `router.replace()` menghapus `pid` (tanpa scroll).
  - Menyediakan tombol Order (Shopee/Tokopedia/WhatsApp) via `apps/frontend/lib/orderLinks.js`.
  - Menyediakan tombol wishlist via `WishlistButton.jsx`.
- `WishlistClient.jsx` (**client component**)
  - Render isi wishlist dari `localStorage` melalui hook `useWishlist()`.
- `WishlistButton.jsx` (**client component**)
  - Toggle item wishlist (add/remove).
- `Header.jsx` (**client component**)
  - Navigasi dan efek visual “hero mode” dengan `IntersectionObserver`.
- `Footer.jsx` (server component default)
  - Menampilkan link berdasarkan env publik (WhatsApp, Shopee Store, Tokopedia Store).
- `WhatsAppButton.jsx` (**client component**)
  - Tombol floating WA jika `NEXT_PUBLIC_WHATSAPP_NUMBER` ada.

## 5. Model Data

### 5.1 Product

Sumber: `apps/frontend/content/products.js`  
Dinormalisasi oleh: `apps/frontend/server/products/service.js`

Field yang dipakai UI (ringkas):

- `id` (string, unik)
- `name` (string)
- `category` (string)
- `priceIdr` (number|null)
- `size` (string)
- `description` (string)
- `imageUrl` (string, path relatif ke `public/` atau absolute URL)
- `shopeeUrl` (string, optional)
- `tokopediaUrl` (string, optional)

### 5.2 Promo

Sumber: `apps/frontend/content/promos.js`  
Dinormalisasi oleh: `apps/frontend/server/promos/service.js`

Field yang dipakai UI:

- `id` (string, unik)
- `active` (boolean)
- `badge`, `title`, `subtitle`, `description` (string)
- `code` (string)
- `validText` (string)
- `ctaLabel` (string)
- `ctaHref` (string, default `/products`)

### 5.3 Wishlist Item

Sumber penyimpanan: `localStorage` key `aurelux:wishlist` (lihat `apps/frontend/lib/wishlist.js`).

Item yang disimpan adalah subset product:

- `id`, `name`, `category`, `priceIdr`, `size`, `imageUrl`

## 6. Alur Utama (User Flows)

### 6.1 Browse Home

1. Request ke `/`.
2. Server Component memanggil `listProducts()` dan `listActivePromos()`.
3. HTML dikirim, browser render, komponen client (Header/Scroller/WA button) aktif di sisi client.

### 6.2 Browse Products + Modal Detail

1. User buka `/products`.
2. Server Component fetch `listProducts()` lalu render `CatalogClient` + `ProductModal`.
3. User klik produk:
   - URL berubah menjadi `/products?pid=<id>` (tanpa scroll).
   - `ProductModal` membaca `pid` dari query, mencari produk dari `items` yang sudah dipass.
4. User klik close/ESC:
   - `pid` dihapus via `router.replace()` sehingga modal tertutup.

### 6.3 Shareable Product Detail Page

1. User buka `/products/<id>`.
2. Server Component memanggil `getProductById(id)`.
3. Jika tidak ditemukan, render halaman “Produk tidak ditemukan”.

### 6.4 Wishlist

1. User klik tombol wishlist pada modal (`WishlistButton.jsx`).
2. `apps/frontend/lib/wishlist.js` menulis ke `localStorage` dan broadcast ke subscriber via `useSyncExternalStore`.
3. Halaman `/wishlist` membaca snapshot wishlist dan render kartu-kartu produk.

### 6.5 Order Links

Sumber: `apps/frontend/lib/orderLinks.js`

- Shopee/Tokopedia:
  - Prioritas: `product.shopeeUrl` / `product.tokopediaUrl`.
  - Fallback: `NEXT_PUBLIC_SHOPEE_STORE_URL` / `NEXT_PUBLIC_TOKOPEDIA_STORE_URL`.
- WhatsApp:
  - Menghasilkan URL `wa.me/<number>?text=...` berisi template pesan + link detail produk + link gambar (dibuat absolute di browser).

## 7. Konfigurasi & Environment Variables

Contoh env: `apps/frontend/.env.example`

- `NEXT_PUBLIC_WHATSAPP_NUMBER`
  - Nomor WA format internasional tanpa `+` (contoh: `62812...`).
- `NEXT_PUBLIC_SHOPEE_STORE_URL` (optional)
- `NEXT_PUBLIC_TOKOPEDIA_STORE_URL` (optional)

Catatan:

- Semua variabel `NEXT_PUBLIC_*` bersifat **public** (boleh terekspos ke client bundle).
- Jangan simpan secret di `.env.local` dengan prefix `NEXT_PUBLIC_`.

## 8. Build & Run

Root workspace scripts: `package.json`

- `npm install`
- `npm run dev` (menjalankan `apps/frontend`)
- `npm run build`
- `npm run start`

Frontend dependencies utama: Next.js 14 + React 18 (lihat `apps/frontend/package.json`).

## 9. Non-Functional Requirements (NFR) (Ringkas)

- **Performance**: data lokal (file) -> cepat; gambar sebaiknya disiapkan di `apps/frontend/public/images/...`.
- **SEO**: halaman server-rendered (App Router) + metadata per page (contoh: `apps/frontend/app/wishlist/page.js`).
- **Reliability**: tanpa backend berarti minim failure eksternal; link eksternal (WA/marketplace) tetap bisa gagal jika env/link tidak diset.
- **Security**: tidak ada auth; input user hanya query params; validasi link eksternal dilakukan dengan check `http(s)` di `apps/frontend/lib/orderLinks.js`.
- **Maintainability**: perubahan data cukup edit `apps/frontend/content/products.js` dan `apps/frontend/content/promos.js`.

## 10. Batasan & Risiko

- Data hardcoded: update produk/promo butuh deploy ulang.
- Wishlist hanya per-browser (tidak sinkron antar device).
- Tidak ada stok, checkout, atau tracking order.
- `NEXT_PUBLIC_*` dibundle ke client: pastikan memang hanya data publik.

## 11. Roadmap Backend (Opsional)

`apps/backend` saat ini placeholder. Evolusi yang realistis:

- Menambahkan API (REST/GraphQL) untuk `products`, `promos`, `inventory`, dan `orders`.
- Menambahkan admin panel untuk CRUD data produk/promo + upload image.
- Mengganti `apps/frontend/server/*/service.js` agar fetch dari backend (dengan caching) alih-alih import file.

## 12. Appendix: Struktur Folder (Ringkas)

- `apps/frontend/app/` (routes/pages)
- `apps/frontend/components/` (UI components, campuran client/server)
- `apps/frontend/content/` (dummy data: home/products/promos)
- `apps/frontend/server/` (service layer untuk baca & normalisasi content)
- `apps/frontend/lib/` (helper: currency, wishlist store, link builder)
- `apps/frontend/public/` (asset statis: images, fonts)
