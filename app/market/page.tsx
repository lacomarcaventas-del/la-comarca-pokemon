import Image from "next/image";
import Link from "next/link";
import BrandLogo from "../../components/BrandLogo";

const marketCss = `
.marketPage{padding-bottom:34px}
.marketCrumb{max-width:1200px;margin:0 auto;padding:18px 18px 8px;color:#8997a8;font-size:12px}
.marketCrumb a{color:#b9c6d5;text-decoration:none}
.marketHero{max-width:1200px;margin:0 auto;padding:0 18px}
.marketHero img{width:100%;height:auto;display:block;border:1px solid rgba(0,238,255,.5);border-radius:18px;box-shadow:0 18px 55px rgba(0,0,0,.35)}
.marketTrust{max-width:1200px;margin:18px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:0;border-bottom:1px solid rgba(0,234,255,.16)}
.marketTrustItem{min-height:78px;display:flex;align-items:center;gap:12px;padding:12px 20px;border-right:1px solid rgba(0,234,255,.18)}
.marketTrustItem:last-child{border-right:0}
.marketTrustIcon{font-size:28px;color:#00eaff;text-shadow:0 0 12px rgba(0,234,255,.5)}
.marketTrust strong{display:block;color:#fff;font-size:14px}
.marketTrust span{display:block;color:#8ea2b7;font-size:12px;margin-top:4px}
.marketActions{max-width:1200px;margin:22px auto 0;padding:0 18px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.marketCard{min-height:190px;padding:22px;border:1px solid rgba(0,234,255,.22);border-radius:15px;background:linear-gradient(145deg,#0d1725,#07101a);box-shadow:0 12px 30px rgba(0,0,0,.2);color:#fff;text-decoration:none;transition:.18s ease;position:relative;overflow:hidden}
.marketCard:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 15% 20%,rgba(0,234,255,.08),transparent 30%),radial-gradient(circle at 90% 85%,rgba(255,32,231,.08),transparent 28%);pointer-events:none}
.marketCard:hover{transform:translateY(-2px);border-color:rgba(0,234,255,.55);box-shadow:0 15px 35px rgba(0,0,0,.3)}
.marketCardIcon{font-size:34px;color:#00eaff;text-shadow:0 0 12px rgba(0,234,255,.55);position:relative}
.marketCard h2{font-size:19px;margin:10px 0 2px;position:relative}
.marketCard h2 span{display:block;color:#00eaff;font-size:11px;letter-spacing:.1em;margin-top:4px}
.marketCard p{position:relative;color:#c4ced9;font-size:13px;line-height:1.55;margin:12px 0 0;max-width:430px}
.marketArrow{position:absolute;right:20px;top:50%;width:38px;height:38px;border:1px solid rgba(0,234,255,.65);border-radius:50%;display:grid;place-items:center;color:#00eaff;font-size:20px}
.marketContact{max-width:1200px;margin:16px auto 0;padding:0 18px}
.marketContactInner{display:grid;grid-template-columns:1fr 1fr;align-items:center;border:1px solid #00eaff;border-radius:15px;background:linear-gradient(100deg,rgba(0,234,255,.07),rgba(255,32,231,.04));padding:22px 28px;box-shadow:0 0 25px rgba(0,234,255,.08)}
.marketMail{display:flex;align-items:center;gap:18px}
.marketMailIcon{font-size:38px;color:#00eaff}
.marketKicker{color:#8defff;font-size:11px;letter-spacing:.13em}
.marketEmail{display:inline-block;margin-top:7px;color:#00eaff;font-size:22px;font-weight:900;text-decoration:none}
.marketPhoto{border-left:1px solid rgba(0,234,255,.25);padding-left:28px;color:#d9e5ef;font-size:13px;line-height:1.5}
.marketPhoto strong{display:block;color:#fff;margin-bottom:4px}
.marketBrands{max-width:1200px;margin:25px auto 0;padding:0 18px;text-align:center}
.marketBrandsTitle{color:#8defff;font-size:10px;letter-spacing:.2em;text-transform:uppercase}
.marketBrandRow{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-top:15px;color:#dce6ef;font-weight:800;font-size:13px}
.marketFooterLine{margin:18px auto 0;max-width:1200px;padding:16px 18px 0;border-top:1px solid rgba(0,234,255,.14);text-align:center;color:#8ea2b7;font-size:11px;letter-spacing:.14em}
@media(max-width:800px){.marketTrust{grid-template-columns:1fr 1fr}.marketTrustItem:nth-child(2){border-right:0}.marketTrustItem:nth-child(-n+2){border-bottom:1px solid rgba(0,234,255,.12)}.marketActions{grid-template-columns:1fr}.marketContactInner{grid-template-columns:1fr;gap:20px}.marketPhoto{border-left:0;border-top:1px solid rgba(0,234,255,.25);padding-left:0;padding-top:18px}.marketEmail{font-size:18px}}
@media(max-width:520px){.marketTrust{grid-template-columns:1fr}.marketTrustItem,.marketTrustItem:nth-child(2){border-right:0;border-bottom:1px solid rgba(0,234,255,.12)}.marketTrustItem:last-child{border-bottom:0}.marketHero img{border-radius:12px}}
`;

export default function MarketPage(){
  return <div className="siteShell marketPage">
    <style>{marketCss+`.marketFinalCta{max-width:1200px;margin:22px auto 0;padding:20px 24px;display:grid;grid-template-columns:1fr 1fr 1.35fr;gap:18px;align-items:center;border:1px solid rgba(0,234,255,.38);border-radius:16px;background:linear-gradient(100deg,rgba(0,234,255,.06),rgba(255,32,231,.05));box-shadow:0 10px 35px rgba(0,0,0,.22)}
.marketFinalCta>div{padding-right:18px;border-right:1px solid rgba(0,234,255,.18)}
.marketFinalCta strong{display:block;color:#fff;font-size:15px}.marketFinalCta span{display:block;color:#8ea2b7;font-size:11px;margin-top:5px}
.marketFinalCta a{display:flex;flex-direction:column;gap:4px;justify-content:center;padding:14px 18px;border-radius:11px;background:linear-gradient(100deg,#681cff,#e91bd7);color:#fff;text-decoration:none;box-shadow:0 0 18px rgba(164,36,255,.25)}
.marketFinalCta a b{font-size:14px}.marketFinalCta a small{font-size:10px;color:#f1ddff}
`}@media(max-width:800px){.marketFinalCta{grid-template-columns:1fr;gap:12px}.marketFinalCta>div{padding-right:0;border-right:0;padding-bottom:12px;border-bottom:1px solid rgba(0,234,255,.18)}}</style>
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
        <Image src="/market-banner.svg" alt="La Comarca Market — Compra, vende e intercambia / Buy, sell and trade" width={1600} height={520} priority/>
      </section>

      <section className="marketTrust" aria-label="Market information">
        <div className="marketTrustItem"><b className="marketTrustIcon">◎</b><div><strong>En todo el mundo</strong><span>Worldwide</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">◌</b><div><strong>Atención en español e inglés</strong><span>Support in Spanish and English</span></div></div>
        <div className="marketTrustItem"><b className="marketTrustIcon">◇</b><div><strong>Transacciones seguras</strong><span>Secure transactions</span></div></div>
      </section>

      <section className="marketActions">
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Vender%20mi%20colecci%C3%B3n%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">▱</div><h2>VENDE TU COLECCIÓN <span>SELL YOUR COLLECTION</span></h2>
          <p>¿Tienes cartas, productos o una colección completa? Te hacemos una oferta justa.<br/>Have cards, products, or a full collection? We’ll make you a fair offer.</p><span className="marketArrow">›</span>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Consulta%20de%20colecciones%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⌑</div><h2>COMPRA COLECCIONES <span>BUY COLLECTIONS</span></h2>
          <p>Tenemos colecciones y lotes disponibles para jugadores y coleccionistas de todo el mundo.<br/>We have collections and lots available worldwide.</p><span className="marketArrow">›</span>
        </a>
        <a className="marketCard" href="mailto:market@lacomarca.com.mx?subject=Intercambio%20-%20La%20Comarca%20Market">
          <div className="marketCardIcon">⇄</div><h2>INTERCAMBIA <span>TRADE</span></h2>
          <p>¿Buscas algo específico? También evaluamos intercambios.<br/>Looking for something specific? We also consider trades.</p><span className="marketArrow">›</span>
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
<div className="marketFooterLine">JUEGA · COLECCIONA · PERTENECE &nbsp; · &nbsp; PLAY · COLLECT · BELONG</div>
    </main>

    <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
  </div>
}
