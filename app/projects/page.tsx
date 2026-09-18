"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  Field,
  TextInput,
  SelectInput,
  Button,
} from "@/components/ui/field";
import { EmptyState, StatusBadge } from "@/components/ui/bits";
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconShare,
  IconFolder,
  IconInbox,
} from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { api, apiErrorKey } from "@/lib/api";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import type { Client, Project, ProjectStatus } from "@/types";

const STATUS_OPTIONS: ProjectStatus[] = [
  "onTrack",
  "inProgress",
  "almostDone",
  "completed",
  "onHold",
];

const emptyForm = {
  name: "",
  client_id: "",
  budget: "",
  deadline: "",
  progress: "0",
  status: "inProgress" as ProjectStatus,
};

export default function ProjectsPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ProjectStatus>("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // Client-portal share modal
  const [shareProject, setShareProject] = useState<Project | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareBusy, setShareBusy] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [projectList, clientList] = await Promise.all([
          api.projects(),
          api.clients(),
        ]);
        if (!cancelled) {
          setProjects(projectList);
          setClients(clientList);
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
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (clientFilter !== "all" && p.client_id !== clientFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.clients?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [projects, query, statusFilter, clientFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      name: project.name,
      client_id: project.client_id ?? "",
      budget: project.budget ? String(project.budget) : "",
      deadline: project.deadline ?? "",
      progress: String(project.progress),
      status: project.status,
    });
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
        client_id: form.client_id || null,
        budget: form.budget ? Number(form.budget) : 0,
        deadline: form.deadline || null,
        progress: Math.max(0, Math.min(100, Number(form.progress) || 0)),
        status: form.status,
      };
      if (editing) {
        await api.updateProject(editing.id, payload);
      } else {
        await api.createProject({ user_id: user.id, ...payload });
      }
      setProjects(await api.projects());
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

  // Debounced DB write for the progress slider (avoids a request per pixel).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  async function updateProgress(project: Project, progress: number) {
    setProjects((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, progress } : p))
    );
    if (timerRef.current) clearTimeout(timerRef.current);
    const { id } = project;
    timerRef.current = setTimeout(async () => {
      try {
        await api.updateProject(id, { progress });
      } catch (err) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, progress: project.progress } : p))
        );
        toast(t(apiErrorKey((err as Error).message)), "error");
      }
    }, 600);
  }

  async function updateStatus(project: Project, status: ProjectStatus) {
    const prev = projects;
    setProjects((list) =>
      list.map((p) => (p.id === project.id ? { ...p, status } : p))
    );
    try {
      await api.updateProject(project.id, { status });
    } catch (err) {
      setProjects(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  async function handleDelete(project: Project) {
    const ok = await confirm(t("confirmDeleteProject"));
    if (!ok) return;

    const prev = projects;
    setProjects((list) => list.filter((p) => p.id !== project.id));
    try {
      await api.deleteProject(project.id);
      toast(t("saved"), "success");
    } catch (err) {
      setProjects(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  async function handleShare(project: Project) {
    setShareProject(project);
    setShareLink(null);
    setShareBusy(true);
    setShareError("");
    try {
      const token = project.share_token
        ? project.share_token
        : await api.ensureShareToken(project.id);
      setShareLink(`${window.location.origin}/portal/${token}`);
    } catch (err) {
      setShareError(t(apiErrorKey((err as Error).message)));
    } finally {
      setShareBusy(false);
    }
  }

  async function handleRegenerate() {
    if (!shareProject) return;
    setShareBusy(true);
    setShareError("");
    try {
      const token = await api.rotateShareToken(shareProject.id);
      setShareLink(`${window.location.origin}/portal/${token}`);
    } catch (err) {
      setShareError(t(apiErrorKey((err as Error).message)));
    } finally {
      setShareBusy(false);
    }
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("projectsTitle")}
          </h1>
          <p className="mt-2 text-slate-400">
            {t("projectsSubtitle")}
          </p>
        </div>
        <Button onClick={openCreate}>
          <IconPlus className="text-base" />
          {t("newProject")}
        </Button>
      </header>

      {loading ? (
        <div className="animate-fade-in space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton mt-4 h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<IconFolder />}
          title={t("noProjectsYet")}
          action={
            <Button onClick={openCreate}>
              <IconPlus className="text-base" />
              {t("newProject")}
            </Button>
          }
        />
      ) : (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <div className="relative min-w-52 flex-1 max-w-xs">
              <IconSearch className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <TextInput
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search")}
                className="!ps-9"
              />
            </div>
            <SelectInput
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | ProjectStatus)
              }
              className="!w-auto"
            >
              <option value="all">{t("allStatuses")}</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="!w-auto"
            >
              <option value="all">{t("allClients")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={<IconInbox />} title={t("nothingFound")} />
          ) : (
            <div className="animate-fade-in space-y-4">
              {filtered.map((project) => {
                const overdue =
                  isOverdue(project.deadline) && project.status !== "completed";
                return (
                  <div
                    key={project.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-soft transition hover:shadow-lg"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{project.name}</p>
                          <StatusBadge status={project.status} label={t(project.status)} />
                        </div>
                        <p className="mt-1 text-sm text-slate-400">
                          {project.clients?.name ?? t("noClientOption")}
                          {typeof project.budget === "number" && project.budget > 0
                            ? ` · ${formatCurrency(project.budget)}`
                            : ""}
                          {project.deadline
                            ? ` · ${formatDate(project.deadline)}`
                            : ""}
                          {overdue && (
                            <span className="ms-1 font-medium text-red-500">
                              ({t("overdueTask")})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="hidden sm:block">
                          <SelectInput
                            value={project.status}
                            onChange={(e) =>
                              updateStatus(project, e.target.value as ProjectStatus)
                            }
                            className="!w-auto !py-1.5 text-xs"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {t(s)}
                              </option>
                            ))}
                          </SelectInput>
                        </div>
                        <button
                          onClick={() => handleShare(project)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-indigo-300"
                          title={t("portalShare")}
                          aria-label={t("portalShare")}
                        >
                          <IconShare className="text-sm" />
                        </button>
                        <button
                          onClick={() => openEdit(project)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                          aria-label={t("editProject")}
                        >
                          <IconEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(project)}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-red-950/40 hover:text-red-400"
                          aria-label={t("deleteProject")}
                        >
                          <IconTrash className="text-sm" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>{t("projectProgress")}</span>
                        <span className="font-medium">{`${project.progress}%`}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={project.progress}
                        onChange={(e) =>
                          updateProgress(project, Number(e.target.value))
                        }
                        aria-label={t("projectProgress")}
                        className="w-full accent-indigo-500"
                      />
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
        title={editing ? t("editProject") : t("newProject")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t("projectName")}>
            <TextInput
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label={t("projectClient")}>
            <SelectInput
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            >
              <option value="">{t("noClientOption")}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("projectBudget")}>
              <TextInput
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </Field>
            <Field label={t("projectDeadline")}>
              <TextInput
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </Field>
          </div>
          <Field label={t("projectStatus")}>
            <SelectInput
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ProjectStatus })
              }
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </SelectInput>
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

      {/* Client portal share modal */}
      <Modal
        open={shareProject !== null}
        onClose={() => setShareProject(null)}
        title={t("portalShare")}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">{t("portalShareDesc")}</p>
          {shareError && <p className="text-sm text-red-400">{shareError}</p>}
          {shareBusy && !shareLink ? (
            <div className="skeleton h-10 w-full rounded-lg" />
          ) : shareLink ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2">
              <input
                readOnly
                dir="ltr"
                value={shareLink}
                className="min-w-0 flex-1 bg-transparent text-xs text-slate-300 outline-none"
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(shareLink);
                    toast(t("portalCopied"), "success");
                  } catch {
                    /* clipboard blocked — user can still select manually */
                  }
                }}
                className="shrink-0 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
              >
                {t("portalCopy")}
              </button>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={shareBusy}
              className="text-xs text-slate-400 underline-offset-2 transition hover:text-indigo-400 hover:underline disabled:opacity-50"
            >
              {t("portalRegenerate")}
            </button>
            <a
              href={shareLink ?? "#"}
              target="_blank"
              rel="noreferrer"
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                shareLink
                  ? "bg-indigo-600 text-white hover:bg-indigo-500"
                  : "pointer-events-none bg-slate-800 text-slate-500"
              }`}
            >
              {t("portalOpen")}
            </a>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
