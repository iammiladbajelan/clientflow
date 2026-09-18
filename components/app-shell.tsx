"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import {
  IconGrid,
  IconUsers,
  IconFolder,
  IconCheck,
  IconInvoice,
  IconSettings,
  IconLogout,
  IconMenu,
  IconX,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard" as const, icon: IconGrid },
  { href: "/clients", labelKey: "clients" as const, icon: IconUsers },
  { href: "/projects", labelKey: "projects" as const, icon: IconFolder },
  { href: "/tasks", labelKey: "tasks" as const, icon: IconCheck },
  { href: "/invoices", labelKey: "invoices" as const, icon: IconInvoice },
  { href: "/settings", labelKey: "settings" as const, icon: IconSettings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-indigo-500/15 text-indigo-300"
                : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            }`}
          >
            <Icon className="text-base" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function UserBlock({ onLogout }: { onLogout?: () => void }) {
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <div className="space-y-2 border-t border-slate-800 pt-3">
      {user?.email && (
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-xs font-bold text-indigo-300">
            {user.email.slice(0, 2).toUpperCase()}
          </div>
          <p className="truncate text-xs text-slate-400" title={user.email}>
            {user.email}
          </p>
        </div>
      )}
      <button
        onClick={async () => {
          onLogout?.();
          await logout();
        }}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-300 transition hover:bg-red-950/40 hover:text-red-400"
      >
        <IconLogout className="text-base" />
        {t("logout")}
      </button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-slate-800 bg-slate-900 p-4 md:flex">
        <Link href="/dashboard" className="mb-6 mt-1 flex items-center gap-2.5 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-600/30">
            CF
          </span>
          <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
        </Link>

        <div className="flex-1">
          <NavLinks />
        </div>

        <UserBlock />
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 animate-fade-in bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex h-full w-72 flex-col border-s border-slate-800 bg-slate-900 p-4 shadow-2xl">
            <div className="mb-6 mt-1 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white">
                  CF
                </span>
                <span className="text-lg font-bold">{t("appName")}</span>
              </div>
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-slate-800"
                aria-label={t("close")}
              >
                <IconX />
              </button>
            </div>
            <NavLinks onNavigate={() => setMenuOpen(false)} />
            <div className="mt-auto">
              <UserBlock onLogout={() => setMenuOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-end gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 backdrop-blur md:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-800 md:hidden"
            aria-label={t("menu")}
          >
            <IconMenu className="text-lg" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
