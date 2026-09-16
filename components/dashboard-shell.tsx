"use client";

import { useState } from "react";
import { useTheme } from "next-themes";

const translations = {
  en: {
    dashboard: "Dashboard",
    projects: "Projects",
    clients: "Clients",
    tasks: "Tasks",
    invoices: "Invoices",
    settings: "Settings",
    goodMorning: "Good morning 👋",
    overview: "Here's what's happening with your business.",
    newProject: "+ New Project",
    activeClients: "Active Clients",
    activeProjects: "Active Projects",
    pendingTasks: "Pending Tasks",
    outstanding: "Outstanding",
    thisMonth: "this month",
    overdue: "overdue",
    invoicesCount: "invoices",
    yourProjects: "Your current projects",
    viewAll: "View all",
    upcomingTasks: "Upcoming Tasks",
    taskDescription: "Things that need your attention",
    due: "Due",
    onTrack: "On track",
    inProgress: "In progress",
    almostDone: "Almost done",
  },

  fa: {
    dashboard: "داشبورد",
    projects: "پروژه‌ها",
    clients: "مشتریان",
    tasks: "کارها",
    invoices: "فاکتورها",
    settings: "تنظیمات",
    goodMorning: "صبح بخیر 👋",
    overview: "این نمای کلی وضعیت کسب‌وکار شماست.",
    newProject: "+ پروژه جدید",
    activeClients: "مشتریان فعال",
    activeProjects: "پروژه‌های فعال",
    pendingTasks: "کارهای در انتظار",
    outstanding: "مطالبات",
    thisMonth: "این ماه",
    overdue: "عقب‌افتاده",
    invoicesCount: "فاکتور",
    yourProjects: "پروژه‌های فعلی شما",
    viewAll: "مشاهده همه",
    upcomingTasks: "کارهای پیش‌رو",
    taskDescription: "کارهایی که نیاز به توجه شما دارند",
    due: "مهلت",
    onTrack: "طبق برنامه",
    inProgress: "در حال انجام",
    almostDone: "تقریباً تمام شده",
  },
};

const stats = [
  { key: "activeClients", value: "12", change: "+2" },
  { key: "activeProjects", value: "8", change: "+3" },
  { key: "pendingTasks", value: "14", change: "4" },
  { key: "outstanding", value: "$4,200", change: "3" },
];

const projects = [
  {
    name: "Website Redesign",
    client: "Acme Inc.",
    progress: 75,
    status: "onTrack",
  },
  {
    name: "Mobile App",
    client: "Nova Studio",
    progress: 45,
    status: "inProgress",
  },
  {
    name: "Landing Page",
    client: "Bright Labs",
    progress: 90,
    status: "almostDone",
  },
];

const tasks = [
  {
    title: "Finish homepage design",
    project: "Website Redesign",
    due: "Today",
  },
  {
    title: "Fix mobile navigation",
    project: "Mobile App",
    due: "Tomorrow",
  },
  {
    title: "Send invoice",
    project: "Landing Page",
    due: "Sep 18",
  },
];

export default function DashboardShell() {
  const [locale, setLocale] = useState<"en" | "fa">("en");
  const { theme, setTheme } = useTheme();

  const t = translations[locale];
  const isRTL = locale === "fa";
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white"
    >

      <button
  onClick={() => setMenuOpen(true)}
  className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 md:hidden"
>
  ☰ Menu
</button>
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 md:block">
        <div className="mb-8 text-2xl font-bold">ClientFlow</div>

        <nav className="space-y-2">
          {[
            t.dashboard,
            t.projects,
            t.clients,
            t.tasks,
            t.invoices,
          ].map((item, index) => (
            <button
              key={item}
              className={`w-full rounded-lg px-4 py-3 text-sm ${
                index === 0
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        <button className="mt-4 w-full rounded-lg px-4 py-3 text-start text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          {t.settings}
        </button>
      </aside>

      {menuOpen && (
  <div className="fixed inset-0 z-50 md:hidden">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMenuOpen(false)}
    />

    <aside
      className={`absolute top-0 h-full w-72 bg-white p-5 dark:bg-gray-900 ${
        isRTL ? "right-0" : "left-0"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <div className="text-2xl font-bold">ClientFlow</div>

        <button
          onClick={() => setMenuOpen(false)}
          className="rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          ✕
        </button>
      </div>

      <nav className="space-y-2">
        {[t.dashboard, t.projects, t.clients, t.tasks, t.invoices].map(
          (item, index) => (
            <button
              key={item}
              onClick={() => setMenuOpen(false)}
              className={`w-full rounded-lg px-4 py-3 text-sm ${
                index === 0
                  ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {item}
            </button>
          )
        )}
      </nav>
    </aside>
  </div>
)}

      {/* Main */}
      <main className="flex-1 p-6 md:p-8">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              {locale === "en" ? "Tuesday, September 15" : "سه‌شنبه، ۲۴ شهریور"}
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {t.goodMorning}
            </h1>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              {t.overview}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setLocale(locale === "en" ? "fa" : "en")
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {locale === "en" ? "فارسی" : "English"}
            </button>

            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-gray-900">
              {t.newProject}
            </button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t[stat.key as keyof typeof t]}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {stat.key === "outstanding"
                  ? `${stat.change} ${t.invoicesCount}`
                  : `${stat.change} ${t.thisMonth}`}
              </p>
            </div>
          ))}
        </section>

        {/* Projects + Tasks */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Projects */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {t.activeProjects}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t.yourProjects}
                </p>
              </div>

              <button className="text-sm font-medium hover:underline">
                {t.viewAll}
              </button>
            </div>

            <div className="space-y-5">
              {projects.map((project) => (
                <div key={project.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {project.client}
                      </p>
                    </div>

                    <span className="text-sm text-gray-500">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-gray-900 dark:bg-white"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {t[project.status as keyof typeof t]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                {t.upcomingTasks}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t.taskDescription}
              </p>
            </div>

            <div className="space-y-5">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800"
                >
                  <p className="font-medium">{task.title}</p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {task.project}
                  </p>

                  <p className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t.due}: {task.due}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}