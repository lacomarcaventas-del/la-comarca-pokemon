import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

const marketCss = `
.marketPage{padding-bottom:34px}
.marketCrumb{max-width:1200px;margin:0 auto;padding:18px 18px 8px;color:#8997a8;font-size:12px}
.marketCrumb a{color:#b9c6d5;text-decoration:none}
.marketHero{max-width:1200px;margin:0 auto;padding:0 18px}
.marketHeroVisual{min-height:400px;position:relative;overflow:hidden;border:1px solid rgba(0,238,255,.65);border-radius:18px;background:radial-gradient(circle at 68% 45%,rgba(0,234,255,.13),transparent 25%),radial-gradient(circle at 86% 72%,rgba(255,32,231,.12),transparent 30%),linear-gradient(115deg,#06101b 0%,#091525 48%,#16091d 100%);box-shadow:0 18px 55px rgba(0,0,0,.38);padding:58px}
.marketHeroVisual:before{content:"";position:absolute;inset:0;background:linear-gradient(125deg,transparent 0 43%,rgba(0,234,255,.06) 44%,transparent 45%),linear-gradient(155deg,transparent 0 65%,rgba(255,32,231,.06) 66%,transparent 67%);pointer-events:none}
.marketHeroKicker{position:relative;z-index:2;color:#f2c78c;font-size:18px;letter-spacing:.34em;font-weight:800}
.marketHeroTitle{position:relative;z-index:2;font-size:78px;line-height:.9;font-weight:950;letter-spacing:-.045em;color:#fff;margin:10px 0 18px;text-shadow:0 0 24px rgba(0,234,255,.2)}
.marketHeroRule{position:relative;z-index:2;width:380px;height:4px;background:linear-gradient(90deg,#00eaff,#ff20e7);border-radius:4px}
.marketHeroMain{position:relative;z-index:2;font-size:27px;font-weight:900;color:#fff;margin-top:22px}
.marketHeroEn{position:relative;z-index:2;font-size:17px;color:#b9d8ee;margin-top:6px;letter-spacing:.18em}
.marketHeroSub{position:relative;z-index:2;font-size:22px;font-weight:800;color:#fff;margin-top:28px}.marketHeroSubEn{position:relative;z-index:2;font-size:16px;color:#b9d8ee;margin-top:5px}
.marketHeroPatience{position:absolute;z-index:4;right:48px;top:42px;width:280px;padding:22px 24px;transform:rotate(-4deg);border-radius:12px;background:rgba(5,11,21,.88);border:1px solid rgba(255,32,231,.35);box-shadow:0 14px 35px rgba(0,0,0,.35)}
.marketHeroPatience strong{display:block;color:#fff;font-size:25px;line-height:1.08}.marketHeroPatience em{display:block;color:#c8d9e8;font-size:12px;line-height:1.5;margin-top:12px;font-style:normal}
.marketCardsArt{position:absolute;right:220px;bottom:-45px;width:370px;height:270px;transform:rotate(8deg);opacity:.9}
.marketCardsArt span{position:absolute;width:155px;height:220px;border:1px solid rgba(0,234,255,.5);border-radius:16px;background:linear-gradient(145deg,#16283c,#07101b);box-shadow:0 0 25px rgba(0,234,255,.08)}.marketCardsArt span:nth-child(1){left:20px;transform:rotate(-16deg)}.marketCardsArt span:nth-child(2){left:100px;top:-30px;transform:rotate(4deg);border-color:rgba(255,32,231,.5)}.marketCardsArt span:nth-child(3){left:180px;top:8px;transform:rotate(18deg)}
.marketTrust{max-width:1200px;margin:18px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:0}
.marketTrustItem{min-height:92px;display:flex;align-items:center;gap:14px;padding:14px 22px;border-right:1px solid rgba(0,234,255,.2)}.marketTrustItem:last-child{border-right:0}
.marketTrustIcon{font-size:30px;color:#00eaff;text-shadow:0 0 12px rgba(0,234,255,.5)}.marketTrust strong{display:block;color:#fff;font-size:14px;line-height:1.3}.marketTrust span{display:block;color:#9eb1c3;font-size:11px;line-height:1.35;margin-top:5px}
.marketActions{max-width:1200px;margin:10px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.marketCard{min-height:205px;padding:25px;border:1px solid rgba(0,234,255,.28);border-radius:15px;background:linear-gradient(145deg,#0d1928,#07101a);box-shadow:0 12px 30px rgba(0,0,0,.22);color:#fff;text-decoration:none;transition:.18s ease;position:relative;overflow:hidden}.marketCard:nth-child(3){border-color:rgba(255,32,231,.28)}
.marketCard:hover{transform:translateY(-2px);border-color:rgba(0,234,255,.65);box-shadow:0 16px 38px rgba(0,0,0,.3)}
.marketCardIcon{font-size:38px;color:#00eaff;text-shadow:0 0 13px rgba(0,234,255,.55);position:relative}.marketCard:nth-child(3) .marketCardIcon{color:#ff3be7}
.marketCard h2{font-size:18px;margin:12px 0 2px;position:relative}.marketCard h2 span{display:block;color:#00eaff;font-size:11px;letter-spacing:.12em;margin-top:5px}.marketCard p{position:relative;color:#c4ced9;font-size:13px;line-height:1.55;margin:13px 0 0;max-width:430px}
.marketFinalCta{max-width:1200px;margin:20px auto 0;padding:22px 26px;display:grid;grid-template-columns:1.1fr 1fr 1.05fr;gap:22px;align-items:center;border:1px solid rgba(0,234,255,.48);border-radius:16px;background:radial-gradient(circle at 20% 50%,rgba(0,234,255,.1),transparent 28%),linear-gradient(100deg,#07131f,#0b1020 55%,#12091a);box-shadow:0 12px 38px rgba(0,0,0,.3)}
.marketFinalCta>div{padding-right:22px;border-right:1px solid rgba(0,234,255,.2)}.marketFinalCta strong{display:block;color:#f3d29b;font-size:16px;line-height:1.3}.marketFinalCta span{display:block;color:#b9d8ee;font-size:11px;line-height:1.45;margin-top:7px}
.marketFinalCta a{display:flex;flex-direction:column;gap:5px;padding:15px 18px;border:1px solid #00eaff;border-radius:11px;background:linear-gradient(100deg,rgba(0,234,255,.08),rgba(255,32,231,.1));color:#fff;text-decoration:none;box-shadow:0 0 22px rgba(0,234,255,.1)}.marketFinalCta a b{color:#00eaff;font-size:14px}.marketFinalCta a small{color:#c9dbea;font-size:10px}
.marketContact{max-width:1200px;margin:14px auto 0;padding:0 18px}.marketContactInner{display:grid;grid-template-columns:1fr 1fr;align-items:center;border:1px solid rgba(0,234,255,.25);border-radius:15px;background:rgba(5,14,24,.72);padding:20px 26px}
.marketMail{display:flex;align-items:center;gap:18px}.marketMailIcon{font-size:38px;color:#00eaff}.marketKicker{color:#8defff;font-size:11px;letter-spacing:.13em}.marketEmail{display:inline-block;margin-top:7px;color:#00eaff;font-size:22px;font-weight:900;text-decoration:none}.marketPhoto{border-left:1px solid rgba(0,234,255,.2);padding-left:28px;color:#d9e5ef;font-size:13px;line-height:1.5}.marketPhoto strong{display:block;color:#fff;margin-bottom:4px}
@media(max-width:800px){.marketHeroVisual{min-height:500px;padding:42px 28px}.marketHeroTitle{font-size:58px}.marketHeroRule{width:250px}.marketHeroPatience{right:25px;top:auto;bottom:28px;width:245px}.marketCardsArt{display:none}.marketTrust{grid-template-columns:1fr 1fr}.marketTrustItem:nth-child(2){border-right:0}.marketActions{grid-template-columns:1fr}.marketFinalCta{grid-template-columns:1fr}.marketFinalCta>div{border-right:0;border-bottom:1px solid rgba(0,234,255,.18);padding:0 0 14px}.marketContactInner{grid-template-columns:1fr;gap:18px}.marketPhoto{border-left:0;border-top:1px solid rgba(0,234,255,.2);padding:18px 0 0}}
@media(max-width:520px){.marketTrust{grid-template-columns:1fr}.marketTrustItem{border-right:0;border-bottom:1px solid rgba(0,234,255,.15)}.marketTrustItem:last-child{border-bottom:0}.marketHeroMain{font-size:22px}.marketHeroEn{font-size:13px}}
`;

// Market visual refresh\nexport default function MarketPage(){
  return <div className="siteShell marketPage">
    <style>{marketCss}</style>
    <section className="shippingHero" aria-label="Envíos a todo México">
      <div className="shippingInner">
        <div className="shippingLead"><strong>ENVIAMOS A<br/>TODO EL PAÍS</strong></div>
        <div className="shippingRoute"><span className="routeLine"></span><i>◆</i><i>◆</i><i>◆</i></div>
        <div className="carrier mexpost"><b>▰ MEXPOST</b><span>3–5 días hábiles<br/>Cobertura nacional</span></div>
        <div className="carrier fedex"><b><em>Fed</em>Ex</b><span>3 días hábiles<br/>Rápido y seguro</span></div>
      </div>
    </section>
    <header className="top siteTop">
      <Link href="/" className="logoLink"><BrandLogo/></Link>
      <nav className="mainNav navPills">
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/tickets">Ligas</Link>
        <Link href="/#comunidad">Comunidad</Link>
        <Link href="/eventos">Eventos</Link>
        <Link href="/market" className="marketActive">Market</Link>
      </nav>
      <div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div>
    </header>

    <main>
      <div className="marketCrumb"><Link href="/">Inicio</Link> &nbsp;›&nbsp; Market</div>

      <section className="marketHero">
        <div className="marketHeroVisual">
          <div className="marketHeroKicker">LA COMARCA</div>
          <div className="marketHeroTitle">MARKET</div>
          <div className="marketHeroRule"></div>
          <div className="marketHeroMain">COMPRA · VENDE · INTERCAMBIA</div>
          <div className="marketHeroEn">BUY · SELL · TRADE</div>
          <div className="marketHeroSub">Tu colección puede llegar más lejos.</div>
          <div className="marketHeroSubEn">Your collection can go further.</div>
          <div className="marketHeroPatience"><strong>La paciencia es requerida…</strong><em>Grandes colecciones toman tiempo, y las buenas historias también.<br/><br/>Patience is required… Great collections take time, and so do great stories.</em></div>
          <div className="marketCardsArt"><span></span><span></span><span></span></div>
        </div>
      </section>  <section className="marketTrust" aria-label="Market information">
        <div className="marketTrustItem"><b className="marketTrustIcon">◎</b><div><strong>Vende a todo México y el mundo hoy.</strong><span>Sell across Mexico and worldwide today.</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">▣</b><div><strong>Te ayudamos con la logística de envío.</strong><span>We help you with shipping logistics.</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">◇</b><div><strong>Transacciones seguras.</strong><span>Secure transactions.</span></div></div>
      </section>

      <section className="marketActions">
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Vender%20mi%20colecci%C3%B3n%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">▱</div><h2>VENDE TU COLECCIÓN <span>SELL YOUR COLLECTION</span></h2>
          <p>¿Tienes cartas, productos o una colección completa? Te hacemos una oferta justa.<br/>Have cards, products, or a full collection? We’ll make you a fair offer.</p>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Consulta%20de%20colecciones%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⌑</div><h2>COMPRA COLECCIONES <span>BUY COLLECTIONS</span></h2>
          <p>Tenemos colecciones y lotes disponibles para jugadores y coleccionistas de todo el mundo.<br/>We have collections and lots available worldwide.</p>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Intercambio%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⇄</div><h2>INTERCAMBIA <span>TRADE</span></h2>
          <p>¿Buscas algo específico? También evaluamos intercambios.<br/>Looking for something specific? We also consider trades.</p>
        </a>
      </section>

      <section className="marketContact">
        <div className="marketContactInner">
          <div className="marketMail"><b className="marketMailIcon">✉</b><div><div className="marketKicker">ENVÍA TU LISTA / SEND YOUR LIST</div><a className="marketEmail" href="mailto:market@lacomarca.com.mx?subject=Mi%20lista%20-%20La%20Comarca%20Market">market@lacomarca.com.mx</a></div></div>
          <div className="marketPhoto"><strong>Acompaña tu lista con imágenes claras de las cartas.</strong>Las imágenes nos ayudan a evaluar más rápido.<br/><strong>Please include clear photos of your cards.</strong>Images help us evaluate your items faster.</div>
        </div>
      </section>

      <section className="marketFinalCta">
        <div><strong>Te ayudamos con la logística de envío.</strong><span>We help you with shipping logistics.</span></div>
        <div><strong>Vende a todo México y el mundo hoy.</strong><span>Sell across Mexico and worldwide today.</span></div>
        <a href="/cuenta"><b>Solicita una cuenta para gestión de colección hoy.</b><small>Request an account for collection management today.</small></a>
      </section>lassName="marketTrust" aria-label="Market information">
        <div className="marketTrustItem"><b className="marketTrustIcon">◎</b><div><strong>Vende a todo México y el mundo hoy.</strong><span>Sell across Mexico and worldwide today.</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">▣</b><div><strong>Te ayudamos con la logística de envío.</strong><span>We help you with shipping logistics.</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">◇</b><div><strong>Transacciones seguras.</strong><span>Secure transactions.</span></div></div>
      </section>

      <section className="marketActions">
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Vender%20mi%20colecci%C3%B3n%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">▱</div><h2>VENDE TU COLECCIÓN <span>SELL YOUR COLLECTION</span></h2>
          <p>¿Tienes cartas, productos o una colección completa? Te hacemos una oferta justa.<br/>Have cards, products, or a full collection? We’ll make you a fair offer.</p>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Consulta%20de%20colecciones%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⌑</div><h2>COMPRA COLECCIONES <span>BUY COLLECTIONS</span></h2>
          <p>Tenemos colecciones y lotes disponibles para jugadores y coleccionistas de todo el mundo.<br/>We have collections and lots available worldwide.</p>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Intercambio%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⇄</div><h2>INTERCAMBIA <span>TRADE</span></h2>
          <p>¿Buscas algo específico? También evaluamos intercambios.<br/>Looking for something specific? We also consider trades.</p>
        </a>
      </section>

      <section className="marketContact">
        <div className="marketContactInner">
          <div className="marketMail"><b className="marketMailIcon">✉</b><div><div className="marketKicker">ENVÍA TU LISTA / SEND YOUR LIST</div><a className="marketEmail" href="mailto:market@lacomarca.com.mx?subject=Mi%20lista%20-%20La%20Comarca%20Market">market@lacomarca.com.mx</a></div></div>
          <div className="marketPhoto"><strong>Acompaña tu lista con imágenes claras de las cartas.</strong>Las imágenes nos ayudan a evaluar más rápido.<br/><strong>Please include clear photos of your cards.</strong>Images help us evaluate your items faster.</div>
        </div>
      </section>

      <section className="marketFinalCta">
  <div><strong>Te ayudamos con la logística de envío.</strong><span>We help you with shipping logistics.</span></div>
  <div><strong>Vende a todo México y el mundo hoy.</strong><span>Sell across Mexico and worldwide today.</span></div>
  <a href="/cuenta"><b>Solicita una cuenta para gestión de colección hoy.</b><small>Request an account for collection management today.</small></a>
</section>

    </main>

    <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
  </div>
}
