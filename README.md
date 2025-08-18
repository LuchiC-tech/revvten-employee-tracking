RevvTen Multitenant Scaffolding

Setup

- Copy `.env.local.example` to `.env.local` and fill:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Install dependencies: `npm install`
- Dev: `npm run dev` → open http://localhost:3000
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

Tech

- Next.js 14 (app router) + TypeScript
- Tailwind + shadcn-style primitives (Button, Input, Card)
- next-themes for ThemeSwitcher
- Supabase JS client (auth not wired yet)

Routes

- `/` Tenant Gate (enter Company Login ID)
- `/t/[company]` Tenant Splash (brand + two CTA buttons)
- `/t/[company]/employee/*` Employee surface (guarded)
- `/t/[company]/manager/*` Manager surface (guarded)
- `/revv-admin/*` RevvTen Admin (guarded)

Auth placeholders

- Fake sessions stored in localStorage: roles `employee`, `manager`, `revv_admin`
- Guards block mismatched or missing sessions and show a friendly 403 + sign-in shell

Acceptance checks

- Tenant Gate validates slug and routes to `/t/[slug]`
- Brand applied to tenant header
- Guards enforce access by role and company
- Session persists via localStorage; refresh keeps state
- Scripts: dev, build, start, lint, typecheck
