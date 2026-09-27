"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase";

type Status = "pending" | "contacted" | "in_review" | "approved" | "rejected" | "received" | "closed";

type RequestRow = {
  id: string;
  folio: string;
  mode: "items" | "collection";
  game: string;
  contact_name: string;
  whatsapp: string;
  city: string;
  best_call_time: string;
  email: string | null;
  collection_name: string | null;
  expected_total: number | string;
  credit_choice: string;
  delivery_method: "coordinated" | "national";
  status: Status;
  created_at: string;
};

type ItemRow = {
  id: string;
  item_order: number;
  name: string;
  quantity: number;
  language: string;
  rarity: string | null;
  condition: string;
  defects: string | null;
  expected_amount: number | string;
};

type FileRow = {
  id: string;
  kind: "item_photo" | "collection_photo" | "excel";
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  url?: string;
};

const STATUS_LABELS: Record<Status, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  in_review: "En revisión",
  approved: "Aprobada",
  rejected: "No interesa",
  received: "Recibida",
  closed: "Cerrada",
};

const statusStyles: Record<Status, CSSProperties> = {
  pending: { background: "#fff3cf", color: "#8a6500" },
  contacted: { background: "#eee5ff", color: "#6641a3" },
  in_review: { background: "#dceaff", color: "#295aa8" },
  approved: { background: "#daf2df", color: "#267044" },
  rejected: { background: "#ececec", color: "#666" },
  received: { background: "#d7efe6", color: "#17664a" },
  closed: { background: "#e5e5e5", color: "#444" },
};

const money = (value: number | string) =>
  "$" + Number(value || 0).toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function ComprasPage() {
  const [checking, setChecking] = useState(true);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const loadRequests = useCallback(async () => {
    const sb = supabaseBrowser();
    const { data, error: requestError } = await sb
      .from("purchase_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (requestError) {
      setError(requestError.message);
      return;
    }

    const rows = (data || []) as RequestRow[];
    setRequests(rows);
    setSelected((current) => current ? rows.find((row) => row.id === current.id) || rows[0] || null : rows[0] || null);
  }, []);

  const loadDetails = useCallback(async (row: RequestRow) => {
    const sb = supabaseBrowser();
    const [{ data: itemData, error: itemError }, { data: fileData, error: fileError }] = await Promise.all([
      sb.from("purchase_request_items").select("*").eq("request_id", row.id).order("item_order"),
      sb.from("purchase_request_files").select("*").eq("request_id", row.id).order("created_at"),
    ]);

    if (itemError || fileError) {
      setError(itemError?.message || fileError?.message || "No se pudieron cargar los detalles.");
      return;
    }

    const rawFiles = (fileData || []) as FileRow[];
    const signedFiles: FileRow[] = [];
    for (const file of rawFiles) {
      const { data } = await sb.storage.from("purchase-requests").createSignedUrl(file.storage_path, 3600);
      signedFiles.push({ ...file, url: data?.signedUrl });
    }

    setItems((itemData || []) as ItemRow[]);
    setFiles(signedFiles);
  }, []);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: profile, error: profileError } = await sb
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !["admin", "agent"].includes(profile?.role || "")) {
        router.replace("/login");
        return;
      }

      await loadRequests();
      setChecking(false);
    })();
  }, [router, loadRequests]);

  useEffect(() => {
    if (selected) void loadDetails(selected);
    else {
      setItems([]);
      setFiles([]);
    }
  }, [selected, loadDetails]);

  async function changeStatus(status: Status) {
    if (!selected || busy) return;
    setBusy(true);
    setError("");
    const sb = supabaseBrowser();
    const { data: authData } = await sb.auth.getUser();

    const { error: updateError } = await sb
      .from("purchase_requests")
      .update({ status })
      .eq("id", selected.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    const { error: historyError } = await sb.from("purchase_request_history").insert({
      request_id: selected.id,
      action: "Cambio de estado",
      old_status: selected.status,
      new_status: status,
      created_by: authData.user?.id || null,
    });

    if (historyError) setError(historyError.message);

    const next = { ...selected, status };
    setSelected(next);
    setRequests((prev) => prev.map((row) => row.id === next.id ? next : row));
    setBusy(false);
  }

  async function saveNote() {
    if (!selected || !note.trim() || busy) return;
    setBusy(true);
    setError("");
    const sb = supabaseBrowser();
    const { data: authData } = await sb.auth.getUser();

    const { error: noteError } = await sb.from("purchase_request_notes").insert({
      request_id: selected.id,
      body: note.trim(),
      created_by: authData.user?.id || null,
    });

    if (noteError) setError(noteError.message);
    else setNote("");
    setBusy(false);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return requests;
    return requests.filter((row) =>
      [row.folio, row.contact_name, row.city, row.game].some((value) => value.toLowerCase().includes(q))
    );
  }, [requests, query]);

  if (checking) {
    return <main style={{ minHeight: "100vh", background: "#0b1512", color: "#fff", display: "grid", placeItems: "center", fontFamily: "Inter,system-ui" }}>Verificando acceso…</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0b1210", color: "#f7f3ea", fontFamily: "Inter,system-ui,-apple-system,sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh" }}>
        <aside style={{ padding: 18, borderRight: "1px solid #2b3934", background: "#0c1412" }}>
          <div style={{ color: "#f2d46a", fontWeight: 900, fontSize: 22 }}>LA COMARCA</div>
          <div style={{ color: "#8e9c96", fontSize: 12, marginTop: 4 }}>Compras · Coleccionables</div>
          <nav style={{ marginTop: 28, display: "grid", gap: 7 }}>
            {["Solicitudes", "En revisión", "Aprobadas", "Recibidas", "Cerradas"].map((x) => (
              <div key={x} style={{ padding: "10px 12px", borderRadius: 10, background: x === "Solicitudes" ? "#173127" : "transparent", color: x === "Solicitudes" ? "#fff" : "#b8c1bc", fontWeight: 700, fontSize: 13 }}>{x}</div>
            ))}
          </nav>
          <button onClick={() => router.push("/admin")} style={{ marginTop: 28, width: "100%", padding: "10px 12px", borderRadius: 11, border: "1px solid #32423c", background: "transparent", color: "#d8dfda", cursor: "pointer" }}>← Administración</button>
        </aside>

        <section style={{ padding: 22, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 32 }}>Solicitudes de compra</h1>
              <div style={{ color: "#8e9c96", marginTop: 4 }}>Solicitudes reales recibidas desde /vende</div>
            </div>
            <button onClick={() => void loadRequests()} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #3e524b", background: "#14221d", color: "#d8dfda", cursor: "pointer" }}>Actualizar</button>
          </div>

          {error && <div style={{ marginBottom: 14, padding: 12, borderRadius: 10, background: "#3a1f1e", border: "1px solid #6c3632", color: "#f1c4bf" }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "360px minmax(0,1fr)", gap: 16 }}>
            <div style={{ background: "#fff", color: "#171717", borderRadius: 18, overflow: "hidden", border: "1px solid #2f3d38", minHeight: 620 }}>
              <div style={{ padding: 14, borderBottom: "1px solid #ece8df" }}>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar folio, cliente o juego" style={{ width: "100%", padding: "10px 12px", borderRadius: 11, border: "1px solid #d6d1c6" }} />
              </div>
              {filtered.length === 0 && <div style={{ padding: 24, color: "#77736c" }}>No hay solicitudes.</div>}
              {filtered.map((row) => {
                const active = selected?.id === row.id;
                return (
                  <button key={row.id} onClick={() => setSelected(row)} style={{ width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid #efebe4", background: active ? "#f5f1e7" : "#fff", padding: 14, cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                      <strong>{row.folio}</strong>
                      <span style={{ ...statusStyles[row.status], padding: "4px 8px", borderRadius: 999, fontSize: 10, fontWeight: 800 }}>{STATUS_LABELS[row.status]}</span>
                    </div>
                    <div style={{ marginTop: 5, fontWeight: 700, fontSize: 13 }}>{row.contact_name}</div>
                    <div style={{ color: "#77736c", fontSize: 12, marginTop: 3 }}>{row.game} · {row.city} · {money(row.expected_total)}</div>
                  </button>
                );
              })}
            </div>

            {!selected ? (
              <div style={{ background: "#fff", color: "#555", borderRadius: 18, padding: 24, display: "grid", placeItems: "center" }}>Selecciona una solicitud.</div>
            ) : (
              <div style={{ background: "#fff", color: "#171717", borderRadius: 18, border: "1px solid #2f3d38", padding: 20, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
                  <div>
                    <div style={{ color: "#7a766e", fontSize: 12 }}>Folio</div>
                    <h2 style={{ margin: "4px 0 0", fontSize: 31 }}>{selected.folio}</h2>
                    <div style={{ color: "#77736c", fontSize: 12, marginTop: 5 }}>{new Date(selected.created_at).toLocaleString("es-MX")}</div>
                  </div>
                  <span style={{ ...statusStyles[selected.status], padding: "7px 11px", borderRadius: 999, fontSize: 12, fontWeight: 900 }}>{STATUS_LABELS[selected.status]}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 18 }}>
                  <Info label="Cliente" value={selected.contact_name} />
                  <Info label="WhatsApp" value={selected.whatsapp} />
                  <Info label="Ciudad" value={selected.city} />
                  <Info label="Horario" value={selected.best_call_time} />
                  <Info label="Juego" value={selected.game} />
                  <Info label="Modalidad" value={selected.mode === "collection" ? "Colección completa" : "Hasta 10 artículos"} />
                  <Info label="Monto esperado" value={money(selected.expected_total)} />
                  <Info label="Crédito en tienda" value={selected.credit_choice} />
                  <Info label="Entrega" value={selected.delivery_method === "national" ? "Envío nacional" : "Entrega coordinada"} />
                </div>

                {selected.email && <div style={{ marginTop: 12 }}><Info label="Correo" value={selected.email} /></div>}

                <div style={{ marginTop: 22 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Artículos</h3>
                  {selected.mode === "collection" && selected.collection_name && <div style={{ color: "#77736c", marginTop: 5 }}>{selected.collection_name}</div>}
                  <div style={{ marginTop: 10, display: "grid", gap: 9 }}>
                    {items.length === 0 ? (
                      <div style={panelBox}>No hay artículos individuales; revisar Excel y fotografías.</div>
                    ) : items.map((item) => (
                      <div key={item.id} style={lineCard}>
                        <div>
                          <strong>{item.quantity}× {item.name}</strong>
                          <div style={muted}>{item.rarity || "Rareza no indicada"} · {item.language} · {item.condition}</div>
                          {item.defects && <div style={{ ...muted, marginTop: 4 }}>Defectos: {item.defects}</div>}
                        </div>
                        <strong>{money(item.expected_amount)}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Archivos y fotografías</h3>
                  <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
                    {files.length === 0 && <div style={panelBox}>No hay archivos adjuntos.</div>}
                    {files.map((file) => (
                      <div key={file.id} style={{ ...panelBox, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                        <div><strong>{file.kind === "excel" ? "📄" : "🖼️"} {file.file_name}</strong><div style={muted}>{file.kind === "excel" ? "Excel" : "Fotografía"}{file.size_bytes ? " · " + (file.size_bytes / 1024 / 1024).toFixed(2) + " MB" : ""}</div></div>
                        {file.url && <a href={file.url} target="_blank" rel="noreferrer" style={{ color: "#225c48", fontWeight: 800, textDecoration: "none" }}>Abrir</a>}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <h3 style={{ margin: 0, fontSize: 18 }}>Cambiar estado</h3>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    {(Object.keys(STATUS_LABELS) as Status[]).map((status) => (
                      <button key={status} disabled={busy} onClick={() => void changeStatus(status)} style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid #d4d0c6", background: selected.status === status ? "#173a2d" : "#fff", color: selected.status === status ? "#fff" : "#2b2a27", fontWeight: 800, cursor: "pointer" }}>{STATUS_LABELS[status]}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Nota interna</h3>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={5} placeholder="Solo visible para el equipo La Comarca…" style={{ width: "100%", borderRadius: 12, border: "1px solid #d6d1c7", padding: 12, resize: "vertical" }} />
                  <button disabled={busy || !note.trim()} onClick={() => void saveNote()} style={{ marginTop: 8, padding: "10px 13px", borderRadius: 10, border: 0, background: "#173a2d", color: "#fff", fontWeight: 800, cursor: "pointer" }}>Guardar nota</button>
                </div>
              </div>
            )}
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
  return <div style={{ background: "#f8f7f3", border: "1px solid #e6e1d8", borderRadius: 13, padding: 12 }}><div style={{ color: "#7a766e", fontSize: 11 }}>{label}</div><div style={{ fontWeight: 800, marginTop: 4, fontSize: 13, wordBreak: "break-word" }}>{value}</div></div>;
}
