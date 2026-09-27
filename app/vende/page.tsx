"use client";

import { ChangeEvent, DragEvent, useMemo, useState, type CSSProperties } from "react";

type Mode = "items" | "collection" | null;

type Item = {
  id: number;
  name: string;
  quantity: number;
  language: string;
  rarity: string;
  condition: string;
  defects: string;
};

const games = ["Pokémon", "Magic: The Gathering", "Yu-Gi-Oh!", "One Piece", "Lorcana", "HeroClix", "Gundam", "Otro"];
const itemSteps = ["Contacto", "Artículos", "Pago", "Confirmar"];
const collectionSteps = ["Contacto", "Colección", "Pago", "Confirmar"];

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f1eee6",
    color: "#171717",
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as CSSProperties,
  shell: { maxWidth: 1240, margin: "0 auto", padding: "28px 18px 60px" } as CSSProperties,
  hero: {
    borderRadius: 30,
    padding: "38px 34px",
    color: "#fff",
    background: "linear-gradient(135deg,#071f19 0%,#184b39 52%,#6b5128 100%)",
    boxShadow: "0 20px 55px rgba(20,33,27,.2)",
  } as CSSProperties,
  eyebrow: {
    display: "inline-flex",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(255,208,71,.12)",
    border: "1px solid rgba(255,208,71,.4)",
    color: "#ffe28a",
    fontSize: 13,
    fontWeight: 800,
  } as CSSProperties,
  heroTitle: {
    fontSize: "clamp(42px, 7vw, 74px)",
    lineHeight: .96,
    letterSpacing: "-.04em",
    margin: "18px 0 0",
    maxWidth: 780,
    fontWeight: 900,
  } as CSSProperties,
  heroText: { maxWidth: 740, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,.86)", marginTop: 18 } as CSSProperties,
  heroButton: {
    marginTop: 24,
    background: "#f4c532",
    color: "#171717",
    border: 0,
    borderRadius: 999,
    padding: "13px 20px",
    fontWeight: 900,
    fontSize: 15,
    cursor: "pointer",
  } as CSSProperties,
  notice: {
    marginTop: 18,
    padding: "15px 18px",
    borderRadius: 18,
    background: "#fffaf0",
    border: "1px solid #e7dcc3",
    color: "#403a30",
    lineHeight: 1.5,
  } as CSSProperties,
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: 16,
    marginTop: 20,
  } as CSSProperties,
  modeCard: {
    border: "1px solid #ded9cf",
    borderRadius: 20,
    padding: 20,
    background: "#fff",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "0 8px 22px rgba(30,33,26,.06)",
  } as CSSProperties,
  icon: { fontSize: 30, marginBottom: 10 } as CSSProperties,
  modeTitle: { fontSize: 18, fontWeight: 900, marginBottom: 6 } as CSSProperties,
  modeText: { color: "#666159", lineHeight: 1.45, fontSize: 13 } as CSSProperties,
  selected: { borderColor: "#b89419", background: "#fff9dc", boxShadow: "0 0 0 3px rgba(244,197,50,.16)" } as CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 2fr) minmax(300px, .95fr)",
    gap: 26,
    marginTop: 24,
    alignItems: "start",
  } as CSSProperties,
  card: {
    background: "#fff",
    border: "1px solid #e1ddd3",
    borderRadius: 24,
    boxShadow: "0 12px 30px rgba(30,33,26,.08)",
  } as CSSProperties,
  formCard: { padding: 26 } as CSSProperties,
  progress: { display: "flex", gap: 8, marginBottom: 28 } as CSSProperties,
  progressItem: { flex: 1, minWidth: 0 } as CSSProperties,
  progressLabel: { fontSize: 11, color: "#5f5b54", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as CSSProperties,
  progressDot: { width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 900, margin: "0 auto 7px" } as CSSProperties,
  sectionTitle: { fontSize: 30, fontWeight: 900, letterSpacing: "-.02em", margin: 0, color: "#171717" } as CSSProperties,
  sectionSub: { color: "#625e56", marginTop: 8, lineHeight: 1.5 } as CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 15, marginTop: 20 } as CSSProperties,
  field: { display: "grid", gap: 7 } as CSSProperties,
  label: { fontSize: 13, fontWeight: 800, color: "#262522" } as CSSProperties,
  input: { width: "100%", border: "1px solid #d5d2ca", borderRadius: 13, padding: "11px 12px", fontSize: 14, outline: "none", background: "#fff", color: "#171717" } as CSSProperties,
  textarea: { width: "100%", border: "1px solid #d5d2ca", borderRadius: 13, padding: "11px 12px", fontSize: 14, outline: "none", background: "#fff", color: "#171717", minHeight: 96, resize: "vertical" } as CSSProperties,
  games: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginTop: 18 } as CSSProperties,
  gameButton: { border: "1px solid #d8d4c9", borderRadius: 14, padding: "12px 8px", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 800, color: "#2a2824" } as CSSProperties,
  upload: { border: "2px dashed #cfc9bc", borderRadius: 18, padding: "26px 18px", textAlign: "center", color: "#5e5a52", background: "#fbfaf7", cursor: "pointer" } as CSSProperties,
  actionRow: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 24 } as CSSProperties,
  primary: { border: 0, borderRadius: 13, padding: "12px 18px", background: "#143d2f", color: "#fff", fontWeight: 900, cursor: "pointer" } as CSSProperties,
  secondary: { border: "1px solid #d3d0c8", borderRadius: 13, padding: "12px 18px", background: "#fff", color: "#23211f", fontWeight: 800, cursor: "pointer" } as CSSProperties,
  side: { padding: 22, position: "sticky", top: 18 } as CSSProperties,
  sideTitle: { fontSize: 22, fontWeight: 900, margin: 0, color: "#171717" } as CSSProperties,
  summaryBox: { marginTop: 14, border: "1px solid #e8e4dc", borderRadius: 17, padding: 15, background: "#fcfbf8" } as CSSProperties,
  muted: { color: "#6f6a62", fontSize: 13 } as CSSProperties,
  amount: { fontSize: 25, fontWeight: 900, marginTop: 7, color: "#171717" } as CSSProperties,
  infoRow: { padding: "12px 0", borderBottom: "1px solid #ece9e2" } as CSSProperties,
  pill: { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 999, background: "#edf5f0", color: "#27503e", fontSize: 12, fontWeight: 900 } as CSSProperties,
  collectionBox: { marginTop: 18, padding: 18, borderRadius: 18, background: "#f8f7f3", border: "1px solid #e5e1d8" } as CSSProperties,
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
  const [collectionMode, setCollectionMode] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [collectionPhotos, setCollectionPhotos] = useState<File[]>([]);
  const [excel, setExcel] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [credit, setCredit] = useState("Sí");
  const [submitted, setSubmitted] = useState(false);

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
    if (step === 2 && mode === "items") return items.length > 0 || Boolean(name.trim());
    if (step === 2 && mode === "collection") return collectionMode;
    return true;
  }

  function next() {
    if (step === 2 && mode === "items" && items.length === 0) addItem();
    if (!canContinue()) return;
    if (step < steps.length) setStep((n) => n + 1);
    else setSubmitted(true);
  }

  function back() {
    if (step === 1) {
      setMode(null);
      return;
    }
    setStep((n) => n - 1);
  }

  function scrollToStart() {
    document.getElementById("solicitud")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Compra directa · La Comarca</div>
          <h1 style={styles.heroTitle}>Véndele tus coleccionables</h1>
          <p style={styles.heroText}>
            Cartas, figuras, binders y colecciones completas. Tú indicas qué tienes y cuánto esperas recibir; nosotros revisamos la información y te contactamos para coordinar la operación.
          </p>
          <button style={styles.heroButton} onClick={scrollToStart}>Comenzar solicitud</button>
        </section>

        <div style={styles.notice}>
          <strong>Importante:</strong> todas las solicitudes se revisan manualmente antes de ser aprobadas para evaluación. Escribe la rareza específica cuando aplique, indica cualquier defecto y ten paciencia durante el proceso.
        </div>

        <section id="solicitud" style={{ ...styles.card, marginTop: 20, padding: 22 }}>
          <div style={styles.modeGrid}>
            <button
              type="button"
              onClick={() => selectMode("items")}
              style={{ ...styles.modeCard, ...(mode === "items" ? styles.selected : {}) }}
            >
              <div style={styles.icon}>🃏</div>
              <div style={styles.modeTitle}>Tengo hasta 10 cartas o artículos</div>
              <div style={styles.modeText}>
                Agrega cada artículo individualmente, indica rareza, idioma, condición, defectos y monto esperado.
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
                Usa el formato para colección: adjunta un Excel con tu listado y hasta 10 fotografías generales.
              </div>
            </button>
          </div>
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
                      <div style={{ ...styles.progressDot, background: active ? "#f4c532" : done ? "#1c553e" : "#e7e3db", color: active ? "#111" : done ? "#fff" : "#69655d" }}>{n}</div>
                      <div style={styles.progressLabel}>{label}</div>
                    </div>
                  );
                })}
              </div>

              {step === 1 && (
                <div>
                  <h2 style={styles.sectionTitle}>Datos de contacto</h2>
                  <p style={styles.sectionSub}>Elige el mejor horario para que un agente pueda llamarte.</p>
                  <div style={styles.grid2}>
                    <Field label="Nombre" placeholder="Tu nombre" />
                    <Field label="WhatsApp" placeholder="10 dígitos" />
                    <Field label="Ciudad" placeholder="Ej. Mérida" />
                    <div style={styles.field}>
                      <label style={styles.label}>Mejor horario para llamarte</label>
                      <select style={styles.input} defaultValue="16:00–19:00">
                        <option>10:00–13:00</option>
                        <option>13:00–16:00</option>
                        <option>16:00–19:00</option>
                        <option>19:00–22:00</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginTop: 15 }}>
                    <Field label="Correo (opcional)" placeholder="correo@ejemplo.com" />
                  </div>
                </div>
              )}

              {step === 2 && mode === "items" && (
                <div>
                  <h2 style={styles.sectionTitle}>Tus artículos</h2>
                  <p style={styles.sectionSub}>Máximo 10 artículos en esta modalidad.</p>

                  <div style={styles.games}>
                    {games.map((g) => (
                      <button key={g} type="button" onClick={() => setGame(g)} style={{ ...styles.gameButton, ...(game === g ? { borderColor: "#b89419", background: "#fff9d9" } : {}) }}>{g}</button>
                    ))}
                  </div>

                  <div style={styles.grid2}>
                    <Field label="Nombre del artículo" placeholder="Umbreon ex" value={name} onChange={(e) => setName(e.target.value)} />
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
                    <Field label="Rareza específica (si aplica)" placeholder="SIR, Promo, Full Art..." value={rarity} onChange={(e) => setRarity(e.target.value)} />
                    <div style={styles.field}>
                      <label style={styles.label}>Condición</label>
                      <select style={styles.input} value={condition} onChange={(e) => setCondition(e.target.value)}>
                        <option>Near Mint</option><option>Lightly Played</option><option>Moderately Played</option><option>Heavily Played</option><option>Damaged</option>
                      </select>
                    </div>
                    <Field label="Monto esperado por artículo (opcional)" placeholder="$0 MXN" value={itemAmount} onChange={(e) => setItemAmount(e.target.value)} />
                  </div>

                  <div style={{ marginTop: 15 }}>
                    <label style={styles.label}>Defectos o detalles</label>
                    <textarea style={{ ...styles.textarea, marginTop: 7 }} value={defects} onChange={(e) => setDefects(e.target.value)} placeholder="Doblez, rayón, desgaste, mancha, piezas faltantes, etc." />
                  </div>

                  <label style={{ ...styles.upload, display: "block", marginTop: 15 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "item")}>
                    <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotos(e, "item")} />
                    <div style={{ fontSize: 28 }}>📷</div>
                    <strong>{photosLabel}</strong>
                    <div style={styles.muted}>Arrastra fotos o haz clic para seleccionarlas</div>
                  </label>

                  {items.length > 0 && (
                    <div style={{ marginTop: 18 }}>
                      {items.map((item, index) => (
                        <div key={item.id} style={{ ...styles.summaryBox, display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <strong>#{index + 1} {item.name}</strong>
                            <div style={styles.muted}>{item.quantity} · {item.language} · {item.rarity || "Rareza no indicada"} · {item.condition}</div>
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
                  <h2 style={styles.sectionTitle}>Colección completa</h2>
                  <p style={styles.sectionSub}>
                    Para colecciones grandes usamos un flujo distinto para que puedas enviar el listado completo sin capturar pieza por pieza.
                  </p>

                  <div style={styles.collectionBox}>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900, cursor: "pointer" }}>
                      <input type="checkbox" checked={collectionMode} onChange={(e) => setCollectionMode(e.target.checked)} />
                      Quiero enviar una colección completa
                    </label>
                  </div>

                  {collectionMode && (
                    <>
                      <div style={{ marginTop: 18 }}>
                        <Field label="Nombre de la colección" placeholder="Binder Pokémon 2023–2026" />
                      </div>

                      <label style={{ ...styles.upload, display: "block", marginTop: 15 }}>
                        <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={(e) => setExcel(e.target.files?.[0] || null)} />
                        <div style={{ fontSize: 28 }}>📄</div>
                        <strong>{excel ? excel.name : "Sube tu Excel (.xlsx, .xls o .csv)"}</strong>
                        <div style={styles.muted}>De preferencia incluye nombre, cantidad, idioma, rareza y condición.</div>
                      </label>

                      <label style={{ ...styles.upload, display: "block", marginTop: 15 }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, "collection")}>
                        <input type="file" accept="image/*" multiple hidden onChange={(e) => handlePhotos(e, "collection")} />
                        <div style={{ fontSize: 28 }}>🖼️</div>
                        <strong>{collectionPhotosLabel}</strong>
                        <div style={styles.muted}>Hasta 10 fotografías generales de la colección.</div>
                      </label>
                    </>
                  )}
                </div>
              )}

              {step === 2 && (
                <></>
              )}

              {step === 3 && (
                <div>
                  <h2 style={styles.sectionTitle}>Pago y logística</h2>
                  <div style={{ marginTop: 18 }}>
                    <Field label="Monto esperado por toda la operación" placeholder="$12,500 MXN" value={expected} onChange={(e) => setExpected(e.target.value)} />
                  </div>

                  <div style={styles.summaryBox}>
                    <div style={{ fontWeight: 900 }}>¿Aceptarías crédito en tienda?</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      {["Sí", "No", "Podemos revisarlo"].map((x) => (
                        <button key={x} type="button" onClick={() => setCredit(x)} style={{ ...styles.secondary, ...(credit === x ? { background: "#fff6bf", borderColor: "#b89419" } : {}) }}>{x}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.summaryBox, marginTop: 15 }}>
                    <div style={styles.pill}>✓ Entrega sin envío</div>
                    <div style={{ marginTop: 10, fontWeight: 900 }}>CDMX · Puebla · Mérida · Campeche</div>
                    <div style={{ ...styles.muted, marginTop: 5 }}>Coordina la entrega con nuestro equipo.</div>
                  </div>

                  <div style={{ ...styles.summaryBox, marginTop: 15 }}>
                    <div style={styles.pill}>📦 Resto de la República</div>
                    <div style={{ marginTop: 10, fontWeight: 900 }}>Coordinamos el envío contigo.</div>
                    <div style={{ ...styles.muted, marginTop: 5 }}>Contamos con opciones desde $200 MXN hasta 3 kg. El monto se cubre al final de la operación cuando aplique.</div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h2 style={styles.sectionTitle}>Confirmar solicitud</h2>
                  <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                    <div style={styles.summaryBox}>✓ La rareza específica debe indicarse cuando aplique.</div>
                    <div style={styles.summaryBox}>✓ Los defectos o detalles deben describirse.</div>
                    <div style={styles.summaryBox}>✓ En una colección, el Excel y las fotografías ayudan a realizar la evaluación.</div>
                    <div style={styles.summaryBox}>✓ Todas las solicitudes se revisan antes de ser aprobadas para evaluación.</div>
                    <div style={styles.summaryBox}>✓ Un agente se comunicará contigo por los medios de contacto que proporcionaste.</div>
                  </div>
                </div>
              )}

              <div style={styles.actionRow}>
                <button type="button" style={styles.secondary} onClick={back}>← Regresar</button>
                <button type="button" style={{ ...styles.primary, opacity: canContinue() ? 1 : .55 }} onClick={next}>
                  {step === steps.length ? "Enviar solicitud" : "Continuar →"}
                </button>
              </div>
            </div>

            <aside style={{ ...styles.card, ...styles.side }}>
              <h3 style={styles.sideTitle}>Resumen de solicitud</h3>
              <div style={styles.summaryBox}>
                <div style={styles.muted}>Modalidad</div>
                <div style={{ fontWeight: 900, marginTop: 3 }}>{mode === "collection" ? "Colección completa" : "Hasta 10 artículos"}</div>
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

        {!mode && (
          <section style={{ ...styles.card, marginTop: 20, padding: 28, textAlign: "center" }}>
            <div style={{ fontSize: 38 }}>🧭</div>
            <h2 style={{ margin: "10px 0 6px", fontSize: 26, fontWeight: 900 }}>Primero dinos qué vas a vender</h2>
            <p style={{ margin: 0, color: "#625e56" }}>El sistema te mostrará el formato adecuado según el tamaño de tu operación.</p>
          </section>
        )}
      </div>

      {submitted && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 18, zIndex: 50 }}>
          <div style={{ ...styles.card, maxWidth: 520, padding: 28 }}>
            <div style={styles.pill}>Solicitud recibida</div>
            <h2 style={{ fontSize: 34, margin: "14px 0 8px", fontWeight: 900 }}>LC-2026-0001</h2>
            <p style={{ color: "#5f5b54", lineHeight: 1.6 }}>
              Tu solicitud quedó registrada en modo demostración. En la versión conectada a Supabase se generará un folio real para que nuestro equipo la revise y pueda contactarte.
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
