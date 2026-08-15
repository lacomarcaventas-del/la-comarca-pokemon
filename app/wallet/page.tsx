"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase";
import "./wallet.css";

type Node = { id: string; name: string; city: string; balance: number; tone: string };
type Movement = { id: string; date: string; from: string; to: string; amount: number; note: string };
const tones: Record<string,string> = { armando:"blue", pepe:"violet", erick:"cyan", rodrigo:"amber", daniel:"green" };
const money = (n:number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default function WalletPage() {
  const router=useRouter();
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [nodes,setNodes] = useState<Node[]>([]); const [movements,setMovements] = useState<Movement[]>([]);
  const [from,setFrom] = useState(""); const [to,setTo] = useState(""); const [amount,setAmount] = useState(""); const [note,setNote] = useState(""); const [message,setMessage] = useState("Cargando wallet…"); const [busy,setBusy] = useState(false); const [checking,setChecking]=useState(true);
  const total = useMemo(()=>nodes.reduce((s,n)=>s+n.balance,0),[nodes]);

  async function load(){
    const { data, error } = await supabase.from("node_wallets").select("id,node_key,node_name,city,balance").order("created_at");
    if(error){setMessage(`No se pudo cargar la wallet: ${error.message}`);return;}
    const mapped=(data||[]).map((n:any)=>({id:n.id,name:n.node_name,city:n.city,balance:Number(n.balance),tone:tones[n.node_key]||"blue"})); setNodes(mapped);
    if(!from && mapped[0]) setFrom(mapped[0].id); if(!to && mapped[1]) setTo(mapped[1].id);
    const { data: tx, error: txError } = await supabase.from("wallet_transactions").select("id,from_wallet_id,to_wallet_id,amount,note,created_at").order("created_at",{ascending:false}).limit(20);
    if(!txError){ setMovements((tx||[]).map((m:any)=>({id:m.id.slice(0,8).toUpperCase(),date:new Date(m.created_at).toLocaleString("es-MX"),from:data?.find((n:any)=>n.id===m.from_wallet_id)?.node_name||"Nodo",to:data?.find((n:any)=>n.id===m.to_wallet_id)?.node_name||"Nodo",amount:Number(m.amount),note:m.note||"Movimiento interno"}))); }
    setMessage("");
  }
  useEffect(()=>{(async()=>{const {data}=await supabase.auth.getUser();if(!data.user){router.replace('/login');return}const {data:profile}=await supabase.from('profiles').select('role').eq('id',data.user.id).maybeSingle();if(profile?.role!=='admin'){router.replace('/cuenta');return}setChecking(false);load()})()},[]);

  async function transfer(e:React.FormEvent){
    e.preventDefault(); const value=Number(amount);
    if(!value||value<=0) return setMessage("Indica un importe válido."); if(from===to) return setMessage("El origen y destino deben ser diferentes.");
    setBusy(true); setMessage("");
    const { data: auth } = await supabase.auth.getUser();
    if(!auth.user){setBusy(false);setMessage("Inicia sesión para realizar movimientos.");return;}
    const { error } = await supabase.rpc("transfer_node_wallet",{p_from:from,p_to:to,p_amount:value,p_note:note||"Movimiento interno"});
    if(error){setMessage(`Transferencia rechazada: ${error.message}`);} else {setAmount("");setNote("");setMessage(`Transferencia registrada por ${auth.user.email}.`);await load();}
    setBusy(false);
  }

  if(checking)return <main className="wallet-shell"><div className="message">Verificando acceso administrativo…</div></main>;
  return <main className="wallet-shell"><header className="wallet-top"><div><div className="eyebrow">SISTEMA INTERNO · MODO TEST</div><h1>TORRE DE LOS MAGOS</h1><p>Wallet de movimientos entre nodos</p></div><div className="secure">● ADMINISTRACIÓN · CORREO DESACTIVADO</div></header>
    <section className="wallet-wrap"><div className="hero-row"><div><span className="label">BALANCE CONSOLIDADO</span><div className="total">{money(total)}</div><span className="muted">Saldos persistentes en Supabase</span></div><div className="actions"><button className="ghost" onClick={()=>router.push('/admin')}>← Administración</button><button className="ghost" onClick={load}>Actualizar</button></div></div>
      <section className="node-grid">{nodes.map(n=><article className={`node-card ${n.tone}`} key={n.id}><div className="node-head"><span>{n.city}</span><strong>{n.name}</strong></div><div className="node-balance">{money(n.balance)}</div><small>Saldo disponible</small></article>)}</section>
      <div className="main-grid"><section className="panel transfer-panel"><div className="panel-title"><div><span className="label">OPERACIÓN DE PRUEBA</span><h2>Nueva transferencia</h2></div><span className="lock">🔒 Interna</span></div><form onSubmit={transfer}><label>ORIGEN</label><select value={from} onChange={e=>setFrom(e.target.value)}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name} · {n.city} · {money(n.balance)}</option>)}</select><label>DESTINO</label><select value={to} onChange={e=>setTo(e.target.value)}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name} · {n.city}</option>)}</select><label>IMPORTE MXN</label><input type="number" min="1" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00"/><label>CONCEPTO</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Motivo del movimiento"/><button className="primary" disabled={busy} type="submit">{busy?"Procesando…":"Transferir fondos →"}</button>{message&&<div className="message">{message}</div>}</form></section>
      <section className="panel history-panel"><div className="panel-title"><div><span className="label">TRAZABILIDAD</span><h2>Movimientos recientes</h2></div><span className="count">{movements.length}</span></div><div className="history">{movements.map(m=><div className="movement" key={m.id}><div className="movement-icon">↗</div><div className="movement-main"><strong>{m.from} → {m.to}</strong><span>{m.note}</span><small>{m.date} · {m.id}</small></div><b>{money(m.amount)}</b></div>)}</div></section></div></section></main>;
}
