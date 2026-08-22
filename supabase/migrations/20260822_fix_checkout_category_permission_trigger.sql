-- Checkout changes only reservation state; they must not require agent category edit permission.
create or replace function public.enforce_agent_card_permissions()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if current_setting('app.checkout_operation', true)='true'
     and tg_op='UPDATE'
     and old.id=new.id
     and old.stock is not distinct from new.stock
     and old.reserved_stock is distinct from new.reserved_stock
     and old.name is not distinct from new.name
     and old.price is not distinct from new.price
     and old.category_id is not distinct from new.category_id
     and old.published is not distinct from new.published
     and old.card_number is not distinct from new.card_number
     and old.rarity is not distinct from new.rarity
     and old.language is not distinct from new.language
     and old.condition is not distinct from new.condition
     and old.image_url is not distinct from new.image_url
     and old.set_id is not distinct from new.set_id
  then
    return new;
  end if;

  if public.is_admin_user() then
    new.updated_by:=coalesce(auth.uid(),new.updated_by,new.created_by);
    if tg_op='INSERT' then new.created_by:=coalesce(auth.uid(),new.created_by); end if;
    return new;
  end if;

  if tg_op='INSERT' then
    if new.category_id is null or not public.can_agent_category(new.category_id,'create') then
      raise exception 'No tienes permiso para crear productos en esta categoria';
    end if;
    new.created_by:=auth.uid();
    new.updated_by:=auth.uid();
    return new;
  end if;

  if old.category_id is distinct from new.category_id then
    raise exception 'Solo un administrador puede cambiar la categoria de un producto';
  end if;
  if not public.can_agent_category(new.category_id,'edit') then
    raise exception 'No tienes permiso para editar esta categoria';
  end if;
  if old.price is distinct from new.price and not public.can_agent_category(new.category_id,'price') then
    raise exception 'No tienes permiso para cambiar precios en esta categoria';
  end if;
  if old.stock is distinct from new.stock and not public.can_agent_category(new.category_id,'stock') then
    raise exception 'No tienes permiso para cambiar stock en esta categoria';
  end if;
  if old.published is distinct from new.published and not public.can_agent_category(new.category_id,'publish') then
    raise exception 'No tienes permiso para publicar o despublicar en esta categoria';
  end if;

  new.updated_by:=auth.uid();
  return new;
end;
$$;

-- Mark reservation updates as checkout operations for the current transaction.
create or replace function public.create_order_transactional(
  p_customer_name text,p_customer_email text,p_customer_phone text,p_notes text,p_items jsonb,
  p_shipping_method text default null,p_shipping_cost numeric default 0
)
returns jsonb
language plpgsql
security definer
set search_path to 'public','auth'
as $$
declare
  v_order_id uuid;
  v_item jsonb;
  v_card_id uuid;
  v_qty integer;
  v_price numeric;
  v_subtotal numeric:=0;
  v_shipping numeric:=coalesce(p_shipping_cost,0);
  v_profile public.profiles;
  v_name text;
  v_email text;
  v_shipping_method text;
  v_expired integer;
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión para crear un pedido'; end if;
  perform set_config('app.checkout_operation','true',true);
  select public.release_expired_order_reservations() into v_expired;

  v_shipping_method:=case lower(trim(coalesce(p_shipping_method,'')))
    when 'mexpost' then 'mexpost_3kg'
    when 'mexpost 3 kg' then 'mexpost_3kg'
    when 'mexpost_3kg' then 'mexpost_3kg'
    when 'fedex' then 'fedex_3kg'
    when 'fedex 3 kg' then 'fedex_3kg'
    when 'fedex_3kg' then 'fedex_3kg'
    else null end;
  if v_shipping<0 then raise exception 'Costo de envío inválido'; end if;
  if v_shipping_method is null then raise exception 'Selecciona una opción de envío válida'; end if;
  if (v_shipping_method='mexpost_3kg' and v_shipping<>200)
     or (v_shipping_method='fedex_3kg' and v_shipping<>380) then
    raise exception 'El costo de envío no coincide con el método seleccionado';
  end if;

  select * into v_profile from public.profiles where id=auth.uid();
  if not found then raise exception 'No fue posible localizar tu perfil'; end if;
  if not(v_profile.status='aprobado' or v_profile.role='admin') then
    raise exception 'Tu cuenta está pendiente de aprobación por La Comarca';
  end if;
  if coalesce(trim(v_profile.phone),'')='' or coalesce(trim(v_profile.shipping_address),'')=''
     or coalesce(trim(v_profile.shipping_city),'')='' or coalesce(trim(v_profile.shipping_state),'')=''
     or coalesce(trim(v_profile.shipping_postal_code),'')='' then
    raise exception 'Completa tus datos de contacto y dirección de envío antes de realizar un pedido';
  end if;

  select coalesce(nullif(trim(raw_user_meta_data->>'full_name'),''),v_profile.username),email
  into v_name,v_email from auth.users where id=auth.uid();
  if jsonb_typeof(p_items)<>'array' or jsonb_array_length(p_items)=0 then
    raise exception 'El pedido debe contener al menos un producto';
  end if;

  create temporary table if not exists _order_request(card_id uuid primary key,quantity integer) on commit drop;
  truncate _order_request;
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_card_id:=(v_item->>'card_id')::uuid;
    v_qty:=(v_item->>'quantity')::integer;
    if v_qty is null or v_qty<=0 then raise exception 'Cantidad inválida'; end if;
    insert into _order_request(card_id,quantity) values(v_card_id,v_qty)
    on conflict(card_id) do update set quantity=_order_request.quantity+excluded.quantity;
  end loop;

  for v_item in select to_jsonb(r) from _order_request r order by card_id loop
    v_card_id:=(v_item->>'card_id')::uuid;
    v_qty:=(v_item->>'quantity')::integer;
    select price into v_price from public.cards where id=v_card_id and published=true for update;
    if not found then raise exception 'Producto no encontrado'; end if;
    update public.cards
    set reserved_stock=reserved_stock+v_qty,updated_at=now()
    where id=v_card_id and stock-reserved_stock>=v_qty;
    if not found then raise exception 'Stock insuficiente para el producto'; end if;
    v_subtotal:=v_subtotal+(v_price*v_qty);
  end loop;

  insert into public.orders(customer_id,customer_name,customer_email,customer_phone,shipping_address,shipping_city,shipping_state,shipping_postal_code,shipping_country,shipping_method,shipping_cost,status,total,notes,payment_expires_at)
  values(auth.uid(),coalesce(v_name,p_customer_name),coalesce(v_email,v_profile.email,p_customer_email),v_profile.phone,v_profile.shipping_address,v_profile.shipping_city,v_profile.shipping_state,v_profile.shipping_postal_code,coalesce(v_profile.shipping_country,'México'),v_shipping_method,v_shipping,'pending',v_subtotal+v_shipping,p_notes,now()+interval '30 minutes')
  returning id into v_order_id;

  for v_item in select to_jsonb(r) from _order_request r order by card_id loop
    v_card_id:=(v_item->>'card_id')::uuid;
    v_qty:=(v_item->>'quantity')::integer;
    select price into v_price from public.cards where id=v_card_id;
    insert into public.order_items(order_id,card_id,quantity,unit_price)
    values(v_order_id,v_card_id,v_qty,v_price);
  end loop;

  return jsonb_build_object('ok',true,'order_id',v_order_id,'subtotal',v_subtotal,'shipping_cost',v_shipping,'total',v_subtotal+v_shipping,'payment_expires_at',now()+interval '30 minutes');
end;
$$;
