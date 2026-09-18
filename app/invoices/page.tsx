"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, Button } from "@/components/ui/field";
import { EmptyState, StatusBadge } from "@/components/ui/bits";
import {
  IconInvoice,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheckCircle,
} from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { api, apiErrorKey } from "@/lib/api";
import type { TranslationKey } from "@/lib/translations";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Invoice, InvoiceStatus, Project } from "@/types";

function invoiceStatusLabel(status: InvoiceStatus): TranslationKey {
  switch (status) {
    case "draft":
      return "invDraft";
    case "sent":
      return "invSent";
    case "paid":
      return "invPaid";
    case "overdue":
      return "invOverdue";
  }
}

const INVOICE_STATUSES: { value: InvoiceStatus; labelKey: "invDraft" | "invSent" | "invPaid" | "invOverdue" }[] = [
  { value: "draft", labelKey: "invDraft" },
  { value: "sent", labelKey: "invSent" },
  { value: "paid", labelKey: "invPaid" },
  { value: "overdue", labelKey: "invOverdue" },
];

const emptyForm = {
  number: "",
  project_id: "",
  amount: "",
  status: "draft" as InvoiceStatus,
  issue_date: "",
  due_date: "",
  notes: "",
};

export default function InvoicesPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [invoiceList, projectList] = await Promise.all([
          api.invoices(),
          api.projects(),
        ]);
        if (!cancelled) {
          setInvoices(invoiceList);
          setProjects(projectList);
        }
      } catch (err) {
        if (!cancelled) toast(t(apiErrorKey((err as Error).message)), "error");
      } finally {
        if (!cancelled) setInvoices((prev) => prev ?? []);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const totals = useMemo(() => {
    const list = invoices ?? [];
    const paid = list
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
    const pending = list
      .filter((inv) => inv.status === "sent" || inv.status === "overdue")
      .reduce((sum, inv) => sum + (inv.amount ?? 0), 0);
    return { paid, pending };
  }, [invoices]);

  function openCreate() {
    setEditing(null);
    // Suggest the next sequential number, e.g. 1403-007.
    const year = new Date().getFullYear();
    const existing = (invoices ?? [])
      .map((inv) => /^(\d{4})-(\d+)$/.exec(inv.number.trim()))
      .filter((m): m is RegExpExecArray => m !== null && m[1] === String(year))
      .map((m) => parseInt(m[2], 10));
    const next = existing.length ? Math.max(...existing) + 1 : 1;
    setForm({
      ...emptyForm,
      number: `${year}-${String(next).padStart(3, "0")}`,
      issue_date: new Date().toISOString().slice(0, 10),
    });
    setError("");
    setModalOpen(true);
  }

  function openEdit(inv: Invoice) {
    setEditing(inv);
    setForm({
      number: inv.number,
      project_id: inv.project_id ?? "",
      amount: inv.amount != null ? String(inv.amount) : "",
      status: inv.status,
      issue_date: inv.issue_date ?? "",
      due_date: inv.due_date ?? "",
      notes: inv.notes ?? "",
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    const amount = parseFloat(form.amount.replace(/[^\d.]/g, "")) || 0;
    const payload = {
      number: form.number.trim(),
      project_id: form.project_id || null,
      amount,
      status: form.status,
      issue_date: form.issue_date || null,
      due_date: form.due_date || null,
      notes: form.notes.trim() || null,
      paid_at: form.status === "paid" ? new Date().toISOString() : null,
    };

    try {
      if (editing) {
        await api.updateInvoice(editing.id, payload);
      } else {
        await api.createInvoice({ user_id: user.id, ...payload });
      }
      setInvoices(await api.invoices());
      setModalOpen(false);
      toast(t("saved"), "success");
    } catch (err) {
      const key = apiErrorKey((err as Error).message);
      setError(t(key));
      toast(t(key), "error");
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(inv: Invoice) {
    const prev = invoices;
    setInvoices(
      (list) =>
        (list ?? []).map((row) =>
          row.id === inv.id ? { ...row, status: "paid" as InvoiceStatus } : row
        )
    );
    try {
      await api.updateInvoice(inv.id, {
        status: "paid",
        paid_at: new Date().toISOString(),
      });
      toast(t("saved"), "success");
    } catch (err) {
      setInvoices(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  async function handleDelete(inv: Invoice) {
    const ok = await confirm(t("confirmDeleteInvoice"));
    if (!ok) return;

    const prev = invoices;
    setInvoices((list) => (list ?? []).filter((row) => row.id !== inv.id));
    try {
      await api.deleteInvoice(inv.id);
      toast(t("saved"), "success");
    } catch (err) {
      setInvoices(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  const loading = invoices === null;

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("invoicesTitle")}
          </h1>
          <p className="mt-2 text-slate-400">{t("invoicesSubtitle")}</p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="text-base" />
          {t("newInvoice")}
        </Button>
      </header>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-14 rounded-xl border border-slate-800 bg-slate-900"
            />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<IconInvoice />}
          title={t("noInvoicesYet")}
          action={
            <Button onClick={openCreate}>
              <IconPlus className="text-base" />
              {t("newInvoice")}
            </Button>
          }
        />
      ) : (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <IconCheckCircle className="text-emerald-400" />
                {t("totalPaid")}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-400">
                {formatCurrency(totals.paid)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft">
              <p className="flex items-center gap-2 text-sm text-slate-400">
                <IconInvoice />
                {t("totalPending")}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-amber-400">
                {formatCurrency(totals.pending)}
              </p>
            </div>
          </section>

          <div className="animate-fade-in overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-soft">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-start text-xs text-slate-400">
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColNumber")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColProject")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColAmount")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColStatus")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColDue")}</th>
                  <th className="px-4 py-3 text-start font-medium">{t("invoiceColActions")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-slate-800/60 transition last:border-0 hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 font-medium">{inv.number}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {inv.projects?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatCurrency(inv.amount ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        kind="invoice"
                        status={inv.status}
                        label={t(invoiceStatusLabel(inv.status))}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {inv.due_date ? formatDate(inv.due_date) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {inv.status !== "paid" && (
                          <button
                            onClick={() => markPaid(inv)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-950/40 hover:text-emerald-400"
                            title={t("markPaid")}
                            aria-label={t("markPaid")}
                          >
                            <IconCheckCircle className="text-sm" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(inv)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                          title={t("editInvoice")}
                          aria-label={t("editInvoice")}
                        >
                          <IconEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-950/40 hover:text-red-400"
                          title={t("deleteProject")}
                          aria-label={t("deleteProject")}
                        >
                          <IconTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t("editInvoice") : t("newInvoice")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t("invoiceNumber")} hint={editing ? undefined : t("invoiceNumberHint")}>
            <TextInput
              required
              value={form.number}
              onChange={(e) => setForm({ ...form, number: e.target.value })}
            />
          </Field>
          <Field label={t("invoiceProject")}>
            <select
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">—</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("invoiceAmount")}>
              <TextInput
                required
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </Field>
            <Field label={t("invoiceStatus")}>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as InvoiceStatus })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                {INVOICE_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {t(s.labelKey)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("invoiceIssueDate")}>
              <TextInput
                type="date"
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
              />
            </Field>
            <Field label={t("invoiceDueDate")}>
              <TextInput
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </Field>
          </div>
          <Field label={t("invoiceNotes")}>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t("saving") : editing ? t("saveChanges") : t("create")}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
