import { getCoursesAction } from "@/actions/courses";
import { CourseCard } from "@/components/courses/course-card";
import { CourseDialog } from "@/components/courses/course-dialog";
import { BookOpen, Sparkles, Layers, CheckSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const result = await getCoursesAction();
  const courses = result.success && result.data ? result.data : [];

  const totalSKS = courses.reduce((acc, c) => acc + c.credits, 0);
  const totalActiveTasks = courses.reduce((acc, c) => acc + (c.activeTasksCount || 0), 0);
  const totalOverdueTasks = courses.reduce((acc, c) => acc + (c.overdueTasksCount || 0), 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cobalt-400">
            <BookOpen className="w-4 h-4 text-butter-300" />
            <span>AKADEMIK SEMESTER 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Daftar Mata Kuliah
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola seluruh mata kuliah aktif, jadwal kelas, silabus 16 pertemuan, dan beban tugas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <CourseDialog />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Total Matkul</span>
            <Layers className="w-4 h-4 text-cobalt-400" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{courses.length}</div>
          <div className="text-[11px] text-muted">Mata kuliah aktif</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Beban SKS</span>
            <BookOpen className="w-4 h-4 text-butter-300" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalSKS} SKS</div>
          <div className="text-[11px] text-muted">Semester 3</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Tugas Berjalan</span>
            <CheckSquare className="w-4 h-4 text-cobalt-300" />
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">{totalActiveTasks}</div>
          <div className="text-[11px] text-muted">Perlu diselesaikan</div>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border">
          <div className="flex items-center justify-between text-muted text-xs">
            <span>Overdue</span>
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          </div>
          <div className={`text-2xl font-bold mt-1 ${totalOverdueTasks > 0 ? "text-rose-400" : "text-foreground"}`}>
            {totalOverdueTasks}
          </div>
          <div className="text-[11px] text-muted">Tugas terlewat</div>
        </div>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface border border-surface-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-950 flex items-center justify-center mx-auto text-cobalt-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">Belum ada mata kuliah</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Tambahkan mata kuliah pertamamu untuk mulai merencanakan silabus 16 pertemuan dan tugas.
            </p>
          </div>
          <CourseDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </main>
  );
}
