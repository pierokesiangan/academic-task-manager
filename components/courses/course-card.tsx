import Link from "next/link";
import { Clock, MapPin, User, CheckSquare, AlertCircle, ArrowUpRight } from "lucide-react";

interface CourseCardProps {
  course: {
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
    isArchived: boolean;
    activeTasksCount?: number;
    overdueTasksCount?: number;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const hasSchedule = course.scheduleDay && course.startTime;
  const activeTasks = course.activeTasksCount ?? 0;
  const overdueTasks = course.overdueTasksCount ?? 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group relative rounded-2xl bg-surface border border-surface-border p-5 hover:border-cobalt-400/40 hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden"
    >
      {/* Top Color Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: course.color }}
      />

      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {course.code && (
                <span className="px-2 py-0.5 rounded-md bg-navy-950/60 border border-surface-border font-mono text-[11px] font-semibold text-cobalt-300">
                  {course.code}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-md bg-surface-hover border border-surface-border text-[11px] font-medium text-muted">
                {course.credits} SKS
              </span>
            </div>

            <h3 className="text-base font-bold text-foreground group-hover:text-butter-300 transition-colors line-clamp-1">
              {course.name}
            </h3>
          </div>

          <div className="w-7 h-7 rounded-lg bg-surface-hover border border-surface-border flex items-center justify-center text-muted group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        {/* Lecturer & Schedule meta */}
        <div className="space-y-1.5 pt-1 text-xs text-muted">
          {course.lecturer && (
            <div className="flex items-center gap-2 truncate">
              <User className="w-3.5 h-3.5 text-cobalt-400 shrink-0" />
              <span className="truncate">{course.lecturer}</span>
            </div>
          )}

          {hasSchedule ? (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-butter-300 shrink-0" />
              <span>
                {course.scheduleDay}, {course.startTime} - {course.endTime || "Selesai"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted/60 italic text-[11px]">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Jadwal belum diatur</span>
            </div>
          )}

          {course.room && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-ice-200 shrink-0" />
              <span>{course.room}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Tasks Badges */}
      <div className="mt-5 pt-3 border-t border-surface-border/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-hover text-muted text-[11px]">
            <CheckSquare className="w-3 h-3 text-cobalt-400" />
            <span>{activeTasks} Tugas</span>
          </span>

          {overdueTasks > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 font-medium text-[11px] animate-pulse">
              <AlertCircle className="w-3 h-3" />
              <span>{overdueTasks} Overdue</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-cobalt-400 group-hover:underline">
          16 Weeks →
        </span>
      </div>
    </Link>
  );
}
