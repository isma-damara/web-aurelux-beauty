"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
  {
    href: "/admin/products",
    label: "Produk",
    description: "Manajemen produk dan gambar"
  },
  {
    href: "/admin/profile",
    label: "Profil",
    description: "Tentang kami, kontak, sosial media"
  },
  {
    href: "/admin/video",
    label: "Video Banner",
    description: "Upload/ganti media banner"
  }
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState({ email: "", role: "admin" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeMenu =
    MENU_ITEMS.find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)) ?? MENU_ITEMS[0];

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin/login")) {
      return;
    }

    let isMounted = true;
    fetch("/api/admin/auth/session", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unauthorized");
        }
        return response.json();
      })
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (result?.user?.email && result?.user?.role) {
          setAdminUser({
            email: result.user.email,
            role: result.user.role
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          router.replace("/admin/login");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", {
        method: "POST"
      });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_15%,rgba(32,110,154,0.15),transparent_35%),radial-gradient(circle_at_90%_90%,rgba(36,149,80,0.16),transparent_36%),linear-gradient(180deg,#edf2f8_0%,#f2f6fb_48%,#f3f7f4_100%)] text-slate-900">
      <div className="pointer-events-none absolute -left-24 top-[-88px] h-[320px] w-[320px] rounded-full bg-[#2f7db5]/16 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-112px] right-[-80px] h-[360px] w-[360px] rounded-full bg-[#21915c]/16 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-[1540px] grid-cols-[300px_minmax(0,1fr)] gap-5 px-4 py-4 max-[1100px]:grid-cols-1 max-[760px]:gap-3 max-[760px]:px-2.5 max-[760px]:py-3">
        <aside className="grid grid-rows-[auto_1fr_auto] gap-5 rounded-[26px] border border-white/80 bg-white p-4 text-slate-800 shadow-[0_26px_46px_rgba(15,23,42,0.14)] max-[1100px]:grid-rows-[auto_auto_auto] max-[760px]:gap-3 max-[760px]:rounded-[18px] max-[760px]:p-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500">Aurelux</p>
                </div>
                <p className="mt-2 text-[1.08rem] font-semibold leading-tight text-slate-900">Admin Panel</p>
                <p className="mt-1 text-xs text-slate-500">Kelola konten website dari satu dashboard.</p>
              </div>
              <button
                className="hidden h-[40px] w-[40px] appearance-none flex-col justify-between rounded-xl border border-[rgba(60,63,60,0.2)] bg-white/85 px-[8px] py-[9px] max-[760px]:flex"
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                aria-label="Toggle menu admin"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="h-[2px] w-full rounded bg-ink-700" />
                <span className="h-[2px] w-full rounded bg-ink-700" />
                <span className="h-[2px] w-full rounded bg-ink-700" />
              </button>
            </div>
          </div>

          <nav
            className={`grid content-start gap-2 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-1 ${
              isMobileMenuOpen ? "max-[760px]:grid" : "max-[760px]:hidden"
            }`}
          >
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative grid h-[78px] content-center gap-1 rounded-xl border px-3 py-2.5 transition max-[760px]:h-auto max-[760px]:min-h-[62px] ${
                    isActive
                      ? "border-emerald-300/55 bg-emerald-50 text-slate-900 shadow-[0_10px_20px_rgba(15,23,42,0.1)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isActive ? <span className="absolute left-0 top-3 h-8 w-[3px] rounded-r bg-emerald-400" /> : null}
                  <strong className="text-[0.92rem] font-semibold">{item.label}</strong>
                  <span
                    className={`truncate text-[0.76rem] leading-snug max-[760px]:hidden ${
                      isActive ? "text-emerald-700" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className={`rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 ${isMobileMenuOpen ? "max-[760px]:block" : "max-[760px]:hidden"}`}>
            <p className="text-[0.72rem] uppercase tracking-[0.1em] text-slate-500">Admin User</p>
            <div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{adminUser.email || "-"}</p>
              <small className="text-[0.72rem] uppercase tracking-[0.08em] text-slate-500">{adminUser.role}</small>
            </div>
          </div>
        </aside>

        <section className="grid gap-4 pb-3 pr-1 pt-1 max-[860px]:pr-0 max-[760px]:gap-3 max-[760px]:pb-1">
          <header className="flex items-center justify-between gap-3 rounded-[24px] border border-white/80 bg-white/86 px-4 py-3.5 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-sm max-[860px]:flex-col max-[860px]:items-stretch max-[760px]:rounded-[16px] max-[760px]:px-3 max-[760px]:py-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-500">Admin / {activeMenu.label}</p>
              <h1 className="mt-1 text-[1.08rem] font-semibold leading-tight text-slate-900">
                {activeMenu.description}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-[860px]:justify-start max-[640px]:grid max-[640px]:grid-cols-1">
              <div className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50 px-3 text-[0.78rem] font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]" />
                <span>System Online</span>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-3 text-[0.8rem] font-medium text-slate-700 transition hover:bg-slate-50 max-[640px]:justify-center"
                target="_blank"
                rel="noreferrer"
              >
                Lihat Situs
              </Link>
              <button
                type="button"
                className="min-h-[36px] rounded-lg border border-rose-200 bg-rose-50 px-3 text-[0.8rem] font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 max-[640px]:w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Keluar..." : "Logout"}
              </button>
            </div>
          </header>

          <div className="rounded-[24px] border border-white/70 bg-white/90 p-4 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm max-[760px]:rounded-[16px] max-[760px]:p-3">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
