"use client";

import Link from "next/link";
import { useLocale } from "@/contexts/locale-context";
import { useAuth } from "@/contexts/auth-context";
import {
  IconUsers,
  IconFolder,
  IconCheck,
  IconWallet,
  IconMoon,
  IconCheckCircle,
  IconArrow,
  IconStar,
  IconChevronDown,
  IconClock,
  IconMail,
  IconPlus,
} from "@/components/icons";

function Logo() {
  const { t } = useLocale();
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-black text-white shadow-md shadow-indigo-600/30">
        CF
      </span>
      <span className="text-lg font-bold tracking-tight">{t("appName")}</span>
    </Link>
  );
}

function HeroMockup() {
  const { t } = useLocale();
  return (
    <div className="relative w-full max-w-lg">
      {/* glow */}
      <div
        aria-hidden
        className="absolute -inset-6 rounded-3xl bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-transparent blur-2xl"
      />
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-soft">
        {/* window bar */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 bg-slate-950/60 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
          <span className="ms-3 h-4 flex-1 rounded bg-slate-800" />
        </div>

        <div className="flex">
          {/* mini sidebar */}
          <div className="hidden w-32 shrink-0 flex-col gap-2 border-e border-slate-800 p-3 sm:flex">
            {[
              { icon: <IconUsers className="text-xs" />, w: "w-16" },
              { icon: <IconFolder className="text-xs" />, w: "w-20" },
              { icon: <IconCheck className="text-xs" />, w: "w-14" },
              { icon: <IconWallet className="text-xs" />, w: "w-16" },
            ].map((row, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1.5 text-slate-500 ${
                  i === 1 ? "bg-indigo-500/15 text-indigo-300" : ""
                }`}
              >
                {row.icon}
                <span className={`h-1.5 rounded bg-current opacity-30 ${row.w}`} />
              </div>
            ))}
          </div>

          {/* content */}
          <div className="flex-1 space-y-4 p-4">
            <div>
              <p className="text-sm font-semibold">{t("landingMockTitle")}</p>
              <p className="mt-0.5 text-xs text-slate-400">{t("landingMockSub")}</p>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {["۶۸٪", "۴,۸۰۰$", "۷", "۲"].map((v, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-2.5"
                >
                  <p className="text-sm font-bold">{v}</p>
                  <div className="mt-1.5 h-1.5 w-10 rounded bg-slate-700" />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg bg-indigo-600 px-3 py-2 text-white">
              <span className="flex items-center gap-1.5 text-[11px] font-medium">
                <IconPlus className="text-xs" />
                {t("newProject")}
              </span>
              <IconArrow className="text-xs rtl:-scale-x-100" />
            </div>
          </div>
        </div>
      </div>

      {/* floating done card */}
      <div className="absolute -bottom-5 -end-4 hidden animate-slide-up items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 shadow-soft sm:flex">
        <IconCheckCircle className="text-lg text-emerald-400" />
        <div>
          <p className="text-[11px] font-semibold leading-tight">Landing page</p>
          <p className="text-[10px] text-slate-400">Done ✓</p>
        </div>
      </div>
    </div>
  );
}

const PRICING_PLANS = [
  {
    nameKey: "pricingFreeName",
    priceKey: "pricingFreePrice",
    periodKey: "pricingFreePeriod",
    descKey: "pricingFreeDesc",
    features: ["pricingFreeF1", "pricingFreeF2", "pricingFreeF3", "pricingFreeF4"],
    highlighted: false,
  },
  {
    nameKey: "pricingProName",
    priceKey: "pricingProPrice",
    periodKey: "pricingProPeriod",
    descKey: "pricingProDesc",
    features: ["pricingProF1", "pricingProF2", "pricingProF3", "pricingProF4"],
    highlighted: true,
  },
  {
    nameKey: "pricingAgencyName",
    priceKey: "pricingAgencyPrice",
    periodKey: "pricingAgencyPeriod",
    descKey: "pricingAgencyDesc",
    features: ["pricingAgencyF1", "pricingAgencyF2", "pricingAgencyF3", "pricingAgencyF4"],
    highlighted: false,
  },
] as const;

const TESTIMONIALS = [
  { quoteKey: "testi1Quote", nameKey: "testi1Name", roleKey: "testi1Role" },
  { quoteKey: "testi2Quote", nameKey: "testi2Name", roleKey: "testi2Role" },
  { quoteKey: "testi3Quote", nameKey: "testi3Name", roleKey: "testi3Role" },
] as const;

const FAQ_ITEMS = [
  { qKey: "faqQ1", aKey: "faqA1" },
  { qKey: "faqQ2", aKey: "faqA2" },
  { qKey: "faqQ3", aKey: "faqA3" },
  { qKey: "faqQ4", aKey: "faqA4" },
  { qKey: "faqQ5", aKey: "faqA5" },
] as const;

export function Landing() {
  const { t } = useLocale();
  const { user } = useAuth();

  const features = [
    { icon: <IconUsers />, title: t("landingF1Title"), desc: t("landingF1Desc") },
    { icon: <IconFolder />, title: t("landingF2Title"), desc: t("landingF2Desc") },
    { icon: <IconCheck />, title: t("landingF3Title"), desc: t("landingF3Desc") },
    { icon: <IconWallet />, title: t("landingF4Title"), desc: t("landingF4Desc") },
    { icon: <IconMoon />, title: t("landingF5Title"), desc: t("landingF5Desc") },
    { icon: <IconClock />, title: t("landingF6Title"), desc: t("landingF6Desc") },
  ];

  const steps = [
    { n: "۱", title: t("landingStep1"), desc: t("landingStep1Desc") },
    { n: "۲", title: t("landingStep2"), desc: t("landingStep2Desc") },
    { n: "۳", title: t("landingStep3"), desc: t("landingStep3Desc") },
  ];

  const faqs = FAQ_ITEMS.map((f) => ({ q: t(f.qKey), a: t(f.aKey) }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/70 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              {t("landingNavFeatures")}
            </a>
            <a href="#how" className="transition hover:text-white">
              {t("landingNavHow")}
            </a>
            <a href="#pricing" className="transition hover:text-white">
              {t("landingNavPricing")}
            </a>
            <a href="#faq" className="transition hover:text-white">
              {t("landingNavFaq")}
            </a>
            {user && (
              <a href="/dashboard" className="transition hover:text-white">
                {t("dashboard")}
              </a>
            )}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                {t("dashboard")}
                <IconArrow className="rtl:-scale-x-100" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 sm:block"
                >
                  {t("landingLogin")}
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/30 transition hover:bg-indigo-500"
                >
                  {t("landingStart")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-40 start-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-16 md:px-8 lg:grid-cols-2 lg:pt-24">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
              <IconCheckCircle className="text-sm" />
              {t("landingBadge")}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.2] tracking-tight md:text-5xl">
              {t("landingTitle1")}{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                {t("landingTitle2")}
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-slate-400">
              {t("landingSubtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login?mode=signup"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
              >
                {t("landingCtaPrimary")}
                <IconArrow className="rtl:-scale-x-100" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                {t("landingCtaSecondary")}
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500">{t("landingFreeNote")}</p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-slate-800/70 bg-slate-900/40 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("landingFeaturesTitle")}
            </h2>
            <p className="mt-3 text-slate-400">{t("landingFeaturesSub")}</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-slate-700 hover:shadow-soft"
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/10 text-lg text-indigo-300">
                  {f.icon}
                </span>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            {t("landingHowTitle")}
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft"
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-t border-slate-800/70 bg-slate-900/40 py-20"
      >
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("pricingTitle")}</h2>
            <p className="mt-3 text-slate-400">{t("pricingSub")}</p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.nameKey}
                className={`relative flex flex-col rounded-3xl border p-7 ${
                  plan.highlighted
                    ? "border-indigo-500/60 bg-gradient-to-b from-indigo-950/60 to-slate-900 shadow-xl shadow-indigo-950/40"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-lg shadow-indigo-600/40">
                    {t("pricingProBadge")}
                  </span>
                )}
                <h3 className="font-semibold">{t(plan.nameKey)}</h3>
                <p className="mt-1 text-sm text-slate-400">{t(plan.descKey)}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight">
                    {t(plan.priceKey)}
                  </span>
                  <span className="text-sm text-slate-400">{t(plan.periodKey)}</span>
                </div>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((fKey) => (
                    <li key={fKey} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <IconCheck className="mt-0.5 shrink-0 text-base text-emerald-400" />
                      {t(fKey)}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login?mode=signup"
                  className={`mt-7 block rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500"
                      : "border border-slate-700 bg-slate-950/50 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {t("pricingCta")}
                </Link>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">{t("pricingNote")}</p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("testimonialsTitle")}
            </h2>
            <p className="mt-3 text-slate-400">{t("testimonialsSub")}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <figure
                key={item.nameKey}
                className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6"
              >
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} className="text-sm" />
                  ))}
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-300">
                  «{t(item.quoteKey)}»
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-slate-800 pt-4">
                  <span className="flex size-10 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-300">
                    {t(item.nameKey).slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{t(item.nameKey)}</p>
                    <p className="text-xs text-slate-500">{t(item.roleKey)}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="border-t border-slate-800/70 bg-slate-900/40 py-20"
      >
        <div className="mx-auto max-w-3xl px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("faqTitle")}</h2>
            <p className="mt-3 text-slate-400">{t("faqSub")}</p>
          </div>
          <div className="mt-10 space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="faq group rounded-2xl border border-slate-800 bg-slate-900">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-medium marker:content-none">
                  {f.q}
                  <IconChevronDown className="faq-chevron shrink-0 text-lg text-slate-400" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20 md:px-8">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 px-6 py-14 text-center">
          <div
            aria-hidden
            className="absolute -top-24 start-1/2 size-96 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl"
          />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight">{t("landingCtaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">{t("landingCtaSub")}</p>
            <Link
              href="/login?mode=signup"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-semibold shadow-lg shadow-indigo-600/40 transition hover:bg-indigo-500"
            >
              {t("landingCtaPrimary")}
              <IconArrow className="rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/70 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
                {t("footerDesc")}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold">{t("landingNavFeatures")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#features" className="transition hover:text-white">
                    {t("landingF1Title")}
                  </a>
                </li>
                <li>
                  <a href="#features" className="transition hover:text-white">
                    {t("landingF3Title")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="transition hover:text-white">
                    {t("pricingTitle")}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="transition hover:text-white">
                    {t("faqTitle")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold">{t("footerCompany")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    {t("footerAbout")}
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    {t("footerBlog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    {t("footerContact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold">{t("footerPrivacy")}</h3>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-400">
                <li>
                  <a href="#" className="transition hover:text-white">
                    {t("footerTerms")}
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    {t("footerPrivacy")}
                  </a>
                </li>
              </ul>
              <a
                href="mailto:hello@clientflow.app"
                className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-300 transition hover:text-indigo-200"
              >
                <IconMail className="text-base" />
                hello@clientflow.app
              </a>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} {t("appName")}</p>
            <p>{t("landingFooterTagline")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
