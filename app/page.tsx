import { getDashboardDataAction } from "@/actions/dashboard";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const res = await getDashboardDataAction();

  if (!res.success || !res.data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 text-center text-muted text-xs">
        Gagal memuat data dashboard. Pastikan database terhubung.
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <DashboardView initialData={res.data as any} />
    </main>
  );
}
