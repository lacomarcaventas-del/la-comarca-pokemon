"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase";

type PokemonCard = { id: string; name: string; card_number: string | null; image_url: string | null; category_id: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const HIDDEN_PRODUCTS = new Set(["producto al azar", "producto al azar 1", "producto al azar 2"]);

export default function PokemonShowcase() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadShowcase() {
      try {
        const supabase = supabaseBrowser();
        // ID verificado de la categoría Pokémon TCG en la base de datos de La Comarca.
        const pokemonCategoryId = "ca5d1774-27cc-4bc8-966b-e6078fa0d83e";
        const pageSize = 500; let from = 0; let available: PokemonCard[] = [];
        while (true) {
          const { data, error: cardsError } = await supabase.from("cards").select("id,name,card_number,image_url,category_id").eq("published", true).gt("stock", 0).eq("category_id", pokemonCategoryId).order("name").range(from, from + pageSize - 1);
          if (cardsError) throw cardsError;
          const page = (data || []) as PokemonCard[];
          available = available.concat(page);
          if (page.length < pageSize) break;
          from += pageSize;
        }
        if (active) setCards(available.filter(c => !HIDDEN_PRODUCTS.has(normalize(c.name || "")) && !!c.image_url));
      } catch (cause) {
        console.error("No fue posible cargar la exhibición Pokémon", cause);
        if (active) setError("No pudimos cargar las cartas. Intenta nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadShowcase();
    return () => { active = false; };
  }, []);

  const strips = useMemo(() => {
    if (!cards.length) return [];
    const first = cards.filter((_, i) => i % 2 === 0);
    const second = cards.filter((_, i) => i % 2 === 1);
    return [first, second, second, first];
  }, [cards]);

  if (loading) return <div className="showcaseLoading"><span/>Cargando cartas Pokémon…</div>;
  if (error) return <div className="showcaseLoading">{error}</div>;
  if (!cards.length) return <div className="showcaseLoading">No hay cartas Pokémon con imagen disponibles en este momento.</div>;

  const renderColumn = (items: PokemonCard[], column: number) => (
    <div className={`verticalViewport ${column % 2 ? "down" : "up"}`} key={column}>
      <div className="verticalTrack">
        {[0, 1].map(copy => <div className="verticalSet" key={copy} aria-hidden={copy === 1}>
          {items.map((card, index) => <div className="verticalCard" key={`${copy}-${card.id}`}>
            <img src={card.image_url || ""} alt={copy === 0 ? card.name : ""} loading={index < 8 && copy === 0 ? "eager" : "lazy"} decoding="async" draggable={false} onError={e => { e.currentTarget.style.display = "none"; }}/>
          </div>)}
        </div>)}
      </div>
    </div>
  );

  return (
    <main className="pokemonShowcase">
      <section className="columnsStage" aria-label="Cartas Pokémon en columnas verticales">
        <div className="columnsGrid">
          {strips.map((items, index) => renderColumn(items || cards, index))}
        </div>
        <section className="centerBanner">
          <div className="bannerTexture" aria-hidden="true"/>
          <div className="bannerCopy">
            <span>LA COMARCA · POKÉMON TCG</span>
            <h1>Tu próxima carta<br/><em>te está esperando.</em></h1>
            <p>Descubre el catálogo completo. Regístrate para consultar disponibilidad y comprar en línea.</p>
            <Link href="/cuenta" className="bannerButton">ENTRAR A LA COMARCA <b>↗</b></Link>
          </div>
          <div className="bannerOrb" aria-hidden="true"><div className="orbBall"><i/></div></div>
        </section>
      </section>      <style jsx>{`
        .pokemonShowcase{min-height:100vh;width:100%;background:#080e18;color:#fff;overflow:hidden}
        .columnsStage{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(90deg,#080e18,#142338 50%,#080e18)}
        .columnsGrid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:clamp(8px,2vw,28px);padding:18px clamp(12px,5vw,72px);overflow:hidden}
        .verticalViewport{height:100%;min-width:0;overflow:hidden;position:relative;mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 92%,transparent 100%)}
        .verticalTrack{height:max-content;width:100%;display:flex;flex-direction:column;will-change:transform;animation:scrollUp 52s linear infinite}
        .verticalViewport.down .verticalTrack{animation-name:scrollDown;animation-duration:58s}
        .verticalViewport:hover .verticalTrack{animation-play-state:paused}
        .verticalSet{width:100%;height:max-content;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:12px;padding:6px 0}
        .verticalCard{width:min(100%,112px);aspect-ratio:2.5 / 3.5;flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:3px;border:1px solid #52647a;border-radius:7px;background:linear-gradient(145deg,#263950,#111d2c);box-shadow:0 8px 20px #0008;overflow:hidden;box-sizing:border-box}
        .verticalCard img{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:4px}
        .centerBanner{position:absolute;z-index:3;left:50%;top:50%;transform:translate(-50%,-50%);width:min(88%,1050px);min-height:250px;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;padding:36px clamp(24px,8vw,120px);box-sizing:border-box;background:radial-gradient(ellipse at 78% 50%,#244c70 0,transparent 34%),linear-gradient(110deg,#24170f,#101b2a 58%,#111827);border:2px solid #b17a3d;border-radius:10px;box-shadow:0 20px 70px #000c}
        .bannerTexture{position:absolute;inset:0;z-index:-1;opacity:.15;background-image:radial-gradient(#f2c36b 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(90deg,#000,transparent)}
        .bannerCopy{position:relative;z-index:2;max-width:610px}.bannerCopy>span{font-size:9px;font-weight:900;letter-spacing:.22em;color:#efb65e}
        .bannerCopy h1{font-size:clamp(30px,4vw,52px);line-height:.98;letter-spacing:-.05em;margin:12px 0;color:#fff8ec}.bannerCopy h1 em{font-family:Georgia,serif;color:#f0b45b;font-weight:500}
        .bannerCopy p{max-width:470px;margin:0 0 19px;color:#c4ced9;font-size:12px;line-height:1.7}
        .bannerButton{display:inline-flex;align-items:center;gap:22px;padding:13px 18px;border-radius:6px;background:linear-gradient(120deg,#f5c975,#d98b37);color:#1b1209;font-size:9px;font-weight:950;letter-spacing:.12em;transition:transform .2s,filter .2s}.bannerButton:hover{transform:translateY(-3px);filter:brightness(1.08)}.bannerButton b{font-size:15px}
        .bannerOrb{width:145px;height:145px;flex:none;display:grid;place-items:center;border:1px solid #e6b45a66;border-radius:50%;box-shadow:0 0 0 18px #e6b45a0b,0 0 60px #e6b45a20;animation:orbFloat 6s ease-in-out infinite}
        .orbBall{position:relative;width:90px;height:90px;border:7px solid #080e18;border-radius:50%;background:linear-gradient(to bottom,#e7474b 0 47%,#111a28 47% 54%,#eeeae0 54%);box-shadow:0 16px 35px #0008;transform:rotate(-12deg)}
        .orbBall:before{content:"";position:absolute;inset:0 0 50%;border-radius:100px 100px 0 0;background:linear-gradient(145deg,#ff7770,#bd2738)}
        .orbBall i{position:absolute;left:50%;top:50%;width:30px;height:30px;transform:translate(-50%,-50%);border:6px solid #111a28;border-radius:50%;background:#f4f0e7;box-shadow:0 0 0 3px #f4f0e7}
        .showcaseLoading{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:12px;background:#080e18;color:#d9c49f;font-size:13px}.showcaseLoading span{width:20px;height:20px;border:2px solid #57442c;border-top-color:#efb65e;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes scrollUp{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-50%,0)}}
        @keyframes scrollDown{from{transform:translate3d(0,-50%,0)}to{transform:translate3d(0,0,0)}}
        @keyframes orbFloat{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-9px) rotate(5deg)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:700px){.columnsStage{min-height:100svh}.columnsGrid{gap:7px;padding:12px 8px}.verticalSet{gap:9px}.verticalCard{width:min(100%,82px);padding:2px}.verticalTrack{animation-duration:34s}.verticalViewport.down .verticalTrack{animation-duration:39s}.centerBanner{width:94%;min-height:220px;padding:22px 16px}.bannerCopy{max-width:76%}.bannerCopy h1{font-size:clamp(25px,6vw,32px)}.bannerCopy p{font-size:10px;line-height:1.5}.bannerCopy>span{font-size:7px}.bannerButton{padding:11px 12px;gap:9px;font-size:8px}.bannerOrb{width:58px;height:58px;box-shadow:0 0 0 7px #e6b45a0b}.orbBall{width:38px;height:38px;border-width:3px}.orbBall i{width:15px;height:15px;border-width:3px}}
        @media(prefers-reduced-motion:reduce){.verticalTrack,.bannerOrb,.showcaseLoading span{animation:none!important}.verticalTrack{transform:translate3d(0,0,0)}}
      `}</style>
    </main>
  );
}
