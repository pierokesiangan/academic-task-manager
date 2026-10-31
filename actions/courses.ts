"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CourseFormData {
  name: string;
  code?: string;
  credits: number;
  color: string;
  lecturer?: string;
  scheduleDay?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
}

export async function getCoursesAction(includeArchived = false) {
  try {
    const courses = await prisma.course.findMany({
      where: includeArchived ? {} : { isArchived: false },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            meetings: true,
            tasks: true,
          },
        },
        tasks: {
          where: { status: { not: "DONE" } },
          select: {
            id: true,
            status: true,
            deadline: true,
            isImportant: true,
          },
        },
      },
    });

    const now = new Date();

    return {
      success: true,
      data: courses.map((course) => {
        const activeTasks = course.tasks.length;
        const overdueTasks = course.tasks.filter(
          (t) => new Date(t.deadline) < now
        ).length;

        return {
          ...course,
          activeTasksCount: activeTasks,
          overdueTasksCount: overdueTasks,
        };
      }),
    };
  } catch (error) {
    console.error("Gagal mengambil data mata kuliah:", error);
    return { success: false, error: "Gagal memuat mata kuliah" };
  }
}

export async function getCourseDetailAction(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        meetings: {
          orderBy: { weekNumber: "asc" },
          include: {
            tasks: {
              include: {
                checklists: { orderBy: { order: "asc" } },
                links: true,
              },
            },
          },
        },
        tasks: {
          orderBy: { deadline: "asc" },
          include: {
            checklists: { orderBy: { order: "asc" } },
            links: true,
            meeting: { select: { weekNumber: true, title: true } },
          },
        },
      },
    });

    if (!course) {
      return { success: false, error: "Mata kuliah tidak ditemukan" };
    }

    return { success: true, data: course };
  } catch (error) {
    console.error("Gagal mengambil detail mata kuliah:", error);
    return { success: false, error: "Gagal memuat detail mata kuliah" };
  }
}

export async function createCourseAction(data: CourseFormData) {
  if (!data.name.trim()) {
    return { success: false, error: "Nama mata kuliah wajib diisi" };
  }

  try {
    const course = await prisma.course.create({
      data: {
        name: data.name.trim(),
        code: data.code?.trim() || null,
        credits: Number(data.credits) || 3,
        color: data.color || "#7DA7D9",
        lecturer: data.lecturer?.trim() || null,
        scheduleDay: data.scheduleDay?.trim() || null,
        startTime: data.startTime?.trim() || null,
        endTime: data.endTime?.trim() || null,
        room: data.room?.trim() || null,
      },
    });

    // Otomatis buat 16 pertemuan (Week 1 s.d. Week 16)
    const meetingsData = Array.from({ length: 16 }, (_, i) => ({
      courseId: course.id,
      weekNumber: i + 1,
      title: i === 7 ? "Ujian Tengah Semester (UTS)" : i === 15 ? "Ujian Akhir Semester (UAS)" : null,
    }));

    await prisma.courseMeeting.createMany({
      data: meetingsData,
    });

    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true, data: course };
  } catch (error) {
    console.error("Gagal membuat mata kuliah:", error);
    return { success: false, error: "Terjadi kesalahan saat menyimpan mata kuliah" };
  }
}

export async function updateCourseAction(id: string, data: Partial<CourseFormData>) {
  try {
    const course = await prisma.course.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        code: data.code?.trim(),
        credits: data.credits ? Number(data.credits) : undefined,
        color: data.color,
        lecturer: data.lecturer?.trim(),
        scheduleDay: data.scheduleDay?.trim(),
        startTime: data.startTime?.trim(),
        endTime: data.endTime?.trim(),
        room: data.room?.trim(),
      },
    });

    revalidatePath("/courses");
    revalidatePath(`/courses/${id}`);
    revalidatePath("/");
    return { success: true, data: course };
  } catch (error) {
    console.error("Gagal memperbarui mata kuliah:", error);
    return { success: false, error: "Gagal memperbarui data mata kuliah" };
  }
}

export async function updateMeetingTopicAction(
  meetingId: string,
  title: string,
  notes: string | null
) {
  try {
    const meeting = await prisma.courseMeeting.update({
      where: { id: meetingId },
      data: {
        title: title.trim() || null,
        notes: notes?.trim() || null,
      },
      include: {
        course: { select: { id: true } },
      },
    });

    revalidatePath(`/courses/${meeting.course.id}`);
    return { success: true, data: meeting };
  } catch (error) {
    console.error("Gagal memperbarui topik pertemuan:", error);
    return { success: false, error: "Gagal menyimpan topik pertemuan" };
  }
}

export async function archiveCourseAction(id: string, isArchived: boolean) {
  try {
    await prisma.course.update({
      where: { id },
      data: { isArchived },
    });

    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal mengubah status arsip:", error);
    return { success: false, error: "Gagal mengarsipkan mata kuliah" };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    await prisma.course.delete({
      where: { id },
    });

    revalidatePath("/courses");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus mata kuliah:", error);
    return { success: false, error: "Gagal menghapus mata kuliah" };
  }
}
