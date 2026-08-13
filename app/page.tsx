import Link from "next/link";
export default function Home(){
  return <><header className="top"><b>La Comarca · Pokémon TCG</b><Link href="/admin">Administración</Link></header>
  <main className="wrap hero"><div className="panel"><h1>Pokémon TCG</h1><p>Consulta nuestras cartas disponibles y arma tu carrito.</p><Link href="/pokemon"><button className="btn">Ver catálogo</button></Link></div></main></>
}