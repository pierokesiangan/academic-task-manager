"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function getCalendarFeedTokenAction() {
  try {
    let config = await prisma.appConfig.findUnique({
      where: { id: "singleton" },
    });

    if (!config) {
      config = await prisma.appConfig.create({
        data: {
          id: "singleton",
          calendarToken: crypto.randomUUID(),
          themePreference: "dark",
        },
      });
    }

    return { success: true, token: config.calendarToken };
  } catch (error) {
    console.error("Gagal mengambil token kalender:", error);
    return { success: false, error: "Gagal memuat token kalender" };
  }
}

export async function regenerateCalendarTokenAction() {
  try {
    const newToken = crypto.randomUUID();
    await prisma.appConfig.update({
      where: { id: "singleton" },
      data: { calendarToken: newToken },
    });

    revalidatePath("/calendar");
    return { success: true, token: newToken };
  } catch (error) {
    console.error("Gagal memperbarui token kalender:", error);
    return { success: false, error: "Gagal memperbarui token kalender" };
  }
}

export async function getCalendarEventsAction(year: number, month: number) {
  try {
    // Awal dan akhir bulan (inklusif buffer beberapa hari sebelum dan sesudah)
    const startDate = new Date(year, month - 1, -7, 0, 0, 0);
    const endDate = new Date(year, month, 14, 23, 59, 59);

    const [tasks, courses] = await Promise.all([
      prisma.task.findMany({
        where: {
          deadline: {
            gte: startDate,
            lte: endDate,
          },
        },
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
          checklists: true,
          links: true,
        },
        orderBy: { deadline: "asc" },
      }),
      prisma.course.findMany({
        where: { isArchived: false },
        select: {
          id: true,
          name: true,
          code: true,
          color: true,
          scheduleDay: true,
          startTime: true,
          endTime: true,
          room: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        tasks,
        courses,
      },
    };
  } catch (error) {
    console.error("Gagal mengambil event kalender:", error);
    return { success: false, error: "Gagal memuat event kalender" };
  }
}
