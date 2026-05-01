const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ?? ""
const API_KEY = process.env.ONESIGNAL_API_KEY ?? ""

export function isOneSignalConfigured() {
  return !!(APP_ID && API_KEY)
}

async function post(body: Record<string, unknown>) {
  const res = await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${API_KEY}`,
    },
    body: JSON.stringify({ app_id: APP_ID, ...body }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(`OneSignal: ${JSON.stringify(data)}`)
  }
}

export async function sendPushToUser(userId: string, title: string, body: string) {
  await post({
    include_aliases: { external_id: [userId] },
    target_channel: "push",
    headings: { en: title },
    contents: { en: body },
    url: process.env.AUTH_URL ? `${process.env.AUTH_URL}/rooms` : "/rooms",
  })
}

export async function sendEmailToUser(userId: string, subject: string, html: string) {
  await post({
    include_aliases: { external_id: [userId] },
    target_channel: "email",
    email_subject: subject,
    email_body: html,
  })
}
