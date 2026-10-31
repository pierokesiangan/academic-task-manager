import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "academic_session";
const SECRET_KEY = process.env.SESSION_SECRET || "academic-task-manager-ice-and-butter-secret-2026";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lewatkan rute publik, asset statis, dan iCal feed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/calendar/feed") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname.startsWith("/icons/")
  ) {
    return NextResponse.next();
  }

  // 2. Periksa cookie sesi
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, encodedKey, {
        algorithms: ["HS256"],
      });
      isAuthenticated = !!payload.authenticated;
    } catch {
      isAuthenticated = false;
    }
  }

  // 3. Logika redirect
  const isUnlockPage = pathname === "/unlock";

  if (!isAuthenticated && !isUnlockPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/unlock";
    return NextResponse.redirect(url);
  }

  if (isAuthenticated && isUnlockPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
