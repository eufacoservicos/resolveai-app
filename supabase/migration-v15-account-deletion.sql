-- ============================================
-- MIGRATION v15 - Exclusão de conta pelo próprio usuário
-- ============================================
--
-- Por que existe: hoje a exclusão só acontece na web, usando o client admin
-- com a SUPABASE_SERVICE_ROLE_KEY. O app não pode carregar essa chave — ela
-- daria poder total sobre o banco a quem descompilasse o APK.
--
-- A Google Play exige que todo app com criação de conta ofereça a exclusão
-- dentro do próprio app. Esta função resolve os dois problemas: roda com
-- privilégio elevado no servidor, mas só apaga o usuário autenticado.
--
-- Apagar de auth.users cascateia para public.users e, a partir daí, para
-- provider_profiles, reviews, favorites, portfolio_images e o resto.
-- O que não cascateia são os arquivos no storage, apagados aqui explicitamente.

create or replace function public.delete_own_account()
returns void as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'É preciso estar autenticado para excluir a conta.'
      using errcode = '28000';
  end if;

  -- Arquivos ficam fora do cascade das foreign keys
  delete from storage.objects
   where bucket_id in ('portfolio', 'avatars', 'verifications')
     and (storage.foldername(name))[1] = uid::text;

  -- Cascateia para todo o restante do schema público
  delete from auth.users where id = uid;
end;
$$ language plpgsql security definer set search_path = public, auth, storage;

comment on function public.delete_own_account() is
  'Apaga a conta do usuário autenticado, incluindo os arquivos no storage. Usada pelo app e pela web.';

-- Só quem está logado pode chamar, e a função ignora qualquer argumento:
-- não há como pedir a exclusão da conta de outra pessoa.
revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
