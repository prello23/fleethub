import { prisma } from "./prisma"
import { isOneSignalConfigured, sendPushToUser, sendEmailToUser } from "./onesignal"
import { sendPushNotification } from "./push"
import { sendEmail, bookingStartEmail, bookingEndEmail } from "./email"

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
