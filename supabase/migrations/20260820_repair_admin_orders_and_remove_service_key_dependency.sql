-- Keep repository permissions aligned with production.
grant update on table public.orders to authenticated;

revoke all on function public.admin_delete_user(uuid) from public, anon;
grant execute on function public.admin_delete_user(uuid) to authenticated;

revoke all on function public.admin_update_profile(uuid, text, text) from public, anon;
grant execute on function public.admin_update_profile(uuid, text, text) to authenticated;

revoke all on function public.cancel_order(uuid, text) from public, anon;
grant execute on function public.cancel_order(uuid, text) to authenticated;

revoke all on function public.delete_order(uuid) from public, anon;
grant execute on function public.delete_order(uuid) to authenticated;
