"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { unlockAction, setupInitialPinAction, checkAuthStatusAction } from "@/actions/auth";
import { ShieldCheck, Delete, ArrowRight, Lock, KeyRound, Sparkles } from "lucide-react";

export default function UnlockPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isFirstSetup, setIsFirstSetup] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const [setupStep, setSetupStep] = useState<"new" | "confirm">("new");

  useEffect(() => {
    checkAuthStatusAction().then((status) => {
      if (!status.hasPin) {
        setIsFirstSetup(true);
      }
    });
  }, []);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleKeyPress = useCallback((digit: string) => {
    setError(null);
    if (isFirstSetup) {
      if (setupStep === "new") {
        if (pin.length < 6) setPin((prev) => prev + digit);
      } else {
        if (confirmPin.length < 6) setConfirmPin((prev) => prev + digit);
      }
    } else {
      if (pin.length < 6) {
        setPin((prev) => prev + digit);
      }
    }
  }, [isFirstSetup, setupStep, pin.length, confirmPin.length]);

  const handleDelete = useCallback(() => {
    setError(null);
    if (isFirstSetup && setupStep === "confirm") {
      setConfirmPin((prev) => prev.slice(0, -1));
    } else {
      setPin((prev) => prev.slice(0, -1));
    }
  }, [isFirstSetup, setupStep]);

  const handleClear = useCallback(() => {
    setError(null);
    if (isFirstSetup && setupStep === "confirm") {
      setConfirmPin("");
    } else {
      setPin("");
    }
  }, [isFirstSetup, setupStep]);

  const submitUnlock = useCallback(async (pinToTest: string) => {
    if (pinToTest.length < 4) {
      setError("PIN minimal 4 digit");
      triggerShake();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await unlockAction(pinToTest);
      if (res.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error || "PIN salah");
        triggerShake();
        setPin("");
      }
    } catch {
      setError("Terjadi kesalahan koneksi");
      triggerShake();
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleSetupNext = useCallback(async () => {
    if (setupStep === "new") {
      if (pin.length < 4) {
        setError("PIN minimal 4 digit");
        triggerShake();
        return;
      }
      setSetupStep("confirm");
      setError(null);
    } else {
      if (pin !== confirmPin) {
        setError("PIN konfirmasi tidak cocok!");
        triggerShake();
        setConfirmPin("");
        return;
      }

      setLoading(true);
      try {
        const res = await setupInitialPinAction(pin);
        if (res.success) {
          router.push("/");
          router.refresh();
        } else {
          setError(res.error || "Gagal menyimpan PIN");
        }
      } catch {
        setError("Terjadi kesalahan jaringan");
      } finally {
        setLoading(false);
      }
    }
  }, [setupStep, pin, confirmPin, router]);

  // Handle keyboard typing on laptop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (e.key === "Enter") {
        if (isFirstSetup) {
          handleSetupNext();
        } else if (pin.length >= 4) {
          submitUnlock(pin);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleClear, handleSetupNext, submitUnlock, isFirstSetup, pin]);

  // Auto-submit jika PIN mencapai 6 digit (panjang maksimal)
  useEffect(() => {
    if (!isFirstSetup && pin.length === 6) {
      submitUnlock(pin);
    }
  }, [pin, isFirstSetup, submitUnlock]);

  const currentDisplayPin = isFirstSetup && setupStep === "confirm" ? confirmPin : pin;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-cobalt-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-butter-300/10 rounded-full blur-3xl pointer-events-none" />

      <div
        className={`w-full max-w-sm rounded-2xl bg-surface border border-surface-border p-6 sm:p-8 shadow-2xl relative z-10 transition-transform ${
          isShaking ? "animate-[shake_0.4s_ease-in-out]" : ""
        }`}
      >
        {/* App Logo & Lock Indicator */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-cobalt-500/30 flex items-center justify-center shadow-inner relative group">
            <Lock className="w-6 h-6 text-butter-300 transition-transform group-hover:scale-110" />
            <Sparkles className="w-3 h-3 text-ice-100 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isFirstSetup
                ? setupStep === "new"
                  ? "Atur Master PIN Baru"
                  : "Konfirmasi Master PIN"
                : "Academic Task Manager"}
            </h1>
            <p className="text-xs text-muted mt-1">
              {isFirstSetup
                ? setupStep === "new"
                  ? "Buat PIN 4-6 digit untuk mengamankan data perkuliahanmu"
                  : "Ketik ulang PIN yang sama untuk verifikasi"
                : "Masukkan PIN (4-6 digit) lalu tekan Buka Kunci"}
            </p>
          </div>
        </div>

        {/* PIN Dots Indicator (Supports 4 to 6 digits) */}
        <div className="flex items-center justify-center gap-2.5 my-6">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = currentDisplayPin.length > index;
            return (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  isFilled
                    ? "bg-butter-300 scale-125 shadow-[0_0_12px_rgba(254,240,138,0.7)] border-butter-200"
                    : "border-2 border-cobalt-400/30 bg-navy-950/40"
                }`}
              />
            );
          })}
        </div>

        {/* Error / Status Message */}
        <div className="h-5 flex items-center justify-center text-center">
          {error ? (
            <span className="text-xs font-medium text-rose-400 animate-pulse">{error}</span>
          ) : loading ? (
            <span className="text-xs text-cobalt-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-butter-300 animate-ping" />
              Memverifikasi...
            </span>
          ) : (
            <span className="text-[11px] text-muted">PIN default: <strong className="text-butter-300 font-mono">1234</strong> (bisa 4-6 digit)</span>
          )}
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 mt-5">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={loading}
              className="h-14 rounded-xl bg-surface-hover/50 hover:bg-surface-hover active:bg-cobalt-500/20 active:scale-95 border border-surface-border text-lg font-semibold text-foreground flex items-center justify-center transition-all duration-150 disabled:opacity-50"
            >
              {num}
            </button>
          ))}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={loading || currentDisplayPin.length === 0}
            className="h-14 rounded-xl hover:bg-surface-hover active:scale-95 text-xs font-medium text-muted hover:text-foreground flex items-center justify-center transition-all disabled:opacity-30"
          >
            Clear
          </button>

          {/* Number 0 */}
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading}
            className="h-14 rounded-xl bg-surface-hover/50 hover:bg-surface-hover active:bg-cobalt-500/20 active:scale-95 border border-surface-border text-lg font-semibold text-foreground flex items-center justify-center transition-all duration-150 disabled:opacity-50"
          >
            0
          </button>

          {/* Delete / Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || currentDisplayPin.length === 0}
            className="h-14 rounded-xl hover:bg-surface-hover active:scale-95 text-muted hover:text-foreground flex items-center justify-center transition-all disabled:opacity-30"
            aria-label="Hapus digit terakhir"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Buka Kunci (when entering 4-6 digits) */}
        {!isFirstSetup ? (
          <button
            type="button"
            onClick={() => submitUnlock(pin)}
            disabled={loading || pin.length < 4}
            className="w-full mt-4 h-12 rounded-xl bg-butter-300 hover:bg-butter-200 active:scale-[0.98] text-navy-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Buka Kunci</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSetupNext}
            disabled={loading || currentDisplayPin.length < 4}
            className="w-full mt-4 h-11 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            <span>{setupStep === "new" ? "Lanjut Konfirmasi" : "Simpan & Buka"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-surface-border/50 text-center">
          <p className="text-[11px] text-muted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cobalt-400" />
            <span>Sesi aman terenkripsi 30 hari</span>
          </p>
        </div>
      </div>
    </main>
  );
}