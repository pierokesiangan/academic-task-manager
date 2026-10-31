"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Edit3, Loader2 } from "lucide-react";
import { updateMeetingTopicAction } from "@/actions/courses";

interface EditMeetingDialogProps {
  meeting: {
    id: string;
    weekNumber: number;
    title: string | null;
    notes: string | null;
  };
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function EditMeetingDialog({ meeting, trigger, onSuccess }: EditMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(meeting.title || "");
  const [notes, setNotes] = useState(meeting.notes || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await updateMeetingTopicAction(meeting.id, title, notes);
      if (res.success) {
        setOpen(false);
        onSuccess?.();
      } else {
        setError(res.error || "Gagal menyimpan materi pertemuan");
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
            className="p-1.5 rounded-lg hover:bg-surface-hover text-muted hover:text-foreground transition-all"
            title="Edit Topik Pertemuan"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl bg-surface border border-surface-border p-6 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
            <div>
              <Dialog.Title className="text-base font-bold text-foreground">
                Pertemuan Week {meeting.weekNumber}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted">
                Perbarui topik silabus dan catatan dosen untuk minggu ini
              </Dialog.Description>
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Topik / Materi Kuliah</label>
              <input
                type="text"
                placeholder="Contoh: Array Dinamis & Linked List"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Catatan Dosen / Instruksi</label>
              <textarea
                rows={3}
                placeholder="Catatan penting dosen, kisi-kisi, atau referensi bab buku..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors resize-none"
              />
            </div>

            <div className="pt-3 border-t border-surface-border/60 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  disabled={loading}
                  className="px-3.5 py-1.5 rounded-xl hover:bg-surface-hover text-xs font-medium text-muted hover:text-foreground transition-all"
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
                <span>Simpan Topik</span>
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
