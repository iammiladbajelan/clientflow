"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CardSkeleton, EmptyState, PriorityBadge } from "@/components/ui/bits";
import { IconArrow, IconCalendar } from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatDate, relativeDays } from "@/lib/utils";
import type { Project, Task } from "@/types";

type CalEvent = {
  kind: "task" | "deadline";
  date: string; // YYYY-MM-DD (matches the database, which stores Gregorian dates)
  title: string;
  projectName: string;
  status?: Task["status"];
  priority?: Task["priority"];
  done: boolean;
};

// Saturday-first week (Iranian convention). JS getDay(): Sun=0 … Sat=6.
const WEEKDAY_LABELS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// Gregorian month names transliterated to Persian — the grid shows Gregorian
// day numbers (same values the database stores), so the label must match.
const MONTH_LABELS = [
  "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
  "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر",
];

function currentYm() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 42-cell (6 weeks × 7 days) Saturday-first grid for the given YYYY-MM. */
function gridFor(ym: string): { date: string; inMonth: boolean }[] {
  const [y, m] = ym.split("-").map(Number);
  const offset = (new Date(y, m - 1, 1).getDay() + 1) % 7;
  const cells: { date: string; inMonth: boolean }[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(y, m - 1, 1 - offset + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    cells.push({ date: iso, inMonth: d.getMonth() === m - 1 });
  }
  return cells;
}

function faDay(iso: string) {
  return Number(iso.slice(8)).toLocaleString("fa-IR");
}

function faNum(n: number) {
  return n.toLocaleString("fa-IR");
}

export default function CalendarPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [ym, setYm] = useState(currentYm);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [taskList, projectList] = await Promise.all([
          api.tasks(),
          api.projects(),
        ]);
        if (cancelled) return;
        setTasks(taskList);
        setProjects(projectList);
      } catch {
        if (!cancelled) {
          setTasks([]);
          setProjects([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Group events by date once — cell lookups are O(1).
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const push = (e: CalEvent) => {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    };
    for (const task of tasks ?? []) {
      if (!task.due_date) continue;
      push({
        kind: "task",
        date: task.due_date,
        title: task.title,
        projectName: task.projects?.name ?? "",
        status: task.status,
        priority: task.priority,
        done: task.status === "done",
      });
    }
    for (const p of projects ?? []) {
      if (!p.deadline || p.status === "completed") continue;
      push({
        kind: "deadline",
        date: p.deadline,
        title: p.name,
        projectName: p.clients?.name ?? "",
        done: false,
      });
    }
    return map;
  }, [tasks, projects]);

  const grid = useMemo(() => gridFor(ym), [ym]);

  const today = useMemo(() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
  }, []);

  const [year, monthIndex] = ym.split("-").map(Number);
  const monthEventsCount = useMemo(
    () =>
      grid
        .filter((c) => c.inMonth)
        .reduce((sum, c) => sum + (eventsByDate.get(c.date)?.length ?? 0), 0),
    [grid, eventsByDate]
  );

  const loading = tasks === null || projects === null;
  const selectedEvents = selected ? (eventsByDate.get(selected) ?? []) : [];

  const statusLabel = (s?: Task["status"]) =>
    s === "todo"
      ? t("colTodo")
      : s === "in_progress"
        ? t("colInProgress")
        : s === "done"
          ? t("colDone")
          : "";

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("calendar")}
          </h1>
          <p className="mt-2 text-slate-400">{t("calendarSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYm((v) => shiftMonth(v, -1))}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800"
            aria-label={t("previousMonth")}
          >
            <IconArrow />
          </button>
          <span className="min-w-40 text-center text-sm font-semibold">
            {`${MONTH_LABELS[monthIndex - 1]} ${faNum(year)}`}
          </span>
          <button
            onClick={() => setYm((v) => shiftMonth(v, 1))}
            className="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800"
            aria-label={t("nextMonth")}
          >
            <IconArrow className="rtl:-scale-x-100" />
          </button>
          <button
            onClick={() => {
              setYm(currentYm());
              setSelected(today);
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            {t("today")}
          </button>
        </div>
      </header>

      {loading ? (
        <CardSkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-indigo-400" />
                {t("calLegendTask")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                {t("calLegendDone")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-amber-400" />
                {t("calLegendDeadline")}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((w) => (
                <div
                  key={w}
                  className="pb-2 text-center text-xs font-medium text-slate-500"
                >
                  {w}
                </div>
              ))}
              {grid.map((cell) => {
                const evs = eventsByDate.get(cell.date) ?? [];
                const isToday = cell.date === today;
                const isSelected = cell.date === selected;
                return (
                  <button
                    key={cell.date}
                    onClick={() => setSelected(cell.date)}
                    className={`flex h-20 flex-col items-stretch rounded-xl border p-1.5 text-right transition md:h-24 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10"
                        : isToday
                          ? "border-indigo-500/50 bg-slate-900"
                          : "border-slate-800/70 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900"
                    } ${cell.inMonth ? "" : "opacity-40"}`}
                  >
                    <span
                      className={`text-xs ${isToday ? "font-bold text-indigo-300" : "text-slate-400"}`}
                    >
                      {faDay(cell.date)}
                    </span>
                    <span className="mt-auto flex flex-wrap items-center gap-1">
                      {evs.slice(0, 3).map((e, i) => (
                        <span
                          key={i}
                          className={`size-1.5 rounded-full ${
                            e.done
                              ? "bg-emerald-400"
                              : e.kind === "deadline"
                                ? "bg-amber-400"
                                : "bg-indigo-400"
                          }`}
                        />
                      ))}
                      {evs.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{faNum(evs.length - 3)}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {monthEventsCount === 0 && (
              <p className="mt-4 text-center text-sm text-slate-500">
                {t("calEmptyMonth")}
              </p>
            )}
          </div>

          {/* Day details panel */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
            {selected ? (
              <>
                <h2 className="font-semibold">{formatDate(selected)}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {relativeDays(selected)}
                </p>

                {selectedEvents.length === 0 ? (
                  <div className="mt-6">
                    <EmptyState
                      icon={<IconCalendar />}
                      title={t("calNothingToday")}
                      description={t("calNothingTodaySub")}
                    />
                  </div>
                ) : (
                  <ul className="mt-5 space-y-3">
                    {selectedEvents.map((e, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              e.done ? "text-slate-500 line-through" : ""
                            }`}
                          >
                            {e.title}
                          </p>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium ${
                              e.kind === "deadline"
                                ? "bg-amber-500/10 text-amber-300"
                                : "bg-indigo-500/10 text-indigo-300"
                            }`}
                          >
                            {e.kind === "deadline"
                              ? t("calKindDeadline")
                              : t("calKindTask")}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          {e.projectName && <span>{e.projectName}</span>}
                          {e.kind === "task" && e.priority && (
                            <PriorityBadge
                              priority={e.priority}
                              label={t(`priority${e.priority.charAt(0).toUpperCase()}${e.priority.slice(1)}` as never)}
                            />
                          )}
                          {e.kind === "task" && (
                            <span>{statusLabel(e.status)}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <EmptyState
                icon={<IconCalendar />}
                title={t("calPickDay")}
                description={t("calPickDaySub")}
              />
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
