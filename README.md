# eufaço!

Monorepo da plataforma que conecta clientes a prestadores de serviço locais.

## Estrutura

```
apps/
  landing/          Next.js 16 — site público (App Router, Cloudflare Workers)
  mobile/           Expo SDK 57 — app React Native (expo-router)
packages/
  design-system/    Tokens e componentes base, fonte única do visual
supabase/           Schema e migrações do banco
```

## Começando

```bash
npm install          # instala todos os workspaces de uma vez, na raiz
npm run dev          # sobe landing e app em paralelo
npm run dev:landing  # só a landing  (localhost:3000)
npm run dev:mobile   # só o app      (Expo Dev Server)
```

Outros comandos, todos orquestrados pelo Turborepo a partir da raiz:

```bash
npm run build        # build de produção de todos os apps
npm run typecheck    # tsc --noEmit em todos os pacotes
npm run lint
npm run test
```

## Design system

`packages/design-system` é a fonte única de cores, tipografia, raios e
espaçamentos. Os valores vêm do documento Pen `eufaco-app`.

- `src/tokens.ts` — valores em TypeScript, sem dependência de framework
- `tokens.css` — os mesmos valores como variáveis CSS, consumidos pela landing
- `src/native/` — `ThemeProvider` e componentes React Native (`Text`, `Button`,
  `Card`, `Badge`)

**Nunca escreva um hexadecimal direto num componente.** Mudou uma cor? Mude nos
dois arquivos de token e ela se propaga para o app e para a landing.

```tsx
// app
import { Text, Button, useTheme } from "@eufaco/design-system/native";
const { colors, spacing } = useTheme();

// landing — via as variáveis CSS já mapeadas em globals.css
<div className="bg-card text-foreground" />
```

### Fontes

Plus Jakarta Sans (títulos) e Inter (texto). No React Native cada peso é uma
família própria, porque fonte customizada não sintetiza peso no Android — use
sempre `nativeFonts` do design system, nunca `fontWeight` solto.

## Tema claro e escuro

Os dois temas são obrigatórios. No app, `ThemeProvider` segue o tema do sistema.
Na landing, a classe `dark` no `<html>` troca os `--ef-*` e todo o resto
acompanha por referência.

## Estado do app

Telas com dados reais: Home, Buscar, Categorias, Favoritos, Perfil, detalhe do
prestador, login e cadastro. Sessão persiste entre aberturas via AsyncStorage.

Ainda no Pen, sem implementação: planos e assinatura, ofertas, avaliar,
responder avaliação, denúncia, notificações, portfólio, horários e o fluxo de
cadastro de prestador.

### A landing ainda serve o app da Play Store

`public/.well-known/assetlinks.json` declara `handle_all_urls` para
`br.com.eufaco.app`: o app publicado hoje é um TWA que carrega o site em
`/home`. Remover as rotas do Next.js derruba o app de quem já usa. O corte só
pode acontecer depois que a build Expo substituir o TWA na loja — e ela precisa
do mesmo package name e da mesma assinatura para atualizar a listagem existente.

## Notas do monorepo

- `apps/mobile/metro.config.js` aponta o Metro para a raiz do workspace. Sem
  isso o bundler não enxerga `packages/`.
- `apps/landing/next.config.ts` declara `transpilePackages` porque o design
  system é distribuído como TypeScript, sem build.
- As variáveis de ambiente da landing ficam em `apps/landing/.env.local`.
