"use client";
import {Suspense,useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import {supabaseBrowser} from "../../../lib/supabase";

function PagoResultadoContenido(){
  const q=useSearchParams();
  const orderId=q.get("order");
  const [status,setStatus]=useState("Verificando pago...");
  const [detail,setDetail]=useState("Estamos confirmando el estado de tu pedido.");

  useEffect(()=>{
    let timer:any;
    async function check(){
      if(!orderId){
        setStatus("Pago sin referencia");
        setDetail("No encontramos el pedido asociado al pago.");
        return;
      }
      const sb=supabaseBrowser();
      const {data,error}=await sb.from("orders").select("status,payment_provider,payment_completed_at").eq("id",orderId).single();
      if(error){
        setStatus("No fue posible consultar el pedido");
        setDetail("Puedes revisar el estado desde Mi cuenta.");
        return;
      }
      if(data.status==="paid"){
        setStatus("¡Pago confirmado!");
        setDetail("Tu pedido fue pagado correctamente y ya está siendo procesado.");
        clearInterval(timer);
      }else if(data.status==="cancelled"){
        setStatus("Pago cancelado");
        setDetail("El pedido fue cancelado o el pago no pudo completarse.");
        clearInterval(timer);
      }else{
        setStatus("Pago en verificación");
        setDetail("Clip todavía está confirmando el resultado. Esta página se actualizará automáticamente.");
      }
    }
    check();
    timer=setInterval(check,3000);
    return()=>clearInterval(timer);
  },[orderId]);

  return <main className="wrap"><section className="panel center"><h1 className="brand">La Comarca</h1><h2>{status}</h2><p className="muted">{detail}</p>{orderId&&<p className="notice">Pedido: {orderId.slice(0,8).toUpperCase()}</p>}<div className="actions" style={{justifyContent:"center",marginTop:18}}><a className="btn" href="/cuenta">Ver mi pedido</a><a className="btn2" href="/catalogo">Volver al catálogo</a></div></section></main>;
}

export default function PagoResultado(){
  return <Suspense fallback={<main className="wrap"><section className="panel center"><h1 className="brand">La Comarca</h1><p className="muted">Cargando resultado del pago...</p></section></main>}><PagoResultadoContenido/></Suspense>;
}
