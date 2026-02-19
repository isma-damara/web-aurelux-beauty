import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { buildProductOrderMessage, buildWhatsAppLink } from "./content-utils";

export default function ProductModal({ product, contactWhatsApp, onClose }) {
  const detailImages = useMemo(() => {
    if (!product) {
      return [];
    }

    const fromArray = Array.isArray(product.detailImages)
      ? product.detailImages
      : [];
    const legacyImage =
      typeof product.detailImage === "string" ? product.detailImage.trim() : "";
    const cardImage =
      typeof product.cardImage === "string" ? product.cardImage.trim() : "";
    const merged = fromArray
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    if (legacyImage) {
      merged.push(legacyImage);
    }

    const unique = [...new Set(merged)].slice(0, 5);
    if (unique.length > 0) {
      return unique;
    }

    if (cardImage) {
      return [cardImage];
    }

    return [];
  }, [product]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const description =
    typeof product?.description === "string" ? product.description.trim() : "";
  const usage = typeof product?.usage === "string" ? product.usage.trim() : "";
  const ingredients = Array.isArray(product?.ingredients)
    ? product.ingredients
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];
  const usageSteps = usage
    ? usage
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [product?.id, detailImages.length]);

  useEffect(() => {
    if (detailImages.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % detailImages.length);
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [detailImages.length]);

  const onPrevSlide = () => {
    if (detailImages.length <= 1) {
      return;
    }
    setActiveSlideIndex(
      (prev) => (prev - 1 + detailImages.length) % detailImages.length,
    );
  };

  const onNextSlide = () => {
    if (detailImages.length <= 1) {
      return;
    }
    setActiveSlideIndex((prev) => (prev + 1) % detailImages.length);
  };

  if (!product) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(18,20,19,0.68)] p-5 animate-fade-in"
      role="presentation"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 z-[90] grid h-11 w-11 place-items-center rounded-full border border-[rgba(255,255,255,0.45)] bg-[rgba(18,20,19,0.68)] text-[1.1rem] font-semibold leading-none text-white transition duration-200 hover:scale-[1.04] md:hidden"
        type="button"
        onClick={onClose}
        aria-label="Close modal"
      >
        X
      </button>
      <div
        className="relative grid w-[min(980px,100%)] max-h-[90vh] grid-cols-[minmax(300px,47%)_minmax(0,1fr)] overflow-hidden rounded-[14px] bg-white opacity-100 animate-quick-view-in max-md:max-h-full max-md:w-full max-md:grid-cols-1 max-md:overflow-auto max-md:rounded-xl"
        role="dialog"
        aria-modal="true"
        aria-label={product.fullName || product.name}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="absolute right-[14px] top-[14px] z-10 hidden h-10 w-10 place-items-center rounded-full border-0 bg-white/90 text-[1.28rem] leading-none text-gold-500 transition duration-200 hover:scale-[1.04] hover:bg-white md:grid"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
        >
          X
        </button>
        <div className="relative flex min-h-[530px] bg-white p-3 max-md:min-h-[320px] max-md:p-2.5">
          <div className="relative flex-1 overflow-hidden rounded-[12px] border border-[rgba(31,35,33,0.08)] bg-[radial-gradient(circle_at_20%_20%,#f6f2e8_0%,#ece4cf_100%)] shadow-[0_6px_18px_rgba(31,35,33,0.08)] max-md:rounded-[10px]">
            {detailImages.length > 0 ? (
              <div className="relative h-full w-full">
                <div
                  className="flex h-full transform-gpu will-change-transform transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: `translateX(-${activeSlideIndex * 100}%)`,
                  }}
                >
                  {detailImages.map((imageUrl, index) => (
                    <div
                      key={`${imageUrl}-${index}`}
                      className="relative h-full min-w-full"
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.fullName || product.name} - ${index + 1}`}
                        className="absolute inset-0 h-full w-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>

                {detailImages.length > 1 ? (
                  <>
                    <button
                      type="button"
                      className="absolute left-3 top-1/2 z-[7] -translate-y-1/2 bg-transparent p-0 text-[2rem] leading-none text-black/35 transition hover:text-black/65"
                      onClick={onPrevSlide}
                      aria-label="Slide sebelumnya"
                    >
                      <span aria-hidden="true">&lt;</span>
                    </button>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 z-[7] -translate-y-1/2 bg-transparent p-0 text-[2rem] leading-none text-black/35 transition hover:text-black/65"
                      onClick={onNextSlide}
                      aria-label="Slide berikutnya"
                    >
                      <span aria-hidden="true">&gt;</span>
                    </button>
                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-[7] flex -translate-x-1/2 items-center gap-1.5">
                      {detailImages.map((_, index) => (
                        <button
                          key={`dot-${index}`}
                          type="button"
                          className={`pointer-events-auto h-2.5 w-2.5 rounded-full border border-white/80 ${
                            index === activeSlideIndex
                              ? "bg-white"
                              : "bg-white/30"
                          }`}
                          aria-label={`Lihat gambar ${index + 1}`}
                          onClick={() => setActiveSlideIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="grid h-full w-full place-items-center p-4 text-center text-sm text-ink-700">
                Gambar detail belum tersedia
              </div>
            )}
            <div className="pointer-events-none absolute bottom-3 right-3 z-[6] flex items-center gap-2">
              {[
                { src: "/logo/Bpom.png", alt: "Logo BPOM" },
                { src: "/logo/Halal.png", alt: "Logo Halal" },
              ].map((logo) => (
                <div
                  key={logo.src}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[rgba(181,140,55,0.35)] bg-white/95 p-2 shadow-[0_6px_14px_rgba(31,35,33,0.12)]"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={100}
                    height={100}
                    className="h-[39px] w-[39px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex h-[530px] flex-col px-[30px] pb-[20px] pt-[34px] max-md:h-auto max-md:px-5 max-md:pb-6 max-md:pt-6">
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <h3 className="mb-2 font-brand text-[clamp(2rem,4vw,2.8rem)] leading-[1.06]">
              {product.fullName || product.name}
            </h3>
            <p className="mb-4 italic text-ink-700">
              <strong></strong> {product.usp}
            </p>
            {description ? (
              <p className="leading-[1.6] text-ink-700">{description}</p>
            ) : null}

            {ingredients.length > 0 ? (
              <>
                <h4 className="mb-1.5 mt-[18px] text-[1.02rem] font-bold">
                  Bahan Utama
                </h4>
                <ul className="list-disc pl-[18px] text-ink-700 marker:text-ink-700">
                  {ingredients.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {usageSteps.length > 0 ? (
              <>
                <h4 className="mb-1.5 mt-[18px] text-[1.02rem] font-bold">
                  Cara Pakai
                </h4>
                <ul className="list-disc pl-[18px] text-ink-700 marker:text-ink-700">
                  {usageSteps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <a
            className="mt-4 mx-auto flex w-fit min-h-[42px] shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-[linear-gradient(100deg,#1f7a3f,#239149)] px-5 text-[0.92rem] font-semibold text-white shadow-[0_8px_18px_rgba(35,145,73,0.3)] transition duration-200 hover:-translate-y-px"
            href={buildWhatsAppLink(
              contactWhatsApp,
              buildProductOrderMessage(product),
            )}
          >
            <Image
              src="/logo/whatsapp.png"
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain"
            />
            <span>Hubungi via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
