"use client";
import { useEffect, useState } from "react";

type Message = { id: string; from_email: string; subject: string | null; body_text: string | null; received_at: string; status: string };

const modules = [
  ["◈", "Operaciones", "Consultas, seguimiento y acciones del sistema"],
  ["▦", "Inventario", "Entradas, movimientos y análisis"],
  ["◎", "Clientes", "Solicitudes y comunicación centralizada"],
  ["↗", "Reportes", "Compilación y seguimiento periódico"],
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("LISTO");
  const [messages, setMessages] = useState<Message[]>([]);
  const [panel, setPanel] = useState("ACTIVIDAD DEL SISTEMA");

  const loadInbox = async () => {
    try {
      const response = await fetch("/api/arquimides/inbox", { cache: "no-store" });
      const data = await response.json();
      if (data.ok) setMessages(data.messages || []);
    } catch { /* the dashboard remains usable while the channel reconnects */ }
  };

  useEffect(() => { loadInbox(); }, []);

  const run = () => {
    setStatus("PROCESANDO");
    setTimeout(() => setStatus("LISTO"), 900);
  };

  const openModule = (title: string) => {
    setPanel(title.toUpperCase());
    if (title === "Clientes" || title === "Operaciones") loadInbox();
    run();
  };

  return <main className="arquimidesShell">
    <section className="gridBg" />
    <nav className="archNav">
      <div className="archBrand"><span className="archMark">A</span><span>ARQUÍMIDES</span></div>
      <div className="systemState"><i /> SISTEMA {status}</div>
    </nav>

    <section className="heroArch">
      <div className="eyebrow">NÚCLEO OPERATIVO · LA COMARCA</div>
      <h1>ARQUÍMEDES</h1>
      <p>Centro operativo para recibir información, organizar solicitudes y convertir datos dispersos en acciones claras.</p>
      <div className="commandBox">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="Escribe una consulta o instrucción…" />
        <button onClick={run}>EJECUTAR ↗</button>
      </div>
    </section>

    <section className="moduleGrid">
      {modules.map(([icon, title, text]) => <button className="archCard" key={title} onClick={() => openModule(title)}>
        <span className="cardIcon">{icon}</span><span><strong>{title}</strong><small>{text}</small></span><b>→</b>
      </button>)}
    </section>

    <section className="activity">
      <div className="sectionHead"><span>{panel}</span><small>{messages.length ? `${messages.length} ENTRADAS` : "CANAL PRINCIPAL"}</small></div>
      <div className="terminal">
        {messages.length ? messages.slice(0, 5).map((message, index) => <p key={message.id}><em>{String(index + 1).padStart(2, "0")}</em> <strong>{message.from_email}</strong> — {message.subject || "Sin asunto"}</p>) : <>
          <p><em>01</em> Núcleo Arquimides inicializado</p>
          <p><em>02</em> Canal de entrada preparado</p>
          <p><em>03</em> Información entrante conectada al núcleo</p>
          <p className="cursor"><em>04</em> Esperando información de clientes</p>
        </>}
      </div>
    </section>

    <footer>ARQUÍMEDES · SISTEMA OPERATIVO · <span>LA COMARCA</span></footer>
  </main>;
}
