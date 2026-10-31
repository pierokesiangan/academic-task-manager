import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative select-none">
      <div className="w-full max-w-md rounded-2xl bg-surface border border-surface-border p-6 sm:p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-cobalt-500/30 flex items-center justify-center mx-auto text-cobalt-400">
          <Compass className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">
            404 — Halaman Tidak Ditemukan
          </h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Halaman atau jadwal tugas yang kamu cari tidak tersedia atau tautan telah dipindahkan.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
