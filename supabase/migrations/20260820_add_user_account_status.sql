alter table public.profiles add column if not exists status text;
update public.profiles set status = case when role = 'admin' then 'aprobado' else 'pendiente' end where status is null;
alter table public.profiles alter column status set default 'pendiente';
alter table public.profiles alter column status set not null;
alter table public.profiles drop constraint if exists profiles_status_check;
alter table public.profiles add constraint profiles_status_check check (status in ('pendiente','aprobado','rechazado','suspendido'));
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('usuario','agent','tester','admin'));

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role, status)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    'usuario',
    'pendiente'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop policy if exists "admin manage profiles" on public.profiles;
create policy "admin manage profiles"
on public.profiles
for update
to authenticated
using (coalesce((auth.jwt()->'app_metadata'->>'role'),'')='admin')
with check (coalesce((auth.jwt()->'app_metadata'->>'role'),'')='admin');
