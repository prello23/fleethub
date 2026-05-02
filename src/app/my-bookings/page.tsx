import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getServerT } from "@/lib/server-i18n"
import Link from "next/link"
import { format } from "date-fns"
import { enUS, is as isLocale } from "date-fns/locale"
import { WashingMachine, Waves, Calendar, ArrowLeft, Clock } from "lucide-react"
import CancelBookingButton from "@/components/CancelBookingButton"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "My Bookings | Laundry" }

export default async function MyBookingsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { t, lang } = await getServerT()
  const dateLocale = lang === "is" ? isLocale : enUS

  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [upcoming, past] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.user.id, startTime: { gte: now } },
      include: { room: { select: { id: true, name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: { userId: session.user.id, startTime: { gte: thirtyDaysAgo, lt: now } },
      include: { room: { select: { id: true, name: true } } },
      orderBy: { startTime: "desc" },
    }),
  ])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/rooms" className="p-2 rounded-lg hover:bg-gray-200 text-gray-500">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("myBookings.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {upcoming.length} {t("myBookings.upcoming").toLowerCase()}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">{t("myBookings.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 text-center">
            <Calendar className="mx-auto text-gray-300 mb-3" size={36} />
            <p className="text-gray-500 text-sm">{t("myBookings.noUpcoming")}</p>
            <Link href="/rooms" className="mt-3 inline-block text-blue-700 text-sm font-medium hover:underline">
              {t("myBookings.bookSlot")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => {
              const isWasher = b.machineType === "WASHER"
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isWasher ? "bg-blue-100" : "bg-teal-100"}`}>
                    {isWasher
                      ? <WashingMachine className="text-blue-700" size={18} />
                      : <Waves className="text-teal-700" size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Link href={`/rooms/${b.room.id}`} className="font-semibold text-gray-900 text-sm hover:text-blue-700">
                        {b.room.name}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isWasher ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>
                        {isWasher ? t("room.washer") : t("room.dryer")} {b.machineNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {format(b.startTime, "EEEE, d. MMMM yyyy", { locale: dateLocale })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {format(b.startTime, "HH:mm")} – {format(b.endTime, "HH:mm")}
                      </span>
                    </div>
                  </div>
                  <CancelBookingButton bookingId={b.id} />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-gray-500 mb-3">{t("myBookings.past")}</h2>
          <div className="space-y-3 opacity-60">
            {past.map((b) => {
              const isWasher = b.machineType === "WASHER"
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isWasher ? "bg-blue-100" : "bg-teal-100"}`}>
                    {isWasher
                      ? <WashingMachine className="text-blue-700" size={18} />
                      : <Waves className="text-teal-700" size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Link href={`/rooms/${b.room.id}`} className="font-semibold text-gray-900 text-sm hover:text-blue-700">
                        {b.room.name}
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isWasher ? "bg-blue-50 text-blue-700" : "bg-teal-50 text-teal-700"}`}>
                        {isWasher ? t("room.washer") : t("room.dryer")} {b.machineNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {format(b.startTime, "EEEE, d. MMMM yyyy", { locale: dateLocale })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {format(b.startTime, "HH:mm")} – {format(b.endTime, "HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
