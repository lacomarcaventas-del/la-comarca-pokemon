# La Comarca Pokémon TCG

Tienda/catálogo online de cartas Pokémon TCG con Next.js y Supabase.

## Rutas
- `/pokemon` catálogo público
- `/login` acceso administrativo
- `/admin` inventario y publicación de cartas

## Configuración
1. Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
2. Crea el usuario administrador en Supabase Authentication.
3. Configura en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
4. Despliega el repositorio en Vercel.

No uses una `service_role` ni una `secret key` en el frontend.