import { prisma } from "./prisma"
import { isOneSignalConfigured, sendPushToUser, sendEmailToUser, sendPushToAdmins } from "./onesignal"
import { sendPushNotification } from "./push"
import { sendEmail, bookingStartEmail, bookingEndEmail, bookingConfirmedEmail, bookingCancelledEmail } from "./email"

type BookingWithRelations = {
  id: string
  startTime: Date
  endTime: Date
  user: { id: string; name: string; email: string; notifyPush: boolean; notifyEmail: boolean; pushSubscription: string | null }
  room: { name: string }
  machineType: string
  machineNumber: number
}

export async function notifyBookingConfirmed(booking: BookingWithRelations) {
  const { user, room } = booking
  const timeStr = `${booking.startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} – ${booking.endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
  const pushTitle = "✅ Bókun staðfest"
  const pushBody = `${room.name} – ${timeStr}`
  const adminTitle = "🧺 Ný bókun"
  const adminBody = `${user.name} bókaði tíma í ${room.name}`

  const useOneSignal = isOneSignalConfigured()

  if (user.notifyPush) {
    if (useOneSignal) {
      await sendPushToUser(user.id, pushTitle, pushBody).catch(() => {})
    } else if (user.pushSubscription) {
      await sendPushNotification(user.pushSubscription, { title: pushTitle, body: pushBody }).catch(() => {})
    }
  }

  if (user.notifyEmail) {
    const mail = bookingConfirmedEmail(user.name, room.name, booking.startTime, booking.endTime)
    if (useOneSignal) {
      await sendEmailToUser(user.id, mail.subject, mail.html).catch(() => {})
    } else {
      await sendEmail({ to: user.email, subject: mail.subject, html: mail.html }).catch(() => {})
    }
  }

  // Notify admins
  if (useOneSignal) {
    await sendPushToAdmins(adminTitle, adminBody).catch(() => {})
  }
}

export async function notifyBookingCancelled(booking: BookingWithRelations) {
  const { user, room } = booking
  const timeStr = `${booking.startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} – ${booking.endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
  const pushTitle = "❌ Bókun aflýst"
  const pushBody = `${room.name} – ${timeStr}`

  const useOneSignal = isOneSignalConfigured()

  if (user.notifyPush) {
    if (useOneSignal) {
      await sendPushToUser(user.id, pushTitle, pushBody).catch(() => {})
    } else if (user.pushSubscription) {
      await sendPushNotification(user.pushSubscription, { title: pushTitle, body: pushBody }).catch(() => {})
    }
  }

  if (user.notifyEmail) {
    const mail = bookingCancelledEmail(user.name, room.name, booking.startTime, booking.endTime)
    if (useOneSignal) {
      await sendEmailToUser(user.id, mail.subject, mail.html).catch(() => {})
    } else {
      await sendEmail({ to: user.email, subject: mail.subject, html: mail.html }).catch(() => {})
    }
  }
}

export async function processNotifications() {
  const now = new Date()
  const useOneSignal = isOneSignalConfigured()

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { notifiedStart: false, startTime: { gt: now } },
        { notifiedEnd: false, endTime: { gt: now } },
      ],
    },
    include: { user: true, room: true },
  })

  for (const booking of bookings) {
    const { user, room } = booking
    const minBeforeStart = (booking.startTime.getTime() - now.getTime()) / 60000
    const minBeforeEnd = (booking.endTime.getTime() - now.getTime()) / 60000

    if (!booking.notifiedStart && minBeforeStart > 0 && minBeforeStart <= room.notifyMinutesBefore) {
      const title = "🧺 Þvottahús minnisatriði"
      const body = `Tíminn þinn í ${room.name} byrjar eftir ${room.notifyMinutesBefore} mín.`

      if (useOneSignal) {
        await sendPushToUser(user.id, title, body).catch(() => {})
        await sendEmailToUser(
          user.id,
          `Þvottahús minnisatriði – ${room.name}`,
          bookingStartEmail(user.name, room.name, booking.startTime, room.notifyMinutesBefore).html
        ).catch(() => {})
      } else {
        if (user.pushSubscription) {
          await sendPushNotification(user.pushSubscription, { title, body }).catch(async () => {
            await prisma.user.update({ where: { id: user.id }, data: { pushSubscription: null } })
          })
        }
        const mail = bookingStartEmail(user.name, room.name, booking.startTime, room.notifyMinutesBefore)
        await sendEmail({ to: user.email, ...mail }).catch(() => {})
      }

      await prisma.booking.update({ where: { id: booking.id }, data: { notifiedStart: true } })
    }

    if (!booking.notifiedEnd && minBeforeEnd > 0 && minBeforeEnd <= room.notifyMinutesBeforeEnd) {
      const title = "⏰ Tíminn er að klárast"
      const body = `Tíminn þinn í ${room.name} klárast eftir ${room.notifyMinutesBeforeEnd} mín.`

      if (useOneSignal) {
        await sendPushToUser(user.id, title, body).catch(() => {})
        await sendEmailToUser(
          user.id,
          `Þvottahús – Tími að klárast – ${room.name}`,
          bookingEndEmail(user.name, room.name, booking.endTime, room.notifyMinutesBeforeEnd).html
        ).catch(() => {})
      } else {
        if (user.pushSubscription) {
          await sendPushNotification(user.pushSubscription, { title, body }).catch(async () => {
            await prisma.user.update({ where: { id: user.id }, data: { pushSubscription: null } })
          })
        }
        const mail = bookingEndEmail(user.name, room.name, booking.endTime, room.notifyMinutesBeforeEnd)
        await sendEmail({ to: user.email, ...mail }).catch(() => {})
      }

      await prisma.booking.update({ where: { id: booking.id }, data: { notifiedEnd: true } })
    }
  }
}
