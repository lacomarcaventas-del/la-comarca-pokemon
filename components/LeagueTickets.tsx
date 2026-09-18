"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../lib/supabase";

type Card={id:string;name:string;language:string;condition:string;image_url:string|null;price:number;stock:number;category_id:string|null};
type CartItem={card:Card;qty:number};
type ShippingKey="mexpost"|"fedex"|"pickup";

const TICKET_IDS=[
  "6973b0c3-8e99-4fac-9a83-f79c3806b4e0",
  "3ac22dc8-eb4c-4fca-8e20-468e719ffd15",
  "0012f413-216e-474d-aaff-2992b615c651",
];

const displayName=(card:Card)=>card.id===TICKET_IDS[2]?"Entrada a la Liga – HeroClix":card.name;

export default function LeagueTickets(){
  const router=useRouter();
  const sb=supabaseBrowser();
  const [cards,setCards]=useState<Card[]>([]);
  const [cart,setCart]=useState<CartItem[]>([]);
  const [open,setOpen]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [user,setUser]=useState<any>(null);

  useEffect(()=>{
    load();
    (async()=>{const {data}=await sb.auth.getUser();setUser(data.user||null)})();
  },[]);

  async function load(){
    setLoading(true);setError("");
    const {data,error}=await sb.from("cards").select("id,name,language,condition,image_url,price,stock,category_id").in("id",TICKET_IDS).eq("published",true).gt("stock",0);
    if(error){setError(error.message);setCards([])}
    else{
      const rows=(data||[]) as Card[];
      setCards(TICKET_IDS.map(id=>rows.find(c=>c.id===id)).filter(Boolean) as Card[]);
    }
    setLoading(false);
  }

  function add(card:Card){
    if(!user){window.alert("Necesitas una cuenta de cliente para comprar. Regístrate o inicia sesión para continuar.");router.push("/cuenta");return}
    setCart(old=>{const found=old.find(i=>i.card.id===card.id);if(found)return old.map(i=>i.card.id===card.id?{...i,qty:Math.min(i.qty+1,card.stock)}:i);return [...old,{card,qty:1}]});
  }
  function updateQty(id:string,qty:number){setCart(old=>old.map(i=>i.card.id===id?{...i,qty:Math.max(1,Math.min(Math.floor(qty)||1,i.card.stock))}:i))}
  function removeItem(id:string){setCart(old=>old.filter(i=>i.card.id!==id))}

  const total=cart.reduce((sum,i)=>sum+Number(i.card.price)*i.qty,0);

  return <>
    <header className="top"><a href="/">← La Comarca</a><b>La Comarca · Tickets</b><a href="/cuenta">👤 Clientes</a></header>
    <main className="wrap">
      <section className="center" style={{marginBottom:28,paddingTop:18}}>
        <div className="muted" style={{letterSpacing:".18em",textTransform:"uppercase",fontSize:11}}>Compra anticipada</div>
        <h1 style={{margin:"8px 0 6px"}}>Entradas a las Ligas</h1>
        <p className="muted" style={{margin:0}}>Elige tu liga y asegura tu lugar · $150 MXN por entrada</p>
      </section>
      {error&&<div className="panel">{error}</div>}
      {loading?<div className="empty">Cargando tickets...</div>:<div className="grid">{cards.map(card=><article className="card" key={card.id}>
        <div className="cardImage"><img src={card.image_url||"/placeholder.svg"} alt={displayName(card)}/></div>
        <div className="info"><b>{displayName(card)}</b><div className="muted">Entrada a la liga · ${Number(card.price).toLocaleString("es-MX")} MXN</div><div className="stock">{card.stock} disponible(s)</div><button className="btn" style={{width:"100%",marginTop:10}} onClick={()=>add(card)}>Agregar al carrito</button></div>
      </article>)}</div>}
      {!loading&&!cards.length&&<div className="empty">Los tickets no están disponibles en este momento.</div>}
      <button className="cart" onClick={()=>{if(!user){window.alert("Necesitas una cuenta de cliente para comprar. Regístrate o inicia sesión para continuar.");router.push("/cuenta");return}setOpen(true)}}>🛒 Carrito ({cart.reduce((sum,x)=>sum+x.qty,0)})</button>
    </main>
    {open&&<div className="modal"><div className="modalbox"><h2>Tu carrito</h2>
      {cart.length?cart.map(item=><div className="panel" key={item.card.id}><div className="row"><div><b>{displayName(item.card)}</b><div className="muted">${Number(item.card.price).toLocaleString("es-MX")} c/u · máximo {item.card.stock}</div><div className="actions" style={{marginTop:8,alignItems:"center"}}><button type="button" className="btn2" onClick={()=>updateQty(item.card.id,item.qty-1)} disabled={item.qty<=1}>−</button><input aria-label={`Cantidad de ${displayName(item.card)}`} type="number" min="1" max={item.card.stock} value={item.qty} onChange={e=>updateQty(item.card.id,Number(e.target.value))} style={{width:70,textAlign:"center"}}/><button type="button" className="btn2" onClick={()=>updateQty(item.card.id,item.qty+1)} disabled={item.qty>=item.card.stock}>+</button></div></div><button className="danger" onClick={()=>removeItem(item.card.id)}>Quitar</button></div></div>):<div className="empty">Carrito vacío.</div>}
      <h3>Total de productos: ${total.toLocaleString("es-MX")} MXN</h3>
      {cart.length>0&&<OrderForm cart={cart} onDone={()=>{setCart([]);setOpen(false);load()}}/>}
      <button className="btn2" onClick={()=>setOpen(false)}>Cerrar</button>
    </div></div>}
  </>;
}

function OrderForm({cart,onDone}:{cart:CartItem[];onDone:()=>void}){
  const [notes,setNotes]=useState("");
  const [shipping,setShipping]=useState<ShippingKey>("mexpost");
  const [busy,setBusy]=useState(false);
  const [msg,setMsg]=useState("");
  const shippingOptions={mexpost:{method:"Mexpost 3 kg",cost:200,label:"Mexpost · 3 kg",detail:"Incluye tracking y seguro"},fedex:{method:"FedEx 3 kg",cost:380,label:"FedEx · 3 kg",detail:"Incluye tracking y seguro"},pickup:{method:"Recoger en tienda",cost:0,label:"Recoger en tienda",detail:"Sin costo de envío. Pago únicamente por tus productos."}} as const;
  const selected=shippingOptions[shipping];
  const productsTotal=cart.reduce((sum,i)=>sum+Number(i.card.price)*i.qty,0);
  const grandTotal=productsTotal+selected.cost;

  async function send(e:any){
    e.preventDefault();setBusy(true);setMsg("");
    try{
      const sb=supabaseBrowser();
      const {data:u}=await sb.auth.getUser();
      if(!u.user)throw new Error("Necesitas una cuenta de cliente para crear un pedido.");
      const {data:profile,error:profileError}=await sb.from("profiles").select("phone,email,shipping_address,shipping_city,shipping_state,shipping_postal_code,shipping_country,username").eq("id",u.user.id).single();
      if(profileError||!profile)throw new Error("No fue posible cargar tus datos de envío. Actualiza tu cuenta.");
      if(!profile.phone)throw new Error("Tu cuenta no tiene completo el número de contacto.");
      if(shipping!=="pickup"&&(!profile.shipping_address||!profile.shipping_city||!profile.shipping_state||!profile.shipping_postal_code))throw new Error("Tu cuenta no tiene completos los datos obligatorios de contacto y envío.");
      const name=u.user.user_metadata?.full_name||profile.username||"Cliente";
      const email=u.user.email||profile.email||"";
      const items=cart.map(i=>({card_id:i.card.id,quantity:i.qty}));
      const {data:order,error:orderError}=await sb.rpc("create_order_with_items",{p_customer_name:name,p_customer_email:email||null,p_customer_phone:profile.phone,p_notes:notes||null,p_items:items,p_shipping_method:shipping,p_shipping_cost:selected.cost});
      if(orderError||!order)throw new Error(orderError?.message||"No fue posible crear el pedido");
      await sb.functions.invoke("send-order-confirmation",{body:{order:{id:order,customer_name:name,customer_phone:profile.phone,customer_email:email,shipping_address:profile.shipping_address,shipping_city:profile.shipping_city,shipping_state:profile.shipping_state,shipping_postal_code:profile.shipping_postal_code,shipping_country:profile.shipping_country||"México",shipping_method:selected.method,shipping_cost:selected.cost,notes,total:grandTotal,items:cart.map(i=>({name:displayName(i.card),quantity:i.qty,unit_price:i.card.price}))}}});
      setMsg("Pedido creado. Redirigiendo a Clip...");
      const {data:clip,error:clipError}=await sb.functions.invoke("create-clip-checkout",{body:{orderId:order}});
      if(clipError||!clip?.checkout_url)throw new Error(clipError?.message||clip?.error||"No fue posible iniciar el pago con Clip");
      window.location.assign(clip.checkout_url);
    }catch(err:any){setMsg(err?.message||"Ocurrió un error al procesar el pedido.");setBusy(false)}
  }

  return <form onSubmit={send} className="panel"><h3>Confirmar y pagar</h3><p className="muted">Usaremos automáticamente tus datos de contacto y envío.</p><div style={{display:"grid",gap:10,margin:"14px 0"}}>{Object.entries(shippingOptions).map(([key,opt])=><label key={key} className="panel" style={{display:"block",cursor:"pointer",margin:0,border:shipping===key?"1px solid #e07a25":undefined}}><input type="radio" name="shipping" value={key} checked={shipping===key} onChange={e=>setShipping(e.currentTarget.value as ShippingKey)} style={{marginRight:8}}/><b>{opt.label} — ${opt.cost} MXN</b><div className="muted" style={{marginTop:4,marginLeft:24}}>{opt.detail}</div></label>)}</div><div className="panel" style={{margin:"12px 0"}}><div className="muted">Productos: ${productsTotal.toLocaleString("es-MX")} MXN</div><div className="muted">Entrega ({selected.method}): ${selected.cost.toLocaleString("es-MX")} MXN</div><b>Total a pagar: ${grandTotal.toLocaleString("es-MX")} MXN</b></div><label>Notas</label><textarea value={notes} onChange={e=>setNotes(e.target.value)}/><button type="submit" className="btn" disabled={busy}>{busy?"Preparando pago...":`Pagar ${grandTotal.toLocaleString("es-MX")} MXN con Clip`}</button>{msg&&<p>{msg}</p>}</form>;
}
