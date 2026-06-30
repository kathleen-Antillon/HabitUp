export const DEFAULT_TIMEZONE = "America/Bogota";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export function isValidTimezone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function resolveTimezone(timeZone?: string | null): string {
  if (timeZone && isValidTimezone(timeZone)) return timeZone;
  return DEFAULT_TIMEZONE;
}

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Calendar date (YYYY-MM-DD) for an instant in the given IANA timezone. */
export function getDateKeyInTimezone(date: Date, timeZone: string): string {
  const parts = getZonedParts(date, timeZone);
  return formatDateKey(parts.year, parts.month, parts.day);
}

/** UTC instant for midnight (00:00) of a calendar date in the given timezone. */
export function dateKeyToUtcDate(dateKey: string, timeZone: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  let low = Date.UTC(year, month - 2, day, 0, 0, 0);
  let high = Date.UTC(year, month, day + 1, 0, 0, 0);

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const parts = getZonedParts(new Date(mid), timeZone);
    const key = formatDateKey(parts.year, parts.month, parts.day);
    const minutes = parts.hour * 60 + parts.minute;

    if (key < dateKey) {
      low = mid + 1;
    } else if (key > dateKey) {
      high = mid;
    } else if (minutes > 0) {
      high = mid;
    } else {
      return new Date(mid);
    }
  }

  return new Date(low);
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  return formatDateKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Start of today (local calendar day) in the user's timezone. */
export function getTodayInTimezone(timeZone: string, now = new Date()): Date {
  const dateKey = getDateKeyInTimezone(now, timeZone);
  return dateKeyToUtcDate(dateKey, timeZone);
}

/** Start of yesterday (local calendar day) in the user's timezone. */
export function getYesterdayInTimezone(timeZone: string, now = new Date()): Date {
  const yesterdayKey = addDaysToDateKey(getDateKeyInTimezone(now, timeZone), -1);
  return dateKeyToUtcDate(yesterdayKey, timeZone);
}

export function isDateWithinChallengeDay(
  day: Date,
  startDate: Date,
  endDate: Date,
  timeZone: string
): boolean {
  const dayKey = getDateKeyInTimezone(day, timeZone);
  const startKey = getDateKeyInTimezone(startDate, timeZone);
  const endKey = getDateKeyInTimezone(endDate, timeZone);
  return dayKey >= startKey && dayKey <= endKey;
}

export function challengeDayNumberInTimezone(
  startDate: Date,
  timeZone: string,
  today: Date = getTodayInTimezone(timeZone)
): number {
  const startKey = getDateKeyInTimezone(startDate, timeZone);
  const todayKey = getDateKeyInTimezone(today, timeZone);
  const [sy, sm, sd] = startKey.split("-").map(Number);
  const [ty, tm, td] = todayKey.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  const diffDays = Math.floor((todayUtc - startUtc) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}

export function daysBetweenInTimezone(
  startDate: Date,
  endDate: Date,
  timeZone: string
): number {
  const startKey = getDateKeyInTimezone(startDate, timeZone);
  const endKey = getDateKeyInTimezone(endDate, timeZone);
  const [sy, sm, sd] = startKey.split("-").map(Number);
  const [ey, em, ed] = endKey.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.max(0, Math.floor((endUtc - startUtc) / (1000 * 60 * 60 * 24)) + 1);
}

export function getLocalHour(timeZone: string, now = new Date()): number {
  return getZonedParts(now, timeZone).hour;
}

/** e.g. "30 de junio de 2026" in the user's timezone. */
export function formatLongDateInTimezone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
}
