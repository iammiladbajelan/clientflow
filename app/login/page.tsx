"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLocale } from "@/contexts/locale-context";
import { TextInput, PrimaryButton } from "@/components/ui/field";
import { apiErrorKey } from "@/lib/api";
import { IconCheckCircle } from "@/components/icons";

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary for static prerendering.
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Landing CTA links here with ?mode=signup to open the registration form.
  const [isRegister, setIsRegister] = useState(
    () => searchParams.get("mode") === "signup"
  );
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    const result = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setSubmitting(false);

    if (result.error) {
      setMessage({ type: "error", text: t(apiErrorKey(result.error.message)) });
      return;
    }

    if (isRegister) {
      setMessage({ type: "success", text: t("checkEmail") });
    }
    // On sign-in success, AuthProvider's listener picks up the session
    // and redirects to "/dashboard" automatically.
  }

  const heroPoints = [t("heroPoint1"), t("heroPoint2"), t("heroPoint3")];

  return (
    <main dir="rtl" className="flex min-h-screen bg-slate-950">
      {/* Brand hero (desktop only) */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex">
        <div
          aria-hidden
          className="absolute -top-32 -end-32 size-96 rounded-full bg-indigo-600/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -start-24 size-80 rounded-full bg-violet-600/20 blur-3xl"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-black shadow-lg shadow-indigo-600/40">
            CF
          </span>
          <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-4xl font-bold leading-tight tracking-tight">
            {t("heroLine1")}{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              {t("heroLine2")}
            </span>
          </h1>
          <p className="mt-4 max-w-md text-slate-400">{t("heroDesc")}</p>

          <ul className="mt-8 space-y-3">
            {heroPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm text-slate-300">
                <IconCheckCircle className="text-lg text-indigo-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} {t("appName")}
        </p>
      </div>

      {/* Form side */}
      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-black text-white shadow-lg shadow-indigo-600/40">
              CF
            </div>
            <div className="text-xl font-bold">{t("appName")}</div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="animate-slide-up space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-soft"
          >
            <div>
              <h1 className="text-xl font-bold">
                {isRegister ? t("createAccount") : t("welcomeBack")}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {isRegister ? t("createAccountSubtitle") : t("welcomeSubtitle")}
              </p>
            </div>

            <TextInput
              type="email"
              required
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <TextInput
              type="password"
              required
              minLength={6}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
            />

            <PrimaryButton type="submit" disabled={submitting}>
              {submitting ? t("saving") : isRegister ? t("register") : t("login")}
            </PrimaryButton>

            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setMessage(null);
              }}
              className="w-full text-center text-sm text-slate-400 underline-offset-2 transition hover:text-indigo-400 hover:underline"
            >
              {isRegister ? t("haveAccount") : t("noAccount")}
            </button>

            {message && (
              <p
                role="status"
                className={`rounded-lg p-3 text-center text-sm ${
                  message.type === "error"
                    ? "bg-red-950/50 text-red-300"
                    : "bg-emerald-950/50 text-emerald-300"
                }`}
              >
                {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
}
