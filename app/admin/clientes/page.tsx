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
  <style jsx>{`.hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.hero h1{margin-bottom:8px}.total{min-width:150px;text-align:right}.total strong{display:block;font-size:2rem}.total span{color:#8995a4;font-size:.82rem}.controls{margin-top:14px}.controls>input{width:100%;box-sizing:border-box;min-height:46px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.10);border-radius:9px;color:#fff;padding:10px 12px;font:inherit}.tabs{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.tabs button{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.10);color:#aeb8c5;border-radius:9px;padding:8px 11px;cursor:pointer}.tabs button.active{color:#fff;border-color:rgba(234,179,8,.45);background:rgba(234,179,8,.08)}.tabs em{font-style:normal;opacity:.7}.resultLine{color:#8995a4;font-size:.82rem;margin:12px 2px}.customer{margin-bottom:12px}.customerHead{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.customerHead h2{margin:0 0 3px;font-size:1.15rem}.badges{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.status,.role{display:inline-flex;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.12);font-size:.78rem}.s-pendiente{background:rgba(234,179,8,.10);border-color:rgba(234,179,8,.35)}.s-aprobado{background:rgba(34,197,94,.10);border-color:rgba(34,197,94,.35)}.s-rechazado{background:rgba(239,68,68,.10);border-color:rgba(239,68,68,.35)}.s-suspendido{background:rgba(148,163,184,.10);border-color:rgba(148,163,184,.35)}.grid{display:grid;grid-template-columns:1fr 1fr 1.4fr;gap:18px;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,.08)}.grid section h3{margin:0 0 10px;font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:#8995a4}.grid section>div{margin-bottom:9px;line-height:1.45}.grid b{color:#aeb8c5;font-size:.8rem}.empty{text-align:center;padding:34px;color:#8995a4}@media(max-width:800px){.hero,.customerHead{flex-direction:column}.total{text-align:left}.badges{justify-content:flex-start}.grid{grid-template-columns:1fr}}`}</style>
 </>;
}