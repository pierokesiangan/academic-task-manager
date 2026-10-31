"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  KeyRound,
  ShieldCheck,
  Calendar,
  Bell,
  Sparkles,
  LogOut,
  Check,
  Loader2,
  Database,
} from "lucide-react";
import { changePinAction, logoutAction } from "@/actions/auth";
import { ICalSubscriptionDialog } from "@/components/calendar/ical-subscription-dialog";

export default function SettingsPage() {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setPinError("Konfirmasi PIN baru tidak cocok!");
      return;
    }
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError("PIN baru harus 4-6 digit angka!");
      return;
    }

    setPinLoading(true);
    setPinError(null);
    setPinSuccess(false);

    try {
      const res = await changePinAction(oldPin, newPin);
      if (res.success) {
        setPinSuccess(true);
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setTimeout(() => setPinSuccess(false), 3000);
      } else {
        setPinError(res.error || "Gagal mengubah PIN");
      }
    } catch {
      setPinError("Terjadi kesalahan jaringan");
    } finally {
      setPinLoading(false);
    }
  };

  const handleRequestNotification = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const res = await Notification.requestPermission();
      setNotificationStatus(res);
      if (res === "granted") {
        new Notification("Notifikasi Aktif!", {
          body: "Pengingat deadline akan muncul sebelum jatuh tempo.",
          icon: "/icons/icon.svg",
        });
      }
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-surface-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cobalt-400">
            <Settings className="w-4 h-4 text-butter-300" />
            <span>PENGATURAN APLIKASI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Settings & Keamanan
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola Master PIN, sinkronisasi kalender ponsel, dan preferensi notifikasi.
          </p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-surface hover:bg-rose-500/10 text-muted hover:text-rose-400 border border-surface-border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Kunci Aplikasi</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Ubah Master PIN */}
        <div className="rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-surface-border/60">
            <div className="w-8 h-8 rounded-xl bg-navy-900 border border-cobalt-500/30 flex items-center justify-center text-butter-300">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Ganti Master PIN</h2>
              <p className="text-[11px] text-muted">Ubah kode akses rahasiamu</p>
            </div>
          </div>

          <form onSubmit={handleChangePin} className="space-y-3">
            {pinError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
                {pinError}
              </div>
            )}
            {pinSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Master PIN berhasil diperbarui!</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground">PIN Saat Ini</label>
              <input
                type="password"
                required
                maxLength={6}
                placeholder="PIN lama (Default: 1234)"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground font-mono focus:outline-none focus:border-cobalt-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">PIN Baru</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="4-6 digit"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground font-mono focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-foreground">Konfirmasi</label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="Ulangi PIN baru"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground font-mono focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={pinLoading}
              className="w-full h-10 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              {pinLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Simpan PIN Baru</span>
            </button>
          </form>
        </div>

        {/* 2. Integrasi Kalender & Notifikasi */}
        <div className="space-y-6">
          {/* Kalender Feed */}
          <div className="rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-3 border-b border-surface-border/60">
              <div className="w-8 h-8 rounded-xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">Google Calendar Feed</h2>
                <p className="text-[11px] text-muted">Sinkronisasi jadwal ke ponsel</p>
              </div>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Dapatkan feed kalender privat format <code>.ics</code> yang otomatis memperbarui seluruh jadwal kuliah dan deadline tugas di aplikasi kalender ponselmu.
            </p>

            <ICalSubscriptionDialog />
          </div>

          {/* Status Notifikasi Browser */}
          <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Bell className="w-4 h-4 text-butter-300" />
                <span>Notifikasi Browser</span>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  notificationStatus === "granted"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "bg-surface-hover text-muted"
                }`}
              >
                {notificationStatus === "granted" ? "Aktif" : "Belum Aktif"}
              </span>
            </div>

            {notificationStatus !== "granted" && (
              <button
                type="button"
                onClick={handleRequestNotification}
                className="w-full py-2 rounded-xl bg-surface-hover hover:bg-surface border border-surface-border text-xs font-semibold text-foreground transition-all"
              >
                Izinkan Notifikasi Pop-up
              </button>
            )}
          </div>

          {/* Database Info */}
          <div className="p-4 rounded-2xl bg-navy-950/60 border border-cobalt-500/20 flex items-center gap-3 text-xs">
            <Database className="w-5 h-5 text-cobalt-300 shrink-0" />
            <div className="space-y-0.5 min-w-0">
              <div className="font-semibold text-foreground">Cloud Database: Supabase PostgreSQL</div>
              <div className="text-[10px] text-muted font-mono truncate">
                aws-0-ap-northeast-2.pooler.supabase.com (Tersinkron 24/7)
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
