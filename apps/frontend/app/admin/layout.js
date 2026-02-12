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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f6f7f9_0%,#eef1f5_100%)] text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-[1500px] grid-cols-[280px_minmax(0,1fr)] gap-4 px-4 py-4 max-[1100px]:grid-cols-1">
        <aside className="grid grid-rows-[auto_1fr_auto] gap-5 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.08)] max-[1100px]:grid-rows-[auto_auto_auto]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-500">Aurelux</p>
            </div>
            <p className="mt-2 text-[1.05rem] font-semibold leading-tight">Admin Panel</p>
            <p className="mt-1 text-xs text-slate-500">Kelola konten website dari satu dashboard.</p>
          </div>

          <nav className="grid content-start gap-2 max-[1100px]:grid-cols-3 max-[760px]:grid-cols-1">
            {MENU_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative grid h-[74px] content-center gap-1 rounded-xl border px-3 py-2.5 transition ${
                    isActive
                      ? "border-amber-300/45 bg-amber-50 text-slate-900 shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isActive ? <span className="absolute left-0 top-3 h-8 w-[3px] rounded-r bg-amber-300" /> : null}
                  <strong className="text-[0.92rem] font-semibold">{item.label}</strong>
                  <span className="truncate text-[0.76rem] leading-snug text-slate-500">{item.description}</span>
                </Link>
              );
            })}
          </nav>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
            <p className="text-[0.72rem] uppercase tracking-[0.1em] text-slate-500">Admin User</p>
            <div>
              <p className="mt-1 truncate text-sm font-semibold text-slate-900">{adminUser.email || "-"}</p>
              <small className="text-[0.72rem] uppercase tracking-[0.08em] text-slate-500">{adminUser.role}</small>
            </div>
          </div>
        </aside>

        <section className="grid gap-4 pb-3 pr-1 pt-1 max-[860px]:pr-0">
          <header className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] max-[860px]:flex-col max-[860px]:items-stretch">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.14em] text-slate-400">Admin / {activeMenu.label}</p>
              <h1 className="mt-1 text-[1.06rem] font-semibold leading-tight text-slate-900">
                {activeMenu.description}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 max-[860px]:justify-start">
              <div className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[0.78rem] font-medium text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>System Online</span>
              </div>
              <Link
                href="/"
                className="inline-flex min-h-[36px] items-center rounded-lg border border-slate-200 bg-white px-3 text-[0.8rem] font-medium text-slate-700 transition hover:bg-slate-50"
                target="_blank"
                rel="noreferrer"
              >
                Lihat Situs
              </Link>
              <button
                type="button"
                className="min-h-[36px] rounded-lg border border-rose-200 bg-rose-50 px-3 text-[0.8rem] font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Keluar..." : "Logout"}
              </button>
            </div>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur-sm max-[760px]:p-3">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
