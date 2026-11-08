"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../../lib/supabase";

type Option = { id: string; name: string; code?: string | null };
type Photo = { file: File; preview: string; optimized?: Blob; originalSize: number; optimizedSize?: number };
const initial = {
  name: "", category_id: "", set_id: "", card_number: "", rarity: "",
  language: "English", condition: "Near Mint", price: "", stock: "1",
};

function isCardCategory(name: string) {
  // Match the existing TCG/game-line categories; hobby, modelism and accessory
  // categories retain the general product form.
  return /pokemon|pokémon|magic|mtg|yu.?gi.?oh|one\s*piece|lorcana|weiss|gundam|riftbound|heroclix|hololive|digimon|dragon\s*ball|\btcgs?\b|\bcartas?\b/i.test(name);
}

export default function CapturaProductosPage() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const scannerRef = useRef<HTMLInputElement>(null);
  const [role, setRole] = useState("");
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState("");
  const [categories, setCategories] = useState<Option[]>([]);
  const [sets, setSets] = useState<Option[]>([]);
  const [allowed, setAllowed] = useState<Record<string, any>>({});
  const [form, setForm] = useState(initial);
  const [sku, setSku] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [queue, setQueue] = useState<Array<{ sku: string; name: string; state: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      if (!auth.user) { router.replace("/login"); return; }
      const { data: profile } = await sb.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
      if (!profile || !["admin", "agent"].includes(profile.role)) { await sb.auth.signOut(); router.replace("/login"); return; }
      const [{ data: cats, error: catError }, { data: setRows, error: setErrorResult }] = await Promise.all([
        sb.from("categories").select("id,name").order("name"),
        sb.from("sets").select("id,name,code").order("name"),
      ]);
      if (!alive) return;
      if (catError || setErrorResult) { setError("No fue posible cargar la configuración: " + (catError?.message || setErrorResult?.message)); setChecking(false); return; }
      setRole(profile.role);
      setUserId(auth.user.id);
      setSets(setRows || []);
      if (profile.role === "admin") setCategories(cats || []);
      else {
        const { data: permissions, error: permError } = await sb.from("agent_category_permissions")
          .select("category_id,can_view,can_create,can_publish,can_change_price,can_change_stock")
          .eq("agent_id", auth.user.id);
        if (permError) { setError("No fue posible consultar tus permisos: " + permError.message); setChecking(false); return; }
        const map: Record<string, any> = {};
        (permissions || []).forEach((p: any) => { map[p.category_id] = p; });
        setAllowed(map);
        setCategories((cats || []).filter((c: Option) => map[c.id]?.can_view && map[c.id]?.can_create));
      }
      setChecking(false);
      scannerRef.current?.focus();
    })();
    return () => { alive = false; };
  }, []);

  const selectedCategory = categories.find((c) => c.id === form.category_id);
  const cardFields = Boolean(selectedCategory && isCardCategory(selectedCategory.name));
  const selectedPermission = allowed[form.category_id];
  const canPublish = role === "admin" || Boolean(selectedPermission?.can_publish);
  const canEditPrice = role === "admin" || Boolean(selectedPermission?.can_change_price);
  const canEditStock = role === "admin" || Boolean(selectedPermission?.can_change_stock);
  const originalBytes = photos.reduce((sum, p) => sum + p.originalSize, 0);
  const optimizedBytes = photos.reduce((sum, p) => sum + (p.optimizedSize || p.originalSize), 0);
  const savings = originalBytes ? Math.max(0, Math.round((1 - optimizedBytes / originalBytes) * 100)) : 0;
  const photoReady = photos.length === 0 || photos.every((p) => Boolean(p.optimized));

  function update<K extends keyof typeof initial>(key: K, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  function clearPhotos() {
    photos.forEach((p) => URL.revokeObjectURL(p.preview));
    setPhotos([]);
  }

  async function addPhotos(files: FileList | File[]) {
    setError(""); setMessage("");
    const incoming = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!incoming.length) { setError("Selecciona un archivo de imagen válido."); return; }
    if (photoBusy || busy) { setError("Espera a que termine la operación actual."); return; }\n    if (photos.length + incoming.length > 1) { setError("El catálogo actual admite una imagen principal por producto. La galería múltiple requiere ampliar su modelo de datos."); return; }
    const next: Photo[] = [];
    for (const file of incoming) {
      if (file.size > 15 * 1024 * 1024) { setError(file.name + " supera el límite de 15 MB."); continue; }
      next.push({ file, preview: URL.createObjectURL(file), originalSize: file.size });
    }
    if (!next.length) return;
    setPhotos((old) => [...old, ...next]);
    setPhotoBusy(true);
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
        const optimizedPreview = URL.createObjectURL(blob);
        setPhotos((old) => old.map((p) => {
          if (p.preview !== item.preview) return p;
          URL.revokeObjectURL(p.preview);
          return { ...p, preview: optimizedPreview, optimized: blob, optimizedSize: blob.size };
        }));
      } catch (e: any) {
        setError((old) => [old, e.message || "Error de optimización"].filter(Boolean).join(" · "));
      }
    }
    setPhotoBusy(false);
  }

  function removePhoto() {
    clearPhotos();
  }

  async function saveProduct() {
    setError(""); setMessage("");
    if (!form.name.trim() || !form.category_id ||
        (canEditPrice && form.price === "") || (canEditStock && form.stock === "")) {
      setError("Completa nombre, categoría y los campos de precio/existencia que tienes autorizados.");
      return;
    }
    if ((canEditPrice && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) ||
        (canEditStock && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0))) {
      setError("Revisa el precio y la existencia.");
      return;
    }
    if (!photoReady || photoBusy) { setError("Espera a que termine la optimización de la fotografía."); return; }
    if (role === "agent" && !allowed[form.category_id]?.can_create) {
      setError("No tienes permiso para crear productos en esta categoría.");
      return;
    }

    setBusy(true);
    let uploadedPath: string | null = null;
    let auditId: string | null = null;
    let insertedId: string | null = null;
    try {
      const { data: authData } = await sb.auth.getUser();
      const actor = authData.user;
      if (!actor) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      const { data: audit, error: auditError } = await sb.from("inventory_import_audit").insert({
        actor_id: actor.id,
        actor_role: role,
        file_name: `captura-individual-${new Date().toISOString()}`,
        total_rows: 1,
        created_rows: 0,
        updated_rows: 0,
        rejected_rows: 0,
        status: "started",
        details: {
          actor_email: actor.email || "",
          card_ids: [],
          photo_paths: [],
          errors: [],
          source_file: null,
          approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Captura individual de administrador",
        },
      }).select("id").single();
      if (auditError || !audit?.id) throw auditError || new Error("No fue posible registrar la auditoría de captura.");
      auditId = audit.id;

      let imageUrl: string | null = null;
      if (photos.length) {
        const path = `inventory/${userId}/${auditId}/capture-${crypto.randomUUID()}.webp`;
        const { error: uploadError } = await sb.storage.from("card-images").upload(path, photos[0].optimized!, {
          contentType: "image/webp",
          upsert: false,
        });
        if (uploadError) throw uploadError;
        uploadedPath = path;
        imageUrl = sb.storage.from("card-images").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        name: form.name.trim(),
        category_id: form.category_id,
        set_id: cardFields ? (form.set_id || null) : null,
        card_number: cardFields ? (form.card_number.trim() || sku.trim() || null) : (sku.trim() || null),
        rarity: cardFields ? (form.rarity.trim() || null) : null,
        language: cardFields ? form.language : "N/A",
        condition: cardFields ? form.condition : "N/A",
        price: canEditPrice ? Number(form.price) : 0,
        stock: canEditStock ? Number(form.stock) : 0,
        published: role === "admin" && published && canPublish,
        image_url: imageUrl,
        created_by: userId,
        updated_by: userId,
      };
      const { data: inserted, error: insertError } = await sb.from("cards").insert(payload).select("id").single();
      if (insertError || !inserted?.id) throw insertError || new Error("No se confirmó el registro del producto.");
      insertedId = inserted.id;

      const { error: auditUpdateError } = await sb.from("inventory_import_audit").update({
        created_rows: 1,
        status: role === "agent" ? "pending" : "completed",
        details: {
          actor_email: actor.email || "",
          card_ids: [inserted.id],
          photo_paths: uploadedPath ? [uploadedPath] : [],
          errors: [],
          source_file: null,
          approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Captura individual completada",
        },
      }).eq("id", auditId);

      setQueue((old) => [{
        sku: sku.trim() || "Sin código",
        name: form.name.trim(),
        state: role === "agent" ? "Pendiente de revisión" : (published ? "Publicado" : "Registrado"),
      }, ...old]);
      setMessage(role === "agent"
        ? "Producto registrado y pendiente de aprobación administrativa."
        : (published ? "Producto publicado correctamente." : "Producto guardado como no publicado."));
      if (auditUpdateError) {
        setError("El producto se guardó, pero la auditoría no pudo actualizarse: " + auditUpdateError.message);
      }
      clearPhotos();
      setForm(initial);
      setSku("");
      setPublished(false);
      scannerRef.current?.focus();
    } catch (e: any) {
      if (insertedId) await sb.from("cards").delete().eq("id", insertedId);
      if (uploadedPath) await sb.storage.from("card-images").remove([uploadedPath]);
      if (auditId) {
        await sb.from("inventory_import_audit").update({
          status: "failed",
          rejected_rows: 1,
          details: { card_ids: [], photo_paths: [], errors: [{ error: e?.message || "Error de captura" }], source_file: null },
        }).eq("id", auditId);
      }
      setError(e?.message || "No se pudo guardar el producto.");
    } finally {
      setBusy(false);
    }
  }

  function nextItem() {
    clearPhotos(); setForm(initial); setSku(""); setPublished(false);
    setError(""); setMessage(""); scannerRef.current?.focus();
  }

  return (
    <main className="wrap" style={{ maxWidth: 1500, paddingTop: 22, paddingBottom: 50 }}>\n      {checking && <div className="panel">Verificando acceso y permisos…</div>}
      <header className="top" style={{ position: "relative", top: "auto", margin: "-22px -24px 22px", flexWrap: "wrap" }}>
        <a href="/admin">← Administración</a><b>La Comarca · Estación de Captura</b>
        <span className="adminAccess">{role === "agent" ? "Modo agente" : "Modo administrador"}</span>
        <a href="/admin/inventario" className="btn2">Carga masiva (sistema anterior)</a>
      </header>
      {!checking && <div style={{ display: "grid", gridTemplateColumns: "minmax(230px,.72fr) minmax(280px,1.15fr) minmax(320px,1.25fr)", gap: 16, alignItems: "start" }}>
        <section className="panel">
          <h2>Flujo de captura</h2>
          <div className="notice" style={{ marginBottom: 14 }}>1. Escanear código · 2. Fotografiar · 3. Clasificar · 4. Guardar y continuar</div>
          <label>Escáner / SKU / código de barras</label>
          <div style={{ display: "flex", gap: 6 }}>
            <input ref={scannerRef} autoFocus value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Escanea aquí..." onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
            <button type="button" className="btn2" onClick={() => scannerRef.current?.focus()} title="Enfocar escáner">⌗</button>
          </div>
          <p className="muted">Los escáneres USB que escriben como teclado pueden utilizar este campo. El código se conserva en el campo de número/código disponible; el catálogo aún no tiene una columna SKU independiente.</p>
          <h3 style={{ marginTop: 24 }}>Sesión de captura ({queue.length})</h3>
          {queue.length === 0 ? <p className="muted">Los productos guardados durante esta sesión aparecerán aquí.</p> : queue.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #3b2b1d", padding: "9px 0" }}>
              <b style={{ display: "block", fontSize: 13 }}>{item.name}</b><span className="muted">{item.sku} · {item.state}</span>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Fotografía del producto</h2>
          <label className="notice" style={{ display: "block", cursor: "pointer", textAlign: "center", padding: 22 }}>
            <input type="file" disabled={photoBusy || busy} accept="image/jpeg,image/png,image/webp,image/tiff,image/avif,image/heic" capture="environment"
              onChange={(e) => { if (e.target.files) addPhotos(e.target.files); e.currentTarget.value = ""; }} style={{ display: "none" }} />
            <span style={{ fontSize: 28 }}>＋</span><br />Tomar o agregar fotografía
            <small style={{ display: "block", marginTop: 6 }}>Una imagen principal · Máximo 15 MB · Salida WebP</small>
          </label>
          <div style={{ background: "#080d13", border: "1px solid #463727", borderRadius: 12, minHeight: 260, display: "grid", placeItems: "center", overflow: "hidden", marginTop: 12 }}>
            {photos[0] ? <img src={photos[0].preview} alt="Vista previa" style={{ width: "100%", height: 280, objectFit: "contain" }} /> : <div className="muted">Sin fotografía. Puedes usar la cámara del dispositivo.</div>}
          </div>
          {photos.length > 0 && <button type="button" className="btn2" onClick={removePhoto} disabled={photoBusy || busy} style={{ marginTop: 8 }}>Quitar fotografía</button>}
          <div className="notice" style={{ marginTop: 14 }}>
            <b>Optimización automática</b>
            <div className="muted" style={{ marginTop: 5 }}>{photoBusy ? "Procesando imagen…" : photos.length ? "Imagen convertida a WebP" : "Al agregar la imagen se convertirá a WebP."}</div>
            {photos.length > 0 && <div className="muted">Original: {(originalBytes / 1024 / 1024).toFixed(2)} MB · Optimizado: {(optimizedBytes / 1024 / 1024).toFixed(2)} MB · Reducción: {savings}%</div>}
          </div>
        </section>
        <section className="panel">
          <h2>Información del producto</h2>
          <label>Nombre *</label><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nombre comercial o de la carta" />
          <div className="row">
            <div><label>Categoría *</label><select value={form.category_id} onChange={(e) => { update("category_id", e.target.value); update("set_id", ""); }}><option value="">Seleccionar</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            {cardFields && <div><label>Set / expansión</label><select value={form.set_id} onChange={(e) => update("set_id", e.target.value)}><option value="">Sin set</option>{sets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
          </div>
          {cardFields && <>
            <div className="row">
              <div><label>Número de carta</label><input value={form.card_number} onChange={(e) => update("card_number", e.target.value)} /></div>
              <div><label>Rareza</label><input value={form.rarity} onChange={(e) => update("rarity", e.target.value)} /></div>
            </div>
            <div className="row">
              <div><label>Idioma</label><select value={form.language} onChange={(e) => update("language", e.target.value)}><option>English</option><option>Español</option><option>日本語</option><option>Otro</option></select></div>
              <div><label>Condición</label><select value={form.condition} onChange={(e) => update("condition", e.target.value)}><option>Near Mint</option><option>Lightly Played</option><option>Moderately Played</option><option>Heavily Played</option><option>Nuevo / Sellado</option></select></div>
            </div>
          </>}
          <div className="row">
            <div><label>Precio MXN {canEditPrice ? "*" : "(sin permiso de edición)"}</label><input type="number" min="0" step="0.01" disabled={!canEditPrice} value={canEditPrice ? form.price : "0"} onChange={(e) => update("price", e.target.value)} />{!canEditPrice && <small className="muted">Se registra temporalmente en $0 para revisión administrativa.</small>}</div>
            <div><label>Existencia {canEditStock ? "*" : "(sin permiso de edición)"}</label><input type="number" min="0" step="1" disabled={!canEditStock} value={canEditStock ? form.stock : "0"} onChange={(e) => update("stock", e.target.value)} />{!canEditStock && <small className="muted">Se registra temporalmente en 0 para revisión administrativa.</small>}</div>
          </div>
          {form.category_id && <p className="muted">{cardFields ? "Categoría de cartas: se muestran los datos de set, número, rareza, idioma y condición." : "Categoría general: se capturan los datos comunes del producto; no se solicitan campos exclusivos de cartas."}</p>}
          {role === "admin" && <label style={{ display: "flex", alignItems: "center", gap: 9 }}><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ width: "auto" }} /> Publicar inmediatamente</label>}
          {role === "agent" && <p className="muted">Los registros de agentes se guardan sin publicar. Las categorías y acciones disponibles dependen de tus permisos.</p>}
          {error && <p className="notice" style={{ borderColor: "#a33", color: "#ffb4b4" }}>{error}</p>}
          {message && <p className="notice" style={{ borderColor: "#477b42", color: "#b8f0a7" }}>{message}</p>}
          <div className="actions" style={{ marginTop: 18, display: "flex", flexWrap: "wrap" }}>
            <button type="button" className="btn2" onClick={nextItem} disabled={busy || photoBusy}>Limpiar / siguiente</button>
            <button type="button" className="btn" onClick={saveProduct} disabled={busy || photoBusy || !photoReady}>{busy ? "Guardando..." : "Guardar producto"}</button>
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
