"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase";

type Cat = { id: string; name: string };
type Card = {
  id: string;
  name: string;
  price: number;
  stock: number;
  reserved_stock: number;
  published: boolean;
  category_id: string | null;
};
type Item = { card_id: string; quantity: number; unit_price: number; order_id: string };
type Order = { id: string; status: string; created_at: string };
type Audit = {
  id: string;
  card_id: string | null;
  agent_id: string | null;
  action: string;
  created_at: string;
  old_value: any;
  new_value: any;
};

const isPlaceholderProduct = (name: string) =>
  /^producto al azar(?:\s+\d+)?$/i.test((name || "").trim());

// League admission tickets are registrations, not retail inventory or merchandise sales.
const isLeagueTicket = (name: string) =>
  /^entrada a la liga\s*[–-]/i.test((name || "").trim());

// Only confirmed/fulfilled orders represent sales. Pending, contacted and
// cancelled orders must not inflate revenue.
const SALE_STATUSES = new Set(["paid", "preparing", "shipped", "completed"]);

export default function Metrics() {
  const sb = supabaseBrowser();
  const router = useRouter();
  const [cats, setCats] = useState<Cat[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: u, error: authError } = await sb.auth.getUser();
        if (authError) throw authError;
        if (!u.user) {
          router.replace("/login");
          return;
        }
        const { data: p, error: profileError } = await sb
          .from("profiles")
          .select("role")
          .eq("id", u.user.id)
          .maybeSingle();
        if (profileError) throw profileError;
        if (p?.role !== "admin") router.replace("/login");
      } catch (e: any) {
        setError(e?.message || "No fue posible verificar el acceso.");
        setLoading(false);
      }
    })();
  }, [router, sb]);

  async function fetchAll<T>(table: string, select: string, filter?: (q: any) => any) {
    let all: T[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      let q: any = sb.from(table).select(select).range(from, from + pageSize - 1);
      if (filter) q = filter(q);
      const { data, error } = await q;
      if (error) throw error;
      const batch = (data || []) as T[];
      all = all.concat(batch);
      if (batch.length < pageSize) break;
      from += pageSize;
    }
    return all;
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const since = new Date(Date.now() - days * 86400000).toISOString();
      const [c, ca, oi, o, a, pr] = await Promise.all([
        sb.from("categories").select("id,name").order("name"),
        fetchAll<Card>(
          "cards",
          "id,name,price,stock,reserved_stock,published,category_id"
        ),
        fetchAll<Item>("order_items", "card_id,quantity,unit_price,order_id"),
        fetchAll<Order>("orders", "id,status,created_at", (q) => q.gte("created_at", since)),
        sb
          .from("inventory_audit_log")
          .select("id,card_id,agent_id,action,created_at,old_value,new_value")
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(100),
        sb.from("profiles").select("id,email"),
      ]);

      const queryError = [c.error, a.error, pr.error].find(Boolean);
      if (queryError) throw queryError;

      setCats(c.data || []);
      setCards(ca);
      setItems(oi);
      setOrders(o);
      setAudits(a.data || []);

      const map: Record<string, string> = {};
      (pr.data || []).forEach((x: any) => {
        if (x?.id) map[x.id] = x.email || x.id;
      });
      setNames(map);
    } catch (e: any) {
      setError(e?.message || "No fue posible cargar las métricas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data: u } = await sb.auth.getUser();
        if (!u.user || !active) return;
        const { data: p } = await sb
          .from("profiles")
          .select("role")
          .eq("id", u.user.id)
          .maybeSingle();
        if (p?.role !== "admin" || !active) return;
        await load();
      } catch (e: any) {
        if (active) {
          setError(e?.message || "No fue posible cargar las métricas.");
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [days]);

  const validOrders = useMemo(
    () => new Set(orders.filter((o) => SALE_STATUSES.has(o.status)).map((o) => o.id)),
    [orders]
  );

  const rows = useMemo(() => {
    // Demo placeholders are excluded from reporting, but never deleted or
    // modified in the database. Inventory uses currently published products.
    const reportCards = cards.filter((card) => !isPlaceholderProduct(card.name) && !isLeagueTicket(card.name));
    const activeCards = reportCards.filter((card) => card.published);

    return cats.map((cat) => {
      const inventoryCards = activeCards.filter((card) => card.category_id === cat.id);
      const salesCardIds = new Set(
        reportCards.filter((card) => card.category_id === cat.id).map((card) => card.id)
      );
      const sold = items.filter(
        (item) => salesCardIds.has(item.card_id) && validOrders.has(item.order_id)
      );
      const units = sold.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const sales = sold.reduce(
        (sum, item) => sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
        0
      );

      return {
        cat,
        products: inventoryCards.length,
        stock: inventoryCards.reduce((sum, card) => sum + Number(card.stock || 0), 0),
        inventory: inventoryCards.reduce(
          (sum, card) => sum + Number(card.price || 0) * Number(card.stock || 0),
          0
        ),
        units,
        sales,
        ticket: units ? sales / units : 0,
      };
    });
  }, [cats, cards, items, validOrders]);

  const totals = rows.reduce(
    (acc, row) => ({
      products: acc.products + row.products,
      stock: acc.stock + row.stock,
      inventory: acc.inventory + row.inventory,
      units: acc.units + row.units,
      sales: acc.sales + row.sales,
    }),
    { products: 0, stock: 0, inventory: 0, units: 0, sales: 0 }
  );
  const cardNames = Object.fromEntries(cards.map((card) => [card.id, card.name]));

  return (
    <>
      <header className="top">
        <a href="/admin">← Administración</a>
        <b>La Comarca · Métricas</b>
        <div className="actions">
          <button className="btn2" onClick={load} disabled={loading}>↻ Actualizar</button>
          <a href="/admin/metricas/trafico">🌐 Tráfico web</a>
          <a href="/admin/orders">Pedidos</a>
        </div>
      </header>
      <main className="wrap">
        <div className="panel">
          <div className="row">
            <div>
              <h2>Ventas por categoría</h2>
              <p className="muted">Inventario activo y ventas confirmadas del periodo seleccionado.</p>
            </div>
            <div>
              <label>Periodo</label>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value="7">7 días</option>
                <option value="30">30 días</option>
                <option value="90">90 días</option>
                <option value="365">365 días</option>
              </select>
            </div>
          </div>
          {error && <div className="notice" style={{ border: "1px solid #dc2626" }}>⚠️ Error al cargar: {error}</div>}
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))" }}>
            {[
              ["Productos", totals.products],
              ["Unidades en stock", totals.stock],
              ["Valor inventario", `$${totals.inventory.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`],
              ["Unidades vendidas", totals.units],
              ["Ventas", `$${totals.sales.toLocaleString("es-MX", { maximumFractionDigits: 0 })}`],
            ].map((entry) => (
              <div className="panel" key={String(entry[0])}>
                <div className="muted">{entry[0]}</div>
                <div className="price">{entry[1]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Desempeño por categoría</h2>
          {loading ? (
            <div className="empty">Cargando métricas...</div>
          ) : (
            <div style={{ overflow: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Categoría</th><th>Productos</th><th>Stock</th><th>Inventario</th>
                    <th>Unidades vendidas</th><th>Ventas</th><th>Precio medio</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.cat.id}>
                      <td><b>{row.cat.name}</b></td>
                      <td>{row.products}</td>
                      <td>{row.stock}</td>
                      <td>${row.inventory.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</td>
                      <td>{row.units}</td>
                      <td>${row.sales.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</td>
                      <td>${row.ticket.toLocaleString("es-MX", { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <h2>Actividad de agentes</h2>
          <p className="muted">Últimos movimientos de inventario del periodo seleccionado.</p>
          {audits.length === 0 ? (
            <div className="empty">Sin movimientos registrados en este periodo.</div>
          ) : (
            <div style={{ overflow: "auto" }}>
              <table className="table">
                <thead>
                  <tr><th>Fecha</th><th>Agente</th><th>Acción</th><th>Producto</th><th>Cambio</th></tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr key={audit.id}>
                      <td>{new Date(audit.created_at).toLocaleString("es-MX")}</td>
                      <td>{audit.agent_id ? (names[audit.agent_id] || audit.agent_id.slice(0, 8)) : "Sistema"}</td>
                      <td>{audit.action}</td>
                      <td>{audit.card_id ? (cardNames[audit.card_id] || audit.card_id.slice(0, 8)) : "—"}</td>
                      <td className="muted">{audit.new_value ? JSON.stringify(audit.new_value) : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
