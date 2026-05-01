import nodemailer from "nodemailer"

function getTransporter() {
  if (!process.env.SMTP_USER) return null

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  const transporter = getTransporter()
  if (!transporter) return

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Laundry Booking <noreply@laundry.local>",
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
}

export function bookingStartEmail(name: string, roomName: string, startTime: Date, minutesBefore: number) {
  return {
    subject: `Þvottahús minnisatriði – ${roomName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">🧺 Þvottahús minnisatriði</h2>
        <p>Halló <strong>${name}</strong>,</p>
        <p>Tíminn þinn í <strong>${roomName}</strong> byrjar <strong>eftir ${minutesBefore} mínútur</strong>.</p>
        <p><strong>Byrjunartími:</strong> ${startTime.toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}</p>
        <p style="color:#6b7280;font-size:14px">Þetta er sjálfvirk tilkynning frá Þvottahús bókunarkerfi.</p>
      </div>
    `,
  }
}

export function bookingEndEmail(name: string, roomName: string, endTime: Date, minutesBefore: number) {
  return {
    subject: `Þvottahús – Tími að klárast – ${roomName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#dc2626">⏰ Tíminn er að klárast</h2>
        <p>Halló <strong>${name}</strong>,</p>
        <p>Tíminn þinn í <strong>${roomName}</strong> klárast <strong>eftir ${minutesBefore} mínútur</strong>.</p>
        <p><strong>Lokatími:</strong> ${endTime.toLocaleTimeString("is-IS", { hour: "2-digit", minute: "2-digit" })}</p>
        <p>Vinsamlegast mundu að sækja þvottinn þinn.</p>
        <p style="color:#6b7280;font-size:14px">Þetta er sjálfvirk tilkynning frá Þvottahús bókunarkerfi.</p>
      </div>
    `,
  }
}
