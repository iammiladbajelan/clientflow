"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";
import { Field, TextInput, Button } from "@/components/ui/field";
import { IconUsers, IconMail, IconGlobe } from "@/components/icons";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase";
import { apiErrorKey } from "@/lib/api";

export default function SettingsPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordsDontMatch"));
      return;
    }

    setSaving(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (err) {
      setError(t(apiErrorKey(err.message)));
    } else {
      setMessage(t("passwordUpdated"));
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("settingsTitle")}
        </h1>
        <p className="mt-2 text-slate-400">{t("settingsSubtitle")}</p>
      </header>

      {/* Account info */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-indigo-950/60 text-indigo-400">
            <IconUsers />
          </span>
          <h2 className="text-lg font-bold">{t("account")}</h2>
        </div>

        <div className="space-y-4">
          <Field label={t("email")}>
            <div className="relative">
              <IconMail className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <TextInput
                value={user?.email ?? ""}
                readOnly
                disabled
                className="pe-10"
              />
            </div>
          </Field>

          <Field label={t("language")} hint={t("languageDesc")}>
            <div className="relative">
              <IconGlobe className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <TextInput value="فارسی" readOnly disabled className="pe-10" />
            </div>
          </Field>
        </div>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-5 text-lg font-bold">{t("changePassword")}</h2>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Field label={t("newPassword")}>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </Field>

          <Field label={t("confirmPassword")}>
            <TextInput
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </Field>

          {message && (
            <p className="rounded-lg bg-emerald-950/60 px-3 py-2 text-sm text-emerald-300">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-red-950/60 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? t("saving") : t("saveChanges")}
          </Button>
        </form>
      </section>
      </div>
    </AppShell>
  );
}
