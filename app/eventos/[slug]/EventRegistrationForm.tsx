"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {supabaseBrowser} from "../../../lib/supabase";

type EventData={game:string;title:string;details:string;format:string};
export default function EventRegistrationForm({slug,event}:{slug:string;event:EventData}){
 const sb=supabaseBrowser();
 const [count,setCount]=useState(0),[loadingCount,setLoadingCount]=useState(true);
 const [full_name,setName]=useState(""),[phone,setPhone]=useState(""),[email,setEmail]=useState(""),[code,setCode]=useState(""),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");

 async function refreshCount(){
  const {count,error}=await sb.from("event_registrations").select("id",{count:"exact",head:true}).eq("event_slug",slug);
  if(!error)setCount(count||0);
  setLoadingCount(false);
 }
 useEffect(()=>{refreshCount()},[slug]);

 function makeLeagueCode(){
  const month=new Intl.DateTimeFormat("en-US",{month:"short"}).format(new Date()).toUpperCase();
  const year=String(new Date().getFullYear()).slice(-2);
  const format=event.format.toUpperCase().replace(/[^A-Z0-9]+/g,"-").replace(/^-|-$/g,"");
  const suffix=crypto.randomUUID().replace(/-/g,"").slice(0,6).toUpperCase();
  return `LIGA-${format}-${month}${year}-${suffix}`;
 }

 async function submit(e:React.FormEvent){
  e.preventDefault();
  if(count>=8){setError("Este evento ya está lleno. Cupo máximo: 8 jugadores.");return}
  setBusy(true);setError("");
  const leagueCode=makeLeagueCode();
  const {error}=await sb.from("event_registrations").insert({event_slug:slug,event_name:event.title,full_name,phone,email,game:event.game,redemption_code:leagueCode});
  setBusy(false);
  if(error){
   if(error.message?.includes("EVENT_FULL")){setCount(8);setError("Este evento ya está lleno. Cupo máximo: 8 jugadores.");}
   else setError("No se pudo completar la inscripción. Intenta nuevamente.");
   return;
  }
  setCount(c=>Math.min(8,c+1));
  setCode(leagueCode);
  setDone(true);
 }
 if(done)return <div style={{textAlign:"center",padding:"40px 10px"}}>
   <div style={{fontSize:12,letterSpacing:3,textTransform:"uppercase",color:"#d6a653"}}>Inscripción recibida</div>
   <h2 style={{fontSize:"clamp(2rem,5vw,3rem)",margin:"10px 0"}}>¡Listo!</h2>
   <p style={{opacity:.82,lineHeight:1.6}}>Tu inscripción para <strong>{event.title}</strong> fue registrada correctamente.</p>
   <p style={{color:"#f2d08b",fontWeight:700}}>Cupo: {count}/8</p>
   <div style={{margin:"22px auto",padding:"18px 22px",border:"1px solid rgba(214,166,83,.45)",borderRadius:12,background:"rgba(10,18,29,.7)",maxWidth:420}}><div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",opacity:.7}}>Código de Liga</div><div style={{fontSize:"1.35rem",fontWeight:800,letterSpacing:1.5,marginTop:7}}>{code}</div></div>
   <p style={{maxWidth:500,margin:"0 auto 14px",lineHeight:1.6,opacity:.82}}>Tu lugar quedó reservado. Ahora adquiere tu <strong>ticket de la liga</strong> para completar tu participación.</p>
   <a href={`/tickets?liga=${slug}`} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,padding:"13px 24px",border:"1px solid rgba(242,208,139,.75)",borderRadius:10,background:"linear-gradient(135deg,#d6a653,#a8752d)",color:"#111",fontWeight:800,textDecoration:"none",boxShadow:"0 8px 24px rgba(0,0,0,.28)"}}>🎟 Comprar ticket de la Liga →</a>
   <br/>
   <Link href="/eventos" style={{display:"inline-block",marginTop:18,padding:"11px 22px",border:"1px solid rgba(214,166,83,.65)",borderRadius:9,color:"#f2d08b",textDecoration:"none"}}>← Volver a Eventos</Link>
  </div>;
 const full=count>=8;
 return <>
  <div className="sectionTitle"><h2>{event.title}</h2><span>{event.game}</span></div>
  <div style={{padding:18,border:"1px solid rgba(214,166,83,.25)",borderRadius:12,marginBottom:14,background:"rgba(10,18,29,.5)"}}><strong>Formato:</strong> {event.details}</div>
  <div style={{marginBottom:22,fontSize:"1.05rem",fontWeight:700,color:full?"#e58a8a":"#f2d08b"}}>{loadingCount?"Consultando cupo...":"Cupo: "+count+"/8"}</div>
  <form onSubmit={submit} style={{display:"grid",gap:16,maxWidth:500}}>
   <label>Nombre completo<input required disabled={full} value={full_name} onChange={e=>setName(e.target.value)}/></label>
   <label>Teléfono<input required disabled={full} minLength={7} value={phone} onChange={e=>setPhone(e.target.value)}/></label>
   <label>Correo electrónico<input required disabled={full} type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
   {error&&<p>{error}</p>}
   <button className="primaryBtn" disabled={busy||loadingCount||full} style={{width:"100%",minHeight:50,borderRadius:11,fontWeight:800,letterSpacing:.2,boxShadow:"0 8px 22px rgba(0,0,0,.22)",transition:"transform .15s ease, box-shadow .15s ease"}}>{busy?"Registrando...":full?"Cupo lleno · 8/8":"Abrir mi inscripción →"}</button>
  </form>
 </>;
}