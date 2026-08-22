revoke all on function public.is_admin() from public;
revoke all on function public.is_admin_user() from public;
revoke all on function public.undo_inventory_import(uuid,uuid,text) from public;
grant execute on function public.undo_inventory_import(uuid,uuid,text) to authenticated;
