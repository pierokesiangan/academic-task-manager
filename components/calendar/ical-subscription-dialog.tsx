"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Calendar,
  X,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import {
  getCalendarFeedTokenAction,
  regenerateCalendarTokenAction,
} from "@/actions/calendar";

export function ICalSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const loadToken = async () => {
    setLoading(true);
    const res = await getCalendarFeedTokenAction();
    if (res.success && res.token) {
      setToken(res.token);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      loadToken();
    }
  }, [open]);

  const feedUrl = token ? `${origin}/api/calendar/feed/${token}` : "";

  const handleCopy = () => {
    if (!feedUrl) return;
    navigator.clipboard.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (
      !confirm(
        "Apakah kamu yakin ingin memperbarui link feed? Kalender yang terhubung sebelumnya harus diperbarui dengan link yang baru."
      )
    ) {
      return;
    }

    setLoading(true);
    const res = await regenerateCalendarTokenAction();
    if (res.success && res.token) {
      setToken(res.token);
    }
    setLoading(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-surface-border text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 group"
        >
          <Calendar className="w-4 h-4 text-butter-300 group-hover:scale-110 transition-transform" />
          <span>Sync ke Google Calendar</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-2xl bg-surface border border-surface-border p-6 shadow-2xl focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-navy-900 border border-cobalt-500/30 flex items-center justify-center text-butter-300">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-foreground">
                  Sinkronisasi Kalender Ponsel
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted">
                  Feed privat iCal (RFC 5545) untuk Google Calendar & Apple Calendar
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            {/* Feed URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>URL Feed Kalender Privatmu</span>
                <span className="text-[10px] text-cobalt-300 font-mono">Format .ics</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={feedUrl || "Membuat link kalender..."}
                  className="flex-1 h-10 px-3 rounded-xl bg-surface-hover/70 border border-surface-border font-mono text-[11px] text-foreground focus:outline-none select-all"
                />

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!feedUrl || loading}
                  className="h-10 px-3.5 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-navy-950" />
                      <span>Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="p-4 rounded-xl bg-surface-hover/50 border border-surface-border space-y-2.5 text-xs">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cobalt-400" />
                <span>Cara Memasang di Google Calendar:</span>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-muted leading-relaxed pl-1">
                <li>
                  Buka{" "}
                  <a
                    href="https://calendar.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cobalt-300 font-semibold hover:underline inline-flex items-center gap-0.5"
                  >
                    calendar.google.com <ExternalLink className="w-3 h-3" />
                  </a>{" "}
                  di browser laptop/HP.
                </li>
                <li>
                  Pada panel sebelah kiri, cari bagian <strong>&quot;Other calendars&quot;</strong> (Kalender lainnya), lalu klik tombol <strong>+</strong> → Pilih <strong>&quot;From URL&quot;</strong>.
                </li>
                <li>
                  Tempelkan link privat di atas dan klik <strong>&quot;Add calendar&quot;</strong>.
                </li>
              </ol>

              <div className="pt-2 text-[11px] text-muted/80 flex items-start gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-butter-300 shrink-0 mt-0.5" />
                <span>
                  Selesai! Seluruh deadline tugas akan otomatis muncul di aplikasi Google Calendar di HP kamu, lengkap dengan notifikasi alarm H-1 dan H-3 jam.
                </span>
              </div>
            </div>

            {/* Token Security & Regenerate */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-xs">
              <span className="text-[11px] text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link bersifat rahasia untuk akunmu</span>
              </span>

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={loading}
                className="text-[11px] text-muted hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Batalkan link lama dan buat link baru"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Link</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
