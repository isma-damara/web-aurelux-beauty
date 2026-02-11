# KERANGKA ACUAN KERJA (KAK)
# Pengembangan Website AURELUX.BEAUTY

> **Nomor Dokumen:** VGI/26-KAK/0013
> **Tanggal:** 10 Februari 2026
> **Versi:** 1.0
> **Referensi Desain:** [Biagiotti — Product Gallery](https://biagiotti.qodeinteractive.com/elementor/product-gallery/)

---

## 1. Latar Belakang

AURELUX.BEAUTY adalah brand skincare harian yang berfokus pada perawatan kulit sehari-hari yang simpel dan aman. Website ini dikembangkan sebagai **media branding dan product showcase**, bukan platform e-commerce. Dokumen KAK ini disusun agar developer memiliki panduan yang jelas dalam hal **tampilan, tata letak, warna, menu, dan ruang lingkup** pengembangan.

---

## 2. Tujuan Website

| No | Tujuan | Keterangan |
|----|--------|------------|
| 1 | **Brand Awareness** | Memperkenalkan brand dan membangun kepercayaan |
| 2 | **Official Presence** | Menampilkan identitas resmi perusahaan secara profesional |
| 3 | **Product Showcase** | Menampilkan produk dengan visual besar, menarik, dan dominan |
| 4 | **Lead Generation** | Mengarahkan calon pelanggan ke WhatsApp untuk pembelian |

---

## 3. Ruang Lingkup Pekerjaan

### 3.1 Halaman Publik (Frontend)

Website terdiri dari **single-page layout** dengan section-section berikut:

| No | Section | Prioritas |
|----|---------|-----------|
| 1 | Header & Navigasi | Wajib |
| 2 | Hero Section (dengan video background) | Wajib |
| 3 | Produk Showcase | Wajib |
| 4 | Tentang Kami | Wajib |
| 5 | CTA WhatsApp & Kontak | Wajib |
| 6 | Footer | Wajib |

### 3.2 Admin Panel (Backend)

Admin panel diperlukan untuk mengelola konten website tanpa harus mengedit kode secara langsung:

| No | Fitur Admin | Keterangan |
|----|-------------|------------|
| 1 | **Manajemen Produk** | CRUD informasi produk (nama, deskripsi, USP, gambar) |
| 2 | **Manajemen Gambar** | Upload, ubah, dan hapus gambar produk |
| 3 | **Manajemen Profil** | Update informasi "Tentang Kami" |
| 4 | **Manajemen Kontak** | Update nomor WhatsApp dan informasi kontak |
| 5 | **Manajemen Video** | Upload/ganti video hero section |
| 6 | **Manajemen Sosial Media** | Update link sosial media |

---

## 4. Panduan Navigasi & Menu

### 4.1 Tipe Navigasi

Gunakan **navigasi horizontal (top navigation)** yang konsisten di seluruh halaman.

**Spesifikasi:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Logo]    HOME   PRODUK   TENTANG KAMI   KONTAK      [☰ Hamburger] │
│                                                       (mobile only)  │
└──────────────────────────────────────────────────────────────────────┘
```

| Elemen | Detail |
|--------|--------|
| **Posisi Logo** | Kiri atas atau tengah atas |
| **Gaya Logo** | Script/handwritten font sesuai identitas brand |
| **Menu Items** | Home · Produk · Tentang Kami · Kontak |
| **Perilaku Scroll** | Sticky header — tetap terlihat saat scroll ke bawah |
| **Warna Header** | Transparan di atas hero, berubah solid putih saat scroll |
| **Mobile** | Collapse menjadi hamburger menu |

### 4.2 Struktur Menu

| Menu | Target | Tipe |
|------|--------|------|
| Home | Section hero / scroll to top | Anchor link |
| Produk | Section showcase produk | Anchor link |
| Tentang Kami | Section profil perusahaan | Anchor link |
| Kontak | Section CTA WhatsApp + info kontak | Anchor link |

> **Catatan:** Karena website berupa single-page, semua menu menggunakan **anchor link** yang melakukan smooth scroll ke section terkait.

---

## 5. Panduan Tampilan Per Section

### 5.1 Hero Section

**Konsep:** Full-screen hero section dengan video teaser sebagai background.

| Elemen | Spesifikasi |
|--------|-------------|
| **Background** | Video teaser brand sebagai background (autoplay, muted, loop) |
| **Overlay** | Gradient overlay semi-transparan agar teks tetap terbaca |
| **Tagline** | *"Tenangkan Kulitmu, Jalani Harimu"* — ditampilkan besar di tengah |
| **Sub-heading** | Deskripsi singkat brand |
| **CTA Button** | Tombol "Lihat Produk" → scroll ke section produk |
| **Tinggi** | 100vh (full viewport height) |

**Referensi Visual:**
- Seperti halaman About Us Biagiotti yang memiliki hero image full-width dengan teks di tengah
- Video menggantikan gambar statis sebagai background
- Pastikan video tidak mengganggu performa loading (lazy load / preload poster image)

```
┌──────────────────────────────────────────────┐
│            [VIDEO BACKGROUND]                │
│                                              │
│          ✦ AURELUX.BEAUTY ✦                  │
│    "Tenangkan Kulitmu, Jalani Harimu"        │
│                                              │
│          [ Lihat Produk ↓ ]                  │
│                                              │
└──────────────────────────────────────────────┘
```

### 5.2 Section Produk

**Konsep:** Menampilkan 2 produk utama secara besar dan menonjol. Karena hanya ada 2 produk, gunakan layout **side-by-side** (2 kolom) yang masing-masing memiliki tampilan besar dan detail.

#### Layout Desktop

```
┌─────────────────────────┬─────────────────────────┐
│                         │                         │
│   [GAMBAR PRODUK 1]     │   [GAMBAR PRODUK 2]     │
│      (Besar)            │      (Besar)            │
│                         │                         │
│  Brightening Face       │  Crystal Bright         │
│  Spray Toner            │  Moisturizer            │
│                         │                         │
│  [Quick View]           │  [Quick View]           │
│  [Pesan via WhatsApp]   │  [Pesan via WhatsApp]   │
│                         │                         │
└─────────────────────────┴─────────────────────────┘
```

#### Layout Mobile

```
┌─────────────────────────┐
│   [GAMBAR PRODUK 1]     │
│      (Full-width)       │
│  Brightening Face       │
│  Spray Toner            │
│  [Quick View]           │
│  [Pesan via WhatsApp]   │
├─────────────────────────┤
│   [GAMBAR PRODUK 2]     │
│      (Full-width)       │
│  Crystal Bright         │
│  Moisturizer            │
│  [Quick View]           │
│  [Pesan via WhatsApp]   │
└─────────────────────────┘
```

#### Fitur Quick View

Saat user mengklik tombol **Quick View**, tampilkan **popup/modal** yang berisi:

| Elemen Quick View | Keterangan |
|-------------------|------------|
| **Gambar Produk** | Gambar besar produk (bisa swipe jika ada banyak angle) |
| **Nama Produk** | Judul lengkap produk |
| **USP** | Unique Selling Proposition produk |
| **Deskripsi** | Penjelasan detail produk |
| **Bahan/Ingredients** | Daftar bahan utama (jika tersedia) |
| **Cara Pakai** | Instruksi penggunaan |
| **Tombol CTA** | "Pesan via WhatsApp" → link ke WhatsApp |
| **Tombol Close** | Tombol X untuk menutup modal |

**Spesifikasi Modal:**
- Background overlay gelap semi-transparan
- Animasi muncul: fade-in + scale-up halus
- Dapat ditutup dengan klik di luar modal atau tombol X
- Responsif di semua ukuran layar

#### Interaksi Hover (Desktop Only)

Mengadopsi gaya Biagiotti:
- **Default state:** Tampilkan gambar produk saja (clean, minimal)
- **Hover state:** Tampilkan overlay ringan dengan nama produk, tombol Quick View, dan tombol CTA WhatsApp
- **Transisi:** Fade-in halus (durasi ~300ms)

### 5.3 Section Tentang Kami

**Konsep:** Section informatif yang menceritakan identitas dan nilai brand.

```
┌──────────────────────────────────────────────┐
│                                              │
│              perfect shades                  │ ← teks dekoratif (script font)
│        TENTANG AURELUX BEAUTY                │ ← heading utama (serif)
│                                              │
│   [Deskripsi profil perusahaan yang          │
│    menceritakan visi, misi, dan              │
│    komitmen brand terhadap perawatan          │
│    kulit yang aman dan nyaman]               │
│                                              │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│   │ 100%    │  │  2      │  │  ✓      │    │
│   │ Produk  │  │ Produk  │  │  BPOM   │    │
│   │ Aman    │  │ Unggulan│  │ Resmi   │    │
│   └─────────┘  └─────────┘  └─────────┘    │
│                                              │
└──────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|--------|-------------|
| **Sub-heading dekoratif** | Font script/handwritten, warna aksen muda |
| **Heading utama** | Font serif, uppercase, letter-spacing lebar |
| **Deskripsi** | Font sans-serif, warna abu-abu tua, max-width 700px, text-align center |
| **Statistik/Highlight** | Counter atau badge sederhana (opsional) |

### 5.4 Section CTA & Kontak

**Konsep:** Section yang mendorong pengunjung untuk menghubungi via WhatsApp.

```
┌──────────────────────────────────────────────┐
│                                              │
│         Tertarik Dengan Produk Kami?          │
│                                              │
│   Konsultasikan kebutuhan skincare Anda      │
│   langsung dengan tim kami                   │
│                                              │
│       [ 💬 Hubungi via WhatsApp ]            │
│                                              │
│   ──────────────────────────────             │
│                                              │
│   📍 Jl. KH Abdullah Syafei No.23 A         │
│      Kebon Baru, Tebet, Jakarta Selatan      │
│   📧 Aureluxbeautycare@gmail.com            │
│   📞 0858-6355-7320 (PIC: Fazri)            │
│                                              │
└──────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|--------|-------------|
| **Heading CTA** | Font serif, ukuran besar |
| **Tombol WhatsApp** | Warna hijau WhatsApp (#25D366), ukuran besar, mencolok |
| **Link WhatsApp** | Format: `https://wa.me/6285863557320?text=[pesan otomatis]` |
| **Info Kontak** | Alamat, email, dan nomor telepon |

### 5.5 Footer

```
┌──────────────────────────────────────────────┐
│                                              │
│           AURELUX.BEAUTY                     │
│   "Tenangkan Kulitmu, Jalani Harimu"         │
│                                              │
│      [FB]  [IG]  [TikTok]  [Twitter]         │
│                                              │
│   Home  ·  Produk  ·  Tentang Kami  ·  Kontak│
│                                              │
│   © 2026 Aurelux Beauty. All rights reserved │
│                                              │
└──────────────────────────────────────────────┘
```

| Elemen | Spesifikasi |
|--------|-------------|
| **Logo** | Versi light/putih dari logo brand |
| **Ikon Sosial Media** | Minimal icon style, sesuai referensi Biagiotti |
| **Menu Footer** | Duplikasi menu utama sebagai text link |
| **Copyright** | Tahun + nama brand |
| **Warna Background** | Gelap (charcoal/dark) atau sesuai palet brand |

---

## 6. Panduan Warna

### 6.1 Prinsip Warna

Palet warna **harus diambil/diadaptasi dari warna produk asli** yang tersedia di Google Drive. Warna yang digunakan harus mencerminkan karakter brand: **tenang, lembut, dan menenangkan**.

### 6.2 Referensi Palet

Berikut panduan umum yang disesuaikan dengan referensi Biagiotti dan identitas Aurelux:

| Fungsi | Panduan Warna | Contoh Penggunaan |
|--------|---------------|-------------------|
| **Background Utama** | Putih bersih atau off-white | Body, section backgrounds |
| **Background Sekunder** | Krem muda / abu-abu sangat muda | Alternate section backgrounds |
| **Warna Primer** | Diambil dari warna dominan produk | Heading, aksen, border |
| **Warna Aksen** | Diambil dari warna sekunder produk | Hover state, highlight, dekorasi |
| **Teks Utama** | Hitam atau charcoal (#333) | Heading, judul |
| **Teks Sekunder** | Abu-abu tua (#666 — #888) | Deskripsi, paragraf |
| **CTA WhatsApp** | Hijau WhatsApp (#25D366) | Tombol WhatsApp |
| **Overlay** | Hitam semi-transparan (rgba) | Video overlay, modal backdrop |

> **⚠️ PENTING:** Developer wajib mengekstrak warna dari foto produk asli di Google Drive untuk menentukan warna primer dan aksen. Warna harus konsisten di seluruh halaman.

### 6.3 Contoh Penerapan Warna

```
Header        : Background transparan → putih saat scroll
Hero Section  : Video background + overlay gradient
Section Produk: Background putih bersih, border/accent dari warna produk
Tentang Kami  : Background krem muda / off-white
CTA Section   : Background warna primer brand (soft tone)
Footer        : Background gelap (charcoal / dark tone dari palet produk)
```

---

## 7. Panduan Tipografi

### 7.1 Hierarki Font

| Level | Gaya | Penggunaan |
|-------|------|------------|
| **Display / Logo** | Script / Handwritten | Logo brand, teks dekoratif |
| **Heading (H1-H3)** | Serif, elegant, light weight | Judul section, nama produk |
| **Menu & Label** | Sans-serif, uppercase, letter-spacing | Navigasi, tombol, label |
| **Body Text** | Sans-serif, regular weight | Deskripsi, paragraf |

### 7.2 Rekomendasi Font (Google Fonts)

| Penggunaan | Font Suggestion | Alternatif |
|------------|-----------------|------------|
| Logo/Dekoratif | Dancing Script / Pinyon Script | Great Vibes |
| Heading | Playfair Display / Cormorant | Libre Baskerville |
| Body & Menu | Inter / Outfit / Poppins | Montserrat, Lato |

### 7.3 Ukuran Font

| Elemen | Desktop | Mobile |
|--------|---------|--------|
| H1 (Hero title) | 48–64px | 32–40px |
| H2 (Section title) | 36–42px | 28–32px |
| H3 (Product name) | 24–28px | 20–24px |
| Body text | 16–18px | 14–16px |
| Menu items | 13–14px | 14–16px |
| Label/Caption | 12–13px | 12–13px |

---

## 8. Responsivitas

Website **wajib responsif** di semua ukuran layar. Berikut breakpoint yang harus diperhatikan:

| Breakpoint | Ukuran | Keterangan |
|------------|--------|------------|
| **Desktop** | ≥ 1200px | Layout penuh, 2 kolom produk |
| **Tablet** | 768px — 1199px | Layout menyesuaikan, navigasi mungkin collapse |
| **Mobile** | < 768px | Single column, hamburger menu, CTA tetap terlihat |

### Penyesuaian Mobile

| Elemen | Desktop | Mobile |
|--------|---------|--------|
| Navigasi | Horizontal top menu | Hamburger menu |
| Produk | 2 kolom side-by-side | 1 kolom stack |
| Hero video | Autoplay video | Poster image (fallback) + play button |
| Quick View | Modal centered | Modal full-screen / bottom sheet |
| CTA WhatsApp | Di section kontak | Floating button (selalu terlihat) |

> **⚠️ PENTING:** Pada mobile, tambahkan **floating WhatsApp button** di pojok kanan bawah yang selalu terlihat saat scroll.

---

## 9. Animasi & Interaksi

### 9.1 Daftar Animasi

| Elemen | Animasi | Trigger |
|--------|---------|---------|
| Section content | Fade-in + slide-up halus | Scroll into viewport |
| Gambar produk | Scale-up halus (1.0 → 1.03) | Hover |
| Hover overlay | Fade-in | Hover |
| Quick View modal | Fade-in + scale-up | Klik tombol |
| Navigation header | Blur/solid background | Scroll > 100px |
| CTA button | Subtle pulse / glow | Idle (periodic) |

### 9.2 Prinsip Animasi

- **Durasi:** 200ms — 400ms (tidak terlalu lambat, tidak terlalu cepat)
- **Easing:** ease-in-out atau cubic-bezier untuk kesan premium
- **Prinsip:** Animasi harus **halus dan elegan**, bukan mencolok atau berlebihan
- **Performa:** Gunakan `transform` dan `opacity` untuk animasi yang tidak memicu layout reflow

---

## 10. Aset yang Disediakan

| No | Aset | Status | Sumber |
|----|------|--------|--------|
| 1 | Foto produk (Toner & Moisturizer) | ✅ Tersedia | Google Drive (link terpisah) |
| 2 | Video teaser brand | ✅ Tersedia | Google Drive (link terpisah) |
| 3 | Logo brand | ⏳ Menyusul | Dari tim produksi Kreatifindo |
| 4 | Profil perusahaan (copywriting) | ⏳ Menyusul | Dari tim Kreatifindo |
| 5 | Warna brand (dari produk) | 🎨 Ekstrak dari foto | Developer mengekstrak dari aset |

---

## 11. Produk yang Ditampilkan

| No | Nama Produk | Tipe | USP |
|----|-------------|------|-----|
| 1 | **Aurelux Brightening Face Spray Toner** | Spray Toner | Toner spray pencerah harian yang membantu menenangkan iritasi ringan |
| 2 | **Aurelux Crystal Bright Moisturizer** | Moisturizer | Moisturizer ringan harian yang menjaga kelembaban dan kesehatan kulit |

---

## 12. Informasi Kontak (untuk integrasi)

| Data | Nilai |
|------|-------|
| **WhatsApp** | 0858-6355-7320 |
| **PIC** | Fazri |
| **Email** | Aureluxbeautycare@gmail.com |
| **Alamat** | Jl. KH Abdullah Syafei No.23 A, Kebon Baru, Tebet, Jakarta Selatan |
| **Format WA Link** | `https://wa.me/6285863557320?text=Halo, saya tertarik dengan produk Aurelux Beauty` |

---

## 13. Referensi Desain

### 13.1 Website Referensi Utama

**Biagiotti** — https://biagiotti.qodeinteractive.com/elementor/product-gallery/

Elemen yang diadopsi dari referensi:

| Elemen | Referensi | Adaptasi untuk Aurelux |
|--------|-----------|------------------------|
| **Layout navigasi** | Top horizontal + logo script di tengah | Sama, dengan menu anchor link |
| **Tampilan produk** | Grid gallery dengan hover effect | 2 kolom side-by-side (hanya 2 produk) |
| **Quick View** | Modal popup dengan detail produk | Sama, CTA mengarah ke WhatsApp |
| **Tipografi** | Script + Serif + Sans-serif hierarchy | Sama |
| **Warna** | Putih, krem, soft pink/peach | Disesuaikan dengan warna produk asli |
| **Whitespace** | Generous whitespace, clean layout | Sama — minimalis dan lapang |
| **Hover effect** | Detail muncul saat hover di produk | Sama |
| **Footer** | Minimalis dengan social icons | Sama |

### 13.2 Screenshot Referensi

Halaman berikut dari website Biagiotti dapat dijadikan acuan visual oleh developer:

| Halaman | URL | Acuan Untuk |
|---------|-----|-------------|
| Product Gallery | `/elementor/product-gallery/` | Layout produk & hover effect |
| About Us | `/elementor/about-us/` | Hero image & section profil |
| Landing | `/elementor/landing/` | Overall feel & branding |
| Contact | `/elementor/contact-us/` | Section kontak |

---

## 14. Checklist Developer

Gunakan checklist ini untuk memastikan semua elemen sudah diimplementasi:

### Frontend

- [ ] Header & navigasi horizontal sticky
- [ ] Smooth scroll antar section
- [ ] Hero section dengan video background (autoplay, muted, loop)
- [ ] Video fallback (poster image) untuk mobile / koneksi lambat
- [ ] Section produk 2 kolom (desktop) / 1 kolom (mobile)
- [ ] Hover effect pada card produk (desktop)
- [ ] Quick View modal dengan detail produk lengkap
- [ ] Section Tentang Kami dengan teks dekoratif
- [ ] Section CTA dengan tombol WhatsApp besar
- [ ] Floating WhatsApp button (mobile)
- [ ] Footer dengan social media icons
- [ ] Semua animasi scroll dan transisi
- [ ] Responsif di desktop, tablet, dan mobile
- [ ] SEO meta tags (title, description, og:image)
- [ ] Favicon sesuai brand

### Admin Panel

- [ ] Halaman login admin
- [ ] CRUD produk (nama, deskripsi, USP, gambar)
- [ ] Upload/manage gambar produk
- [ ] Edit konten Tentang Kami
- [ ] Update kontak dan link WhatsApp
- [ ] Upload/ganti video hero
- [ ] Update link sosial media

---

## 15. Catatan Penting

1. **Website ini BUKAN e-commerce** — tidak ada fitur keranjang, checkout, atau pembayaran
2. **Semua CTA mengarah ke WhatsApp** — bukan form order atau keranjang
3. **Gambar produk harus besar dan menonjol** — ini permintaan spesifik klien
4. **Warna final diambil dari foto produk** di Google Drive
5. **Profil perusahaan** akan disediakan oleh tim Kreatifindo (bukan dari klien)
6. **Klien sudah memiliki domain dan hosting sendiri**

---

*Dokumen ini disusun berdasarkan Assessment Document No. VGI/26-ASS/0013 dan Konsep Bisnis Aurelux Beauty, tanggal 10 Februari 2026.*
*Referensi desain: Biagiotti by Qode Interactive (https://biagiotti.qodeinteractive.com)*
