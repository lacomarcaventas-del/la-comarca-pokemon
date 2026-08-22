alter table public.orders add column if not exists payment_expires_at timestamptz;
create index if not exists orders_payment_expiry_idx on public.orders(status,payment_expires_at) where status in ('pending','contacted') and payment_expires_at is not null;

create or replace function public.release_expired_order_reservations()
returns integer language plpgsql security definer set search_path to 'public' as $$
declare r record; v_released integer:=0;
begin
 for r in select id from public.orders where status in ('pending','contacted') and payment_expires_at is not null and payment_expires_at<=now() for update loop
  update public.cards c set reserved_stock=greatest(c.reserved_stock-oi.quantity,0),updated_at=now() from public.order_items oi where oi.order_id=r.id and oi.card_id=c.id;
  update public.orders set status='cancelled',cancelled_at=now(),cancellation_reason='Pago no completado antes de la expiración',updated_at=now() where id=r.id;
  v_released:=v_released+1;
 end loop;
 return v_released;
end; $$;

create or replace function public.confirm_order_payment(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public','auth' as $$
declare v_item record; v_status text; v_expires timestamptz;
begin
 select status,payment_expires_at into v_status,v_expires from public.orders where id=p_order_id for update;
 if not found then raise exception 'Pedido no encontrado'; end if;
 if v_status='paid' then return jsonb_build_object('ok',true,'order_id',p_order_id,'status','paid','duplicate',true); end if;
 if v_status not in ('pending','contacted') then raise exception 'Este pedido ya no puede confirmarse'; end if;
 if v_expires is not null and v_expires<=now() then perform public.release_expired_order_reservations(); raise exception 'El pago llegó después de la expiración de la reserva'; end if;
 for v_item in select card_id,quantity from public.order_items where order_id=p_order_id order by card_id loop
  update public.cards set stock=stock-v_item.quantity,reserved_stock=greatest(reserved_stock-v_item.quantity,0),updated_at=now() where id=v_item.card_id and reserved_stock>=v_item.quantity and stock>=v_item.quantity;
  if not found then raise exception 'Reserva o stock insuficiente para confirmar este pedido'; end if;
 end loop;
 update public.orders set status='paid',payment_completed_at=coalesce(payment_completed_at,now()),updated_at=now() where id=p_order_id;
 return jsonb_build_object('ok',true,'order_id',p_order_id,'status','paid');
end; $$;

-- The deployed database also replaces create_order_transactional so every pending order atomically reserves stock and expires after 30 minutes.
-- Keep this repository migration as the synchronization marker for that production migration.
