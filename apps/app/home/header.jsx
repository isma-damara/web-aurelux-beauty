import { LEFT_NAV_ITEMS, NAV_ITEMS, RIGHT_NAV_ITEMS } from "./constants";

export default function HomeHeader({ isScrolled, isMobileMenuOpen, onToggleMobileMenu, onHashNavClick }) {
  const navLinkClass =
    "text-[0.81rem] font-semibold tracking-[0.14em] transition-colors hover:text-gold-500";

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white/90 shadow-[0_10px_28px_rgba(31,35,33,0.08)] backdrop-blur-md" : ""
      }`}
    >
      <div className="mx-auto grid min-h-[86px] w-[min(1180px,calc(100%-40px))] grid-cols-[1fr_auto_1fr_auto] items-center gap-5 max-md:relative max-md:flex max-md:min-h-[78px] max-md:w-[calc(100%-24px)] max-md:justify-center">
        <nav className="flex items-center justify-end gap-[clamp(14px,2.4vw,30px)] max-md:hidden" aria-label="Main navigation left">
          {LEFT_NAV_ITEMS.map((item) => (
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

        <a href="#home" className="justify-self-center text-center" onClick={(event) => onHashNavClick(event, "#home")}>
          <span className="block font-brand text-[1.95rem] leading-none tracking-[0.14em] text-[#a78532] max-md:text-[1.42rem]">
            AURELUX
          </span>
          <span className="block text-[0.78rem] tracking-[0.23em] text-ink-700 max-md:text-[0.67rem]">BEAUTY</span>
        </a>

        <nav className="flex items-center justify-start gap-[clamp(14px,2.4vw,30px)] max-md:hidden" aria-label="Main navigation right">
          {RIGHT_NAV_ITEMS.map((item) => (
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

        <button
          className="hidden h-[42px] w-[42px] appearance-none flex-col justify-between rounded-xl border border-[rgba(60,63,60,0.2)] bg-white/85 px-[9px] py-[10px] max-md:absolute max-md:left-0 max-md:top-1/2 max-md:flex max-md:-translate-y-1/2"
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className="h-[2px] w-full rounded bg-ink-700" />
          <span className="h-[2px] w-full rounded bg-ink-700" />
          <span className="h-[2px] w-full rounded bg-ink-700" />
        </button>
      </div>
      <nav
        className={`absolute left-3 right-3 top-[76px] z-40 flex flex-col gap-0.5 rounded-[18px] border border-[rgba(60,63,60,0.12)] bg-white/95 p-2.5 shadow-[0_12px_26px_rgba(31,35,33,0.1)] transition-all duration-100 md:hidden ${
          isMobileMenuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
        }`}
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => onHashNavClick(event, item.href)}
            className="rounded-[10px] px-[14px] py-3 text-[0.8rem] font-semibold tracking-[0.12em] hover:bg-[#f6f5f2]"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
