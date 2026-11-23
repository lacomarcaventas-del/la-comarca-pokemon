"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase";

type PokemonCard = { id: string; name: string; card_number: string | null; image_url: string | null; category_id: string | null };
const normalize = (value: string) => value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase();
const HIDDEN_PRODUCTS = new Set(["producto al azar", "producto al azar 1", "producto al azar 2"]);

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
        if (active) setCards(available.filter(c => !HIDDEN_PRODUCTS.has(normalize(c.name || "")) && !!c.image_url));
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
    <div className="pokemonAd">
      <main>
        <section className="hero">
          <div className="heroStars" aria-hidden="true"/>
          <div className="heroCopy">
            <div className="brandLine"><span className="brandMark">LC</span><span>LA COMARCA <i>·</i> POKÉMON TCG</span></div>
            <span className="eyebrow">TU PRÓXIMO DESCUBRIMIENTO ESTÁ AQUÍ</span>
            <h1>Encuentra tu<br/><em>próxima carta.</em></h1>
            <p>Una galería viva de cartas Pokémon disponibles en La Comarca. Explora, descubre tus favoritas y amplía cada imagen.</p>
            <a href="#galeria" className="primaryButton">EXPLORAR GALERÍA <span>↓</span></a>
            <small className="liveNote"><span/> IMÁGENES DE PRODUCTOS DISPONIBLES</small>
          </div>
          <div className="heroArt" aria-hidden="true">
            <div className="orbit orbitOne"/><div className="orbit orbitTwo"/>
            <div className="energy energyOne"/><div className="energy energyTwo"/>
            <div className="pokeball"><span/></div>
            <div className="floatWord wordOne">DESCUBRE</div><div className="floatWord wordTwo">COLECCIONA</div>
          </div>
          <div className="heroBottom"><span>POKÉMON TRADING CARD GAME</span><span>LA COMARCA · TCG & HOBBY</span></div>
        </section>

        <section className="gallery" id="galeria">
          <div className="sectionHead">
            <div><span className="sectionTag">GALERÍA EN MOVIMIENTO</span><h2>¿Cuál será <em>la tuya?</em></h2><p>Desliza, explora y toca cualquier imagen para verla en grande.</p></div>
            <div className="count"><strong>{loading ? "—" : cards.length.toLocaleString("es-MX")}</strong><span>PRODUCTOS<br/>DISPONIBLES</span></div>
          </div>
          <div className="toolbar">
            <label className="searchBox"><span>⌕</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar Pokémon o número de carta…" aria-label="Buscar cartas Pokémon"/>{search && <button type="button" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">×</button>}</label>
            <small>{loading ? "Preparando la galería…" : search ? `${filteredCards.length} resultados` : "Nuevos descubrimientos te esperan"}</small>
          </div>
          {loading ? <div className="state"><span className="loader"/>Cargando cartas disponibles…</div> : error ? <div className="state" role="alert">{error}<button onClick={() => window.location.reload()}>Reintentar</button></div> : filteredCards.length ? <div className="cardGrid">{filteredCards.map((card, i) => <article className="productCard" key={card.id} style={{"--delay": `${(i % 9) * -0.42}s`, "--tilt": `${i % 2 === 0 ? "-1.2deg" : "1.2deg"}`} as React.CSSProperties}><button type="button" className="imageButton" onClick={() => setViewer(card)} aria-label={`Ampliar ${card.name}`}><img src={card.image_url || "/placeholder.svg"} alt={card.name} loading="lazy" decoding="async" onError={e => {e.currentTarget.src="/placeholder.svg";}}/><span className="zoomHint">VER CARTA ↗</span></button></article>)}</div> : <div className="state"><strong>{search ? "No encontramos esa carta" : "La galería se está preparando"}</strong><span>{search ? "Prueba con otro nombre o número." : "Pronto habrá nuevas cartas disponibles."}</span>{search && <button onClick={() => setSearch("")}>Ver toda la galería</button>}</div>}
        </section>

        <section className="signup">
          <div className="signupOrb" aria-hidden="true"/>
          <div className="signupCopy"><span className="sectionTag">EL SIGUIENTE PASO ES TUYO</span><h2>¿Ya viste algo<br/><em>que te gusta?</em></h2><p>Crea tu cuenta en La Comarca para consultar el catálogo completo, revisar precios y comprar tus cartas favoritas.</p><Link href="/cuenta" className="primaryButton">CREAR CUENTA Y COMPRAR <span>↗</span></Link></div>
          <div className="signupStamp" aria-hidden="true"><span>LA</span><b>COMARCA</b><small>TCG · HOBBY</small></div>
        </section>
      </main>
      <footer><span className="footerMark">LC</span><span>LA COMARCA · DESCUBRE · COLECCIONA · JUEGA</span><Link href="/cuenta">REGÍSTRATE PARA COMPRAR ↗</Link></footer>

      {viewer && <div className="viewer" role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${viewer.name}`} onClick={() => setViewer(null)}><button type="button" className="closeViewer" onClick={() => setViewer(null)} aria-label="Cerrar">×</button><div className="viewerContent" onClick={e => e.stopPropagation()}><img src={viewer.image_url || "/placeholder.svg"} alt={viewer.name}/><Link href="/cuenta" className="primaryButton">CREAR CUENTA Y COMPRAR ↗</Link></div></div>}

      <style jsx>{`
        .pokemonAd{min-height:100vh;background:#080e18;color:#f8f1e5;overflow:hidden}
        .hero{min-height:510px;position:relative;isolation:isolate;overflow:hidden;display:grid;grid-template-columns:1.05fr .95fr;align-items:center;padding:55px clamp(22px,9vw,140px) 75px;background:radial-gradient(ellipse at 78% 48%,#17436a 0,transparent 33%),radial-gradient(ellipse at 5% 100%,#4c2518 0,transparent 40%),linear-gradient(115deg,#080e18,#101c2d 62%,#0c1723);border-bottom:1px solid #73502b}
        .hero:after{content:"";position:absolute;inset:0;z-index:-1;opacity:.18;background-image:radial-gradient(#f2c36b 1px,transparent 1px);background-size:27px 27px;mask-image:linear-gradient(90deg,transparent,#000)}
        .heroCopy{position:relative;z-index:2;max-width:590px}.brandLine{display:flex;align-items:center;gap:11px;margin-bottom:44px;font-size:10px;font-weight:900;letter-spacing:.19em;color:#e5c58e}.brandLine i{color:#dc8d3a;font-style:normal}.brandMark,.footerMark{width:32px;height:32px;border:1px solid #bd8543;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#f1bc68;font-family:Georgia,serif;font-size:12px;letter-spacing:-.08em}
        .eyebrow,.sectionTag{font-size:9px;letter-spacing:.23em;font-weight:900;color:#efb65e}.hero h1{font-size:clamp(48px,6.3vw,82px);line-height:.92;letter-spacing:-.06em;margin:17px 0 19px;font-weight:950;color:#fff8ec}.hero h1 em,.sectionHead h2 em,.signup h2 em{font-family:Georgia,serif;color:#f0b45b;font-weight:500}.heroCopy p{max-width:480px;color:#c0cbd7;font-size:13px;line-height:1.85;margin:0 0 25px}.primaryButton{display:inline-flex;align-items:center;justify-content:center;gap:18px;padding:15px 21px;border-radius:7px;background:linear-gradient(120deg,#f5c975,#d98b37);color:#1b1209;font-size:9px;font-weight:950;letter-spacing:.13em;box-shadow:0 9px 30px #d88a3230;transition:transform .25s,filter .25s}.primaryButton:hover{transform:translateY(-4px) scale(1.02);filter:brightness(1.1)}.primaryButton span{font-size:16px}.liveNote{display:flex;align-items:center;gap:8px;margin-top:22px;color:#9eacbc;font-size:8px;letter-spacing:.15em}.liveNote span{width:6px;height:6px;border-radius:50%;background:#8ed5a2;box-shadow:0 0 10px #8ed5a2}
        .heroArt{height:340px;position:relative;display:flex;align-items:center;justify-content:center;animation:artFloat 6s ease-in-out infinite}.pokeball{width:215px;height:215px;position:relative;border:10px solid #070d16;border-radius:50%;background:linear-gradient(to bottom,#e7474b 0 47%,#111a28 47% 54%,#eeeae0 54%);box-shadow:0 28px 70px #000a,inset 0 0 0 2px #ffffff55;transform:rotate(-14deg);animation:ballTurn 18s ease-in-out infinite}.pokeball:before{content:"";position:absolute;inset:0 0 50%;border-radius:130px 130px 0 0;background:linear-gradient(145deg,#ff7770,#bd2738)}.pokeball span{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:70px;height:70px;border:9px solid #111a28;border-radius:50%;background:#f4f0e7;box-shadow:0 0 0 3px #f4f0e7}
        .orbit{position:absolute;border:1px solid #e7b35c44;border-radius:50%;animation:orbitSpin 18s linear infinite}.orbitOne{width:300px;height:300px;transform:rotateX(67deg) rotate(-20deg)}.orbitTwo{width:370px;height:220px;transform:rotateX(66deg) rotate(30deg);animation-duration:24s;animation-direction:reverse}.energy{position:absolute;width:9px;height:9px;border-radius:50%;background:#ffd37b;box-shadow:0 0 22px 5px #f2a84788}.energyOne{top:17%;right:23%;animation:energyPulse 2.5s infinite}.energyTwo{bottom:17%;left:20%;animation:energyPulse 3.2s .6s infinite}.floatWord{position:absolute;color:#eac17c;font-size:8px;font-weight:900;letter-spacing:.22em}.wordOne{top:14%;left:12%;animation:wordDrift 5s ease-in-out infinite}.wordTwo{bottom:14%;right:8%;animation:wordDrift 6s ease-in-out infinite reverse}
        .heroBottom{position:absolute;bottom:18px;left:clamp(22px,9vw,140px);right:clamp(22px,9vw,140px);display:flex;justify-content:space-between;color:#718095;font-size:8px;letter-spacing:.19em}
        .gallery{max-width:1500px;margin:auto;padding:68px clamp(16px,5vw,72px) 82px}.sectionHead{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:27px}.sectionHead h2,.signup h2{font-size:clamp(32px,4.4vw,54px);line-height:1;margin:12px 0;color:#fff8ec;letter-spacing:-.045em}.sectionHead p{font-size:11px;color:#9eacbc;margin:0}.count{display:flex;align-items:center;gap:11px;border-left:1px solid #70502f;padding-left:17px}.count strong{font-size:32px;color:#f0b45b}.count span{font-size:8px;line-height:1.5;letter-spacing:.13em;color:#9eacbc;font-weight:900}
        .toolbar{display:flex;justify-content:space-between;align-items:center;gap:15px;margin-bottom:25px;padding:13px 0;border-top:1px solid #2c3948;border-bottom:1px solid #2c3948}.searchBox{height:42px;width:min(100%,440px);display:flex;align-items:center;gap:10px;padding:0 13px;border:1px solid #344355;border-radius:7px;background:#111b29}.searchBox:focus-within{border-color:#d99543;box-shadow:0 0 0 3px #d9954320}.searchBox>span{font-size:23px;color:#e7ad58}.searchBox input{flex:1;min-width:0;border:0!important;outline:0!important;background:transparent!important;color:#fff!important;padding:0!important;font-size:11px}.searchBox input::placeholder{color:#78889a}.searchBox button{background:#263344;border:0;border-radius:50%;color:#fff;padding:2px 8px}.toolbar>small{font-size:9px;color:#8d9bad;letter-spacing:.12em;text-transform:uppercase}
        .cardGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:17px}.productCard{min-width:0;position:relative;border:1px solid #29384a;border-radius:10px;overflow:hidden;background:linear-gradient(145deg,#162437,#0c1420);animation:cardBob 5.5s ease-in-out infinite;animation-delay:var(--delay);transition:transform .3s,border-color .3s,box-shadow .3s}.productCard:nth-child(3n){animation-duration:6.7s}.productCard:nth-child(4n){animation-duration:4.9s}.productCard:hover{z-index:2;transform:translateY(-9px) rotate(0deg) scale(1.025)!important;border-color:#d89a4b;box-shadow:0 18px 40px #0008;animation-play-state:paused}.imageButton{position:relative;width:100%;aspect-ratio:5/6.8;padding:10px!important;border:0!important;border-radius:0!important;background:radial-gradient(circle at 50% 45%,#293c52,#101a28)!important;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:zoom-in}.imageButton img{width:100%;height:100%;object-fit:contain;display:block;transition:transform .45s cubic-bezier(.2,.8,.2,1);filter:drop-shadow(0 9px 12px #0006)}.productCard:hover img{transform:scale(1.07) rotate(1deg)}.zoomHint{position:absolute;right:9px;bottom:9px;padding:7px 9px;border-radius:5px;background:#07101cdd;color:#f3d29a;font-size:8px;letter-spacing:.12em;opacity:0;transform:translateY(5px);transition:.25s}.productCard:hover .zoomHint,.imageButton:focus-visible .zoomHint{opacity:1;transform:translateY(0)}
        .state{min-height:190px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#b4bdc9;font-size:12px;text-align:center}.state button{background:#243449;padding:8px 13px;border-radius:5px}.loader{width:25px;height:25px;border:2px solid #4a3927;border-top-color:#f0b45b;border-radius:50%;animation:spin .8s linear infinite}
        .signup{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:28px;padding:57px clamp(24px,10vw,150px);background:radial-gradient(circle at 83% 48%,#49301e 0,transparent 28%),linear-gradient(110deg,#21160f,#101b2a);border-top:1px solid #5d422a;border-bottom:1px solid #5d422a}.signupCopy{position:relative;z-index:1}.signup h2{font-size:clamp(36px,4.8vw,57px)}.signupCopy p{max-width:480px;color:#c0c7d1;font-size:12px;line-height:1.8;margin:0 0 22px}.signupOrb{position:absolute;width:310px;height:310px;border:1px solid #d39a4c2b;border-radius:50%;right:18%;animation:orbitSpin 30s linear infinite}.signupOrb:before,.signupOrb:after{content:"";position:absolute;border:1px solid #d39a4c26;border-radius:50%;inset:22px;transform:rotateX(65deg)}.signupOrb:after{inset:48px;transform:rotateY(65deg)}.signupStamp{width:145px;height:145px;flex:none;border:1px solid #b17a3d;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#f0b45b;font-family:Georgia,serif;line-height:1.1;transform:rotate(-10deg);box-shadow:0 0 0 9px #b17a3d12,0 0 40px #d58b3320;animation:stampFloat 5s ease-in-out infinite}.signupStamp b{font-size:20px}.signupStamp small{font:700 7px Arial,sans-serif;letter-spacing:.18em;margin-top:6px}
        footer{min-height:75px;padding:17px clamp(20px,5vw,70px);display:flex;align-items:center;justify-content:space-between;gap:15px;background:#070c14;color:#8190a2;font-size:8px;letter-spacing:.15em}footer a{color:#e9b65f;font-weight:900}.footerMark{width:27px;height:27px;font-size:10px}
        .viewer{position:fixed;inset:0;z-index:100;background:#02050bf2;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;backdrop-filter:blur(12px)}.closeViewer{position:fixed;right:20px;top:14px;font-size:30px;background:#202a38;color:white;z-index:2;border:0;border-radius:50%;width:42px;height:42px}.viewerContent{display:flex;align-items:center;flex-direction:column;gap:18px;max-width:min(540px,94vw);max-height:92vh}.viewerContent img{max-height:76vh;max-width:100%;object-fit:contain;filter:drop-shadow(0 20px 40px #0009)}.viewerContent .primaryButton{margin-top:3px}
        @keyframes spin{to{transform:rotate(360deg)}}@keyframes artFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}@keyframes ballTurn{0%,100%{transform:rotate(-14deg)}50%{transform:rotate(8deg)}}@keyframes orbitSpin{to{transform:rotate(360deg)}}@keyframes energyPulse{0%,100%{opacity:.35;transform:scale(.7)}50%{opacity:1;transform:scale(1.5)}}@keyframes wordDrift{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes cardBob{0%,100%{transform:translateY(0) rotate(var(--tilt))}50%{transform:translateY(-7px) rotate(calc(var(--tilt) * -1))}}@keyframes stampFloat{0%,100%{transform:rotate(-10deg) translateY(0)}50%{transform:rotate(-5deg) translateY(-9px)}}
        @media(max-width:1050px){.cardGrid{grid-template-columns:repeat(4,minmax(0,1fr))}.hero{padding-left:6vw;padding-right:6vw}}
        @media(max-width:700px){.hero{grid-template-columns:1fr;padding:32px 20px 62px;min-height:0}.brandLine{margin-bottom:34px;font-size:8px}.hero h1{font-size:49px}.heroCopy p{font-size:12px}.heroArt{height:245px;margin-top:7px}.pokeball{width:155px;height:155px}.pokeball span{width:53px;height:53px}.orbitOne{width:225px;height:225px}.orbitTwo{width:280px;height:170px}.heroBottom{left:20px;right:20px;bottom:15px;font-size:6px}.gallery{padding:45px 13px 55px}.sectionHead{align-items:flex-start}.sectionHead h2{font-size:31px}.sectionHead p{max-width:220px;line-height:1.6}.count{padding-left:9px;gap:6px}.count strong{font-size:24px}.count span{font-size:6px}.toolbar{align-items:flex-start;flex-direction:column}.searchBox{width:100%}.cardGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.signup{padding:42px 20px;gap:10px}.signup h2{font-size:37px}.signupCopy p{font-size:11px;max-width:270px}.signupStamp{width:78px;height:78px;font-size:10px}.signupStamp b{font-size:11px}.signupStamp small{font-size:5px}footer{flex-wrap:wrap;font-size:7px}footer>span:nth-child(2){flex:1}footer a{width:100%;padding-left:38px}}
        @media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;scroll-behavior:auto!important;transition:none!important}}
      `}</style>
    </div>
  );
}
