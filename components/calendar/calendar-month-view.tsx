"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckSquare,
  AlertCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { TaskDetailData } from "@/components/tasks/task-drawer";

interface CourseSchedule {
  id: string;
  name: string;
  code: string | null;
  color: string;
  scheduleDay: string | null;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
}

interface CalendarMonthViewProps {
  tasks: TaskDetailData[];
  courses: CourseSchedule[];
  onSelectTask: (task: TaskDetailData) => void;
}

const DAYS_HEADER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const dayNameToIndexMap: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 0,
};

export function CalendarMonthView({
  tasks,
  courses,
  onSelectTask,
}: CalendarMonthViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 to 11

  // Hitung hari pertama bulan & total hari
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Hari pertama dalam format Senin=0, Minggu=6
  const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = lastDayOfMonth.getDate();

  // Hari dari bulan sebelumnya untuk padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  // Grid sel (total 35 atau 42)
  const calendarCells = [];

  // 1. Sel padding bulan lalu
  for (let i = startDayIndex - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    calendarCells.push({
      date: new Date(year, month - 1, d),
      dayNumber: d,
      isCurrentMonth: false,
    });
  }

  // 2. Sel bulan berjalan
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      date: new Date(year, month, i),
      dayNumber: i,
      isCurrentMonth: true,
    });
  }

  // 3. Sel padding bulan depan
  const remainingCells = (7 - (calendarCells.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({
      date: new Date(year, month + 1, i),
      dayNumber: i,
      isCurrentMonth: false,
    });
  }

  const today = new Date();
  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="rounded-2xl bg-surface border border-surface-border p-4 sm:p-6 space-y-4 shadow-sm">
      {/* Month Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border/60">
        <div className="flex items-center gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {MONTH_NAMES[month]} {year}
          </h2>

          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 rounded-lg bg-surface-hover hover:bg-surface border border-surface-border text-xs font-semibold text-muted hover:text-foreground transition-all"
          >
            Hari Ini
          </button>
        </div>

        {/* Next / Prev buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg bg-surface-hover hover:bg-surface border border-surface-border text-muted hover:text-foreground transition-all"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg bg-surface-hover hover:bg-surface border border-surface-border text-muted hover:text-foreground transition-all"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-muted pb-1">
        {DAYS_HEADER.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {calendarCells.map((cell, idx) => {
          const dateStr = cell.date.toISOString().slice(0, 10);
          const cellIsToday = isToday(cell.date);

          // Cari tugas yang jatuh tempo pada tanggal ini
          const dayTasks = tasks.filter((t) => {
            const taskDate = new Date(t.deadline).toISOString().slice(0, 10);
            return taskDate === dateStr;
          });

          // Cari jadwal kuliah di hari ini
          const cellDayOfWeek = cell.date.getDay();
          const dayCourses = courses.filter(
            (c) =>
              c.scheduleDay &&
              dayNameToIndexMap[c.scheduleDay] === cellDayOfWeek
          );

          return (
            <div
              key={idx}
              className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                cellIsToday
                  ? "bg-butter-300/5 border-butter-300/60 shadow-[0_0_10px_rgba(254,240,138,0.1)]"
                  : cell.isCurrentMonth
                  ? "bg-surface/60 border-surface-border/70 hover:bg-surface-hover/50"
                  : "bg-surface/20 border-surface-border/30 opacity-40"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold rounded-md px-1.5 py-0.5 ${
                    cellIsToday
                      ? "bg-butter-300 text-navy-950 font-black shadow-sm"
                      : "text-foreground"
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono text-muted">
                    {dayTasks.length} Tgs
                  </span>
                )}
              </div>

              {/* Tasks & Lectures List */}
              <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                {/* Tasks Badges */}
                {dayTasks.slice(0, 2).map((task) => {
                  const isDone = task.status === "DONE";
                  const isOverdue = !isDone && new Date(task.deadline) < new Date();

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => onSelectTask(task)}
                      className={`w-full text-left p-1 rounded-md text-[10px] font-medium truncate block border transition-all ${
                        isDone
                          ? "bg-surface border-surface-border text-muted line-through"
                          : isOverdue
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-400 font-bold"
                          : "bg-surface-hover border-surface-border text-foreground hover:border-cobalt-400"
                      }`}
                      style={{
                        borderLeftWidth: "3px",
                        borderLeftColor: task.course.color,
                      }}
                      title={`${task.title} - ${task.course.name}`}
                    >
                      <span className="truncate">{task.title}</span>
                    </button>
                  );
                })}

                {/* Overflow indicator */}
                {dayTasks.length > 2 && (
                  <span className="text-[9px] text-cobalt-300 font-semibold block text-center">
                    +{dayTasks.length - 2} lainnya
                  </span>
                )}

                {/* Lecture indicator if no tasks or 1 task */}
                {dayTasks.length < 2 && dayCourses.length > 0 && cell.isCurrentMonth && (
                  <div className="hidden sm:flex items-center gap-1 text-[9px] text-muted truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: dayCourses[0].color }}
                    />
                    <span className="truncate">{dayCourses[0].code || dayCourses[0].name}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
