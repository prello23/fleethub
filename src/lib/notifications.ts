import { prisma } from "./prisma"
import { sendPushNotification } from "./push"
import { sendEmail, bookingStartEmail, bookingEndEmail } from "./email"

export async function processNotifications() {
  const now = new Date()

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { notifiedStart: false, startTime: { gt: now } },
        { notifiedEnd: false, endTime: { gt: now } },
      ],
    },
    include: {
      user: true,
      room: true,
    },
  })

  for (const booking of bookings) {
    const { user, room } = booking
    const minutesBeforeStart = (booking.startTime.getTime() - now.getTime()) / 60000
    const minutesBeforeEnd = (booking.endTime.getTime() - now.getTime()) / 60000

    // Notify before start
    if (
      !booking.notifiedStart &&
      minutesBeforeStart > 0 &&
      minutesBeforeStart <= room.notifyMinutesBefore
    ) {
      const pushPayload = {
        title: "🧺 Þvottahús minnisatriði",
        body: `Tíminn þinn í ${room.name} byrjar eftir ${room.notifyMinutesBefore} mín.`,
      }

      if (user.pushSubscription) {
        try {
          await sendPushNotification(user.pushSubscription, pushPayload)
        } catch {
          await prisma.user.update({ where: { id: user.id }, data: { pushSubscription: null } })
        }
      }

      const emailData = bookingStartEmail(user.name, room.name, booking.startTime, room.notifyMinutesBefore)
      await sendEmail({ to: user.email, ...emailData }).catch(() => {})

      await prisma.booking.update({ where: { id: booking.id }, data: { notifiedStart: true } })
    }

    // Notify before end
    if (
      !booking.notifiedEnd &&
      minutesBeforeEnd > 0 &&
      minutesBeforeEnd <= room.notifyMinutesBeforeEnd
    ) {
      const pushPayload = {
        title: "⏰ Tíminn er að klárast",
        body: `Tíminn þinn í ${room.name} klárast eftir ${room.notifyMinutesBeforeEnd} mín.`,
      }

      if (user.pushSubscription) {
        try {
          await sendPushNotification(user.pushSubscription, pushPayload)
        } catch {
          await prisma.user.update({ where: { id: user.id }, data: { pushSubscription: null } })
        }
      }

      const emailData = bookingEndEmail(user.name, room.name, booking.endTime, room.notifyMinutesBeforeEnd)
      await sendEmail({ to: user.email, ...emailData }).catch(() => {})

      await prisma.booking.update({ where: { id: booking.id }, data: { notifiedEnd: true } })
    }
  }
}
