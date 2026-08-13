"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../../../lib/supabase";

const labels:any={pending:"Pendiente",contacted:"Contactado",paid:"Pagado",preparing:"Preparando",shipped:"Enviado",completed:"Completado",cancelled:"Cancelado"};

export default function Orders(){
 const [orders,setOrders]=useState<any[]>([]),[loading,setLoading]=useState(true),[msg,setMsg]=useState(""),router=useRouter(),sb=supabaseBrowser();
 useEffect(()=>{sb.auth.getUser().then(({data})=>{if(!data.user)router.push('/login');else load()})},[]);
 async function load(){setLoading(true);const {data,error}=await sb.from('orders').select('*,order_items(quantity,unit_price,cards(name,card_number))').order('created_at',{ascending:false});if(error)setMsg(error.message);else setOrders(data||[]);setLoading(false)}
 async function status(id:string,status:string){setMsg("");const {error}=await sb.from('orders').update({status}).eq('id',id);if(error)setMsg(error.message);else load()}
 async function cancelOrder(id:string){
   if(!confirm("¿Cancelar este pedido y devolver las cartas al inventario?")) return;
   setMsg("");
   const {data,error}=await sb.rpc('cancel_order',{p_order_id:id});
   if(error){setMsg(error.message);return;}
   if(!data?.ok){setMsg("No se pudo cancelar el pedido.");return;}
   setMsg("Pedido cancelado. El stock fue restaurado.");
   load();
 }
 return <><header className="top"><a href="/admin">← Inventario</a><b>Pedidos</b><a href="/pokemon">Catálogo</a></header><main className="wrap"><div className="panel"><h2>Pedidos</h2><button className="btn2" onClick={load}>Actualizar</button>{msg&&<p>{msg}</p>}</div>{loading?<div className="empty">Cargando...</div>:orders.length===0?<div className="empty">No hay pedidos.</div>:orders.map(o=><div className="panel" key={o.id}><div className="row"><div><b>Folio: {o.id.slice(0,8).toUpperCase()}</b><div className="muted">{new Date(o.created_at).toLocaleString('es-MX')}</div></div><div><b>{o.customer_name}</b><div className="muted">{o.customer_phone} · {o.customer_email||'sin correo'}</div></div><div><b>${Number(o.total).toLocaleString('es-MX')} MXN</b><div className="muted">{labels[o.status]||o.status}</div></div></div><hr/><ul>{(o.order_items||[]).map((i:any)=><li key={i.card?.name+i.quantity}>{i.quantity} × {i.card?.name||'Carta'} — ${Number(i.unit_price).toLocaleString('es-MX')}</li>)}</ul>{o.notes&&<div className="notice">Notas: {o.notes}</div>}<div className="actions" style={{marginTop:12}}>{['pending','contacted','paid','preparing','shipped','completed'].map(s=><button key={s} className={o.status===s?'btn':'btn2'} onClick={()=>status(o.id,s)}>{labels[s]}</button>)}{o.status!=='cancelled'&&o.status!=='completed'&&<button className="danger" onClick={()=>cancelOrder(o.id)}>❌ Cancelar y devolver stock</button>}</div></div>)}</main></>}
