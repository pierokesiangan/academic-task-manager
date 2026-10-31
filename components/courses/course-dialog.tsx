"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Edit2, Loader2, BookOpen } from "lucide-react";
import { createCourseAction, updateCourseAction, CourseFormData } from "@/actions/courses";

const COLOR_PRESETS = [
  { name: "Soft Cobalt", value: "#7DA7D9" },
  { name: "Deep Navy", value: "#2F4860" },
  { name: "Ice Blue", value: "#99BCE4" },
  { name: "Butter Yellow", value: "#FEF08A" },
  { name: "Mint Green", value: "#34D399" },
  { name: "Coral Red", value: "#F87171" },
  { name: "Violet", value: "#C084FC" },
  { name: "Amber", value: "#FB923C" },
];

const DAYS_OF_WEEK = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

interface CourseDialogProps {
  initialData?: {
    id: string;
    name: string;
    code: string | null;
    credits: number;
    color: string;
    lecturer: string | null;
    scheduleDay: string | null;
    startTime: string | null;
    endTime: string | null;
    room: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CourseDialog({ initialData, trigger, onSuccess }: CourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!initialData;

  const [formData, setFormData] = useState<CourseFormData>({
    name: initialData?.name || "",
    code: initialData?.code || "",
    credits: initialData?.credits || 3,
    color: initialData?.color || "#7DA7D9",
    lecturer: initialData?.lecturer || "",
    scheduleDay: initialData?.scheduleDay || "Senin",
    startTime: initialData?.startTime || "08:00",
    endTime: initialData?.endTime || "10:30",
    room: initialData?.room || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nama mata kuliah wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && initialData) {
        const res = await updateCourseAction(initialData.id, formData);
        if (res.success) {
          setOpen(false);
          onSuccess?.();
        } else {
          setError(res.error || "Gagal memperbarui mata kuliah");
        }
      } else {
        const res = await createCourseAction(formData);
        if (res.success) {
          setOpen(false);
          setFormData({
            name: "",
            code: "",
            credits: 3,
            color: "#7DA7D9",
            lecturer: "",
            scheduleDay: "Senin",
            startTime: "08:00",
            endTime: "10:30",
            room: "",
          });
          onSuccess?.();
        } else {
          setError(res.error || "Gagal membuat mata kuliah");
        }
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
            className="px-3.5 py-2 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Matkul</span>
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-surface border border-surface-border p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between pb-4 border-b border-surface-border/60">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-950 shadow-sm"
                style={{ backgroundColor: formData.color }}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <Dialog.Title className="text-base font-bold text-foreground">
                  {isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah Baru"}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-muted">
                  {isEditing
                    ? "Perbarui rincian jadwal atau dosen mata kuliah"
                    : "Sistem otomatis membuat 16 pertemuan silabus perkuliahan"}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="w-7 h-7 rounded-lg hover:bg-surface-hover flex items-center justify-center text-muted hover:text-foreground transition-all"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
                {error}
              </div>
            )}

            {/* Nama & Kode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Nama Mata Kuliah <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Algoritma & Struktur Data"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Kode (Opsional)</label>
                <input
                  type="text"
                  placeholder="CS201"
                  value={formData.code || ""}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground font-mono placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>
            </div>

            {/* SKS & Dosen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Jumlah SKS</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.credits}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: parseInt(e.target.value) || 3 })
                  }
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Dosen Pengampu</label>
                <input
                  type="text"
                  placeholder="Nama Dosen / Asisten"
                  value={formData.lecturer || ""}
                  onChange={(e) => setFormData({ ...formData, lecturer: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>
            </div>

            {/* Jadwal: Hari, Jam Mulai, Jam Selesai */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Hari</label>
                <select
                  value={formData.scheduleDay || "Senin"}
                  onChange={(e) => setFormData({ ...formData, scheduleDay: e.target.value })}
                  className="w-full h-10 px-2 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d} className="bg-surface text-foreground">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Mulai</label>
                <input
                  type="time"
                  value={formData.startTime || "08:00"}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full h-10 px-2 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Selesai</label>
                <input
                  type="time"
                  value={formData.endTime || "10:30"}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full h-10 px-2 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground focus:outline-none focus:border-cobalt-400 transition-colors"
                />
              </div>
            </div>

            {/* Ruangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Ruang Kelas / Lab</label>
              <input
                type="text"
                placeholder="Misal: Lab Komputer 3, Gedung B R.204, atau Zoom"
                value={formData.room || ""}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
              />
            </div>

            {/* Tag Warna Presets */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">Tag Warna Matkul</label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      formData.color === color.value
                        ? "scale-110 border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                        : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-surface-border/60 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl hover:bg-surface-hover text-xs font-medium text-muted hover:text-foreground transition-all"
                >
                  Batal
                </button>
              </Dialog.Close>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-butter-300 hover:bg-butter-200 text-navy-950 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
              >
                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isEditing ? "Simpan Perubahan" : "Buat Matkul"}</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
