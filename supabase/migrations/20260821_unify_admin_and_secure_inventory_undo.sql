create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.profiles where id=auth.uid() and role='admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$ select public.is_admin_user(); $$;

create or replace function public.undo_inventory_import(p_import_id uuid,p_actor_id uuid default auth.uid(),p_reason text default 'Importación deshecha')
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare a public.inventory_import_audit; ids uuid[]; removed integer:=0;
begin
 if not public.is_admin_user() then raise exception 'NO_ADMIN'; end if;
 if p_actor_id is distinct from auth.uid() then raise exception 'ACTOR_MISMATCH'; end if;
 select * into a from public.inventory_import_audit where id=p_import_id for update;
 if not found then raise exception 'IMPORT_NOT_FOUND'; end if;
 if a.status in ('deleted','rejected','cancelled') then raise exception 'IMPORT_ALREADY_REVERTED'; end if;
 select coalesce(array_agg(value::uuid),'{}'::uuid[]) into ids from jsonb_array_elements_text(coalesce(a.details->'card_ids','[]'::jsonb));
 if coalesce(array_length(ids,1),0)>0 then delete from public.cards where id=any(ids); get diagnostics removed=row_count; end if;
 update public.inventory_import_audit set status='deleted',deleted_at=now(),deleted_by=auth.uid(),deleted_reason=coalesce(nullif(p_reason,''),'Importación deshecha'),details=jsonb_set(coalesce(details,'{}'::jsonb),'{undo}',jsonb_build_object('at',now(),'by',auth.uid(),'removed_card_ids',coalesce(to_jsonb(ids),'[]'::jsonb),'removed_count',removed),true) where id=p_import_id;
 return jsonb_build_object('removed_count',removed,'import_id',p_import_id,'status','deleted');
end;
$$;

grant execute on function public.undo_inventory_import(uuid,uuid,text) to authenticated;

drop policy if exists "admins can update inventory import audit" on public.inventory_import_audit;
create policy "admins can update inventory import audit" on public.inventory_import_audit for update to authenticated using (public.is_admin_user()) with check (public.is_admin_user());

drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders" on public.orders for all to authenticated using (public.is_admin_user()) with check (public.is_admin_user());
