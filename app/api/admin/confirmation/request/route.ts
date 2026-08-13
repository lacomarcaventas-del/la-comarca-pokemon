import { NextResponse } from 'next/server';
import { createHash, randomInt } from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId : null;
  const action = typeof body.action === 'string' ? body.action : 'edit_user';
  if (!targetUserId) return NextResponse.json({ error: 'Usuario objetivo requerido.' }, { status: 400 });
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Sesión requerida.' }, { status: 401 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { global: { headers: { Authorization: authHeader } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Solo administradores.' }, { status: 403 });

  const code = String(randomInt(0, 1000000)).padStart(6, '0');
  const codeHash = createHash('sha256').update(code).digest('hex');
  const { error } = await supabase.from('admin_confirmation_codes').insert({ admin_id: user.id, target_user_id: targetUserId, action, code_hash: codeHash, expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Email delivery is intentionally disabled during tester phase. The code is stored hashed;
  // production delivery will be enabled through Resend without exposing the code in the UI.
  return NextResponse.json({ ok: true, email: user.email, delivery: 'pending_email_configuration' });
}
