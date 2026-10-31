"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, CheckSquare, FileText, Calendar, Sparkles } from "lucide-react";
import { EditMeetingDialog } from "./edit-meeting-dialog";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  deadline: Date;
  isImportant: boolean;
}

interface MeetingItem {
  id: string;
  weekNumber: number;
  title: string | null;
  notes: string | null;
  date: Date | null;
  tasks?: TaskItem[];
}

interface WeekAccordionProps {
  meetings: MeetingItem[];
  courseColor: string;
}

export function WeekAccordion({ meetings, courseColor }: WeekAccordionProps) {
  return (
    <Accordion.Root type="multiple" className="space-y-2.5">
      {meetings.map((m) => {
        const isExam = m.weekNumber === 8 || m.weekNumber === 16;
        const examLabel = m.weekNumber === 8 ? "UTS" : "UAS";
        const hasTasks = m.tasks && m.tasks.length > 0;

        return (
          <Accordion.Item
            key={m.id}
            value={`week-${m.weekNumber}`}
            className="rounded-xl border border-surface-border bg-surface overflow-hidden transition-all duration-150 data-[state=open]:border-cobalt-400/50 shadow-sm"
          >
            <Accordion.Header className="flex">
              <div className="w-full flex items-center justify-between p-3.5 sm:px-4">
                <Accordion.Trigger className="flex-1 flex items-center gap-3 text-left group">
                  {/* Week Badge */}
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold shrink-0 transition-transform group-hover:scale-105 ${
                      isExam
                        ? "bg-butter-300 text-navy-950 shadow-sm"
                        : "bg-surface-hover border border-surface-border text-foreground"
                    }`}
                  >
                    Week {m.weekNumber}
                    {isExam && ` (${examLabel})`}
                  </div>

                  {/* Title Preview */}
                  <div className="flex-1 min-w-0 pr-2">
                    <span
                      className={`text-xs sm:text-sm font-semibold truncate block transition-colors ${
                        m.title
                          ? "text-foreground group-hover:text-butter-300"
                          : "text-muted/60 italic"
                      }`}
                    >
                      {m.title || "Belum ada topik materi"}
                    </span>
                  </div>

                  {/* Task Count Badge if any */}
                  {hasTasks && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cobalt-500/10 text-cobalt-300 border border-cobalt-500/20 text-[11px] font-medium shrink-0">
                      <CheckSquare className="w-3 h-3 text-butter-300" />
                      <span>{m.tasks?.length} Tugas</span>
                    </span>
                  )}

                  <ChevronDown className="w-4 h-4 text-muted group-hover:text-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>

                {/* Edit Topic Button */}
                <div className="ml-2 pl-2 border-l border-surface-border/60 shrink-0">
                  <EditMeetingDialog meeting={m} />
                </div>
              </div>
            </Accordion.Header>

            <Accordion.Content className="px-4 pb-4 pt-1 border-t border-surface-border/40 text-xs data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="space-y-3 pt-2">
                {/* Lecturer Notes */}
                {m.notes ? (
                  <div className="p-3 rounded-xl bg-surface-hover/60 border border-surface-border/60 space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-[11px] text-cobalt-400">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Catatan Kuliah:</span>
                    </div>
                    <p className="text-foreground whitespace-pre-line text-xs pl-5">
                      {m.notes}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted/70 italic">
                    Belum ada catatan materi dari dosen untuk minggu ini.
                  </p>
                )}

                {/* Tasks associated with this week */}
                {hasTasks && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-muted flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-butter-300" />
                      <span>Tugas Minggu Ini:</span>
                    </div>

                    <div className="space-y-1.5">
                      {m.tasks?.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-surface-hover/80 border border-surface-border text-xs"
                        >
                          <span className="font-medium text-foreground truncate pr-2">
                            {t.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 ${
                              t.status === "DONE"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : t.status === "IN_PROGRESS"
                                ? "bg-cobalt-500/10 text-cobalt-300 border border-cobalt-500/30"
                                : "bg-surface text-muted border border-surface-border"
                            }`}
                          >
                            {t.status === "DONE"
                              ? "Selesai"
                              : t.status === "IN_PROGRESS"
                              ? "In Progress"
                              : "To Do"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>
        );
      })}
    </Accordion.Root>
  );
}
