import webpush from "web-push"

if (process.env.VAPID_EMAIL && process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
}

export async function sendPushNotification(
  subscriptionJson: string,
  payload: { title: string; body: string; icon?: string }
) {
  try {
    const subscription = JSON.parse(subscriptionJson)
    await webpush.sendNotification(subscription, JSON.stringify(payload))
  } catch {
    // Subscription may be expired; caller handles cleanup
    throw new Error("Push failed")
  }
}
