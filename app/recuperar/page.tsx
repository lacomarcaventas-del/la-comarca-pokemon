"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase";

export default function RecuperarContrasena() {
  const sb = supabaseBrowser();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (search.get("mode") === "recovery") setRecovery(true);
    const { data: listener } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [search, sb]);

  async function requestReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/recuperar?mode=recovery`,
    });
    if (error) setError(error.message);
    else setMessage("Si existe una cuenta con ese correo, te enviamos un enlace para crear una nueva contraseña.");
    setBusy(false);
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setMessage("");
    if (password.length < 8) { setError("La contraseña debe tener al menos 8 caracteres."); setBusy(false); return; }
    if (password !== confirm) { setError("Las contraseñas no coinciden."); setBusy(false); return; }
    const { error } = await sb.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setPassword(""); setConfirm("");
    }
    setBusy(false);
  }

  return <main className="wrap"><div className="panel center">
    <h1 className="brand">La Comarca</h1>
    {recovery ? <>
      <h2>Crea tu nueva contraseña</h2>
      <p className="muted">Escribe y confirma la contraseña que usarás para entrar a tu cuenta.</p>
      <form onSubmit={savePassword}>
        <label>Nueva contraseña</label>
        <input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" />
        <label>Confirmar contraseña</label>
        <input type="password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" />
        <button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Guardando...":"Guardar nueva contraseña"}</button>
      </form>
    </> : <>
      <h2>Recuperar contraseña</h2>
      <p className="muted">Escribe el correo con el que creaste tu cuenta y te enviaremos un enlace seguro.</p>
      <form onSubmit={requestReset}>
        <label>Correo</label>
        <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
        <button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Enviando...":"Enviar enlace de recuperación"}</button>
      </form>
    </>}
    {message && <p className="notice">{message}</p>}
    {error && <p className="notice">{error}</p>}
  </div></main>;
}
