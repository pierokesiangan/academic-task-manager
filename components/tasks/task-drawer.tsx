"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Clock,
  Calendar,
  CheckSquare,
  Square,
  Link as LinkIcon,
  Plus,
  Trash2,
  ExternalLink,
  Star,
  Sparkles,
  BookOpen,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  updateTaskAction,
  toggleTaskStatusAction,
  toggleChecklistAction,
  addChecklistAction,
  removeChecklistAction,
  addLinkAction,
  removeLinkAction,
  deleteTaskAction,
} from "@/actions/tasks";

interface TaskChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
  order: number;
}

interface TaskLinkItem {
  id: string;
  title: string;
  url: string;
}

export interface TaskDetailData {
  id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  status: string;
  priority: string;
  isImportant: boolean;
  deadline: Date | string;
  courseId: string;
  meetingId: string | null;
  course: {
    id: string;
    name: string;
    code: string | null;
    color: string;
  };
  meeting?: {
    id: string;
    weekNumber: number;
    title: string | null;
  } | null;
  checklists: TaskChecklistItem[];
  links: TaskLinkItem[];
}

interface TaskDrawerProps {
  task: TaskDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function TaskDrawer({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
}: TaskDrawerProps) {
  if (!task) return null;

  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [isImportant, setIsImportant] = useState(task.isImportant);
  const [description, setDescription] = useState(task.description || "");
  const [instructions, setInstructions] = useState(task.instructions || "");
  const [checklists, setChecklists] = useState<TaskChecklistItem[]>(task.checklists || []);
  const [links, setLinks] = useState<TaskLinkItem[]>(task.links || []);

  const [newChecklistText, setNewChecklistText] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [showAddLink, setShowAddLink] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setStatus(task.status);
    setPriority(task.priority);
    setIsImportant(task.isImportant);
    setDescription(task.description || "");
    setInstructions(task.instructions || "");
    setChecklists(task.checklists || []);
    setLinks(task.links || []);
  }, [task]);

  const totalChecklists = checklists.length;
  const completedChecklists = checklists.filter((c) => c.isCompleted).length;
  const progressPercent =
    totalChecklists > 0
      ? Math.round((completedChecklists / totalChecklists) * 100)
      : 0;

  const deadlineDate = new Date(task.deadline);
  const isOverdue = status !== "DONE" && deadlineDate < new Date();

  // Status Change with Confetti Celebration on DONE
  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === "DONE") {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#FFF7CC", "#7DA7D9", "#34D399"],
      });
    }
    await toggleTaskStatusAction(task.id, newStatus);
    onTaskUpdated?.();
  };

  // Toggle Checklist item
  const handleToggleChecklist = async (id: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    setChecklists((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isCompleted: nextVal } : c))
    );

    // Jika seluruh checklist sekarang selesai, tawarkan micro celebration
    const updatedCompleted = checklists.filter((c) =>
      c.id === id ? nextVal : c.isCompleted
    ).length;
    if (updatedCompleted === checklists.length && checklists.length > 0) {
      confetti({
        particleCount: 40,
        spread: 45,
        origin: { y: 0.8 },
        colors: ["#FFF7CC", "#7DA7D9"],
      });
    }

    await toggleChecklistAction(id, nextVal);
    onTaskUpdated?.();
  };

  // Add Checklist
  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;

    const res = await addChecklistAction(task.id, newChecklistText);
    if (res.success && res.data) {
      setChecklists((prev) => [...prev, res.data as TaskChecklistItem]);
      setNewChecklistText("");
      onTaskUpdated?.();
    }
  };

  // Remove Checklist
  const handleRemoveChecklist = async (id: string) => {
    setChecklists((prev) => prev.filter((c) => c.id !== id));
    await removeChecklistAction(id);
    onTaskUpdated?.();
  };

  // Add Link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;

    const res = await addLinkAction(task.id, newLinkTitle, newLinkUrl);
    if (res.success && res.data) {
      setLinks((prev) => [...prev, res.data as TaskLinkItem]);
      setNewLinkTitle("");
      setNewLinkUrl("");
      setShowAddLink(false);
      onTaskUpdated?.();
    }
  };

  // Remove Link
  const handleRemoveLink = async (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    await removeLinkAction(id);
    onTaskUpdated?.();
  };

  // Delete Task
  const handleDeleteTask = async () => {
    if (!confirm(`Hapus tugas "${task.title}"?`)) return;
    setLoading(true);
    await deleteTaskAction(task.id);
    onOpenChange(false);
    onTaskUpdated?.();
  };

  // Auto-save description/instructions on blur
  const handleSaveNotes = async () => {
    await updateTaskAction(task.id, {
      description,
      instructions,
      priority,
      isImportant,
    });
    onTaskUpdated?.();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-surface border-l border-surface-border p-6 shadow-2xl flex flex-col justify-between overflow-y-auto focus:outline-none animate-slide-left">
          {/* Top Bar Navigation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
              {/* Course Tag Pill */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: task.course.color }}
                />
                <span className="text-xs font-bold text-foreground">
                  {task.course.code ? `[${task.course.code}] ` : ""}
                  {task.course.name}
                </span>

                {task.meeting && (
                  <span className="px-2 py-0.5 rounded-md bg-navy-950/80 border border-surface-border text-[10px] font-mono font-medium text-cobalt-300">
                    Week {task.meeting.weekNumber}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const nextVal = !isImportant;
                    setIsImportant(nextVal);
                    await updateTaskAction(task.id, { isImportant: nextVal });
                    onTaskUpdated?.();
                  }}
                  className={`p-1.5 rounded-lg border transition-all ${
                    isImportant
                      ? "bg-butter-300/20 border-butter-300/50 text-butter-300"
                      : "border-surface-border text-muted hover:text-foreground"
                  }`}
                  title={isImportant ? "Penting Sekali" : "Tandai Penting"}
                >
                  <Star
                    className={`w-4 h-4 ${
                      isImportant ? "fill-butter-300 text-butter-300" : ""
                    }`}
                  />
                </button>

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
            </div>

            {/* Task Title */}
            <div>
              <Dialog.Title className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                {task.title}
              </Dialog.Title>
            </div>

            {/* Metadata Badges: Status, Priority, Deadline */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {/* Status Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg bg-surface-hover border border-surface-border text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="TODO">Belum Dikerjakan</option>
                  <option value="IN_PROGRESS">Sedang Berjalan</option>
                  <option value="DONE">Selesai</option>
                </select>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Prioritas
                </span>
                <select
                  value={priority}
                  onChange={async (e) => {
                    const newP = e.target.value;
                    setPriority(newP);
                    await updateTaskAction(task.id, { priority: newP });
                    onTaskUpdated?.();
                  }}
                  className="w-full h-8 px-2.5 rounded-lg bg-surface-hover border border-surface-border text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Deadline Indicator */}
              <div className="col-span-2 sm:col-span-1 space-y-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Deadline
                </span>
                <div
                  className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-semibold ${
                    isOverdue
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-surface-hover border-surface-border text-foreground"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-butter-300" />
                  <span className="truncate">
                    {deadlineDate.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Overdue Warning Banner */}
            {isOverdue && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>
                  Tugas ini sudah melewati batas waktu deadline dan belum diselesaikan!
                </span>
              </div>
            )}

            {/* Checklist Section with Progress Bar */}
            <div className="pt-3 border-t border-surface-border/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-butter-300" />
                  <span className="text-xs font-bold text-foreground">
                    Checklist Sub-Tugas
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-cobalt-300">
                  {completedChecklists}/{totalChecklists} ({progressPercent}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden border border-surface-border/40">
                <div
                  className="h-full bg-gradient-to-r from-cobalt-400 via-butter-300 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Checklists List */}
              <div className="space-y-1.5 pt-1">
                {checklists.map((c) => (
                  <div
                    key={c.id}
                    className="group flex items-center justify-between p-2 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border/50 text-xs transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => handleToggleChecklist(c.id, c.isCompleted)}
                      className="flex items-center gap-2.5 text-left flex-1"
                    >
                      {c.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-muted shrink-0 group-hover:text-foreground" />
                      )}
                      <span
                        className={`transition-all ${
                          c.isCompleted
                            ? "line-through text-muted"
                            : "text-foreground"
                        }`}
                      >
                        {c.title}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(c.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-muted hover:text-rose-400 transition-opacity"
                      title="Hapus Sub-Tugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Checklist Input */}
                <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Tambah sub-tugas... (tekan Enter)"
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors"
                  />
                  <button
                    type="submit"
                    className="h-9 px-3 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-foreground flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Links Section */}
            <div className="pt-3 border-t border-surface-border/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-cobalt-400" />
                  <span className="text-xs font-bold text-foreground">
                    Tautan Referensi / Berkas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddLink(!showAddLink)}
                  className="text-xs font-semibold text-butter-300 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Link</span>
                </button>
              </div>

              {/* Add Link Form */}
              {showAddLink && (
                <form
                  onSubmit={handleAddLink}
                  className="p-3 rounded-xl bg-surface-hover border border-surface-border space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Nama Link (Contoh: Google Docs Laporan)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-surface border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none"
                  />
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg bg-surface border border-surface-border text-xs text-foreground font-mono placeholder:text-muted/50 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddLink(false)}
                      className="px-2.5 py-1 text-xs text-muted hover:text-foreground"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg bg-butter-300 text-navy-950 font-semibold text-xs"
                    >
                      Simpan Link
                    </button>
                  </div>
                </form>
              )}

              {/* Links List */}
              <div className="space-y-1.5">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-surface-hover/50 border border-surface-border text-xs group"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cobalt-400 hover:text-butter-300 font-medium truncate flex-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{link.title}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(link.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/10 text-muted hover:text-rose-400 transition-opacity"
                      title="Hapus Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description & Instructions (Notes) */}
            <div className="pt-3 border-t border-surface-border/60 space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-ice-200" />
                <span className="text-xs font-bold text-foreground">
                  Catatan / Instruksi Tugas
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Tulis instruksi pengerjaan, format submit, atau catatan dosen..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveNotes}
                className="w-full p-3 rounded-xl bg-surface-hover/60 border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer Actions: Delete Task */}
          <div className="pt-6 border-t border-surface-border/60 flex items-center justify-between mt-6">
            <button
              type="button"
              onClick={handleDeleteTask}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Tugas</span>
            </button>

            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-surface-border text-xs font-semibold text-foreground transition-all"
              >
                Selesai
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
