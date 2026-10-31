"use client";

import { useState, useEffect, useTransition } from "react";
import { getCalendarEventsAction } from "@/actions/calendar";
import { CalendarMonthView } from "@/components/calendar/calendar-month-view";
import { ICalSubscriptionDialog } from "@/components/calendar/ical-subscription-dialog";
import { TaskDrawer, TaskDetailData } from "@/components/tasks/task-drawer";
import { Calendar, Loader2 } from "lucide-react";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskDetailData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Drawer
  const [selectedTask, setSelectedTask] = useState<TaskDetailData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const loadEvents = () => {
    const now = new Date();
    startTransition(async () => {
      const res = await getCalendarEventsAction(
        now.getFullYear(),
        now.getMonth() + 1
      );
      if (res.success && res.data) {
        setTasks(res.data.tasks as unknown as TaskDetailData[]);
        setCourses(res.data.courses);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSelectTask = (task: TaskDetailData) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-cobalt-400">
            <Calendar className="w-4 h-4 text-butter-300" />
            <span>KALENDER AKADEMIK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Kalender Tugas & Perkuliahan
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            Pantau sebaran deadline bulanan dan sambungkan langsung ke Google Calendar di smartphone.
          </p>
        </div>

        {/* Sync Button */}
        <div className="flex items-center gap-2.5">
          <ICalSubscriptionDialog />
        </div>
      </div>

      {/* Main Calendar View */}
      {loading ? (
        <div className="h-96 rounded-2xl bg-surface/50 border border-surface-border flex items-center justify-center text-muted gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-cobalt-400" />
          <span>Memuat kalender dari database...</span>
        </div>
      ) : (
        <CalendarMonthView
          tasks={tasks}
          courses={courses}
          onSelectTask={handleSelectTask}
        />
      )}

      {/* Slide-over Task Detail Drawer */}
      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onTaskUpdated={loadEvents}
      />
    </main>
  );
}
