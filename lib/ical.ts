import ical, { ICalAlarmType, ICalEventRepeatingFreq } from "ical-generator";
import { prisma } from "@/lib/prisma";

export async function generateCalendarFeed(token: string): Promise<string | null> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "singleton" },
  });

  if (!config || config.calendarToken !== token) {
    return null;
  }

  const [tasks, courses] = await Promise.all([
    prisma.task.findMany({
      where: { status: { not: "DONE" } },
      include: {
        course: true,
        meeting: true,
      },
      orderBy: { deadline: "asc" },
    }),
    prisma.course.findMany({
      where: { isArchived: false },
    }),
  ]);

  const calendar = ical({
    name: "Akademik Allan — Ice & Butter",
    description: "Kalender tugas perkuliahan dan deadline akademik Semester 3",
    timezone: "Asia/Jakarta",
  });

  // 1. Masukkan setiap tugas sebagai event dengan alarm pengingat
  for (const task of tasks) {
    const deadlineDate = new Date(task.deadline);
    const startDate = new Date(deadlineDate.getTime() - 60 * 60 * 1000); // 1 jam sebelum deadline

    const event = calendar.createEvent({
      id: `task-${task.id}`,
      start: startDate,
      end: deadlineDate,
      summary: `[DEADLINE] ${task.course.code ? `[${task.course.code}] ` : ""}${task.title}`,
      description: `${task.description || "Tugas akademik"}\n\nMata Kuliah: ${task.course.name}\nPrioritas: ${task.priority}${task.meeting ? `\nPertemuan: Week ${task.meeting.weekNumber}` : ""}`,
      location: task.course.room || "Portal Kuliah / LMS",
      url: `https://academic-allan.vercel.app/tasks`,
    });

    // Pasang Alarm Otomatis: H-1 (24 jam) & H-3 jam sebelum deadline
    event.createAlarm({
      type: ICalAlarmType.display,
      trigger: 86400, // 24 jam sebelum deadline
    });

    event.createAlarm({
      type: ICalAlarmType.display,
      trigger: 10800, // 3 jam sebelum deadline
    });
  }

  // 2. Masukkan jadwal kuliah mingguan sebagai event berulang (jika jadwal tersedia)
  const dayIndexMap: Record<string, number> = {
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
  };

  const now = new Date();

  for (const course of courses) {
    if (!course.scheduleDay || !course.startTime || !dayIndexMap[course.scheduleDay]) {
      continue;
    }

    const targetDay = dayIndexMap[course.scheduleDay];
    const currentDay = now.getDay();
    const distance = (targetDay - currentDay + 7) % 7;

    const [startH, startM] = course.startTime.split(":").map(Number);
    const [endH, endM] = (course.endTime || "10:30").split(":").map(Number);

    const firstLectureStart = new Date(now);
    firstLectureStart.setDate(now.getDate() + distance);
    firstLectureStart.setHours(startH || 8, startM || 0, 0, 0);

    const firstLectureEnd = new Date(firstLectureStart);
    firstLectureEnd.setHours(endH || 10, endM || 30, 0, 0);

    calendar.createEvent({
      id: `course-${course.id}`,
      start: firstLectureStart,
      end: firstLectureEnd,
      summary: `[KULIAH] ${course.code ? `[${course.code}] ` : ""}${course.name}`,
      description: `Mata Kuliah: ${course.name} (${course.credits} SKS)\nDosen: ${course.lecturer || "-"}\nRuang: ${course.room || "-"}`,
      location: course.room || "Kampus",
      repeating: {
        freq: ICalEventRepeatingFreq.WEEKLY,
        count: 16, // 16 minggu perkuliahan
      },
    });
  }

  return calendar.toString();
}
