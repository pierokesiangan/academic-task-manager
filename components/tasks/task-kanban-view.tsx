"use client";

import { TaskDetailData } from "./task-drawer";
import { Clock, Star, AlertCircle, CheckSquare, ArrowRight, ArrowLeft, Filter } from "lucide-react";
import confetti from "canvas-confetti";
import { toggleTaskStatusAction } from "@/actions/tasks";

interface TaskKanbanViewProps {
  tasks: TaskDetailData[];
  selectedStatus?: string;
  onSelectTask: (task: TaskDetailData) => void;
  onRefresh?: () => void;
}

const ALL_COLUMNS = [
  { id: "TODO", title: "Belum Dikerjakan", color: "text-muted", border: "border-surface-border" },
  { id: "IN_PROGRESS", title: "Sedang Dikerjakan", color: "text-cobalt-400", border: "border-cobalt-500/30" },
  { id: "DONE", title: "Selesai", color: "text-emerald-400", border: "border-emerald-500/30" },
];

export function TaskKanbanView({ tasks, selectedStatus = "ALL", onSelectTask, onRefresh }: TaskKanbanViewProps) {
  const handleMoveStatus = async (
    e: React.MouseEvent,
    taskId: string,
    targetStatus: string
  ) => {
    e.stopPropagation();
    if (targetStatus === "DONE") {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#FFF7CC", "#7DA7D9", "#34D399"],
      });
    }
    await toggleTaskStatusAction(taskId, targetStatus);
    onRefresh?.();
  };

  // Filter columns based on user's status filter dropdown
  const visibleColumns = ALL_COLUMNS.filter((col) => {
    if (selectedStatus === "ALL") return true;
    if (selectedStatus === "OVERDUE") return col.id !== "DONE"; // Overdue only applies to TODO & IN_PROGRESS
    return col.id === selectedStatus;
  });

  if (tasks.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-surface border border-surface-border text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">Tidak ada tugas ditemukan</p>
        <p className="text-xs text-muted">
          Coba ganti filter pencarian atau pilih &apos;Semua Status&apos; untuk melihat tugas lainnya.
        </p>
      </div>
    );
  }

  const gridColsClass =
    visibleColumns.length === 1
      ? "max-w-2xl mx-auto grid grid-cols-1"
      : visibleColumns.length === 2
      ? "grid grid-cols-1 md:grid-cols-2 gap-4"
      : "grid grid-cols-1 md:grid-cols-3 gap-4";

  return (
    <div className={gridColsClass}>
      {visibleColumns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="rounded-2xl bg-surface/50 border border-surface-border p-4 flex flex-col space-y-3 min-h-[450px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${col.color}`}>
                  ● {col.title}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-hover border border-surface-border text-xs font-mono font-semibold text-muted">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Tasks */}
            <div className="space-y-2.5 flex-1">
              {columnTasks.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-muted/60 italic border border-dashed border-surface-border/60 rounded-xl">
                  Tidak ada tugas di kolom ini
                </div>
              ) : (
                columnTasks.map((task) => {
                  const deadlineDate = new Date(task.deadline);
                  const isOverdue =
                    col.id !== "DONE" && deadlineDate < new Date();
                  const totalChecklists = task.checklists?.length || 0;
                  const completedChecklists =
                    task.checklists?.filter((c) => c.isCompleted).length || 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="group p-3.5 rounded-xl bg-surface border border-surface-border hover:border-cobalt-400/50 hover:shadow-md cursor-pointer transition-all duration-150 space-y-2.5"
                    >
                      {/* Course Pill & Star */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold truncate max-w-[150px]"
                          style={{
                            backgroundColor: `${task.course.color}15`,
                            color: task.course.color,
                          }}
                        >
                          {task.course.code || task.course.name}
                        </span>

                        <div className="flex items-center gap-1">
                          {task.isImportant && (
                            <Star className="w-3.5 h-3.5 fill-butter-300 text-butter-300" />
                          )}
                          {task.meeting && (
                            <span className="px-1 py-0.5 rounded bg-surface-hover text-[9px] font-mono text-muted">
                              W{task.meeting.weekNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        className={`text-xs font-semibold text-foreground group-hover:text-butter-300 transition-colors line-clamp-2 ${
                          col.id === "DONE" ? "line-through text-muted" : ""
                        }`}
                      >
                        {task.title}
                      </h4>

                      {/* Checklists progress if any */}
                      {totalChecklists > 0 && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted font-mono">
                          <CheckSquare className="w-3 h-3 text-cobalt-400" />
                          <span>
                            {completedChecklists}/{totalChecklists} Sub-tugas
                          </span>
                        </div>
                      )}

                      {/* Footer: Deadline & Quick Move Buttons */}
                      <div className="pt-2 border-t border-surface-border/50 flex items-center justify-between text-[11px]">
                        <div
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? "text-rose-400 animate-pulse font-bold"
                              : "text-muted"
                          }`}
                        >
                          {isOverdue ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3 text-butter-300" />
                          )}
                          <span>
                            {deadlineDate.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>

                        {/* Move Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.id !== "TODO" && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleMoveStatus(
                                  e,
                                  task.id,
                                  col.id === "DONE" ? "IN_PROGRESS" : "TODO"
                                )
                              }
                              className="p-1 rounded hover:bg-surface-hover text-muted hover:text-foreground"
                              title="Pindahkan ke kolom sebelumnya"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}

                          {col.id !== "DONE" && (
                            <button
                              type="button"
                              onClick={(e) =>
                                handleMoveStatus(
                                  e,
                                  task.id,
                                  col.id === "TODO" ? "IN_PROGRESS" : "DONE"
                                )
                              }
                              className="p-1 rounded hover:bg-surface-hover text-muted hover:text-butter-300"
                              title="Pindahkan ke kolom berikutnya"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}