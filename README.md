# eufaço!

Monorepo da plataforma que conecta clientes a prestadores de serviço locais.

## Estrutura

```
apps/
  landing/          Next.js 16 — site público (App Router, Cloudflare Workers)
  mobile/           Expo SDK 57 — app React Native (expo-router)
packages/
  design-system/    Tokens e componentes base, fonte única do visual
  shared/           Domínio e acesso a dados, usados pelos dois apps
  db-tests/         Roda o schema num Postgres real e verifica os gatilhos
supabase/           Schema, migrações e Edge Functions
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

Todas as telas do Pen estão implementadas e falam com o Supabase: Home,
Buscar, Categorias, Favoritos, Perfil, detalhe do prestador, login, cadastro,
completar perfil, localização, contatos, avaliar, responder avaliação,
denúncia, bloqueio, planos, assinatura, ofertas, portfólio, horários, avisos e
o cadastro de prestador. Sessão persiste entre aberturas via AsyncStorage.

Falta para o produto ficar completo:

- **Cobrança da assinatura.** `plans.tsx` mostra o plano e explica que o
  pagamento está em preparo. Ativar exige o produto no Play Console e o
  Google Play Billing — nada disso existe no repositório ainda. Enquanto isso,
  `provider_subscriptions` só muda pelo service role.

## Cota de orçamentos

O plano grátis recebe 10 orçamentos por mês. Passado o limite o perfil
**continua visível na busca** e só o botão de contato pausa, até a virada do
mês ou a assinatura — é o que a tela `quota-reached` promete ao prestador.

A regra vive no banco, não na tela: `enforce_quote_quota` (migration v23)
recusa o clique que passaria do limite, então esconder o botão é cortesia com
quem está olhando, não a trava. App e landing perguntam antes por
`provider_accepts_quotes`, que devolve só um booleano — quanto o concorrente
já recebeu no mês não é público.

O prestador é avisado quando restam 3 e de novo no último.

## Notificações

Três camadas, cada uma útil sozinha:

1. **Os avisos existem** — gatilhos da migration v21 escrevem em
   `notifications` quando alguém pede orçamento, avalia ou responde uma
   avaliação. Cada um respeita a preferência correspondente.
2. **A central mostra** — `/notifications` no app, com contador de não lidos
   no sino da Home.
3. **O aparelho recebe** — a Edge Function `send-push` lê `push_tokens` e
   entrega pela API do Expo. O gatilho da v22 a chama por `pg_net`, de forma
   assíncrona: push que falha não derruba o aviso na central.

`quiet_hours` silencia o aparelho, nunca a central — o aviso continua gravado
para a pessoa achar de manhã.

### Publicando o envio de push

```bash
supabase functions deploy send-push
```

A função roda em **Deno**, não em Node — `supabase/functions` fica de fora dos
`tsconfig` do monorepo de propósito, e `npm run typecheck` não a cobre. No VS
Code, `.vscode/settings.json` liga o language server do Deno só nessa pasta;
para o editor resolver os imports é preciso a extensão
[denoland.vscode-deno](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno).
Sem ela o arquivo acusa "cannot find module" — é o TypeScript do Node tentando
ler código de Deno, não um erro do código.

Depois, uma vez por banco, no SQL Editor:

```sql
select public.set_push_config(
  'https://SEU-REF.supabase.co/functions/v1',
  'SUA_SERVICE_ROLE_KEY'
);
```

Os dois valores vão para o **Vault**, que guarda criptografado e só expõe via
`vault.decrypted_secrets` — o gatilho lê de lá. Não use
`alter database ... set app.settings.*`: no Supabase hospedado o papel
`postgres` não é superusuário e o comando é recusado com
`42501: permission denied to set parameter`.

Rode a mesma função de novo a cada rotação da chave; ela atualiza no lugar.

Sem essa configuração o gatilho não faz nada e os avisos ficam só na central —
de propósito, para o insert nunca falhar por causa do push.

A `service_role_key` ignora toda a RLS e dá acesso total ao banco. Ela vive
só no Vault e nos segredos das Edge Functions — nunca no app, na landing, num
arquivo versionado ou numa captura de tela.

Contas Expo com "Enhanced Security" para push precisam também de
`supabase secrets set EXPO_ACCESS_TOKEN=...`.

### A landing ainda serve o app da Play Store

`public/.well-known/assetlinks.json` declara `handle_all_urls` para
`br.com.eufaco.app`: o app publicado hoje é um TWA que carrega o site em
`/home`. Remover as rotas do Next.js derruba o app de quem já usa. O corte só
pode acontecer depois que a build Expo substituir o TWA na loja — e ela precisa
do mesmo package name e da mesma assinatura para atualizar a listagem existente.

## Migrações pendentes

Rode na ordem, pelo SQL Editor do Supabase. Cada arquivo é independente e
pode ser aplicado sozinho:

| Arquivo | O que destrava |
| --- | --- |
| `migration-v15-account-deletion.sql` | Exclusão de conta pelo app (exigência da Play Store) |
| `migration-v16-subscriptions.sql` | Planos, assinatura e a cota de 10 orçamentos |
| `migration-v17-offers.sql` | Ofertas e descontos do plano pago |
| `migration-v18-moderation.sql` | Denúncia e bloqueio (exigência da Play Store) |
| `migration-v19-notifications.sql` | Push, central de avisos e preferências |
| `migration-v20-own-contacts.sql` | "Meus contatos" — sem ela a tela abre vazia |
| `migration-v21-notification-triggers.sql` | Quem cria os avisos da central |
| `migration-v22-push-delivery.sql` | Entrega do push no aparelho |
| `migration-v23-quota-enforcement.sql` | A cota de 10 orçamentos passa a valer |

Dependências: v17 → v16 (`provider_plan`), v19 → v16 (`touch_updated_at`),
v21 → v19 (`notifications`), v22 → v21 (o gatilho pendura em `notifications`),
v23 → v16 e v21 (`provider_quote_usage` e `push_notification`). As demais são
independentes.

A v22 só funciona depois de `supabase functions deploy send-push` — veja
*Notificações*, acima.

### Conferindo se o push saiu do banco

A chamada do gatilho é assíncrona, então ela não aparece no resultado do
`insert`. O `pg_net` guarda a resposta por 6 horas:

```sql
-- 1. Os segredos entraram?
select name from vault.secrets
 where name in ('push_edge_base_url', 'push_service_role_key');

-- 2. Cria um aviso de teste para a sua própria conta
insert into public.notifications (user_id, type, title, body)
select id, 'system', 'Teste', 'Conferindo o circuito de push.'
  from public.users where email = 'SEU@EMAIL';

-- 3. Poucos segundos depois: o que a Edge Function respondeu
select status_code, content, created
  from net._http_response order by id desc limit 3;
```

`status_code` 200 com `{"skipped":"no_devices"}` é o resultado esperado
enquanto nenhum aparelho estiver registrado — prova que o gatilho disparou,
que o Vault foi lido, que a chave autenticou e que a função rodou. Com um
aparelho registrado, vira `{"sent":1,...}`.

`401` significa chave errada no Vault; `404`, URL errada; nenhuma linha
significa que o gatilho não disparou — confira o passo 1.

Depois, `delete from public.notifications where title = 'Teste';`.

### Testando as migrações

`packages/db-tests` sobe um Postgres de verdade em WASM (PGlite, sem Docker),
aplica o schema e todas as migrações na ordem e verifica o comportamento dos
gatilhos: a cota que recusa o 11º orçamento, os avisos que nascem de cada
evento, a preferência que os silencia e a RLS de "Meus contatos".

```bash
npm run test --workspace @eufaco/db-tests
```

O que o Supabase fornece e o Postgres puro não tem — `auth.uid()`, `pg_net`,
Storage, as extensões — está dublado em `src/fixture.sql`. Nada ali é
verificado; existe só para o schema subir.

Nenhuma delas apaga dado existente.

## Notas do monorepo

- `apps/mobile/metro.config.js` aponta o Metro para a raiz do workspace. Sem
  isso o bundler não enxerga `packages/`.
- `apps/landing/next.config.ts` declara `transpilePackages` porque o design
  system é distribuído como TypeScript, sem build.
- As variáveis de ambiente da landing ficam em `apps/landing/.env.local`.
