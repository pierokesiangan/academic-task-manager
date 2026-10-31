import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseDetailAction } from "@/actions/courses";
import { WeekAccordion } from "@/components/courses/week-accordion";
import { CourseDialog } from "@/components/courses/course-dialog";
import {
  ArrowLeft,
  Clock,
  MapPin,
  User,
  BookOpen,
  Calendar,
  CheckSquare,
  Sparkles,
  Edit2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { id } = await params;
  const res = await getCourseDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const course = res.data;
  const activeTasks = course.tasks.filter((t) => t.status !== "DONE");
  const completedTasks = course.tasks.filter((t) => t.status === "DONE");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back button */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        <span>Kembali ke Daftar Matkul</span>
      </Link>

      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-surface border border-surface-border p-6 overflow-hidden shadow-lg">
        {/* Accent Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: course.color }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pt-2">
          {/* Title & Metadata */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              {course.code && (
                <span className="px-2.5 py-0.5 rounded-lg bg-navy-950/70 border border-surface-border font-mono text-xs font-semibold text-cobalt-300">
                  {course.code}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-lg bg-surface-hover border border-surface-border text-xs font-medium text-muted">
                {course.credits} SKS
              </span>
              <span
                className="w-3 h-3 rounded-full border border-white/20"
                style={{ backgroundColor: course.color }}
                title="Warna Tag Matkul"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {course.name}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs text-muted">
              {course.lecturer ? (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cobalt-400 shrink-0" />
                  <span className="truncate">{course.lecturer}</span>
                </div>
              ) : null}

              {course.scheduleDay && course.startTime ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-butter-300 shrink-0" />
                  <span>
                    {course.scheduleDay}, {course.startTime} - {course.endTime || "Selesai"}
                  </span>
                </div>
              ) : null}

              {course.room ? (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-ice-200 shrink-0" />
                  <span>{course.room}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2 shrink-0">
            <CourseDialog
              initialData={{
                id: course.id,
                name: course.name,
                code: course.code,
                credits: course.credits,
                color: course.color,
                lecturer: course.lecturer,
                scheduleDay: course.scheduleDay,
                startTime: course.startTime,
                endTime: course.endTime,
                room: course.room,
              }}
              trigger={
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl bg-surface hover:bg-surface-hover text-foreground border border-surface-border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cobalt-400" />
                  <span>Edit Info Matkul</span>
                </button>
              }
            />
          </div>
        </div>
      </div>

      {/* Main Content: 16-Week Syllabus & Task Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 16-Week Syllabus Accordion (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-butter-300" />
              <h2 className="text-base font-bold text-foreground">
                Silabus 16 Pertemuan Kuliah
              </h2>
            </div>
            <span className="text-xs text-muted">
              UTS: Week 8 • UAS: Week 16
            </span>
          </div>

          <WeekAccordion
            meetings={course.meetings}
            courseColor={course.color}
          />
        </div>

        {/* Right Column: Tasks for this course (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cobalt-400" />
              <h2 className="text-base font-bold text-foreground">
                Tugas Mata Kuliah ({course.tasks.length})
              </h2>
            </div>
          </div>

          {course.tasks.length === 0 ? (
            <div className="p-6 rounded-xl bg-surface border border-surface-border text-center space-y-2 text-xs text-muted">
              <p>Belum ada tugas untuk mata kuliah ini.</p>
              <p className="text-[11px] text-muted/60">
                Tugas dapat dibuat melalui menu Tugas atau tombol Quick Add.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {course.tasks.map((task) => {
                const isOverdue =
                  task.status !== "DONE" && new Date(task.deadline) < new Date();
                const totalChecklists = task.checklists.length;
                const completedChecklists = task.checklists.filter(
                  (c) => c.isCompleted
                ).length;
                const progress =
                  totalChecklists > 0
                    ? Math.round((completedChecklists / totalChecklists) * 100)
                    : 0;

                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-surface border border-surface-border space-y-2 hover:border-cobalt-400/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground line-clamp-2">
                        {task.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                          task.status === "DONE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : isOverdue
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse"
                            : "bg-surface-hover text-cobalt-300 border border-surface-border"
                        }`}
                      >
                        {task.status === "DONE"
                          ? "Selesai"
                          : isOverdue
                          ? "Overdue"
                          : "In Progress"}
                      </span>
                    </div>

                    {/* Deadline & Meeting info */}
                    <div className="flex items-center justify-between text-[11px] text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-butter-300" />
                        <span>
                          {new Date(task.deadline).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {task.meeting && (
                        <span className="font-mono text-cobalt-400">
                          Week {task.meeting.weekNumber}
                        </span>
                      )}
                    </div>

                    {/* Checklist progress bar if any */}
                    {totalChecklists > 0 && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[10px] text-muted">
                          <span>Progress Sub-Tugas</span>
                          <span className="font-mono font-semibold text-foreground">
                            {completedChecklists}/{totalChecklists} ({progress}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-navy-950 overflow-hidden">
                          <div
                            className="h-full bg-butter-300 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
