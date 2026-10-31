"use client";

import { useState, useEffect, useTransition } from "react";
import { getTasksAction } from "@/actions/tasks";
import { getCoursesAction } from "@/actions/courses";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { QuickTaskDialog } from "@/components/tasks/quick-task-dialog";
import { TaskDrawer, TaskDetailData } from "@/components/tasks/task-drawer";
import {
  CheckSquare,
  LayoutList,
  Columns,
  Search,
  Filter,
  Sparkles,
  Loader2,
  Calendar,
} from "lucide-react";

export default function TasksPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [tasks, setTasks] = useState<TaskDetailData[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string; code: string | null; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Drawer state
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [tasksRes, coursesRes] = await Promise.all([
        getTasksAction(),
        getCoursesAction(),
      ]);

      if (tasksRes.success && tasksRes.data) {
        setTasks(tasksRes.data as unknown as TaskDetailData[]);
      }
      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter tasks in memory for 0ms instantaneous UI responsiveness
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      !search.trim() ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.course.name.toLowerCase().includes(search.toLowerCase());

    const matchesCourse =
      selectedCourse === "ALL" || t.courseId === selectedCourse;

    const isOverdue =
      t.status !== "DONE" && new Date(t.deadline) < new Date();

    const matchesStatus =
      selectedStatus === "ALL"
        ? true
        : selectedStatus === "OVERDUE"
        ? isOverdue
        : t.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const handleSelectTask = (task: TaskDetailData) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cobalt-400">
            <CheckSquare className="w-4 h-4 text-butter-300" />
            <span>TASK MANAGEMENT HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Daftar Tugas & Deadline
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Kelola, cicil checklist, dan pantau tenggat waktu seluruh tugas kuliahmu.
          </p>
        </div>

        {/* Quick Add Button */}
        <div className="flex items-center gap-2.5">
          <QuickTaskDialog courses={courses} onSuccess={loadData} />
        </div>
      </div>

      {/* Control Bar: Search + Course Filter + Status Filter + View Switcher */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tugas atau mata kuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3.5 rounded-xl bg-surface border border-surface-border text-xs text-foreground placeholder:text-muted/50 focus:outline-none focus:border-cobalt-400 transition-colors shadow-sm"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {/* Course filter */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none shadow-sm shrink-0"
          >
            <option value="ALL">Semua Matkul</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code ? `[${c.code}] ` : ""}
                {c.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-surface border border-surface-border text-xs text-foreground focus:outline-none shadow-sm shrink-0"
          >
            <option value="ALL">Semua Status</option>
            <option value="TODO">Belum Dikerjakan</option>
            <option value="IN_PROGRESS">Sedang Dikerjakan</option>
            <option value="DONE">Selesai</option>
            <option value="OVERDUE">Terlambat (Overdue)</option>
          </select>

          {/* View Switcher: List vs Kanban */}
          <div className="flex items-center p-1 rounded-xl bg-surface border border-surface-border shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => setView("list")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                view === "list"
                  ? "bg-butter-300 text-navy-950 shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              title="Tampilan List"
            >
              <LayoutList className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              type="button"
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                view === "kanban"
                  ? "bg-butter-300 text-navy-950 shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
              title="Tampilan Kanban Board"
            >
              <Columns className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Task View Content */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-surface/50 border border-surface-border flex items-center justify-center text-muted gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-cobalt-400" />
          <span>Memuat tugas dari Supabase...</span>
        </div>
      ) : view === "list" ? (
        <TaskListView
          tasks={filteredTasks}
          onSelectTask={handleSelectTask}
          onRefresh={loadData}
        />
      ) : (
        <TaskKanbanView
          tasks={filteredTasks}
          selectedStatus={selectedStatus}
          onSelectTask={handleSelectTask}
          onRefresh={loadData}
        />
      )}

      {/* Slide-over Task Detail Drawer */}
      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTaskUpdated={loadData}
      />
    </main>
  );
}