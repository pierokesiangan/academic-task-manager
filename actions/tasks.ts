"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface QuickTaskInput {
  title: string;
  courseId: string;
  deadline: string; // ISO string atau YYYY-MM-DDTHH:mm
  priority?: string;
  isImportant?: boolean;
  meetingId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  instructions?: string | null;
  status?: string;
  priority?: string;
  isImportant?: boolean;
  deadline?: string;
  courseId?: string;
  meetingId?: string | null;
}

export async function getTasksAction(filters?: {
  courseId?: string;
  status?: string;
  search?: string;
}) {
  try {
    const where: Record<string, unknown> = {};

    if (filters?.courseId && filters.courseId !== "ALL") {
      where.courseId = filters.courseId;
    }

    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }

    if (filters?.search && filters.search.trim()) {
      where.title = {
        contains: filters.search.trim(),
      };
    }

    const tasks = await prisma.task.findMany({
      where,
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
    });

    return { success: true, data: tasks };
  } catch (error) {
    console.error("Gagal mengambil daftar tugas:", error);
    return { success: false, error: "Gagal memuat tugas" };
  }
}

export async function quickCreateTaskAction(input: QuickTaskInput) {
  if (!input.title.trim()) {
    return { success: false, error: "Judul tugas wajib diisi!" };
  }
  if (!input.courseId) {
    return { success: false, error: "Pilih mata kuliah terlebih dahulu!" };
  }

  try {
    // Pastikan deadline memiliki jam (default 23:59 jika hanya tanggal)
    let deadlineDate = new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      deadlineDate = new Date();
      deadlineDate.setHours(23, 59, 0, 0);
    }

    const task = await prisma.task.create({
      data: {
        title: input.title.trim(),
        courseId: input.courseId,
        deadline: deadlineDate,
        priority: input.priority || "MEDIUM",
        isImportant: input.isImportant || false,
        meetingId: input.meetingId || null,
        status: "TODO",
      },
      include: {
        course: true,
        checklists: true,
        links: true,
      },
    });

    revalidatePath("/tasks");
    revalidatePath(`/courses/${input.courseId}`);
    revalidatePath("/");
    return { success: true, data: task };
  } catch (error) {
    console.error("Gagal membuat tugas cepat:", error);
    return { success: false, error: "Gagal menyimpan tugas baru" };
  }
}

export async function updateTaskAction(id: string, input: UpdateTaskInput) {
  try {
    const data: Record<string, unknown> = {};

    if (input.title !== undefined) data.title = input.title.trim();
    if (input.description !== undefined) data.description = input.description?.trim() || null;
    if (input.instructions !== undefined) data.instructions = input.instructions?.trim() || null;
    if (input.status !== undefined) data.status = input.status;
    if (input.priority !== undefined) data.priority = input.priority;
    if (input.isImportant !== undefined) data.isImportant = input.isImportant;
    if (input.deadline !== undefined) data.deadline = new Date(input.deadline);
    if (input.courseId !== undefined) data.courseId = input.courseId;
    if (input.meetingId !== undefined) data.meetingId = input.meetingId || null;

    const task = await prisma.task.update({
      where: { id },
      data,
      include: {
        course: true,
        meeting: true,
        checklists: { orderBy: { order: "asc" } },
        links: true,
      },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    revalidatePath(`/courses/${task.courseId}`);
    return { success: true, data: task };
  } catch (error) {
    console.error("Gagal mengupdate tugas:", error);
    return { success: false, error: "Gagal memperbarui tugas" };
  }
}

export async function toggleTaskStatusAction(id: string, newStatus: string) {
  try {
    const task = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true, courseId: true },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    revalidatePath(`/courses/${task.courseId}`);
    return { success: true, data: task };
  } catch (error) {
    console.error("Gagal mengubah status tugas:", error);
    return { success: false, error: "Gagal memperbarui status" };
  }
}

export async function toggleChecklistAction(checklistId: string, isCompleted: boolean) {
  try {
    const item = await prisma.taskChecklist.update({
      where: { id: checklistId },
      data: { isCompleted },
      include: {
        task: {
          select: {
            id: true,
            courseId: true,
            checklists: true,
          },
        },
      },
    });

    // Cek jika seluruh checklist selesai, tanyakan/ubah status tugas jika perlu
    revalidatePath("/tasks");
    revalidatePath(`/courses/${item.task.courseId}`);
    return { success: true, data: item };
  } catch (error) {
    console.error("Gagal mengubah checklist:", error);
    return { success: false, error: "Gagal memperbarui sub-tugas" };
  }
}

export async function addChecklistAction(taskId: string, title: string) {
  if (!title.trim()) return { success: false, error: "Teks sub-tugas tidak boleh kosong" };

  try {
    const count = await prisma.taskChecklist.count({ where: { taskId } });
    const item = await prisma.taskChecklist.create({
      data: {
        taskId,
        title: title.trim(),
        order: count + 1,
        isCompleted: false,
      },
    });

    revalidatePath("/tasks");
    return { success: true, data: item };
  } catch (error) {
    console.error("Gagal menambah checklist:", error);
    return { success: false, error: "Gagal menambah sub-tugas" };
  }
}

export async function removeChecklistAction(checklistId: string) {
  try {
    await prisma.taskChecklist.delete({ where: { id: checklistId } });
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus checklist:", error);
    return { success: false, error: "Gagal menghapus sub-tugas" };
  }
}

export async function addLinkAction(taskId: string, title: string, url: string) {
  if (!url.trim()) return { success: false, error: "URL tidak boleh kosong" };

  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const link = await prisma.taskLink.create({
      data: {
        taskId,
        title: title.trim() || formattedUrl,
        url: formattedUrl,
      },
    });

    revalidatePath("/tasks");
    return { success: true, data: link };
  } catch (error) {
    console.error("Gagal menambah tautan:", error);
    return { success: false, error: "Gagal menambah tautan link" };
  }
}

export async function removeLinkAction(linkId: string) {
  try {
    await prisma.taskLink.delete({ where: { id: linkId } });
    revalidatePath("/tasks");
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus link:", error);
    return { success: false, error: "Gagal menghapus link" };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const task = await prisma.task.delete({
      where: { id },
      select: { courseId: true },
    });

    revalidatePath("/tasks");
    revalidatePath("/");
    revalidatePath(`/courses/${task.courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus tugas:", error);
    return { success: false, error: "Gagal menghapus tugas" };
  }
}
