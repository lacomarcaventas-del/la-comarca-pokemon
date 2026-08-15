"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../../lib/supabase";

type Order={id:string;created_at:string;status:string;total:number};
type Item={order_id:string;quantity:number;unit_price:number;cards?:{name:string}|null};

const statusLabel:Record<string,string>={pending:"Pendiente",confirmed:"Confirmado",paid:"Pagado",preparing:"Preparando",shipped:"Enviado",completed:"Completado",cancelled:"Cancelado"};

export default function Cuenta(){
 const router=useRouter();
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [user,setUser]=useState<any>(null);
 const [orders,setOrders]=useState<Order[]>([]);
 const [items,setItems]=useState<Item[]>([]);
 const [busy,setBusy]=useState(true);
 const [err,setErr]=useState("");
 const sb=supabaseBrowser();

 useEffect(()=>{loadUser();},[]);
 async function loadUser(){
  setBusy(true);setErr("");
  const {data}=await sb.auth.getUser();
  if(data.user){setUser(data.user);await loadOrders(data.user.id);}
  setBusy(false);
 }
 async function loadOrders(uid:string){
  const {data,error}=await sb.from("orders").select("id,created_at,status,total").eq("customer_id",uid).order("created_at",{ascending:false});
  if(error){setErr(error.message);return;}
  const rows=(data||[]) as Order[];setOrders(rows);
  if(rows.length){
   const {data:itemData,error:itemError}=await sb.from("order_items").select("order_id,quantity,unit_price,cards(name)").in("order_id",rows.map(o=>o.id));
   if(!itemError)setItems((itemData||[]) as any);
  }else setItems([]);
 }
 async function login(e:any){
  e.preventDefault();setBusy(true);setErr("");
  const {data,error}=await sb.auth.signInWithPassword({email,password});
  if(error){setErr(error.message);setBusy(false);return;}
  if(data.user){setUser(data.user);await loadOrders(data.user.id);}
  setBusy(false);
 }
 async function logout(){await sb.auth.signOut();setUser(null);setOrders([]);setItems([]);}
 if(busy&&!user)return <main className="wrap"><div className="empty">Verificando cuenta...</div></main>;
 return <main className="wrap">
  <div className="panel accountHead"><div><h1 className="brand">Mi cuenta</h1><p className="muted">Consulta tus pedidos y su estado.</p></div><div className="actions"><button className="btn2" onClick={()=>router.push("/catalogo")}>← Catálogo</button>{user&&<button className="btn2" onClick={logout}>Cerrar sesión</button>}</div></div>
  {!user?<div className="panel center"><h2>Acceso de clientes</h2><p className="muted">Entra para consultar tu historial de pedidos.</p><form onSubmit={login}><label>Correo</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label>Contraseña</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn" style={{width:"100%",marginTop:14}} disabled={busy}>{busy?"Entrando...":"Entrar como cliente"}</button></form>{err&&<p className="notice">{err}</p>}<p className="muted" style={{marginTop:16}}>¿Eres administrador? <a href="/login" style={{fontWeight:800,color:"#174ea6"}}>Entrar a Administración</a></p></div>:<>
   <div className="panel"><div className="notice">Sesión activa: {user.email}</div>{err&&<p className="notice">{err}</p>}</div>
   <div className="panel"><h2>Mis pedidos</h2>{orders.length?orders.map(o=><article className="panel" key={o.id}><div className="row"><div><b>Folio {o.id.slice(0,8).toUpperCase()}</b><div className="muted">{new Date(o.created_at).toLocaleString("es-MX")}</div></div><div><b>{statusLabel[o.status]||o.status}</b><div className="price">${Number(o.total).toLocaleString("es-MX")} MXN</div></div></div><div style={{marginTop:12}}>{items.filter(i=>i.order_id===o.id).map((i,n)=><div className="muted" key={`${o.id}-${n}`}>{i.quantity} × {i.cards?.name||"Producto"} · ${Number(i.unit_price).toLocaleString("es-MX")} c/u</div>)}</div></article>):<div className="empty">Aún no tienes pedidos registrados.</div>}</div>
  </>}
 </main>;
}
