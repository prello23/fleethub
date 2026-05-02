"use client"
import { createContext, useContext, useState } from "react"
import { useRouter } from "next/navigation"
import { dict, Lang, TKey } from "@/lib/i18n"

interface LangCtx { lang: Lang; setLang: (l: Lang) => void; t: (key: TKey) => string }

const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {}, t: (k) => dict.en[k] })

export function LanguageProvider({ initialLang, children }: { initialLang: Lang; children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const router = useRouter()

  function setLang(l: Lang) {
    setLangState(l)
    document.cookie = `lang=${l};path=/;max-age=31536000`
    router.refresh()
  }

  const t = (key: TKey): string => (dict[lang] as Record<string, string>)[key] ?? dict.en[key] ?? key
  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useT() { return useContext(Ctx) }
