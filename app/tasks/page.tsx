"use client";

import {
  useEffect,
  useMemo,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { AppShell } from "@/components/app-shell";
import { Modal } from "@/components/ui/modal";
import {
  Field,
  TextInput,
  SelectInput,
  TextArea,
  Button,
} from "@/components/ui/field";
import {
  PriorityBadge,
  TASK_COLUMN_ACCENT,
} from "@/components/ui/bits";
import {
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconClock,
  IconAlert,
  IconPlay,
  IconPause,
} from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm";
import { api, apiErrorKey } from "@/lib/api";
import { isOverdue, relativeDays } from "@/lib/utils";
import type { Priority, Project, Task, TaskStatus } from "@/types";

const COLUMNS: {
  status: TaskStatus;
  labelKey: "colTodo" | "colInProgress" | "colDone";
}[] = [
  { status: "todo", labelKey: "colTodo" },
  { status: "in_progress", labelKey: "colInProgress" },
  { status: "done", labelKey: "colDone" },
];

const PRIORITY_LABELS = {
  low: "priorityLow",
  medium: "priorityMedium",
  high: "priorityHigh",
} as const;

const emptyForm = {
  title: "",
  description: "",
  project_id: "",
  priority: "medium" as Priority,
  due_date: "",
  status: "todo" as TaskStatus,
};

export default function TasksPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  // ---- Time tracking ----
  const [runningId, setRunningId] = useState<string | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);

  useEffect(() => {
    if (runningId === null) return;
    const iv = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [runningId]);

  async function toggleTimer(task: Task) {
    if (runningId === task.id) {
      // Stop: commit the elapsed minutes to the task.
      const minutes = Math.round(elapsedSecs / 60);
      setRunningId(null);
      setElapsedSecs(0);
      if (minutes > 0) {
        try {
          await api.updateTask(task.id, {
            time_spent: (task.time_spent ?? 0) + minutes,
          });
          setTasks((list) =>
            list.map((tsk) =>
              tsk.id === task.id
                ? { ...tsk, time_spent: (tsk.time_spent ?? 0) + minutes }
                : tsk
            )
          );
        } catch (err) {
          toast(t(apiErrorKey((err as Error).message)), "error");
        }
      }
      return;
    }

    // Switching tasks: commit the previous one first.
    if (runningId !== null) {
      const prev = tasks.find((tsk) => tsk.id === runningId);
      const minutes = Math.round(elapsedSecs / 60);
      if (prev && minutes > 0) {
        try {
          await api.updateTask(prev.id, {
            time_spent: (prev.time_spent ?? 0) + minutes,
          });
        } catch {
          /* keep going — don't block the new timer */
        }
      }
    }
    setRunningId(task.id);
    setElapsedSecs(0);
  }

  function elapsedLabel(): string | null {
    if (runningId === null) return null;
    const h = Math.floor(elapsedSecs / 3600);
    const m = Math.floor((elapsedSecs % 3600) / 60);
    const s = elapsedSecs % 60;
    return `${h > 0 ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function totalLabel(task: Task): string | null {
    const mins = task.time_spent ?? 0;
    if (mins <= 0) return null;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h} ساعت و ${m} دقیقه` : `${m} دقیقه`;
  }

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const [taskList, projectList] = await Promise.all([
          api.tasks(),
          api.projects(),
        ]);
        if (!cancelled) {
          setTasks(taskList);
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

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      project_id: task.project_id,
      priority: task.priority,
      due_date: task.due_date ?? "",
      status: task.status,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !form.project_id) return;
    setSaving(true);
    setError("");

    try {
      const payload = {
        project_id: form.project_id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        due_date: form.due_date || null,
        status: form.status,
      };
      if (editing) {
        await api.updateTask(editing.id, payload);
      } else {
        await api.createTask({ user_id: user.id, ...payload, status: "todo" });
      }
      setTasks(await api.tasks());
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

  async function moveTask(task: Task, nextStatus: TaskStatus) {
    if (task.status === nextStatus) return;
    const prev = tasks;
    setTasks((list) =>
      list.map((tsk) => (tsk.id === task.id ? { ...tsk, status: nextStatus } : tsk))
    );
    try {
      await api.updateTask(task.id, { status: nextStatus });
    } catch (err) {
      setTasks(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  function onDragStart(e: DragEvent, task: Task) {
    setDragId(task.id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.id);
  }

  function onDragOver(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  }

  function onDrop(e: DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("text/plain") || dragId;
    const task = tasks.find((tsk) => tsk.id === id);
    setDragId(null);
    if (task) moveTask(task, status);
  }

  async function handleDelete(task: Task) {
    const ok = await confirm(t("deleteTask") + "?");
    if (!ok) return;

    const prev = tasks;
    setTasks((list) => list.filter((tsk) => tsk.id !== task.id));
    try {
      await api.deleteTask(task.id);
      toast(t("saved"), "success");
    } catch (err) {
      setTasks(prev);
      toast(t(apiErrorKey((err as Error).message)), "error");
    }
  }

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {t("tasksTitle")}
          </h1>
          <p className="mt-2 text-slate-400">
            {t("tasksSubtitle")}
          </p>
        </div>
        <Button
          onClick={openCreate}
          disabled={projects.length === 0}
          title={projects.length === 0 ? t("selectProjectFirst") : undefined}
        >
          <IconPlus className="text-base" />
          {t("newTask")}
        </Button>
      </header>

      {projects.length === 0 && !loading && (
        <p className="mb-4 text-sm text-slate-500">{t("selectProjectFirst")}</p>
      )}

      {loading ? (
        <div className="grid animate-fade-in gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="skeleton h-4 w-24" />
              <div className="skeleton mt-4 h-24 w-full" />
              <div className="skeleton mt-3 h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const isDragOver = dragOverCol === col.status && dragId !== null;
            return (
              <div
                key={col.status}
                onDragOver={(e) => onDragOver(e, col.status)}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol(null);
                  }
                }}
                onDrop={(e) => onDrop(e, col.status)}
                className={`rounded-2xl border bg-slate-900 p-4 transition ${
                  isDragOver
                    ? "border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/20"
                    : "border-slate-800"
                }`}
              >
                <div className="mb-4 flex items-center gap-2">
                  <span
                    className={`size-2 rounded-full ${TASK_COLUMN_ACCENT[col.status]}`}
                  />
                  <h2 className="text-sm font-semibold">{t(col.labelKey)}</h2>
                  <span className="ms-auto rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    {grouped[col.status].length}
                  </span>
                </div>

                <div className="space-y-3">
                  {grouped[col.status].length === 0 && (
                    <p
                      className={`rounded-lg border border-dashed p-4 text-center text-xs transition ${
                        isDragOver
                          ? "border-indigo-500 text-indigo-400"
                          : "border-slate-700 text-slate-500"
                      }`}
                    >
                      {isDragOver ? t("dropHere") : t("noTasksInColumn")}
                    </p>
                  )}

                  {grouped[col.status].map((task) => {
                    const overdue =
                      isOverdue(task.due_date) && task.status !== "done";
                    const dragging = dragId === task.id;
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task)}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOverCol(null);
                        }}
                        className={`group cursor-grab rounded-xl border border-slate-800 bg-slate-950 p-3 transition active:cursor-grabbing ${
                          dragging
                            ? "opacity-40"
                            : "hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              task.status === "done"
                                ? "text-slate-500 line-through"
                                : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <PriorityBadge
                            priority={task.priority}
                            label={t(PRIORITY_LABELS[task.priority])}
                          />
                        </div>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                            {task.description}
                          </p>
                        )}

                        <p className="mt-1.5 truncate text-xs text-slate-400">
                          {task.projects?.name}
                          {totalLabel(task) && ` · ⏱ ${totalLabel(task)}`}
                        </p>

                        <p
                          className={`mt-1.5 inline-flex items-center gap-1 text-xs ${
                            overdue
                              ? "font-medium text-red-500"
                              : "text-slate-500"
                          }`}
                        >
                          {overdue ? (
                            <IconAlert className="text-xs" />
                          ) : (
                            <IconClock className="text-xs" />
                          )}
                          {task.due_date
                            ? relativeDays(task.due_date)
                            : t("noDueDate")}
                        </p>

                        <div className="mt-2 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleTimer(task)}
                              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium transition ${
                                runningId === task.id
                                  ? "bg-emerald-950/50 text-emerald-400 ring-1 ring-emerald-500/40"
                                  : "text-slate-500 hover:bg-slate-800 hover:text-indigo-300"
                              }`}
                              title={runningId === task.id ? t("timerStop") : t("timerStart")}
                              aria-label={runningId === task.id ? t("timerStop") : t("timerStart")}
                            >
                              {runningId === task.id ? (
                                <>
                                  <IconPause className="text-[10px]" />
                                  {elapsedLabel()}
                                </>
                              ) : (
                                <IconPlay className="text-[10px]" />
                              )}
                            </button>
                            <button
                              onClick={() => openEdit(task)}
                              className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                              aria-label={t("editTask")}
                            >
                              <IconEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDelete(task)}
                              className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-950/40 hover:text-red-400"
                              aria-label={t("deleteTask")}
                            >
                              <IconTrash className="text-xs" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              moveTask(
                                task,
                                col.status === "todo"
                                  ? "in_progress"
                                  : col.status === "in_progress"
                                    ? "done"
                                    : "in_progress"
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-indigo-400 ring-1 ring-slate-700 transition hover:bg-slate-800"
                          >
                            <IconCheck className="text-xs" />
                            {col.status === "in_progress" ? t("colDone") : t("moveNext")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? t("editTask") : t("newTask")}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label={t("taskTitle")}>
            <TextInput
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label={t("taskDescriptionLabel")}>
            <TextArea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label={t("taskProject")}>
            <SelectInput
              required
              value={form.project_id}
              onChange={(e) => setForm({ ...form, project_id: e.target.value })}
            >
              <option value="" disabled>
                —
              </option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </SelectInput>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("taskPriority")}>
              <SelectInput
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value as Priority })
                }
              >
                <option value="low">{t("priorityLow")}</option>
                <option value="medium">{t("priorityMedium")}</option>
                <option value="high">{t("priorityHigh")}</option>
              </SelectInput>
            </Field>
            <Field label={t("taskDueDate")}>
              <TextInput
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </Field>
          </div>
          {editing && (
            <Field label={t("projectStatus")}>
              <SelectInput
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as TaskStatus })
                }
              >
                {COLUMNS.map((c) => (
                  <option key={c.status} value={c.status}>
                    {t(c.labelKey)}
                  </option>
                ))}
              </SelectInput>
            </Field>
          )}
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
