-- Dodisa CMS schema for Supabase.
-- Not auto-applied: run this once in the new project's SQL Editor
-- (Project Settings -> SQL Editor -> New query -> paste -> Run).
-- Reproduces the tables/policies the app already relies on via the anon
-- key in src/context/AppContext.tsx and the storage helpers under
-- src/components/*.tsx. No Supabase Auth is used, so policies are public
-- read/write to match current behavior.

create table if not exists published_content (
  section_key text primary key,
  content_data jsonb,
  updated_at timestamptz default now(),
  updated_by text,
  is_published boolean default true
);

create table if not exists draft_content (
  section_key text primary key,
  content_data jsonb,
  updated_at timestamptz default now(),
  updated_by text,
  is_published boolean default true
);

create table if not exists site_settings (
  id integer primary key check (id = 1),
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  logo_alt text,
  logo_link text,
  logo_width_desktop integer,
  logo_width_mobile integer,
  updated_at timestamptz default now(),
  updated_by text
);

alter table published_content enable row level security;
alter table draft_content enable row level security;
alter table site_settings enable row level security;

create policy "public read published_content" on published_content
  for select using (true);
create policy "public write published_content" on published_content
  for insert with check (true);
create policy "public update published_content" on published_content
  for update using (true) with check (true);

create policy "public read draft_content" on draft_content
  for select using (true);
create policy "public write draft_content" on draft_content
  for insert with check (true);
create policy "public update draft_content" on draft_content
  for update using (true) with check (true);

create policy "public read site_settings" on site_settings
  for select using (true);
create policy "public write site_settings" on site_settings
  for insert with check (true);
create policy "public update site_settings" on site_settings
  for update using (true) with check (true);

-- Storage bucket used for gallery images/videos and logo/favicon uploads
-- (paths: gallery/<folder>/<file>, logos/<file>).
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

create policy "public read site-assets" on storage.objects
  for select using (bucket_id = 'site-assets');
create policy "public write site-assets" on storage.objects
  for insert with check (bucket_id = 'site-assets');
create policy "public update site-assets" on storage.objects
  for update using (bucket_id = 'site-assets') with check (bucket_id = 'site-assets');
create policy "public delete site-assets" on storage.objects
  for delete using (bucket_id = 'site-assets');
