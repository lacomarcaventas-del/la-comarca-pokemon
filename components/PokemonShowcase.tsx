"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";
import { supabaseBrowser } from "../lib/supabase";

type PokemonCard = { id: string; name: string; card_number: string | null; image_url: string | null; category_id: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase();
const HIDDEN_PRODUCTS = new Set(["producto al azar", "producto al azar 1", "producto al azar 2"]);
const CATALOG_URL = "/catalogo?categoria=" + encodeURIComponent("Pokémon TCG");

export default function PokemonShowcase() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState<PokemonCard | null>(null);

  useEffect(() => {
    let active = true;
    async function loadShowcase() {
      setLoading(true); setError("");
      try {
        const supabase = supabaseBrowser();
        const { data: categories, error: categoryError } = await supabase.from("categories").select("id,name");
        if (categoryError) throw categoryError;
        const ids = (categories || []).filter((c: {id:string;name:string}) => normalize(c.name).includes("pokemon")).map((c: {id:string}) => c.id);
        if (!ids.length) { if (active) setCards([]); return; }
        const pageSize = 1000; let from = 0; let available: PokemonCard[] = [];
        while (true) {
          const { data, error: cardsError } = await supabase.from("cards").select("id,name,card_number,image_url,category_id").eq("published", true).gt("stock", 0).in("category_id", ids).order("name").range(from, from + pageSize - 1);
          if (cardsError) throw cardsError;
          const page = (data || []) as PokemonCard[]; available = available.concat(page);
          if (page.length < pageSize) break; from += pageSize;
        }
        if (active) setCards(available.filter(c => !HIDDEN_PRODUCTS.has(normalize(c.name || ""))));
      } catch (cause) {
        console.error("No fue posible cargar la exhibición Pokémon", cause);
        if (active) setError("No pudimos cargar las cartas en este momento. Intenta nuevamente.");
      } finally { if (active) setLoading(false); }
    }
    loadShowcase(); return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setViewer(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [viewer]);

  const filteredCards = useMemo(() => {
    const term = normalize(search);
    return term ? cards.filter(c => normalize(`${c.name} ${c.card_number || ""}`).includes(term)) : cards;
  }, [cards, search]);

  return (
    <div className="siteShell pokemonLanding">
      <section className="shippingHero" aria-label="Envíos a todo México">
        <div className="shippingInner"><div className="shippingLead"><strong>ENVIAMOS A<br/>TODO EL PAÍS</strong></div><div className="shippingRoute"><span className="routeLine"/><i>◆</i><i>◆</i><i>◆</i></div><div className="carrier mexpost"><b>▰ MEXPOST</b><span>3–5 días hábiles<br/>Cobertura nacional</span></div><div className="carrier fedex"><b><em>Fed</em>Ex</b><span>3 días hábiles<br/>Rápido y seguro</span></div></div>
      </section>
      <header className="top siteTop">
        <Link href="/" className="logoLink"><BrandLogo/></Link>
        <nav className="mainNav navPills" aria-label="Navegación principal"><Link href="/catalogo">Catálogo</Link><Link href="/tickets">Ligas</Link><Link href="/#comunidad">Comunidad</Link><Link href="/eventos">Eventos</Link></nav>
        <div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div>
      </header>

      <main>
        <section className="pkmAdHero">
          <div className="pkmAdGlow"/>
          <div className="pkmAdCopy">
            <span className="pkmEyebrow">LA COMARCA · POKÉMON TCG</span>
            <h1>Encuentra esa<br/><em>carta que buscas.</em></h1>
            <p>Explora nuestra galería de cartas Pokémon disponibles. Descubre, amplía las imágenes y encuentra tu próxima pieza de colección.</p>
            <div className="pkmHeroActions"><a href="#galeria" className="pkmButton pkmButtonGold">EXPLORAR GALERÍA <span>↓</span></a><Link href={CATALOG_URL} className="pkmTextLink">IR A COMPRAR ↗</Link></div>
            <small className="pkmAvailability">✦ Galería conectada a existencias de La Comarca</small>
          </div>
          <div className="pkmHeroVisual" aria-hidden="true"><div className="pkmHalo"/><div className="pkmBall"><span/></div><b>DESCUBRE · COLECCIONA · JUEGA</b></div>
        </section>

        <section className="pkmGallery wrap" id="galeria">
          <div className="pkmGalleryHead"><div><span className="pkmSectionTag">GALERÍA DE COLECCIONISMO</span><h2>Pokémon disponibles<span>.</span></h2><p>Una muestra de las cartas que puedes encontrar en nuestro catálogo.</p></div><div className="pkmTotal"><strong>{loading ? "—" : cards.length.toLocaleString("es-MX")}</strong><span>CARTAS<br/>DISPONIBLES</span></div></div>
          <div className="pkmToolbar"><label className="pkmSearch"><span>⌕</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Busca por Pokémon o número de carta…" aria-label="Buscar cartas Pokémon"/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">×</button>}</label><small>{loading ? "Cargando galería…" : search ? `${filteredCards.length} resultados` : "Explora la galería"}</small></div>
          {loading ? <div className="pkmState"><span className="pkmLoader"/>Cargando cartas disponibles…</div> : error ? <div className="pkmState" role="alert">{error}<button onClick={() => window.location.reload()}>Reintentar</button></div> : filteredCards.length ? <div className="pkmGrid">{filteredCards.map((card, i) => <article className="pkmCard" key={card.id}><button type="button" className="pkmImageButton" onClick={() => setViewer(card)} aria-label={`Ampliar ${card.name}`}><span className="pkmIndex">{String(i+1).padStart(2,"0")}</span><img src={card.image_url || "/placeholder.svg"} alt={card.name} loading="lazy" decoding="async" onError={e => {e.currentTarget.src="/placeholder.svg";}}/><span className="pkmZoom">⌕ Ampliar</span></button><div className="pkmCardInfo"><strong title={card.name}>{card.name}</strong><small>{card.card_number || "Pokémon TCG"}</small></div></article>)}</div> : <div className="pkmState"><strong>{search ? "No encontramos esa carta" : "La galería se está preparando"}</strong><span>{search ? "Prueba con otro nombre o número." : "Pronto habrá nuevas cartas disponibles."}</span>{search && <button onClick={() => setSearch("")}>Ver toda la galería</button>}</div>}
        </section>

        <section className="pkmShopBanner"><div><span className="pkmSectionTag">¿YA ENCONTRASTE TU FAVORITA?</span><h2>Ahora sí, vamos<br/><em>a conseguirla.</em></h2><p>Consulta precios, detalles y disponibilidad en el catálogo de compra de La Comarca.</p><Link href={CATALOG_URL} className="pkmButton pkmButtonGold">VER CATÁLOGO Y COMPRAR <span>↗</span></Link></div><div className="pkmBannerSeal" aria-hidden="true">LA<br/><b>COMARCA</b><small>TCG & HOBBY</small></div></section>
      </main>
      <footer className="siteFooter"><BrandLogo/><span>La Comarca · TCG · Juegos · Coleccionismo · Hobby</span></footer>

      {viewer && <div className="pkmViewer" role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${viewer.name}`} onClick={() => setViewer(null)}><button type="button" className="pkmViewerClose" onClick={() => setViewer(null)} aria-label="Cerrar">×</button><div className="pkmViewerContent" onClick={e => e.stopPropagation()}><img src={viewer.image_url || "/placeholder.svg"} alt={viewer.name}/><strong>{viewer.name}</strong><small>{viewer.card_number || "Pokémon TCG"}</small><Link href={CATALOG_URL} className="pkmButton pkmButtonGold">VER EN CATÁLOGO Y COMPRAR ↗</Link></div></div>}

      <style jsx>{`
        .pokemonLanding{min-height:100vh;background:transparent;color:#f7f1e5}
        .pkmAdHero{position:relative;overflow:hidden;min-height:440px;padding:64px clamp(22px,8vw,120px);display:grid;grid-template-columns:1.15fr .85fr;align-items:center;background:radial-gradient(circle at 78% 48%,#1e4262 0,transparent 32%),linear-gradient(112deg,#090f1a,#101b2b 55%,#1c1110);border-bottom:1px solid #70451f}
        .pkmAdGlow{position:absolute;inset:0;opacity:.18;background-image:radial-gradient(#e9b75e 1px,transparent 1px);background-size:23px 23px;mask-image:linear-gradient(90deg,transparent,#000)}
        .pkmAdCopy{position:relative;z-index:2;max-width:650px}.pkmEyebrow,.pkmSectionTag{color:#efb65e;font-size:10px;font-weight:900;letter-spacing:.2em}
        .pkmAdHero h1{font-size:clamp(43px,6vw,76px);line-height:.98;letter-spacing:-.055em;margin:18px 0;color:#fff8eb;font-weight:950}.pkmAdHero h1 em,.pkmShopBanner h2 em{font-family:Georgia,serif;color:#f0b45b;font-weight:500}
        .pkmAdCopy p{max-width:520px;color:#c1c9d4;font-size:14px;line-height:1.8;margin:0}
        .pkmHeroActions{display:flex;align-items:center;gap:25px;margin-top:26px}.pkmButton{display:inline-flex;align-items:center;justify-content:center;gap:15px;padding:14px 20px;border-radius:9px;font-size:10px;font-weight:950;letter-spacing:.09em;transition:.2s}.pkmButton:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .pkmButtonGold{background:linear-gradient(120deg,#f3c46e,#d88a32);color:#17100a;box-shadow:0 8px 25px #d88a3230}.pkmButton span{font-size:15px}
        .pkmTextLink{font-size:11px;font-weight:900;color:#f2d6a8;border-bottom:1px solid #a17b48;padding-bottom:7px}
        .pkmAvailability{display:block;margin-top:25px;color:#9ba9b9;font-size:10px;letter-spacing:.04em}
        .pkmHeroVisual{height:300px;position:relative;display:flex;align-items:center;justify-content:center}.pkmHalo{position:absolute;width:290px;height:290px;border-radius:50%;background:radial-gradient(circle,#e8b34b2c,transparent 68%);border:1px solid #e8b34b22}
        .pkmBall{width:205px;height:205px;border-radius:50%;position:relative;background:linear-gradient(to bottom,#d83b42 0 47%,#111b29 47% 54%,#e8e7df 54%);border:10px solid #080e17;box-shadow:0 25px 60px #0009,inset 0 0 0 2px #ffffff50;transform:rotate(-13deg)}
        .pkmBall:before{content:"";position:absolute;inset:0 0 50%;border-radius:100px 100px 0 0;background:linear-gradient(145deg,#fa6860,#bd2738)}
        .pkmBall span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:65px;height:65px;border:8px solid #111b29;border-radius:50%;background:#e9e9e2;box-shadow:0 0 0 3px #f2f0e9}
        .pkmHeroVisual>b{position:absolute;bottom:12px;color:#d3b16b;font-size:9px;letter-spacing:.22em}
        .pkmGallery{padding-top:64px;padding-bottom:70px}.pkmGalleryHead{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:28px}
        .pkmGalleryHead h2{font-family:'Cinzel',Georgia,serif;color:#f3d19b;font-size:clamp(27px,4vw,40px);margin:10px 0 6px}.pkmGalleryHead h2 span{color:#e87928}.pkmGalleryHead p{margin:0;color:#a6adb8;font-size:12px}
        .pkmTotal{display:flex;align-items:center;gap:12px;padding-left:18px;border-left:1px solid #61462d}.pkmTotal strong{font-size:34px;color:#f0b45b}.pkmTotal span{font-size:8px;line-height:1.5;letter-spacing:.12em;color:#a6adb8;font-weight:900}
        .pkmToolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-top:1px solid #493725;border-bottom:1px solid #493725;margin-bottom:24px}.pkmSearch{width:min(100%,490px);height:44px;display:flex;align-items:center;gap:10px;padding:0 13px;border:1px solid #55432f;border-radius:10px;background:#101923}.pkmSearch:focus-within{border-color:#d99543;box-shadow:0 0 0 3px #d9954320}.pkmSearch>span{font-size:24px;color:#e7ad58}.pkmSearch input{border:0!important;background:transparent!important;padding:0!important;font-size:12px}.pkmSearch button{padding:3px 8px;border-radius:50%;background:#283341}.pkmToolbar>small{color:#929ba7;font-size:10px;letter-spacing:.1em;text-transform:uppercase}
        .pkmGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px}.pkmCard{min-width:0;overflow:hidden;border:1px solid #443525;border-radius:13px;background:linear-gradient(145deg,#121d2a,#0b111a);transition:transform .2s,border-color .2s,box-shadow .2s}.pkmCard:hover{transform:translateY(-4px);border-color:#b77c38;box-shadow:0 15px 32px #0005}
        .pkmImageButton{position:relative;width:100%;aspect-ratio:5/6.7;padding:10px!important;border:0!important;border-radius:0!important;background:radial-gradient(circle,#263445,#101721)!important;display:flex;align-items:center;justify-content:center;overflow:hidden}.pkmImageButton img{width:100%;height:100%;object-fit:contain;display:block}.pkmIndex{position:absolute;z-index:1;top:9px;left:10px;color:#f0b45b;font-size:9px;font-weight:900;letter-spacing:.12em}.pkmZoom{position:absolute;bottom:9px;right:9px;padding:6px 9px;border-radius:6px;background:#080e17d9;color:#f1d49d;font-size:9px;opacity:0;transition:opacity .2s}.pkmCard:hover .pkmZoom{opacity:1}
        .pkmCardInfo{padding:11px 12px 13px;display:flex;flex-direction:column;gap:5px}.pkmCardInfo strong{font-size:12px;color:#f4eee3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pkmCardInfo small{font-size:10px;color:#9da6b2}
        .pkmState{min-height:180px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#b4bdc9;font-size:13px;text-align:center}.pkmState button{margin-top:5px}.pkmLoader{width:26px;height:26px;border:2px solid #4a3927;border-top-color:#f0b45b;border-radius:50%;animation:pkmSpin .8s linear infinite}@keyframes pkmSpin{to{transform:rotate(360deg)}}
        .pkmShopBanner{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:30px;padding:50px clamp(24px,9vw,130px);background:radial-gradient(circle at 80% 40%,#57371e 0,transparent 25%),linear-gradient(110deg,#20150f,#101a28);border-top:1px solid #5d422a;border-bottom:1px solid #5d422a}.pkmShopBanner h2{font-family:'Cinzel',Georgia,serif;font-size:clamp(32px,4vw,48px);line-height:1.08;color:#fff;margin:12px 0}.pkmShopBanner p{max-width:500px;color:#c0c4cb;font-size:12px;line-height:1.7;margin:0 0 22px}
        .pkmBannerSeal{width:150px;height:150px;flex:none;border:1px solid #b17a3d;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#f0b45b;font-family:'Cinzel',Georgia,serif;font-size:18px;line-height:1.1;transform:rotate(-10deg);box-shadow:0 0 0 9px #b17a3d12,0 0 40px #d58b3320}.pkmBannerSeal b{font-size:20px}.pkmBannerSeal small{font:700 8px 'DM Sans',sans-serif;letter-spacing:.18em;margin-top:6px}
        .pkmViewer{position:fixed;inset:0;z-index:100;background:#02050beF;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto}.pkmViewerClose{position:fixed;right:20px;top:14px;font-size:30px;background:#202a38;color:white;z-index:2}.pkmViewerContent{display:flex;align-items:center;flex-direction:column;gap:10px;max-width:min(520px,94vw);max-height:92vh}.pkmViewerContent img{max-height:68vh;max-width:100%;object-fit:contain}.pkmViewerContent strong{color:#fff;font-size:16px}.pkmViewerContent small{color:#aeb8c4}.pkmViewerContent .pkmButton{margin-top:8px}
        @media(max-width:1050px){.pkmGrid{grid-template-columns:repeat(4,minmax(0,1fr))}.pkmAdHero{padding-left:5vw;padding-right:5vw}}
        @media(max-width:700px){.pkmAdHero{grid-template-columns:1fr;padding:42px 20px 24px;min-height:0}.pkmAdHero h1{font-size:46px}.pkmHeroVisual{height:210px;margin-top:10px}.pkmBall{width:145px;height:145px}.pkmBall span{width:48px;height:48px}.pkmHeroVisual>b{bottom:0;font-size:8px}.pkmGallery{padding:42px 14px 48px}.pkmGalleryHead{align-items:flex-start}.pkmGalleryHead h2{font-size:27px}.pkmGalleryHead p{max-width:230px;line-height:1.5}.pkmTotal{padding-left:10px;gap:7px}.pkmTotal strong{font-size:25px}.pkmTotal span{font-size:7px}.pkmToolbar{align-items:flex-start;flex-direction:column}.pkmSearch{width:100%}.pkmGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.pkmCardInfo{padding:9px}.pkmCardInfo strong{font-size:11px}.pkmShopBanner{padding:36px 20px;gap:14px}.pkmBannerSeal{width:82px;height:82px;font-size:10px}.pkmBannerSeal b{font-size:11px}.pkmBannerSeal small{font-size:5px}.pkmShopBanner h2{font-size:31px}.pkmShopBanner p{font-size:11px}.pkmHeroActions{gap:15px;flex-wrap:wrap}.pkmButton{padding:13px 14px;font-size:9px}}
        @media(prefers-reduced-motion:reduce){.pkmLoader{animation:none}.pkmCard,.pkmButton{transition:none}}
      `}</style>
    </div>
  );
}
