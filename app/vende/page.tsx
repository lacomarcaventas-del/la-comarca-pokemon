'use client';

import { ChangeEvent, DragEvent, useMemo, useState } from "react";

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
const steps = ["Datos", "Artículos", "Colección", "Pago", "Confirmar"];
const timeSlots = ["10:00–13:00", "13:00–16:00", "16:00–19:00", "19:00–22:00"];

const styles = {
  page: { minHeight: "100vh", background: "#f1eee6", color: "#171717", fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" } as React.CSSProperties,
  shell: { maxWidth: 1240, margin: "0 auto", padding: "28px 18px 60px" } as React.CSSProperties,
  hero: { borderRadius: 30, padding: "38px 34px", color: "#fff", background: "linear-gradient(135deg,#071f19 0%,#184b39 52%,#6b5128 100%)", boxShadow: "0 20px 55px rgba(20,33,27,.2)" } as React.CSSProperties,
  eyebrow: { display: "inline-flex", padding: "8px 12px", borderRadius: 999, background: "rgba(255,208,71,.12)", border: "1px solid rgba(255,208,71,.4)", color: "#ffe28a", fontSize: 13, fontWeight: 700 } as React.CSSProperties,
  title: { fontSize: "clamp(42px, 7vw, 74px)", lineHeight: .96, letterSpacing: "-.04em", margin: "18px 0 0", maxWidth: 780, fontWeight: 900 } as React.CSSProperties,
  heroText: { maxWidth: 720, fontSize: 18, lineHeight: 1.55, color: "rgba(255,255,255,.82)", marginTop: 18 } as React.CSSProperties,
  heroButton: { marginTop: 24, background: "#f4c532", color: "#171717", border: 0, borderRadius: 999, padding: "13px 20px", fontWeight: 800, fontSize: 15, cursor: "pointer" } as React.CSSProperties,
  notice: { marginTop: 18, padding: "15px 18px", borderRadius: 18, background: "#eef8f2", border: "1px solid #cce6d6", color: "#234634", lineHeight: 1.5 } as React.CSSProperties,
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(300px, .95fr)", gap: 26, marginTop: 24, alignItems: "start" } as React.CSSProperties,
  card: { background: "#fff", border: "1px solid #e1ddd3", borderRadius: 24, boxShadow: "0 12px 30px rgba(30,33,26,.08)" } as React.CSSProperties,
  formCard: { padding: 26 } as React.CSSProperties,
  progress: { display: "flex", gap: 8, marginBottom: 28 } as React.CSSProperties,
  progressItem: { flex: 1, minWidth: 0 } as React.CSSProperties,
  progressDot: { width: 38, height: 38, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 800, marginBottom: 7 } as React.CSSProperties,
  progressLabel: { fontSize: 11, color: "#777", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as React.CSSProperties,
  sectionTitle: { fontSize: 30, fontWeight: 900, letterSpacing: "-.02em", margin: 0 } as React.CSSProperties,
  sectionSub: { color: "#6b6b6b", marginTop: 8, lineHeight: 1.5 } as React.CSSProperties,
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 15, marginTop: 20 } as React.CSSProperties,
  field: { display: "grid", gap: 7 } as React.CSSProperties,
  label: { fontSize: 13, fontWeight: 800 } as React.CSSProperties,
  input: { width: "100%", border: "1px solid #d5d2ca", borderRadius: 13, padding: "11px 12px", fontSize: 14, outline: "none", background: "#fff" } as React.CSSProperties,
  textarea: { width: "100%", border: "1px solid #d5d2ca", borderRadius: 13, padding: "11px 12px", fontSize: 14, outline: "none", background: "#fff", minHeight: 96, resize: "vertical" } as React.CSSProperties,
  games: { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10, marginTop: 18 } as React.CSSProperties,
  gameButton: { border: "1px solid #d8d4c9", borderRadius: 14, padding: "12px 8px", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700 } as React.CSSProperties,
  upload: { border: "2px dashed #cfc9bc", borderRadius: 18, padding: "26px 18px", textAlign: "center", color: "#6c675f", background: "#fbfaf7", cursor: "pointer" } as React.CSSProperties,
  actionRow: { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 24 } as React.CSSProperties,
  primary: { border: 0, borderRadius: 13, padding: "12px 18px", background: "#143d2f", color: "#fff", fontWeight: 800, cursor: "pointer" } as React.CSSProperties,
  secondary: { border: "1px solid #d3d0c8", borderRadius: 13, padding: "12px 18px", background: "#fff", fontWeight: 800, cursor: "pointer" } as React.CSSProperties,
  side: { padding: 22, position: "sticky", top: 18 } as React.CSSProperties,
  sideTitle: { fontSize: 22, fontWeight: 900, margin: 0 } as React.CSSProperties,
  summaryBox: { marginTop: 14, border: "1px solid #e8e4dc", borderRadius: 17, padding: 15, background: "#fcfbf8" } as React.CSSProperties,
  muted: { color: "#74716b", fontSize: 13 } as React.CSSProperties,
  amount: { fontSize: 25, fontWeight: 900, marginTop: 7 } as React.CSSProperties,
  infoRow: { padding: "12px 0", borderBottom: "1px solid #ece9e2" } as React.CSSProperties,
  pill: { display: "inline-flex", alignItems: "center", gap: 7, padding: "7px 11px", borderRadius: 999, background: "#edf5f0", color: "#27503e", fontSize: 12, fontWeight: 800 } as React.CSSProperties,
  collectionBox: { marginTop: 18, padding: 18, borderRadius: 18, background: "#f8f7f3", border: "1px solid #e5e1d8" } as React.CSSProperties,
};

export default function VendePage() {
  const [step, setStep] = useState(1);
  const [game, setGame] = useState("Pokémon");
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [language, setLanguage] = useState("Español");
  const [rarity, setRarity] = useState("");
  const [condition, setCondition] = useState("Near Mint");
  const [defects, setDefects] = useState("");
  const [collectionMode, setCollectionMode] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [collectionPhotos, setCollectionPhotos] = useState<File[]>([]);
  const [excel, setExcel] = useState<File | null>(null);
  const [expected, setExpected] = useState("");
  const [credit, setCredit] = useState("Sí");
  const [submitted, setSubmitted] = useState(false);

  const photosLabel = useMemo(() => `${photos.length}/10 fotos`, [photos.length]);
  const collectionPhotosLabel = useMemo(() => `${collectionPhotos.length}/10 fotos`, [collectionPhotos.length]);

  function addItem() {
    if (!name.trim()) return;
    setItems((prev) => [...prev, { id: Date.now(), name: name.trim(), quantity: Math.max(1, qty), language, rarity: rarity.trim(), condition, defects: defects.trim() }]);
    setName("");
    setQty(1);
    setRarity("");
    setDefects("");
  }

  function handlePhotos(e: ChangeEvent<HTMLInputElement>, target: "item" | "collection") {
    const files = Array.from(e.target.files || []).slice(0, 10);
    if (target === "item") setPhotos(files);
    else setCollectionPhotos(files);
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>, target: "item" | "collection") {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/")).slice(0, 10);
    if (target === "item") setPhotos(files);
    else setCollectionPhotos(files);
  }

  function setNext() {
    if (step === 2 && items.length === 0) {
      addItem();
      return;
    }
    if (step < 5) setStep(step + 1);
    else setSubmitted(true);
  }

  function scrollToForm() {
    document.getElementById("solicitud")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.eyebrow}>Compra directa · Sin intermediarios</div>
          <h1 style={styles.title}>Véndele tus coleccionables</h1>
          <p style={styles.heroText}>
            Envíanos cartas, figuras, binders o colecciones completas. Si son de interés para La Comarca, un agente se pondrá en contacto contigo para coordinar la operación.
          </p>
          <button style={styles.heroButton} onClick={scrollToForm}>Comenzar solicitud</button>
        </section>

        <div style={styles.notice}>
          <strong>Importante:</strong> no garantizamos la compra de todos los artículos. Todas las solicitudes son revisadas manualmente y agradecemos tu paciencia durante la evaluación.
        </div>

        <section id="solicitud" style={styles.grid}>
          <div style={{ ...styles.card, ...styles.formCard }}>
            <div style={styles.progress}>
              {steps.map((label, index) => {
                const n = index + 1;
                const active = step === n;
                const done = step > n;
                return (
                  <div key={label} style={styles.progressItem}>
                    <div style={{ ...styles.progressDot, margin: "0 auto 7px", background: active ? "#f4c532" : done ? "#1c553e" : "#e7e3db", color: active ? "#111" : done ? "#fff" : "#6e6b64" }}>{n}</div>
                    <div style={styles.progressLabel}>{label}</div>
                  </div>
                );
              })}
            </div>

            {step === 1 && (
              <div>
                <h2 style={styles.sectionTitle}>Datos de contacto</h2>
                <p style={styles.sectionSub}>Utilizaremos estos datos únicamente para comunicarnos contigo sobre tu solicitud.</p>
                <div style={styles.grid2}>
                  <Field label="Nombre" placeholder="Tu nombre" />
                  <Field label="WhatsApp" placeholder="10 dígitos" />
                  <Field label="Ciudad" placeholder="Ej. Mérida" />
                  <div style={styles.field}>
                    <label style={styles.label}>Mejor horario para llamarte</label>
                    <select style={styles.input} defaultValue={timeSlots[2]}>
                      {timeSlots.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 15 }}>
                  <Field label="Correo (opcional)" placeholder="correo@ejemplo.com" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={styles.sectionTitle}>Artículos</h2>
                <p style={styles.sectionSub}>Puedes agregar uno o varios artículos a la misma solicitud.</p>
                <div style={styles.games}>
                  {games.map((g) => (
                    <button key={g} type="button" onClick={() => setGame(g)} style={{ ...styles.gameButton, ...(game === g ? { borderColor: "#b89419", background: "#fff9d9" } : {}) }}>{g}</button>
                  ))}
                </div>

                <div style={styles.grid2}>
                  <Field label="Nombre del artículo" placeholder="Umbreon ex" value={name} onChange={(e) => setName(e.target.value)} />
                  <div style={styles.field}>
                    <label style={styles.label}>Cantidad</label>
                    <input style={styles.input} type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value) || 1)} />
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
                  <div style={styles.field}>
                    <label style={styles.label}>Monto esperado (opcional por artículo)</label>
                    <input style={styles.input} placeholder="$0 MXN" />
                  </div>
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
                    {items.map((item) => (
                      <div key={item.id} style={{ ...styles.summaryBox, display: "flex", justifyContent: "space-between", gap: 12 }}>
                        <div>
                          <strong>{item.name}</strong>
                          <div style={styles.muted}>{item.quantity} · {item.language} · {item.rarity || "Rareza no indicada"} · {item.condition}</div>
                        </div>
                        <button style={styles.secondary} onClick={() => setItems((prev) => prev.filter((x) => x.id !== item.id))}>Quitar</button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" style={{ ...styles.primary, marginTop: 15 }} onClick={addItem}>+ Agregar otro artículo</button>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={styles.sectionTitle}>Colección completa</h2>
                <p style={styles.sectionSub}>Puedes adjuntar una colección grande además de los artículos individuales.</p>

                <div style={styles.collectionBox}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, cursor: "pointer" }}>
                    <input type="checkbox" checked={collectionMode} onChange={(e) => setCollectionMode(e.target.checked)} />
                    También quiero vender una colección completa
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
                      <div style={styles.muted}>De preferencia con Nombre, Cantidad, Idioma, Rareza y Condición.</div>
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

            {step === 4 && (
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
                  <div style={{ marginTop: 10, fontWeight: 800 }}>CDMX · Puebla · Mérida · Campeche</div>
                  <div style={{ ...styles.muted, marginTop: 5 }}>Coordina la entrega con nuestro equipo.</div>
                </div>

                <div style={{ ...styles.summaryBox, marginTop: 15 }}>
                  <div style={styles.pill}>📦 Resto de la República</div>
                  <div style={{ marginTop: 10, fontWeight: 800 }}>Coordinamos el envío contigo.</div>
                  <div style={{ ...styles.muted, marginTop: 5 }}>Contamos con opciones desde $200 MXN hasta 3 kg. El monto se cubre al final de la operación cuando aplique.</div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 style={styles.sectionTitle}>Confirmar solicitud</h2>
                <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                  <div style={styles.summaryBox}>✓ La rareza específica debe indicarse cuando aplique.</div>
                  <div style={styles.summaryBox}>✓ Los defectos o detalles deben describirse.</div>
                  <div style={styles.summaryBox}>✓ En una colección, el Excel y las fotografías ayudan a realizar la evaluación.</div>
                  <div style={styles.summaryBox}>✓ Todas las solicitudes son revisadas antes de ser aprobadas para evaluación.</div>
                  <div style={styles.summaryBox}>✓ Si es de nuestro interés, un agente se comunicará contigo por los medios proporcionados.</div>
                </div>
              </div>
            )}

            <div style={styles.actionRow}>
              <button type="button" style={{ ...styles.secondary, visibility: step === 1 ? "hidden" : "visible" }} onClick={() => setStep((n) => Math.max(1, n - 1))}>← Regresar</button>
              <button type="button" style={styles.primary} onClick={setNext}>{step === 5 ? "Enviar solicitud" : "Continuar →"}</button>
            </div>
          </div>

          <aside style={{ ...styles.card, ...styles.side }}>
            <h3 style={styles.sideTitle}>Resumen de solicitud</h3>
            <div style={styles.summaryBox}>
              <div style={styles.muted}>Juego</div>
              <div style={{ fontWeight: 900, marginTop: 3 }}>{game}</div>
              <div style={{ ...styles.muted, marginTop: 10 }}>Artículos</div>
              <div style={{ fontWeight: 900, marginTop: 3 }}>{items.length}</div>
              <div style={{ ...styles.muted, marginTop: 10 }}>Monto esperado</div>
              <div style={styles.amount}>{expected || "$ —"}</div>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={styles.infoRow}><strong>Fotos</strong><div style={styles.muted}>{photosLabel}</div></div>
              <div style={styles.infoRow}><strong>Colección</strong><div style={styles.muted}>{collectionMode ? "Sí" : "No seleccionada"}</div></div>
              <div style={styles.infoRow}><strong>Excel</strong><div style={styles.muted}>{excel ? "Adjunto" : "No adjunto"}</div></div>
              <div style={styles.infoRow}><strong>Crédito en tienda</strong><div style={styles.muted}>{credit}</div></div>
            </div>

            <div style={{ ...styles.summaryBox, marginTop: 18 }}>
              <div style={styles.muted}>Entrega</div>
              <div style={{ fontWeight: 800, marginTop: 4 }}>CDMX · Puebla · Mérida · Campeche</div>
              <div style={{ ...styles.muted, marginTop: 7 }}>Resto del país: envío coordinado.</div>
            </div>

            <div style={{ ...styles.summaryBox, marginTop: 12 }}>
              <div style={{ fontWeight: 900 }}>Revisión manual</div>
              <div style={{ ...styles.muted, marginTop: 5 }}>La paciencia es requerida. Cada solicitud se revisa antes de contactarte.</div>
            </div>
          </aside>
        </section>
      </div>

      {submitted && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", display: "grid", placeItems: "center", padding: 18, zIndex: 50 }}>
          <div style={{ ...styles.card, maxWidth: 520, padding: 28 }}>
            <div style={styles.pill}>Solicitud recibida</div>
            <h2 style={{ fontSize: 34, margin: "14px 0 8px", fontWeight: 900 }}>LC-2026-0001</h2>
            <p style={{ color: "#5f5b54", lineHeight: 1.6 }}>
              Tu solicitud quedó registrada en modo demostración. En la versión conectada a Supabase se generará un folio real y un agente podrá revisar tus datos.
            </p>
            <button style={{ ...styles.primary, marginTop: 8 }} onClick={() => setSubmitted(false)}>Cerrar</button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .vende-grid-fallback { grid-template-columns: 1fr !important; }
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
