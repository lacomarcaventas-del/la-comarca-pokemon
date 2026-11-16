"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase";

type EventRow = { id: string; event: string; session_id: string; occurred_at: string; payload: Record<string, string | number> };
type Tab = "resumen" | "audiencia" | "comportamiento" | "conversion";
const decodeGeo = (value: string) => { try { return decodeURIComponent(value); } catch { return value; } };
const money = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
const labels: Record<string, string> = { page_view: "Página vista", product_view: "Interacción con producto", search: "Búsqueda", category_view: "Categoría", add_to_cart: "Añadido al carrito", cart_open: "Carrito abierto", checkout_started: "Checkout iniciado", purchase: "Compra confirmada" };
const shortDate = (date: Date) => date.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });

function Ranking({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return <section className="panel" style={{ minWidth: 0 }}><h2>{title}</h2>{rows.length ? <div style={{ display: "grid", gap: 14 }}>{rows.map(([name, value]) => <div key={name} style={{ display: "grid", gap: 6 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 14 }}><span style={{ overflowWrap: "anywhere" }}>{name}</span><b>{value.toLocaleString("es-MX")}</b></div><div style={{ height: 7, borderRadius: 20, background: "var(--muted, #e5e7eb)", overflow: "hidden" }}><div style={{ width: `${(value / max) * 100}%`, height: "100%", background: "#16a34a", borderRadius: 20 }} /></div></div>)}</div> : <p className="muted">{empty}</p>}</section>;
}

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return <div className="panel" style={{ margin: 0, minWidth: 0 }}><div className="muted" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div><div className="price" style={{ fontSize: "clamp(23px,3vw,32px)", margin: "7px 0" }}>{value}</div><div className="muted" style={{ fontSize: 12 }}>{detail}</div></div>;
}

export default function TrafficAnalyticsPage() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<Tab>("resumen");
  const [events, setEvents] = useState<EventRow[]>([]);
  const [productNames, setProductNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [truncated, setTruncated] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) { router.replace("/login"); return; }
      const { data: profile, error: profileError } = await sb.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
      if (profileError) throw profileError;
      if (profile?.role !== "admin") { router.replace("/login"); return; }
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const { data, error: queryError } = await sb.from("analytics_events").select("id,event,session_id,occurred_at,payload").gte("occurred_at", since).order("occurred_at", { ascending: false }).limit(5000);
      if (queryError) throw queryError;
      setEvents((data || []) as EventRow[]); setTruncated((data || []).length === 5000);
      const { data: products, error: productsError } = await sb.from("cards").select("id,name").limit(2000);
      if (productsError) throw productsError;
      const names: Record<string, string> = {}; (products || []).forEach((p: { id: string; name: string }) => { names[p.id] = p.name; }); setProductNames(names);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "No fue posible cargar la analítica web."); }
    finally { setLoading(false); }
  }, [sb, router, days]);

  useEffect(() => { load(); }, [load]);

  const sessions = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const event of events) { const list = map.get(event.session_id) || []; list.push(event); map.set(event.session_id, list); }
    return [...map.entries()].map(([id, rows]) => {
      const ordered = [...rows].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
      const latest = ordered[ordered.length - 1], first = ordered[0];
      return { id, rows: ordered, first, latest, city: decodeGeo(String(latest.payload.city || first.payload.city || "No disponible")), region: String(latest.payload.region || first.payload.region || ""), country: String(latest.payload.country || first.payload.country || "—"), source: String(first.payload.source || "direct"), pages: ordered.filter(x => x.event === "page_view").map(x => String(x.payload.page || "/")) };
    }).sort((a, b) => b.latest.occurred_at.localeCompare(a.latest.occurred_at));
  }, [events]);

  const summary = useMemo(() => {
    const count = (name: string) => events.filter(e => e.event === name).length;
    const purchases = events.filter(e => e.event === "purchase");
    const uniqueSessions = (name: string) => new Set(events.filter(e => e.event === name).map(e => e.session_id)).size;
    return { sessions: sessions.length, views: count("page_view"), productViews: count("product_view"), cartOpens: count("cart_open"), carts: count("add_to_cart"), checkouts: count("checkout_started"), purchases: purchases.length, revenue: purchases.reduce((sum, e) => sum + Number(e.payload.value || 0), 0), productSessions: uniqueSessions("product_view"), cartSessions: uniqueSessions("add_to_cart"), checkoutSessions: uniqueSessions("checkout_started"), purchaseSessions: uniqueSessions("purchase") };
  }, [events, sessions]);

  const aggregate = useCallback((key: string, fallback: string, only = "page_view") => {
    const map = new Map<string, number>();
    for (const e of events.filter(x => x.event === only)) { const raw = String(e.payload[key] || fallback); const value = key === "city" ? decodeGeo(raw) : raw; map.set(value, (map.get(value) || 0) + 1); }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [events]);
  const topPages = aggregate("page", "—"), topCities = aggregate("city", "No disponible"), topCountries = aggregate("country", "No disponible"), sources = aggregate("source", "direct"), devices = aggregate("device", "No disponible"), campaigns = aggregate("campaign", "Sin campaña"), categories = aggregate("category_name", "Sin categoría", "category_view");
  const topProducts = useMemo(() => { const map = new Map<string, number>(); for (const e of events.filter(x => x.event === "product_view" || x.event === "add_to_cart")) { const id = String(e.payload.product_id || ""); if (id) map.set(id, (map.get(id) || 0) + 1); } return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,n])=>[productNames[id] || id.slice(0,8),n] as [string,number]); }, [events, productNames]);

  const daily = useMemo(() => {
    const today = new Date(); const start = new Date(today); start.setDate(today.getDate() - days + 1); start.setHours(0,0,0,0);
    const buckets = Array.from({ length: days }, (_, i) => { const date = new Date(start); date.setDate(start.getDate() + i); return { date, views: 0, sessions: new Set<string>() }; });
    const index = new Map(buckets.map((b, i) => [b.date.toISOString().slice(0,10), i]));
    for (const e of events) if (e.event === "page_view") { const i = index.get(new Date(e.occurred_at).toISOString().slice(0,10)); if (i !== undefined) { buckets[i].views++; buckets[i].sessions.add(e.session_id); } }
    return buckets.map(b => ({ date: b.date, views: b.views, sessions: b.sessions.size }));
  }, [events, days]);

  const maxDaily = Math.max(1, ...daily.map(x => x.views));
  const chartPoints = daily.map((d, i) => ({ x: 12 + (i * 296 / Math.max(1, daily.length - 1)), y: 92 - d.views / maxDaily * 76 }));
  const chartPath = chartPoints.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const chartArea = chartPath + (chartPoints.length ? ` L ${chartPoints[chartPoints.length - 1].x} 96 L 12 96 Z` : "");
  const funnel = [{ label: "Sesiones", value: summary.sessions }, { label: "Vieron producto", value: summary.productSessions }, { label: "Añadieron al carrito", value: summary.cartSessions }, { label: "Iniciaron checkout", value: summary.checkoutSessions }, { label: "Compra atribuida", value: summary.purchaseSessions }];
  const funnelMax = Math.max(1, funnel[0].value);
  const tabs: { id: Tab; label: string }[] = [{ id: "resumen", label: "Resumen" }, { id: "audiencia", label: "Audiencia" }, { id: "comportamiento", label: "Comportamiento" }, { id: "conversion", label: "Conversión" }];

  return <>
    <header className="top"><a href="/admin/metricas">← Métricas</a><b>La Comarca · Inteligencia</b><div className="actions"><select aria-label="Periodo" value={days} onChange={e => setDays(Number(e.target.value))}><option value="7">7 días</option><option value="30">30 días</option><option value="90">90 días</option></select><button className="btn2" onClick={load} disabled={loading}>↻ Actualizar</button></div></header>
    <main className="wrap" style={{ maxWidth: 1440 }}>
      <div className="panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div><div className="muted" style={{ fontSize: 12, letterSpacing: ".08em", textTransform: "uppercase" }}>Centro de inteligencia comercial</div><h1 style={{ margin: "5px 0", fontSize: "clamp(24px,3vw,34px)" }}>¿Qué está pasando en La Comarca?</h1><p className="muted" style={{ margin: 0 }}>Actividad anónima de la tienda online · Últimos {days} días</p></div>
          <div className="muted" style={{ fontSize: 12 }}>{loading ? "Actualizando datos…" : `Actualizado ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`}</div>
        </div>
        {error && <div className="notice" style={{ border: "1px solid #dc2626", marginTop: 14 }}>⚠️ {error}</div>}
        {truncated && <div className="notice" style={{ marginTop: 14 }}>Se alcanzó el límite de 5,000 eventos. Reduce el periodo para consultar más detalle.</div>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", marginTop: 20, gap: 12 }}>
          <Metric label="Sesiones" value={summary.sessions.toLocaleString("es-MX")} detail="Navegadores registrados" />
          <Metric label="Páginas vistas" value={summary.views.toLocaleString("es-MX")} detail="Vistas registradas" />
          <Metric label="Interés en productos" value={summary.productViews.toLocaleString("es-MX")} detail="Interacciones capturadas" />
          <Metric label="Compras atribuidas" value={summary.purchases.toLocaleString("es-MX")} detail={money(summary.revenue) + " registrados"} />
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 20, borderBottom: "1px solid var(--border, #e5e7eb)", paddingBottom: 8 }}>
          {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} aria-pressed={tab === t.id} style={{ border: 0, borderRadius: 20, padding: "9px 14px", cursor: "pointer", background: tab === t.id ? "#166534" : "transparent", color: tab === t.id ? "white" : "inherit", fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</button>)}
        </div>
      </div>

      {tab === "resumen" && <>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          <section className="panel"><h2>Actividad del sitio</h2><p className="muted">Páginas vistas por día</p>{daily.some(d => d.views > 0) ? <><svg viewBox="0 0 320 112" role="img" aria-label="Gráfica de páginas vistas por día" style={{ width: "100%", height: 180, overflow: "visible" }}><path d={chartArea} fill="#16a34a" opacity=".12"/><path d={chartPath} fill="none" stroke="#16a34a" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>{chartPoints.filter((_,i)=>i===0 || i===chartPoints.length-1 || i%Math.max(1,Math.floor(days/7))===0).map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill="#16a34a"/>)}<line x1="8" y1="96" x2="312" y2="96" stroke="currentColor" opacity=".18"/></svg><div className="muted" style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>{shortDate(daily[0].date)}</span><span>{shortDate(daily[daily.length-1].date)}</span></div></> : <p className="muted">Todavía no hay páginas vistas en este periodo.</p>}</section>
          <Ranking title="Páginas más visitadas" rows={topPages} empty="Aún no hay páginas registradas." />
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, marginTop: 16 }}>
          <Ranking title="Ciudades de origen" rows={topCities} empty="Ubicación no disponible todavía." />
          <Ranking title="Fuentes de tráfico" rows={sources} empty="Aún no hay fuentes registradas." />
          <Ranking title="Dispositivos" rows={devices} empty="Sin datos de dispositivos." />
        </div>
      </>}

      {tab === "audiencia" && <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Ranking title="Ciudades aproximadas" rows={topCities} empty="La ubicación se muestra cuando está disponible." />
        <Ranking title="Países" rows={topCountries} empty="Sin datos geográficos todavía." />
        <Ranking title="Dispositivos" rows={devices} empty="Sin datos de dispositivos todavía." />
        <Ranking title="Canales de entrada" rows={sources} empty="Sin fuentes identificadas." />
        <Ranking title="Campañas" rows={campaigns} empty="No se han identificado campañas etiquetadas." />
      </div>}

      {tab === "comportamiento" && <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        <Ranking title="Páginas más consultadas" rows={topPages} empty="Aún no hay datos." />
        <Ranking title="Productos con interacción" rows={topProducts} empty="Aún no hay interacciones con productos." />
        <Ranking title="Categorías consultadas" rows={categories} empty="Aún no hay interacciones por categoría." />
        <section className="panel"><h2>Acciones en la tienda</h2>{[["Búsquedas", events.filter(e=>e.event==="search").length],["Carritos abiertos",summary.cartOpens],["Añadidos al carrito",summary.carts],["Checkouts iniciados",summary.checkouts]].map(([name,n])=><div className="row" key={String(name)}><span>{name}</span><b>{Number(n).toLocaleString("es-MX")}</b></div>)}</section>
      </div>}

      {tab === "conversion" && <>
        <section className="panel"><h2>Embudo de compra</h2><p className="muted">Sesiones que registraron cada paso. Una misma sesión puede realizar varias acciones.</p><div style={{ display: "grid", gap: 18, maxWidth: 760, marginTop: 20 }}>{funnel.map((step, i) => <div key={step.label} style={{ display: "grid", gap: 7 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><b>{i+1}. {step.label}</b><span>{step.value.toLocaleString("es-MX")} <span className="muted">· {summary.sessions ? ((step.value / summary.sessions) * 100).toFixed(1) : "0.0"}%</span></span></div><div style={{ height: 15, background: "var(--muted, #e5e7eb)", borderRadius: 20, overflow: "hidden" }}><div style={{ width: `${(step.value / funnelMax) * 100}%`, height: "100%", background: "#16a34a", borderRadius: 20, minWidth: step.value ? 3 : 0 }} /></div></div>)}</div><p className="muted" style={{ marginTop: 20, fontSize: 12 }}>La compra solo se atribuye cuando el pago confirmado regresa a la página de resultado y se registra en esa sesión. El embudo refleja los eventos disponibles, no necesariamente todas las compras reales.</p></section>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><Metric label="Carritos abiertos" value={summary.cartOpens} detail="Aperturas registradas" /><Metric label="Añadidos" value={summary.carts} detail="Eventos de carrito" /><Metric label="Checkouts" value={summary.checkouts} detail="Inicios registrados" /><Metric label="Ventas atribuidas" value={money(summary.revenue)} detail={`${summary.purchases} compras confirmadas`} /></div>
      </>}

      <section className="panel" style={{ marginTop: 16 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><div><h2 style={{ marginBottom: 4 }}>Actividad reciente</h2><p className="muted" style={{ margin: 0 }}>Sesiones anónimas del periodo · No identifica personas</p></div><span className="muted" style={{ fontSize: 12 }}>{sessions.length} sesiones</span></div>
        {loading ? <div className="empty">Cargando actividad…</div> : sessions.length ? <div style={{ overflowX: "auto", marginTop: 12 }}><table className="table"><thead><tr><th>Sesión</th><th>Ubicación</th><th>Origen</th><th>Páginas</th><th>Acciones</th><th>Última actividad</th></tr></thead><tbody>{sessions.slice(0, 30).map(s => <tr key={s.id}><td><code>{s.id.slice(0, 8)}</code></td><td>{s.city}{s.region ? ", " + s.region : ""} · {s.country}</td><td>{s.source}</td><td>{s.pages.length ? s.pages.join(" → ") : "—"}</td><td>{s.rows.map(x => labels[x.event] || x.event).join(" · ")}</td><td>{new Date(s.latest.occurred_at).toLocaleString("es-MX")}</td></tr>)}</tbody></table></div> : <div className="empty">Todavía no hay sesiones registradas. Navega por la tienda para generar eventos.</div>}
      </section>
      <p className="muted" style={{ fontSize: 12, textAlign: "center", margin: "18px 0" }}>Datos anónimos. No se almacenan direcciones IP, nombres, correos ni términos de búsqueda. Las sesiones representan navegadores, no personas únicas.</p>
    </main>
  </>;
}
