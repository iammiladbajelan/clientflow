const stats = [
  {
    label: "Active Clients",
    value: "12",
    change: "+2 this month",
  },
  {
    label: "Active Projects",
    value: "8",
    change: "+3 this month",
  },
  {
    label: "Pending Tasks",
    value: "14",
    change: "4 overdue",
  },
  {
    label: "Outstanding",
    value: "$4,200",
    change: "3 invoices",
  },
];

const projects = [
  {
    name: "Website Redesign",
    client: "Acme Inc.",
    progress: 75,
    status: "On track",
  },
  {
    name: "Mobile App",
    client: "Nova Studio",
    progress: 45,
    status: "In progress",
  },
  {
    name: "Landing Page",
    client: "Bright Labs",
    progress: 90,
    status: "Almost done",
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

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Tuesday, September 15</p>

            <h1 className="mt-1 text-3xl font-bold">
              Good morning 👋
            </h1>

            <p className="mt-2 text-gray-500">
              Here&apos;s what&apos;s happening with your business.
            </p>
          </div>

          <button className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800">
            + New Project
          </button>
        </header>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>

              <p className="mt-2 text-3xl font-bold">
                {stat.value}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {stat.change}
              </p>
            </div>
          ))}
        </section>

        {/* Main content */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Projects */}
          <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Active Projects
                </h2>

                <p className="text-sm text-gray-500">
                  Your current projects
                </p>
              </div>

              <button className="text-sm font-medium text-gray-700 hover:underline">
                View all
              </button>
            </div>

            <div className="space-y-5">
              {projects.map((project) => (
                <div key={project.name}>
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        {project.client}
                      </p>
                    </div>

                    <span className="text-sm text-gray-500">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-gray-900"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    {project.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">
                Upcoming Tasks
              </h2>

              <p className="text-sm text-gray-500">
                Things that need your attention
              </p>
            </div>

            <div className="space-y-5">
              {tasks.map((task) => (
                <div
                  key={task.title}
                  className="border-b border-gray-100 pb-4 last:border-0"
                >
                  <p className="font-medium">{task.title}</p>

                  <p className="mt-1 text-sm text-gray-500">
                    {task.project}
                  </p>

                  <p className="mt-2 text-xs font-medium text-gray-700">
                    Due: {task.due}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}