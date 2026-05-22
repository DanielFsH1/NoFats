const APP_TIME_ZONE = "America/Mexico_City";

export function getDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function getTomorrowDateKey(date = new Date()) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return getDateKey(next);
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: APP_TIME_ZONE,
  }).format(new Date(date));
}
