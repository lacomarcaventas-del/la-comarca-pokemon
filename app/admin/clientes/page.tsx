"use client";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../../../lib/supabase";

type Profile={id:string;full_name:string|null;username:string|null;email:string|null;phone:string|null;role:string;status:string;created_at:string;shipping_address:string|null;shipping_city:string|null;shipping_state:string|null;shipping_postal_code:string|null;shipping_country:string|null};

const statusLabel:Record<string,string>={pendiente:"Pendiente",aprobado:"Aprobado",rechazado:"Rechazado",suspendido:"Suspendido"};
const roleLabel:Record<string,string>={usuario:"Usuario",agent:"Agente",tester:"Tester",admin:"Administrador"};

export default function Clientes(){
 const router=useRouter(),sb=supabaseBrowser();
 const[rows,setRows]=useState<Profile[]>([]),[checking,setChecking]=useState(true),[q,setQ]=useState(""),[statusFilter,setStatusFilter]=useState("todos");
 useEffect(()=>{(async()=>{
   const{data:u}=await sb.auth.getUser();
   if(!u.user){router.replace('/login');return}
   const{data:p}=await sb.from('profiles').select('role').eq('id',u.user.id).maybeSingle();
   if(p?.role!=='admin'){router.replace('/login');return}
   const{data,error}=await sb.from('profiles').select('id,full_name,username,email,phone,role,status,created_at,shipping_address,shipping_city,shipping_state,shipping_postal_code,shipping_country').order('created_at',{ascending:false});
   if(!error)setRows(data||[]);
   setChecking(false);
 })()},[]);
 const filtered=useMemo(()=>{const needle=q.trim().toLowerCase();return rows.filter(c=>{
   const text=`${c.full_name||''} ${c.username||''} ${c.email||''} ${c.phone||''}`.toLowerCase();
   return (!needle||text.includes(needle))&&(statusFilter==='todos'||c.status===statusFilter);
 })},[rows,q,statusFilter]);
 const counts=useMemo(()=>({todos:rows.length,pendiente:rows.filter(x=>x.status==='pendiente').length,aprobado:rows.filter(x=>x.status==='aprobado').length,rechazado:rows.filter(x=>x.status==='rechazado').length,suspendido:rows.filter(x=>x.status==='suspendido').length}),[rows]);
 return checking?<main className="wrap"><div className="empty">Verificando acceso...</div></main>:<>
  <header className="top"><a href="/admin">← Administración</a><b>Clientes</b><a href="/admin/orders">Pedidos</a></header>
  <main className="wrap">
   <div className="panel hero"><div><h1>Clientes</h1><p className="muted">Panel de información de los perfiles registrados. Aquí se consultan datos de contacto y, cuando existen, datos de envío.</p></div><div className="total"><strong>{rows.length}</strong><span>perfiles registrados</span></div></div>
   <div className="panel controls">
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar nombre, usuario, correo o teléfono"/>
    <div className="tabs">{(['todos','pendiente','aprobado','rechazado','suspendido'] as const).map(s=><button key={s} className={statusFilter===s?'active':''} onClick={()=>setStatusFilter(s)}>{s==='todos'?'Todos':statusLabel[s]} <em>{counts[s]}</em></button>)}</div>
   </div>
   <div className="resultLine">Mostrando <b>{filtered.length}</b> de {rows.length} perfiles</div>
   {filtered.map(c=><article className="panel customer" key={c.id}>
    <div className="customerHead"><div><h2>{c.full_name||c.username||'Sin nombre'}</h2><div className="muted">{c.username?`@${c.username}`:'Sin usuario'}</div></div><div className="badges"><span className={`status s-${c.status}`}>{statusLabel[c.status]||c.status}</span><span className="role">{roleLabel[c.role]||c.role}</span></div></div>
    <div className="grid">
      <section><h3>Contacto</h3><div><b>Correo</b><br/>{c.email||'—'}</div><div><b>Teléfono</b><br/>{c.phone||'—'}</div></section>
      <section><h3>Cuenta</h3><div><b>Alta</b><br/>{new Date(c.created_at).toLocaleString('es-MX')}</div><div><b>Estado</b><br/>{statusLabel[c.status]||c.status}</div></section>
      <section><h3>Envío</h3><div>{c.shipping_address||'—'}</div><div>{[c.shipping_city,c.shipping_state].filter(Boolean).join(' · ')||'—'}{c.shipping_postal_code?` · CP ${c.shipping_postal_code}`:''}</div><div>{c.shipping_country||'—'}</div></section>
    </div>
   </article>)}
   {!filtered.length&&<div className="empty">No hay perfiles que coincidan.</div>}
  </main>
</>;
}