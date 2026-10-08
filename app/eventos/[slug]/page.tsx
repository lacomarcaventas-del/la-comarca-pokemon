"use client";
import {useState} from "react";
import Link from "next/link";
import {supabaseBrowser} from "../../../lib/supabase";

const EVENTS={
 "heroclix-pulp-300":{game:"HeroClix",title:"Pulp · 300 puntos",details:"300 puntos · sin duplicados · formato Pulp"},
 "pokemon-standard":{game:"Pokémon TCG",title:"Standard",details:"Formato Standard vigente de Play! Pokémon"},
 "mtg-brawl":{game:"Magic: The Gathering",title:"Brawl",details:"Formato Brawl"},
 "mtg-commander-multiplayer":{game:"Magic: The Gathering",title:"Commander Multiplayer",details:"Commander multijugador"}
} as const;

type Slug=keyof typeof EVENTS;

export default function EventRegistration({params}:{params:{slug:string}}){
 const event=EVENTS[params.slug as Slug];
 const sb=supabaseBrowser();
 const [full_name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 if(!event)return <main className="siteShell"><section className="wrap sectionBlock"><h2>Evento no encontrado</h2><Link href="/eventos">← Volver a Eventos</Link></section></main>;

 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError("");
  const {error}=await sb.from("event_registrations").insert({event_slug:params.slug,event_name:event.title,full_name,phone,email,game:event.game});
  setBusy(false);
  if(error){setError("No se pudo completar la inscripción. Intenta nuevamente.");return;}
  setDone(true);
 }
 return <main className="siteShell">
  <header className="top siteTop"><Link href="/eventos" className="logoLink">← Eventos</Link></header>
  <section className="wrap sectionBlock" style={{maxWidth:700}}>
   {done?<div style={{textAlign:"center",padding:"40px 10px"}}>
     <div style={{fontSize:12,letterSpacing:3,textTransform:"uppercase",color:"#d6a653"}}>Inscripción recibida</div>
     <h2 style={{fontSize:"clamp(2rem,5vw,3rem)",margin:"10px 0"}}>¡Listo!</h2>
     <p style={{opacity:.82,lineHeight:1.6}}>Tu inscripción para <strong>{event.title}</strong> fue registrada correctamente. Te esperamos en La Comarca.</p>
     <Link href="/eventos" style={{display:"inline-block",marginTop:18,padding:"11px 22px",border:"1px solid rgba(214,166,83,.65)",borderRadius:9,color:"#f2d08b",textDecoration:"none"}}>← Volver a Eventos</Link>
   </div>:<>
    <div className="sectionTitle"><h2>{event.title}</h2><span>{event.game}</span></div>
    <div style={{padding:18,border:"1px solid rgba(214,166,83,.25)",borderRadius:12,marginBottom:22,background:"rgba(10,18,29,.5)"}}><strong>Formato:</strong> {event.details}</div>
    <form onSubmit={submit} style={{display:"grid",gap:16,maxWidth:500}}>
     <label>Nombre completo<input required value={full_name} onChange={e=>setName(e.target.value)}/></label>
     <label>Teléfono<input required minLength={7} value={phone} onChange={e=>setPhone(e.target.value)}/></label>
     <label>Correo electrónico<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
     {error&&<p>{error}</p>}
     <button className="primaryBtn" disabled={busy}>{busy?"Registrando...":"Abrir mi inscripción"}</button>
    </form>
   </>}
  </section>
 </main>;
}