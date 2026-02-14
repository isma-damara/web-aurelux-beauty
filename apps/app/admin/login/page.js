"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function normalizeNextPath(rawPath) {
  if (typeof rawPath !== "string" || !rawPath.startsWith("/")) {
    return "/admin/products";
  }

  if (!rawPath.startsWith("/admin") || rawPath.startsWith("/admin/login")) {
    return "/admin/products";
  }

  return rawPath;
}

function AdminLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nextPath = useMemo(() => {
    return normalizeNextPath(searchParams.get("next"));
  }, [searchParams]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message || "Login admin gagal.");
      }

      router.replace(nextPath);
    } catch (submitError) {
      setError(submitError.message || "Login admin gagal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[radial-gradient(circle_at_0%_0%,rgba(23,75,112,0.16),transparent_36%),radial-gradient(circle_at_100%_100%,rgba(29,120,87,0.18),transparent_42%),linear-gradient(180deg,#eef4fb_0%,#f6f8fc_48%,#f4f8f5_100%)] px-4 py-8">
      <div className="pointer-events-none absolute -left-16 top-[-72px] h-[240px] w-[240px] rounded-full bg-[#2f7db5]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-84px] right-[-54px] h-[280px] w-[280px] rounded-full bg-[#21915c]/20 blur-3xl" />

      <section className="relative z-[1] grid w-full max-w-[960px] overflow-hidden rounded-[30px] border border-white/70 bg-white/88 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur-xl md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <aside className="hidden content-between gap-6 bg-[linear-gradient(160deg,#0f172a_0%,#13243a_42%,#18364f_100%)] p-7 text-slate-100 md:grid">
          <div>
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.22em] text-slate-300">Aurelux CMS</p>
            <h1 className="mt-2 font-brand text-[clamp(1.55rem,2.2vw,2rem)] leading-tight">Admin Workspace</h1>
            <p className="mt-2.5 text-[0.9rem] text-slate-300">
              Kelola produk, profil perusahaan, dan video banner dalam satu panel yang terstruktur.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-[0.84rem] text-slate-200">
            <p className="m-0 font-semibold text-white">Secure Access</p>
            <p className="mt-1.5 m-0">Hanya akun admin terverifikasi yang bisa mengubah konten situs.</p>
          </div>
        </aside>

        <div className="grid gap-4 p-5 sm:p-7">
          <div>
            <p className="m-0 text-[0.72rem] uppercase tracking-[0.18em] text-slate-400">Admin Panel</p>
            <h2 className="mt-1.5 text-[clamp(1.3rem,2.1vw,1.8rem)] font-semibold text-slate-900">Login Admin</h2>
            <p className="mt-1 text-[0.88rem] text-slate-500">Masuk untuk mengelola konten website Aurelux.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[0.84rem] text-red-700">{error}</div>
          ) : null}

          <form className="grid gap-3" onSubmit={onSubmit}>
            <label className="grid gap-1.5 text-[0.82rem] font-medium text-slate-600">
              Email Admin
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@your-domain.com"
                autoComplete="email"
                required
                className="min-h-[42px] rounded-xl border border-slate-300 bg-white/95 px-3 text-[0.9rem] text-slate-900 outline-none transition focus:border-[#1f7a3f] focus:ring-4 focus:ring-[#1f7a3f]/20"
              />
            </label>

            <label className="grid gap-1.5 text-[0.82rem] font-medium text-slate-600">
              Password Admin
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="******"
                autoComplete="current-password"
                required
                className="min-h-[42px] rounded-xl border border-slate-300 bg-white/95 px-3 text-[0.9rem] text-slate-900 outline-none transition focus:border-[#1f7a3f] focus:ring-4 focus:ring-[#1f7a3f]/20"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 min-h-[43px] rounded-xl border border-[#1f7a3f] bg-[linear-gradient(120deg,#1f7a3f_0%,#239149_100%)] text-[0.9rem] font-semibold text-white shadow-[0_14px_24px_rgba(35,145,73,0.28)] transition hover:-translate-y-px hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Memproses..." : "Login"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function LoginPageFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(180deg,#eef4fb_0%,#f6f8fc_100%)] p-4">
      <section className="grid w-full max-w-[420px] gap-2.5 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.1)]">
        <p className="m-0 text-[0.86rem] text-slate-500">Memuat halaman login admin...</p>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <AdminLoginPageContent />
    </Suspense>
  );
}
