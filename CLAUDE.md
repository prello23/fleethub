# CLAUDE.md — Þróunarreglur fyrir þetta verkefni

> Lestu þessa skrá vandlega í hvert skipti áður en þú gerir breytingar. Þessar reglur koma í veg fyrir server-hruni og villur.

---

## 🏗️ TÆKNILEGAR REGLUR (ALDREI BRJÓTA)

### Database
- **ALLTAF** `better-sqlite3` + `@prisma/adapter-better-sqlite3` — ALDREI `@libsql/client` (hrynur á CloudLinux vegna NPROC marka)
- **ALDREI** `prisma db push` í start script — hrynur á shared hosting
- **ALDREI** `$executeRawUnsafe` — virkar ekki með better-sqlite3 adapter
- Allar DB migrations fara í `src/instrumentation.ts` með beinum `better-sqlite3` SQL skipunum
- Format: `db.exec("ALTER TABLE User ADD COLUMN columnName TEXT")` wrapped í try/catch
- `prod.db` er utan `nodejs/` möppu: `/home/u804940080/domains/laundry.outzone.is/prod.db`
- DATABASE_URL: `file:/home/u804940080/domains/laundry.outzone.is/prod.db`

### Node.js keyrsla
- **ALDREI** `node-cron` í `instrumentation.ts` — hrynur þögulega við ræsingu
- Node.js útgáfa á server: **v20.x**
- Keyrir sem standalone Next.js app á Hostinger shared hosting
- Engin SSH, engin terminal — allt fer í gegnum GitHub → auto-deploy

### TypeScript & Build
- `next.config.ts` verður alltaf að hafa:
  ```ts
  typescript: { ignoreBuildErrors: true }
  eslint: { ignoreDuringBuilds: true }
  output: "standalone"
  serverExternalPackages: ["better-sqlite3"]
  ```
- Prisma schema: `provider = "sqlite"` — **ENGIN** `url` field í `datasource db {}`
- URL er eingöngu í `prisma.config.ts`: `url: process.env["DATABASE_URL"]`

### bcrypt
- **ALLTAF** `rounds=10` — ALDREI `rounds=12` eða hærra (of hægt á shared hosting)
- Í seed routes: nota **forútreiknaðar** hash-ar til að forðast timeout:
  - `Valdisgunnar2312` → `$2b$10$acwiMWS2RAEOykaEi4uXAeU66wvEgV4w0/XKdXZxEkohjq0KFRfZm`
  - `Laundry123!` → `$2b$10$e.Dj7g7.D9YZDpcBVDj3BO9SehsHoMg0RXjFPn3ZbB0gSS4d/woUS`

---

## 🔄 DEPLOYMENT WORKFLOW

```
Claude Code → git push → GitHub webhook → Hostinger auto-build (~60 sek) → Síðan lifandi
```

- **ALDREI** handvirkt upload eða server restart
- GitHub repo: `prello23/fleethub`, branch: `claude/laundry-booking-calendar-zneOM`
- Eftir push: bíddu 70-90 sek, síðan er deploymentið búið

---

## 🧪 BETA / STAGING KERFI

- Env var: `NEXT_PUBLIC_APP_ENV=beta` → gult BETA merki birtist í header
- Beta releases: nota feature flags í kóða til að kveikja/slökkva á nýjum features
- **Update banner**: birtist þegar PWA service worker uppfærist — notandinn VERÐUR að smella til að fá nýju útgáfuna (ALDREI sjálfvirk endurræsing)

---

## 🛡️ STÖÐUGLEIKI OG ERROR HANDLING

- **React Error Boundary** er alltaf í `src/app/layout.tsx` — appið hrynur ALDREI heildarillt
- **uncaughtException** handler í `src/instrumentation.ts` til að logga villur
- Öll API routes: `try/catch` með skýrum villuskilaboðum
- Health endpoint: `/api/health` — skilar alltaf 200, notar EKKI Prisma

---

## 👤 NOTENDAKERFI

### Hlutverk
- `SUPER_ADMIN` — aðgangur að öllu (litar: purple/indigo)
- `ADMIN` — stjórnar þvottahúsum (litar: blue)
- `USER` — venjulegur notandi

### Innskráning
- CSRF token krafist fyrir POST á `/api/auth/callback/credentials`
- NextAuth v5: `AUTH_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST=true` verður að vera sett

### Superadmin aðgangur
- Email: `elvarpa@gmail.com`
- Lykilorð: `Valdisgunnar2312`
- **Seed endpoint**: `GET /api/seed?token=SEED_SECRET_2025` — alltaf öruggt að kalla, upsertar superadmin

---

## 📱 PUSH NOTIFICATIONS

- OneSignal App ID: `70da57e1-0cfe-402e-86e4-ba52b1bee157`
- **MIKILVÆGT**: OneSignal SDK initialize AÐEINS eftir innskráningu — ALDREI á login/landing síðum
- `src/components/OneSignalInit.tsx` — skoðar session áður en initialize
- Push subscription UI í Profile síðu — AÐEINS sýnd þegar notandi er innskráður

---

## 🎨 UI/UX REGLUR

### Tungumál
- Icelandic (IS) og English (EN) studdar
- `src/lib/i18n.ts` — allar textar þar
- `useT()` hook í components

### Navigation header
- **Óinnskráðir**: sýna aðeins Logo + language toggle + "Skrá inn" + "Nýskrá sig"
- **Innskráðir**: sýna nav hlekki eftir hlutverki

### Landing page (`/`)
- Óinnskráðir notendur sjá marketing landing page
- Innskráðir notendur redirect-ast á `/rooms`
- Landing page: skýring á kerfinu + 1 mánuður fría prufu + CTA

---

## 🔧 ENV BREYTUR (Hostinger)

| Breyta | Gildi |
|--------|-------|
| `AUTH_SECRET` | `bQeWl7UUyXipwRUUNurOSe0Be2wZe2jirWnCMdpdJJk=` |
| `NEXTAUTH_URL` | `https://laundry.outzone.is` |
| `DATABASE_URL` | `file:/home/u804940080/domains/laundry.outzone.is/prod.db` |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://laundry.outzone.is` |
| `ONESIGNAL_APP_ID` | `70da57e1-0cfe-402e-86e4-ba52b1bee157` |
| `ONESIGNAL_REST_API_KEY` | *(sjá `/agent/home/onesignal_keys.txt`)* |
| `NEXT_PUBLIC_ONESIGNAL_APP_ID` | `70da57e1-0cfe-402e-86e4-ba52b1bee157` |

SMTP breytur (settar síðar): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

---

## 📋 VERKEFNALISTI (þegar Claude Code fær nýtt verkefni)

1. Lesa þessa CLAUDE.md skrá FYRST
2. Athuga `src/instrumentation.ts` — ef nýir dálkar: bæta við ALTER TABLE þar
3. Keyra `npx prisma generate` eftir schema breytingar
4. ALDREI keyra `prisma db push` 
5. Ganga úr skugga um að TypeScript villur séu suppressed í next.config.ts
6. Push til GitHub — bíða 70-90 sek
7. Kalla á `/api/seed?token=SEED_SECRET_2025` ef seed þarf uppfærslu
