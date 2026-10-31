"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Clock, AlertCircle, Check, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getTasksAction } from "@/actions/tasks";

interface UrgentTask {
  id: string;
  title: string;
  deadline: string;
  course: {
    name: string;
    code: string | null;
    color: string;
  };
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const loadUrgentTasks = async () => {
    const res = await getTasksAction({ status: "TODO" });
    if (res.success && res.data) {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const urgent = (res.data as any[])
        .filter((t) => {
          const d = new Date(t.deadline);
          return d <= in24Hours; // Overdue atau jatuh tempo dalam 24 jam
        })
        .map((t) => ({
          id: t.id,
          title: t.title,
          deadline: t.deadline,
          course: t.course,
        }));

      setUrgentTasks(urgent);

      // Jika izin notifikasi browser aktif, picu notifikasi sistem jika ada tugas mendesak
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        urgent.length > 0
      ) {
        // Cek apakah sudah pernah dinotifikasikan di sesi ini
        const notifiedKey = `notified_task_${urgent[0].id}_${new Date().toDateString()}`;
        if (!sessionStorage.getItem(notifiedKey)) {
          new Notification("Pengingat Deadline Kuliah — Ice & Butter", {
            body: `Tugas "${urgent[0].title}" (${urgent[0].course.name}) mendekati batas pengumpulan!`,
            icon: "/icons/icon-192.png",
          });
          sessionStorage.setItem(notifiedKey, "true");
        }
      }
    }
  };

  useEffect(() => {
    loadUrgentTasks();
    const interval = setInterval(loadUrgentTasks, 60000); // Cek setiap 1 menit
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm === "granted") {
        new Notification("Notifikasi Aktif!", {
          body: "Kamu akan menerima pengingat H-1 dan H-3 jam sebelum deadline tugas.",
          icon: "/icons/icon-192.png",
        });
      }
    }
  };

  const count = urgentTasks.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-lg bg-surface hover:bg-surface-hover border border-surface-border flex items-center justify-center text-muted hover:text-foreground transition-all relative"
        title="Pemberitahuan Tugas"
        aria-label="Notifikasi"
      >
        <Bell className="w-4 h-4 text-cobalt-400" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-butter-300 text-navy-950 font-bold text-[9px] flex items-center justify-center animate-pulse shadow-sm">
            {count}
          </span>
        )}
      </button>

      {/* Notification Dropdown Popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-surface border border-surface-border p-4 shadow-2xl z-50 animate-fade-in space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border/60">
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <Bell className="w-3.5 h-3.5 text-butter-300" />
              <span>Pengingat Tugas ({count})</span>
            </div>

            {permission !== "granted" && (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="text-[10px] font-semibold text-cobalt-300 hover:text-butter-300 hover:underline"
              >
                Aktifkan Notifikasi Pop-up
              </button>
            )}
          </div>

          {/* List of Urgent Tasks */}
          {count === 0 ? (
            <div className="py-6 text-center text-xs text-muted space-y-1">
              <Sparkles className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="font-semibold text-foreground">Semua Aman!</p>
              <p className="text-[11px] text-muted/70">
                Tidak ada tugas mendesak dalam 24 jam ke depan.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {urgentTasks.map((t) => {
                const isOverdue = new Date(t.deadline) < new Date();

                return (
                  <Link
                    key={t.id}
                    href="/tasks"
                    onClick={() => setOpen(false)}
                    className="block p-2.5 rounded-xl bg-surface-hover/60 hover:bg-surface-hover border border-surface-border transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span
                        className="font-semibold truncate max-w-[150px]"
                        style={{ color: t.course.color }}
                      >
                        {t.course.code || t.course.name}
                      </span>

                      <span
                        className={`font-mono font-bold ${
                          isOverdue ? "text-rose-400" : "text-butter-300"
                        }`}
                      >
                        {isOverdue ? "Overdue" : "Mendekati Deadline"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-foreground truncate">
                      {t.title}
                    </p>

                    <div className="flex items-center gap-1 text-[10px] text-muted font-mono">
                      <Clock className="w-3 h-3 text-butter-300" />
                      <span>
                        {new Date(t.deadline).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-surface-border/60 text-center">
            <Link
              href="/tasks"
              onClick={() => setOpen(false)}
              className="text-[11px] font-semibold text-cobalt-400 hover:text-butter-300 transition-colors"
            >
              Buka Semua Tugas di Task Hub →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
