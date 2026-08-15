import Link from "next/link";
import FacebookFeed from "../components/FacebookFeed";
import BrandLogo from "../components/BrandLogo";

const lines=[
  ["Pokémon","pokemon"],["Magic: The Gathering","magic"],["Yu-Gi-Oh!","yugioh"],["One Piece Card Game","onepiece"],
  ["Disney Lorcana","lorcana"],["Weiss Schwarz","weiss"],["Gundam Card Game","gundam"],["Dungeons & Dragons","dnd"]
];

export default function Home(){return <div className="siteShell">
  <header className="top siteTop"><Link href="/" className="logoLink"><BrandLogo/></Link><nav className="mainNav"><Link href="/catalogo">Catálogo</Link><a href="#lineas">Categorías</a><a href="#destacados">Destacados</a><a href="#comunidad">Comunidad</a></nav><div className="topActions"><Link href="/cuenta">♙ Clientes</Link><Link href="/catalogo" className="cartMini">🛒 Carrito</Link></div></header>
  <main>
    <section className="storeHero"><div className="heroGlow"/><div className="heroContent wrap"><div className="heroCopy"><h1>La Comarca</h1><p>Consulta nuestro catálogo de cartas disponibles y arma tu carrito.</p><div className="actions"><Link href="/catalogo" className="btn heroBtn">Ver catálogo</Link><Link href="/cuenta" className="btn2 heroBtn2">♙ Mi cuenta / Iniciar sesión</Link></div></div><div className="heroBrand"><BrandLogo/></div></div></section>
    <section id="destacados" className="wrap sectionBlock"><div className="sectionTitle"><h2>Destacados de La Comarca</h2><Link href="/catalogo">Ver catálogo →</Link></div><div className="featureGrid"><Link href="/catalogo" className="featureCard simple"><div className="featureIcon">◈</div><div className="featureInfo"><strong>Catálogo</strong><small>Consulta nuestros productos disponibles.</small></div></Link><Link href="/catalogo" className="featureCard simple"><div className="featureIcon">◇</div><div className="featureInfo"><strong>Productos TCG</strong><small>Cartas y productos para coleccionar y jugar.</small></div></Link><Link href="/catalogo" className="featureCard simple"><div className="featureIcon">♧</div><div className="featureInfo"><strong>Juegos y hobby</strong><small>Explora nuestras líneas de productos.</small></div></Link><Link href="#comunidad" className="featureCard simple"><div className="featureIcon">♙</div><div className="featureInfo"><strong>Comunidad</strong><small>Eventos, torneos y actividades de La Comarca.</small></div></Link></div></section>
    <section id="lineas" className="wrap sectionBlock"><div className="sectionTitle"><h2>Explora nuestras líneas</h2><span>La Comarca · TCG & Hobby</span></div><div className="lineGrid">{lines.map(([name,key])=><Link href="/catalogo" className={`lineCard ${key}`} key={key}><div className="lineMark">{name}</div><strong>Ver productos →</strong></Link>)}</div></section>
    <section id="comunidad" className="wrap benefits"><div><b>◈</b><span><strong>Envíos a todo México</strong><small>Envíos seguros y rápidos</small></span></div><div><b>◇</b><span><strong>Tienda 100% segura</strong><small>Protección en tus compras</small></span></div><div><b>♧</b><span><strong>Atención personalizada</strong><small>Estamos para ayudarte</small></span></div><div><b>♙</b><span><strong>Comunidad La Comarca</strong><small>Eventos, torneos y más</small></span></div></section>
    <section className="wrap feedSection"><div className="sectionTitle"><h2>Últimas publicaciones</h2><a href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">Ver Facebook →</a></div><FacebookFeed/></section>
  </main>
  <footer className="siteFooter"><BrandLogo/><span>La Comarca · Campeche, México · TCG · Juegos · Coleccionismo · Hobby</span></footer>
</div>}
