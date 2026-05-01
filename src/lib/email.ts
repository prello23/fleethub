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

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) return false

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "Laundry Booking <noreply@laundry.local>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    return true
  } catch {
    return false
  }
}

export function bookingStartEmail(name: string, roomName: string, startTime: Date, minutesBefore: number) {
  return {
    subject: `Laundry reminder – ${roomName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#2563eb">🧺 Laundry reminder</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your slot in <strong>${roomName}</strong> starts in <strong>${minutesBefore} minutes</strong>.</p>
        <p><strong>Start time:</strong> ${startTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
        <p style="color:#6b7280;font-size:14px">This is an automated notification from the Laundry Booking system.</p>
      </div>
    `,
  }
}

export function bookingEndEmail(name: string, roomName: string, endTime: Date, minutesBefore: number) {
  return {
    subject: `Laundry – Slot ending soon – ${roomName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#dc2626">⏰ Slot ending soon</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your slot in <strong>${roomName}</strong> ends in <strong>${minutesBefore} minutes</strong>.</p>
        <p><strong>End time:</strong> ${endTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
        <p>Please remember to collect your laundry.</p>
        <p style="color:#6b7280;font-size:14px">This is an automated notification from the Laundry Booking system.</p>
      </div>
    `,
  }
}

