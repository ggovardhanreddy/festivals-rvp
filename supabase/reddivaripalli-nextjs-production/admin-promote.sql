-- Run this manually in Supabase SQL Editor after creating the admin user
-- Replace the email with the exact account email you control.
insert into public.profiles(id, display_name, role)
select id, coalesce(raw_user_meta_data->>'full_name', split_part(email,'@',1)), 'admin'
from auth.users
where lower(email) = lower('YOUR_ADMIN_EMAIL')
on conflict (id) do update set role='admin';
