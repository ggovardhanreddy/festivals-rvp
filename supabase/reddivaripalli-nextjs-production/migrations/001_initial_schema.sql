-- Reddivaripalli production schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'viewer' check (role in ('admin','editor','viewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  title_te text,
  summary text,
  body text,
  body_te text,
  category text not null check (category in ('village','heritage','temples','festivals','people','development','gallery','news')),
  cover_image text,
  published boolean not null default false,
  featured boolean not null default false,
  event_date date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category, slug)
);

create index if not exists content_items_public_idx on public.content_items(category, published, created_at desc);
create index if not exists content_items_slug_idx on public.content_items(slug);

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create policy "Public can read published content"
on public.content_items for select
using (published = true or public.current_user_role() in ('admin','editor'));

create policy "Editors can insert content"
on public.content_items for insert to authenticated
with check (public.current_user_role() in ('admin','editor'));

create policy "Editors can update content"
on public.content_items for update to authenticated
using (public.current_user_role() in ('admin','editor'))
with check (public.current_user_role() in ('admin','editor'));

create policy "Admins can delete content"
on public.content_items for delete to authenticated
using (public.current_user_role() = 'admin');

create policy "Users can read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Admins can manage profiles"
on public.profiles for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

-- Create a profile row for each new auth user with least-privilege role.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, display_name, role)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)), 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Storage bucket for approved public village media.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('village-media','village-media',true,52428800,
  array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'])
on conflict (id) do nothing;

create policy "Public can view village media"
on storage.objects for select
using (bucket_id = 'village-media');

create policy "Editors can upload village media"
on storage.objects for insert to authenticated
with check (bucket_id = 'village-media' and public.current_user_role() in ('admin','editor'));

create policy "Editors can update own media"
on storage.objects for update to authenticated
using (bucket_id = 'village-media' and public.current_user_role() in ('admin','editor'))
with check (bucket_id = 'village-media' and public.current_user_role() in ('admin','editor'));

create policy "Admins can delete village media"
on storage.objects for delete to authenticated
using (bucket_id = 'village-media' and public.current_user_role() = 'admin');
