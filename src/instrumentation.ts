export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const cron = await import("node-cron")
    const { processNotifications } = await import("./lib/notifications")

    // Check every minute for due notifications
    cron.schedule("* * * * *", async () => {
      try {
        await processNotifications()
      } catch (err) {
        console.error("Notification cron error:", err)
      }
    })
  }
}
