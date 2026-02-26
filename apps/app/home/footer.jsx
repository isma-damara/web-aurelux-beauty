import Image from "next/image";
import { NAV_ITEMS } from "./constants";
import { asExternalLink } from "./content-utils";

export default function HomeFooter({ brand, footer, socials, onHashNavClick }) {
  const navLinkClass =
    "text-[0.81rem] font-semibold tracking-[0.14em] transition-colors hover:text-gold-500";
  const logoImage = brand?.logoImage || "";
  const logoPrimary = brand?.logoPrimary ?? "AURELUX";
  const logoSecondary = brand?.logoSecondary ?? "BEAUTY";

  return (
    <footer className="bg-[#1f2522] px-6 pb-7 pt-[42px] text-[#eceadf] max-md:px-5">
      <div className="mx-auto flex w-[min(1080px,100%)] items-center justify-between gap-5 max-md:flex-col max-md:text-center">
        <div>
          {logoImage ? (
            <img
              src={logoImage}
              alt={`${logoPrimary} ${logoSecondary}`.trim() || "Logo brand"}
              className="-ml-2 block h-[136px] w-auto object-contain max-md:ml-auto max-md:mr-auto max-md:h-[118px]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <>
              <p className="font-brand text-[1.95rem] leading-none tracking-[0.14em] text-[#a78532]">
                {logoPrimary}
              </p>
              {logoSecondary ? (
                <p className="mt-1 text-[0.7rem] tracking-[0.22em] text-[#d7d1b2]">
                  {logoSecondary}
                </p>
              ) : null}
            </>
          )}
          <p className={`${logoImage ? "-mt-12" : "mt-2"} text-[#d4d7cd]`}>
            {footer.tagline}
          </p>
        </div>
        <div className="flex gap-3">
          <a
            href={asExternalLink(socials.instagram)}
            aria-label="Instagram"
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(239,224,181,0.45)] bg-white/5 transition hover:border-cream-200 hover:bg-white/10"
          >
            <Image
              src="/logo/instagram.png"
              alt=""
              width={22}
              height={22}
            />
          </a>
          <a
            href={asExternalLink(socials.facebook)}
            aria-label="Facebook"
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(239,224,181,0.45)] bg-white/5 transition hover:border-cream-200 hover:bg-white/10"
          >
            <Image
              src="/logo/facebook.png"
              alt=""
              width={22}
              height={22}
            />
          </a>
          <a
            href={asExternalLink(socials.tiktok)}
            aria-label="TikTok"
            target="_blank"
            rel="noreferrer"
            className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(239,224,181,0.45)] bg-white/5 transition hover:border-cream-200 hover:bg-white/10"
          >
            <Image
              src="/logo/tiktok.png"
              alt=""
              width={22}
              height={22}
            />
          </a>
        </div>
      </div>
      <nav className="mx-auto mt-[26px] flex w-[min(1080px,100%)] flex-wrap justify-center gap-[clamp(10px,3vw,24px)] border-t border-[rgba(234,217,172,0.25)] pt-[18px]">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => onHashNavClick(event, item.href)}
            className={navLinkClass}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <p className="mt-[18px] text-center text-[0.87rem] text-[#bfc5b9]">
        {footer.copyright}
      </p>
    </footer>
  );
}
