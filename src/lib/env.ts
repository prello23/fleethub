export const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "production"
export const isProduction = appEnv === "production"
export const isBeta = appEnv === "beta"
export const isStaging = appEnv === "staging"
