"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AboutSection from "./about-section";
import ContactSection from "./contact-section";
import {
  DEFAULT_HEADER_OFFSET,
  MOBILE_SCROLL_SPEED_MULTIPLIER,
  SCROLL_DURATION_MAX_MS,
  SCROLL_DURATION_MIN_MS,
  SCROLL_GAP,
  SCROLL_PIXELS_PER_MS,
} from "./constants";
import {
  FALLBACK_CONTENT,
  buildWhatsAppLink,
  easeInOutSine,
  resolveContentData,
  toStringValue,
} from "./content-utils";
import HomeFooter from "./footer";
import HomeHeader from "./header";
import HeroSection from "./hero-section";
import ProductModal from "./product-modal";
import ProductsSection from "./products-section";

export default function HomePage({ content }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const scrollAnimationFrameRef = useRef(null);
  const isProgrammaticScrollingRef = useRef(false);

  const resolved = useMemo(() => resolveContentData(content), [content]);

  const defaultWhatsAppLink = useMemo(
    () =>
      buildWhatsAppLink(
        resolved.contact.whatsapp,
        "Halo, saya tertarik dengan produk Aurelux Beauty.",
      ),
    [resolved.contact.whatsapp],
  );

  const heroTitleLines = useMemo(() => {
    const title = toStringValue(
      resolved.hero.title,
      FALLBACK_CONTENT.hero.title,
    );
    return title.split("\n").filter((line) => line.trim());
  }, [resolved.hero.title]);

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
      { threshold: 0.2 },
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

  const stopScrollAnimation = useCallback(() => {
    if (scrollAnimationFrameRef.current) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }
    isProgrammaticScrollingRef.current = false;
  }, []);

  useEffect(() => {
    return () => {
      stopScrollAnimation();
    };
  }, [stopScrollAnimation]);

  useEffect(() => {
    const cancelOnManualInteraction = () => {
      if (isProgrammaticScrollingRef.current) {
        stopScrollAnimation();
      }
    };

    window.addEventListener("wheel", cancelOnManualInteraction, {
      passive: true,
    });
    window.addEventListener("touchstart", cancelOnManualInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", cancelOnManualInteraction);

    return () => {
      window.removeEventListener("wheel", cancelOnManualInteraction);
      window.removeEventListener("touchstart", cancelOnManualInteraction);
      window.removeEventListener("keydown", cancelOnManualInteraction);
    };
  }, [stopScrollAnimation]);

  const getScrollTopTarget = useCallback((hash) => {
    const targetId = toStringValue(hash).replace(/^#/, "");
    const targetNode = targetId ? document.getElementById(targetId) : null;
    if (!targetNode) {
      return null;
    }

    const headerNode = document.querySelector(".site-header");
    const headerHeight = headerNode
      ? headerNode.getBoundingClientRect().height
      : DEFAULT_HEADER_OFFSET;
    const top =
      window.scrollY +
      targetNode.getBoundingClientRect().top -
      headerHeight -
      SCROLL_GAP;

    return Math.max(0, top);
  }, []);

  const scrollToHashTarget = useCallback(
    (hash, { updateHash = true } = {}) => {
      const targetTop = getScrollTopTarget(hash);
      if (targetTop === null) {
        return;
      }

      stopScrollAnimation();

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        window.scrollTo(0, targetTop);
      } else {
        const startTop = window.scrollY;
        const delta = targetTop - startTop;
        const startTime = performance.now();
        const distance = Math.abs(delta);
        const isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
        const speedMultiplier = isMobileViewport ? MOBILE_SCROLL_SPEED_MULTIPLIER : 1;
        const duration = Math.min(
          SCROLL_DURATION_MAX_MS / speedMultiplier,
          Math.max(
            SCROLL_DURATION_MIN_MS / speedMultiplier,
            distance / (SCROLL_PIXELS_PER_MS * speedMultiplier),
          ),
        );

        isProgrammaticScrollingRef.current = true;

        const animate = (timestamp) => {
          const elapsed = timestamp - startTime;
          const progress = Math.min(1, elapsed / duration);
          const eased = easeInOutSine(progress);
          window.scrollTo(0, startTop + delta * eased);

          if (progress < 1) {
            scrollAnimationFrameRef.current =
              window.requestAnimationFrame(animate);
          } else {
            isProgrammaticScrollingRef.current = false;
            scrollAnimationFrameRef.current = null;
          }
        };

        scrollAnimationFrameRef.current = window.requestAnimationFrame(animate);
      }

      if (updateHash) {
        window.history.pushState(null, "", hash);
      }
    },
    [getScrollTopTarget, stopScrollAnimation],
  );

  const onHashNavClick = useCallback(
    (event, hash) => {
      event.preventDefault();
      setIsMobileMenuOpen(false);
      scrollToHashTarget(hash);
    },
    [scrollToHashTarget],
  );

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) {
        scrollToHashTarget(window.location.hash, { updateHash: false });
      }
    };

    if (window.location.hash) {
      window.requestAnimationFrame(onHashChange);
    }

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [scrollToHashTarget]);

  return (
    <>
      <HomeHeader
        isScrolled={isScrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        onHashNavClick={onHashNavClick}
      />

      <main>
        <HeroSection
          hero={resolved.hero}
          heroTitleLines={heroTitleLines}
          onHashNavClick={onHashNavClick}
        />
        <ProductsSection
          products={resolved.products}
          contactWhatsApp={resolved.contact.whatsapp}
          onOpenProduct={setActiveProduct}
        />
        <AboutSection about={resolved.about} productCount={resolved.products.length} />
        <ContactSection
          contact={resolved.contact}
          defaultWhatsAppLink={defaultWhatsAppLink}
        />
      </main>

      <HomeFooter
        footer={resolved.footer}
        socials={resolved.socials}
        onHashNavClick={onHashNavClick}
      />

      <a
        className="fixed bottom-4 right-4 z-30 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#1f7a3f,#239149)] px-4 text-[0.86rem] font-bold tracking-[0.01em] text-white shadow-[0_10px_24px_rgba(35,145,73,0.4)] max-md:bottom-3 max-md:right-3"
        href={defaultWhatsAppLink}
        aria-label="WhatsApp"
      >
        <Image
          src="/logo/whatsapp.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
        <span>WhatsApp</span>
      </a>

      <ProductModal
        product={activeProduct}
        contactWhatsApp={resolved.contact.whatsapp}
        onClose={() => setActiveProduct(null)}
      />
    </>
  );
}
