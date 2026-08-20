import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function config(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return {url,anon};
}

async function adminClient(req:NextRequest){
  const {url,anon}=config();
  if(!url||!anon)throw new Error('Configuración de Supabase incompleta.');
  const auth=req.headers.get('authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  const client=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});
  const {data:{user},error}=await client.auth.getUser();
  if(error||!user)throw new Error('No autorizado.');
  const {data:profile,error:profileError}=await client.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profileError)throw profileError;
  if(profile?.role!=='admin')throw new Error('Solo un administrador puede gestionar pedidos.');
  return client;
}

function errorResponse(e:any,fallback:string){
  const message=e?.message||fallback;
  const status=message==='No autorizado.'?401:message.includes('Solo un administrador')?403:500;
  return NextResponse.json({error:message},{status});
}

export async function GET(req:NextRequest){
  try{
    const admin=await adminClient(req);
    const {data,error}=await admin
      .from('orders')
      .select('*,order_items(quantity,unit_price,cards(name,card_number))')
      .order('created_at',{ascending:false});
    if(error)throw error;
    const ids=(data||[]).map((o:any)=>o.id);
    let history:any[]=[];
    if(ids.length){
      const r=await admin.from('order_history').select('*').in('order_id',ids).order('created_at',{ascending:false});
      if(r.error)throw r.error;
      history=r.data||[];
    }
    return NextResponse.json({orders:data||[],history});
  }catch(e:any){
    return errorResponse(e,'No se pudieron cargar los pedidos.');
  }
}

export async function PATCH(req:NextRequest){
  try{
    const admin=await adminClient(req);
    const body=await req.json();
    const {orderId,status,tracking_carrier,tracking_number}=body;
    if(!orderId)return NextResponse.json({error:'Pedido inválido.'},{status:400});
    const patch:any={updated_at:new Date().toISOString()};
    if(status)patch.status=status;
    if(tracking_carrier!==undefined)patch.tracking_carrier=tracking_carrier;
    if(tracking_number!==undefined)patch.tracking_number=tracking_number;
    if(status==='shipped')patch.shipped_at=new Date().toISOString();
    const {data,error}=await admin.from('orders').update(patch).eq('id',orderId).select().single();
    if(error)throw error;
    return NextResponse.json({ok:true,order:data});
  }catch(e:any){
    return errorResponse(e,'No se pudo actualizar el pedido.');
  }
}
