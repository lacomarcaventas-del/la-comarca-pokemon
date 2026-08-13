"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {supabaseBrowser} from "../../lib/supabase";
import ExcelCatalog from "../../components/ExcelCatalog";
export default function ExcelPage(){const [ok,setOk]=useState(false);const router=useRouter();const sb=supabaseBrowser();useEffect(()=>{(async()=>{const {data:u}=await sb.auth.getUser();if(!u.user){router.replace('/login');return}const {data:p}=await sb.from('profiles').select('role').eq('id',u.user.id).maybeSingle();if(p?.role!=='admin'){router.replace('/login');return}setOk(true)})()},[]);if(!ok)return <main className="wrap"><div className="empty">Verificando acceso...</div></main>;return <><header className="top"><a href="/admin">← Administración</a><b>La Comarca · Excel</b></header><main className="wrap"><ExcelCatalog/></main></>}
