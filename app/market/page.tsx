import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

const marketCss = `
.marketPage{padding-bottom:40px}
.marketCrumb{max-width:1200px;margin:0 auto;padding:16px 18px 10px;color:#8797a8;font-size:12px}.marketCrumb a{color:#b8c7d6;text-decoration:none}
.marketHero{max-width:1200px;margin:0 auto;padding:0 18px}
.marketHeroBox{position:relative;min-height:405px;overflow:hidden;border:1px solid rgba(0,238,255,.72);border-radius:18px;background:radial-gradient(circle at 72% 48%,rgba(0,234,255,.16),transparent 23%),radial-gradient(circle at 88% 75%,rgba(255,32,231,.15),transparent 30%),linear-gradient(115deg,#07111d,#0a1727 52%,#15091d);box-shadow:0 20px 55px rgba(0,0,0,.4);padding:54px 58px}
.marketHeroBox:before{content:"";position:absolute;inset:0;background:linear-gradient(125deg,transparent 0 42%,rgba(0,234,255,.055) 43%,transparent 44%),linear-gradient(155deg,transparent 0 66%,rgba(255,32,231,.055) 67%,transparent 68%);pointer-events:none}
.marketKicker{position:relative;z-index:3;color:#f1cf99;font-size:18px;letter-spacing:.34em;font-weight:800}
.marketTitle{position:relative;z-index:3;margin:8px 0 14px;color:#fff;font-size:78px;line-height:.9;font-weight:950;letter-spacing:-.045em;text-shadow:0 0 25px rgba(0,234,255,.2)}
.marketTitleAccent{position:relative;z-index:3;width:360px;height:4px;border-radius:4px;background:linear-gradient(90deg,#00eaff,#ff20e7)}
.marketHeroMain{position:relative;z-index:3;margin-top:22px;color:#fff;font-size:27px;font-weight:900}.marketHeroEn{position:relative;z-index:3;margin-top:6px;color:#bdd4e6;font-size:16px;letter-spacing:.2em}
.marketHeroSub{position:relative;z-index:3;margin-top:27px;color:#fff;font-size:21px;font-weight:800}.marketHeroSubEn{position:relative;z-index:3;margin-top:5px;color:#a9c2d5;font-size:15px}
.marketPatience{position:absolute;z-index:4;right:45px;top:38px;width:285px;padding:22px 23px;border:1px solid rgba(255,32,231,.45);border-radius:13px;background:rgba(4,10,19,.88);box-shadow:0 14px 40px rgba(0,0,0,.4);transform:rotate(-4deg)}
.marketPatience strong{display:block;color:#fff;font-size:25px;line-height:1.05}.marketPatience span{display:block;margin-top:12px;color:#c7d9e7;font-size:12px;line-height:1.5}
.marketCards{position:absolute;right:180px;bottom:-58px;width:410px;height:280px;transform:rotate(8deg);opacity:.95}.marketCardArt{position:absolute;width:155px;height:220px;border-radius:17px;border:1px solid rgba(0,234,255,.55);background:linear-gradient(145deg,#182b42,#07101a);box-shadow:0 0 25px rgba(0,234,255,.1)}.marketCardArt:nth-child(1){left:18px;top:55px;transform:rotate(-16deg)}.marketCardArt:nth-child(2){left:118px;top:0;border-color:rgba(255,32,231,.55);transform:rotate(5deg)}.marketCardArt:nth-child(3){left:218px;top:45px;transform:rotate(19deg)}
.marketCardArt:after{content:"";position:absolute;left:50%;top:50%;width:62px;height:62px;transform:translate(-50%,-50%);border:2px solid rgba(0,234,255,.45);border-radius:50%;box-shadow:0 0 22px rgba(0,234,255,.15)}
.marketInfo{max-width:1200px;margin:18px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(4,1fr)}
.marketInfoItem{min-height:84px;padding:14px 20px;display:flex;align-items:center;gap:13px;border-right:1px solid rgba(0,234,255,.2)}.marketInfoItem:last-child{border-right:0}
.marketInfoIcon{font-size:30px;color:#00eaff;text-shadow:0 0 14px rgba(0,234,255,.45)}.marketInfo strong{display:block;color:#fff;font-size:13px;line-height:1.35}.marketInfo span{display:block;margin-top:4px;color:#91a6b9;font-size:11px;line-height:1.35}
.marketActions{max-width:1200px;margin:14px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.marketAction{min-height:205px;display:block;padding:24px;border:1px solid rgba(0,234,255,.34);border-radius:16px;background:linear-gradient(145deg,#0d1b2b,#07101a);box-shadow:0 13px 32px rgba(0,0,0,.25);text-decoration:none;transition:transform .18s ease,border-color .18s ease;position:relative;overflow:hidden}
.marketAction:nth-child(2){border-color:rgba(255,32,231,.38)}.marketAction:hover{transform:translateY(-3px);border-color:#00eaff}
.marketAction:before{content:"";position:absolute;inset:auto -20% -65% -20%;height:180px;background:radial-gradient(circle,rgba(0,234,255,.12),transparent 65%);pointer-events:none}
.marketActionIcon{position:relative;color:#00eaff;font-size:42px;line-height:1}.marketAction:nth-child(2) .marketActionIcon{color:#ff3be7}.marketAction h2{position:relative;margin:13px 0 0;color:#fff;font-size:18px}.marketAction h2 span{display:block;margin-top:5px;color:#00eaff;font-size:11px;letter-spacing:.13em}.marketAction p{position:relative;margin:14px 0 0;color:#c1ceda;font-size:13px;line-height:1.55}
.marketEmailBox{max-width:1200px;margin:16px auto 0;padding:0 18px}.marketEmailInner{display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:20px 25px;border:1px solid rgba(0,234,255,.42);border-radius:15px;background:linear-gradient(100deg,rgba(0,234,255,.07),rgba(255,32,231,.05))}
.marketEmailLabel{color:#8defff;font-size:10px;letter-spacing:.15em}.marketEmail{display:inline-block;margin-top:6px;color:#00eaff;font-size:21px;font-weight:900;text-decoration:none}.marketEmailNote{padding-left:25px;border-left:1px solid rgba(0,234,255,.2);color:#c9d8e5;font-size:12px;line-height:1.55}.marketEmailNote strong{display:block;color:#fff;margin-bottom:4px}
.marketFinal{max-width:1200px;margin:16px auto 0;padding:0 18px}.marketFinalBox{display:grid;grid-template-columns:1.15fr 1fr 1fr;gap:0;align-items:center;overflow:hidden;border:1px solid rgba(0,234,255,.65);border-radius:17px;background:radial-gradient(circle at 15% 50%,rgba(0,234,255,.12),transparent 25%),linear-gradient(105deg,#07131f,#0a1322 55%,#14091b);box-shadow:0 15px 40px rgba(0,0,0,.3)}
.marketFinalBlock{padding:25px 27px}.marketFinalBlock+.marketFinalBlock{border-left:1px solid rgba(0,234,255,.18)}
.marketFinalBlock h3{margin:0;color:#f0ce98;font-size:20px;line-height:1.15}.marketFinalBlock p{margin:8px 0 0;color:#b8cddd;font-size:12px;line-height:1.45}.marketFinalBlock h4{margin:0;color:#fff;font-size:19px;line-height:1.2}.marketFinalBlock h4 span{display:block;margin-top:5px;color:#00eaff;font-size:10px;letter-spacing:.14em}
.marketAccount{display:inline-flex;flex-direction:column;gap:4px;margin-top:13px;padding:13px 16px;border:1px solid #00eaff;border-radius:10px;background:linear-gradient(100deg,rgba(0,234,255,.08),rgba(255,32,231,.1));color:#fff;text-decoration:none}.marketAccount b{color:#00eaff;font-size:13px}.marketAccount small{color:#c6d8e6;font-size:10px}
@media(max-width:850px){.marketHeroBox{min-height:500px;padding:42px 28px}.marketTitle{font-size:60px}.marketTitleAccent{width:270px}.marketPatience{right:25px;top:auto;bottom:24px;width:250px}.marketCards{display:none}.marketInfo{grid-template-columns:1fr 1fr}.marketInfoItem:nth-child(2){border-right:0}.marketInfoItem:nth-child(-n+2){border-bottom:1px solid rgba(0,234,255,.15)}.marketActions{grid-template-columns:1fr}.marketEmailInner{grid-template-columns:1fr;gap:17px}.marketEmailNote{border-left:0;border-top:1px solid rgba(0,234,255,.2);padding:15px 0 0}.marketFinalBox{grid-template-columns:1fr}.marketFinalBlock+.marketFinalBlock{border-left:0;border-top:1px solid rgba(0,234,255,.18)}}
@media(max-width:520px){.marketInfo{grid-template-columns:1fr}.marketInfoItem,.marketInfoItem:nth-child(2){border-right:0;border-bottom:1px solid rgba(0,234,255,.15)}.marketInfoItem:last-child{border-bottom:0}.marketHeroMain{font-size:22px}.marketHeroEn{font-size:13px}.marketTitle{font-size:54px}.marketPatience{width:225px}.marketHeroBox{min-height:510px}}
`;

export default function MarketPage(){
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
        <Link href="/catalogo">Catálogo</Link><Link href="/tickets">Ligas</Link><Link href="/#comunidad">Comunidad</Link><Link href="/eventos">Eventos</Link><Link href="/market" className="marketActive">Market</Link>
      </nav>
      <div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div>
    </header>
    <main>
      <div className="marketCrumb"><Link href="/">Inicio</Link> &nbsp;›&nbsp; Market</div>
      <section className="marketHero">
        <div className="marketHeroBox">
          <div className="marketKicker">LA COMARCA</div>
          <div className="marketTitle">MARKET</div>
          <div className="marketTitleAccent"></div>
          <div className="marketHeroMain">COMPRAMOS CARTAS</div>
          <div className="marketHeroEn">WE BUY CARDS</div>
          <div className="marketHeroSub">Evaluamos cartas individuales, lotes y colecciones de TCG.</div>
          <div className="marketHeroSubEn">We evaluate individual cards, lots and TCG collections.</div>
          <div className="marketPatience"><strong>La paciencia es requerida…</strong><span>Las colecciones grandes requieren tiempo para una revisión adecuada.<br/><br/>Large collections require time for a proper review.</span></div>
          <div className="marketCards"><span className="marketCardArt"></span><span className="marketCardArt"></span><span className="marketCardArt"></span></div>
        </div>
      </section>
      <section className="marketInfo">
        <div className="marketInfoItem"><b className="marketInfoIcon">◎</b><div><strong>Compramos cartas en todo México y el mundo.</strong><span>We buy cards across Mexico and worldwide.</span></div></div>
        <div className="marketInfoItem"><b className="marketInfoIcon">▣</b><div><strong>Te ayudamos con la logística de envío para recibir tus cartas.</strong><span>We help with shipping logistics for your cards.</span></div></div>
        <div className="marketInfoItem"><b className="marketInfoIcon">◇</b><div><strong>Transacciones seguras.</strong><span>Secure transactions.</span></div></div>
        
      </section>
      <section className="marketActions">
        <a className="marketAction" href="mailto:market@lacomarca.com.mx?subject=Quiero%20vender%20mis%20cartas%20-%20La%20Comarca%20Market">
          <div className="marketActionIcon">▱</div>
          <h2>COMPRAMOS CARTAS <span>WE BUY CARDS</span></h2>
          <p>Compramos cartas individuales, lotes y colecciones de TCG. Envíanos tu lista y fotografías claras para evaluar tu material.<br/>We buy individual cards, lots, and TCG collections. Send us your list and clear photos so we can evaluate your cards.</p>
        </a>
      </section> <section className="marketEmailBox">
        <div className="marketEmailInner">
          <div><div className="marketEmailLabel">ENVÍA TU LISTA / SEND YOUR LIST</div><a className="marketEmail" href="mailto:market@lacomarca.com.mx?subject=Mi%20lista%20-%20La%20Comarca%20Market">market@lacomarca.com.mx</a></div>
          <div className="marketEmailNote"><strong>Acompaña tu lista con imágenes claras de las cartas.</strong>Las imágenes nos ayudan a evaluar más rápido.<br/><strong>Please include clear photos of your cards.</strong>Images help us evaluate your items faster.</div>
        </div>
      </section>
    </main>
    <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
  </div>
}
