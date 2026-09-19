export type ProjectStatus =
  | "onTrack"
  | "inProgress"
  | "almostDone"
  | "completed"
  | "onHold";

export type TaskStatus = "todo" | "in_progress" | "done";

export type Priority = "low" | "medium" | "high";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id?: string | null;
  name: string;
  budget?: number | null;
  progress: number;
  status: ProjectStatus;
  deadline?: string | null;
  share_token?: string | null;
  created_at: string;
  clients?: Pick<Client, "id" | "name"> | null;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date?: string | null;
  time_spent?: number;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
}

export interface Invoice {
  id: string;
  user_id: string;
  project_id: string | null;
  number: string;
  amount: number;
  status: InvoiceStatus;
  issue_date: string | null;
  due_date: string | null;
  paid_at: string | null;
  notes?: string | null;
  created_at: string;
  projects?: Pick<Project, "id" | "name"> | null;
}

export type Locale = "en" | "fa";

type ActivityEntity = "client" | "project" | "task" | "invoice";
type ActivityAction = "created" | "updated" | "deleted";

export interface ActivityEntry {
  id: string;
  user_id: string;
  entity: ActivityEntity;
  action: ActivityAction;
  summary: string;
  created_at: string;
}
