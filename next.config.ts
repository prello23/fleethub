import type { NextConfig } from "next"
import { execSync } from "child_process"

function getBuildVersion() {
  // Always include a build timestamp so the version changes on every build,
  // even when the git hash hasn't changed (e.g. re-deploying the same commit)
  const ts = new Date().toISOString().slice(0, 16).replace("T", "_")
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim()
    return `${hash}-${ts}`
  } catch {
    return ts
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  env: {
    APP_VERSION: getBuildVersion(),
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["laundry.outzone.is", "localhost:3000"],
    },
  },
}

export default nextConfig
