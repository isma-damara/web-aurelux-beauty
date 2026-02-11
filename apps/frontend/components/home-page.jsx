"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const NAV_ITEMS = [
  { label: "HOME", href: "#home" },
  { label: "PRODUK", href: "#produk" },
  { label: "TENTANG KAMI", href: "#tentang" },
  { label: "KONTAK", href: "#kontak" }
];
const LEFT_NAV_ITEMS = NAV_ITEMS.slice(0, 2);
const RIGHT_NAV_ITEMS = NAV_ITEMS.slice(2);

const CONTACT = {
  whatsapp: "6285863557320",
  email: "Aureluxbeautycare@gmail.com",
  phone: "0858-6355-7320",
  pic: "Fazri",
  address: "Jl. KH Abdullah Syafei No.23 A, Kebon Baru, Tebet, Jakarta Selatan"
};

const PRODUCTS = [
  {
    id: "toner",
    name: "Brightening Face Spray Toner",
    fullName: "Aurelux Brightening Face Spray Toner",
    cardImage: "/product/product1.jpeg",
    detailImage: "/product/product1.jpeg",
    usp: "Toner spray pencerah harian yang membantu menenangkan iritasi ringan.",
    shortList: ["Niacinamide", "Ceramide NP", "Kojic Acid", "Centella Asiatica Extract"],
    description:
      "Nikmati kesegaran instan dan hidrasi mendalam dengan toner spray premium ini. Formula ringan membantu mencerahkan, menenangkan, dan menjaga kelembaban kulit sepanjang hari.",
    ingredients: ["Niacinamide", "Ceramide NP", "Kojic Acid", "Centella Asiatica Extract"],
    usage:
      "Semprotkan merata ke wajah bersih dari jarak 15-20 cm. Gunakan pagi dan malam sebelum moisturizer atau kapan pun kulit terasa membutuhkan hidrasi."
  },
  {
    id: "moisturizer",
    name: "Crystal Bright Moisturizer",
    fullName: "Aurelux Crystal Bright Moisturizer",
    cardImage: "/product/product4.jpeg",
    detailImage: "/product/product4.jpeg",
    usp: "Moisturizer ringan harian untuk menjaga kelembaban dan kenyamanan kulit.",
    shortList: [
      "Membantu menjaga hidrasi kulit",
      "Membuat kulit terasa lebih halus",
      "Nyaman digunakan pagi dan malam"
    ],
    description:
      "Moisturizer bertekstur ringan dengan formula lembut yang menjaga kulit tetap lembab, halus, dan terlihat sehat. Cocok untuk rutinitas skincare harian.",
    ingredients: ["Glycerin", "Niacinamide", "Ceramide Complex", "Aloe Vera Extract"],
    usage:
      "Aplikasikan secukupnya pada wajah dan leher setelah toner. Gunakan setiap pagi dan malam untuk hasil optimal."
  }
];

function buildWhatsAppLink(message) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  const defaultWhatsAppLink = useMemo(
    () => buildWhatsAppLink("Halo, saya tertarik dengan produk Aurelux Beauty."),
    []
  );

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onEsc = (event) => {
      if (event.key === "Escape") {
        setActiveProduct(null);
      }
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = activeProduct ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeProduct]);

  return (
    <>
      <header className={`site-header ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="header-inner">
          <nav className="site-nav site-nav-left" aria-label="Main navigation left">
            {LEFT_NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>

          <a href="#home" className="brand" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="brand-main">AURELUX</span>
            <span className="brand-sub">BEAUTY</span>
          </a>

          <nav className="site-nav site-nav-right" aria-label="Main navigation right">
            {RIGHT_NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
          </nav>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
        <nav className={`mobile-nav ${isMobileMenuOpen ? "is-open" : ""}`} aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main>
        <section id="home" className="hero reveal">
          <video className="hero-video" autoPlay muted loop playsInline poster="/product/product2.jpeg">
            <source src="/assets/media/hero-teaser.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1>
              Tenangkan Kulitmu,
              <br />
              Jalani Harimu
            </h1>
            <p>
              Skincare harian yang lembut, simpel, dan aman untuk membantu kulit tetap nyaman dan bercahaya sepanjang
              hari.
            </p>
            <a className="btn btn-light" href="#produk">
              Lihat Produk
            </a>
            <div className="hero-trust">
              <div className="trust-logo-bpom">
                <Image src="/logo/Bpom.png" alt="Logo BPOM" width={100} height={100} />
              </div>
              <div className="trust-logo-halal">
                <Image src="/logo/Halal.png" alt="Logo Halal" width={140} height={140} />
              </div>
            </div>
          </div>
          <div className="hero-product">
            <Image
              src="/product/product2.jpeg"
              alt="Produk Aurelux Beauty"
              fill
              priority
              style={{ objectFit: "contain", objectPosition: "center" }}
            />
          </div>
        </section>

        <section id="produk" className="product-section reveal">
          <div className="section-heading">
            <p className="script-text">our products</p>
            <h2>PRODUK UNGGULAN</h2>
          </div>

          <div className="product-grid">
            {PRODUCTS.map((product) => (
              <article key={product.id} className="product-card">
                <div className="product-media">
                  <div className="product-image-frame">
                    <Image
                      src={product.cardImage}
                      alt={product.fullName}
                      fill
                      style={{
                        objectFit: "contain",
                        objectPosition: "center",
                        padding: "18px"
                      }}
                    />
                  </div>
                  <div className="product-hover">
                    <p>{product.fullName}</p>
                    <div className="product-actions">
                      <button className="btn btn-outline" type="button" onClick={() => setActiveProduct(product)}>
                        Quick View
                      </button>
                      <a className="btn btn-whatsapp" href={buildWhatsAppLink(`Halo, saya ingin pesan ${product.fullName}.`)}>
                        Pesan via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="product-copy">
                  <h3>{product.name}</h3>
                  <p className="usp">{product.usp}</p>
                  <ul>
                    {product.shortList.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="product-actions mobile-actions">
                    <button className="btn btn-outline" type="button" onClick={() => setActiveProduct(product)}>
                      Quick View
                    </button>
                    <a className="btn btn-whatsapp" href={buildWhatsAppLink(`Halo, saya ingin pesan ${product.fullName}.`)}>
                      Pesan via WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tentang" className="about-section reveal">
          <div className="section-heading">
            <p className="script-text">tentang kami</p>
            <h2>TENTANG AURELUX BEAUTY</h2>
          </div>
          <p className="about-description">
            AURELUX BEAUTY berkomitmen menghadirkan rangkaian perawatan kulit premium yang aman dan efektif. Filosofi
            kami adalah memadukan bahan pilihan dengan formulasi modern untuk membantu menjaga kelembaban, kenyamanan,
            dan tampilan kulit yang sehat setiap hari.
          </p>
          <div className="about-highlights">
            <div>
              <strong>100%</strong>
              <span>Produk Aman</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Produk Unggulan</span>
            </div>
            <div>
              <strong>BPOM</strong>
              <span>dan Halal</span>
            </div>
          </div>
        </section>

        <section id="kontak" className="contact-section reveal">
          <h2>Tertarik Dengan Produk Kami?</h2>
          <p>Dapatkan konsultasi gratis dan temukan solusi perawatan kulit terbaik untuk Anda.</p>
          <a className="btn btn-whatsapp cta-pulse" href={defaultWhatsAppLink}>
            Hubungi via WhatsApp
          </a>
          <div className="contact-meta">
            <span>{CONTACT.address}</span>
            <span>{CONTACT.email}</span>
            <span>
              {CONTACT.phone} (PIC: {CONTACT.pic})
            </span>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div>
            <p className="brand-main">AURELUX</p>
            <p className="brand-subline">Your Daily Glow. Naturally.</p>
          </div>
          <div className="socials">
            <a href="#" aria-label="Instagram">
              IG
            </a>
            <a href="#" aria-label="Facebook">
              FB
            </a>
            <a href="#" aria-label="TikTok">
              TT
            </a>
          </div>
        </div>
        <nav className="footer-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <p className="copyright">Copyright 2026 Aurelux Beauty. All rights reserved.</p>
      </footer>

      <a className="wa-float" href={defaultWhatsAppLink} aria-label="WhatsApp">
        WA
      </a>

      {activeProduct ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setActiveProduct(null)}>
          <div
            className="quick-modal"
            role="dialog"
            aria-modal="true"
            aria-label={activeProduct.fullName}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-modal" type="button" onClick={() => setActiveProduct(null)} aria-label="Close modal">
              X
            </button>
            <div className="quick-image">
              <div className="quick-image-frame">
                <Image
                  src={activeProduct.detailImage ?? activeProduct.cardImage}
                  alt={activeProduct.fullName}
                  fill
                  style={{
                    objectFit: "cover",
                    objectPosition: "center"
                  }}
                />
              </div>
            </div>
            <div className="quick-copy">
              <h3>{activeProduct.fullName}</h3>
              <p className="quick-usp">
                <strong>USP:</strong> {activeProduct.usp}
              </p>
              <p>{activeProduct.description}</p>

              <h4>Bahan Utama</h4>
              <ul>
                {activeProduct.ingredients.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <h4>Cara Pakai</h4>
              <p>{activeProduct.usage}</p>

              <a
                className="btn btn-whatsapp"
                href={buildWhatsAppLink(`Halo, saya ingin pesan ${activeProduct.fullName}.`)}
              >
                Pesan via WhatsApp
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
