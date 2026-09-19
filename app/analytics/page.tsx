"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CardSkeleton, EmptyState } from "@/components/ui/bits";
import {
  IconUsers,
  IconFolder,
  IconWallet,
  IconClock,
  IconDollar,
} from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Client, Invoice, Project, Task } from "@/types";

/** Jalali month label + `YYYY-MM` key for the N months ending this month. */
function lastMonths(n: number) {
  const now = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (n - 1 - i), 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("fa-IR", { month: "long" }),
    };
  });
}

export default function AnalyticsPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [clients, setClients] = useState<Client[] | null>(null);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const [c, p, tk, inv] = await Promise.all([
          api.clients(),
          api.projects(),
          api.tasks(),
          api.invoices(),
        ]);
        if (cancelled) return;
        setClients(c);
        setProjects(p);
        setTasks(tk);
        setInvoices(inv);
      } catch {
        if (!cancelled) {
          setClients([]);
          setProjects([]);
          setTasks([]);
          setInvoices([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const months = useMemo(() => lastMonths(6), []);

  // Monthly invoiced revenue (by issue date) — bars are relative to the max.
  const revenue = useMemo(() => {
    const totals = new Map<string, number>();
    for (const inv of invoices ?? []) {
      if (inv.status === "draft" || !inv.issue_date) continue;
      const key = inv.issue_date.slice(0, 7);
      totals.set(key, (totals.get(key) ?? 0) + (inv.amount ?? 0));
    }
    const rows = months.map((m) => ({ ...m, total: totals.get(m.key) ?? 0 }));
    const max = Math.max(1, ...rows.map((r) => r.total));
    return { rows, max };
  }, [invoices, months]);

  const kpis = useMemo(() => {
    const projectList = projects ?? [];
    const taskList = tasks ?? [];
    const invoiceList = invoices ?? [];
    const paid = invoiceList
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + (i.amount ?? 0), 0);
    const outstanding = invoiceList
      .filter((i) => i.status === "sent" || i.status === "overdue")
      .reduce((s, i) => s + (i.amount ?? 0), 0);
    return {
      clients: clients?.length ?? 0,
      projects: projectList.length,
      openTasks: taskList.filter((tk) => tk.status !== "done").length,
      doneTasks: taskList.filter((tk) => tk.status === "done").length,
      paid,
      outstanding,
      totalMinutes: taskList.reduce((s, tk) => s + (tk.time_spent ?? 0), 0),
    };
  }, [clients, projects, tasks, invoices]);

  const statusDist = useMemo(() => {
    const list = projects ?? [];
    const order: Project["status"][] = [
      "onTrack",
      "inProgress",
      "almostDone",
      "onHold",
      "completed",
    ];
    return order.map((status) => {
      const count = list.filter((p) => p.status === status).length;
      return {
        status,
        count,
        pct: list.length ? Math.round((count / list.length) * 100) : 0,
      };
    });
  }, [projects]);

  const topClients = useMemo(() => {
    const value = new Map<string, number>();
    for (const p of projects ?? []) {
      if (!p.client_id) continue;
      value.set(p.client_id, (value.get(p.client_id) ?? 0) + (p.budget ?? 0));
    }
    return (clients ?? [])
      .map((c) => ({ name: c.name, total: value.get(c.id) ?? 0 }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [clients, projects]);

  const maxClientValue = Math.max(1, ...topClients.map((c) => c.total));

  function faHours(minutes: number) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m.toLocaleString("fa-IR")} دقیقه`;
    if (m === 0) return `${h.toLocaleString("fa-IR")} ساعت`;
    return `${h.toLocaleString("fa-IR")} ساعت و ${m.toLocaleString("fa-IR")} دقیقه`;
  }

  const loading =
    clients === null || projects === null || tasks === null || invoices === null;
  const isEmpty =
    !loading &&
    !clients!.length &&
    !projects!.length &&
    !tasks!.length &&
    !invoices!.length;

  return (
    <AppShell>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("analytics")}
        </h1>
        <p className="mt-2 text-slate-400">{t("analyticsSubtitle")}</p>
      </header>

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </section>
      ) : isEmpty ? (
        <EmptyState
          icon={<IconFolder />}
          title={t("analyticsEmptyTitle")}
          description={t("analyticsEmptySub")}
        />
      ) : (
        <div className="space-y-8">
          {/* KPI cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<IconUsers />}
              label={t("activeClients")}
              value={kpis.clients.toLocaleString("fa-IR")}
            />
            <StatCard
              icon={<IconFolder />}
              label={t("activeProjects")}
              value={kpis.projects.toLocaleString("fa-IR")}
            />
            <StatCard
              icon={<IconWallet />}
              label={t("analyticsPaid")}
              value={formatCurrency(kpis.paid)}
            />
            <StatCard
              icon={<IconDollar />}
              label={t("outstanding")}
              value={formatCurrency(kpis.outstanding)}
            />
          </section>

          {/* Revenue bars */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
            <h2 className="font-semibold">{t("analyticsRevenue6m")}</h2>
            <p className="mt-1 text-sm text-slate-400">
              {t("analyticsRevenueSub")}
            </p>
            <div className="mt-6 flex h-44 items-end gap-3">
              {revenue.rows.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[10px] text-slate-400">
                    {row.total > 0 ? formatCurrency(row.total) : "—"}
                  </span>
                  <div
                    className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-indigo-600/70 to-violet-500 transition-all"
                    style={{
                      height: `${Math.max(4, Math.round((row.total / revenue.max) * 100))}%`,
                      minHeight: 4,
                    }}
                  />
                  <span className="text-xs text-slate-400">{row.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            {/* Project status distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
              <h2 className="font-semibold">{t("analyticsStatusDist")}</h2>
              <div className="mt-5 space-y-4">
                {statusDist.map((row) => (
                  <div key={row.status}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span>{t(row.status)}</span>
                      <span className="text-slate-400">
                        {row.count.toLocaleString("fa-IR")} ·{" "}
                        {row.pct.toLocaleString("fa-IR")}٪
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks + time + top clients */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                <h2 className="font-semibold">{t("analyticsTasks")}</h2>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-2xl font-bold text-indigo-300">
                      {kpis.openTasks.toLocaleString("fa-IR")}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("analyticsOpenTasks")}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-2xl font-bold text-emerald-300">
                      {kpis.doneTasks.toLocaleString("fa-IR")}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("colDone")}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-950/60 p-3">
                    <p className="text-2xl font-bold text-amber-300">
                      {kpis.totalMinutes > 0
                        ? Math.round(kpis.totalMinutes / 60).toLocaleString("fa-IR")
                        : "۰"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t("analyticsHours")}
                    </p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <IconClock className="text-base text-slate-500" />
                  {`${t("analyticsTotalTime")}: ${faHours(kpis.totalMinutes)}`}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                <h2 className="font-semibold">{t("analyticsTopClients")}</h2>
                {topClients.length === 0 ? (
                  <p className="mt-4 text-sm text-slate-400">
                    {t("analyticsNoClientData")}
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {topClients.map((c) => (
                      <div key={c.name}>
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="truncate">{c.name}</span>
                          <span className="shrink-0 text-slate-400">
                            {formatCurrency(c.total)}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{
                              width: `${Math.round((c.total / maxClientValue) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-950/60 text-base text-indigo-400">
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
