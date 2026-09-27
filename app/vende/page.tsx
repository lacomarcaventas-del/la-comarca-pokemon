"use client";

import { ChangeEvent, DragEvent, useMemo, useState, type CSSProperties } from "react";
import { supabaseBrowser } from "../../lib/supabase";

type Mode = "items" | "collection" | null;

type Item = {
  id: number;
  name: string;
  quantity: number;
  language: string;
  rarity: string;
  condition: string;
  defects: string;
  expectedAmount: string;
};

const games = ["Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "One Piece", "Lorcana", "HeroClix", "Gundam", "Otro"];
const itemSteps = ["Contacto", "Artículos", "Pago", "Confirmar"];
const collectionSteps = ["Contacto", "Colección", "Pago", "Confirmar"];

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as CSSProperties,
  shell: { maxWidth: 1240, margin: "0 auto", padding: "28px 18px 60px" } as CSSProperties,
  hero: {
    borderRadius: 24,
    padding: "42px 38px",
    color: "#fff",
    background: "linear-gradient(105deg,#351306 0%,#1a1012 35%,#090e20 72%,#23152f 100%)",
    border: "1px solid #4f301c",
    boxShadow: "0 18px 45px rgba(0,0,0,.42)",
    position: "relative",
    overflow: "hidden",
  } as CSSProperties,
  eyebrow: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(240,180,91,.10)",
    border: "1px solid rgba(240,180,91,.45)",
    color: "#f0b45b",
    fontSize: 13,
    fontWeight: 800,
  } as CSSProperties,
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 68px)",
    lineHeight: .98,
    letterSpacing: "-.035em",
    margin: "18px 0 0",
    maxWidth: 800,
    fontWeight: 900,
    fontFamily: "'Cinzel', Georgia, serif",
  } as CSSProperties,
  heroText: { maxWidth: 740, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,.86)", marginTop: 18 } as CSSProperties,
  notice: {
    marginTop: 18,
    padding: "15px 18px",
    borderRadius: 16,
    background: "linear-gradient(145deg,#101720f5,#0a1017f5)",
    border: "1px solid #3b2c20",
    color: "#d8cbb9",
    lineHeight: 1.5,
  } as CSSProperties,
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 14,
    marginTop: 14,
  } as CSSProperties,
  modeCard: {
    border: "1px solid #55391f",
    borderRadius: 16,
    padding: 22,
    minHeight: 150,
    background: "linear-gradient(145deg,#121a24,#080d13)",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 12px 28px rgba(0,0,0,.22)",
    transition: ".18s ease",
  } as CSSProperties,
  icon: { fontSize: 30, marginBottom: 10 } as CSSProperties,
  modeTitle: { fontSize: 17, fontWeight: 800, marginBottom: 7, color: "#f0b45b", fontFamily: "'Cinzel', Georgia, serif" } as CSSProperties,
  modeText: { color: "#a6adb8", lineHeight: 1.45, fontSize: 13 } as CSSProperties,
  selected: { borderColor: "#d48636", background: "linear-gradient(145deg,#24170d,#111923)", boxShadow: "0 0 0 2px rgba(212,134,54,.2), 0 12px 28px rgba(0,0,0,.28)" } as CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(300px, .95fr)",
    gap: 18,
    marginTop: 24,
    alignItems: "start",
  } as CSSProperties,
  card: {
    background: "linear-gradient(145deg,#101720f5,#0a1017f5)",
    border: "1px solid #3b2c20",
    borderRadius: 18,
    boxShadow: "0 14px 34px rgba(0,0,0,.25)",
  } as CSSProperties,
  formCard: { padding: 24 } as CSSProperties,
  progress: { display: "flex", gap: 8, marginBottom: 28 } as CSSProperties,
  progressItem: { flex: 1, minWidth: 0 } as CSSProperties,
  progressLabel: { fontSize: 11, color: "#9ca3ad", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as CSSProperties,
  progressDot: { width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 900, margin: "0 auto 7px" } as CSSProperties,
  sectionTitle: { fontSize: 30, fontWeight: 900, letterSpacing: "-.02em", margin: 0, color: "#f0b45b", fontFamily: "'Cinzel', Georgia, serif" } as CSSProperties,
  sectionSub: { color: "#a6adb8", marginTop: 8, lineHeight: 1.5 } as CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 14, marginTop: 20 } as CSSProperties,
  field: { display: "grid", gap: 7 } as CSSProperties,
  label: { fontSize: 13, fontWeight: 800, color: "#cfc5b7" } as CSSProperties,
  input: { width: "100%", border: "1px solid #463727", borderRadius: 11, padding: "12px 13px", fontSize: 14, outline: "none", background: "#0b1118", color: "#f3eadc" } as CSSProperties,
  textarea: { width: "100%", border: "1px solid #463727", borderRadius: 11, padding: "11px 12px", fontSize: 14, outline: "none", background: "#0b1118", color: "#f3eadc", minHeight: 96, resize: "vertical" } as CSSProperties,
  games: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8, marginTop: 16 } as CSSProperties,
  gameButton: { border: "1px solid #55391f", borderRadius: 14, padding: "12px 8px", background: "linear-gradient(145deg,#111923,#070b11)", cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#f1e7d7" } as CSSProperties,
  upload: { border: "2px dashed #6a4a2a", borderRadius: 16, padding: "26px 18px", textAlign: "center", color: "#b7afa2", background: "#0b1118", cursor: "pointer" } as CSSProperties,
  actionRow: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 24 } as CSSProperties,
  primary: { border: "1px solid #ffb14e", borderRadius: 12, padding: "12px 18px", background: "linear-gradient(135deg,#e87928,#a91d25)", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 25px rgba(232,121,40,.18)" } as CSSProperties,
  secondary: { border: "1px solid #584126", borderRadius: 12, padding: "11px 16px", background: "#141b25", color: "#f5ead7", fontWeight: 800, cursor: "pointer" } as CSSProperties,
  side: { padding: 22, position: "sticky", top: 18 } as CSSProperties,
  sideTitle: { fontSize: 22, fontWeight: 900, margin: 0, color: "#f0b45b", fontFamily: "'Cinzel', Georgia, serif" } as CSSProperties,
  summaryBox: { marginTop: 14, border: "1px solid #4d3925", borderRadius: 17, padding: 15, background: "linear-gradient(145deg,#111923,#0a1017)" } as CSSProperties,
  muted: { color: "#a6adb8", fontSize: 13 } as CSSProperties,
  amount: { fontSize: 25, fontWeight: 900, marginTop: 7, color: "#f0a04a" } as CSSProperties,
  infoRow: { padding: "12px 0", borderBottom: "1px solid #2a2520", color: "#f1e7d7" } as CSSProperties,
  pill: { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 999, background: "#171f2a", border: "1px solid #5b4024", color: "#f0b45b", fontSize: 12, fontWeight: 900 } as CSSProperties,
};

export default function VendePage() {
  const [mode, setMode] = useState<Mode>(null);
  const [step, setStep] = useState(1);
  const [game, setGame] = useState("Pokémon");
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [language, setLanguage] = useState("Español");
  const [rarity, setRarity] = useState("");
  const [condition, setCondition] = useState("Near Mint");
  const [defects, setDefects] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [collectionPhotos, setCollectionPhotos] = useState<File[]>([]);
  const [excel, setExcel] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [credit, setCredit] = useState("Sí");
  const [contactName, setContactName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [bestCallTime, setBestCallTime] = useState("16:00–19:00");
  const [email, setEmail] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"coordinated" | "national">("coordinated");
  const [submitted, setSubmitted] = useState(false);
  const [submittedFolio, setSubmittedFolio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const steps = mode === "collection" ? collectionSteps : itemSteps;
  const photosLabel = useMemo(() => `${photos.length}/10 fotos`, [photos.length]);
  const collectionPhotosLabel = useMemo(() => `${collectionPhotos.length}/10 fotos`, [collectionPhotos.length]);

  function selectMode(next: Mode) {
    setMode(next);
    setStep(1);
  }

  function addItem() {
    if (!name.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: name.trim(),
        quantity: Math.max(1, qty),
        language,
        rarity: rarity.trim(),
        condition,
        defects: defects.trim(),
        expectedAmount: itemAmount.trim(),
      },
    ]);
    setName("");
    setQty(1);
    setRarity("");
    setDefects("");
    setItemAmount("");
  }

  function handlePhotos(e: ChangeEvent<HTMLInputElement>, target: "item" | "collection") {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/")).slice(0, 10);
    if (target === "item") setPhotos(files);
    else setCollectionPhotos(files);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>, target: "item" | "collection") {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/")).slice(0, 10);
    if (target === "item") setPhotos(files);
    else setCollectionPhotos(files);
  }

  function canContinue() {
    if (!mode) return false;
    if (step === 1) {
      return contactName.trim().length >= 2 && whatsapp.trim().length >= 7 && city.trim().length >= 2;
    }
    if (step === 2 && mode === "items") return items.length > 0;
    if (step === 2 && mode === "collection") return Boolean(excel);
    return true;
  }

  function parseMoney(value: string) {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  }

  async function submitRequest() {
    if (!mode || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    const requestId = crypto.randomUUID();
    const sb = supabaseBrowser();
    const itemRows = mode === "items"
      ? items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          language: item.language,
          rarity: item.rarity,
          condition: item.condition,
          defects: item.defects,
          expected_amount: parseMoney(item.expectedAmount),
        }))
      : [];

    const { data, error } = await sb.rpc("create_purchase_request", {
      p_payload: {
        id: requestId,
        mode,
        game,
        contact_name: contactName.trim(),
        whatsapp: whatsapp.trim(),
        city: city.trim(),
        best_call_time: bestCallTime,
        email: email.trim(),
        collection_name: collectionName.trim(),
        expected_total: parseMoney(expected),
        credit_choice: credit,
        delivery_method: deliveryMethod,
      },
      p_items: itemRows,
    });

    if (error || !data?.[0]) {
      setSubmitError(error?.message || "No pudimos registrar la solicitud.");
      setSubmitting(false);
      return;
    }

    const fileRows: { request_id: string; kind: string; storage_path: string; file_name: string; mime_type: string; size_bytes: number }[] = [];
    const filesToUpload = [
      ...photos.map((file) => ({ file, kind: "item_photo" })),
      ...collectionPhotos.map((file) => ({ file, kind: "collection_photo" })),
      ...(excel ? [{ file: excel, kind: "excel" }] : []),
    ];

    for (const entry of filesToUpload) {
      const safeName = entry.file.name.replace(/[^a-zA-Z0-9._-]+/g, "_");
      const path = 'intake/' + requestId + '/' + entry.kind + '/' + crypto.randomUUID() + '-' + safeName;
      const { error: uploadError } = await sb.storage.from("purchase-requests").upload(path, entry.file, {
        contentType: entry.file.type || undefined,
        upsert: false,
      });
      if (uploadError) {
        setSubmitError(`La solicitud ${data[0].folio} fue creada, pero no pudimos subir ${entry.file.name}.`);
        setSubmittedFolio(data[0].folio);
        setSubmitted(true);
        setSubmitting(false);
        return;
      }
      fileRows.push({
        request_id: requestId,
        kind: entry.kind,
        storage_path: path,
        file_name: entry.file.name,
        mime_type: entry.file.type,
        size_bytes: entry.file.size,
      });
    }

    if (fileRows.length) {
      const { error: fileRowError } = await sb.from("purchase_request_files").insert(fileRows);
      if (fileRowError) {
        setSubmitError(`La solicitud ${data[0].folio} fue creada, pero uno o más archivos no quedaron registrados.`);
        setSubmittedFolio(data[0].folio);
        setSubmitted(true);
        setSubmitting(false);
        return;
      }
    }

    setSubmittedFolio(data[0].folio);
    setSubmitted(true);
    setSubmitError("");
    setSubmitting(false);
  }

  async function next() {
    if (!canContinue() || submitting) return;
    if (step < steps.length) {
      setStep((n) => n + 1);
      return;
    }
    await submitRequest();
  }

  function back() {
    if (step === 1) {
      setMode(null);
      return;
    }
    setStep((n) => n - 1);
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Compra directa · La Comarca</div>
          <h1 style={styles.heroTitle}>Véndenos tus coleccionables</h1>
          <p style={styles.heroText}>
            Cuéntanos qué tienes, cuánto esperas recibir y cómo podemos contactarte. Revisamos cada solicitud y, si es de nuestro interés, un agente se pondrá en contacto contigo para coordinar la operación.
          </p>
        </section>

        <div style={styles.notice}>
          <strong>Revisamos cada solicitud manualmente.</strong> Indica la rareza específica cuando aplique y cualquier defecto o detalle que pueda afectar el estado. La evaluación puede tomar tiempo; agradecemos tu paciencia.
        </div>

        <section id="solicitud" style={{ ...styles.card, marginTop: 20, padding: 22 }}>
          {!mode && (
            <>
              <div style={{ padding: "4px 4px 8px" }}>
                <h2 style={{ ...styles.sectionTitle, fontSize: 25 }}>¿Qué quieres vender?</h2>
                <p style={styles.sectionSub}>Elige el formato que corresponde a lo que quieres ofrecer.</p>
              </div>
              <div style={styles.modeGrid}>
            <button
              type="button"
              onClick={() => selectMode("items")}
              style={{ ...styles.modeCard, ...(mode === "items" ? styles.selected : {}) }}
            >
              <div style={styles.icon}>🃏</div>
              <div style={styles.modeTitle}>Tengo hasta 10 cartas o artículos</div>
              <div style={styles.modeText}>
                Registra hasta 10 piezas e indica su rareza específica, idioma, condición, defectos y monto esperado.
              </div>
            </button>

            <button
              type="button"
              onClick={() => selectMode("collection")}
              style={{ ...styles.modeCard, ...(mode === "collection" ? styles.selected : {}) }}
            >
              <div style={styles.icon}>📚</div>
              <div style={styles.modeTitle}>Tengo una colección completa</div>
              <div style={styles.modeText}>
                Envía el listado en Excel y hasta 10 fotografías generales de la colección.
              </div>
            </button>
          </div>
            </>
          )}
        </section>

        {mode && (
          <section style={styles.grid}>
            <div style={{ ...styles.card, ...styles.formCard }}>
              <div style={styles.progress}>
                {steps.map((label, index) => {
                  const n = index + 1;
                  const active = step === n;
                  const done = step > n;
                  return (
                    <div key={label} style={styles.progressItem}>
                      <div style={{ ...styles.progressDot, background: active ? "#f0b45b" : done ? "#24613f" : "#151d26", color: active ? "#111" : done ? "#fff" : "#8e96a1", border: active ? "1px solid #ffca73" : "1px solid #5a4225" }}>{n}</div>
                      <div style={styles.progressLabel}>{label}</div>
                    </div>
                  );
                })}
              </div>

              {step === 1 && (
                <div>
                  <h2 style={styles.sectionTitle}>Datos de contacto</h2>
                  <p style={styles.sectionSub}>Déjanos tus datos y el mejor horario para que un agente pueda comunicarse contigo.</p>
                  <div style={styles.grid2}>
                    <Field label="Nombre" placeholder="Tu nombre" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                    <Field label="WhatsApp" placeholder="10 dígitos" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                    <Field label="Ciudad" placeholder="Ej. Mérida" value={city} onChange={(e) => setCity(e.target.value)} />
                    <div style={styles.field}>
                      <label style={styles.label}>Mejor horario para llamarte</label>
                      <select style={styles.input} value={bestCallTime} onChange={(e) => setBestCallTime(e.target.value)}>
                        <option>10:00–13:00</option>
                        <option>13:00–16:00</option>
                        <option>16:00–19:00</option>
                        <option>19:00–22:00</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <Field label="Correo (opcional)" placeholder="correo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && mode === "items" && (
                <div>
                  <h2 style={styles.sectionTitle}>Datos de tus piezas</h2>
                  <p style={styles.sectionSub}>Agrega hasta 10 piezas a esta solicitud.</p>

                  <div style={styles.games}>
                    {games.map((g) => (
                      <button key={g} type="button" onClick={() => setGame(g)} style={{ ...styles.gameButton, ...(game === g ? { borderColor: "#b89419", background: "#fff9d9" } : {}) }}>{g}</button>
                    ))}
                  </div>

                  <div style={styles.grid2}>
                    <Field label="Nombre de la pieza" placeholder="Umbreon ex" value={name} onChange={(e) => setName(e.target.value)} />
                    <div style={styles.field}>
                      <label style={styles.label}>Cantidad</label>
                      <input style={styles.input} type="number" min={1} max={10} value={qty} onChange={(e) => setQty(Math.min(10, Number(e.target.value) || 1))} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Idioma</label>
                      <select style={styles.input} value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option>Español</option><option>Inglés</option><option>Japonés</option><option>Otro</option>
                      </select>
                    </div>
                    <Field label="Rareza específica" placeholder="SIR, Promo, Full Art..." value={rarity} onChange={(e) => setRarity(e.target.value)} />
                    <div style={styles.field}>
                      <label style={styles.label}>Condición</label>
                      <select style={styles.input} value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option>Near Mint</option><option>Lightly Played</option><option>Moderately Played</option><option>Heavily Played</option><option>Damaged</option>
                      </select>
                    </div>
                    <Field label="¿Cuánto esperas recibir por esta pieza?" placeholder="$0 MXN" value={itemAmount} onChange={(e) => setItemAmount(e.target.value)} />
                  </div>

                  <div style={{ marginTop: 15 }}>
                    <label style={styles.label}>Defectos o detalles, si presenta alguno</label>
                    <textarea style={{ ...styles.textarea, marginTop: 7 }} value={defects} onChange={(e) => setDefects(e.target.value)} placeholder="Doblez, rayón, desgaste, mancha, piezas faltantes, etc." />
                  </div>

                  <label style={{ ...styles.upload, display: "block", marginTop: 15 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "item")}>
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotos(e, "item")} />
                    <div style={{ fontSize: 28 }}>📷</div>
                    <strong>{photosLabel}</strong>
                    <div style={styles.muted}>Agrega fotografías del artículo. Puedes seleccionar hasta 10.</div>
                  </label>

                  {items.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      {items.map((item, index) => (
                        <div key={item.id} style={{ ...styles.summaryBox, display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <strong>#{index + 1} {item.name}</strong>
                            <div style={styles.muted}>{item.quantity} · {item.language} · {item.rarity || "Rareza no indicada"} · {item.condition} · {item.expectedAmount || "$ —"}</div>
                            {item.defects && <div style={{ ...styles.muted, marginTop: 3 }}>Defectos: {item.defects}</div>}
                          </div>
                          <button type="button" style={styles.secondary} onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}>Quitar</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="button" style={{ ...styles.primary, marginTop: 15 }} onClick={addItem} disabled={items.length >= 10}>+ Agregar artículo</button>
                </div>
              )}

              {step === 2 && mode === "collection" && (
                <div>
                  <h2 style={styles.sectionTitle}>Cuéntanos sobre tu colección</h2>
                  <p style={styles.sectionSub}>
                    Para una colección completa, envíanos el listado y unas fotografías generales para poder revisarla.
                  </p>

                  <div style={{ marginTop: 18 }}>
                    <Field label="Nombre de la colección (opcional)" placeholder="Binder Pokémon 2023–2026" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
                  </div>

                  <label style={{ ...styles.upload, display: "block", marginTop: 15 }}>
                    <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => setExcel(e.target.files?.[0] || null)} />
                    <div style={{ fontSize: 28 }}>📄</div>
                    <strong>{excel ? excel.name : "Sube tu Excel (.xlsx, .xls o .csv)"}</strong>
                    <div style={styles.muted}>De preferencia incluye nombre, cantidad, idioma, rareza y condición en el listado.</div>
                  </label>

                  <label style={{ ...styles.upload, display: "block", marginTop: 15 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "collection")}>
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotos(e, "collection")} />
                    <div style={{ fontSize: 28 }}>🖼️</div>
                    <strong>{collectionPhotosLabel}</strong>
                    <div style={styles.muted}>Agrega hasta 10 fotografías generales de la colección.</div>
                  </label>
                </div>
              )}

              {step === 2 && (
                <></>
              )}

              {step === 3 && (
                <div>
                  <h2 style={styles.sectionTitle}>Monto y entrega</h2>
                  <div style={{ marginTop: 18 }}>
                    <Field label="¿Cuánto esperas recibir por todo?" placeholder="$12,500 MXN" value={expected} onChange={(e) => setExpected(e.target.value)} />
                  </div>

                  <div style={styles.summaryBox}>
                    <div style={{ fontWeight: 900 }}>¿También considerarías crédito en tienda?</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {["Sí", "No", "Podemos revisarlo"].map((x) => (
                        <button key={x} type="button" onClick={() => setCredit(x)} style={{ ...styles.secondary, ...(credit === x ? { background: "#fff6bf", borderColor: "#b89419" } : {}) }}>{x}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.summaryBox, marginTop: 15 }}>
                    <div style={{ fontWeight: 900 }}>¿Cómo nos entregarás tus productos?</div>
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      <button type="button" onClick={() => setDeliveryMethod("coordinated")} style={{ ...styles.secondary, textAlign: "left", ...(deliveryMethod === "coordinated" ? { borderColor: "#d48636", background: "#24170d", color: "#f0b45b" } : {}) }}>
                        <strong>📍 Entrega coordinada</strong><div style={styles.muted}>CDMX · Puebla · Mérida · Campeche</div>
                      </button>
                      <button type="button" onClick={() => setDeliveryMethod("national")} style={{ ...styles.secondary, textAlign: "left", ...(deliveryMethod === "national" ? { borderColor: "#d48636", background: "#24170d", color: "#f0b45b" } : {}) }}>
                        <strong>📦 Envío nacional</strong><div style={styles.muted}>Resto de México · opciones desde $200 MXN hasta 3 kg</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 style={styles.sectionTitle}>Revisa tu solicitud</h2>
                  <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                    <div style={styles.summaryBox}>✓ La rareza específica está indicada cuando corresponde.</div>
                    <div style={styles.summaryBox}>✓ Los defectos o detalles están descritos cuando existen.</div>
                    <div style={styles.summaryBox}>✓ En una colección, el Excel y las fotografías acompañan la solicitud.</div>
                    <div style={styles.summaryBox}>✓ La solicitud será revisada manualmente antes de contactarte.</div>
                    <div style={styles.summaryBox}>✓ Si lo que ofreces es de nuestro interés, un agente se comunicará contigo por los medios proporcionados.</div>
                  </div>
                </div>
              )}

              <div style={styles.actionRow}>
                <button type="button" style={styles.secondary} onClick={back}>← Regresar</button>
                <button type="button" style={{ ...styles.primary, opacity: canContinue() && !submitting ? 1 : .55 }} onClick={next} disabled={!canContinue() || submitting}>
                  {submitting ? "Enviando..." : step === steps.length ? "Enviar solicitud" : "Continuar →"}
                </button>
              </div>
            </div>

            <aside style={{ ...styles.card, ...styles.side }}>
              <h3 style={styles.sideTitle}>Resumen de solicitud</h3>
              <div style={styles.summaryBox}>
                <div style={styles.muted}>Modalidad</div>
                <div style={{ fontWeight: 900, marginTop: 3 }}>{mode === "collection" ? "Cuéntanos sobre tu colección" : "Hasta 10 artículos"}</div>
                <div style={{ ...styles.muted, marginTop: 10 }}>Juego</div>
                <div style={{ fontWeight: 900, marginTop: 3 }}>{game}</div>
                <div style={{ ...styles.muted, marginTop: 10 }}>Artículos</div>
                <div style={{ fontWeight: 900, marginTop: 3 }}>{items.length}</div>
                <div style={{ ...styles.muted, marginTop: 10 }}>Monto esperado</div>
                <div style={styles.amount}>{expected || "$ —"}</div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={styles.infoRow}><strong>Fotos</strong><div style={styles.muted}>{mode === "collection" ? collectionPhotosLabel : photosLabel}</div></div>
                <div style={styles.infoRow}><strong>Excel</strong><div style={styles.muted}>{excel ? "Adjunto" : "No adjunto"}</div></div>
                <div style={styles.infoRow}><strong>Crédito en tienda</strong><div style={styles.muted}>{credit}</div></div>
              </div>

              <div style={{ ...styles.summaryBox, marginTop: 18 }}>
                <div style={styles.muted}>Entrega</div>
                <div style={{ fontWeight: 900, marginTop: 4 }}>CDMX · Puebla · Mérida · Campeche</div>
                <div style={{ ...styles.muted, marginTop: 7 }}>Resto del país: envío coordinado.</div>
              </div>

              <div style={{ ...styles.summaryBox, marginTop: 12 }}>
                <div style={{ fontWeight: 900 }}>Revisión manual</div>
                <div style={{ ...styles.muted, marginTop: 5 }}>La paciencia es requerida. No todas las solicitudes resultan en una compra.</div>
              </div>
            </aside>
          </section>
        )}

        <section style={{ ...styles.card, marginTop: 20, padding: 24 }}>
          <h2 style={{ ...styles.sectionTitle, fontSize: 26 }}>¿Dónde entregarnos tus productos?</h2>
          <p style={styles.sectionSub}>
            Puedes dejarnos tus productos mediante una entrega coordinada o enviarlos desde cualquier parte de México.
          </p>
          <div style={styles.grid2}>
            <div style={styles.summaryBox}>
              <div style={styles.pill}>📍 Entrega coordinada</div>
              <div style={{ marginTop: 11, fontWeight: 900 }}>CDMX · Puebla · Mérida · Campeche</div>
              <div style={{ ...styles.muted, marginTop: 6 }}>
                Coordinamos contigo el lugar y horario para recibir tus cartas o coleccionables.
              </div>
            </div>
            <div style={styles.summaryBox}>
              <div style={styles.pill}>📦 Envío nacional</div>
              <div style={{ marginTop: 11, fontWeight: 900 }}>Resto de México</div>
              <div style={{ ...styles.muted, marginTop: 6 }}>
                Coordinamos el envío contigo. Contamos con opciones desde $200 MXN hasta 3 kg y el costo se considera al cerrar la operación.
              </div>
            </div>
          </div>
        </section>

      </div>

      {submitted && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 18, zIndex: 50 }}>
          <div style={{ ...styles.card, maxWidth: 520, padding: 28 }}>
            <div style={styles.pill}>Solicitud enviada</div>
            <h2 style={{ fontSize: 34, margin: "14px 0 8px", fontWeight: 900 }}>LC-2026-0001</h2>
            <p style={{ color: "#5f5b54", lineHeight: 1.6 }}>
              Hemos recibido tu información. Tu solicitud será revisada por nuestro equipo. Si es de nuestro interés, un agente se pondrá en contacto contigo.
            </p>
            <button style={{ ...styles.primary, marginTop: 8 }} onClick={() => setSubmitted(false)}>Cerrar</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          main > div { padding-left: 12px !important; padding-right: 12px !important; }
          section[style*="grid-template-columns: minmax(0, 2fr)"] { grid-template-columns: 1fr !important; }
          aside[style*="position: sticky"] { position: static !important; }
          section[style*="repeat(2,minmax(0,1fr))"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}

function Field({
  label,
  placeholder = "",
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      <input style={styles.input} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}
