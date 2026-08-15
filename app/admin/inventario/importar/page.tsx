"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase";

const required = ["Nombre", "Categoría", "Precio MXN", "Stock"];

export default function ImportarInventario() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function parseFile(f: File) {
    setFile(f); setErrors([]); setMessage("");
    if (!f.name.toLowerCase().endsWith(".xlsx")) { setErrors(["El archivo debe ser .xlsx"]); return; }
    const XLSX = await import("xlsx");
    const book = XLSX.read(await f.arrayBuffer(), { type: "array" });
    const sheet = book.Sheets["Inventario"] || book.Sheets[book.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<any>(sheet, { defval: "" });
    const errs: string[] = [];
    data.forEach((r:any,i:number)=>{
      required.forEach(k=>{ if (r[k] === "" || r[k] === undefined || r[k] === null) errs.push(`Fila ${i+2}: falta ${k}.`); });
      if (r["Precio MXN"] !== "" && Number.isNaN(Number(r["Precio MXN"]))) errs.push(`Fila ${i+2}: Precio MXN inválido.`);
      if (r.Stock !== "" && (!Number.isInteger(Number(r.Stock)) || Number(r.Stock) < 0)) errs.push(`Fila ${i+2}: Stock inválido.`);
    });
    setRows(data); setErrors(errs.slice(0,100));
  }

  async function importInventory() {
    if (!rows.length || errors.length) return;
    setBusy(true); setMessage("");
    const sb = supabaseBrowser();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) { router.push("/login"); return; }
    const { data: profile } = await sb.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
    if (!profile || !["agent","admin"].includes(profile.role)) { setMessage("No tienes permisos para importar inventario."); setBusy(false); return; }

    const { data: categories } = await sb.from("categories").select("id,name");
    const categoryMap = new Map((categories||[]).map((c:any)=>[String(c.name).trim().toLowerCase(), c.id]));
    const payload:any[] = [];
    const validation:string[] = [];
    rows.forEach((r:any,i:number)=>{
      const categoryId = categoryMap.get(String(r["Categoría"]).trim().toLowerCase());
      if (!categoryId) validation.push(`Fila ${i+2}: categoría no encontrada: ${r["Categoría"]}`);
      else payload.push({name:String(r.Nombre).trim(),category_id:categoryId,set_id:null,card_number:r.Número?String(r.Número):null,rarity:r.Rareza?String(r.Rareza):null,language:r.Idioma||"English",condition:r.Condición||"Near Mint",price:Number(r["Precio MXN"]),stock:Number(r.Stock),published:String(r.Publicado||"Sí").toLowerCase()==="sí",image_url:null});
    });
    if(validation.length){setErrors(validation.slice(0,100));setBusy(false);return;}
    const { error } = await sb.from("cards").insert(payload);
    if(error){setMessage(error.message);setBusy(false);return;}
    setMessage(`${payload.length} productos importados correctamente por ${auth.user.email}.`);
    setBusy(false);
  }

  return <main className="wrap">
    <header className="top"><a href="/admin">← Administración</a><b>Importar inventario</b><button className="btn2" onClick={()=>router.push("/catalogo")}>Catálogo</button></header>
    <section className="panel">
      <h1>Importar inventario desde Excel</h1>
      <p className="muted">Disponible para cuentas de agente y administración. Primero valida el archivo; después confirma la importación.</p>
      <input type="file" accept=".xlsx" onChange={e=>e.target.files?.[0]&&parseFile(e.target.files[0])}/>
      {file&&<p>{file.name} · {rows.length} filas detectadas</p>}
      {errors.length>0&&<div className="notice">{errors.map((e,i)=><div key={i}>{e}</div>)}</div>}
      {rows.length>0&&!errors.length&&<div className="notice">✓ Archivo válido. {rows.length} productos listos para importar.</div>}
      {rows.length>0&&!errors.length&&<button className="btn" disabled={busy} onClick={importInventory}>{busy?"Importando...":"Confirmar importación"}</button>}
      {message&&<p className="notice">{message}</p>}
    </section>
  </main>;
}
