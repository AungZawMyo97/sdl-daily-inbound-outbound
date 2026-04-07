const APP_TIMEZONE = "Asia/Bangkok";

/**
 * Get the current date/time in the app's local timezone.
 * Works correctly regardless of the server's system timezone.
 */
export function nowLocal(): Date {
  const utcNow = new Date();
  const localStr = utcNow.toLocaleString("en-US", { timeZone: APP_TIMEZONE });
  return new Date(localStr);
}

/**
 * Get today's date (YYYY-MM-DD) in the app's local timezone.
 */
export function todayLocalDateString(): string {
  const local = nowLocal();
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, "0");
  const d = String(local.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get the current year in the app's local timezone.
 */
export function currentYear(): number {
  return nowLocal().getFullYear();
}

export { APP_TIMEZONE };
