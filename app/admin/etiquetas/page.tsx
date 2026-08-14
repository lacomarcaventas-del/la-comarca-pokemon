"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "../../../lib/supabase";

type Tag={id:string;name:string};

export default function Etiquetas(){
  const sb=supabaseBrowser();
  const [tags,setTags]=useState<Tag[]>([]);
  const [name,setName]=useState("");
  const [msg,setMsg]=useState("");
  const [loading,setLoading]=useState(true);

  async function load(){
    const {data}=await sb.from("product_tags").select("id,name").order("name");
    setTags((data||[]) as Tag[]);
    setLoading(false);
  }
  useEffect(()=>{load()},[]);

  async function add(){
    const clean=name.trim().toLowerCase().replace(/\s+/g,"_");
    if(!clean){return}
    setMsg("");
    const {error}=await sb.from("product_tags").insert({name:clean});
    if(error)setMsg(error.message); else {setName("");setMsg("Etiqueta creada");load()}
  }
  async function remove(id:string){
    if(!confirm("¿Eliminar esta etiqueta?"))return;
    const {error}=await sb.from("product_tags").delete().eq("id",id);
    if(error)setMsg(error.message); else load();
  }

  return <main className="wrap">
    <div className="panel">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <div><h2>Etiquetas de productos</h2><p className="muted">Administra las etiquetas disponibles para clasificar el inventario.</p></div>
        <a className="btn2" href="/admin">← Administración</a>
      </div>
      <div className="row" style={{marginTop:18}}>
        <div><label>Nueva etiqueta</label><input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add()}} placeholder="Ej. alta_demanda" /></div>
        <div style={{flex:"0 0 auto",alignSelf:"end"}}><button className="btn" onClick={add}>Crear etiqueta</button></div>
      </div>
      {msg&&<p className="notice" style={{marginTop:14}}>{msg}</p>}
    </div>
    <div className="panel">
      <h3>Etiquetas disponibles ({tags.length})</h3>
      {loading?<div className="empty">Cargando...</div>:<div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))"}}>{tags.map(t=><div className="card" key={t.id}><div className="info" style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}><b>#{t.name}</b><button className="danger" onClick={()=>remove(t.id)}>Eliminar</button></div></div>)}</div>}
    </div>
  </main>
}
