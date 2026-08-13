"use client";

import { useMemo, useState } from "react";
import "./wallet.css";

type Node = { id: string; name: string; city: string; balance: number; tone: string };
type Movement = { id: string; date: string; from: string; to: string; amount: number; note: string };

const initialNodes: Node[] = [
  { id: "armando", name: "Armando", city: "CDMX", balance: 18500, tone: "blue" },
  { id: "pepe", name: "Pepe", city: "Puebla", balance: 12300, tone: "violet" },
  { id: "erick", name: "Erick", city: "Mérida", balance: 9700, tone: "cyan" },
  { id: "rodrigo", name: "Rodrigo", city: "Mérida", balance: 6400, tone: "amber" },
  { id: "daniel", name: "Daniel", city: "CDMX", balance: 5100, tone: "green" },
];

const initialMovements: Movement[] = [
  { id: "M-0048", date: "13/08/2026 10:42", from: "Armando", to: "Pepe", amount: 5000, note: "Compra de producto" },
  { id: "M-0047", date: "12/08/2026 18:10", from: "Erick", to: "Armando", amount: 3200, note: "Reposición" },
  { id: "M-0046", date: "12/08/2026 13:25", from: "Daniel", to: "Rodrigo", amount: 1800, note: "Producto" },
];

const money = (n: number) => `$${n.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`;

export default function WalletPage() {
  const [nodes, setNodes] = useState(initialNodes);
  const [movements, setMovements] = useState(initialMovements);
  const [from, setFrom] = useState("armando");
  const [to, setTo] = useState("pepe");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const total = useMemo(() => nodes.reduce((sum, n) => sum + n.balance, 0), [nodes]);
  const selected = nodes.find((n) => n.id === from);

  function transfer(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) return setMessage("Indica un importe válido.");
    if (from === to) return setMessage("El origen y destino deben ser diferentes.");
    if (!selected || selected.balance < value) return setMessage("Saldo insuficiente en la wallet de origen.");

    const origin = nodes.find((n) => n.id === from)?.name || from;
    const destination = nodes.find((n) => n.id === to)?.name || to;
    setNodes((current) => current.map((n) => n.id === from ? { ...n, balance: n.balance - value } : n.id === to ? { ...n, balance: n.balance + value } : n));
    setMovements((current) => [{ id: `M-${String(49 + current.length).padStart(4, "0")}`, date: new Date().toLocaleString("es-MX"), from: origin, to: destination, amount: value, note: note || "Movimiento interno" }, ...current]);
    setAmount(""); setNote(""); setMessage(`Transferencia registrada: ${money(value)} de ${origin} a ${destination}.`);
  }

  return (
    <main className="wallet-shell">
      <header className="wallet-top">
        <div><div className="eyebrow">SISTEMA INTERNO</div><h1>TORRE DE LOS MAGOS</h1><p>Wallet de movimientos entre nodos</p></div>
        <div className="secure">● OPERANDO</div>
      </header>

      <section className="wallet-wrap">
        <div className="hero-row">
          <div><span className="label">BALANCE CONSOLIDADO</span><div className="total">{money(total)}</div><span className="muted">Fondos registrados entre todos los nodos</span></div>
          <button className="ghost" onClick={() => setMessage("Panel conectado a la wallet interna.")}>Actualizar</button>
        </div>

        <section className="node-grid">
          {nodes.map((node) => <article className={`node-card ${node.tone}`} key={node.id}><div className="node-head"><span>{node.city}</span><strong>{node.name}</strong></div><div className="node-balance">{money(node.balance)}</div><small>Saldo disponible</small></article>)}
        </section>

        <div className="main-grid">
          <section className="panel transfer-panel"><div className="panel-title"><div><span className="label">OPERACIÓN</span><h2>Nueva transferencia</h2></div><span className="lock">🔒 Interna</span></div>
            <form onSubmit={transfer}>
              <label>ORIGEN</label><select value={from} onChange={(e) => setFrom(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.name} · {n.city} · {money(n.balance)}</option>)}</select>
              <label>DESTINO</label><select value={to} onChange={(e) => setTo(e.target.value)}>{nodes.map((n) => <option key={n.id} value={n.id}>{n.name} · {n.city}</option>)}</select>
              <label>IMPORTE MXN</label><input type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
              <label>CONCEPTO</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Motivo del movimiento" />
              <button className="primary" type="submit">Transferir fondos →</button>
              {message && <div className="message">{message}</div>}
            </form>
          </section>

          <section className="panel history-panel"><div className="panel-title"><div><span className="label">TRAZABILIDAD</span><h2>Movimientos recientes</h2></div><span className="count">{movements.length}</span></div>
            <div className="history">{movements.map((m) => <div className="movement" key={m.id}><div className="movement-icon">↗</div><div className="movement-main"><strong>{m.from} → {m.to}</strong><span>{m.note}</span><small>{m.date} · {m.id}</small></div><b>{money(m.amount)}</b></div>)}</div>
          </section>
        </div>
      </section>
    </main>
  );
}
