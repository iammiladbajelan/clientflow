"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import {
  IconUsers,
  IconFolder,
  IconCheck,
  IconWallet,
  IconAlert,
  IconClock,
  IconPlus,
  IconArrow,
  IconInbox,
} from "@/components/icons";
import { CardSkeleton, RowSkeleton, StatusBadge } from "@/components/ui/bits";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, relativeDays, isOverdue } from "@/lib/utils";
import type { Invoice, Project, Task } from "@/types";

export default function DashboardPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [clientCount, setClientCount] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState(false);
  // Captured once per mount so render stays pure; deadlines don't need
  // to-the-second precision.
  const [nowTs] = useState(() => new Date().getTime());

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadAll() {
      try {
        const [clientsRes, projectsRes, tasksRes, invoiceList] = await Promise.all([
          supabase.from("clients").select("id", { count: "exact", head: true }),
          supabase
            .from("projects")
            .select("*, clients(id, name)")
            .order("deadline", { ascending: true, nullsFirst: false }),
          supabase
            .from("tasks")
            .select("*, projects(id, name)")
            .neq("status", "done")
            .order("due_date", { ascending: true, nullsFirst: false }),
          api.invoices(),
        ]);

        if (cancelled) return;
        if (clientsRes.error || projectsRes.error || tasksRes.error) {
          setError(true);
        } else {
          setClientCount(clientsRes.count ?? 0);
          setProjects(projectsRes.data as unknown as Project[]);
          setTasks(tasksRes.data as unknown as Task[]);
          setInvoices(invoiceList);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const list = projects ?? [];
    const taskList = tasks ?? [];
    const activeProjects = list.filter((p) => p.status !== "completed").length;
    // Outstanding = unpaid invoices (sent + overdue). Falls back to 0 until
    // the user issues their first invoice.
    const outstanding = (invoices ?? [])
      .filter((inv) => inv.status === "sent" || inv.status === "overdue")
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
    const overdue = taskList.filter((task) => isOverdue(task.due_date)).length;

    return { activeProjects, outstanding, overdue };
  }, [projects, tasks, invoices]);

  const today = useMemo(() => new Date(nowTs).toISOString().slice(0, 10), [nowTs]);

  const upcomingDeadlines = useMemo(() => {
    return (projects ?? [])
      .filter((p) => p.deadline && p.deadline >= today && p.status !== "completed")
      .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1))
      .slice(0, 4);
  }, [projects, today]);

  const weekDeadlineCount = useMemo(() => {
    const now = nowTs;
    const inWeek = now + 7 * 24 * 60 * 60 * 1000;
    return (projects ?? []).filter((p) => {
      if (!p.deadline || p.status === "completed") return false;
      const ts = new Date(`${p.deadline}T00:00:00`).getTime();
      return ts >= now - 24 * 60 * 60 * 1000 && ts <= inWeek;
    }).length;
  }, [projects, nowTs]);

  const loading = clientCount === null || projects === null || tasks === null || invoices === null;
  const todayLabel = new Date().toLocaleDateString("fa-IR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{todayLabel}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            {t("goodMorning")}
          </h1>
          <p className="mt-2 text-slate-400">{t("overview")}</p>
        </div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <IconPlus className="text-base" />
          {t("newProject")}
        </Link>
      </header>

      {error ? (
        <div className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          <p>{t("genericError")}</p>
          <p className="mt-2 text-red-300/80">{t("errorDbHint")}</p>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </section>
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
            <RowSkeleton />
          </section>
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<IconUsers />}
              label={t("activeClients")}
              value={String(clientCount)}
            />
            <StatCard
              icon={<IconFolder />}
              label={t("activeProjects")}
              value={String(stats.activeProjects)}
              footnote={
                weekDeadlineCount > 0 ? (
                  <span className="flex items-center gap-1 font-medium text-slate-400">
                    <IconClock className="text-sm" />
                    {`${weekDeadlineCount} ${t("thisWeek")}`}
                  </span>
                ) : undefined
              }
            />
            <StatCard
              icon={<IconCheck />}
              label={t("pendingTasks")}
              value={String(tasks!.length)}
              footnote={
                stats.overdue > 0 ? (
                  <span className="flex items-center gap-1 font-medium text-red-500">
                    <IconAlert className="text-sm" />
                    {`${stats.overdue} ${t("overdue")}`}
                  </span>
                ) : undefined
              }
            />
            <StatCard
              icon={<IconWallet />}
              label={t("outstanding")}
              value={formatCurrency(stats.outstanding)}
            />
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft lg:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{t("activeProjects")}</h2>
                  <p className="text-sm text-slate-400">{t("yourProjects")}</p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:underline"
                >
                  {t("viewAll")}
                  <IconArrow className="rtl:-scale-x-100" />
                </Link>
              </div>

              {projects!.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <IconInbox className="mb-3 text-3xl text-slate-600" />
                  <p className="text-sm text-slate-400">{t("noProjectsYet")}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {projects!.slice(0, 5).map((project) => (
                    <div key={project.id}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{project.name}</p>
                          <p className="truncate text-sm text-slate-400">
                            {project.clients?.name ?? t("noClientOption")}
                          </p>
                        </div>
                        <StatusBadge status={project.status} label={t(project.status)} />
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {`${project.progress}%`}
                        {project.budget ? ` · ${formatCurrency(project.budget)}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                <h2 className="mb-1 font-semibold">{t("upcomingTasks")}</h2>
                <p className="mb-5 text-sm text-slate-400">{t("taskDescription")}</p>

                {tasks!.length === 0 ? (
                  <p className="py-4 text-sm text-slate-400">{t("noTasksYet")}</p>
                ) : (
                  <div className="space-y-4">
                    {tasks!.slice(0, 5).map((task) => {
                      const overdue = isOverdue(task.due_date);
                      return (
                        <div
                          key={task.id}
                          className="border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                        >
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {task.projects?.name}
                          </p>
                          <p
                            className={`mt-1.5 inline-flex items-center gap-1 text-xs font-medium ${
                              overdue ? "text-red-500" : "text-slate-400"
                            }`}
                          >
                            <IconClock className="text-sm" />
                            {task.due_date
                              ? relativeDays(task.due_date)
                              : t("noDueDate")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {upcomingDeadlines.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                  <h2 className="mb-4 font-semibold">{t("recentDeadlines")}</h2>
                  <div className="space-y-3">
                    {upcomingDeadlines.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm">{p.name}</p>
                        <span className="shrink-0 rounded-md bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                          {formatDate(p.deadline)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  footnote,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footnote?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-950/60 text-base text-indigo-400">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {footnote && <p className="mt-2 text-sm">{footnote}</p>}
    </div>
  );
}
