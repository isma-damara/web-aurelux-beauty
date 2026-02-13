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
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
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
    <main className="grid min-h-screen place-items-center bg-gray-100 p-4">
      <section className="grid w-full max-w-[420px] gap-[11px] rounded-xl border border-gray-200 bg-white p-5">
        <p className="m-0 text-[0.72rem] uppercase tracking-[0.08em] text-gray-400">Admin Panel</p>
        <h1 className="text-[clamp(1.2rem,1.8vw,1.5rem)] text-gray-900">Login Admin</h1>
        <p className="m-0 text-[0.86rem] text-gray-500">Masuk dengan email dan password admin untuk mengakses `/admin`.</p>

        {error ? <div className="rounded-[9px] border border-red-200 bg-red-50 px-2.5 py-2 text-[0.84rem] text-red-700">{error}</div> : null}

        <form className="grid gap-2.5" onSubmit={onSubmit}>
          <label className="grid gap-1.5 text-[0.82rem] text-gray-600">
            Email Admin
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@your-domain.com"
              autoComplete="email"
              required
              className="min-h-[38px] rounded-[9px] border border-gray-300 bg-white px-[11px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30"
            />
          </label>

          <label className="grid gap-1.5 text-[0.82rem] text-gray-600">
            Password Admin
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="******"
              autoComplete="current-password"
              required
              className="min-h-[38px] rounded-[9px] border border-gray-300 bg-white px-[11px] text-[0.86rem] text-gray-900 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-300/30"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-0.5 min-h-[39px] rounded-[9px] border border-gray-900 bg-gray-900 text-[0.86rem] font-semibold text-white transition hover:bg-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Memproses..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function LoginPageFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-gray-100 p-4">
      <section className="grid w-full max-w-[420px] gap-[11px] rounded-xl border border-gray-200 bg-white p-5">
        <p className="m-0 text-[0.86rem] text-gray-500">Memuat halaman login admin...</p>
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
