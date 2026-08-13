"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "../../lib/supabase";
import "./wallet.css";

type Node = { id: string; node_key: string; name: string; city: string; balance: number; tone: string };
type Movement = { id: string; date: string; from: string; to: string; amount: number; note: string };
const tones: Record<string,string> = { armando:"blue", pepe:"violet", erick:"cyan", rodrigo:"amber", daniel:"green" };
const money = (n: number) => `$${Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default function WalletPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [nodes, setNodes] = useState<Node[]>([]); const [movements, setMovements] = useState<Movement[]>([]);
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [amount, setAmount] = useState(""); const [note, setNote] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: wallets, error } = await supabase.from("node_wallets").select("id,node_key,node_name,city,balance").order("node_name");
    const { data: txs } = await supabase.from("wallet_transactions").select("id,amount,note,created_at,from_wallet_id,to_wallet_id,from:node_wallets!wallet_transactions_from_wallet_id_fkey(node_name),to:node_wallets!wallet_transactions_to_wallet_id_fkey(node_name)").order("created_at", { ascending:false }).limit(20);
    if (error) setMessage(`No se pudo cargar la wallet: ${error.message}`); else { const mapped=(wallets||[]).map((w:any)=>({id:w.id,node_key:w.node_key,name:w.node_name,city:w.city||"",balance:Number(w.balance),tone:tones[w.node_key]||"blue"})); setNodes(mapped); if (!from && mapped[0]) setFrom(mapped[0].id); if (!to && mapped[1]) setTo(mapped[1].id); setMovements((txs||[]).map((x:any)=>({id:x.id.slice(0,8).toUpperCase(),date:new Date(x.created_at).toLocaleString("es-MX"),from:x.from?.node_name||"—",to:x.to?.node_name||"—",amount:Number(x.amount),note:x.note||"Movimiento interno"}))); }
    setLoading(false);
  }
  useEffect(()=>{ load(); },[]);
  const total = nodes.reduce((s,n)=>s+n.balance,0);
  const selected = nodes.find(n=>n.id===from);

  async function transfer(e: React.FormEvent) {
    e.preventDefault(); setMessage(""); const value=Number(amount);
    if (!value || value<=0) return setMessage("Indica un importe válido."); if (from===to) return setMessage("El origen y destino deben ser diferentes."); if (!selected || selected.balance<value) return setMessage("Saldo insuficiente en la wallet de origen.");
    const origin=nodes.find(n=>n.id===from); const destination=nodes.find(n=>n.id===to); if(!origin||!destination)return;
    const { data, error } = await supabase.rpc("transfer_node_wallet", { p_from:from, p_to:to, p_amount:value, p_note:note||null });
    if(error){ const friendly=error.message.includes("INSUFFICIENT_FUNDS")?"Saldo insuficiente en la wallet de origen.":error.message.includes("AUTH_REQUIRED")?"Debes iniciar sesión.":error.message; return setMessage(friendly); }
    const txId=data?.id||""; const now=new Date().toLocaleString("es-MX");
    setAmount(""); setNote(""); await load(); setMessage(`Transferencia registrada: ${money(value)} de ${origin.name} a ${destination.name}.`);
    fetch("/api/wallet-notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({transactionId:txId,fromName:origin.name,toName:destination.name,amount:value,note:note||"Movimiento interno",date:now})}).catch(()=>{});
  }

  return <main className="wallet-shell"><header className="wallet-top"><div><div className="eyebrow">SISTEMA INTERNO</div><h1>TORRE DE LOS MAGOS</h1><p>Wallet persistente de movimientos entre nodos</p></div><div className="secure">● OPERANDO</div></header><section className="wallet-wrap"><div className="hero-row"><div><span className="label">BALANCE CONSOLIDADO</span><div className="total">{money(total)}</div><span className="muted">Fondos registrados entre todos los nodos</span></div><button className="ghost" onClick={load}>Actualizar</button></div>
  <section className="node-grid">{nodes.map(n=><article className={`node-card ${n.tone}`} key={n.id}><div className="node-head"><span>{n.city}</span><strong>{n.name}</strong></div><div className="node-balance">{money(n.balance)}</div><small>Saldo disponible</small></article>)}</section>
  <div className="main-grid"><section className="panel transfer-panel"><div className="panel-title"><div><span className="label">OPERACIÓN</span><h2>Nueva transferencia</h2></div><span className="lock">🔒 Interna</span></div><form onSubmit={transfer}><label>ORIGEN</label><select value={from} onChange={e=>setFrom(e.target.value)} disabled={loading}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name} · {n.city} · {money(n.balance)}</option>)}</select><label>DESTINO</label><select value={to} onChange={e=>setTo(e.target.value)} disabled={loading}>{nodes.map(n=><option key={n.id} value={n.id}>{n.name} · {n.city}</option>)}</select><label>IMPORTE MXN</label><input type="number" min="1" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" /><label>CONCEPTO</label><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Motivo del movimiento" /><button className="primary" type="submit" disabled={loading}>Transferir fondos →</button>{message&&<div className="message">{message}</div>}</form></section>
  <section className="panel history-panel"><div className="panel-title"><div><span className="label">TRAZABILIDAD</span><h2>Movimientos recientes</h2></div><span className="count">{movements.length}</span></div><div className="history">{movements.map(m=><div className="movement" key={m.id}><div className="movement-icon">↗</div><div className="movement-main"><strong>{m.from} → {m.to}</strong><span>{m.note}</span><small>{m.date} · {m.id}</small></div><b>{money(m.amount)}</b></div>)}</div></section></div></section></main>;
}
