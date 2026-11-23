"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase";

type PokemonCard = { id: string; name: string; card_number: string | null; image_url: string | null; category_id: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase();
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
        const { data: categories, error: categoryError } = await supabase.from("categories").select("id,name");
        if (categoryError) throw categoryError;
        const ids = (categories || []).filter((c: {id:string;name:string}) => normalize(c.name).includes("pokemon")).map((c: {id:string}) => c.id);
        if (!ids.length) { if (active) setCards([]); return; }
        const pageSize = 1000; let from = 0; let available: PokemonCard[] = [];
        while (true) {
          const { data, error: cardsError } = await supabase.from("cards").select("id,name,card_number,image_url,category_id").eq("published", true).gt("stock", 0).in("category_id", ids).order("name").range(from, from + pageSize - 1);
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

  const lanes = useMemo(() => [0, 1, 2, 3].map((lane) => {
    if (!cards.length) return [];
    const offset = Math.floor(cards.length * lane / 4);
    return [...cards.slice(offset), ...cards.slice(0, offset)];
  }), [cards]);

  if (loading) return <div className="showcaseLoading"><span/>Cargando cartas Pokémon…</div>;
  if (error) return <div className="showcaseLoading">{error}</div>;

  return (
    <main className="pokemonShowcase">
      <section className="movingGallery" aria-label="Galería de cartas Pokémon en movimiento">
        {lanes.slice(0, 2).map((lane, row) => <div className={`cardMarquee ${row % 2 ? "reverse" : ""}`} key={row}>
          <div className="marqueeTrack">
            {[0, 1].map(copy => <div className="marqueeSet" key={copy} aria-hidden={copy === 1}>
              {lane.map((card, i) => <div className="movingCard" key={`${copy}-${card.id}`}><img src={card.image_url || ""} alt={copy === 0 ? card.name : ""} loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = "hidden"; }}/></div>)}
            </div>)}
          </div>
        </div>)}
      </section>

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

      <section className="movingGallery lowerGallery" aria-label="Más cartas Pokémon en movimiento">
        {lanes.slice(2, 4).map((lane, row) => <div className={`cardMarquee ${row % 2 === 0 ? "reverse" : ""}`} key={row + 2}>
          <div className="marqueeTrack">
            {[0, 1].map(copy => <div className="marqueeSet" key={copy} aria-hidden={copy === 1}>
              {lane.map(card => <div className="movingCard" key={`${copy}-${card.id}`}><img src={card.image_url || ""} alt={copy === 0 ? card.name : ""} loading="lazy" decoding="async" onError={e => { e.currentTarget.style.visibility = "hidden"; }}/></div>)}
            </div>)}
          </div>
        </div>)}
      </section>
      <style jsx>{`
        .pokemonShowcase{min-height:100vh;background:#080e18;color:#fff;overflow:hidden;display:flex;flex-direction:column;justify-content:center;gap:0}
        .movingGallery{width:100%;overflow:hidden;padding:12px 0;display:flex;flex-direction:column;gap:15px;background:linear-gradient(90deg,#080e18,#101d2c 50%,#080e18)}
        .cardMarquee{width:100%;overflow:hidden;position:relative;mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}
        .marqueeTrack{display:flex;width:max-content;animation:moveLeft 75s linear infinite;will-change:transform}
        .cardMarquee.reverse .marqueeTrack{animation-name:moveRight;animation-duration:88s}
        .cardMarquee:hover .marqueeTrack{animation-play-state:paused}
        .marqueeSet{display:flex;flex:none;align-items:center;gap:13px;padding-right:13px}
        .movingCard{width:clamp(104px,10.5vw,158px);height:clamp(145px,14.2vw,218px);flex:none;padding:6px;border:1px solid #34465b;border-radius:9px;background:linear-gradient(145deg,#1b2a3d,#0d1623);box-shadow:0 9px 24px #0006;overflow:hidden}
        .movingCard img{width:100%;height:100%;display:block;object-fit:contain;border-radius:5px}
        .centerBanner{min-height:300px;position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;padding:38px clamp(24px,11vw,165px);background:radial-gradient(ellipse at 78% 50%,#244c70 0,transparent 34%),linear-gradient(110deg,#24170f,#101b2a 58%,#111827);border-top:1px solid #8c6338;border-bottom:1px solid #8c6338}
        .bannerTexture{position:absolute;inset:0;z-index:-1;opacity:.15;background-image:radial-gradient(#f2c36b 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(90deg,#000,transparent)}
        .bannerCopy{position:relative;z-index:2;max-width:610px}.bannerCopy>span{font-size:9px;font-weight:900;letter-spacing:.22em;color:#efb65e}
        .bannerCopy h1{font-size:clamp(34px,4.6vw,58px);line-height:.98;letter-spacing:-.05em;margin:12px 0;color:#fff8ec}.bannerCopy h1 em{font-family:Georgia,serif;color:#f0b45b;font-weight:500}
        .bannerCopy p{max-width:470px;margin:0 0 19px;color:#c4ced9;font-size:12px;line-height:1.7}
        .bannerButton{display:inline-flex;align-items:center;gap:22px;padding:13px 18px;border-radius:6px;background:linear-gradient(120deg,#f5c975,#d98b37);color:#1b1209;font-size:9px;font-weight:950;letter-spacing:.12em;transition:transform .2s,filter .2s}.bannerButton:hover{transform:translateY(-3px);filter:brightness(1.08)}.bannerButton b{font-size:15px}
        .bannerOrb{width:210px;height:210px;flex:none;display:grid;place-items:center;border:1px solid #e6b45a55;border-radius:50%;box-shadow:0 0 0 18px #e6b45a0b,0 0 60px #e6b45a20;animation:orbFloat 6s ease-in-out infinite}
        .orbBall{position:relative;width:130px;height:130px;border:7px solid #080e18;border-radius:50%;background:linear-gradient(to bottom,#e7474b 0 47%,#111a28 47% 54%,#eeeae0 54%);box-shadow:0 16px 35px #0008;transform:rotate(-12deg)}
        .orbBall:before{content:"";position:absolute;inset:0 0 50%;border-radius:100px 100px 0 0;background:linear-gradient(145deg,#ff7770,#bd2738)}
        .orbBall i{position:absolute;left:50%;top:50%;width:44px;height:44px;transform:translate(-50%,-50%);border:7px solid #111a28;border-radius:50%;background:#f4f0e7;box-shadow:0 0 0 3px #f4f0e7}
        .lowerGallery{padding-bottom:18px}
        .showcaseLoading{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:12px;background:#080e18;color:#d9c49f;font-size:13px}.showcaseLoading span{width:20px;height:20px;border:2px solid #57442c;border-top-color:#efb65e;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes moveLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes moveRight{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        @keyframes orbFloat{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-9px) rotate(5deg)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:700px){.pokemonShowcase{justify-content:center}.movingGallery{padding:8px 0;gap:9px}.marqueeSet{gap:8px;padding-right:8px}.movingCard{width:91px;height:127px;padding:4px;border-radius:6px}.marqueeTrack{animation-duration:55s}.cardMarquee.reverse .marqueeTrack{animation-duration:63s}.centerBanner{min-height:250px;padding:28px 20px}.bannerCopy{max-width:72%}.bannerCopy h1{font-size:34px}.bannerCopy p{font-size:10px;line-height:1.55}.bannerCopy>span{font-size:7px}.bannerButton{padding:12px 13px;gap:10px;font-size:8px}.bannerOrb{width:92px;height:92px;box-shadow:0 0 0 8px #e6b45a0b}.orbBall{width:61px;height:61px;border-width:4px}.orbBall i{width:23px;height:23px;border-width:4px}.lowerGallery{padding-bottom:8px}}
        @media(prefers-reduced-motion:reduce){.marqueeTrack,.bannerOrb,.showcaseLoading span{animation:none!important}.marqueeTrack{transform:none}}
      `}</style>
    </main>
  );
}
