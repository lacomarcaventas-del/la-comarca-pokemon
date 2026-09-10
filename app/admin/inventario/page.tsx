"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { supabaseBrowser } from "../../../lib/supabase";

type Row = Record<string, any>;
type Audit = Record<string, any>;

const REQUIRED = ["Nombre", "Categoría", "Precio MXN", "Stock"];
const HEADERS = [
  "ID FOTO", "Nombre", "Categoría", "Set", "Número", "Rareza", "Idioma",
  "Condición", "Precio MXN", "Stock", "Publicado", "Ubicación", "Notas", "Imagen",
];

const photoId = (n: number) => `LC-${String(n).padStart(6, "0")}`;
const clean = (v: any) => String(v ?? "").trim().replace(/^.*[\\/]/, "").toLowerCase();
const normalize = (v: any) => String(v ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/&/g, "and")
  .replace(/[^a-z0-9]+/gi, " ")
  .trim()
  .toLowerCase();
const dateKey = (v: string) => new Date(v).toLocaleDateString("es-MX", {
  timeZone: "America/Mexico_City",
  year: "numeric",
  month: "long",
  day: "numeric",
});

function isPhoto(name: string, id: string, ref = "") {
  const file = clean(name);
  const wanted = clean(ref);
  const extensions = ["jpg", "jpeg", "png", "webp"];
  return extensions.some((ext) =>
    file === `${id}.${ext}` ||
    file === wanted ||
    file.endsWith(`/${wanted}`) ||
    file.endsWith(`/${id}.${ext}`)
  );
}

export default function Inventario() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [role, setRole] = useState("");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [preview, setPreview] = useState<Row[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [photos, setPhotos] = useState(0);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [history, setHistory] = useState<Audit[]>([]);
  const [confirmImportId, setConfirmImportId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [openDates, setOpenDates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: auth } = await sb.auth.getUser();
      const user = auth.user;
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setUserEmail(user.email || "");
      const { data: profile } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!profile || !["admin", "agent"].includes(profile.role)) {
        await sb.auth.signOut();
        router.replace("/login");
        return;
      }
      setRole(profile.role);
      loadHistory(profile.role, user.id);
    })();
  }, []);

  async function loadHistory(currentRole = role, currentUserId = userId) {
    let query = sb.from("inventory_import_audit").select("*").order("created_at", { ascending: false }).limit(100);
    if (currentRole === "agent" && currentUserId) query = query.eq("actor_id", currentUserId);
    const { data, error } = await query;
    if (!error) setHistory(data || []);
  }

  function makeXlsx(data: Row[], name: string) {
    const ws = XLSX.utils.json_to_sheet(data, { header: HEADERS });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventario");
    XLSX.writeFile(wb, name);
  }

  function downloadTemplate() {
    const data = Array.from({ length: 100 }, (_, i) => ({
      "ID FOTO": photoId(i + 1), Nombre: "", Categoría: "", Set: "", Número: "", Rareza: "",
      Idioma: "English", Condición: "Near Mint", "Precio MXN": "", Stock: "", Publicado: "Sí",
      Ubicación: "", Notas: "", Imagen: `fotos/${photoId(i + 1)}.jpg`,
    }));
    makeXlsx(data, "la-comarca-plantilla-inventario.xlsx");
    setMsg("Plantilla creada con 100 IDs de foto.");
  }

  function validate(data: Row[]) {
    const out: string[] = [];
    data.forEach((row, index) => {
      const blank = REQUIRED.every((key) => String(row[key] ?? "").trim() === "");
      if (blank) return;
      REQUIRED.forEach((key) => {
        if (row[key] === undefined || row[key] === "") out.push(`Fila ${index + 2}: falta ${key}.`);
      });
      if (row["Precio MXN"] !== "" && !Number.isFinite(Number(row["Precio MXN"]))) {
        out.push(`Fila ${index + 2}: Precio MXN inválido.`);
      }
      if (row.Stock !== "" && (!Number.isInteger(Number(row.Stock)) || Number(row.Stock) < 0)) {
        out.push(`Fila ${index + 2}: Stock inválido.`);
      }
      if (row["ID FOTO"] && !/^LC-\d{6}$/.test(String(row["ID FOTO"]))) {
        out.push(`Fila ${index + 2}: ID FOTO inválido.`);
      }
    });
    return out.slice(0, 100);
  }

  async function prepare(data: Row[], names: string[] = []) {
    const validationErrors = validate(data);
    const missingPhotos = names.length
      ? data.flatMap((row, index) => {
          const id = clean(row["ID FOTO"]);
          const ref = String(row.Imagen || "");
          const hasPhoto = id
            ? names.some((name) => isPhoto(name, id, ref))
            : ref
              ? names.some((name) => clean(name) === clean(ref) || clean(name).endsWith(`/${clean(ref)}`))
              : false;
          if ((id || ref) && !hasPhoto) {
            return [`Fila ${index + 2}: no se encontró la foto indicada (${row["ID FOTO"] || row.Imagen}).`];
          }
          return [];
        })
      : [];
    const productRows = data.filter((row) => !REQUIRED.every((key) => String(row[key] ?? "").trim() === ""));
    setRows(data);
    setTotal(productRows.length);
    setPreview(productRows.slice(0, 10));
    setPhotos(names.length);
    const allErrors = [...validationErrors, ...missingPhotos];
    setErrors(allErrors);
    setMsg(allErrors.length ? `Se detectaron ${allErrors.length} problema(s).` : `${productRows.length} producto(s) listos para revisión.`);
  }

  async function readXlsx(file: File) {
    setZipFile(null);
    setSourceFile(file);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets.Inventario || workbook.Sheets[workbook.SheetNames[0]];
      await prepare(XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" }));
    } catch (error: any) {
      setErrors([`No se pudo leer el Excel: ${error?.message || error}`]);
    }
  }

  async function readZip(file: File) {
    setZipFile(file);
    setSourceFile(file);
    try {
      const zip = await JSZip.loadAsync(file);
      const excelEntry = Object.values(zip.files).find((entry: any) => !entry.dir && entry.name.toLowerCase().endsWith(".xlsx")) as any;
      if (!excelEntry) throw new Error("El ZIP debe contener un archivo .xlsx.");
      const workbook = XLSX.read(await excelEntry.async("arraybuffer"), { type: "array" });
      const sheet = workbook.Sheets.Inventario || workbook.Sheets[workbook.SheetNames[0]];
      const names = Object.values(zip.files)
        .filter((entry: any) => !entry.dir && /\.(jpg|jpeg|png|webp)$/i.test(entry.name))
        .map((entry: any) => entry.name);
      await prepare(XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" }), names);
    } catch (error: any) {
      setErrors([`No se pudo leer el ZIP: ${error?.message || error}`]);
      setPreview([]);
    }
  }

  async function importInventory() {
    if (!rows.length || errors.length) return;
    setBusy(true);
    let auditId: string | null = null;
    let sourcePath: string | null = null;
    let created = 0;
    let rejected = 0;
    let uploaded = 0;
    const cardIds: string[] = [];
    const photoPaths: string[] = [];
    const rowErrors: any[] = [];

    try {
      const { data: auth } = await sb.auth.getUser();
      const user = auth.user;
      if (!user) throw new Error("Sesión expirada.");

      const zip = zipFile ? await JSZip.loadAsync(zipFile) : null;
      const { data: categories, error: categoriesError } = await sb.from("categories").select("id,name");
      if (categoriesError) throw categoriesError;
      const { data: setsData, error: setsError } = await sb.from("sets").select("id,name,code");
      if (setsError) throw setsError;

      const categoryMap = new Map((categories || []).map((item: any) => [normalize(item.name), item.id]));
      const setMap = new Map<string, string>();
      (setsData || []).forEach((item: any) => {
        setMap.set(normalize(item.name), item.id);
        if (item.code) setMap.set(normalize(item.code), item.id);
      });

      const { data: auditRow, error: auditError } = await sb
        .from("inventory_import_audit")
        .insert({
          actor_id: user.id,
          actor_role: role,
          file_name: sourceFile?.name || "importacion.xlsx",
          total_rows: rows.length,
          created_rows: 0,
          updated_rows: 0,
          rejected_rows: 0,
          status: "started",
          details: {
            actor_email: user.email || userEmail,
            card_ids: [],
            photo_paths: [],
            errors: [],
            source_file: null,
            approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Aprobada automáticamente por administrador",
          },
        })
        .select("id")
        .single();

      if (auditError || !auditRow?.id) throw auditError || new Error("No fue posible crear el registro de importación.");
      auditId = auditRow.id;

      if (sourceFile) {
        const path = `inventory-imports/${user.id}/${Date.now()}-${sourceFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const uploadSource = await sb.storage.from("card-images").upload(path, sourceFile, {
          contentType: sourceFile.type || "application/octet-stream",
        });
        if (uploadSource.error) throw uploadSource.error;
        sourcePath = path;
        await sb.from("inventory_import_audit").update({
          details: {
            actor_email: user.email || userEmail,
            card_ids: [],
            photo_paths: [],
            errors: [],
            source_file: sourcePath,
            approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Aprobada automáticamente por administrador",
          },
        }).eq("id", auditId);
      }

      for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (REQUIRED.every((key) => String(row[key] ?? "").trim() === "")) continue;

        try {
          const categoryId = categoryMap.get(normalize(row["Categoría"]));
          if (!categoryId) throw new Error(`Categoría no encontrada: ${row["Categoría"]}`);

          const setText = String(row.Set || "").trim();
          const setId = setText ? setMap.get(normalize(setText)) || null : null;
          let imageUrl: string | null = null;
          const id = clean(row["ID FOTO"]);
          const imageRef = String(row.Imagen || "");

          if (zip && (id || imageRef)) {
            const entry = Object.values(zip.files).find((item: any) => !item.dir && isPhoto(item.name, id, imageRef)) as any;
            if (!entry) throw new Error(`Foto no encontrada para ${row["ID FOTO"] || row.Imagen}.`);
            const blob = await entry.async("blob");
            const ext = entry.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `inventory/${user.id}/${id}.${ext}`;
            const photoUpload = await sb.storage.from("card-images").upload(path, blob, {
              upsert: true,
              contentType: blob.type || "image/jpeg",
            });
            if (photoUpload.error) throw photoUpload.error;
            imageUrl = sb.storage.from("card-images").getPublicUrl(path).data.publicUrl;
            photoPaths.push(path);
            uploaded++;
          } else if (imageRef.trim().toLowerCase().startsWith("http")) {
            imageUrl = imageRef.trim();
          }

          const payload = {
            name: String(row.Nombre).trim(),
            category_id: categoryId,
            set_id: setId,
            card_number: row.Número ? String(row.Número) : null,
            rarity: row.Rareza ? String(row.Rareza) : null,
            language: String(row.Idioma || "English"),
            condition: String(row.Condición || "Near Mint"),
            price: Number(row["Precio MXN"]),
            stock: Number(row.Stock),
            published: role === "admin" ? String(row.Publicado || "Sí").toLowerCase() === "sí" : false,
            image_url: imageUrl,
            created_by: user.id,
            updated_by: user.id,
          };

          const { data: inserted, error: insertError } = await sb.from("cards").insert(payload).select("id").single();
          if (insertError || !inserted?.id) throw insertError || new Error("No se pudo crear el producto.");
          cardIds.push(inserted.id);
          created++;

          if (auditId && (created + rejected) % 10 === 0) {
            await sb.from("inventory_import_audit").update({
              created_rows: created,
              rejected_rows: rejected,
              details: {
                actor_email: user.email || userEmail,
                card_ids: [...cardIds],
                photo_paths: [...photoPaths],
                errors: [...rowErrors],
                source_file: sourcePath,
                approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Aprobada automáticamente por administrador",
              },
            }).eq("id", auditId);
          }
        } catch (error: any) {
          rejected++;
          rowErrors.push({ row: index + 2, error: error?.message || String(error) });
        }
      }

      if (auditId) {
        const finalStatus = role === "admin" ? "completed" : "pending";
        const { error: finalAuditError } = await sb.from("inventory_import_audit").update({
          file_name: sourceFile?.name || "importacion.xlsx",
          total_rows: rows.length,
          created_rows: created,
          updated_rows: 0,
          rejected_rows: rejected,
          status: finalStatus,
          details: {
            actor_email: user.email || userEmail,
            card_ids: [...cardIds],
            photo_paths: [...photoPaths],
            errors: [...rowErrors],
            source_file: sourcePath,
            approval_note: role === "agent" ? "Pendiente de aprobación por administrador" : "Aprobada automáticamente por administrador",
          },
        }).eq("id", auditId);
        if (finalAuditError) throw finalAuditError;
      }

      setMsg(role === "agent"
        ? `Carga recibida: ${created} productos pendientes de aprobación.`
        : `Importación terminada: ${created} creados, ${rejected} rechazados, ${uploaded} fotos asociadas.`);
      setErrors(rowErrors.map((item) => `Fila ${item.row}: ${item.error}`));
      setRows([]);
      setPreview([]);
      setTotal(0);
      await loadHistory();
    } catch (error: any) {
      const fatalError = error?.message || String(error);
      if (auditId) {
        await sb.from("inventory_import_audit").update({
          created_rows: created,
          rejected_rows: rejected,
          status: "failed",
          details: {
            actor_email: userEmail,
            card_ids: [...cardIds],
            photo_paths: [...photoPaths],
            errors: [...rowErrors, { fatal_error: fatalError }],
            source_file: sourcePath,
            approval_note: "La importación falló y quedó registrada automáticamente",
          },
        }).eq("id", auditId);
      }
      setMsg(`No se pudo completar la importación: ${fatalError}`);
      setErrors([
        ...rowErrors.map((item) => `Fila ${item.row}: ${item.error}`),
        `Error de importación: ${fatalError}`,
      ]);
      await loadHistory();
    } finally {
      setBusy(false);
    }
  }

  async function downloadImport(audit: Audit) {
    const path = audit.details?.source_file;
    if (!path) {
      setMsg("Esta importación no tiene archivo original guardado.");
      return;
    }
    window.open(sb.storage.from("card-images").getPublicUrl(path).data.publicUrl, "_blank");
  }

  async function undoImport(audit: Audit, status: "deleted" | "cancelled" | "rejected") {
    const ids = Array.isArray(audit.details?.card_ids) ? audit.details.card_ids : [];
    const paths = Array.isArray(audit.details?.photo_paths) ? audit.details.photo_paths : [];
    if (ids.length) {
      const { error } = await sb.from("cards").delete().in("id", ids);
      if (error) throw error;
    }
    if (paths.length) {
      const { error } = await sb.storage.from("card-images").remove(paths);
      if (error) console.warn(error.message);
    }
    const updatedDetails = {
      ...(audit.details || {}),
      removed_card_ids: ids,
      action_at: new Date().toISOString(),
      action_by: userId,
    };
    const { error } = await sb.from("inventory_import_audit").update({
      status,
      details: updatedDetails,
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
      deleted_reason: status === "rejected" ? "Carga rechazada" : status === "cancelled" ? "Carga cancelada" : "Importación deshecha",
    }).eq("id", audit.id);
    if (error) throw error;
  }

  async function approveImport(audit: Audit) {
    if (role !== "admin" || audit.status !== "pending") return;
    if (!window.confirm(`¿Aprobar la carga de ${audit.created_rows || 0} producto(s)?`)) return;
    setBusy(true);
    try {
      const ids = Array.isArray(audit.details?.card_ids) ? audit.details.card_ids : [];
      if (ids.length) {
        const { error } = await sb.from("cards").update({ published: true }).in("id", ids);
        if (error) throw error;
      }
      const { error } = await sb.from("inventory_import_audit").update({
        status: "approved",
        details: { ...(audit.details || {}), approved_by: userId, approved_email: userEmail, approved_at: new Date().toISOString() },
      }).eq("id", audit.id);
      if (error) throw error;
      setMsg("Carga aprobada y publicada en el catálogo.");
      await loadHistory();
    } catch (error: any) {
      setMsg(`No se pudo aprobar: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  }

  async function rejectImport(audit: Audit) {
    if (role !== "admin" || audit.status !== "pending") return;
    if (!window.confirm("¿Rechazar esta carga?")) return;
    setBusy(true);
    try {
      await undoImport(audit, "rejected");
      setMsg("Carga rechazada y eliminada.");
      await loadHistory();
    } catch (error: any) {
      setMsg(`No se pudo rechazar: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  }

  async function cancelImport(audit: Audit) {
    if (audit.status !== "pending" || (role !== "admin" && audit.actor_id !== userId)) return;
    if (!window.confirm("¿Cancelar esta carga?")) return;
    setBusy(true);
    try {
      await undoImport(audit, "cancelled");
      setMsg("Carga cancelada y eliminada.");
      await loadHistory();
    } catch (error: any) {
      setMsg(`No se pudo cancelar: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  }

  function requestUndo(audit: Audit) {
    if (role !== "admin" || ["deleted", "rejected", "cancelled", "pending", "started", "failed"].includes(audit.status)) return;
    setConfirmImportId(audit.id);
    setConfirmText("");
  }

  async function confirmUndo() {
    if (!confirmImportId || confirmText.trim() !== "ACEPTO") return;
    const audit = history.find((item) => item.id === confirmImportId);
    if (!audit) return;
    setBusy(true);
    try {
      await undoImport(audit, "deleted");
      setMsg("Importación eliminada correctamente; el registro queda como Deshecha.");
      setConfirmImportId(null);
      setConfirmText("");
      await loadHistory();
    } catch (error: any) {
      setMsg(`No se pudo deshacer: ${error?.message || error}`);
    } finally {
      setBusy(false);
    }
  }

  const pending = history.filter((audit) => audit.status === "pending" && audit.actor_role === "agent");
  const mine = history.filter((audit) => audit.actor_id === userId);
  const statusText = (status: string) => {
    if (status === "pending") return "🟡 Pendiente";
    if (status === "approved") return "🟢 Aprobada";
    if (status === "rejected") return "🔴 Rechazada";
    if (status === "cancelled") return "⚪ Cancelada";
    if (status === "deleted") return "🗑️ Deshecha";
    if (status === "started") return "🔵 En curso";
    if (status === "failed") return "🔴 Fallida";
    return "✓ Activa";
  };

  function renderRows(list: Audit[], approval = false) {
    const grouped = list.reduce((groups: Record<string, Audit[]>, audit) => {
      const day = dateKey(audit.created_at);
      (groups[day] ||= []).push(audit);
      return groups;
    }, {});

    return (
      <div>
        {Object.entries(grouped).map(([day, items]) => {
          const key = `${approval ? "pending" : "history"}-${day}`;
          const open = openDates[key] ?? false;
          return (
            <div key={key} style={{ marginBottom: 10, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
              <button className="btn2" style={{ width: "100%", textAlign: "left", display: "flex", justifyContent: "space-between" }} onClick={() => setOpenDates((value) => ({ ...value, [key]: !open }))}>
                <b>{open ? "▾" : "▸"} {day}</b>
                <span>{items.length} importación{items.length !== 1 ? "es" : ""}</span>
              </button>
              {open && (
                <div style={{ overflow: "auto" }}>
                  <table className="table">
                    <thead><tr><th>Hora</th><th>Agente</th><th>Archivo</th><th>Registros</th><th>Nuevos</th><th>Errores</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>
                      {items.map((audit) => (
                        <tr key={audit.id}>
                          <td>{new Date(audit.created_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</td>
                          <td>{audit.details?.actor_email || audit.actor_id || "—"}</td>
                          <td>{audit.file_name || "—"}</td>
                          <td>{audit.total_rows}</td>
                          <td>{audit.created_rows}</td>
                          <td>{audit.rejected_rows}</td>
                          <td>{statusText(audit.status)}</td>
                          <td>
                            <div className="actions">
                              <button className="btn2" onClick={() => downloadImport(audit)} disabled={!audit.details?.source_file}>⬇ Archivo</button>
                              {approval && audit.status === "pending" && <>
                                <button className="btn" onClick={() => approveImport(audit)} disabled={busy}>✓ Aprobar</button>
                                <button className="btn2" onClick={() => rejectImport(audit)} disabled={busy}>✕ Rechazar</button>
                              </>}
                              {audit.status === "pending" && <button className="btn2" onClick={() => cancelImport(audit)} disabled={busy}>⛔ Cancelar</button>}
                              {role === "admin" && !["deleted", "rejected", "cancelled", "pending", "started", "failed"].includes(audit.status) && <button className="btn2" onClick={() => requestUndo(audit)} disabled={busy}>🗑️ Deshacer</button>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <>
      <header className="top"><a href="/admin">← Administración</a><b>La Comarca · Inventario</b></header>
      <main className="wrap">
        <div className="panel">
          <h2>Importar inventario</h2>
          <p className="muted">Acceso: {role}. Excel solo o ZIP con Excel + fotos.</p>
          <div className="actions">
            <button className="btn2" onClick={downloadTemplate}>📄 Descargar plantilla Excel</button>
            <label className="btn2" style={{ cursor: "pointer" }}>📥 Seleccionar Excel<input hidden type="file" accept=".xlsx" onChange={(event) => event.target.files?.[0] && readXlsx(event.target.files[0])} /></label>
            <label className="btn2" style={{ cursor: "pointer" }}>📦 Seleccionar ZIP con fotos<input hidden type="file" accept=".zip" onChange={(event) => event.target.files?.[0] && readZip(event.target.files[0])} /></label>
          </div>
          {total > 0 && <p>{total} producto(s) · {photos} foto(s) detectadas.</p>}
          {errors.length > 0 && <div className="notice">{errors.map((item, index) => <div key={index}>{item}</div>)}</div>}
          {total > 0 && !errors.length && <>
            <div className="notice">✓ Archivo válido. Vista previa de hasta 10 filas.</div>
            <div className="actions" style={{ marginTop: 10 }}>
              <button className="btn" disabled={busy} onClick={importInventory}>{busy ? "Importando..." : `📥 Importar ${total} producto(s)`}</button>
              <button className="btn2" type="button" onClick={() => document.getElementById("historial-cargas")?.scrollIntoView({ behavior: "smooth", block: "start" })}>📋 Historial de cargas</button>
            </div>
          </>}
          {msg && <p className="notice">{msg}</p>}
        </div>

        {preview.length > 0 && <div className="panel">
          <h3>Vista previa</h3>
          <div style={{ overflow: "auto" }}>
            <table className="table"><thead><tr>{Object.keys(preview[0]).map((key) => <th key={key}>{key}</th>)}</tr></thead>
              <tbody>{preview.map((row, index) => <tr key={index}>{Object.keys(preview[0]).map((key) => <td key={key}>{String(row[key] ?? "")}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>}

        {role === "admin" && <div className="panel"><h3>⏳ Pendientes de agentes {pending.length ? `(${pending.length})` : ""}</h3>{pending.length ? renderRows(pending, true) : <p className="muted">No hay cargas pendientes de aprobación.</p>}</div>}
        <div className="panel" id="historial-cargas"><h3>📥 Mis importaciones</h3>{mine.length ? renderRows(mine) : <p className="muted">Aún no tienes importaciones registradas.</p>}</div>
        {role === "admin" && <div className="panel"><h3>📜 Historial completo</h3>{history.length ? renderRows(history) : <p className="muted">Aún no hay importaciones registradas.</p>}</div>}
      </main>

      {confirmImportId && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
        <div className="panel" style={{ maxWidth: 520, width: "100%" }}>
          <h2>⚠️ Deshacer importación</h2>
          <p>Esto eliminará todos los productos creados por esta carga y sus fotos. El historial quedará marcado como Deshecha.</p>
          <p>Escribe <b>ACEPTO</b>:</p>
          <input autoFocus value={confirmText} onChange={(event) => setConfirmText(event.target.value)} style={{ width: "100%", padding: 12, marginBottom: 14 }} />
          <div className="actions"><button className="btn2" onClick={() => setConfirmImportId(null)}>Cancelar</button><button className="btn" disabled={confirmText.trim() !== "ACEPTO" || busy} onClick={confirmUndo}>{busy ? "Deshaciendo..." : "Deshacer importación"}</button></div>
        </div>
      </div>}
    </>
  );
}
