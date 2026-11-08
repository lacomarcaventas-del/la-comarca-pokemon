"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase";

type Option = { id: string; name: string; code?: string | null };
type Photo = { file: File; preview: string; optimized?: Blob; originalSize: number; optimizedSize?: number };

const initial = {
  name: "", category_id: "", set_id: "", card_number: "", rarity: "",
  language: "English", condition: "Near Mint", price: "", stock: "1",
};

export default function CapturaProductosPage() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const scannerRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [categories, setCategories] = useState<Option[]>([]);
  const [sets, setSets] = useState<Option[]>([]);
  const [allowed, setAllowed] = useState<Record<string, any>>({});
  const [form, setForm] = useState(initial);
  const [sku, setSku] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activePhoto, setActivePhoto] = useState(0);
  const [queue, setQueue] = useState<Array<{ sku: string; name: string; state: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) { router.replace("/login"); return; }
      const { data: profile } = await sb.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
      if (!profile || !["admin", "agent"].includes(profile.role)) { router.replace("/login"); return; }
      const [{ data: cats, error: catError }, { data: setRows }] = await Promise.all([
        sb.from("categories").select("id,name").order("name"),
        sb.from("sets").select("id,name,code").order("name"),
      ]);
      if (!alive) return;
      if (catError) { setError("No fue posible cargar las categorías: " + catError.message); return; }
      setRole(profile.role);
      setUserId(auth.user.id);
      setSets(setRows || []);
      if (profile.role === "admin") {
        setCategories(cats || []);
      } else {
        const { data: permissions, error: permError } = await sb.from("agent_category_permissions")
          .select("category_id,can_view,can_create,can_publish,can_change_price,can_change_stock")
          .eq("agent_id", auth.user.id);
        if (permError) { setError("No fue posible consultar tus permisos: " + permError.message); return; }
        const map: Record<string, any> = {};
        (permissions || []).forEach((p: any) => { map[p.category_id] = p; });
        setAllowed(map);
        setCategories((cats || []).filter((c: Option) => map[c.id]?.can_view && map[c.id]?.can_create));
      }
    })();
    return () => { alive = false; };
  }, []);

  const selectedPermission = allowed[form.category_id];
  const canPublish = role === "admin" || Boolean(selectedPermission?.can_publish);
  const canEditPrice = role === "admin" || Boolean(selectedPermission?.can_change_price);
  const canEditStock = role === "admin" || Boolean(selectedPermission?.can_change_stock);
  const originalBytes = photos.reduce((sum, p) => sum + p.originalSize, 0);
  const optimizedBytes = photos.reduce((sum, p) => sum + (p.optimizedSize || p.originalSize), 0);
  const savings = originalBytes ? Math.max(0, Math.round((1 - optimizedBytes / originalBytes) * 100)) : 0;

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function addPhotos(files: FileList | File[]) {
    setError(""); setMessage("");
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) { setError("Selecciona archivos de imagen."); return; }
    if (photos.length + incoming.length > 1) { setError("El catálogo actual admite una imagen principal por producto. La galería múltiple requiere ampliar su modelo de datos."); return; }
    const next: Photo[] = [];
    for (const file of incoming) {
      if (file.size > 15 * 1024 * 1024) { setError(file.name + " supera el límite de 15 MB."); continue; }
      const preview = URL.createObjectURL(file);
      next.push({ file, preview, originalSize: file.size });
    }
    setPhotos((old) => [...old, ...next]);
    setActivePhoto(photos.length);
    for (const item of next) {
      try {
        const body = new FormData();
        body.append("file", item.file);
        const { data: sessionData } = await sb.auth.getSession();
        const accessToken = sessionData.session?.access_token;
        if (!accessToken) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión.");
        const response = await fetch("/api/image/optimize", {
          method: "POST", body, headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || "No se pudo optimizar " + item.file.name);
        }
        const blob = await response.blob();
        setPhotos((old) => old.map((p) => p.preview === item.preview
          ? { ...p, optimized: blob, optimizedSize: blob.size } : p));
      } catch (e: any) {
        setError((old) => [old, e.message || "Error de optimización"].filter(Boolean).join(" · "));
      }
    }
  }

  function removePhoto(index: number) {
    setPhotos((old) => {
      const target = old[index];
      if (target) URL.revokeObjectURL(target.preview);
      return old.filter((_, i) => i !== index);
    });
    setActivePhoto(0);
  }

  async function saveProduct() {
    setError(""); setMessage("");
    if (!form.name.trim() || !form.category_id || !form.price || !form.stock) {
      setError("Completa nombre, categoría, precio y existencia."); return;
    }
    if (Number(form.price) < 0 || Number(form.stock) < 0 || !Number.isFinite(Number(form.price)) || !Number.isInteger(Number(form.stock))) {
      setError("Revisa el precio y la existencia."); return;
    }
    if (role === "agent" && !allowed[form.category_id]?.can_create) {
      setError("No tienes permiso para crear productos en esta categoría."); return;
    }
    if (role === "agent" && !canEditPrice) { setError("No tienes permiso para asignar precios en esta categoría."); return; }
    if (role === "agent" && !canEditStock) { setError("No tienes permiso para asignar existencias en esta categoría."); return; }
    setBusy(true);
    try {
      let imageUrl: string | null = null;
      const uploadedPaths: string[] = [];
      if (photos.length) {
        const first = photos[0];
        if (!first.optimized) throw new Error("Espera a que termine la optimización de las fotografías.");
        const path = `capture/${userId}/${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await sb.storage.from("card-images").upload(path, first.optimized, {
          contentType: "image/webp", upsert: false,
        });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);
        imageUrl = sb.storage.from("card-images").getPublicUrl(path).data.publicUrl;
      }
      const payload = {
        name: form.name.trim(), category_id: form.category_id, set_id: form.set_id || null,
        card_number: form.card_number.trim() || null, rarity: form.rarity.trim() || null,
        language: form.language, condition: form.condition, price: Number(form.price),
        stock: Number(form.stock), published: role === "admin" && published && canPublish,
        image_url: imageUrl,
        ...(role === "admin" ? { created_by: userId, updated_by: userId } : {}),
      };
      const { error: insertError } = await sb.from("cards").insert(payload);
      if (insertError) {
        if (uploadedPaths.length) await sb.storage.from("card-images").remove(uploadedPaths);
        throw insertError;
      }
      setQueue((old) => [{ sku: sku.trim() || "Sin código", name: form.name.trim(), state: role === "admin" && published ? "Publicado" : "Registrado" }, ...old]);
      setMessage(role === "agent" ? "Producto registrado. Quedó sin publicar para revisión administrativa." : (published ? "Producto publicado correctamente." : "Producto guardado como no publicado."));
      photos.forEach((p) => URL.revokeObjectURL(p.preview));
      setPhotos([]); setActivePhoto(0); setForm(initial); setSku(""); setPublished(false);
      scannerRef.current?.focus();
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar el producto.");
    } finally { setBusy(false); }
  }

  function nextItem() {
    setForm(initial); setSku(""); setPhotos([]); setActivePhoto(0); setPublished(false);
    setError(""); setMessage(""); scannerRef.current?.focus();
  }

  return (
    <main className="wrap" style={{ maxWidth: 1500, paddingTop: 22, paddingBottom: 50 }}>
      <header className="top" style={{ position: "relative", top: "auto", margin: "-22px -24px 22px", flexWrap: "wrap" }}>
        <a href="/admin">← Administración</a>
        <b>La Comarca · Estación de Captura</b>
        <span className="adminAccess">{role === "agent" ? "Modo agente" : "Modo administrador"}</span>
        <a href="/admin/inventario" className="btn2">Carga masiva (sistema anterior)</a>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(230px, .72fr) minmax(280px, 1.15fr) minmax(320px, 1.25fr)", gap: 16, alignItems: "start" }}>
        <section className="panel">
          <h2>Flujo de captura</h2>
          <div className="notice" style={{ marginBottom: 14 }}>1. Escanear código · 2. Fotografiar · 3. Clasificar · 4. Guardar y continuar</div>
          <label>Escáner / SKU / código de barras</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input ref={scannerRef} autoFocus value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Escanea aquí..." onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
            <button type="button" className="btn2" onClick={() => scannerRef.current?.focus()} title="Enfocar escáner">⌗</button>
          </div>
          <p className="muted">Los escáneres USB que escriben como teclado pueden utilizar este campo directamente.</p>
          <h3 style={{ marginTop: 24 }}>Sesión de captura ({queue.length})</h3>
          {queue.length === 0 ? <p className="muted">Los productos guardados durante esta sesión aparecerán aquí.</p> : queue.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #3b2b1d", padding: "9px 0" }}>
              <b style={{ display: "block", fontSize: 13 }}>{item.name}</b>
              <span className="muted">{item.sku} · {item.state}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <h2>Fotografías del producto</h2>
          <label className="notice" style={{ display: "block", cursor: "pointer", textAlign: "center", padding: 22 }}>
            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files) addPhotos(e.target.files); e.currentTarget.value = ""; }} style={{ display: "none" }} />
            <span style={{ fontSize: 28 }}>＋</span><br />Agregar fotografías
            <small style={{ display: "block", marginTop: 6 }}>Una imagen principal · Máximo 15 MB</small>
          </label>
          <div style={{ background: "#080d13", border: "1px solid #463727", borderRadius: 12, minHeight: 260, display: "grid", placeItems: "center", overflow: "hidden", marginTop: 12 }}>
            {photos[activePhoto] ? <img src={photos[activePhoto].preview} alt="Vista previa" style={{ width: "100%", height: 280, objectFit: "contain" }} /> : <div className="muted">Sin fotografía. Escanea y toma la foto del producto.</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
            {photos.map((p, i) => <div key={p.preview} style={{ position: "relative" }}>
              <button type="button" onClick={() => setActivePhoto(i)} style={{ padding: 3, border: activePhoto === i ? "2px solid #e87928" : "1px solid #463727" }}>
                <img src={p.preview} alt="" style={{ width: 58, height: 66, objectFit: "contain", display: "block" }} />
              </button>
              <button type="button" onClick={() => removePhoto(i)} aria-label="Quitar fotografía" style={{ position: "absolute", right: -5, top: -7, padding: "1px 6px", background: "#8c2424" }}>×</button>
            </div>)}
          </div>
          <div className="notice" style={{ marginTop: 14 }}>
            <b>Optimización automática</b>
            <div className="muted" style={{ marginTop: 5 }}>{photos.length ? `${photos.filter(p => p.optimized).length}/${photos.length} imágenes convertidas a WebP` : "Al agregar imágenes se convertirán a WebP."}</div>
            {photos.length > 0 && <div className="muted">Original: {(originalBytes / 1024 / 1024).toFixed(2)} MB · Optimizado: {(optimizedBytes / 1024 / 1024).toFixed(2)} MB · Reducción: {savings}%</div>}
          </div>
        </section>

        <section className="panel">
          <h2>Información del producto</h2>
          <label>Nombre *</label><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nombre comercial o de la carta" />
          <div className="row">
            <div><label>Categoría *</label><select value={form.category_id} onChange={(e) => update("category_id", e.target.value)}><option value="">Seleccionar</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label>Set / expansión</label><select value={form.set_id} onChange={(e) => update("set_id", e.target.value)}><option value="">Sin set</option>{sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div className="row">
            <div><label>Número</label><input value={form.card_number} onChange={(e) => update("card_number", e.target.value)} /></div>
            <div><label>Rareza</label><input value={form.rarity} onChange={(e) => update("rarity", e.target.value)} /></div>
          </div>
          <div className="row">
            <div><label>Idioma</label><select value={form.language} onChange={(e) => update("language", e.target.value)}><option>English</option><option>Español</option><option>日本語</option><option>Otro</option></select></div>
            <div><label>Condición</label><select value={form.condition} onChange={(e) => update("condition", e.target.value)}><option>Near Mint</option><option>Lightly Played</option><option>Moderately Played</option><option>Heavily Played</option><option>Nuevo / Sellado</option></select></div>
          </div>
          <div className="row">
            <div><label>Precio MXN *</label><input type="number" min="0" step="0.01" disabled={!canEditPrice} value={form.price} onChange={(e) => update("price", e.target.value)} /></div>
            <div><label>Existencia *</label><input type="number" min="0" step="1" disabled={!canEditStock} value={form.stock} onChange={(e) => update("stock", e.target.value)} /></div>
          </div>
          {role === "admin" && <label style={{ display: "flex", alignItems: "center", gap: 9 }}><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ width: "auto" }} /> Publicar inmediatamente</label>}
          {role === "agent" && <p className="muted">Los registros de agentes se guardan sin publicar. Las categorías y acciones disponibles dependen de tus permisos.</p>}
          {error && <p className="notice" style={{ borderColor: "#a33", color: "#ffb4b4" }}>{error}</p>}
          {message && <p className="notice" style={{ borderColor: "#477b42", color: "#b8f0a7" }}>{message}</p>}
          <div className="actions" style={{ marginTop: 18, display: "flex", flexWrap: "wrap" }}>
            <button type="button" className="btn2" onClick={nextItem} disabled={busy}>Limpiar / siguiente</button>
            <button type="button" className="btn" onClick={saveProduct} disabled={busy || (photos.length > 0 && photos.some(p => !p.optimized))}>{busy ? "Guardando..." : "Guardar producto"}</button>
          </div>
        </section>
      </div>
      <style jsx>{`
        @media(max-width:1050px){main > div:nth-of-type(1){grid-template-columns:1fr 1fr!important} main > div:nth-of-type(1) section:last-child{grid-column:1/-1}}
        @media(max-width:680px){main > div:nth-of-type(1){grid-template-columns:1fr!important} main > div:nth-of-type(1) section:last-child{grid-column:auto}}
      `}</style>
    </main>
  );
}
