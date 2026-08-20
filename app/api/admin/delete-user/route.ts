import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL=process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wwqkeeducvxxvdpdxxnu.supabase.co';
const SUPABASE_KEY=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_kPyc-lUnT2-pL9yUF-ITlg_Kr6Ylnwh';

export async function POST(req: NextRequest) {
  try {
    const auth=req.headers.get('authorization')||'';
    const token=auth.startsWith('Bearer ')?auth.slice(7):'';
    const {userId,confirmation}=await req.json();
    if(confirmation!=='ELIMINAR'||!userId)return NextResponse.json({error:'Confirmación inválida.'},{status:400});
    if(!token)return NextResponse.json({error:'No autorizado.'},{status:401});

    const client=createClient(SUPABASE_URL,SUPABASE_KEY,{global:{headers:{Authorization:`Bearer ${token}`}}});
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError||!user)return NextResponse.json({error:'No autorizado.'},{status:401});
    if(user.id===userId)return NextResponse.json({error:'No puedes eliminar tu propia cuenta desde este panel.'},{status:400});

    const {error}=await client.rpc('admin_delete_user',{target_id:userId});
    if(error)throw error;
    return NextResponse.json({ok:true});
  }catch(e:any){
    return NextResponse.json({error:e?.message||'No se pudo eliminar la cuenta.'},{status:500});
  }
}
