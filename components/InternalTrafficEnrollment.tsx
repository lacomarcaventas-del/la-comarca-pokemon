"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lc_internal_traffic_device";
const DEVICES = [
  { id: "store_pc", label: "PC de la tienda" },
  { id: "marco_mobile_chrome", label: "Teléfono de Marco · Chrome" },
] as const;

export default function InternalTrafficEnrollment() {
  const [device, setDevice] = useState<string>("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try { setDevice(localStorage.getItem(STORAGE_KEY) || ""); } catch {}
    setReady(true);
  }, []);

  function register(id: string) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
      setDevice(id);
    } catch {
      window.alert("No fue posible guardar la identificación en este navegador.");
    }
  }

  function clear() {
    try { localStorage.removeItem(STORAGE_KEY); setDevice(""); } catch {}
  }

  const selected = DEVICES.find((item) => item.id === device);

  return (
    <section className="panel" style={{ marginTop: 16, border: "1px solid var(--border, #e5e7eb)" }}>
      <h2>Prueba · Dispositivos internos</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Marca este navegador como dispositivo de La Comarca. La marca queda guardada localmente
        y se enviará con las próximas visitas públicas. No depende de Wi-Fi ni de la dirección IP.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {DEVICES.map((item) => (
          <button
            key={item.id}
            className="btn2"
            type="button"
            disabled={!ready}
            aria-pressed={device === item.id}
            onClick={() => register(item.id)}
          >
            {device === item.id ? "✓ " : ""}Registrar {item.label}
          </button>
        ))}
        <button className="btn2" type="button" disabled={!ready || !device} onClick={clear}>
          Quitar marca interna
        </button>
      </div>
      <p role="status" style={{ marginBottom: 0, marginTop: 12, fontSize: 13 }}>
        {!ready ? "Comprobando este navegador…" : selected
          ? `Este navegador está marcado como tráfico interno: ${selected.label}.`
          : "Este navegador todavía no está marcado como dispositivo interno."}
      </p>
    </section>
  );
}
