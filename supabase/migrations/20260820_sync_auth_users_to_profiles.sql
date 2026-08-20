-- Keep public.profiles synchronized with Supabase Auth.
-- Every newly created auth user receives a default tester profile.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'tester')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

-- Backfill users that were created before the trigger existed.
insert into public.profiles (id, role)
select u.id, 'tester'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
