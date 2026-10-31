"use client";

import { useState, useEffect } from "react";
import { TaskDetailData } from "@/components/tasks/task-drawer";
import {
  Clock,
  Star,
  CheckSquare,
  Square,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toggleTaskStatusAction } from "@/actions/tasks";
import Link from "next/link";

interface FocusTodayProps {
  tasks: TaskDetailData[];
  onSelectTask: (task: TaskDetailData) => void;
  onRefresh?: () => void;
}

function getTimeRemaining(deadline: Date | string) {
  const total = new Date(deadline).getTime() - new Date().getTime();
  const isPast = total < 0;
  const abs = Math.abs(total);

  const hours = Math.floor(abs / (1000 * 60 * 60));
  const minutes = Math.floor((abs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((abs % (1000 * 60)) / 1000);

  return { total, isPast, hours, minutes, seconds };
}

function CountdownTimer({ deadline }: { deadline: Date | string }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.isPast) {
    return (
      <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Terlewat {timeLeft.hours}j {timeLeft.minutes}m lalu</span>
      </span>
    );
  }

  if (timeLeft.hours < 24) {
    return (
      <span className="text-[11px] font-mono font-bold text-butter-300 flex items-center gap-1 bg-butter-300/10 px-2 py-0.5 rounded-md border border-butter-300/30">
        <Flame className="w-3.5 h-3.5 text-butter-300 animate-bounce" />
        <span>Tersisa {timeLeft.hours}j {timeLeft.minutes}m {timeLeft.seconds}s</span>
      </span>
    );
  }

  const days = Math.floor(timeLeft.hours / 24);
  const remHours = timeLeft.hours % 24;
  return (
    <span className="text-[11px] font-mono text-muted flex items-center gap-1">
      <Clock className="w-3.5 h-3.5 text-cobalt-400" />
      <span>{days} hari {remHours} jam lagi</span>
    </span>
  );
}

export function FocusToday({ tasks, onSelectTask, onRefresh }: FocusTodayProps) {
  const handleQuickDone = async (e: React.MouseEvent, task: TaskDetailData) => {
    e.stopPropagation();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#FFF7CC", "#7DA7D9", "#34D399"],
    });

    await toggleTaskStatusAction(task.id, "DONE");
    onRefresh?.();
  };

  return (
    <div className="rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-4 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-butter-300/10 border border-butter-300/30 flex items-center justify-center text-butter-300">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Fokus Hari Ini
            </h2>
            <p className="text-xs text-muted">
              Tugas paling mendesak yang membutuhkan perhatianmu segera
            </p>
          </div>
        </div>

        <Link
          href="/tasks"
          className="text-xs font-semibold text-cobalt-400 hover:text-butter-300 flex items-center gap-1 transition-colors"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="p-8 text-center space-y-2 border border-dashed border-surface-border/60 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Semua Tugas Aman!
          </h3>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Tidak ada deadline mendesak hari ini atau besok. Kamu bisa istirahat atau mencicil materi silabus minggu depan.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isOverdue =
              task.status !== "DONE" && new Date(task.deadline) < new Date();
            const totalChecklists = task.checklists?.length || 0;
            const completedChecklists =
              task.checklists?.filter((c) => c.isCompleted).length || 0;

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className={`group p-3.5 sm:p-4 rounded-xl bg-surface-hover/50 hover:bg-surface-hover border border-surface-border cursor-pointer transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isOverdue ? "border-rose-500/40 bg-rose-500/[0.02]" : ""
                }`}
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => handleQuickDone(e, task)}
                    className="shrink-0 mt-0.5 sm:mt-0 p-0.5 rounded text-muted hover:text-foreground active:scale-90 transition-transform"
                    title="Tandai Selesai"
                  >
                    <Square className="w-4 h-4 text-muted group-hover:text-butter-300" />
                  </button>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold truncate"
                        style={{
                          backgroundColor: `${task.course.color}15`,
                          color: task.course.color,
                        }}
                      >
                        {task.course.code || task.course.name}
                      </span>

                      {task.isImportant && (
                        <Star className="w-3.5 h-3.5 fill-butter-300 text-butter-300 shrink-0" />
                      )}

                      {task.meeting && (
                        <span className="text-[10px] font-mono text-muted">
                          W{task.meeting.weekNumber}
                        </span>
                      )}

                      {totalChecklists > 0 && (
                        <span className="text-[10px] font-mono text-cobalt-300 flex items-center gap-1">
                          <CheckSquare className="w-3 h-3 text-butter-300" />
                          {completedChecklists}/{totalChecklists}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-butter-300 transition-colors line-clamp-1">
                      {task.title}
                    </h4>
                  </div>
                </div>

                {/* Right: Countdown Ticker */}
                <div className="shrink-0 flex items-center justify-between sm:justify-end gap-3 pl-7 sm:pl-0">
                  <CountdownTimer deadline={task.deadline} />
                  <ArrowRight className="w-4 h-4 text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
