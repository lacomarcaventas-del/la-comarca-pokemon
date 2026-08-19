"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "../../lib/supabase";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const [checking,setChecking]=useState(true);
  const router=useRouter();

  async function enterExistingSession(){
    const sb=supabaseBrowser();
    const {data:{user}}=await sb.auth.getUser();
    if(!user){setChecking(false);return false}
    const {data:profile,error}=await sb.from("profiles").select("role").eq("id",user.id).maybeSingle();
    if(error){setErr("No se pudo verificar el perfil administrativo.");setChecking(false);return true}
    if(profile?.role==="admin"){router.replace("/admin");return true}
    setErr("La sesión actual no tiene permisos de administración.");
    setChecking(false);
    return true;
  }

  useEffect(()=>{void enterExistingSession()},[]);

  async function go(e:any){
    e.preventDefault();setBusy(true);setErr("");
    const sb=supabaseBrowser();
    const {data,error}=await sb.auth.signInWithPassword({email,password});
    if(error){setErr(error.message);setBusy(false);return}
    if(!data.user){setErr("No se pudo identificar la sesión.");setBusy(false);return}
    const {data:profile,error:profileError}=await sb.from("profiles").select("role").eq("id",data.user.id).maybeSingle();
    if(profileError){setErr("No se pudo verificar el perfil administrativo.");setBusy(false);return}
    if(profile?.role!=="admin"){setErr("Esta cuenta no tiene permisos de administración.");setBusy(false);return}
    router.replace("/admin");
  }

  if(checking)return <main className="wrap"><div className="panel center"><h1 className="brand">La Comarca</h1><p className="muted">Verificando sesión...</p></div></main>;
  return <main className="wrap"><div className="panel center"><h1 className="brand">La Comarca</h1><h2>Administración</h2><p className="muted">Acceso privado · personal autorizado</p><form onSubmit={go}><label>Correo</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Verificando...":"Entrar"}</button></form>{err&&<p className="notice">{err}</p>}</div></main>;
}