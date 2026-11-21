"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "../lib/supabase";

type FeaturedProduct = {
  id: string;
  name: string;
  image_url: string | null;
  price: number;
  stock: number;
  card_number: string | null;
};

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function ProductCarousel() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    async function loadProducts() {
      try {
        const sb = supabaseBrowser();
        const pageSize = 1000;
        let from = 0;
        let available: FeaturedProduct[] = [];
        while (true) {
          const { data, error } = await sb
            .from("cards")
            .select("id,name,image_url,price,stock,card_number")
            .eq("published", true)
            .gt("stock", 0)
            .range(from, from + pageSize - 1);
          if (error) throw error;
          const page = (data || []) as FeaturedProduct[];
          available = available.concat(page);
          if (page.length < pageSize) break;
          from += pageSize;
        }
        const hidden = new Set(["producto al azar", "producto al azar 1", "producto al azar 2"]);
        const eligible = available.filter((p) =>
          !hidden.has(String(p.name || "").trim().toLowerCase())
        );
        // Fisher-Yates: select a fresh random sample on each page load.
        for (let i = eligible.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
        }
        if (active) setProducts(eligible.slice(0, 24));
      } catch (error) {
        console.error("No fue posible cargar los productos destacados", error);
        if (active) setProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadProducts();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (paused || products.length < 2) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const maxScroll = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= maxScroll - 8) {
        track.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const firstCard = track.querySelector<HTMLElement>("[data-product-card]");
        const gap = 16;
        track.scrollBy({ left: (firstCard?.getBoundingClientRect().width || 240) + gap, behavior: "smooth" });
      }
    }, 4200);
    return () => window.clearInterval(timer);
  }, [paused, products.length]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>("[data-product-card]");
    track.scrollBy({
      left: direction * ((firstCard?.getBoundingClientRect().width || 240) + 16),
      behavior: "smooth",
    });
  }

  return (
    <section className="wrap sectionBlock productShowcase" aria-label="Productos destacados">
      <div className="sectionTitle productShowcaseHeading">
        <div>
          <h2>Destacados de La Comarca</h2>
          <span>Productos disponibles en nuestro catálogo</span>
        </div>
        <Link href="/catalogo">Ver todo el catálogo →</Link>
      </div>
      {loading ? (
        <div className="productCarouselLoading">Cargando productos disponibles…</div>
      ) : products.length === 0 ? (
        <div className="productCarouselLoading">Consulta nuestro catálogo para descubrir los productos disponibles.</div>
      ) : (
        <>
          <div className="productCarouselShell" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={() => setPaused(false)}>
            <button type="button" className="productCarouselArrow previous" aria-label="Productos anteriores" onClick={() => move(-1)}>‹</button>
            <div className="productCarouselTrack" ref={trackRef}>
              {products.map((product) => (
                <Link href="/catalogo" className="productCarouselCard" data-product-card key={product.id}>
                  <div className="productCarouselImage">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => { event.currentTarget.src = "/placeholder.svg"; }}
                    />
                  </div>
                  <div className="productCarouselInfo">
                    <strong title={product.name}>{product.name}</strong>
                    {product.card_number && <small>{product.card_number}</small>}
                    <span className="productCarouselPrice">{money.format(Number(product.price) || 0)}</span>
                    <span className="productCarouselStock">{product.stock} disponible(s)</span>
                  </div>
                </Link>
              ))}
            </div>
            <button type="button" className="productCarouselArrow next" aria-label="Siguientes productos" onClick={() => move(1)}>›</button>
          </div>
          <div className="productCarouselFooter">
            <span>Desliza para explorar más productos</span>
            <Link href="/catalogo">Explorar catálogo →</Link>
          </div>
        </>
      )}
      <style>{`
        .productShowcase{margin-top:28px}
        .productShowcaseHeading{align-items:end}
        .productShowcaseHeading h2{margin-bottom:5px}
        .productShowcaseHeading span{color:#9ca3af;font-size:12px}
        .productCarouselShell{position:relative}
        .productCarouselTrack{display:grid;grid-auto-flow:column;grid-auto-columns:calc((100% - 48px)/4);gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;scrollbar-width:none;padding:4px 2px 12px}
        .productCarouselTrack::-webkit-scrollbar{display:none}
        .productCarouselCard{min-width:0;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:#f8fafc;background:linear-gradient(145deg,#151b25,#0c1119);border:1px solid rgba(240,180,91,.22);border-radius:14px;scroll-snap-align:start;transition:transform .2s,border-color .2s,box-shadow .2s}
        .productCarouselCard:hover{transform:translateY(-3px);border-color:rgba(240,180,91,.65);box-shadow:0 12px 28px #0006}
        .productCarouselImage{height:190px;background:#f2f0eb;display:flex;align-items:center;justify-content:center;overflow:hidden}
        .productCarouselImage img{width:100%;height:100%;object-fit:contain;display:block}
        .productCarouselInfo{display:flex;flex-direction:column;gap:6px;padding:13px;min-height:116px}
        .productCarouselInfo strong{font-size:13px;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:35px}
        .productCarouselInfo small{font-size:10px;color:#9ca3af}
        .productCarouselPrice{font-size:18px;font-weight:900;color:#f0b45b;margin-top:auto}
        .productCarouselStock{font-size:10px;color:#9ca3af}
        .productCarouselArrow{position:absolute;z-index:2;top:78px;width:38px;height:38px;border:1px solid rgba(240,180,91,.5);border-radius:50%;background:#0a0e15eF;color:#f0b45b;font-size:27px;line-height:1;cursor:pointer;box-shadow:0 4px 16px #0008}
        .productCarouselArrow.previous{left:-15px}
        .productCarouselArrow.next{right:-15px}
        .productCarouselArrow:hover{background:#f0b45b;color:#17120b}
        .productCarouselFooter{display:flex;justify-content:space-between;gap:12px;color:#9ca3af;font-size:11px;padding:4px 2px 0}
        .productCarouselFooter a,.productShowcaseHeading a{color:#f0b45b;text-decoration:none}
        .productCarouselLoading{padding:30px;border:1px solid rgba(240,180,91,.22);border-radius:14px;color:#aeb7c4;text-align:center;background:#101722}
        @media(max-width:900px){.productCarouselTrack{grid-auto-columns:calc((100% - 32px)/3)}.productCarouselImage{height:165px}}
        @media(max-width:650px){.productShowcase{margin-top:22px}.productCarouselTrack{grid-auto-columns:calc((100% - 14px)/2);gap:14px}.productCarouselImage{height:145px}.productCarouselInfo{padding:11px;min-height:108px}.productCarouselInfo strong{font-size:12px}.productCarouselPrice{font-size:16px}.productCarouselArrow{top:58px;width:32px;height:32px;font-size:23px}.productCarouselArrow.previous{left:-9px}.productCarouselArrow.next{right:-9px}.productCarouselFooter{font-size:10px;flex-wrap:wrap}}
        @media(prefers-reduced-motion:reduce){.productCarouselTrack{scroll-behavior:auto}.productCarouselCard{transition:none}}
      `}</style>
    </section>
  );
}
