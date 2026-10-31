import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

interface CourseWorkloadItem {
  id: string;
  name: string;
  code: string | null;
  color: string;
  credits: number;
  activeTasksCount: number;
}

interface WorkloadChartProps {
  courses: CourseWorkloadItem[];
}

export function WorkloadChart({ courses }: WorkloadChartProps) {
  const maxTasks = Math.max(...courses.map((c) => c.activeTasksCount), 1);
  const totalActive = courses.reduce((acc, c) => acc + c.activeTasksCount, 0);

  return (
    <div className="rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cobalt-400" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Beban Tugas per Matkul
            </h3>
            <p className="text-[11px] text-muted">
              Distribusi tugas aktif semester ini ({totalActive} tugas total)
            </p>
          </div>
        </div>

        <Link
          href="/courses"
          className="text-xs font-semibold text-cobalt-400 hover:text-butter-300 flex items-center gap-1 transition-colors"
        >
          <span>Matkul</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="text-xs text-muted/60 text-center py-4 italic">
          Belum ada mata kuliah aktif.
        </p>
      ) : (
        <div className="space-y-3 pt-1">
          {courses.map((course) => {
            const widthPercent = Math.round((course.activeTasksCount / maxTasks) * 100);

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group block space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-semibold text-foreground group-hover:text-butter-300 transition-colors truncate">
                      {course.code ? `[${course.code}] ` : ""}
                      {course.name}
                    </span>
                    <span className="text-[10px] text-muted font-mono shrink-0">
                      ({course.credits} SKS)
                    </span>
                  </div>

                  <span className="font-mono font-bold text-xs text-muted group-hover:text-foreground shrink-0">
                    {course.activeTasksCount} Tugas
                  </span>
                </div>

                {/* Horizontal Progress Bar */}
                <div className="w-full h-2 rounded-full bg-navy-950 overflow-hidden border border-surface-border/40">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                    style={{
                      width: `${course.activeTasksCount === 0 ? 0 : Math.max(widthPercent, 6)}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
