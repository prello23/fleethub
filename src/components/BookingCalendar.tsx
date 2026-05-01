"use client"

import { useState, useEffect, useCallback } from "react"
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, isToday } from "date-fns"
import { is } from "date-fns/locale"
import { ChevronLeft, ChevronRight, WashingMachine, Waves, X, Loader2, Bell } from "lucide-react"

type Room = {
  id: string
  name: string
  washingMachines: number
  dryers: number
  slotDurationMinutes: number
}

type Booking = {
  id: string
  machineType: string
  machineNumber: number
  startTime: string
  endTime: string
  userId: string
  user: { id: string; name: string; apartment: string | null }
}

type Props = {
  room: Room
  currentUserId: string
  currentUserName: string
}

const HOUR_START = 6
const HOUR_END = 23

function generateSlots(date: Date, slotMinutes: number): Date[] {
  const slots: Date[] = []
  const totalMinutes = (HOUR_END - HOUR_START) * 60
  const count = Math.floor(totalMinutes / slotMinutes)
  for (let i = 0; i < count; i++) {
    const d = new Date(date)
    d.setHours(HOUR_START, i * slotMinutes, 0, 0)
    slots.push(d)
  }
  return slots
}

export default function BookingCalendar({ room, currentUserId, currentUserName }: Props) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [bookings, setBookings] = useState<Booking[]>([])
  const [activeTab, setActiveTab] = useState<"WASHER" | "DRYER">("WASHER")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [confirmSlot, setConfirmSlot] = useState<{ date: Date; machine: number } | null>(null)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const hasOneSignal = !!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

  const weekEnd = addDays(weekStart, 6)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const from = weekStart.toISOString()
      const to = new Date(weekEnd.getTime() + 86400000).toISOString()
      const res = await fetch(`/api/bookings?roomId=${room.id}&from=${from}&to=${to}`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) setBookings(data)
      }
    } catch {
      // network error — leave bookings as-is
    }
    setLoading(false)
  }, [room.id, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchBookings() }, [fetchBookings])

  useEffect(() => {
    if (!hasOneSignal) return
    // Check OneSignal permission once SDK loads
    const interval = setInterval(() => {
      const os = (window as { OneSignal?: { Notifications?: { permission: boolean } } }).OneSignal
      if (os?.Notifications !== undefined) {
        setPushEnabled(os.Notifications.permission)
        clearInterval(interval)
      }
    }, 800)
    return () => clearInterval(interval)
  }, [hasOneSignal])

  function findBooking(day: Date, machine: number, type: string): Booking | undefined {
    return bookings.find((b) => {
      const start = parseISO(b.startTime)
      return (
        isSameDay(start, day) &&
        b.machineNumber === machine &&
        b.machineType === type
      )
    })
  }

  function isSlotBooked(day: Date, slotTime: Date, machine: number, type: string): Booking | undefined {
    return bookings.find((b) => {
      if (b.machineType !== type || b.machineNumber !== machine) return false
      const start = new Date(b.startTime)
      const end = new Date(b.endTime)
      return slotTime >= start && slotTime < end
    })
  }

  async function handleBook() {
    if (!confirmSlot) return
    setBooking(true)
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          machineType: activeTab,
          machineNumber: confirmSlot.machine,
          startTime: confirmSlot.date.toISOString(),
        }),
      })
      if (res.ok) {
        setConfirmSlot(null)
        fetchBookings()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error === "Slot already booked" ? "Þessi tími er þegar bókaður" : "Villa við bókun")
      }
    } catch {
      alert("Netvillu – reyndu aftur")
    }
    setBooking(false)
  }

  async function handleCancel(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" })
    fetchBookings()
  }

  async function togglePush() {
    if (!hasOneSignal) return
    const os = (window as { OneSignal?: { Notifications?: { requestPermission: () => Promise<void>; permission: boolean } } }).OneSignal
    if (!os?.Notifications) return
    setPushLoading(true)
    if (!pushEnabled) {
      await os.Notifications.requestPermission().catch(() => {})
      setPushEnabled(os.Notifications.permission)
    }
    setPushLoading(false)
  }

  const machineCount = activeTab === "WASHER" ? room.washingMachines : room.dryers
  const machines = Array.from({ length: machineCount }, (_, i) => i + 1)
  const slots = generateSlots(new Date(), room.slotDurationMinutes)

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-3">
        <button
          onClick={() => setWeekStart((w) => subWeeks(w, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <p className="font-semibold text-gray-900 text-sm">
            {format(weekStart, "d. MMM", { locale: is })} – {format(weekEnd, "d. MMM yyyy", { locale: is })}
          </p>
        </div>
        <button
          onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          className="p-1.5 rounded-lg hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Machine type tabs + push toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab("WASHER")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "WASHER"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <WashingMachine size={15} />
            Þvottavélar ({room.washingMachines})
          </button>
          <button
            onClick={() => setActiveTab("DRYER")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "DRYER"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Waves size={15} />
            Þurrkarar ({room.dryers})
          </button>
        </div>

        {hasOneSignal && (
          <button
            onClick={togglePush}
            disabled={pushLoading}
            className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
              pushEnabled
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {pushLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Bell size={12} />
            )}
            {pushEnabled ? "Tilkynningar virkar" : "Virkja tilkynningar"}
          </button>
        )}
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              {/* Day headers */}
              <div className="grid grid-cols-8 border-b border-gray-100">
                <div className="p-3 text-xs text-gray-400 font-medium text-center">Tími</div>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-3 text-center border-l border-gray-100 ${
                      isToday(day) ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      {format(day, "EEE", { locale: is })}
                    </p>
                    <p
                      className={`text-lg font-bold mt-0.5 ${
                        isToday(day) ? "text-blue-700" : "text-gray-800"
                      }`}
                    >
                      {format(day, "d")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time slots per machine */}
              {machines.map((machine) => (
                <div key={machine}>
                  <div className="bg-gray-50 border-b border-gray-100 px-3 py-1.5 flex items-center gap-2">
                    {activeTab === "WASHER" ? (
                      <WashingMachine size={12} className="text-blue-500" />
                    ) : (
                      <Waves size={12} className="text-teal-500" />
                    )}
                    <span className="text-xs font-semibold text-gray-600">
                      {activeTab === "WASHER" ? "Þvottavél" : "Þurrkari"} {machine}
                    </span>
                  </div>

                  {slots.map((slot) => {
                    const slotHour = slot.getHours()
                    const slotMin = slot.getMinutes()

                    return (
                      <div key={slot.toISOString()} className="grid grid-cols-8 border-b border-gray-50">
                        <div className="px-2 py-1 text-xs text-gray-400 text-center flex items-center justify-center">
                          {slotMin === 0 && `${slotHour}:00`}
                        </div>
                        {days.map((day) => {
                          const slotTime = new Date(day)
                          slotTime.setHours(slotHour, slotMin, 0, 0)
                          const existingBooking = isSlotBooked(day, slotTime, machine, activeTab)
                          const isOwn = existingBooking?.userId === currentUserId
                          const isPast = slotTime < new Date()

                          return (
                            <div
                              key={day.toISOString()}
                              className={`border-l border-gray-100 px-1 py-0.5 ${
                                isToday(day) ? "bg-blue-50/40" : ""
                              }`}
                            >
                              {existingBooking ? (
                                <div
                                  className={`rounded px-1.5 py-1 text-xs flex items-center justify-between gap-1 ${
                                    isOwn
                                      ? "bg-blue-600 text-white"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  <span className="truncate text-[10px]">
                                    {isOwn ? "Minn" : existingBooking.user.apartment || existingBooking.user.name}
                                  </span>
                                  {isOwn && (
                                    <button
                                      onClick={() => handleCancel(existingBooking.id)}
                                      className="flex-shrink-0 hover:opacity-70"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </div>
                              ) : (
                                !isPast && (
                                  <button
                                    onClick={() => setConfirmSlot({ date: slotTime, machine })}
                                    className="w-full rounded px-1.5 py-1 text-[10px] text-transparent hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                                  >
                                    Bóka
                                  </button>
                                )
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking confirm modal */}
      {confirmSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Staðfesta bókun</h3>
            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1.5 mb-5">
              <p>
                <span className="text-gray-500">Þvottahús:</span>{" "}
                <strong>{room.name}</strong>
              </p>
              <p>
                <span className="text-gray-500">Tæki:</span>{" "}
                <strong>
                  {activeTab === "WASHER" ? "Þvottavél" : "Þurrkari"} {confirmSlot.machine}
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Dagur:</span>{" "}
                <strong>{format(confirmSlot.date, "EEEE, d. MMMM", { locale: is })}</strong>
              </p>
              <p>
                <span className="text-gray-500">Tími:</span>{" "}
                <strong>
                  {format(confirmSlot.date, "HH:mm")} –{" "}
                  {format(
                    new Date(confirmSlot.date.getTime() + room.slotDurationMinutes * 60000),
                    "HH:mm"
                  )}
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Notandi:</span>{" "}
                <strong>{currentUserName}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmSlot(null)}
                disabled={booking}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Hætta við
              </button>
              <button
                onClick={handleBook}
                disabled={booking}
                className="flex-1 bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {booking && <Loader2 size={14} className="animate-spin" />}
                Bóka
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

