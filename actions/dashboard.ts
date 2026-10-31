"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardDataAction() {
  try {
    const now = new Date();

    // Batas waktu hari ini (mulai 00:00 s.d. 23:59:59)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Batas waktu besok (end of tomorrow)
    const endOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59, 999);

    const [courses, tasks] = await Promise.all([
      prisma.course.findMany({
        where: { isArchived: false },
        orderBy: { name: "asc" },
        include: {
          tasks: {
            where: { status: { not: "DONE" } },
            select: { id: true, deadline: true },
          },
        },
      }),
      prisma.task.findMany({
        orderBy: [
          { isImportant: "desc" },
          { deadline: "asc" },
        ],
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              color: true,
            },
          },
          meeting: {
            select: {
              id: true,
              weekNumber: true,
              title: true,
            },
          },
          checklists: {
            orderBy: { order: "asc" },
          },
          links: true,
        },
      }),
    ]);

    // Kalkulasi Metrik
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "DONE").length;
    const activeTasks = tasks.filter((t) => t.status !== "DONE");

    const overdueTasks = activeTasks.filter(
      (t) => new Date(t.deadline) < now
    );

    const dueTodayTasks = activeTasks.filter((t) => {
      const d = new Date(t.deadline);
      return d >= startOfToday && d <= endOfToday;
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Tugas "Fokus Hari Ini" (Due hari ini, overdue, atau due besok)
    const focusTasks = activeTasks.filter((t) => {
      const d = new Date(t.deadline);
      return d <= endOfTomorrow;
    }).slice(0, 6);

    // Beban Kerja per Matkul (Workload ranking)
    const courseWorkload = courses
      .map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        color: c.color,
        credits: c.credits,
        activeTasksCount: c.tasks.length,
      }))
      .sort((a, b) => b.activeTasksCount - a.activeTasksCount);

    return {
      success: true,
      data: {
        metrics: {
          totalTasks,
          activeCount: activeTasks.length,
          completedCount: completedTasks,
          overdueCount: overdueTasks.length,
          dueTodayCount: dueTodayTasks.length,
          completionRate,
        },
        focusTasks,
        courseWorkload,
        courses,
        allTasks: tasks,
      },
    };
  } catch (error) {
    console.error("Gagal mengambil data dashboard:", error);
    return { success: false, error: "Gagal memuat data dashboard" };
  }
}
