-- Add a display name and make normal customer accounts default to usuario.
alter table public.profiles
  add column if not exists username text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('admin','usuario','tester'));

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    'usuario'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Backfill names from Auth metadata and preserve existing classifications.
update public.profiles p
set username = coalesce(
  nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
  split_part(u.email, '@', 1)
)
from auth.users u
where u.id = p.id
  and (p.username is null or trim(p.username) = '');

-- Existing default testers are normal users unless explicitly designated later.
update public.profiles
set role = 'usuario'
where role = 'tester';
