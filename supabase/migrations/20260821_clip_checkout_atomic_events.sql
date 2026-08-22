alter table public.orders add column if not exists payment_checkout_url text;

create or replace function public.apply_clip_checkout_event(p_payment_request_id text,p_resource_status text,p_receipt_no text default null,p_payment_type text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_order public.orders%rowtype; v_item record; v_released integer:=0;
begin
 if coalesce(auth.role(),'')<>'service_role' then raise exception 'SERVICE_ROLE_REQUIRED'; end if;
 select * into v_order from public.orders where payment_request_id=p_payment_request_id for update;
 if not found then raise exception 'ORDER_NOT_FOUND'; end if;
 if upper(coalesce(p_resource_status,''))='COMPLETED' then
  if v_order.status='paid' or v_order.payment_completed_at is not null then return jsonb_build_object('ok',true,'duplicate',true,'order_id',v_order.id,'status','paid'); end if;
  if v_order.status not in ('pending','contacted') then raise exception 'ORDER_NOT_PAYABLE'; end if;
  if v_order.payment_expires_at is not null and v_order.payment_expires_at<=now() then raise exception 'PAYMENT_AFTER_RESERVATION_EXPIRY'; end if;
  for v_item in select card_id,quantity from public.order_items where order_id=v_order.id order by card_id loop
   update public.cards set stock=stock-v_item.quantity,reserved_stock=greatest(reserved_stock-v_item.quantity,0),updated_at=now() where id=v_item.card_id and stock>=v_item.quantity and reserved_stock>=v_item.quantity;
   if not found then raise exception 'RESERVATION_OR_STOCK_MISMATCH'; end if;
  end loop;
  update public.orders set status='paid',payment_provider='clip',payment_receipt_no=coalesce(p_receipt_no,payment_receipt_no),payment_type=coalesce(p_payment_type,payment_type),payment_completed_at=coalesce(payment_completed_at,now()),updated_at=now() where id=v_order.id;
  return jsonb_build_object('ok',true,'order_id',v_order.id,'status','paid');
 end if;
 if upper(coalesce(p_resource_status,'')) in ('EXPIRED','CANCELED','CANCELLED') then
  if v_order.status in ('pending','contacted') then
   for v_item in select card_id,quantity from public.order_items where order_id=v_order.id order by card_id loop update public.cards set reserved_stock=greatest(reserved_stock-v_item.quantity,0),updated_at=now() where id=v_item.card_id; v_released:=v_released+v_item.quantity; end loop;
   update public.orders set status='cancelled',cancelled_at=now(),cancellation_reason=case upper(p_resource_status) when 'EXPIRED' then 'Link de pago Clip expirado' else 'Link de pago Clip cancelado' end,updated_at=now() where id=v_order.id;
  end if;
  return jsonb_build_object('ok',true,'order_id',v_order.id,'status','cancelled','released_units',v_released);
 end if;
 return jsonb_build_object('ok',true,'ignored',true,'order_id',v_order.id,'status',v_order.status);
end; $$;
revoke all on function public.apply_clip_checkout_event(text,text,text,text) from public;
grant execute on function public.apply_clip_checkout_event(text,text,text,text) to service_role;
