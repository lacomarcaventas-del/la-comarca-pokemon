"use client";
import { useState } from "react";

const modules = [
  ["◈", "Operaciones", "Consultas, seguimiento y acciones del sistema"],
  ["▦", "Inventario", "Entradas, movimientos y análisis"],
  ["◎", "Clientes", "Solicitudes y comunicación centralizada"],
  ["↗", "Reportes", "Compilación y seguimiento periódico"],
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("LISTO");
  const run = () => {
    setStatus("PROCESANDO");
    setTimeout(() => setStatus("LISTO"), 900);
  };

  return <main className="arquimidesShell">
    <section className="gridBg" />
    <nav className="archNav">
      <div className="archBrand"><span className="archMark">A</span><span>ARQUÍMIDES</span></div>
      <div className="systemState"><i /> SISTEMA {status}</div>
    </nav>

    <section className="heroArch">
      <div className="eyebrow">NÚCLEO OPERATIVO · LA COMARCA</div>
      <h1>ARQUÍMIDES</h1>
      <p>Centro operativo para organizar información, ejecutar consultas y convertir datos dispersos en acciones claras.</p>
      <div className="commandBox">
        <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && run()} placeholder="Escribe una consulta o instrucción…" />
        <button onClick={run}>EJECUTAR ↗</button>
      </div>
    </section>

    <section className="moduleGrid">
      {modules.map(([icon, title, text]) => <button className="archCard" key={title} onClick={run}>
        <span className="cardIcon">{icon}</span><span><strong>{title}</strong><small>{text}</small></span><b>→</b>
      </button>)}
    </section>

    <section className="activity">
      <div className="sectionHead"><span>ACTIVIDAD DEL SISTEMA</span><small>CANAL PRINCIPAL</small></div>
      <div className="terminal">
        <p><em>01</em> Núcleo Arquimides inicializado</p>
        <p><em>02</em> Canal de correo preparado</p>
        <p><em>03</em> Resend configurado en entorno de producción</p>
        <p className="cursor"><em>04</em> Esperando instrucciones</p>
      </div>
    </section>

    <footer>ARQUÍMIDES · SISTEMA OPERATIVO · <span>LA COMARCA</span></footer>
  </main>;
}
