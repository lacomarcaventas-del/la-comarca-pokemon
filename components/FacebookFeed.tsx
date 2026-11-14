"use client";

import { useEffect, useState } from "react";

type FacebookPost = {
  id: string;
  message: string;
  createdTime: string | null;
  permalink: string;
  imageUrl: string | null;
};

type FeedResponse = {
  configured?: boolean;
  posts?: FacebookPost[];
  error?: string;
};

function formatDate(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function FacebookFallback() {
  useEffect(() => {
    const parse = () => window.FB?.XFBML?.parse();
    if (window.FB?.XFBML) {
      parse();
      return;
    }

    const existing = document.getElementById("facebook-jssdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", parse, { once: true });
      return () => existing.removeEventListener("load", parse);
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v27.0";
    script.addEventListener("load", parse, { once: true });
    document.body.appendChild(script);
    return () => script.removeEventListener("load", parse);
  }, []);

  return (
    <div className="fb-page"
      data-href="https://www.facebook.com/ComarcaTCG"
      data-tabs="timeline"
      data-width="500"
      data-height="700"
      data-small-header="false"
      data-adapt-container-width="true"
      data-hide-cover="false"
      data-show-facepile="true"
      style={{ width: "100%" }}
    >
      <blockquote cite="https://www.facebook.com/ComarcaTCG" className="fb-xfbml-parse-ignore">
        <a href="https://www.facebook.com/ComarcaTCG">La Comarca</a>
      </blockquote>
    </div>
  );
}

export default function FacebookFeed() {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/facebook-feed")
      .then(async (response) => {
        const data = (await response.json()) as FeedResponse;
        if (active) setFeed(data);
      })
      .catch(() => {
        if (active) setFeed({ configured: false, posts: [] });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const customFeedReady = feed?.configured === true && !feed.error;

  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <div className="categoryHeader">
        <div>
          <h2>📢 La Comarca en Facebook</h2>
          <p className="muted">Publicaciones recientes de nuestra página oficial.</p>
        </div>
        <a className="btn2" href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">
          Ver Facebook
        </a>
      </div>

      {loading ? (
        <div style={{ padding: "42px 12px", textAlign: "center", color: "#aab3c0" }}>
          Cargando publicaciones…
        </div>
      ) : customFeedReady && feed?.posts?.length ? (
        <div className="comarcaFbGrid">
          {feed.posts.map((post) => (
            <article className="comarcaFbCard" key={post.id}>
              <div className="comarcaFbCardHead">
                <div className="comarcaFbAvatar">LC</div>
                <div>
                  <strong>La Comarca</strong>
                  <span>{formatDate(post.createdTime)}</span>
                </div>
                <span className="comarcaFbMark">f</span>
              </div>
              {post.message ? <p className="comarcaFbMessage">{post.message}</p> : null}
              {post.imageUrl ? (
                <a href={post.permalink} target="_blank" rel="noreferrer" className="comarcaFbImageLink">
                  {/* Facebook-hosted image URL returned by our server route. */}
                  <img src={post.imageUrl} alt="Imagen de una publicación de La Comarca" loading="lazy" />
                </a>
              ) : null}
              <a className="comarcaFbOpen" href={post.permalink} target="_blank" rel="noreferrer">
                Ver publicación en Facebook ↗
              </a>
            </article>
          ))}
        </div>
      ) : customFeedReady ? (
        <div className="comarcaFbNotice">No hay publicaciones disponibles para mostrar en este momento.</div>
      ) : (
        <div className="comarcaFbFallback">
          <div className="comarcaFbFallbackCopy">
            <strong>Estamos preparando nuestro muro de publicaciones.</strong>
            <span>Mientras conectamos la publicación automática, puedes consultar aquí nuestra página oficial.</span>
          </div>
          <div className="comarcaFbEmbed">
            <FacebookFallback />
          </div>
        </div>
      )}

      <style jsx>{`
        .comarcaFbGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:20px}
        .comarcaFbCard{min-width:0;overflow:hidden;border:1px solid rgba(214,155,74,.22);border-radius:15px;background:linear-gradient(155deg,#111923,#090e15);display:flex;flex-direction:column}
        .comarcaFbCardHead{display:flex;align-items:center;gap:10px;padding:14px 15px}
        .comarcaFbAvatar{width:36px;height:36px;flex:0 0 36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#e9a36c,#9d302f);color:#160d0b;font-weight:900;font-family:Georgia,serif}
        .comarcaFbCardHead strong,.comarcaFbCardHead span{display:block}
        .comarcaFbCardHead strong{color:#f4eadb;font-size:13px}
        .comarcaFbCardHead div:nth-child(2) span{color:#929cab;font-size:11px;margin-top:2px}
        .comarcaFbMark{margin-left:auto!important;width:22px;height:22px;border-radius:50%;background:#1877f2;color:white;font-weight:900;text-align:center;line-height:22px;font-family:Arial}
        .comarcaFbMessage{color:#e5e9ef;font-size:13px;line-height:1.55;padding:0 15px 14px;margin:0;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
        .comarcaFbImageLink{display:block;background:#080c12;aspect-ratio:16/10;overflow:hidden}
        .comarcaFbImageLink img{display:block;width:100%;height:100%;object-fit:cover}
        .comarcaFbOpen{margin-top:auto;padding:13px 15px;color:#efb66f;font-size:12px;font-weight:700;text-decoration:none;border-top:1px solid rgba(255,255,255,.07)}
        .comarcaFbOpen:hover{color:#fff}
        .comarcaFbNotice{padding:38px 12px;text-align:center;color:#aab3c0}
        .comarcaFbFallback{display:grid;grid-template-columns:minmax(220px,1fr) minmax(0,500px);align-items:center;gap:24px;margin-top:18px}
        .comarcaFbFallbackCopy{display:flex;flex-direction:column;gap:9px;color:#e7eaf0;font-size:14px;line-height:1.5}
        .comarcaFbFallbackCopy span{color:#9da8b7;font-size:13px}
        .comarcaFbEmbed{width:100%;max-width:500px;min-width:0;margin:0 auto}
        .comarcaFbFallback :global(.fb-page),.comarcaFbFallback :global(iframe){max-width:100%}
        @media(max-width:900px){.comarcaFbGrid{grid-template-columns:repeat(2,minmax(0,1fr))}.comarcaFbFallback{grid-template-columns:1fr}.comarcaFbFallbackCopy{text-align:center}}
        @media(max-width:560px){.comarcaFbGrid{grid-template-columns:1fr}.comarcaFbCard{max-width:100%}}
      `}</style>
    </section>
  );
}

declare global {
  interface Window {
    FB?: { XFBML?: { parse: () => void } };
  }
}
