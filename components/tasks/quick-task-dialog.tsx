"use client";

import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, X, Calendar, Clock, Star, Loader2, Sparkles } from "lucide-react";
import { quickCreateTaskAction } from "@/actions/tasks";

interface CourseOption {
  id: string;
  name: string;
  code: string | null;
  color: string;
}

interface QuickTaskDialogProps {
  courses: CourseOption[];
  defaultCourseId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function QuickTaskDialog({
  courses,
  defaultCourseId,
  trigger,
  onSuccess,
}: QuickTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState(defaultCourseId || courses[0]?.id || "");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [isImportant, setIsImportant] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Set default deadline ke besok jam 23:59
  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const year = tomorrow.getFullYear();
      const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getDate()).padStart(2, "0");
      setDeadline(`${year}-${month}-${day}T23:59`);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Global Keyboard shortcut 'C' untuk membuka dialog cepat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "c" || e.key === "C") &&
        !open &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Judul tugas wajib diisi!");
      return;
    }
    if (!courseId) {
      setError("Pilih mata kuliah terlebih dahulu!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await quickCreateTaskAction({
        title,
        courseId,
        deadline,
        priority,
        isImportant,
      });

      if (res.success) {
        setTitle("");
        setOpen(false);
        onSuccess?.();
      } else {
        setError(res.error || "Gagal membuat tugas");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Tugas Baru</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-navy-950/20 text-[10px] font-mono">
              C
            </kbd>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg rounded-2xl bg-surface border border-surface-border p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-navy-900 border border-cobalt-500/30 flex items-center justify-center text-butter-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold text-foreground">
                  Buat Tugas Cepat
                </Dialog.Title>
                <Dialog.Description className="text-[11px] text-muted">
                  Ketik judul, matkul, dan deadline dalam 3 detik
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

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            {/* Input Judul Utama */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Judul Tugas <span className="text-rose-400">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                required
                placeholder="Misal: Tugas Makalah Bab 3 atau Latihan Soal UTS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-hover/70 border border-surface-border text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
              />
            </div>

            {/* Mata Kuliah Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Mata Kuliah <span className="text-rose-400">*</span>
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-hover/70 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-surface text-foreground">
                    {c.code ? `[${c.code}] ` : ""}
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline: Tanggal & Jam */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Tenggat Waktu (Deadline)</span>
                <span className="text-[11px] text-muted font-normal">Default: 23:59</span>
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-hover/70 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
              />
            </div>

            {/* Prioritas & Toggle Penting Sekali */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">Prioritas</label>
                <div className="flex items-center gap-1.5">
                  {[
                    { label: "Low", value: "LOW", color: "text-muted" },
                    { label: "Med", value: "MEDIUM", color: "text-cobalt-300" },
                    { label: "High", value: "HIGH", color: "text-amber-400" },
                    { label: "Urgent", value: "URGENT", color: "text-rose-400" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                        priority === p.value
                          ? "bg-surface border-cobalt-400 text-foreground shadow-sm"
                          : "border-transparent text-muted/70 hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <span className={p.color}>●</span> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Star Important Toggle */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-semibold text-foreground block">Penting</label>
                <button
                  type="button"
                  onClick={() => setIsImportant(!isImportant)}
                  className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                    isImportant
                      ? "bg-butter-300/20 border-butter-300/50 text-butter-300"
                      : "border-surface-border text-muted hover:text-foreground"
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isImportant ? "fill-butter-300 text-butter-300" : ""
                    }`}
                  />
                  <span>{isImportant ? "Penting Sekali" : "Biasa"}</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-surface-border/60 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="px-3.5 py-2 rounded-xl hover:bg-surface-hover text-xs font-medium text-muted hover:text-foreground transition-all"
                >
                  Batal
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50 active:scale-95"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Simpan Tugas</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
