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
  value.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").trim().toLowerCase();

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
      <header className="pokemonShowcaseNav">
        <Link href="/" className="pokemonBrand">LA COMARCA</Link>
        <Link href="/cuenta" className="pokemonNavAccount">Clientes</Link>
      </header>

      <section className="pokemonHero">
        <div className="pokemonHeroGlow" aria-hidden="true" />
        <p className="pokemonEyebrow">LA COMARCA · POKÉMON TCG</p>
        <h1>ENCUENTRA<br /><span>TUS FAVORITOS</span></h1>
        <p className="pokemonIntro">
          Explora las cartas Pokémon que tenemos disponibles en nuestra colección.
        </p>
        <Link href="/cuenta" className="pokemonRegisterButton">
          REGÍSTRATE YA <span aria-hidden="true">→</span>
        </Link>
        <p className="pokemonHeroNote">Crea tu cuenta de cliente y descubre nuestro catálogo.</p>
      </section>

      <section className="pokemonGallerySection">
        <div className="pokemonGalleryHeading">
          <div>
            <p className="pokemonEyebrow">CATÁLOGO DE COLECCIÓN</p>
            <h2>EXISTENCIAS</h2>
          </div>
          <span className="pokemonTotal">
            {loading ? "Cargando cartas…" : `${cards.length.toLocaleString("es-MX")} cartas`}
          </span>
        </div>

        <label className="pokemonSearch">
          <span>Buscar Pokémon</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej. Charizard, Pikachu, Umbreon…"
          />
        </label>

        {loading ? (
          <div className="pokemonState">Preparando la exhibición…</div>
        ) : error ? (
          <div className="pokemonState" role="alert">
            {error}
            <button type="button" onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        ) : filteredCards.length ? (
          <div className="pokemonCardGrid">
            {filteredCards.map((card) => (
              <article className="pokemonCard" key={card.id}>
                <div className="pokemonCardImage">
                  <img
                    src={card.image_url || "/placeholder.svg"}
                    alt={card.name}
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <span className="pokemonStockTag">EXISTENCIAS</span>
                </div>
                <div className="pokemonCardCaption">
                  <strong title={card.name}>{card.name}</strong>
                  {card.card_number && <small>{card.card_number}</small>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="pokemonState">
            {search
              ? "No encontramos cartas que coincidan con tu búsqueda."
              : "Por ahora no hay cartas Pokémon publicadas con existencias."}
          </div>
        )}
      </section>

      <section className="pokemonBottomCta">
        <p className="pokemonEyebrow">FORMA PARTE DE LA COMUNIDAD</p>
        <h2>¿YA TIENES TU CUENTA?</h2>
        <p>Regístrate para explorar el catálogo completo de La Comarca.</p>
        <Link href="/cuenta" className="pokemonRegisterButton">
          REGÍSTRATE YA <span aria-hidden="true">→</span>
        </Link>
      </section>
      <footer className="pokemonFooter">LA COMARCA · TCG & HOBBY</footer>

      <style jsx>{`
        .pokemonShowcase{min-height:100vh;background:#080d16;color:#f8fafc;padding-bottom:24px}
        .pokemonShowcaseNav{height:68px;padding:0 clamp(18px,5vw,72px);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #27354a;background:#080d16}
        .pokemonBrand{font-weight:900;letter-spacing:.16em;font-size:13px;color:#fff}
        .pokemonNavAccount{font-size:13px;color:#d7e3f7;border:1px solid #34445c;border-radius:999px;padding:9px 16px}
        .pokemonHero{position:relative;overflow:hidden;text-align:center;padding:76px 20px 66px;background:radial-gradient(ellipse at 50% 0%,#173b73 0,transparent 52%),linear-gradient(145deg,#101b31,#090d18 70%);border-bottom:1px solid #29466d}
        .pokemonHeroGlow{position:absolute;width:460px;height:300px;border-radius:50%;background:#2563eb26;filter:blur(65px);left:50%;top:5px;transform:translateX(-50%);pointer-events:none}
        .pokemonEyebrow{position:relative;margin:0 0 12px;color:#83c5ff;font-size:10px;font-weight:900;letter-spacing:.2em}
        .pokemonHero h1{position:relative;margin:0;font-size:clamp(38px,7vw,76px);line-height:.95;letter-spacing:-.055em;font-weight:950}
        .pokemonHero h1 span{color:#8bc5ff}
        .pokemonIntro{position:relative;max-width:560px;margin:20px auto 0;color:#c4d0e2;font-size:15px;line-height:1.6}
        .pokemonRegisterButton{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:18px;margin-top:25px;padding:15px 28px;border-radius:999px;background:linear-gradient(110deg,#2563eb,#1687c9);border:1px solid #73c4ff;color:white;font-size:13px;font-weight:950;letter-spacing:.09em;box-shadow:0 8px 30px #1673dd55;transition:transform .2s,box-shadow .2s}
        .pokemonRegisterButton:hover{transform:translateY(-2px);box-shadow:0 12px 36px #1673dd88}
        .pokemonHeroNote{position:relative;margin:12px 0 0;color:#91a4bd;font-size:11px}
        .pokemonGallerySection{max-width:1500px;margin:0 auto;padding:42px clamp(14px,3vw,40px) 55px}
        .pokemonGalleryHeading{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:22px}
        .pokemonGalleryHeading .pokemonEyebrow{margin-bottom:7px}
        .pokemonGalleryHeading h2{margin:0;font-size:clamp(24px,3vw,34px);letter-spacing:.03em}
        .pokemonTotal{color:#9fb1c8;font-size:12px}
        .pokemonSearch{display:block;max-width:460px;margin-bottom:24px}
        .pokemonSearch span{display:block;margin-bottom:7px;color:#b8c7da;font-size:11px;font-weight:800}
        .pokemonSearch input{width:100%;height:44px;padding:0 14px;border:1px solid #34445c;border-radius:11px;background:#101a29;color:#fff;font:inherit;outline:none}
        .pokemonSearch input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #3b82f633}
        .pokemonCardGrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:16px}
        .pokemonCard{min-width:0;overflow:hidden;border:1px solid #25364e;border-radius:14px;background:linear-gradient(155deg,#142033,#0c1421);transition:transform .18s,border-color .18s}
        .pokemonCard:hover{transform:translateY(-3px);border-color:#5799df}
        .pokemonCardImage{position:relative;aspect-ratio:5/7;background:#e9edf2;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .pokemonCardImage img{display:block;width:100%;height:100%;object-fit:contain;padding:5px}
        .pokemonStockTag{position:absolute;left:7px;bottom:7px;padding:5px 8px;border-radius:999px;background:#123d2b;color:#c4f5d8;border:1px solid #4c9b70;font-size:8px;font-weight:950;letter-spacing:.09em}
        .pokemonCardCaption{min-height:52px;padding:10px 11px;display:flex;flex-direction:column;gap:3px}
        .pokemonCardCaption strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
        .pokemonCardCaption small{color:#91a4bd;font-size:10px}
        .pokemonState{padding:44px 18px;text-align:center;color:#a9b8cb;border:1px dashed #34445c;border-radius:14px;background:#0e1725}
        .pokemonState button{display:block;margin:14px auto 0;padding:10px 16px;border-radius:9px;background:#2563eb;color:#fff;font-weight:800}
        .pokemonBottomCta{margin:0 auto 32px;padding:42px 18px;text-align:center;background:linear-gradient(135deg,#101e35,#101426);border-top:1px solid #29466d;border-bottom:1px solid #29466d}
        .pokemonBottomCta h2{margin:0;font-size:clamp(22px,4vw,32px)}
        .pokemonBottomCta>p:not(.pokemonEyebrow){color:#b7c5d9;font-size:13px}
        .pokemonFooter{text-align:center;color:#73849b;font-size:10px;letter-spacing:.2em;padding:12px}
        @media(max-width:650px){.pokemonHero{padding:58px 18px 50px}.pokemonGallerySection{padding-top:30px}.pokemonCardGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}.pokemonCardCaption{padding:9px;min-height:48px}.pokemonCardCaption strong{font-size:11px}.pokemonStockTag{font-size:7px}.pokemonTotal{font-size:10px}}
        @media(min-width:1200px){.pokemonCardGrid{grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:19px}}
        @media(prefers-reduced-motion:reduce){.pokemonCard,.pokemonRegisterButton{transition:none}}
      `}</style>
    </main>
  );
}
