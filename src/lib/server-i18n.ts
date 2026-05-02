import { cookies } from "next/headers"
import { dict, type TKey, type Lang } from "@/lib/i18n"

export async function getServerT(): Promise<{ t: (key: TKey) => string; lang: Lang }> {
  const lang: Lang = (await cookies()).get("lang")?.value === "is" ? "is" : "en"
  const t = (key: TKey): string =>
    (dict[lang] as Record<string, string>)[key] ?? dict.en[key] ?? key
  return { t, lang }
}
