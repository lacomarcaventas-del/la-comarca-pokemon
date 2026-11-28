-- Critical RPC hardening for checkout and inventory operations.
-- Apply only after validating the payment webhook's service-role credentials.

-- Clip webhook settlement is backend-only. The live definition is SECURITY DEFINER
-- and does not enforce service_role itself, so the ACL is the security boundary.
revoke all on function public.apply_clip_checkout_event(text,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_clip_checkout_event(text,text,text,text) to service_role;

-- This legacy confirmation RPC has no in-function authorization check.
-- Keep it backend-only; the admin UI currently changes status through its
-- authenticated /api/admin/orders route instead.
revoke all on function public.confirm_order_payment(uuid) from public, anon, authenticated;
grant execute on function public.confirm_order_payment(uuid) to service_role;

-- Called internally by SECURITY DEFINER checkout functions; not a client RPC.
revoke all on function public.release_expired_order_reservations() from public, anon, authenticated;
grant execute on function public.release_expired_order_reservations() to service_role;

-- The order-preparation RPC currently has no authorization check but deducts stock.
-- Add an explicit admin check before any order or inventory mutation.
create or replace function public.move_order_to_preparing(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_item record;
  v_status text;
  v_processed timestamptz;
begin
  if auth.uid() is null or not public.is_admin_user() then
    raise exception 'ADMIN_REQUIRED';
  end if;

  select status, inventory_processed_at
    into v_status, v_processed
  from public.orders
  where id = p_order_id
  for update;

  if not found then raise exception 'Pedido no encontrado'; end if;
  if v_status = 'cancelled' then raise exception 'Un pedido cancelado no puede prepararse'; end if;

  if v_processed is not null then
    update public.orders set status = 'preparing', updated_at = now() where id = p_order_id;
    return jsonb_build_object('ok', true, 'inventory_already_processed', true);
  end if;

  perform set_config('app.checkout_operation', 'true', true);

  for v_item in
    select card_id, quantity
    from public.order_items
    where order_id = p_order_id
    order by card_id
  loop
    update public.cards
    set stock = stock - v_item.quantity,
        reserved_stock = greatest(reserved_stock - v_item.quantity, 0),
        updated_at = now()
    where id = v_item.card_id
      and stock >= v_item.quantity
      and reserved_stock >= v_item.quantity;

    if not found then raise exception 'Reserva o stock insuficiente para preparar este pedido'; end if;
  end loop;

  update public.orders
  set status = 'preparing', inventory_processed_at = now(), updated_at = now()
  where id = p_order_id;

  return jsonb_build_object('ok', true, 'inventory_processed', true);
end;
$function$;

revoke all on function public.move_order_to_preparing(uuid) from public, anon;
grant execute on function public.move_order_to_preparing(uuid) to authenticated, service_role;

-- Checkout creation is intentionally available to signed-in customers, not anon.
revoke all on function public.create_order_transactional(text,text,text,text,jsonb) from public, anon;
grant execute on function public.create_order_transactional(text,text,text,text,jsonb) to authenticated, service_role;

revoke all on function public.create_order_transactional(text,text,text,text,jsonb,text,numeric) from public, anon;
grant execute on function public.create_order_transactional(text,text,text,text,jsonb,text,numeric) to authenticated, service_role;

revoke all on function public.create_order_with_items(text,text,text,text,jsonb,text,numeric) from public, anon;
grant execute on function public.create_order_with_items(text,text,text,text,jsonb,text,numeric) to authenticated, service_role;

-- These functions have in-function admin/identity checks; remove anonymous execution.
revoke all on function public.set_inventory_import_active(uuid,boolean) from public, anon;
grant execute on function public.set_inventory_import_active(uuid,boolean) to authenticated, service_role;

revoke all on function public.undo_inventory_import(uuid,uuid,text) from public, anon;
grant execute on function public.undo_inventory_import(uuid,uuid,text) to authenticated, service_role;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on function public.is_admin_user() from public, anon;
grant execute on function public.is_admin_user() to authenticated, service_role;

revoke all on function public.is_staff_user() from public, anon;
grant execute on function public.is_staff_user() to authenticated, service_role;

revoke all on function public.can_agent_category(uuid,text) from public, anon;
grant execute on function public.can_agent_category(uuid,text) to authenticated, service_role;
