import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const auth=req.headers.get('authorization')||'';
    const token=auth.startsWith('Bearer ')?auth.slice(7):'';
    const {userId,confirmation}=await req.json();
    if(confirmation!=='ELIMINAR'||!userId)return NextResponse.json({error:'Confirmación inválida.'},{status:400});

    const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if(!url||!anon)return NextResponse.json({error:'Configuración de Supabase incompleta.'},{status:500});

    const client=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});
    const {data:{user},error:authError}=await client.auth.getUser();
    if(authError||!user)return NextResponse.json({error:'No autorizado.'},{status:401});
    if(user.id===userId)return NextResponse.json({error:'No puedes eliminar tu propia cuenta desde este panel.'},{status:400});

    const {error}=await client.rpc('admin_delete_user',{target_id:userId});
    if(error)throw error;
    return NextResponse.json({ok:true});
  }catch(e:any){
    const message=e?.message||'No se pudo eliminar la cuenta.';
    const status=message==='No autorizado'?403:500;
    return NextResponse.json({error:message},{status});
  }
}
