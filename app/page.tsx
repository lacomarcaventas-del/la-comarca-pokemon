import Link from "next/link";
export default function Home(){
  return <><header className="top"><b>La Comarca</b><nav><Link href="/cuenta">👤 Mi cuenta</Link><Link href="/admin">Administración</Link></nav></header>
  <main className="wrap hero"><div className="panel"><h1>La Comarca</h1><p>Consulta nuestro catálogo de cartas disponibles y arma tu carrito.</p><div className="actions"><Link href="/catalogo"><button className="btn">Ver catálogo</button></Link><Link href="/cuenta"><button className="btn2">👤 Mi cuenta / Iniciar sesión</button></Link></div></div></main></>
}
