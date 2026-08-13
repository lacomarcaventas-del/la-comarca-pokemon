import Link from "next/link";
export default function Home(){
  return <><header className="top"><b>La Comarca</b><Link href="/admin">Administración</Link></header>
  <main className="wrap hero"><div className="panel"><h1>La Comarca</h1><p>Consulta nuestro catálogo de cartas disponibles y arma tu carrito.</p><Link href="/catalogo"><button className="btn">Ver catálogo</button></Link></div></main></>
}
