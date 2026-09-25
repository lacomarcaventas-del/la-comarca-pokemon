"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../lib/supabase";

type Card={id:string;name:string;language:string;condition:string;image_url:string|null;price:number;stock:number;category_id:string|null};
type CartItem={card:Card;qty:number};
type ShippingKey="mexpost"|"fedex"|"pickup";

const TICKET_IDS=["6973b0c3-8e99-4fac-9a83-f79c3806b4e0","3ac22dc8-eb4c-4fca-8e20-468e719ffd15","0012f413-216e-474d-aaff-2992b615c651"];
const displayName=(card:Card)=>card.id===TICKET_IDS[2]?"Entrada a la Liga – HeroClix":card.name;
export default function LeagueTickets(){return null;}