export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    process.on("uncaughtException", (err) => {
      console.error("UNCAUGHT EXCEPTION:", err)
      console.error(err.stack)
    })
    process.on("unhandledRejection", (reason, promise) => {
      console.error("UNHANDLED REJECTION at:", promise, "reason:", reason)
    })
  }
}
