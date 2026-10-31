import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

interface CourseSchedule {
  id: string;
  name: string;
  code: string | null;
  color: string;
  scheduleDay: string | null;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  lecturer: string | null;
}

interface WeeklyScheduleProps {
  courses: CourseSchedule[];
}

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export function WeeklySchedule({ courses }: WeeklyScheduleProps) {
  // Tentukan hari saat ini dalam bahasa Indonesia
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayNamesMap: Record<number, string> = {
    1: "Senin",
    2: "Selasa",
    3: "Rabu",
    4: "Kamis",
    5: "Jumat",
    6: "Sabtu",
    0: "Minggu",
  };
  const currentDayName = dayNamesMap[todayIndex];

  return (
    <div className="rounded-2xl bg-surface border border-surface-border p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-surface-border/60">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-butter-300" />
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Jadwal Kuliah Mingguan
            </h3>
            <p className="text-[11px] text-muted">
              Jadwal tatap muka kuliah Semester 3 (Senin - Jumat)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {DAYS.map((day) => {
          const isToday = day === currentDayName;
          const dayCourses = courses.filter((c) => c.scheduleDay === day);

          return (
            <div
              key={day}
              className={`p-3 rounded-xl border flex flex-col justify-between min-h-[140px] transition-all ${
                isToday
                  ? "bg-butter-300/5 border-butter-300/50 shadow-[0_0_12px_rgba(254,240,138,0.1)]"
                  : "bg-surface-hover/30 border-surface-border"
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 border-b border-surface-border/50">
                <span
                  className={`text-xs font-bold ${
                    isToday ? "text-butter-300" : "text-foreground"
                  }`}
                >
                  {day}
                </span>
                {isToday && (
                  <span className="px-1.5 py-0.5 rounded bg-butter-300 text-navy-950 font-bold text-[9px] uppercase tracking-wider">
                    Hari Ini
                  </span>
                )}
              </div>

              {/* Day Courses list */}
              <div className="space-y-2 pt-2 flex-1">
                {dayCourses.length === 0 ? (
                  <p className="text-[10px] text-muted/60 italic text-center pt-4">
                    Libur / Mandiri
                  </p>
                ) : (
                  dayCourses.map((c) => (
                    <Link
                      key={c.id}
                      href={`/courses/${c.id}`}
                      className="group block p-2 rounded-lg bg-surface border border-surface-border/80 hover:border-cobalt-400/50 transition-colors space-y-1"
                    >
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-[11px] font-bold text-foreground group-hover:text-butter-300 transition-colors truncate">
                          {c.code || c.name}
                        </span>
                      </div>

                      <div className="text-[10px] text-muted font-mono flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-butter-300 shrink-0" />
                        <span>
                          {c.startTime} - {c.endTime}
                        </span>
                      </div>

                      {c.room && (
                        <div className="text-[10px] text-muted/80 flex items-center gap-1 truncate">
                          <MapPin className="w-2.5 h-2.5 text-ice-200 shrink-0" />
                          <span className="truncate">{c.room}</span>
                        </div>
                      )}
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
