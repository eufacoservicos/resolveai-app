# @resolveai/mobile

App eufaço! em React Native (Expo SDK 52 + Expo Router + NativeWind).

## Requisitos

- Node ≥ 20
- pnpm 10
- Expo Go (dev rápido) ou EAS CLI (build e distribuição)

## Setup

```bash
# Da raiz do monorepo:
pnpm install

# Copie o template de env e preencha:
cp apps/mobile/.env.example apps/mobile/.env.local
```

Preencha `.env.local`:
- `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY` — obrigatórios (Supabase Dashboard > Project Settings > API)
- `EXPO_PUBLIC_POSTHOG_API_KEY` — opcional (analytics)

No Supabase Dashboard > **Authentication > URL Configuration**:
- Adicione `eufaco://callback` na lista de **Redirect URLs**
- Se usar OAuth (Google), configure os credenciais correspondentes

## Rodar em dev

```bash
pnpm dev:mobile              # inicia o Metro bundler
# Depois, no dispositivo:
#   - iOS Simulator: aperte `i` no terminal
#   - Android Emulator: aperte `a`
#   - Dispositivo físico: escaneie o QR com Expo Go
```

## Build (EAS)

Configurado em `eas.json` com 3 perfis:

```bash
eas login                                  # primeiro uso
eas project:init                           # associa a um projeto EAS

eas build --profile development --platform android    # dev client APK
eas build --profile preview --platform android        # APK de teste interno
eas build --profile production --platform all         # loja
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Antes do primeiro submit, ajuste em `eas.json` → `submit.production`:
- iOS: `appleId`, `ascAppId`, `appleTeamId`
- Android: colocar o `google-play-service-account.json` na raiz

## Estrutura

```
app/                       Rotas Expo Router
  _layout.tsx              Providers globais (Query, Auth, Analytics, Toaster)
  index.tsx                Redirect por auth
  (auth)/
    _layout.tsx            Redirect se logado
    login.tsx
    register.tsx
    forgot-password.tsx
  (main)/
    _layout.tsx            Bottom tabs
    home.tsx
    search.tsx
    favorites.tsx
    categories.tsx
    become-provider.tsx
    profile/
      index.tsx
    provider/
      [id].tsx
      edit.tsx
      portfolio.tsx
src/
  components/
    ui/                    Design system (Button, Input, Card, Text, Badge, ...)
    providers/             Business components (ProviderCard, ProviderDetail, filtros)
  lib/
    supabase.ts            Client com AsyncStorage
    auth-provider.tsx      Context + useAuth
    oauth.ts               OAuth via WebBrowser
    analytics.tsx          PostHog (no-op se sem API key)
    category-icons.ts      Slug → LucideIcon
assets/                    Ícones e splash (placeholders — trocar por 1024x1024 finais)
app.json                   Configuração Expo
eas.json                   Perfis EAS Build/Submit
metro.config.js            Monorepo config
babel.config.js            NativeWind
tailwind.config.js         Tokens
```

## Assets pendentes (placeholders)

`assets/*.png` hoje são cópias do ícone 512x512 do web. Antes de publicar:
- `icon.png` — 1024x1024 (App Store icon)
- `adaptive-icon.png` — 1024x1024 (Android foreground)
- `splash-icon.png` — 1024x1024 (splash centralizado)
- `favicon.png` — 48x48 (web build)
