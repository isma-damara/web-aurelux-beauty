import Image from "next/image";
import { Fragment } from "react";

export default function HeroSection({ hero, heroTitleLines, onHashNavClick }) {
  const hasHeroProductImage = Boolean(hero?.heroProductImage);

  return (
    <section
      id="home"
      className={`reveal relative grid min-h-screen ${
        hasHeroProductImage ? "grid-cols-[1.1fr_0.9fr]" : "grid-cols-1"
      } items-center overflow-hidden px-[min(8vw,90px)] pb-[72px] pt-[112px] max-[992px]:grid-cols-1 max-[992px]:gap-6 max-[992px]:px-6 max-md:justify-items-center max-md:gap-2 max-md:px-5 max-md:pb-7 max-md:pt-24 max-md:text-center`}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster={hero.posterImage}
      >
        {hero.videoUrl ? <source src={hero.videoUrl} type="video/mp4" /> : null}
      </video>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(95deg, rgba(245, 231, 187, 0.92) 10%, rgba(235, 214, 149, 0.62) 65%, rgba(239, 224, 181, 0.7) 100%)",
        }}
      />
      <div className="relative z-[2] max-w-[520px] max-md:max-w-full">
        <h1 className="my-[10px] mb-[14px] font-brand text-[clamp(2.2rem,5vw,4.05rem)] leading-[1.04] max-md:mb-0 max-md:text-[clamp(2rem,8.2vw,2.85rem)] max-md:leading-[1.08]">
          {heroTitleLines.map((line, index) => (
            <Fragment key={`${line}-${index}`}>
              {line}
              {index < heroTitleLines.length - 1 ? <br /> : null}
            </Fragment>
          ))}
        </h1>
        <p className="mb-5 max-w-[45ch] text-[clamp(1rem,2vw,1.1rem)] text-ink-700 max-md:hidden">
          {hero.subtitle}
        </p>
        <a
          className="inline-flex min-h-[40px] items-center justify-center rounded-full border border-transparent bg-white px-[30px] py-[10px] text-[clamp(1.12rem,1.12vw,1.12rem)] font-bold tracking-[0.015em] text-ink-900 shadow-none transition duration-200 hover:-translate-y-px hover:shadow-[0_12px_24px_rgba(31,35,33,0.15)] max-md:hidden"
          href="#produk"
          onClick={(event) => onHashNavClick(event, "#produk")}
        >
          Lihat Produk
        </a>
        <div className="mt-4 flex items-center gap-3 max-md:hidden">
          <div className="h-[100px] w-[140px]">
            <Image
              src="/logo/Bpom.png"
              alt="Logo BPOM"
              width={115}
              height={115}
            />
          </div>
          <div className="h-[120px] w-[120px] -translate-x-[5px]">
            <Image
              src="/logo/Halal.png"
              alt="Logo Halal"
              width={65}
              height={65}
            />
          </div>
        </div>
      </div>
      {hasHeroProductImage ? (
        <div className="relative z-[2] min-h-[470px] max-[992px]:min-h-[340px] max-md:min-h-[310px] max-md:w-[min(360px,100%)]">
          <img
            src={hero.heroProductImage}
            alt="Produk Aurelux Beauty"
            className="absolute inset-0 h-full w-full object-contain object-center"
            loading="eager"
            decoding="async"
          />
        </div>
      ) : null}
      <a
        className="relative z-[2] mt-1 hidden min-h-[44px] min-w-[146px] items-center justify-center rounded-full border border-transparent bg-white px-4 py-2 text-[0.82rem] font-bold text-ink-900 shadow-[0_10px_24px_rgba(31,35,33,0.14)] max-md:inline-flex"
        href="#produk"
        onClick={(event) => onHashNavClick(event, "#produk")}
      >
        Lihat Produk
      </a>
    </section>
  );
}
