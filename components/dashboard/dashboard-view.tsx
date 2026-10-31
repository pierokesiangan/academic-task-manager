"use client";

import { useState } from "react";
import { MetricCards } from "./metric-cards";
import { FocusToday } from "./focus-today";
import { WorkloadChart } from "./workload-chart";
import { WeeklySchedule } from "./weekly-schedule";
import { QuickTaskDialog } from "@/components/tasks/quick-task-dialog";
import { TaskDrawer, TaskDetailData } from "@/components/tasks/task-drawer";
import { Sparkles, BookOpen, CheckSquare, Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface DashboardData {
  metrics: {
    totalTasks: number;
    activeCount: number;
    completedCount: number;
    overdueCount: number;
    dueTodayCount: number;
    completionRate: number;
  };
  focusTasks: TaskDetailData[];
  courseWorkload: {
    id: string;
    name: string;
    code: string | null;
    color: string;
    credits: number;
    activeTasksCount: number;
  }[];
  courses: {
    id: string;
    name: string;
    code: string | null;
    color: string;
    credits: number;
    lecturer: string | null;
    scheduleDay: string | null;
    startTime: string | null;
    endTime: string | null;
    room: string | null;
  }[];
}

interface DashboardViewProps {
  initialData: DashboardData;
}

export function DashboardView({ initialData }: DashboardViewProps) {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectTask = (task: TaskDetailData) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    router.refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border/60">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface border border-surface-border text-xs font-semibold text-cobalt-400 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-butter-300" />
            <span>EXECUTIVE ACADEMIC DASHBOARD • SEMESTER 3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Halo Allan, Siap Fokus Hari Ini?
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Berikut ringkasan prioritas tugas terdekat, beban perkuliahan, dan jadwal kuliah mingguanmu.
          </p>
        </div>

        {/* Quick Add Action */}
        <div className="flex items-center gap-2.5">
          <QuickTaskDialog
            courses={initialData.courses}
            onSuccess={handleRefresh}
          />
        </div>
      </div>

      {/* 1. Metric Overview Cards */}
      <MetricCards metrics={initialData.metrics} />

      {/* 2. Main Dashboard Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Focus Today & Weekly Schedule (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section Fokus Hari Ini */}
          <FocusToday
            tasks={initialData.focusTasks}
            onSelectTask={handleSelectTask}
            onRefresh={handleRefresh}
          />

          {/* Section Jadwal Kuliah Mingguan */}
          <WeeklySchedule courses={initialData.courses} />
        </div>

        {/* Right Column: Workload Chart & Quick Nav (1 col) */}
        <div className="space-y-6">
          {/* Beban Tugas per Matkul */}
          <WorkloadChart courses={initialData.courseWorkload} />

          {/* Quick Academic Navigation Card */}
          <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-3 shadow-sm">
            <div className="text-xs font-bold text-foreground">Akses Cepat Akademik</div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/courses"
                className="p-3 rounded-xl bg-surface-hover/60 hover:bg-surface-hover border border-surface-border flex flex-col items-center text-center gap-1.5 transition-colors group"
              >
                <BookOpen className="w-5 h-5 text-cobalt-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Silabus 16W</span>
                <span className="text-[10px] text-muted">Semua matkul</span>
              </Link>

              <Link
                href="/tasks"
                className="p-3 rounded-xl bg-surface-hover/60 hover:bg-surface-hover border border-surface-border flex flex-col items-center text-center gap-1.5 transition-colors group"
              >
                <CheckSquare className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-foreground">Kanban Board</span>
                <span className="text-[10px] text-muted">Atur status</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Task Detail Drawer */}
      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTaskUpdated={handleRefresh}
      />
    </div>
  );
}
