"use server";

import { verifyPin, setPin, setSessionCookie, clearSessionCookie, checkHasPin } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkAuthStatusAction() {
  const hasPin = await checkHasPin();
  return { hasPin };
}

export async function unlockAction(pin: string) {
  if (!pin || pin.length < 4) {
    return { success: false, error: "PIN minimal 4 digit" };
  }

  const isValid = await verifyPin(pin);
  if (!isValid) {
    return { success: false, error: "PIN salah. Coba lagi!" };
  }

  await setSessionCookie();
  return { success: true };
}

export async function setupInitialPinAction(pin: string) {
  if (!pin || pin.length < 4 || pin.length > 6) {
    return { success: false, error: "PIN harus 4 sampai 6 digit angka" };
  }

  await setPin(pin);
  await setSessionCookie();
  return { success: true };
}

export async function changePinAction(oldPin: string, newPin: string) {
  const isValid = await verifyPin(oldPin);
  if (!isValid) {
    return { success: false, error: "PIN lama salah" };
  }

  if (!newPin || newPin.length < 4 || newPin.length > 6) {
    return { success: false, error: "PIN baru harus 4-6 digit" };
  }

  await setPin(newPin);
  return { success: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/unlock");
}
