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

create or replace function public.create_order_transactional(p_customer_name text,p_customer_email text,p_customer_phone text,p_notes text,p_items jsonb,p_shipping_method text default null,p_shipping_cost numeric default 0)
returns jsonb language plpgsql security definer set search_path to 'public','auth' as $$
declare v_order_id uuid; v_item jsonb; v_card_id uuid; v_qty integer; v_price numeric; v_subtotal numeric:=0; v_shipping numeric:=coalesce(p_shipping_cost,0); v_profile public.profiles; v_name text; v_email text; v_shipping_method text;
begin
 if auth.uid() is null then raise exception 'Debes iniciar sesión para crear un pedido'; end if;
 perform public.release_expired_order_reservations();
 v_shipping_method:=case lower(trim(coalesce(p_shipping_method,''))) when 'mexpost' then 'mexpost_3kg' when 'mexpost 3 kg' then 'mexpost_3kg' when 'mexpost_3kg' then 'mexpost_3kg' when 'fedex' then 'fedex_3kg' when 'fedex 3 kg' then 'fedex_3kg' when 'fedex_3kg' then 'fedex_3kg' else null end;
 if v_shipping<0 then raise exception 'Costo de envío inválido'; end if;
 if v_shipping_method is null then raise exception 'Selecciona una opción de envío válida'; end if;
 if (v_shipping_method='mexpost_3kg' and v_shipping<>200) or (v_shipping_method='fedex_3kg' and v_shipping<>380) then raise exception 'El costo de envío no coincide con el método seleccionado'; end if;
 select * into v_profile from public.profiles where id=auth.uid(); if not found then raise exception 'No fue posible localizar tu perfil'; end if;
 if not(v_profile.status='aprobado' or v_profile.role='admin') then raise exception 'Tu cuenta está pendiente de aprobación por La Comarca'; end if;
 if coalesce(trim(v_profile.phone),'')='' or coalesce(trim(v_profile.shipping_address),'')='' or coalesce(trim(v_profile.shipping_city),'')='' or coalesce(trim(v_profile.shipping_state),'')='' or coalesce(trim(v_profile.shipping_postal_code),'')='' then raise exception 'Completa tus datos de contacto y dirección de envío antes de realizar un pedido'; end if;
 select coalesce(nullif(trim(raw_user_meta_data->>'full_name'),''),v_profile.username),email into v_name,v_email from auth.users where id=auth.uid();
 if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then raise exception 'El pedido debe contener al menos un producto'; end if;
 create temporary table if not exists _order_request(card_id uuid primary key,quantity integer) on commit drop; truncate _order_request;
 for v_item in select * from jsonb_array_elements(p_items) loop v_card_id:=(v_item->>'card_id')::uuid; v_qty:=(v_item->>'quantity')::integer; if v_qty is null or v_qty<=0 then raise exception 'Cantidad inválida'; end if; insert into _order_request(card_id,quantity) values(v_card_id,v_qty) on conflict(card_id) do update set quantity=_order_request.quantity+excluded.quantity; end loop;
 for v_item in select to_jsonb(r) from _order_request r order by card_id loop
  v_card_id:=(v_item->>'card_id')::uuid; v_qty:=(v_item->>'quantity')::integer;
  select price into v_price from public.cards where id=v_card_id and published=true for update; if not found then raise exception 'Producto no encontrado'; end if;
  update public.cards set reserved_stock=reserved_stock+v_qty,updated_at=now() where id=v_card_id and stock-reserved_stock>=v_qty; if not found then raise exception 'Stock insuficiente para el producto'; end if;
  v_subtotal:=v_subtotal+(v_price*v_qty);
 end loop;
 insert into public.orders(customer_id,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_state,shipping_postal_code,shipping_country,shipping_method,shipping_cost,status,total,notes,payment_expires_at) values(auth.uid(),coalesce(v_name,p_customer_name),coalesce(v_email,v_profile.email,p_customer_email),v_profile.phone,v_profile.shipping_address,v_profile.shipping_city,v_profile.shipping_state,v_profile.shipping_postal_code,coalesce(v_profile.shipping_country,'México'),v_shipping_method,v_shipping,'pending',v_subtotal+v_shipping,p_notes,now()+interval '30 minutes') returning id into v_order_id;
 for v_item in select to_jsonb(r) from _order_request r order by card_id loop v_card_id:=(v_item->>'card_id')::uuid; v_qty:=(v_item->>'quantity')::integer; select price into v_price from public.cards where id=v_card_id; insert into public.order_items(order_id,card_id,quantity,unit_price) values(v_order_id,v_card_id,v_qty,v_price); end loop;
 return jsonb_build_object('ok',true,'order_id',v_order_id,'subtotal',v_subtotal,'shipping_cost',v_shipping,'total',v_subtotal+v_shipping,'payment_expires_at',now()+interval '30 minutes');
end; $$;

create or replace function public.confirm_order_payment(p_order_id uuid)
returns jsonb language plpgsql security definer set search_path to 'public','auth' as $$
declare v_item record; v_status text; v_expires timestamptz;
begin
 select status,payment_expires_at into v_status,v_expires from public.orders where id=p_order_id for update; if not found then raise exception 'Pedido no encontrado'; end if;
 if v_status='paid' then return jsonb_build_object('ok',true,'order_id',p_order_id,'status','paid','duplicate',true); end if;
 if v_status not in ('pending','contacted') then raise exception 'Este pedido ya no puede confirmarse'; end if;
 if v_expires is not null and v_expires<=now() then perform public.release_expired_order_reservations(); raise exception 'El pago llegó después de la expiración de la reserva'; end if;
 for v_item in select card_id,quantity from public.order_items where order_id=p_order_id order by card_id loop update public.cards set stock=stock-v_item.quantity,reserved_stock=greatest(reserved_stock-v_item.quantity,0),updated_at=now() where id=v_item.card_id and reserved_stock>=v_item.quantity and stock>=v_item.quantity; if not found then raise exception 'Reserva o stock insuficiente para confirmar este pedido'; end if; end loop;
 update public.orders set status='paid',payment_completed_at=coalesce(payment_completed_at,now()),updated_at=now() where id=p_order_id;
 return jsonb_build_object('ok',true,'order_id',p_order_id,'status','paid');
end; $$;

create or replace function public.cancel_order_and_restore_stock(p_order_id uuid,p_reason text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_order public.orders%rowtype; v_item record; v_released integer:=0; v_actor uuid:=auth.uid();
begin
 if v_actor is null or not public.is_admin_user() then raise exception 'No tienes permisos para cancelar pedidos'; end if;
 select * into v_order from public.orders where id=p_order_id for update; if not found then raise exception 'Pedido no encontrado'; end if;
 if v_order.status='cancelled' then raise exception 'El pedido ya está cancelado'; end if;
 if v_order.status in ('paid','preparing','shipped','completed') then raise exception 'No se puede cancelar un pedido pagado o avanzado desde esta función'; end if;
 for v_item in select oi.card_id,oi.quantity from public.order_items oi where oi.order_id=p_order_id order by oi.card_id for update loop update public.cards set reserved_stock=greatest(reserved_stock-v_item.quantity,0),updated_at=now() where id=v_item.card_id; v_released:=v_released+v_item.quantity; end loop;
 update public.orders set status='cancelled',cancelled_at=now(),cancellation_reason=nullif(trim(coalesce(p_reason,'')),''),updated_at=now() where id=p_order_id;
 return jsonb_build_object('ok',true,'order_id',p_order_id,'released_units',v_released,'status','cancelled');
end; $$;

create or replace function public.cancel_order(p_order_id uuid,p_reason text default null)
returns jsonb language sql security definer set search_path to 'public' as $$ select public.cancel_order_and_restore_stock(p_order_id,p_reason); $$;
