import { supabase } from "@/lib/supabase";
import type { TranslationKey } from "@/lib/translations";
import type { Client, Project, Task, Invoice } from "@/types";

/** Human-readable Supabase/Postgres error → message key. */
export function apiErrorKey(message: string | null | undefined): TranslationKey {
  const m = (message ?? "").toLowerCase();
  if (m.includes("failed to fetch") || m.includes("network"))
    return "errorNetwork";
  if (m.includes("invalid login") || m.includes("invalid credentials"))
    return "errorInvalidLogin";
  if (m.includes("email not confirmed")) return "errorEmailNotConfirmed";
  if (m.includes("already registered") || m.includes("already exists"))
    return "errorEmailTaken";
  if (m.includes("rate limit")) return "errorRateLimit";
  if (m.includes("row-level security") || m.includes("permission"))
    return "errorPermission";
  if (m.includes("duplicate key")) return "errorDuplicate";
  return "genericError";
}

export const api = {
  async clients(): Promise<Client[]> {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Client[];
  },

  async createClient(input: {
    user_id: string;
    name: string;
    email: string | null;
    phone: string | null;
  }) {
    const { error } = await supabase.from("clients").insert(input);
    if (error) throw error;
  },

  async updateClient(id: string, patch: Partial<Client>) {
    const { error } = await supabase
      .from("clients")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) throw error;
  },

  async projects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(id, name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Project[];
  },

  async createProject(input: {
    user_id: string;
    name: string;
    client_id: string | null;
    budget: number;
    deadline: string | null;
    progress: number;
    status: Project["status"];
  }) {
    const { error } = await supabase.from("projects").insert(input);
    if (error) throw error;
  },

  async updateProject(id: string, patch: Partial<Project>) {
    const { error } = await supabase
      .from("projects")
      .update(patch)
      .eq("id", id);
    if (error) throw error;
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  async tasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, projects(id, name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Task[];
  },

  async createTask(input: {
    user_id: string;
    project_id: string;
    title: string;
    description: string | null;
    priority: Task["priority"];
    due_date: string | null;
    status: Task["status"];
  }) {
    const { error } = await supabase.from("tasks").insert(input);
    if (error) throw error;
  },

  async updateTask(id: string, patch: Partial<Task>) {
    const { error } = await supabase.from("tasks").update(patch).eq("id", id);
    if (error) throw error;
  },

  async deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
  },

  // ---- Invoices ----
  async invoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, projects(id, name)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as Invoice[];
  },

  async createInvoice(input: {
    user_id: string;
    project_id: string | null;
    number: string;
    amount: number;
    status: Invoice["status"];
    issue_date: string | null;
    due_date: string | null;
    notes: string | null;
  }) {
    const { error } = await supabase.from("invoices").insert(input);
    if (error) throw error;
  },

  async updateInvoice(id: string, patch: Partial<Invoice>) {
    const { error } = await supabase.from("invoices").update(patch).eq("id", id);
    if (error) throw error;
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) throw error;
  },

  // ---- Client portal ----
  async ensureShareToken(projectId: string) {
    const { data, error } = await supabase.rpc("ensure_share_token", {
      p_project_id: projectId,
    });
    if (error) throw error;
    return data as string;
  },

  async rotateShareToken(projectId: string) {
    const { data, error } = await supabase.rpc("rotate_share_token", {
      p_project_id: projectId,
    });
    if (error) throw error;
    return data as string;
  },
};
