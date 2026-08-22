"use client";
import {Suspense,useEffect,useRef,useState} from "react";
import {useRouter,useSearchParams} from "next/navigation";
import {supabaseBrowser} from "../../../lib/supabase";

declare global { interface Window { ClipSDK?: any } }

function PagoPruebaContenido(){
  const q=useSearchParams(); const router=useRouter(); const orderId=q.get("order");
  const [total,setTotal]=useState<number|null>(null); const [message,setMessage]=useState("Preparando pago de prueba..."); const [ready,setReady]=useState(false); const [busy,setBusy]=useState(false); const [challenge,setChallenge]=useState<{url:string,paymentId:string}|null>(null); const cardRef=useRef<any>(null);

  const extractMessage=(value:any,depth=0):string=>{
    if(value==null)return "";
    if(typeof value==="string"||typeof value==="number"||typeof value==="boolean")return String(value);
    if(value instanceof Error)return extractMessage(value.message,depth+1);
    if(depth>4){try{return JSON.stringify(value);}catch{return "Error desconocido";}}
    if(typeof value==="object"){
      for(const key of ["message","error","detail","description","reason","statusText"]){
        const result=extractMessage(value[key],depth+1);
        if(result&&result!=="[object Object]")return result;
      }
      try{return JSON.stringify(value);}catch{return "Error desconocido";}
    }
    return String(value);
  };

  const showError=(value:any,fallback="No fue posible procesar el pago de prueba.")=>{
    const detail=extractMessage(value);
    setMessage(detail&&detail!=="[object Object]"?detail:fallback);
  };

  useEffect(()=>{(async()=>{
    if(!orderId){setMessage("No encontramos el pedido.");return;}
    const sb=supabaseBrowser();
    const {data:{user},error:userError}=await sb.auth.getUser();
    if(userError||!user){router.replace("/cuenta");return;}
    const {data,error}=await sb.from("orders").select("id,total,status").eq("id",orderId).maybeSingle();
    if(error){console.error("No fue posible cargar pedido para Clip",error);setMessage(extractMessage(error)||"No fue posible cargar el pedido.");return;}
    if(!data){setMessage("No encontramos este pedido o ya no tienes acceso a él.");return;}
    if(data.status!=="pending"&&data.status!=="contacted"){router.replace(`/pago/resultado?order=${orderId}`);return;}
    setTotal(Number(data.total));
    const key=process.env.NEXT_PUBLIC_CLIP_TEST_API_KEY;
    if(!key){setMessage("Clip Pruebas aún no está configurado.");return;}
    const existing=document.querySelector('script[data-clip-sdk]') as HTMLScriptElement|null;
    const init=()=>{try{
      if(!window.ClipSDK)throw new Error("El SDK de Clip no está disponible.");
      const clip=new window.ClipSDK(key); const card=clip.element.create("Card",{theme:"light",locale:"es"});
      card.mount("clip-checkout"); cardRef.current=card; setReady(true); setMessage("Ingresa los datos de prueba en el formulario seguro de Clip.");
    }catch(e:any){showError(e,"No fue posible iniciar el formulario de Clip.");}};
    if(existing){if(window.ClipSDK)init();else existing.addEventListener("load",init,{once:true});}
    else{const s=document.createElement("script");s.src="https://sdk.clip.mx/js/clip-sdk.js";s.async=true;s.dataset.clipSdk="true";s.onload=init;s.onerror=()=>setMessage("No fue posible cargar el SDK de Clip.");document.head.appendChild(s);}
  })()},[orderId,router]);

  useEffect(()=>{
    if(!challenge||!orderId)return;
    const expectedOrigin=new URL(challenge.url).origin;
    const verify=async(paymentId:string)=>{
      const sb=supabaseBrowser();
      for(let attempt=0;attempt<8;attempt++){
        const {data,error}=await sb.functions.invoke("check-clip-test-payment",{body:{orderId,paymentId}});
        if(!error&&data?.ok){
          if(data.approved){setChallenge(null);setMessage("Pago de prueba aprobado. Actualizando pedido...");router.replace(`/pago/resultado?order=${orderId}`);return;}
          if(String(data.status).toLowerCase()==="rejected"){setChallenge(null);setBusy(false);setMessage(extractMessage(data.detail)||"El pago fue rechazado.");return;}
        }
        await new Promise(resolve=>setTimeout(resolve,1000));
      }
      setChallenge(null);setBusy(false);setMessage("La autenticación terminó, pero el pago sigue en proceso. Puedes revisar el pedido en unos momentos.");
    };
    const onMessage=(event:MessageEvent)=>{
      if(event.origin!==expectedOrigin)return;
      const returnedPaymentId=event.data?.paymentId;
      if(returnedPaymentId&&String(returnedPaymentId)===String(challenge.paymentId)) verify(String(returnedPaymentId));
    };
    window.addEventListener("message",onMessage);
    return()=>window.removeEventListener("message",onMessage);
  },[challenge,orderId,router]);

  async function pay(e:any){
    e.preventDefault(); if(!cardRef.current||!orderId)return;
    setBusy(true); setMessage("Tokenizando tarjeta con Clip...");
    try{
      const cardToken=await cardRef.current.cardToken(); const cardTokenId=cardToken?.id;
      if(!cardTokenId||typeof cardTokenId!=="string")throw new Error(extractMessage(cardToken)||"Respuesta de Clip sin Card Token ID.");
      const sb=supabaseBrowser(); const {data,error}=await sb.functions.invoke("process-clip-test-payment",{body:{orderId,cardToken:cardTokenId}});
      if(error){let body:any=null;try{body=await error.context?.clone?.().json();}catch{}throw new Error(extractMessage(body)||extractMessage(error)||"No fue posible procesar el pago de prueba.");}
      if(!data?.ok)throw new Error(extractMessage(data?.error)||extractMessage(data?.detail)||"El pago fue rechazado.");
      if(data.approved){setMessage("Pago de prueba aprobado. Actualizando pedido...");setTimeout(()=>router.replace(`/pago/resultado?order=${orderId}`),800);return;}
      const actionUrl=data?.action_url||data?.pending_action?.url;
      const paymentId=data?.payment_id;
      if(typeof actionUrl==="string"&&/^https:\/\//i.test(actionUrl)&&typeof paymentId==="string"){
        setMessage("Completa la autenticación segura 3D Secure.");
        setChallenge({url:actionUrl,paymentId});
        return;
      }
      const detail=extractMessage(data?.detail)||extractMessage(data?.status)||"sin estado";
      setMessage(`Pago no aprobado: ${detail}`); setBusy(false);
    }catch(err:any){const detail=extractMessage(err);setMessage(detail&&detail!=="[object Object]"?detail:"No fue posible procesar el pago de prueba.");setBusy(false);}
  }

  return <main className="wrap"><section className="panel center"><h1 className="brand">La Comarca</h1><h2>Pago con Clip · Pruebas</h2>{total!==null&&<p className="price">${total.toLocaleString("es-MX",{minimumFractionDigits:2})} MXN</p>}<p className="muted">{message}</p><form onSubmit={pay}><div id="clip-checkout" style={{margin:"20px auto",maxWidth:520}}></div><button className="btn" disabled={!ready||busy} style={{width:"100%"}}>{busy?"Procesando...":"Pagar en modo prueba"}</button></form><button className="btn2" style={{marginTop:12}} onClick={()=>router.push("/cuenta")}>Cancelar y ver mi cuenta</button></section>{challenge&&<div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,.78)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}><div style={{width:"min(900px,100%)",height:"min(900px,100%)",background:"white",borderRadius:12,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}><iframe title="Autenticación segura 3D" src={challenge.url} style={{width:"100%",height:"100%",border:0}} /></div></div>}</main>;
}
export default function PagoPrueba(){return <Suspense fallback={<main className="wrap"><section className="panel center"><p className="muted">Cargando pago...</p></section></main>}><PagoPruebaContenido/></Suspense>;}
