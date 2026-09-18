"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/contexts/locale-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { IconCheckCircle, IconClock, IconFolder, IconWallet } from "@/components/icons";

interface PortalData {
  name: string;
  progress: number;
  status: string;
  deadline: string | null;
  budget: number | null;
  updated_at: string;
  tasks_total: number;
  tasks_done: number;
}

const STATUS_LABELS: Record<string, string> = {
  onTrack: "طبق برنامه",
  inProgress: "در حال انجام",
  almostDone: "تقریباً تمام شده",
  completed: "تکمیل‌شده",
  onHold: "متوقف‌شده",
};

export default function ClientPortalPage() {
  const { t } = useLocale();
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<PortalData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.token) return;
    let cancelled = false;

    supabase
      .rpc("get_public_project", { p_token: params.token })
      .then(({ data: rows, error }) => {
        if (cancelled) return;
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (error || !row) setNotFound(true);
        else setData(row as PortalData);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params?.token]);

  return (
    <main dir="rtl" className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5 px-4 py-4">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-600/30">
            CF
          </span>
          <span className="font-bold tracking-tight">{t("appName")}</span>
          <span className="ms-auto rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
            {t("portalTitle")}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        {loading ? (
          <div className="space-y-4">
            <div className="skeleton h-10 w-2/3 rounded-lg" />
            <div className="skeleton h-24 w-full rounded-2xl" />
            <div className="skeleton h-40 w-full rounded-2xl" />
          </div>
        ) : notFound || !data ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-16 text-center">
            <p className="font-semibold">{t("portalInvalid")}</p>
          </div>
        ) : (
          <div className="animate-fade-in space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{data.name}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {STATUS_LABELS[data.status] ?? data.status}
              </p>
            </div>

            {/* Progress */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{t("portalProgressLabel")}</span>
                <span className="font-bold text-indigo-300">{`${data.progress}٪`}</span>
              </div>
              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                  style={{ width: `${data.progress}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                {`${data.tasks_done} ${t("portalTasksTotal")} ${data.tasks_total} ${t("portalTasksDone")}`}
              </p>
            </section>

            {/* Facts */}
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <IconClock className="text-indigo-400" />
                  {t("portalDeadline")}
                </p>
                <p className="mt-2 font-semibold">
                  {data.deadline ? formatDate(data.deadline) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <IconWallet className="text-indigo-400" />
                  {t("portalBudget")}
                </p>
                <p className="mt-2 font-semibold">
                  {data.budget ? formatCurrency(Number(data.budget)) : "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <IconFolder className="text-indigo-400" />
                  {t("portalLastUpdate")}
                </p>
                <p className="mt-2 font-semibold">
                  {new Date(data.updated_at).toLocaleDateString("fa-IR")}
                </p>
              </div>
            </section>

            <p className="flex items-center justify-center gap-2 pt-4 text-xs text-slate-500">
              <IconCheckCircle className="text-emerald-500" />
              {`${t("portalPoweredBy")} ${t("appName")}`}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
