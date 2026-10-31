import { NextRequest, NextResponse } from "next/server";
import { generateCalendarFeed } from "@/lib/ical";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return new NextResponse("Token kalender tidak valid", { status: 400 });
  }

  const icsContent = await generateCalendarFeed(token);

  if (!icsContent) {
    return new NextResponse("Unauthorized: Token kalender salah atau sudah kedaluwarsa", {
      status: 401,
    });
  }

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="academic-tasks.ics"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
