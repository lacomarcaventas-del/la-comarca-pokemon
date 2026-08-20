"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [newPassword,setNewPassword]=useState("");
  const [err,setErr]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  const [checking,setChecking]=useState(true);
  const [recovery,setRecovery]=useState(false);
  const router=useRouter();

  async function enterExistingSession(){
    const sb=supabaseBrowser();
    const {data:{session}}=await sb.auth.getSession();
    if(window.location.hash.includes("type=recovery")){
      setRecovery(true);
      setChecking(false);
      return true;
    }
    if(!session?.user){setChecking(false);return false}
    const {data:profile,error}=await sb.from("profiles").select("role").eq("id",session.user.id).maybeSingle();
    if(error){setErr("No se pudo verificar el perfil administrativo.");setChecking(false);return true}
    if(profile?.role==="admin"){router.replace("/admin");return true}
    setErr("La sesión actual no tiene permisos de administración.");
    setChecking(false);
    return true;
  }

  useEffect(()=>{void enterExistingSession()},[]);

  async function go(e:any){
    e.preventDefault();setBusy(true);setErr("");setNotice("");
    const sb=supabaseBrowser();
    const {data,error}=await sb.auth.signInWithPassword({email:email.trim(),password});
    if(error){setErr(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos. Si no recuerdas la contraseña, usa «¿Olvidaste tu contraseña?»." : error.message);setBusy(false);return}
    if(!data.user){setErr("No se pudo identificar la sesión.");setBusy(false);return}
    const {data:profile,error:profileError}=await sb.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
    if(profileError){setErr("No se pudo verificar el perfil administrativo.");setBusy(false);return}
    if(profile?.role!=="admin"){setErr("Esta cuenta no tiene permisos de administración.");setBusy(false);return}
    router.replace("/admin");
  }

  async function forgot(){
    setErr("");setNotice("");
    const clean=email.trim();
    if(!clean){setErr("Escribe tu correo primero.");return}
    setBusy(true);
    const sb=supabaseBrowser();
    const {error}=await sb.auth.resetPasswordForEmail(clean,{redirectTo:`${window.location.origin}/login`});
    if(error){setErr(error.message);setBusy(false);return}
    setNotice("Si el correo existe, recibirás un enlace para cambiar la contraseña.");
    setBusy(false);
  }

  async function changePassword(e:any){
    e.preventDefault();setErr("");setNotice("");
    if(newPassword.length<8){setErr("La nueva contraseña debe tener al menos 8 caracteres.");return}
    setBusy(true);
    const sb=supabaseBrowser();
    const {error}=await sb.auth.updateUser({password:newPassword});
    if(error){setErr(error.message);setBusy(false);return}
    setNotice("Contraseña actualizada. Ahora puedes entrar a Administración.");
    setRecovery(false);setNewPassword("");setPassword("");setBusy(false);
    await sb.auth.signOut();
  }

  if(checking)return <main className="wrap"><div className="panel center"><h1 className="brand">La Comarca</h1><p className="muted">Verificando sesión...</p></div></main>;
  return <main className="wrap"><div className="panel center"><h1 className="brand">La Comarca</h1><h2>Administración</h2><p className="muted">Acceso privado · personal autorizado</p>{recovery?<form onSubmit={changePassword}><label>Nueva contraseña</label><input type="password" minLength={8} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Guardando...":"Cambiar contraseña"}</button></form>:<form onSubmit={go}><label>Correo</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Verificando...":"Entrar"}</button><button type="button" className="btn2" style={{width:"100%",marginTop:10}} disabled={busy} onClick={forgot}>¿Olvidaste tu contraseña?</button></form>}{err&&<p className="notice">{err}</p>}{notice&&<p className="notice">{notice}</p>}</div></main>;
}
