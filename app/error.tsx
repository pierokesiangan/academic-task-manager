"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Terjadi error aplikasi:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative select-none">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-surface-border p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Terjadi Kendala Memuat Data
          </h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Jangan khawatir, data perkuliahanmu tetap aman di database Supabase. Coba muat ulang halaman.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface border border-surface-border text-foreground font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
