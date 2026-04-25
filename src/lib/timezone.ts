const TIMEZONE = "Asia/Bangkok";

export function toLocalDateString(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

export function getToday(): string {
  return toLocalDateString(new Date());
}

export function getWeekStart(): string {
  const d = new Date();
  const local = new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
  const day = local.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  local.setDate(local.getDate() + diff);
  return toLocalDateString(local);
}

export function getMonthStart(): string {
  const d = new Date();
  const local = new Date(d.toLocaleString("en-US", { timeZone: TIMEZONE }));
  return toLocalDateString(new Date(local.getFullYear(), local.getMonth(), 1));
}
