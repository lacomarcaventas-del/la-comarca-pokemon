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
   if(error.message?.includes("DEMO_LIMIT_REACHED")){
    setError(`Las Demos de ${game} se han agotado. ¡Gracias por tu interés! En aproximadamente 3 meses tendremos una nueva oportunidad.`);
   } else {
    setError("No se pudo completar el registro. Intenta nuevamente.");
   }
   return;
  }
  setRedemptionCode(code);
  setDone(true);
 }

 return <main className="siteShell">
  <header className="top siteTop"><Link href="/eventos" className="logoLink">← Eventos</Link></header>
  <section className="wrap sectionBlock" style={{maxWidth:700}}>
   {done?
    <div style={{maxWidth:1040,margin:"0 auto",padding:"24px 0"}}>
     <div style={{textAlign:"center",marginBottom:32}}>
      <div style={{color:"#d6a653",letterSpacing:3,fontSize:13,textTransform:"uppercase",marginBottom:10}}>Temporada de Novatos</div>
      <h2 style={{margin:0,fontSize:"clamp(2rem,5vw,3.2rem)",color:"#f2d08b"}}>✦ ¡REGISTRO RECIBIDO!</h2>
      <p style={{margin:"14px auto 0",maxWidth:580,fontSize:"1.1rem",opacity:.88}}>Tu preinscripción ha sido registrada correctamente.</p>
     </div>

     <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:18,alignItems:"stretch"}}>
      <div style={{padding:24,border:"1px solid rgba(214,166,83,.28)",borderRadius:16,background:"rgba(10,18,29,.55)"}}>
       <div style={{color:"#d6a653",fontSize:12,letterSpacing:2,marginBottom:12}}>JUEGO ELEGIDO</div>
       <strong style={{fontSize:"1.25rem",lineHeight:1.35}}>{game}</strong>
       <p style={{margin:"16px 0 0",lineHeight:1.55,opacity:.82}}>Guarda tu código y preséntalo en caja para validar tu registro.</p>
      </div>

      <div style={{padding:24,border:"1px solid rgba(214,166,83,.7)",borderRadius:16,background:"linear-gradient(145deg,rgba(214,166,83,.13),rgba(10,18,29,.7))",boxShadow:"0 10px 35px rgba(0,0,0,.2)"}}>
       <div style={{color:"#d6a653",fontSize:12,letterSpacing:2,marginBottom:12}}>CÓDIGO PARA CANJEAR TU DEMO</div>
       <div style={{padding:"16px 14px",borderRadius:10,border:"1px dashed rgba(214,166,83,.55)",fontSize:"1.55rem",fontWeight:800,letterSpacing:1.5,wordBreak:"break-word",background:"rgba(0,0,0,.18)"}}>{redemptionCode}</div>
      </div>

      <div style={{padding:24,border:"1px solid rgba(214,166,83,.28)",borderRadius:16,background:"rgba(10,18,29,.55)"}}>
       <div style={{color:"#d6a653",fontSize:12,letterSpacing:2,marginBottom:12}}>VISÍTANOS EN TIENDA</div>
       <div style={{display:"inline-block",padding:"9px 14px",borderRadius:9,background:"#d6a653",color:"#121820",fontWeight:800,fontSize:"1.05rem",marginBottom:14}}>5:00 p.m. a 10:00 p.m.</div>
       <p style={{margin:0,lineHeight:1.6,fontWeight:600}}>Durante septiembre, acércate a caja para más información y para recibir o canjear el material correspondiente a <span style={{color:"#f2d08b"}}>{game}</span>.</p>
      </div>
     </div>

     <div style={{marginTop:28,textAlign:"center"}}>
      <p style={{marginBottom:18,opacity:.72}}>Gracias por formar parte de la Temporada de Novatos en La Comarca.</p>
      <Link href="/eventos" style={{display:"inline-block",padding:"11px 22px",border:"1px solid rgba(214,166,83,.65)",borderRadius:9,color:"#f2d08b",textDecoration:"none"}}>← Volver a Eventos</Link>
     </div>
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