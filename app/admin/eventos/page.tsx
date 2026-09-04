"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import * as XLSX from "xlsx";
import {supabaseBrowser} from "../../../lib/supabase";

type Registration={id:string;event_name:string;full_name:string;phone:string;email:string;game:string|null;redemption_code:string|null;created_at:string};

export default function AdminEventos(){
 const router=useRouter(),sb=supabaseBrowser();
 const [rows,setRows]=useState<Registration[]>([]),[loading,setLoading]=useState(true),[msg,setMsg]=useState("");

 useEffect(()=>{(async()=>{
  const {data:{user}}=await sb.auth.getUser();
  if(!user){router.replace("/login");return}
  const {data:profile}=await sb.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="admin"){router.replace("/login");return}
  const {data,error}=await sb.from("event_registrations").select("id,event_name,full_name,phone,email,game,redemption_code,created_at").order("created_at",{ascending:false});
  if(error)setMsg(error.message); else setRows((data||[]) as Registration[]);
  setLoading(false);
 })()},[]);

 function download(){
  const exportRows=rows.map((r,i)=>({
   "#":i+1,
   Evento:r.event_name,
   Nombre:r.full_name,
   Teléfono:r.phone,
   Correo:r.email,
   Juego:r.game||"",
   "Código de demo":r.redemption_code||"",
   "Fecha de registro":new Date(r.created_at).toLocaleString("es-MX")
  }));
  const ws=XLSX.utils.json_to_sheet(exportRows);
  ws["!cols"]=[{wch:6},{wch:24},{wch:28},{wch:18},{wch:32},{wch:22},{wch:28},{wch:22}];
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"Registros");
  XLSX.writeFile(wb,`registros_eventos_${new Date().toISOString().slice(0,10)}.xlsx`);
 }

 if(loading)return <main className="wrap"><div className="empty">Cargando registros...</div></main>;

 return <><header className="top"><a href="/admin">← Administración</a><b>La Comarca · Eventos</b></header><main className="wrap">
  <div className="panel"><h2>🎟️ Registros de Eventos</h2><p className="muted">Total de registros: {rows.length}</p>
   <div className="actions"><button className="btn" onClick={download} disabled={!rows.length}>📥 Descargar Excel</button></div>
   {msg&&<p>{msg}</p>}
  </div>
  <div className="panel"><div style={{overflow:"auto"}}><table className="table"><thead><tr><th>Nombre</th><th>Teléfono</th><th>Correo</th><th>Juego</th><th>Código</th><th>Registro</th></tr></thead><tbody>
   {rows.map(r=><tr key={r.id}><td><b>{r.full_name}</b></td><td>{r.phone}</td><td>{r.email}</td><td>{r.game||""}</td><td><b>{r.redemption_code||""}</b></td><td>{new Date(r.created_at).toLocaleString("es-MX")}</td></tr>)}
   {!rows.length&&<tr><td colSpan={6}>Aún no hay registros.</td></tr>}
  </tbody></table></div></div>
 </main></>
}