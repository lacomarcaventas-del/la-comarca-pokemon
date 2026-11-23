"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase";

type PokemonCard = {
  id: string;
  name: string;
  card_number: string | null;
  image_url: string | null;
  category_id: string | null;
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

const HIDDEN_PRODUCTS = new Set([
  "producto al azar",
  "producto al azar 1",
  "producto al azar 2",
]);

export default function PokemonShowcase() {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadShowcase() {
      setLoading(true);
      setError("");
      try {
        const supabase = supabaseBrowser();
        const { data: categories, error: categoryError } = await supabase
          .from("categories")
          .select("id,name");

        if (categoryError) throw categoryError;

        const pokemonCategoryIds = (categories || [])
          .filter((category: { id: string; name: string }) =>
            normalize(category.name).includes("pokemon")
          )
          .map((category: { id: string }) => category.id);

        if (!pokemonCategoryIds.length) {
          if (active) setCards([]);
          return;
        }

        const pageSize = 1000;
        let from = 0;
        let available: PokemonCard[] = [];

        while (true) {
          const { data, error: cardsError } = await supabase
            .from("cards")
            .select("id,name,card_number,image_url,category_id")
            .eq("published", true)
            .gt("stock", 0)
            .in("category_id", pokemonCategoryIds)
            .order("name")
            .range(from, from + pageSize - 1);

          if (cardsError) throw cardsError;

          const page = (data || []) as PokemonCard[];
          available = available.concat(page);
          if (page.length < pageSize) break;
          from += pageSize;
        }

        const visible = available.filter(
          (card) => !HIDDEN_PRODUCTS.has(normalize(card.name || ""))
        );

        if (active) setCards(visible);
      } catch (cause) {
        console.error("No fue posible cargar la exhibición Pokémon", cause);
        if (active) setError("No pudimos cargar las cartas en este momento. Intenta nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadShowcase();
    return () => {
      active = false;
    };
  }, []);

  const filteredCards = useMemo(() => {
    const term = normalize(search);
    if (!term) return cards;
    return cards.filter((card) =>
      normalize(`${card.name} ${card.card_number || ""}`).includes(term)
    );
  }, [cards, search]);

  return (
    <main className="pokemonShowcase">
      <div className="announcementBar">
        <span className="announcementDot" />
        CARTAS POKÉMON DISPONIBLES · LA COMARCA
        <span className="announcementRight">TCG & HOBBY</span>
      </div>

      <header className="pokemonShowcaseNav">
        <Link href="/" className="pokemonBrand" aria-label="La Comarca, inicio">
          <span className="brandMark">LC</span>
          <span>LA COMARCA<small>TCG & HOBBY</small></span>
        </Link>
        <nav className="navActions" aria-label="Navegación principal">
          <Link href="/" className="navHome">Inicio</Link>
          <Link href="/cuenta" className="pokemonNavAccount">Mi cuenta <span>↗</span></Link>
        </nav>
      </header>

      <section className="pokemonHero">
        <div className="heroTexture" aria-hidden="true" />
        <div className="heroCopy">
          <div className="heroKicker"><span /> COLECCIÓN POKÉMON TCG</div>
          <h1>Tu próxima<br /><em>carta favorita</em><br />está aquí.</h1>
          <p className="pokemonIntro">
            Explora las cartas Pokémon que tenemos disponibles en La Comarca.
            Encuentra esa pieza que le falta a tu colección.
          </p>
          <div className="heroActions">
            <a href="#coleccion" className="heroPrimary">EXPLORAR CARTAS <span>↓</span></a>
            <Link href="/cuenta" className="heroSecondary">Crear cuenta <span>↗</span></Link>
          </div>
          <div className="heroFootnote"><span className="heroFootnoteIcon">✦</span> Existencias actualizadas desde nuestro catálogo</div>
        </div>
        <div className="heroArtwork" aria-hidden="true">
          <div className="artHalo artHaloOne" />
          <div className="artHalo artHaloTwo" />
          <div className="orbit orbitOne" />
          <div className="orbit orbitTwo" />
          <div className="heroPokeball">
            <div className="pokeballTop" />
            <div className="pokeballBand" />
            <div className="pokeballCenter"><span /></div>
          </div>
          <div className="floatingLabel labelTop"><span>✦</span> COLECCIONA</div>
          <div className="floatingLabel labelBottom">ATRAPA TU FAVORITA <b>↗</b></div>
          <div className="spark sparkOne">✳</div><div className="spark sparkTwo">✦</div><div className="spark sparkThree">✧</div>
        </div>
        <div className="heroBottomLine"><span>LA COMARCA</span><span>DESCUBRE · COLECCIONA · JUEGA</span><span>01 / POKÉMON</span></div>
      </section>

      <section className="pokemonGallerySection" id="coleccion">
        <div className="galleryIntro">
          <div>
            <p className="sectionEyebrow">ELIGE TU SIGUIENTE TESORO</p>
            <h2>La colección<span>.</span></h2>
            <p className="galleryDescription">Cartas disponibles en tienda, listas para encontrar un nuevo entrenador.</p>
          </div>
          <div className="totalCounter">
            <strong>{loading ? "—" : cards.length.toLocaleString("es-MX")}</strong>
            <span>CARTAS<br />DISPONIBLES</span>
          </div>
        </div>

        <div className="galleryToolbar">
          <label className="pokemonSearch">
            <span className="searchIcon" aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca por Pokémon o número de carta…"
              aria-label="Buscar cartas Pokémon"
            />
            {search && <button type="button" className="clearSearch" onClick={() => setSearch("")} aria-label="Limpiar búsqueda">×</button>}
          </label>
          <div className="resultCount">
            {loading ? "Cargando colección…" : search ? `${filteredCards.length} resultados` : "Catálogo actualizado"}
          </div>
        </div>

        {loading ? (
          <div className="pokemonState loadingState">
            <span className="loaderOrb" />
            <strong>Preparando la colección</strong>
            <span>Estamos buscando las cartas disponibles…</span>
          </div>
        ) : error ? (
          <div className="pokemonState" role="alert">
            <strong>No pudimos cargar la colección</strong>
            <span>{error}</span>
            <button type="button" onClick={() => window.location.reload()}>Volver a intentar ↻</button>
          </div>
        ) : filteredCards.length ? (
          <div className="pokemonCardGrid">
            {filteredCards.map((card, index) => (
              <article className="pokemonCard" key={card.id}>
                <div className="pokemonCardImage">
                  <span className="cardIndex">{String(index + 1).padStart(2, "0")}</span>
                  <img
                    src={card.image_url || "/placeholder.svg"}
                    alt={card.name}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <span className="pokemonStockTag"><i /> DISPONIBLE</span>
                </div>
                <div className="pokemonCardCaption">
                  <strong title={card.name}>{card.name}</strong>
                  <div className="cardMeta">
                    {card.card_number && <small>{card.card_number}</small>}
                    <span>POKÉMON TCG</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pokemonState emptyState">
            <span className="emptyIcon">⌕</span>
            <strong>{search ? "No encontramos esa carta" : "La colección se está preparando"}</strong>
            <span>{search ? "Prueba con otro nombre o número de carta." : "Pronto habrá nuevas cartas disponibles."}</span>
            {search && <button type="button" onClick={() => setSearch("")}>Ver toda la colección</button>}
          </div>
        )}
      </section>

      <section className="pokemonBottomCta">
        <div className="ctaOrb" aria-hidden="true" />
        <p className="sectionEyebrow">EL SIGUIENTE PASO ES TUYO</p>
        <h2>Tu colección<br /><em>merece crecer.</em></h2>
        <p>Crea tu cuenta de cliente y mantente cerca de las novedades de La Comarca.</p>
        <Link href="/cuenta" className="ctaButton">CREAR MI CUENTA <span>↗</span></Link>
      </section>
      <footer className="pokemonFooter">
        <Link href="/" className="footerBrand">LA COMARCA</Link>
        <span>TCG & HOBBY · COLECCIONISMO</span>
        <span>© LA COMARCA</span>
      </footer>

      <style jsx>{`
        .pokemonShowcase{--ink:#171b25;--muted:#737987;--paper:#f4f2ec;--yellow:#f6d34b;--blue:#243e67;min-height:100vh;background:var(--paper);color:var(--ink);padding-bottom:0;font-family:inherit}
        .announcementBar{height:29px;background:#182235;color:#dce4ef;display:flex;align-items:center;justify-content:center;gap:9px;font-size:9px;font-weight:800;letter-spacing:.16em;position:relative}
        .announcementDot{width:6px;height:6px;border-radius:50%;background:#f6d34b;box-shadow:0 0 0 3px #f6d34b22}
        .announcementRight{position:absolute;right:clamp(16px,4vw,60px);color:#8e9caf;font-size:8px}
        .pokemonShowcaseNav{height:76px;padding:0 clamp(18px,6vw,92px);display:flex;align-items:center;justify-content:space-between;background:#f9f8f4;border-bottom:1px solid #e5e2d9}
        .pokemonBrand{display:flex;align-items:center;gap:11px;color:#182235;font-weight:950;letter-spacing:.12em;font-size:13px;line-height:1.05}
        .pokemonBrand small{display:block;margin-top:5px;color:#8a8e96;font-size:8px;letter-spacing:.22em;font-weight:700}
        .brandMark{width:37px;height:37px;border-radius:11px;background:#182235;color:#f6d34b;display:grid;place-items:center;font-size:13px;letter-spacing:-.05em}
        .navActions{display:flex;align-items:center;gap:28px}
        .navHome{font-size:12px;font-weight:700;color:#656b75}
        .pokemonNavAccount{font-size:11px;font-weight:900;color:#182235;border:1px solid #c9c8c1;border-radius:999px;padding:11px 17px;transition:background .2s,color .2s}
        .pokemonNavAccount:hover{background:#182235;color:white}
        .pokemonNavAccount span{margin-left:8px;color:#b18b12}
        .pokemonHero{min-height:490px;position:relative;overflow:hidden;background:#1a2639;color:#fff;padding:72px clamp(24px,9vw,140px) 64px;display:grid;grid-template-columns:1.08fr .92fr;align-items:center}
        .heroTexture{position:absolute;inset:0;opacity:.13;background-image:radial-gradient(#dce5f2 0.7px,transparent .7px);background-size:18px 18px;mask-image:linear-gradient(90deg,black,transparent 85%)}
        .heroCopy{position:relative;z-index:2;max-width:590px}
        .heroKicker,.sectionEyebrow{display:flex;align-items:center;gap:10px;color:#e7c94e;font-size:9px;font-weight:950;letter-spacing:.22em;margin:0 0 22px}
        .heroKicker span{width:23px;height:2px;background:#f6d34b}
        .pokemonHero h1{margin:0;font-size:clamp(44px,6.2vw,82px);line-height:.94;letter-spacing:-.065em;font-weight:950}
        .pokemonHero h1 em,.pokemonBottomCta h2 em{font-family:Georgia,serif;font-weight:500;color:#f6d34b}
        .pokemonIntro{max-width:440px;margin:22px 0 0;color:#c4ccd7;font-size:14px;line-height:1.8}
        .heroActions{display:flex;align-items:center;gap:25px;margin-top:29px}
        .heroPrimary{display:inline-flex;align-items:center;gap:20px;background:#f6d34b;color:#182235;padding:15px 20px;border-radius:4px;font-size:10px;font-weight:950;letter-spacing:.1em;transition:transform .2s,background .2s}
        .heroPrimary:hover{transform:translateY(-2px);background:#ffe36a}
        .heroPrimary span{font-size:16px}
        .heroSecondary{color:#e7ebf0;font-size:11px;font-weight:800;border-bottom:1px solid #718096;padding:0 0 7px}
        .heroSecondary span{color:#f6d34b;margin-left:7px}
        .heroFootnote{margin-top:29px;color:#98a5b6;font-size:9px;letter-spacing:.04em;display:flex;align-items:center;gap:8px}
        .heroFootnoteIcon{color:#f6d34b;font-size:14px}
        .heroArtwork{height:360px;position:relative;display:grid;place-items:center;isolation:isolate}
        .artHalo{position:absolute;border-radius:50%;filter:blur(1px);z-index:-1}
        .artHaloOne{width:290px;height:290px;background:radial-gradient(circle,#e7c94e25,transparent 68%)}
        .artHaloTwo{width:205px;height:205px;border:1px solid #ffffff20}
        .orbit{position:absolute;border:1px solid #ffffff20;border-radius:50%;transform:rotate(-24deg)}
        .orbitOne{width:360px;height:145px}
        .orbitTwo{width:390px;height:205px;transform:rotate(34deg);border-style:dashed}
        .heroPokeball{width:206px;height:206px;border-radius:50%;position:relative;overflow:hidden;background:linear-gradient(to bottom,#e9edf0 0 49%,#1c2431 49% 54%,#f6f4eb 54% 100%);border:9px solid #101927;box-shadow:0 22px 65px #0008,inset 0 0 0 2px #ffffff66;transform:rotate(-13deg)}
        .pokeballTop{position:absolute;inset:0 0 50%;background:linear-gradient(145deg,#ff6d61,#c52c3d)}
        .pokeballBand{position:absolute;top:47%;height:10%;left:0;right:0;background:#111b2a}
        .pokeballCenter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:62px;height:62px;border-radius:50%;background:#111b2a;border:7px solid #e8e9e4;display:grid;place-items:center;box-shadow:0 0 0 3px #182235}
        .pokeballCenter span{width:22px;height:22px;border-radius:50%;background:#e9edf0;border:3px solid #aab0b6}
        .floatingLabel{position:absolute;background:#f6d34b;color:#182235;font-size:8px;font-weight:950;letter-spacing:.14em;padding:10px 13px;box-shadow:0 8px 24px #0003}
        .labelTop{top:45px;right:5%;transform:rotate(7deg)}.labelTop span{margin-right:7px}
        .labelBottom{bottom:45px;left:3%;background:#f7f5ef;transform:rotate(-5deg)}.labelBottom b{margin-left:10px;color:#a27b08}
        .spark{position:absolute;color:#f6d34b}.sparkOne{font-size:25px;top:65px;left:17%}.sparkTwo{font-size:19px;bottom:65px;right:15%}.sparkThree{font-size:31px;top:24%;right:12%;color:#fff}
        .heroBottomLine{position:absolute;bottom:0;left:clamp(24px,9vw,140px);right:clamp(24px,9vw,140px);height:37px;border-top:1px solid #ffffff25;display:flex;align-items:center;justify-content:space-between;color:#8795a8;font-size:8px;font-weight:800;letter-spacing:.16em}
        .heroBottomLine span:first-child{color:#e6c84d}
        .pokemonGallerySection{max-width:1500px;margin:0 auto;padding:78px clamp(18px,6vw,90px) 88px}
        .galleryIntro{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:34px}
        .sectionEyebrow{color:#9b7b13;margin-bottom:12px}
        .galleryIntro h2{margin:0;color:#192235;font-size:clamp(34px,4.2vw,52px);letter-spacing:-.06em;line-height:1}
        .galleryIntro h2 span{color:#d9b52e}
        .galleryDescription{margin:12px 0 0;color:#7b8089;font-size:12px;line-height:1.6}
        .totalCounter{display:flex;align-items:center;gap:12px;padding:10px 0 5px 20px;border-left:1px solid #d7d3c9}
        .totalCounter strong{font-size:35px;line-height:1;letter-spacing:-.06em;color:#192235}
        .totalCounter span{font-size:8px;line-height:1.5;letter-spacing:.13em;color:#8a8c91;font-weight:900}
        .galleryToolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 0;border-top:1px solid #dedbd2;border-bottom:1px solid #dedbd2;margin-bottom:26px}
        .pokemonSearch{width:min(100%,490px);height:45px;display:flex;align-items:center;gap:11px;background:#fff;border:1px solid #e2dfd7;border-radius:4px;padding:0 13px;transition:border-color .2s,box-shadow .2s}
        .pokemonSearch:focus-within{border-color:#c8a72d;box-shadow:0 0 0 3px #d8b83b20}
        .searchIcon{font-size:25px;line-height:1;color:#a18b45;transform:rotate(-20deg)}
        .pokemonSearch input{flex:1;min-width:0;height:100%;border:0;background:transparent;color:#202b3e;font:inherit;font-size:11px;outline:none}
        .pokemonSearch input::placeholder{color:#a0a1a3}
        .clearSearch{border:0;background:#efede6;color:#626875;border-radius:50%;width:23px;height:23px;font-size:16px;cursor:pointer}
        .resultCount{font-size:9px;color:#92949a;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
        .pokemonCardGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:22px}
        .pokemonCard{min-width:0;background:#fff;border:1px solid #e6e2d8;border-radius:5px;overflow:hidden;transition:transform .22s,box-shadow .22s,border-color .22s}
        .pokemonCard:hover{transform:translateY(-5px);border-color:#d3bd62;box-shadow:0 15px 35px #1d26300e}
        .pokemonCardImage{position:relative;aspect-ratio:5/6.7;background:linear-gradient(145deg,#f0eee8,#faf9f6);display:flex;align-items:center;justify-content:center;overflow:hidden;padding:13px}
        .pokemonCardImage:after{content:"";position:absolute;inset:8px;border:1px solid #ffffffaa;pointer-events:none}
        .pokemonCardImage img{position:relative;z-index:1;display:block;width:100%;height:100%;object-fit:contain;transition:transform .3s;filter:drop-shadow(0 7px 6px #2026331c)}
        .pokemonCard:hover .pokemonCardImage img{transform:scale(1.045)}
        .cardIndex{position:absolute;z-index:2;top:13px;left:14px;color:#a5a39d;font-size:8px;font-weight:900;letter-spacing:.1em}
        .pokemonStockTag{position:absolute;z-index:2;bottom:13px;left:13px;padding:6px 8px;background:#f8f7f1;color:#3b604d;border:1px solid #d9e2d8;font-size:7px;font-weight:950;letter-spacing:.1em;display:flex;align-items:center;gap:5px}
        .pokemonStockTag i{width:5px;height:5px;background:#5b9b6e;border-radius:50%}
        .pokemonCardCaption{padding:13px 14px 14px;display:flex;flex-direction:column;gap:9px;min-height:70px}
        .pokemonCardCaption strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#202a3b;font-weight:850}
        .cardMeta{display:flex;justify-content:space-between;align-items:center;gap:6px}
        .cardMeta small{color:#858b95;font-size:9px}
        .cardMeta span{color:#a2a09a;font-size:7px;font-weight:900;letter-spacing:.09em}
        .pokemonState{min-height:180px;padding:38px 18px;text-align:center;color:#858b95;border:1px dashed #d8d4c9;border-radius:5px;background:#f9f8f4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
        .pokemonState strong{font-size:15px;color:#273247}
        .pokemonState span{font-size:11px}
        .pokemonState button{margin-top:8px;padding:11px 17px;border:0;border-radius:3px;background:#1b2940;color:#fff;font-size:10px;font-weight:900;cursor:pointer}
        .loaderOrb{width:27px;height:27px;border:3px solid #e2dcc8;border-top-color:#b79627;border-radius:50%;animation:spin .8s linear infinite}
        .emptyIcon{font-size:28px;color:#b69a3b}
        .pokemonBottomCta{position:relative;overflow:hidden;background:#1a2639;color:#fff;text-align:center;padding:65px 18px 70px}
        .ctaOrb{position:absolute;width:390px;height:250px;left:50%;top:-160px;transform:translateX(-50%);background:#f6d34b24;filter:blur(60px);border-radius:50%}
        .pokemonBottomCta .sectionEyebrow{position:relative;justify-content:center;color:#e4c34a}
        .pokemonBottomCta h2{position:relative;margin:0;font-size:clamp(34px,5vw,54px);line-height:1.02;letter-spacing:-.05em}
        .pokemonBottomCta h2 em{color:#f6d34b}
        .pokemonBottomCta>p:not(.sectionEyebrow){position:relative;max-width:420px;margin:16px auto 0;color:#b8c2d0;font-size:12px;line-height:1.7}
        .ctaButton{position:relative;display:inline-flex;align-items:center;gap:20px;margin-top:25px;padding:15px 20px;background:#f6d34b;color:#182235;font-size:9px;font-weight:950;letter-spacing:.12em;border-radius:3px;transition:transform .2s}
        .ctaButton:hover{transform:translateY(-2px)}
        .ctaButton span{font-size:15px}
        .pokemonFooter{min-height:70px;padding:18px clamp(18px,6vw,90px);display:flex;align-items:center;justify-content:space-between;gap:14px;background:#111b2a;color:#8d9aab;font-size:8px;letter-spacing:.13em}
        .footerBrand{color:#f4d24e;font-weight:950;letter-spacing:.18em}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:1050px){.pokemonCardGrid{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.pokemonHero{padding-left:6vw;padding-right:6vw}.heroBottomLine{left:6vw;right:6vw}}
        @media(max-width:760px){.announcementRight,.navHome{display:none}.pokemonShowcaseNav{height:65px;padding:0 18px}.pokemonHero{grid-template-columns:1fr;padding:54px 22px 55px;min-height:unset}.heroCopy{max-width:580px}.pokemonHero h1{font-size:clamp(46px,11vw,70px)}.heroArtwork{height:270px;margin-top:10px}.heroPokeball{width:164px;height:164px}.pokeballCenter{width:52px;height:52px}.pokeballCenter span{width:17px;height:17px}.orbitOne{width:300px;height:120px}.orbitTwo{width:320px;height:170px}.labelTop{top:25px;right:8%}.labelBottom{bottom:23px;left:7%}.heroBottomLine{left:22px;right:22px}.pokemonGallerySection{padding:55px 18px 62px}.pokemonCardGrid{grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.pokemonCardCaption{padding:10px;min-height:65px}.pokemonCardCaption strong{font-size:11px}.cardMeta span{font-size:6px}.galleryIntro{margin-bottom:25px}.galleryToolbar{align-items:flex-start;flex-direction:column}.pokemonSearch{width:100%}.resultCount{align-self:flex-end}}
        @media(max-width:480px){.announcementBar{font-size:8px;letter-spacing:.1em}.pokemonBrand{font-size:11px}.brandMark{width:33px;height:33px}.pokemonNavAccount{padding:9px 12px;font-size:10px}.pokemonHero{padding-top:45px}.pokemonIntro{font-size:12px}.heroActions{gap:17px}.heroPrimary{padding:14px 15px;font-size:9px}.heroSecondary{font-size:10px}.heroArtwork{height:230px}.heroPokeball{width:145px;height:145px}.pokemonCardGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.pokemonCardImage{padding:10px}.pokemonCardCaption{padding:10px;min-height:62px}.galleryIntro h2{font-size:36px}.totalCounter{padding-left:12px;gap:8px}.totalCounter strong{font-size:28px}.galleryDescription{max-width:245px;font-size:11px}.pokemonBottomCta{padding:55px 20px}.pokemonFooter{flex-wrap:wrap;justify-content:center;text-align:center}.pokemonFooter span{width:100%}}
        @media(prefers-reduced-motion:reduce){.pokemonCard,.pokemonCardImage img,.heroPrimary,.ctaButton{transition:none}.loaderOrb{animation:none}}
      `}</style>
    </main>
  );
}
