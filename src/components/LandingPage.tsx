"use client"

import Link from "next/link"
import {
  WashingMachine,
  Calendar,
  Bell,
  Clock,
  Settings,
  UserCheck,
  BarChart3,
  CheckCircle,
} from "lucide-react"
import { useT } from "@/components/LanguageProvider"

function FeatureCard({
  icon,
  title,
  desc,
  accent = "blue",
}: {
  icon: React.ReactNode
  title: string
  desc: string
  accent?: "blue" | "indigo"
}) {
  const bg = accent === "indigo" ? "bg-indigo-50" : "bg-blue-50"
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col gap-3">
      <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useT()

  const residentFeatures = [
    {
      icon: <Calendar className="text-blue-600" size={22} />,
      title: t("landing.f1Title"),
      desc: t("landing.f1Desc"),
    },
    {
      icon: <Bell className="text-blue-600" size={22} />,
      title: t("landing.f2Title"),
      desc: t("landing.f2Desc"),
    },
    {
      icon: <Clock className="text-blue-600" size={22} />,
      title: t("landing.f3Title"),
      desc: t("landing.f3Desc"),
    },
  ]

  const managerFeatures = [
    {
      icon: <Settings className="text-indigo-600" size={22} />,
      title: t("landing.m1Title"),
      desc: t("landing.m1Desc"),
    },
    {
      icon: <UserCheck className="text-indigo-600" size={22} />,
      title: t("landing.m2Title"),
      desc: t("landing.m2Desc"),
    },
    {
      icon: <BarChart3 className="text-indigo-600" size={22} />,
      title: t("landing.m3Title"),
      desc: t("landing.m3Desc"),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.12)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl mb-6 shadow-lg">
            <WashingMachine size={42} />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
            {t("landing.heroTitle")}
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t("landing.heroSub")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t("landing.ctaStart")}
            </Link>
            <Link
              href="/login"
              className="border border-white/40 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/20 transition-colors"
            >
              {t("landing.ctaSignIn")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trial banner ─────────────────────────────────────── */}
      <div className="bg-amber-400 text-amber-950 py-3 px-4 text-center text-sm font-semibold tracking-wide">
        🎁 {t("landing.trialBanner")}
      </div>

      {/* ── Resident features ────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              {t("landing.forResidents")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {t("landing.f1Title")} · {t("landing.f2Title")} · {t("landing.f3Title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {residentFeatures.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} accent="blue" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Manager features ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              {t("landing.forManagers")}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
              {t("landing.m1Title")} · {t("landing.m2Title")} · {t("landing.m3Title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {managerFeatures.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} accent="indigo" />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-700 to-indigo-700 text-white text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t("landing.footerCta")}</h2>
          <p className="text-blue-100 mb-2">{t("landing.footerSub")}</p>

          {/* Trust signals */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-blue-200 mb-8 mt-4">
            {["✓ Án kreditkorts", "✓ 1 mánuður frítt", "✓ Uppsett á mínútum"].map((item) => (
              <span key={item} className="flex items-center gap-1">
                <CheckCircle size={13} className="text-blue-300" /> {item.slice(2)}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white text-blue-700 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t("landing.ctaStart")}
            </Link>
            <Link
              href="/login"
              className="border border-white/40 bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              {t("landing.ctaSignIn")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
