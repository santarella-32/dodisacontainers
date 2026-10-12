-- Endurecimento de segurança do CMS (auditoria de 2026-09-29).
-- NÃO executado automaticamente: rodar uma vez no SQL Editor do Supabase.
-- Idempotente e dentro de uma transação.
--
-- schema.sql criou policies de escrita públicas ("No Supabase Auth is used"),
-- mas o painel hoje entra com supabase.auth.signInWithPassword. Com a anon
-- key no bundle, qualquer visitante podia reescrever o conteúdo publicado do
-- site (textos, WhatsApp, links), logos e apagar/trocar imagens e vídeos.
--
-- Depois de rodar:
--   1. Confira a lista de admins no final (SELECT) e remova quem não deveria
--      estar lá: delete from public.cms_admins where user_id = '...';
--   2. No painel do Supabase → Authentication → Sign In / Providers, desative
--      "Allow new users to sign up" (o site não tem cadastro público).

begin;

create table if not exists public.cms_admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.cms_admins enable row level security;
revoke all on public.cms_admins from anon, authenticated;

-- Hoje as contas do Auth deste projeto são as do painel (o site não tem
-- cadastro): todas viram admin. Revise a lista no final.
insert into public.cms_admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

create or replace function public.is_cms_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.cms_admins where user_id = auth.uid());
$$;
revoke all on function public.is_cms_admin() from public;
grant execute on function public.is_cms_admin() to anon, authenticated;

-- Conteúdo: leitura continua pública, escrita só de admin
drop policy if exists "public write published_content" on published_content;
drop policy if exists "public update published_content" on published_content;
drop policy if exists "admin write published_content" on published_content;
create policy "admin write published_content" on published_content
  for insert to authenticated with check (public.is_cms_admin());
drop policy if exists "admin update published_content" on published_content;
create policy "admin update published_content" on published_content
  for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "public write draft_content" on draft_content;
drop policy if exists "public update draft_content" on draft_content;
drop policy if exists "admin write draft_content" on draft_content;
create policy "admin write draft_content" on draft_content
  for insert to authenticated with check (public.is_cms_admin());
drop policy if exists "admin update draft_content" on draft_content;
create policy "admin update draft_content" on draft_content
  for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "public write site_settings" on site_settings;
drop policy if exists "public update site_settings" on site_settings;
drop policy if exists "admin write site_settings" on site_settings;
create policy "admin write site_settings" on site_settings
  for insert to authenticated with check (public.is_cms_admin());
drop policy if exists "admin update site_settings" on site_settings;
create policy "admin update site_settings" on site_settings
  for update to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

-- Storage site-assets: leitura pública, escrita só de admin
drop policy if exists "public write site-assets" on storage.objects;
drop policy if exists "public update site-assets" on storage.objects;
drop policy if exists "public delete site-assets" on storage.objects;

drop policy if exists "admin write site-assets" on storage.objects;
create policy "admin write site-assets" on storage.objects
  for insert to authenticated with check (bucket_id = 'site-assets' and public.is_cms_admin());
drop policy if exists "admin update site-assets" on storage.objects;
create policy "admin update site-assets" on storage.objects
  for update to authenticated
  using (bucket_id = 'site-assets' and public.is_cms_admin())
  with check (bucket_id = 'site-assets' and public.is_cms_admin());
drop policy if exists "admin delete site-assets" on storage.objects;
create policy "admin delete site-assets" on storage.objects
  for delete to authenticated using (bucket_id = 'site-assets' and public.is_cms_admin());

commit;

-- Revisar quem ficou como admin:
select a.user_id, u.email, u.created_at, u.last_sign_in_at
from public.cms_admins a join auth.users u on u.id = a.user_id
order by u.created_at;
