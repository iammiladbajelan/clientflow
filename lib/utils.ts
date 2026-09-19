export function formatCurrency(value: number) {
  return value.toLocaleString("fa-IR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

/** Within ±1 day returns Today/Tomorrow/Yesterday; else "N days away" / "N days ago". */
export function relativeDays(dateStr: string): string {
  const today = new Date();
  const date = new Date(`${dateStr}T00:00:00`);
  const diff = Math.round(
    (date.getTime() - new Date(today.toDateString()).getTime()) / 86_400_000
  );
  if (diff === 0) return "امروز";
  if (diff === 1) return "فردا";
  if (diff === -1) return "دیروز";
  if (diff > 0) return `${faNum(diff)} روز مانده`;
  return `${faNum(Math.abs(diff))} روز گذشته`;
}

export function isOverdue(dateStr: string | null | undefined) {
  if (!dateStr) return false;
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

/** "چند لحظه پیش"، «۵ دقیقه پیش»، «۳ ساعت پیش»، «دیروز»، «۴ روز پیش». */
export function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "چند لحظه پیش";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${faNum(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${faNum(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "دیروز";
  return `${faNum(days)} روز پیش`;
}

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => Array.from(p)[0]?.toUpperCase() ?? "").join("");
}

const AVATAR_CLASSES = [
  "bg-indigo-950 text-indigo-300",
  "bg-emerald-950 text-emerald-300",
  "bg-amber-950 text-amber-300",
  "bg-rose-950 text-rose-300",
  "bg-sky-950 text-sky-300",
  "bg-violet-950 text-violet-300",
];

export function avatarClass(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_CLASSES[Math.abs(hash) % AVATAR_CLASSES.length];
}
