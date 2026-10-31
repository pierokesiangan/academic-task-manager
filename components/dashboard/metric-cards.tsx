import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  metrics: {
    totalTasks: number;
    activeCount: number;
    completedCount: number;
    overdueCount: number;
    dueTodayCount: number;
    completionRate: number;
  };
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* 1. Tugas Aktif */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-muted text-xs">
          <span className="font-medium">Tugas Aktif</span>
          <div className="w-8 h-8 rounded-xl bg-cobalt-500/10 border border-cobalt-500/20 flex items-center justify-center text-cobalt-400">
            <CheckSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {metrics.activeCount}
          </div>
          <div className="text-[11px] text-muted mt-1">Perlu dikerjakan semester ini</div>
        </div>
      </div>

      {/* 2. Due Hari Ini */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-surface border flex flex-col justify-between shadow-sm transition-all ${
          metrics.dueTodayCount > 0
            ? "border-butter-300/60 shadow-[0_0_15px_rgba(254,240,138,0.15)]"
            : "border-surface-border"
        }`}
      >
        <div className="flex items-center justify-between text-muted text-xs">
          <span className="font-medium">Jatuh Tempo Hari Ini</span>
          <div className="w-8 h-8 rounded-xl bg-butter-300/10 border border-butter-300/30 flex items-center justify-center text-butter-300">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-butter-300">
            {metrics.dueTodayCount}
          </div>
          <div className="text-[11px] text-muted mt-1">Batas waktu hari ini</div>
        </div>
      </div>

      {/* 3. Terlambat (Overdue) */}
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-surface border flex flex-col justify-between shadow-sm transition-all ${
          metrics.overdueCount > 0
            ? "border-rose-500/50 bg-rose-500/[0.03] shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            : "border-surface-border"
        }`}
      >
        <div className="flex items-center justify-between text-muted text-xs">
          <span className="font-medium">Tugas Terlambat</span>
          <div
            className={`w-8 h-8 rounded-xl border flex items-center justify-center ${
              metrics.overdueCount > 0
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
                : "bg-surface-hover border-surface-border text-muted"
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              metrics.overdueCount > 0 ? "text-rose-400" : "text-foreground"
            }`}
          >
            {metrics.overdueCount}
          </div>
          <div className="text-[11px] text-muted mt-1">
            {metrics.overdueCount > 0
              ? "Tindakan darurat diperlukan"
              : "Semua deadline aman"}
          </div>
        </div>
      </div>

      {/* 4. Progress Tingkat Selesai */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-surface-border flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between text-muted text-xs">
          <span className="font-medium">Tingkat Selesai</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {metrics.completionRate}%
            </span>
            <span className="text-[11px] text-muted">
              {metrics.completedCount}/{metrics.totalTasks} Selesai
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-navy-950 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cobalt-400 via-butter-300 to-emerald-400 transition-all duration-500"
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
