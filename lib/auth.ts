import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "academic_session";
const SECRET_KEY = process.env.SESSION_SECRET || "academic-task-manager-ice-and-butter-secret-2026";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function createSessionToken(): Promise<string> {
  return await new SignJWT({ role: "owner", authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return !!payload.authenticated;
  } catch {
    return false;
  }
}

export async function setSessionCookie() {
  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 hari
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function checkHasPin(): Promise<boolean> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "singleton" },
  });
  return !!config?.pinHash;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const config = await prisma.appConfig.findUnique({
    where: { id: "singleton" },
  });

  if (!config || !config.pinHash) {
    // Jika belum disetup sama sekali, default ke true jika PIN adalah 1234
    return pin === "1234";
  }

  // Verifikasi hash bcrypt
  try {
    return await bcrypt.compare(pin, config.pinHash);
  } catch {
    return false;
  }
}

export async function setPin(pin: string): Promise<void> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pin, salt);

  await prisma.appConfig.upsert({
    where: { id: "singleton" },
    update: { pinHash: hash },
    create: {
      id: "singleton",
      pinHash: hash,
      themePreference: "dark",
    },
  });
}
