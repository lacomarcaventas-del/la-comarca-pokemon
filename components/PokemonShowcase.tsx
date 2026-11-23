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
    // Cada columna recibe una mezcla independiente para evitar patrones repetidos.
    return Array.from({ length: 10 }, (_, column) => {
      const shuffled = [...cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      // Desfase distinto para que las columnas no arranquen alineadas.
      const offset = Math.floor(Math.random() * shuffled.length);
      return [...shuffled.slice(offset), ...shuffled.slice(0, offset)];
    });
  }, [cards]);

  if (loading) return <div className="showcaseLoading"><span/>Cargando cartas Pokémon…</div>;
  if (error) return <div className="showcaseLoading">{error}</div>;
  if (!cards.length) return <div className="showcaseLoading">No hay cartas Pokémon con imagen disponibles en este momento.</div>;

  const renderColumn = (items: PokemonCard[], column: number) => (
    <div className={`verticalViewport ${column % 2 ? "down" : "up"}`} key={column}>
      <div className="verticalTrack">
        {[0, 1].map(copy => <div className="verticalSet" key={copy} aria-hidden={copy === 1}>
          {items.map((card, index) => <div className="verticalCard" key={`${copy}-${card.id}`} style={{ width: "76px", height: "106px", minWidth: "76px", maxWidth: "76px", minHeight: "106px", maxHeight: "106px", flex: "0 0 106px", boxSizing: "border-box" }}>
            <img src={card.image_url || ""} alt={copy === 0 ? card.name : ""} loading={index < 8 && copy === 0 ? "eager" : "lazy"} decoding="async" draggable={false} style={{ display: "block", width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", flex: "0 0 auto" }} onError={e => { e.currentTarget.style.display = "none"; }}/>
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
        <Link href="/cuenta" className="accountHero" aria-label="Crear cuenta en La Comarca">
          <div className="accountCopy">
            <div className="accountKicker">18 AÑOS · LLEVANDO DIVERSIÓN A TODO MÉXICO</div>
            <h1>CREA TU <span>CUENTA HOY</span></h1>
            <div className="accountBenefits"><span>◈ COMPRA</span><span>◇ COLECCIONA</span><span>♧ DISFRUTA</span></div>
            <div className="accountButton">♙ &nbsp; CREAR CUENTA &nbsp; →</div>
          </div>
          <div className="accountVisuals" aria-hidden="true">
            <div className="brandTitle">TUS MUNDOS FAVORITOS</div>
            <div className="brandGrid">
              {["Pokémon","Magic: The Gathering","Yu-Gi-Oh!","One Piece","Disney Lorcana","Weiß Schwarz","Gundam Card Game","hololive","RIFTBOUND","Dungeons & Dragons","HeroClix","Juegos de Mesa","Modelismo","Accesorios"].map((name,i) => <div className={`brandLogo brand-${i}`} key={name}>{name}</div>)}
            </div>
            <div className="brandFooter">La Comarca · TCG & Hobby</div>
          </div>
        </Link>
      </section>      <style jsx>{`
        .accountHero{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);z-index:4;display:block;min-height:300px;overflow:hidden;text-decoration:none;background:radial-gradient(circle at 82% 45%,rgba(255,0,220,.2),transparent 27%),radial-gradient(circle at 12% 50%,rgba(0,220,255,.16),transparent 32%),linear-gradient(115deg,#050819,#0b0920 52%,#16051f);border-top:1px solid rgba(0,238,255,.3);border-bottom:1px solid rgba(255,40,220,.45);isolation:isolate}
        .accountHero:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 150px,rgba(0,220,255,.035) 151px,rgba(255,30,220,.07) 152px,transparent 154px);pointer-events:none}
        .accountHero:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:linear-gradient(90deg,transparent,#00eaff,#ff20e7,#00eaff,transparent);box-shadow:0 0 15px #00eaff,0 0 30px #ff20e7}
        .accountCopy{position:relative;z-index:3;width:55%;padding:38px 20px 34px clamp(24px,7vw,110px);box-sizing:border-box}
        .accountKicker{font:800 11px/1.2 Arial,sans-serif;letter-spacing:.18em;color:#8defff;text-shadow:0 0 10px rgba(0,220,255,.7);margin-bottom:10px}
        .accountHero h1{margin:0;font:900 clamp(42px,6vw,70px)/.9 Arial,sans-serif;letter-spacing:-.045em;color:#fff;text-transform:uppercase;text-shadow:0 0 12px rgba(255,255,255,.25)}
        .accountHero h1 span{display:block;background:linear-gradient(90deg,#32eaff,#738cff,#ff3be7);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 12px rgba(255,35,220,.55))}
        .accountBenefits{display:flex;gap:20px;flex-wrap:wrap;margin-top:18px;color:#d9eaff;font:800 11px Arial,sans-serif;letter-spacing:.08em}
        .accountBenefits span{white-space:nowrap}
        .accountButton{display:inline-flex;align-items:center;justify-content:center;min-width:250px;margin-top:20px;padding:14px 24px;border:1px solid #ff58f2;border-radius:12px;background:linear-gradient(100deg,#681cff,#e91bd7);color:#fff;font:900 15px Arial,sans-serif;letter-spacing:.06em;box-shadow:0 0 12px rgba(164,36,255,.75),0 0 28px rgba(255,25,220,.35);transition:.2s}
        .accountVisuals{position:absolute;right:2%;top:0;width:44%;height:100%;padding:24px 2.5% 22px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;z-index:2}
        .brandTitle{text-align:center;color:#fff;font:800 16px/1.25 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px}
        .brandTitle:before,.brandTitle:after{content:"";display:inline-block;width:9%;height:1px;vertical-align:middle;margin:0 12px;background:linear-gradient(90deg,transparent,#ff2de2)}
        .brandTitle:after{background:linear-gradient(90deg,#00dfff,transparent)}
        .brandGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px 10px}
        .brandLogo{height:54px;display:flex;align-items:center;justify-content:center;text-align:center;padding:4px 7px;box-sizing:border-box;border-right:1px solid rgba(255,255,255,.18);font:900 12px/1.05 Arial,sans-serif;letter-spacing:.02em;color:#fff}
        .brandLogo:nth-child(4n){border-right:0}
        .brand-0{color:#ffd83d;font-size:16px;font-style:italic;text-shadow:0 0 7px #2677ff}
        .brand-1{font-family:Georgia,serif;font-size:15px}.brand-2{color:#ff3b35;font-size:15px}.brand-3{color:#31dfff;font-size:14px;font-style:italic}.brand-4{color:#f0d39b;font-family:Georgia,serif}.brand-5{font-family:Georgia,serif;font-size:14px}.brand-6{font-size:12px}.brand-7{color:#ff77b7}.brand-8{color:#ff9b24;font-size:14px}.brand-9{color:#ef3a35;font-family:Georgia,serif}.brand-10{color:#55aaff;font-size:14px}
        .brandFooter{text-align:right;margin-top:12px;color:rgba(220,235,255,.6);font:600 10px Arial,sans-serif}
        .accountHero:hover .accountButton{filter:brightness(1.1)}
        .pokemonShowcase{min-height:100vh;width:100%;background:#080e18;color:#fff;overflow:hidden}
        .columnsStage{position:relative;min-height:100vh;overflow:hidden;background:linear-gradient(90deg,#080e18,#142338 50%,#080e18)}
        .columnsGrid{position:absolute;inset:0;display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px;padding:10px 4px;overflow:hidden}
        .verticalViewport{height:100%;min-width:0;overflow:hidden;position:relative;mask-image:linear-gradient(180deg,transparent 0%,#000 8%,#000 92%,transparent 100%)}
        .verticalTrack{height:max-content;width:100%;display:flex;flex-direction:column;will-change:transform;animation:scrollUp 52s linear infinite}
        .verticalViewport.down .verticalTrack{animation-name:scrollDown;animation-duration:58s}
        .verticalViewport:hover .verticalTrack{animation-play-state:paused}
        .verticalSet{width:100%;height:max-content;flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:4px;padding:3px 0}
        .verticalCard{width:76px;height:106px;max-width:76px;max-height:106px;aspect-ratio:2.5 / 3.5;flex:0 0 auto;display:flex;align-items:center;justify-content:center;padding:3px;border:1px solid #52647a;border-radius:7px;background:linear-gradient(145deg,#263950,#111d2c);box-shadow:0 8px 20px #0008;overflow:hidden;box-sizing:border-box}
        .verticalCard img{display:block;width:100%;height:100%;max-width:100%;max-height:100%;object-fit:contain;border-radius:4px}
        .
        .bannerTexture{position:absolute;inset:0;z-index:-1;opacity:.15;background-image:radial-gradient(#f2c36b 1px,transparent 1px);background-size:22px 22px;mask-image:linear-gradient(90deg,#000,transparent)}
        .bannerCopy{position:relative;z-index:2;max-width:610px}.bannerCopy>span{font-size:9px;font-weight:900;letter-spacing:.22em;color:#efb65e}
        .bannerCopy h1{font-size:clamp(30px,4vw,52px);line-height:.98;letter-spacing:-.05em;margin:12px 0;color:#fff8ec}.bannerCopy h1 em{font-family:Georgia,serif;color:#f0b45b;font-weight:500}
        .bannerCopy p{max-width:470px;margin:0 0 19px;color:#c4ced9;font-size:12px;line-height:1.7}
        .bannerButton{display:inline-flex;align-items:center;gap:22px;padding:13px 18px;border-radius:6px;background:linear-gradient(120deg,#f5c975,#d98b37);color:#1b1209;font-size:9px;font-weight:950;letter-spacing:.12em;transition:transform .2s,filter .2s}.bannerButton:hover{transform:translateY(-3px);filter:brightness(1.08)}.bannerButton b{font-size:15px}
        .bannerOrb{width:145px;height:145px;flex:none;display:grid;place-items:center;border:1px solid #e6b45a66;border-radius:50%;box-shadow:0 0 0 18px #e6b45a0b,0 0 60px #e6b45a20;animation:orbFloat 6s ease-in-out infinite}
        .orbBall{position:relative;width:90px;height:90px;border:7px solid #080e18;border-radius:50%;background:linear-gradient(to bottom,#e7474b 0 47%,#111a28 47% 54%,#eeeae0 54%);box-shadow:0 16px 35px #0008;transform:rotate(-12deg)}
        .orbBall:before{content:"";position:absolute;inset:0 0 50%;border-radius:100px 100px 0 0;background:linear-gradient(145deg,#ff7770,#bd2738)}
        .orbBall i{position:absolute;left:50%;top:50%;width:30px;height:30px;transform:translate(-50%,-50%);border:6px solid #111a28;border-radius:50%;background:#f4f0e7;box-shadow:0 0 0 3px #f4f0e7}
        @media(max-width:900px){.accountCopy{width:58%}.accountVisuals{width:45%;right:0}.brandGrid{grid-template-columns:repeat(3,1fr)}.brandLogo:nth-child(4n){border-right:1px solid rgba(255,255,255,.18)}.brandLogo:nth-child(3n){border-right:0}}
        @media(max-width:700px){.accountHero{min-height:430px;top:50%;}.accountCopy{width:100%;padding:28px 18px 0}.accountKicker{font-size:8px}.accountHero h1{font-size:46px}.accountBenefits{gap:10px}.accountVisuals{position:absolute;right:0;top:auto;bottom:0;width:100%;height:190px;padding:12px 14px 18px;background:linear-gradient(180deg,transparent,rgba(5,8,25,.85) 25%)}.brandTitle{font-size:11px;margin-bottom:8px}.brandGrid{grid-template-columns:repeat(4,1fr);gap:3px 4px}.brandLogo{height:34px;font-size:8px}.brandFooter{display:none}.accountButton{min-width:220px}}
        .showcaseLoading{min-height:100vh;display:flex;align-items:center;justify-content:center;gap:12px;background:#080e18;color:#d9c49f;font-size:13px}.showcaseLoading span{width:20px;height:20px;border:2px solid #57442c;border-top-color:#efb65e;border-radius:50%;animation:spin .8s linear infinite}
        @keyframes scrollUp{from{transform:translate3d(0,0,0)}to{transform:translate3d(0,-50%,0)}}
        @keyframes scrollDown{from{transform:translate3d(0,-50%,0)}to{transform:translate3d(0,0,0)}}
        @keyframes orbFloat{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-9px) rotate(5deg)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:700px){.columnsStage{min-height:100svh}.columnsGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:8px 4px}.verticalSet{gap:9px}.verticalCard{width:60px;height:84px;max-width:60px;max-height:84px;padding:2px}.verticalTrack{animation-duration:34s}.verticalViewport.down .verticalTrack{animation-duration:39s}.centerBanner{width:94%;min-height:220px;padding:22px 16px}.bannerCopy{max-width:76%}.bannerCopy h1{font-size:clamp(25px,6vw,32px)}.bannerCopy p{font-size:10px;line-height:1.5}.bannerCopy>span{font-size:7px}.bannerButton{padding:11px 12px;gap:9px;font-size:8px}.bannerOrb{width:58px;height:58px;box-shadow:0 0 0 7px #e6b45a0b}.orbBall{width:38px;height:38px;border-width:3px}.orbBall i{width:15px;height:15px;border-width:3px}}
        @media(prefers-reduced-motion:reduce){.verticalTrack,.bannerOrb,.showcaseLoading span{animation:none!important}.verticalTrack{transform:translate3d(0,0,0)}}
      `}</style>
    </main>
  );
}
