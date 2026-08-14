import Link from "next/link";
export default function Home(){
  return <>
    <header className="top"><b>La Comarca</b><nav className="topNav"><Link href="/cuenta">👤 Mi cuenta</Link></nav></header>
    <main className="wrap hero"><div className="panel"><h1>La Comarca</h1><p>Consulta nuestro catálogo de cartas disponibles y arma tu carrito.</p><div className="actions"><Link href="/catalogo"><button className="btn">Ver catálogo</button></Link><Link href="/cuenta"><button className="btn2">👤 Mi cuenta / Iniciar sesión</button></Link></div></div></main>
    <footer className="siteFooter"><Link className="adminAccess" href="/admin">Administración</Link></footer>
  </>
}
