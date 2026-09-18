import type { ReactNode } from "react";
import type { InvoiceStatus, Priority, ProjectStatus, TaskStatus } from "@/types";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  onTrack: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  inProgress:
    "bg-indigo-500/10 text-indigo-300 ring-indigo-500/25",
  almostDone: "bg-sky-500/10 text-sky-300 ring-sky-500/25",
  completed: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
  onHold: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
};

const INVOICE_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
  sent: "bg-indigo-500/10 text-indigo-300 ring-indigo-500/25",
  paid: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  overdue: "bg-red-500/10 text-red-300 ring-red-500/25",
};

export function StatusBadge({
  status,
  label,
  kind = "project",
}: {
  status: ProjectStatus | InvoiceStatus;
  label: string;
  kind?: "project" | "invoice";
}) {
  const style =
    kind === "invoice"
      ? INVOICE_STYLES[status as InvoiceStatus]
      : STATUS_STYLES[status as ProjectStatus];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  low: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
  medium: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  high: "bg-red-500/10 text-red-300 ring-red-500/25",
};

export function PriorityBadge({ priority, label }: { priority: Priority; label: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}>
      {label}
    </span>
  );
}

export const TASK_COLUMN_ACCENT: Record<TaskStatus, string> = {
  todo: "bg-slate-500",
  in_progress: "bg-indigo-500",
  done: "bg-emerald-500",
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex animate-fade-in flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl text-slate-500">
        {icon}
      </div>
      <p className="font-semibold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton mt-3 h-8 w-1/2" />
      <div className="skeleton mt-3 h-3 w-2/3" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="skeleton mt-4 h-2 w-full rounded-full" />
      <div className="skeleton mt-3 h-3 w-24" />
    </div>
  );
}

export function Splash({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950">
      <div className="flex size-12 animate-pulse items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/40">
        CF
      </div>
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}
