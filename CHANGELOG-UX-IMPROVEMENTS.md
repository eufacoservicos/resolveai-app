# Changelog - Melhorias UX/UI de Alto Impacto

**Data:** 2026-02-23
**Contexto:** Análise completa de UX/UI do MVP do eufaço! com implementação das correções de alto impacto identificadas.

---

## 1. CTAs da Landing Page redirecionam para o app (não mais para cadastro)

**Problema:** Todos os botões da landing page (hero, serviços, categorias, CTA final) redirecionavam para `/register`, impedindo o usuário de explorar o app antes de criar conta. Isso gera alto abandono.

**Solução:** CTAs agora direcionam para páginas públicas do app, permitindo ao usuário ver valor real antes de se comprometer.

**Alterações no arquivo `src/components/landing/landing-page.tsx`:**
- Hero CTA "Começar agora" → "Explorar profissionais" → redireciona para `/home`
- Search preview (barra de busca fake no hero) → redireciona para `/search`
- "Explorar todos os serviços" → redireciona para `/search`
- "Ver todas as categorias" → redireciona para `/categories`
- CTA Final "Quero contratar" → redireciona para `/home`
- Mantidos em `/register`: "Começar grátis" (navbar), "Quero oferecer serviços" (CTA final), "Criar conta" (footer)

---

## 2. Busca funcional no HomeHero

**Problema:** O campo de busca na home page era apenas um link estático para `/search`, sem funcionalidade real de busca. Criava expectativa não cumprida.

**Solução:** Transformado em input real que redireciona para `/search?q={termo}` ao pressionar Enter.

**Arquivo alterado:** `src/components/layout/home-hero.tsx`
- Removido: Link estático para `/search`
- Adicionado: Input funcional com `useState` e `useRouter`
- Ao digitar e pressionar Enter, redireciona para `/search?q={termo}`
- Placeholder atualizado: "O que você precisa? Ex: eletricista, pintor..."

---

## 3. Remoção de stats infladas e testimonials fake

**Problema:** A landing page continha:
- Seção de estatísticas com números inflados ("1000+ profissionais", "100+ cidades") que não refletem a realidade de um app novo
- Seção de depoimentos com fotos do Unsplash e textos inventados, facilmente identificáveis como falsos

Ambos prejudicam credibilidade e confiança do usuário.

**Solução:** Removidas completamente as seções de Estatísticas e Depoimentos da landing page, junto com o código não utilizado.

**Arquivo alterado:** `src/components/landing/landing-page.tsx`
- Removida seção "Estatísticas" (counter animado com números falsos)
- Removida seção "Depoimentos" (testimonials com fotos Unsplash)
- Removido componente `AnimatedCounter` (não mais utilizado)
- Removido array `testimonials` (dados estáticos falsos)
- Removida referência `statsBg` do objeto `serviceImages`

**Landing page agora contém:** Hero → Features → Serviços em Destaque → Como Funciona → Categorias Populares → CTA Final → Footer (mais enxuta e honesta)

---

## 4. Correção de `bg-white` hardcoded no Provider Detail

**Problema:** Vários cards no provider detail usavam `bg-white` hardcoded, que não responde ao dark mode e é inconsistente com o design system baseado em CSS variables.

**Solução:** Substituído `bg-white` por `bg-card` (que usa a variável `--card` do tema) em todos os cards do provider detail.

**Arquivo alterado:** `src/components/providers/provider-detail.tsx`
- Stats cards (Nota, Avaliações, Fotos): `bg-white` → `bg-card`
- Card "Sobre" (descrição): `bg-white` → `bg-card`
- Rating summary header (na aba reviews): `bg-white` → `bg-card`
- Avatar border: `border-white` → `border-background`

**Também corrigido em:** `src/components/auth/profile-view.tsx`
- Menu container: `bg-white` → `bg-card`
- Sign out button: `bg-white` → `bg-card`

---

## 5. Cadastro de Provider simplificado com wizard em 2 etapas

**Problema:** O formulário de registro como prestador colocava TODOS os campos numa única tela longa: nome, email, senha, confirmar senha, WhatsApp, CEP, descrição, categorias. Em mobile, isso significa muito scroll e alta probabilidade de abandono.

**Solução:** Dividido em 2 etapas com indicador visual de progresso.

**Arquivo alterado:** `src/app/(auth)/register/page.tsx`

**Passo 1 - Dados básicos:**
- Seleção de papel (Cliente/Prestador)
- Nome completo
- Email
- Senha e confirmação
- Botão "Próximo" (para prestadores) ou "Criar conta" (para clientes)
- Google OAuth (disponível apenas no passo 1)

**Passo 2 - Dados profissionais (apenas para prestadores):**
- WhatsApp
- CEP (com auto-preenchimento)
- Descrição dos serviços
- Categorias de serviço
- Botões "Voltar" e "Criar conta"

**Indicador de progresso:** Barra visual com dots que mostra em qual passo o usuário está.

**Validação:** Cada passo valida seus campos antes de permitir avançar.

---

## 6. Checklist de completude de perfil para prestadores

**Problema:** Após criar conta como prestador, o usuário caía na home sem orientação sobre próximos passos. Perfis incompletos (sem foto, sem portfólio, sem verificação) aparecem igual aos completos.

**Solução:** Checklist visual na página de perfil do prestador que mostra progresso e links diretos para completar cada item.

**Arquivo alterado:** `src/components/auth/profile-view.tsx`

**Componente adicionado:** `ProfileChecklist` com 5 itens verificáveis:
1. Foto de perfil (verifica `avatar_url`)
2. Descrição dos serviços (verifica `description.length > 10`)
3. Portfólio de trabalhos (verifica `portfolio.length > 0`)
4. Horário de funcionamento (verifica se existe pelo menos 1 dia não-fechado)
5. Verificação de identidade (verifica `is_verified`)

**Funcionalidades:**
- Barra de progresso visual (ex: 2/5 completos)
- Cada item incompleto é um link clicável para a página correspondente
- Itens completos aparecem com checkmark verde e riscados
- Checklist desaparece automaticamente quando todos os 5 itens estão completos
- Estilo em destaque (fundo amarelo/amber) para chamar atenção do prestador

**Interface `ProfileViewProps` atualizada** para aceitar dados adicionais do provider:
- `portfolio` (array de imagens)
- `business_hours` (horários de funcionamento)
- `is_verified` (status de verificação)

---

## Resumo dos arquivos alterados

| Arquivo | Tipo de alteração |
|---------|-------------------|
| `src/components/landing/landing-page.tsx` | CTAs atualizados, seções removidas, código limpo |
| `src/components/layout/home-hero.tsx` | Reescrito: link estático → input de busca funcional |
| `src/components/providers/provider-detail.tsx` | `bg-white` → `bg-card`, `border-white` → `border-background` |
| `src/app/(auth)/register/page.tsx` | Reescrito: form único → wizard de 2 etapas |
| `src/components/auth/profile-view.tsx` | Adicionado ProfileChecklist, `bg-white` → `bg-card` |

## 7. Fix: Confirmação de email de provider redirecionando para complete-profile

**Problema:** Ao criar conta como prestador via email (wizard de 2 etapas) e confirmar o email, o usuário era redirecionado para `/complete-profile` onde precisava preencher todos os dados **novamente**, apesar de já ter preenchido tudo no registro. Isso acontecia porque:
1. O `signUpWithEmail` salva os dados do provider nos `user_metadata` (como `provider_data`)
2. O trigger do banco cria um `provider_profiles` vazio (sem whatsapp)
3. O `confirm/route.ts` verificava `!profile.whatsapp` e redirecionava para `/complete-profile`

**Solução:**

**Arquivo `src/app/(auth)/auth/confirm/route.ts`:**
- Lógica de redirecionamento melhorada para distinguir entre provider com dados (email signup) e sem dados (OAuth)
- Se o perfil já tem whatsapp, vai direto para `/home`
- Se não tem, mas `provider_data` existe nos metadata, redireciona para `/complete-profile` que faz auto-submit

**Arquivo `src/app/(auth)/complete-profile/page.tsx`:**
- Adicionada função `autoCompleteProfile()` que cria o perfil automaticamente a partir dos metadata
- Quando `provider_data` está completo nos metadata (whatsapp + city + categoryIds), a página auto-submete sem interação do usuário
- Estado `autoSubmitting` mostra spinner "Configurando seu perfil..." durante o processo
- Após auto-submit, limpa `provider_data` dos metadata e redireciona para `/home`
- O formulário manual continua disponível para o fluxo Google OAuth

---

## 8. Fix: Dados do provider não são populados no perfil após registro

**Problema:** Ao criar conta como prestador e preencher todos os dados no wizard de 2 etapas (WhatsApp, CEP, descrição, categorias), os dados não apareciam na página de edição do perfil (`/provider/edit`). Todos os campos ficavam vazios. Isso acontecia porque:
1. O `signUpWithEmail` armazena os dados do provider nos `user_metadata` (como `provider_data`)
2. O trigger `handle_new_provider` no banco cria um `provider_profiles` **vazio** (apenas `user_id` e `is_active`)
3. O `autoCompleteProfile` no client-side tentava popular via upsert, mas podia falhar silenciosamente (sem try/catch)
4. Resultado: o perfil no banco ficava vazio, e a página de edição mostrava campos vazios

**Solução (3 camadas de correção):**

**1. Migration `supabase/migration-v7.sql` (correção principal):**
- Atualiza o trigger `handle_new_provider` para ler `provider_data` do `auth.users.raw_user_meta_data`
- Agora o trigger popula o `provider_profiles` com TODOS os dados (description, city, whatsapp, etc.) na hora do signup
- Também insere as categorias do provider (`provider_categories`) automaticamente
- Também cria os horários de funcionamento padrão (`business_hours`)
- Usa `ON CONFLICT DO UPDATE` para garantir que os dados são atualizados mesmo se a row já existir
- Roda com `SECURITY DEFINER` (sem problemas de RLS)

**2. Arquivo `src/app/(auth)/complete-profile/page.tsx` (fallback):**
- `autoCompleteProfile` agora verifica primeiro se o trigger já populou o perfil (checa `whatsapp` na tabela)
- Se já populou, apenas limpa os metadata e redireciona para `/home`
- Se não populou, faz o upsert como fallback
- Adicionado `try/catch` com logging para debug
- Corrigido `bg-white` → `bg-card` no container do formulário

**3. Arquivo `src/app/(auth)/auth/confirm/route.ts` (simplificado):**
- Lógica simplificada: verifica se `provider_profiles.whatsapp` existe
- Se sim → limpa metadata e redireciona para `/home`
- Se não → redireciona para `/complete-profile` como fallback
- Não depende mais de `provider_data` existir nos metadata

**4. Arquivo `src/components/providers/provider-profile-form.tsx`:**
- Corrigido `bg-white` hardcoded → `bg-card` no container do formulário de edição

---

## Resumo dos arquivos alterados

| Arquivo | Tipo de alteração |
|---------|-------------------|
| `src/components/landing/landing-page.tsx` | CTAs atualizados, seções removidas, código limpo |
| `src/components/layout/home-hero.tsx` | Reescrito: link estático → input de busca funcional |
| `src/components/providers/provider-detail.tsx` | `bg-white` → `bg-card`, `border-white` → `border-background` |
| `src/app/(auth)/register/page.tsx` | Reescrito: form único → wizard de 2 etapas |
| `src/components/auth/profile-view.tsx` | Adicionado ProfileChecklist, `bg-white` → `bg-card` |
| `src/app/(auth)/auth/confirm/route.ts` | Lógica de redirecionamento simplificada |
| `src/app/(auth)/complete-profile/page.tsx` | Auto-submit com fallback robusto, `bg-white` → `bg-card` |
| `src/components/providers/provider-profile-form.tsx` | `bg-white` → `bg-card` |
| `supabase/migration-v7.sql` | Trigger atualizado para popular perfil na hora do signup |

## Build

Todas as alterações foram verificadas com:
- `npx tsc --noEmit` - Zero erros de TypeScript
- `npm run build` - Build completo com sucesso
