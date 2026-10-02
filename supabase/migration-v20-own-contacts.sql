-- ============================================
-- MIGRATION v20 - Histórico de contatos do cliente
-- ============================================
--
-- A tela "Meus contatos" lista com quem a pessoa já falou no WhatsApp e é
-- o único caminho do app que leva de volta para avaliar um profissional.
-- Ela lê `whatsapp_clicks` filtrando por `clicker_id`, mas a RLS só tinha
-- policy de leitura para o prestador dono do perfil — então a consulta
-- voltava vazia para todo mundo e a tela ficava permanentemente sem itens.
--
-- Esta policy é de leitura e só devolve as próprias linhas: ninguém passa a
-- enxergar contato de terceiros, e o prestador continua com a policy dele.
--
-- Idempotente: pode rodar de novo sem efeito colateral.

drop policy if exists "Users can read own whatsapp clicks" on public.whatsapp_clicks;

create policy "Users can read own whatsapp clicks"
  on public.whatsapp_clicks for select
  to authenticated
  using (clicker_id = auth.uid());

comment on table public.whatsapp_clicks is
  'Cliques no botão de orçamento. Alimenta a cota do prestador (provider_quote_usage) e o histórico de contatos do cliente.';

-- ============================================
-- Simetria para as visualizações de perfil
-- ============================================
--
-- O app registra a visita quando alguém abre um perfil, do mesmo jeito que
-- a landing já fazia. O insert já era permitido; o comentário abaixo só
-- documenta que a leitura continua restrita ao dono do perfil.

comment on table public.profile_views is
  'Visitas a perfis, vindas do app e da landing. Leitura restrita ao prestador dono do perfil.';
