export function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
}

export function percent(value: number) {
  return new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function minutesUntil(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(hour, minute, 0, 0);
  const diff = Math.max(0, cutoff.getTime() - now.getTime());
  return Math.floor(diff / 60000);
}

export function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36).slice(-4)}`;
}
