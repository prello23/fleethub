export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { processNotifications } = await import("./lib/notifications")

    // Check every minute for due notifications using setInterval (no worker threads)
    setInterval(async () => {
      try {
        await processNotifications()
      } catch (err) {
        console.error("Notification error:", err)
      }
    }, 60 * 1000)
  }
}
