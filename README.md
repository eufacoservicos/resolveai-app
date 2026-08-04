# resolveai (eufaço!)

Monorepo do projeto **eufaço!** — plataforma que conecta clientes a prestadores de serviços locais.

## Estrutura

```
apps/
  web/       Next.js 16 — landing page pública (marketing + SEO)
  mobile/    Expo (React Native) — aplicativo mobile iOS/Android
packages/
  shared/    lógica compartilhada: queries Supabase, tipos, validators (cpf/cnpj/cep), constants
  ui/        componentes de UI cross-platform (React Native Reusables + NativeWind)
supabase/    migrations SQL e templates de e-mail (fonte da verdade do schema)
```

## Requisitos

- Node.js ≥ 20
- pnpm 10 (`npm i -g pnpm`)
- Para mobile: Expo CLI e (opcional) EAS CLI

## Setup

```bash
pnpm install
```

## Scripts

```bash
pnpm dev            # roda web + mobile em paralelo (turbo)
pnpm dev:web        # só o Next.js
pnpm dev:mobile     # só o Expo
pnpm build          # build de todos os workspaces
pnpm lint           # lint em todos
pnpm typecheck      # tsc --noEmit em todos
pnpm test           # testes em todos
```

## Deploy

- **Web (landing):** Cloudflare Pages via `@opennextjs/cloudflare` (script em `apps/web`)
- **Mobile:** EAS Build + Submit para App Store / Play Store
