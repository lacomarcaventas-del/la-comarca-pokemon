-- Restrict self-service profile edits to contact and shipping fields only.
-- Role and account approval remain writable through the protected admin RPC.
revoke update on table public.profiles from authenticated;

grant update (
  full_name,
  email,
  phone,
  shipping_address,
  shipping_city,
  shipping_state,
  shipping_postal_code,
  shipping_country
)
on table public.profiles to authenticated;
