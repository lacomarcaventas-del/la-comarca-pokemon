-- Seguimiento y auditoría de pedidos
alter table public.orders add column if not exists customer_id uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists tracking_carrier text;
alter table public.orders add column if not exists tracking_number text;
alter table public.orders add column if not exists shipped_at timestamptz;

create table if not exists public.order_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  changed_by uuid references auth.users(id) on delete set null,
  actor_role text,
  action text not null,
  old_status text,
  new_status text,
  old_tracking_carrier text,
  new_tracking_carrier text,
  old_tracking_number text,
  new_tracking_number text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_history_order_idx on public.order_history(order_id, created_at desc);
create index if not exists orders_customer_idx on public.orders(customer_id);

create or replace function public.record_order_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role text;
  action_name text;
begin
  select p.role into actor_role from public.profiles p where p.id = auth.uid();

  if tg_op = 'INSERT' then
    action_name := 'created';
    insert into public.order_history(order_id,changed_by,actor_role,action,new_status,new_tracking_carrier,new_tracking_number,note)
    values(new.id,auth.uid(),actor_role,action_name,new.status,new.tracking_carrier,new.tracking_number,'Pedido creado');
    return new;
  end if;

  if old.status is distinct from new.status then
    action_name := 'status_changed';
  elsif old.tracking_carrier is distinct from new.tracking_carrier or old.tracking_number is distinct from new.tracking_number then
    action_name := 'tracking_changed';
  else
    action_name := 'updated';
  end if;

  insert into public.order_history(
    order_id,changed_by,actor_role,action,
    old_status,new_status,
    old_tracking_carrier,new_tracking_carrier,
    old_tracking_number,new_tracking_number,
    note
  ) values (
    new.id,auth.uid(),actor_role,action_name,
    old.status,new.status,
    old.tracking_carrier,new.tracking_carrier,
    old.tracking_number,new.tracking_number,
    case when old.tracking_number is distinct from new.tracking_number then 'Datos de envío actualizados' else 'Pedido actualizado' end
  );
  return new;
end;
$$;

drop trigger if exists orders_history_trigger on public.orders;
create trigger orders_history_trigger
after insert or update on public.orders
for each row execute function public.record_order_history();

alter table public.order_history enable row level security;
grant select on public.order_history to authenticated;
grant select on public.orders to authenticated;
grant select on public.order_items to authenticated;

drop policy if exists "customer read own orders" on public.orders;
create policy "customer read own orders" on public.orders
for select to authenticated
using(customer_id = (select auth.uid()) or (select coalesce((auth.jwt()->'app_metadata'->>'role'),'')='admin'));

drop policy if exists "customer read own order items" on public.order_items;
create policy "customer read own order items" on public.order_items
for select to authenticated
using(exists(select 1 from public.orders o where o.id=order_items.order_id and (o.customer_id=(select auth.uid()) or (select coalesce((auth.jwt()->'app_metadata'->>'role'),'')='admin'))));

drop policy if exists "customer read own order history" on public.order_history;
create policy "customer read own order history" on public.order_history
for select to authenticated
using(exists(select 1 from public.orders o where o.id=order_history.order_id and (o.customer_id=(select auth.uid()) or (select coalesce((auth.jwt()->'app_metadata'->>'role'),'')='admin'))));
