-- ============================================
-- MIGRATION v23 - A cota de orçamentos passa a valer
-- ============================================
--
-- A v16 ensinou o banco a contar (`provider_quote_usage`) e o app a avisar,
-- mas nada impedia o 11º contato de um prestador no plano grátis. O limite
-- era um número na tela, não uma regra.
--
-- O comportamento implementado é o que a tela `quota-reached` já promete ao
-- prestador: "Seu perfil continua visível na busca, mas o botão de orçamento
-- fica pausado até [a virada do mês]". Ou seja — some o botão, não o perfil.
-- Esconder o perfil puniria o prestador duas vezes e tiraria da busca alguém
-- que a pessoa talvez estivesse procurando pelo nome.
--
-- Duas peças:
--
--   provider_accepts_quotes()  o app pergunta antes de mostrar o botão
--   enforce_quote_quota()      o banco recusa o clique que passar do limite
--
-- A função devolve só um booleano de propósito: quanto o concorrente já
-- recebeu este mês não é da conta de quem consulta.
--
-- Idempotente: pode rodar de novo sem duplicar nada.

-- ============================================
-- Este prestador ainda pode receber orçamento?
-- ============================================

create or replace function public.provider_accepts_quotes(p_provider_id uuid)
returns boolean as $$
  select not coalesce(
    (select exhausted from public.provider_quote_usage(p_provider_id)),
    false
  );
$$ language sql stable security definer set search_path = public;

comment on function public.provider_accepts_quotes(uuid) is
  'Falso quando o prestador do plano grátis já usou os 10 orçamentos do mês. Só o booleano, sem expor a contagem.';

grant execute on function public.provider_accepts_quotes(uuid) to authenticated, anon;

-- ============================================
-- O banco recusa o clique que passa do limite
-- ============================================
--
-- A tela já esconde o botão, mas esconder é aparência. Sem esta trava o
-- limite continuaria contornável por qualquer chamada direta à API.

create or replace function public.enforce_quote_quota()
returns trigger as $$
begin
  if not public.provider_accepts_quotes(new.provider_id) then
    raise exception
      'Este profissional atingiu o limite de orçamentos do mês.'
      using errcode = 'P0001', hint = 'quota_exhausted';
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

comment on function public.enforce_quote_quota() is
  'Trava a cota do plano grátis na escrita, para o limite não depender da tela.';

drop trigger if exists on_whatsapp_click_quota on public.whatsapp_clicks;
create trigger on_whatsapp_click_quota
  before insert on public.whatsapp_clicks
  for each row execute function public.enforce_quote_quota();

-- ============================================
-- Avisa o prestador antes de acabar
-- ============================================
--
-- Descobrir que a cota acabou só quando ela acabou é tarde para decidir
-- assinar. A preferência `quota_warnings` da v19 existia sem ninguém para
-- dispará-la; o aviso sai quando restam 3 e de novo no último.
--
-- Roda depois do gatilho de aviso da v21, na mesma inserção.

create or replace function public.notify_quota_warning()
returns trigger as $$
declare
  v_owner uuid;
  v_usage record;
  v_left integer;
begin
  select * into v_usage from public.provider_quote_usage(new.provider_id);

  -- Plano pago não tem cota para avisar
  if v_usage.quota is null then
    return null;
  end if;

  v_left := v_usage.quota - v_usage.used;

  if v_left <> 3 and v_left <> 0 then
    return null;
  end if;

  select p.user_id into v_owner
    from public.provider_profiles p
   where p.id = new.provider_id;

  if v_owner is null then
    return null;
  end if;

  perform public.push_notification(
    v_owner,
    'quota_warning',
    'quota_warnings',
    case when v_left = 0
      then 'Seus orçamentos do mês acabaram'
      else 'Restam 3 orçamentos este mês'
    end,
    case when v_left = 0
      then 'O botão de orçamento fica pausado até a virada do mês. Assine para não parar.'
      else 'Depois disso o botão de orçamento fica pausado até a virada do mês.'
    end,
    jsonb_build_object('route', case when v_left = 0 then '/quota-reached' else '/plans' end)
  );

  return null;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_whatsapp_click_quota_warning on public.whatsapp_clicks;
create trigger on_whatsapp_click_quota_warning
  after insert on public.whatsapp_clicks
  for each row execute function public.notify_quota_warning();
