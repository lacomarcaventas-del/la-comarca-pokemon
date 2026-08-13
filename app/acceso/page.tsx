"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {supabaseBrowser} from "../../lib/supabase";

export default function Acceso(){
 const router=useRouter(); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:any){e.preventDefault();setBusy(true);setErr("");const sb=supabaseBrowser();const {error}=await sb.auth.signInWithPassword({email,password});if(error){setErr(error.message);setBusy(false);return}router.push("/cuenta");}
 return <main className="wrap"><div className="panel center"><h1>La Comarca</h1><h2>Acceso de clientes</h2><p className="muted">Consulta tus movimientos, membresía y solicitudes.</p><form onSubmit={submit}><label>Correo electrónico</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Verificando...":"Entrar a mi cuenta"}</button></form>{err&&<p className="notice">{err}</p>}<p style={{marginTop:16}}>¿No tienes cuenta? <Link href="/registro">Crear cuenta</Link></p><p className="muted"><Link href="/">Volver a La Comarca</Link></p></div></main>;
}
