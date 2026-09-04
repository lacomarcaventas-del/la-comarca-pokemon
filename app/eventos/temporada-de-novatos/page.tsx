"use client";
import {useState} from "react";
import Link from "next/link";
import {supabaseBrowser} from "../../../lib/supabase";

const GAMES=["Magic: The Gathering","Heroclix","Pokémon"];

function makeCode(game:string,phone:string){
 const gameCode=game==="Magic: The Gathering"?"MTG":game==="Heroclix"?"HCX":"PKM";
 const digits=phone.replace(/\D/g,"");
 const last4=(digits.slice(-4)||"0000").padStart(4,"0");
 const random=Math.random().toString(36).slice(2,7).toUpperCase();
 return `NOV26-${gameCode}-${last4}-${random}`;
}

export default function Registro(){
 const sb=supabaseBrowser();
 const [full_name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[game,setGame]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState(""),[redemptionCode,setRedemptionCode]=useState("");

 async function submit(e:React.FormEvent){
  e.preventDefault();
  setBusy(true);
  setError("");
  const code=makeCode(game,phone);
  const {error}=await sb.from("event_registrations").insert({
   event_slug:"temporada-de-novatos-2026-septiembre",
   event_name:"Temporada de Novatos",
   full_name,phone,email,game,redemption_code:code
  });
  setBusy(false);
  if(error){
   setError("No se pudo completar el registro. Intenta nuevamente.");
   return;
  }
  setRedemptionCode(code);
  setDone(true);
 }

 return <main className="siteShell">
  <header className="top siteTop"><Link href="/eventos" className="logoLink">← Eventos</Link></header>
  <section className="wrap sectionBlock" style={{maxWidth:700}}>
   {done?
    <div className="sectionTitle">
     <h2>¡Registro recibido!</h2>
     <p>Tu preinscripción ha sido registrada correctamente.</p>
     <p><strong>Juego elegido: {game}</strong></p>
     <div style={{margin:"24px 0",padding:20,border:"1px solid rgba(214,166,83,.55)",borderRadius:12}}>
      <span style={{display:"block",marginBottom:8}}>Código para canjear tu demo en tienda:</span>
      <strong style={{fontSize:"1.4rem",letterSpacing:1}}>{redemptionCode}</strong>
     </div>
     <p>Guarda este código y preséntalo en caja para validar tu registro y recibir o canjear el material correspondiente a <strong>{game}</strong>.</p>
     <p>Pasa a la tienda de <strong>5:00 p.m. a 10:00 p.m.</strong> y acércate a caja para más información.</p>
     <Link href="/eventos">Volver a Eventos</Link>
    </div>
   :
    <>
     <div className="sectionTitle"><h2>Temporada de Novatos</h2><span>Registro de participación</span></div>
     <form onSubmit={submit} style={{display:"grid",gap:16,maxWidth:500}}>
      <label>Nombre completo<input required value={full_name} onChange={e=>setName(e.target.value)} /></label>
      <label>Teléfono<input required minLength={7} value={phone} onChange={e=>setPhone(e.target.value)} /></label>
      <label>Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
      <label>Juego
       <select required value={game} onChange={e=>setGame(e.target.value)}>
        <option value="" disabled>Selecciona un juego</option>
        {GAMES.map(item=><option key={item} value={item}>{item}</option>)}
       </select>
      </label>
      {error&&<p>{error}</p>}
      <button className="primaryBtn" disabled={busy}>{busy?"Registrando...":"Registrarme"}</button>
     </form>
    </>
   }
  </section>
 </main>
}