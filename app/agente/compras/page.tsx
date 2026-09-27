"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase";

type Status = "Pendiente" | "En revisión" | "Contactado" | "Comprado" | "No interesa";

type RequestRow = {
  id: string;
  folio: string;
  cliente: string;
  ciudad: string;
  juego: string;
  monto: string;
  horario: string;
  credit: string;
  status: Status;
};

const seed: RequestRow[] = [
  { id: "1", folio: "LC-2026-0001", cliente: "Juan Pérez", ciudad: "Mérida", juego: "Pokémon", monto: "$12,500", horario: "16:00–19:00", credit: "Sí", status: "Pendiente" },
  { id: "2", folio: "LC-2026-0002", cliente: "María López", ciudad: "CDMX", juego: "Magic: The Gathering", monto: "$7,800", horario: "13:00–16:00", credit: "No", status: "En revisión" },
  { id: "3", folio: "LC-2026-0003", cliente: "Carlos Ramírez", ciudad: "Campeche", juego: "One Piece", monto: "$3,200", horario: "19:00–22:00", credit: "Sí", status: "Contactado" },
];

const statusStyles: Record<Status, CSSProperties> = {
  Pendiente: { background: "#fff3cf", color: "#8a6500" },
  "En revisión": { background: "#dceaff", color: "#295aa8" },
  Contactado: { background: "#eee5ff", color: "#6641a3" },
  Comprado: { background: "#daf2df", color: "#267044" },
  "No interesa": { background: "#ececec", color: "#666" },
};

export default function ComprasPage() {
  const [checking, setChecking] = useState(true);
  const [requests, setRequests] = useState(seed);
  const [selected, setSelected] = useState(seed[0]);
  const [note, setNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await sb.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profile?.role !== "admin") {
        await sb.auth.signOut();
        router.replace("/login");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  function changeStatus(status: Status) {
    const next = { ...selected, status };
    setSelected(next);
    setRequests((prev) => prev.map((r) => (r.id === next.id ? next : r)));
  }

  if (checking) {
    return <main style={{ minHeight: "100vh", background: "#0b1512", color: "#fff", display: "grid", placeItems: "center", fontFamily: "Inter,system-ui" }}>Verificando acceso…</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#111816", color: "#f7f3ea", fontFamily: "Inter,system-ui,-apple-system,sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", minHeight: "100vh" }}>
        <aside style={{ padding: 18, borderRight: "1px solid #2b3934", background: "#0c1412" }}>
          <div style={{ color: "#f2d46a", fontWeight: 900, fontSize: 22 }}>LA COMARCA</div>
          <div style={{ color: "#8e9c96", fontSize: 12, marginTop: 4 }}>Panel del agente</div>

          <nav style={{ marginTop: 30, display: "grid", gap: 8 }}>
            {["Solicitudes", "En revisión", "Compradas", "No interesa", "Reportes"].map((x, i) => (
              <div key={x} style={{ padding: "11px 12px", borderRadius: 12, background: i === 0 ? "#173127" : "transparent", color: i === 0 ? "#fff" : "#b8c1bc", fontWeight: 700, fontSize: 13 }}>{x}</div>
            ))}
          </nav>

          <button onClick={() => router.push("/admin")} style={{ marginTop: 30, width: "100%", padding: "10px 12px", borderRadius: 11, border: "1px solid #32423c", background: "transparent", color: "#d8dfda", cursor: "pointer" }}>← Administración</button>
        </aside>

        <section style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 32 }}>Solicitudes de compra</h1>
              <div style={{ color: "#8e9c96", marginTop: 4 }}>Prototipo interno · los datos mostrados son de prueba</div>
            </div>
            <div style={{ padding: "8px 12px", borderRadius: 999, background: "#18362b", color: "#bfe6cf", fontSize: 12, fontWeight: 800 }}>Solo equipo La Comarca</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
            <div style={{ background: "#fff", color: "#171717", borderRadius: 18, overflow: "hidden", border: "1px solid #2f3d38" }}>
              <div style={{ padding: 14, borderBottom: "1px solid #ece8df" }}>
                <input placeholder="Buscar folio, cliente o juego" style={{ width: "100%", padding: "10px 12px", borderRadius: 11, border: "1px solid #d6d1c6" }} />
              </div>
              {requests.map((r) => {
                const active = selected.id === r.id;
                return (
                  <button key={r.id} onClick={() => setSelected(r)} style={{ width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid #efebe4", background: active ? "#f5f1e7" : "#fff", padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <strong>{r.folio}</strong>
                      <span style={{ ...statusStyles[r.status], padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>{r.status}</span>
                    </div>
                    <div style={{ marginTop: 5, fontWeight: 700, fontSize: 13 }}>{r.cliente}</div>
                    <div style={{ color: "#77736c", fontSize: 12, marginTop: 3 }}>{r.juego} · {r.ciudad} · {r.monto}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ background: "#fff", color: "#171717", borderRadius: 18, border: "1px solid #2f3d38", padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                <div>
                  <div style={{ color: "#7a766e", fontSize: 12 }}>Folio</div>
                  <h2 style={{ margin: "4px 0 0", fontSize: 31 }}>{selected.folio}</h2>
                </div>
                <span style={{ ...statusStyles[selected.status], padding: "7px 11px", borderRadius: 999, fontSize: 12, fontWeight: 900 }}>{selected.status}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 18 }}>
                <Info label="Cliente" value={selected.cliente} />
                <Info label="Ciudad" value={selected.ciudad} />
                <Info label="Horario" value={selected.horario} />
                <Info label="Juego" value={selected.juego} />
                <Info label="Monto esperado" value={selected.monto} />
                <Info label="Crédito en tienda" value={selected.credit} />
              </div>

              <div style={{ marginTop: 22 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Artículos recibidos</h3>
                <div style={{ marginTop: 10, display: "grid", gap: 9 }}>
                  <div style={lineCard}><div><strong>Umbreon ex</strong><div style={muted}>SIR · Español · Near Mint</div></div><strong>$8,000</strong></div>
                  <div style={lineCard}><div><strong>Mewtwo ex</strong><div style={muted}>Full Art · Español · Near Mint</div></div><strong>$4,500</strong></div>
                </div>
              </div>

              <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={panelBox}>
                  <strong>Archivos</strong>
                  <div style={{ marginTop: 10, color: "#59564e", fontSize: 13 }}>📄 Colección_Pokémon.xlsx</div>
                </div>
                <div style={panelBox}>
                  <strong>Fotografías</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7, marginTop: 10 }}>
                    {[0,1,2].map((x) => <div key={x} style={{ aspectRatio: "1", borderRadius: 9, background: x===0 ? "linear-gradient(135deg,#7b5421,#19231e)" : x===1 ? "linear-gradient(135deg,#4a3320,#b2843b)" : "linear-gradient(135deg,#204938,#141d19)" }} />)}
                    <div style={{ aspectRatio: "1", borderRadius: 9, background: "#1e2522", color: "#fff", display: "grid", placeItems: "center", fontSize: 11 }}>+7</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 22 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Acciones</h3>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {(Object.keys(statusStyles) as Status[]).map((status) => (
                    <button key={status} onClick={() => changeStatus(status)} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #d4d0c6", background: selected.status === status ? "#173a2d" : "#fff", color: selected.status === status ? "#fff" : "#2b2a27", fontWeight: 800, cursor: "pointer" }}>{status}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Notas internas</h3>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={7} placeholder="Solo visible para La Comarca…" style={{ width: "100%", borderRadius: 12, border: "1px solid #d6d1c7", padding: 12, resize: "vertical" }} />
                  <button style={{ marginTop: 8, padding: "10px 13px", borderRadius: 10, border: 0, background: "#173a2d", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Guardar nota</button>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Historial</h3>
                  <div style={{ borderLeft: "3px solid #ddd7cc", paddingLeft: 13, display: "grid", gap: 14 }}>
                    <div><strong>Solicitud recibida</strong><div style={muted}>Folio generado.</div></div>
                    <div><strong>Enviada a revisión</strong><div style={muted}>Pendiente de evaluación.</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

const muted: CSSProperties = { color: "#78736b", fontSize: 12, marginTop: 3 };
const lineCard: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: 12, border: "1px solid #e8e3da", borderRadius: 12, background: "#fcfbf8" };
const panelBox: CSSProperties = { background: "#f8f7f3", border: "1px solid #e6e1d8", borderRadius: 13, padding: 13 };

function Info({ label, value }: { label: string; value: string }) {
  return <div style={{ background: "#f8f7f3", border: "1px solid #e6e1d8", borderRadius: 13, padding: 12 }}><div style={{ color: "#7a766e", fontSize: 11 }}>{label}</div><div style={{ fontWeight: 800, marginTop: 4, fontSize: 13 }}>{value}</div></div>;
}
