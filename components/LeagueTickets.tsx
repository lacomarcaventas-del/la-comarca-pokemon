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
    <main className="wrap">...REPLACED...