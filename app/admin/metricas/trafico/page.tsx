"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../../lib/supabase";

type EventRow = { id: string; event: string; session_id: string; occurred_at: string; payload: Record<string, string | number> };
const decodeGeo = (value: string) => { try { return decodeURIComponent(value); } catch { return value; } };
const money = (n: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
const labels: Record<string, string> = { page_view: "Página vista", product_view: "Interacción con producto", search: "Búsqueda", category_view: "Categoría", add_to_cart: "Añadido al carrito", cart_open: "Carrito abierto", checkout_started: "Checkout iniciado", purchase: "Compra confirmada" };

export default function TrafficAnalyticsPage() {
  const sb = useMemo(() => supabaseBrowser(), []);
  const router = useRouter();
  const [days, setDays] = useState(30);
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
      const names: Record<string, string> = {}; (products || []).forEach((p: any) => { names[p.id] = p.name; }); setProductNames(names);
    } catch (e: any) { setError(e?.message || "No fue posible cargar la analítica web."); }
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
    return { sessions: sessions.length, views: count("page_view"), productViews: count("product_view"), cartOpens: count("cart_open"), carts: count("add_to_cart"), checkouts: count("checkout_started"), purchases: purchases.length, revenue: purchases.reduce((sum, e) => sum + Number(e.payload.value || 0), 0) };
  }, [events, sessions]);

  const aggregate = (key: string, fallback: string, only = "page_view") => {
    const map = new Map<string, number>();
    for (const e of events.filter(x => x.event === only)) { const raw = String(e.payload[key] || fallback); const value = key === "city" ? decodeGeo(raw) : raw; map.set(value, (map.get(value) || 0) + 1); }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  };
  const topPages = aggregate("page", "—"), topCities = aggregate("city", "No disponible"), topCountries = aggregate("country", "No disponible"), sources = aggregate("source", "direct"), devices = aggregate("device", "No disponible"), campaigns = aggregate("campaign", "Sin campaña"), categories = aggregate("category_name", "Sin categoría", "category_view");
  const topProducts = (() => { const map = new Map<string, number>(); for (const e of events.filter(x => x.event === "product_view" || x.event === "add_to_cart")) { const id = String(e.payload.product_id || ""); if (id) map.set(id, (map.get(id) || 0) + 1); } return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([id,n])=>[productNames[id] || id.slice(0,8),n] as [string,number]); })();

  return <>
    <header className="top"><a href="/admin/metricas">← Métricas</a><b>La Comarca · Tráfico web</b><div className="actions"><select value={days} onChange={e => setDays(Number(e.target.value))}><option value="7">7 días</option><option value="30">30 días</option><option value="90">90 días</option></select><button className="btn2" onClick={load} disabled={loading}>↻ Actualizar</button></div></header>
    <main className="wrap">
      <div className="panel"><h2>Inteligencia de visitantes</h2><p className="muted">Recorrido anónimo por sesión. No se guardan direcciones IP, nombres, correos ni términos de búsqueda.</p>
        {error && <div className="notice" style={{ border: "1px solid #dc2626" }}>⚠️ {error}</div>}
        {truncated && <div className="notice">Se muestran los 5,000 eventos más recientes del periodo. Reduce el rango para ver más detalle.</div>}
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
          {[[ "Sesiones", summary.sessions ],[ "Páginas vistas", summary.views ],[ "Productos interactuados", summary.productViews ],[ "Carritos abiertos", summary.cartOpens ],[ "Añadidos al carrito", summary.carts ],[ "Checkouts", summary.checkouts ],[ "Compras", summary.purchases ],[ "Ventas atribuidas", money(summary.revenue) ]].map(([name, value]) => <div className="panel" key={String(name)}><div className="muted">{name}</div><div className="price">{value}</div></div>)}
        </div>
        <p className="muted">Conversión observada: {summary.sessions ? ((summary.purchases / summary.sessions) * 100).toFixed(1) : "0.0"}% de sesiones con compra registrada. Solo cuenta compras confirmadas que regresan a la página de resultado en la misma sesión del navegador.</p>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
        <section className="panel"><h2>Páginas más visitadas</h2>{topPages.length ? topPages.map(([name, n]) => <div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Aún no hay datos nuevos.</p>}</section>
        <section className="panel"><h2>Ciudades aproximadas</h2>{topCities.length ? topCities.map(([name, n]) => <div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">La ubicación estará disponible cuando Vercel entregue los encabezados geográficos.</p>}</section>
        <section className="panel"><h2>Fuentes de tráfico</h2>{sources.length ? sources.map(([name, n]) => <div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Aún no hay datos nuevos.</p>}</section>
        <section className="panel"><h2>Países</h2>{topCountries.length ? topCountries.map(([name,n])=><div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Sin datos geográficos todavía.</p>}</section>
        <section className="panel"><h2>Dispositivos</h2>{devices.length ? devices.map(([name,n])=><div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Sin datos de dispositivos todavía.</p>}</section>
        <section className="panel"><h2>Campañas</h2>{campaigns.length ? campaigns.map(([name,n])=><div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Sin campañas etiquetadas todavía.</p>}</section>
        <section className="panel"><h2>Categorías consultadas</h2>{categories.length ? categories.map(([name,n])=><div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Aún no hay interacciones por categoría.</p>}</section>
        <section className="panel"><h2>Productos con interacción</h2>{topProducts.length ? topProducts.map(([name,n])=><div className="row" key={name}><span>{name}</span><b>{n}</b></div>) : <p className="muted">Aún no hay interacciones con productos.</p>}</section>
      </div>
      <section className="panel"><h2>Recorridos anónimos recientes</h2><p className="muted">Cada fila representa una sesión de navegador, no una persona identificada.</p>
        {loading ? <div className="empty">Cargando actividad...</div> : sessions.length ? <div style={{ overflowX: "auto" }}><table className="table"><thead><tr><th>Sesión</th><th>Ubicación aproximada</th><th>Origen</th><th>Recorrido</th><th>Actividad</th><th>Última actividad</th></tr></thead><tbody>
          {sessions.slice(0, 100).map(s => <tr key={s.id}><td><code>{s.id.slice(0, 8)}</code></td><td>{s.city}{s.region ? ", " + s.region : ""} · {s.country}</td><td>{s.source}</td><td>{s.pages.length ? s.pages.join(" → ") : "Interacción sin page_view"}</td><td>{s.rows.map(x => { const productId = String(x.payload.product_id || ""); const category = String(x.payload.category_name || ""); return (labels[x.event] || x.event) + (productId ? ": " + (productNames[productId] || productId.slice(0, 8)) : category ? ": " + category : ""); }).join(" · ")}</td><td>{new Date(s.latest.occurred_at).toLocaleString("es-MX")}</td></tr>)}
        </tbody></table></div> : <div className="empty">Todavía no hay sesiones registradas. Navega por la tienda para generar los primeros eventos.</div>}
      </section>
      <section className="panel"><h2>Eventos capturados</h2><div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))" }}>{Object.entries(labels).map(([key, label]) => <div key={key} className="row"><span>{label}</span><b>{events.filter(e => e.event === key).length}</b></div>)}</div></section>
    </main>
  </>;
}
