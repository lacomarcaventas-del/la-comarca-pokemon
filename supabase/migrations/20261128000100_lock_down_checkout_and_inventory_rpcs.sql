-- Critical RPC hardening for checkout and inventory operations.
-- Apply only after validating the payment webhook's service-role credentials.

-- These operations are backend-only. The checkout transaction function executes
-- as its owner and can still invoke the expiry cleanup internally.
revoke all on function public.apply_clip_checkout_event(text,text,text,text) from public, anon, authenticated;
grant execute on function public.apply_clip_checkout_event(text,text,text,text) to service_role;

revoke all on function public.confirm_order_payment(uuid) from public, anon, authenticated;
grant execute on function public.confirm_order_payment(uuid) to service_role;

revoke all on function public.release_expired_order_reservations() from public, anon, authenticated;
grant execute on function public.release_expired_order_reservations() to service_role;

-- These RPCs retain authenticated access because their function bodies perform
-- an explicit admin check; anonymous and inherited PUBLIC execution is removed.
revoke all on function public.set_inventory_import_active(uuid,boolean) from public, anon;
grant execute on function public.set_inventory_import_active(uuid,boolean) to authenticated, service_role;

revoke all on function public.undo_inventory_import(uuid,uuid,text) from public, anon;
grant execute on function public.undo_inventory_import(uuid,uuid,text) to authenticated, service_role;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

revoke all on function public.is_admin_user() from public, anon;
grant execute on function public.is_admin_user() to authenticated, service_role;
