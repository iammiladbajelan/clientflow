"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/ui/modal";
import { Field, TextInput, Button } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/bits";
import { IconUsers, IconPlus, IconSearch, IconEdit, IconTrash, IconInbox } from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { api, apiErrorKey } from "@/lib/api";
import { initials, avatarClass, formatCurrency } from "@/lib/utils";
import type { Client, Project } from "@/types";

const emptyForm = { name: "", email: "", phone: "" };

export default function ClientsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [clientList, projectList] = await Promise.all([
          api.clients(),
          api.projects(),
        ]);
        if (!cancelled) {
          setClients(clientList);
          setProjects(projectList);
        }
      } catch (err) {
        if (!cancelled) toast(t(apiErrorKey((err as Error).message)), "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").includes(q)
    );
  }, [clients, query]);

  function statsFor(client: Client) {
    const mine = projects.filter((p) => p.client_id === client.id);
    const active = mine.filter((p) => p.status !== "completed").length;
    const value = mine
      .filter((p) => p.status !== "completed")
      .reduce((sum, p) => sum + (p.budget ?? 0), 0);
    return { active, value };
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({ name: client.name, email: client.email ?? "", phone: client.phone ?? "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
      };
      if (editing) {
        await api.updateClient(editing.id, payload);
      } else {
        await api.createClient({ user_id: user.id, ...payload });
      }
      const fresh = await api.clients();
      setClients(fresh);
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

  async function handleDelete(client: Client) {
    const ok = await confirm(t("confirmDeleteClient"));
    if (!ok) return;

    const prev = clients;
    setClients((list) => list.filter((c) => c.id !== client.id));
    try {
      await api.deleteClient(client.id);
      toast(t("saved"), "success");
    } catch (err) {
      setClients(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("clientsTitle")}
          </h1>
          <p className="mt-2 text-slate-400">
            {t("clientsSubtitle")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="text-base" />
          {t("newClient")}
        </Button>
      </header>

      {loading ? (
        <div className="grid animate-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-center gap-3">
                <div className="skeleton size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/2" />
                  <div className="skeleton h-3 w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={<IconUsers />}
          title={t("noClientsYet")}
          action={
            <Button onClick={openCreate}>
              <IconPlus className="text-base" />
              {t("newClient")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="relative mb-5 max-w-sm">
            <IconSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <TextInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="!ps-9"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<IconInbox />} title={t("nothingFound")} />
          ) : (
            <div className="grid animate-fade-in gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((client) => {
                const { active, value } = statsFor(client);
                return (
                  <div
                    key={client.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarClass(client.name)}`}
                        >
                          {initials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{client.name}</p>
                          {client.email && (
                            <p className="truncate text-sm text-slate-400">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(client)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                          aria-label={t("editClientAction")}
                        >
                          <IconEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-950/40 hover:text-red-400"
                          aria-label={t("deleteClient")}
                        >
                          <IconTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-slate-800 pt-3 text-xs">
                      <span className="text-slate-400">
                        {`${active} ${t("clientActiveProjects")}`}
                      </span>
                      {value > 0 && (
                        <span className="font-medium text-slate-200">
                          {formatCurrency(value)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t("editClient") : t("newClient")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t("clientName")}>
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label={t("clientEmail")}>
            <TextInput
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label={t("clientPhone")}>
            <TextInput
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
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
