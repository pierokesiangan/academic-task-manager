"use client";

import { CheckSquare, Square, Clock, Star, AlertCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { toggleTaskStatusAction } from "@/actions/tasks";
import { TaskDetailData } from "./task-drawer";

interface TaskListViewProps {
  tasks: TaskDetailData[];
  onSelectTask: (task: TaskDetailData) => void;
  onRefresh?: () => void;
}

export function TaskListView({ tasks, onSelectTask, onRefresh }: TaskListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="p-12 rounded-2xl bg-surface border border-surface-border text-center space-y-2">
        <p className="text-sm font-semibold text-foreground">Tidak ada tugas ditemukan</p>
        <p className="text-xs text-muted">
          Coba ganti filter pencarian atau buat tugas baru dengan menekan tombol &apos;Tugas Baru&apos;.
        </p>
      </div>
    );
  }

  const handleToggleCheck = async (e: React.MouseEvent, task: TaskDetailData) => {
    e.stopPropagation();
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";

    if (newStatus === "DONE") {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#FFF7CC", "#7DA7D9", "#34D399"],
      });
    }

    await toggleTaskStatusAction(task.id, newStatus);
    onRefresh?.();
  };

  return (
    <div className="rounded-2xl bg-surface border border-surface-border divide-y divide-surface-border/60 overflow-hidden shadow-sm">
      {tasks.map((task) => {
        const isDone = task.status === "DONE";
        const deadlineDate = new Date(task.deadline);
        const isOverdue = !isDone && deadlineDate < new Date();
        const totalChecklists = task.checklists?.length || 0;
        const completedChecklists =
          task.checklists?.filter((c) => c.isCompleted).length || 0;

        return (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            className={`group px-4 py-3 sm:px-5 flex items-center justify-between gap-3 hover:bg-surface-hover/70 cursor-pointer transition-colors ${
              isDone ? "bg-surface/40 opacity-75" : ""
            }`}
          >
            {/* Left: Checkbox + Title + Course Pill */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Checkbox button */}
              <button
                type="button"
                onClick={(e) => handleToggleCheck(e, task)}
                className="shrink-0 p-0.5 rounded text-muted hover:text-foreground transition-transform active:scale-90"
                title={isDone ? "Tandai Belum Selesai" : "Tandai Selesai"}
              >
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-muted group-hover:text-cobalt-400" />
                )}
              </button>

              {/* Title & Star */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {task.isImportant && (
                  <Star className="w-3.5 h-3.5 fill-butter-300 text-butter-300 shrink-0" />
                )}
                <span
                  className={`text-xs sm:text-sm font-medium truncate transition-all ${
                    isDone
                      ? "line-through text-muted"
                      : "text-foreground group-hover:text-butter-300"
                  }`}
                >
                  {task.title}
                </span>
              </div>
            </div>

            {/* Right metadata badges */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Course Tag */}
              <span
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border"
                style={{
                  backgroundColor: `${task.course.color}15`,
                  borderColor: `${task.course.color}40`,
                  color: task.course.color,
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: task.course.color }}
                />
                <span className="truncate max-w-[120px]">
                  {task.course.code || task.course.name}
                </span>
              </span>

              {/* Meeting Week if any */}
              {task.meeting && (
                <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-surface-hover text-[10px] font-mono text-muted">
                  W{task.meeting.weekNumber}
                </span>
              )}

              {/* Checklist badge */}
              {totalChecklists > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-navy-950/60 text-[10px] font-mono text-cobalt-300">
                  <CheckSquare className="w-3 h-3 text-butter-300" />
                  {completedChecklists}/{totalChecklists}
                </span>
              )}

              {/* Deadline badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  isDone
                    ? "text-muted"
                    : isOverdue
                    ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 animate-pulse"
                    : "text-muted group-hover:text-foreground"
                }`}
              >
                {isOverdue ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-butter-300" />
                )}
                <span>
                  {deadlineDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
