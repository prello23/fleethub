import type { NextConfig } from "next"
import { execSync } from "child_process"

function getBuildVersion() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pkg = require("./package.json") as { version: string }
  try {
    const hash = execSync("git rev-parse --short HEAD").toString().trim()
    return `${pkg.version} (${hash})`
  } catch {
    return pkg.version
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
