import Link from "next/link";
import EventRegistrationForm from "./EventRegistrationForm";

const EVENTS={
 "heroclix-pulp-300":{game:"HeroClix",title:"Pulp · 300 puntos",details:"300 puntos · sin duplicados · formato Pulp"},
 "pokemon-standard":{game:"Pokémon TCG",title:"Standard",details:"Formato Standard vigente de Play! Pokémon"},
 "mtg-brawl":{game:"Magic: The Gathering",title:"Brawl",details:"Formato Brawl"},
 "mtg-commander-multiplayer":{game:"Magic: The Gathering",title:"Commander Multiplayer",details:"Commander multijugador"}
} as const;

type Slug=keyof typeof EVENTS;

export default async function EventRegistration({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const event=EVENTS[slug as Slug];
 if(!event)return <main className="siteShell"><section className="wrap sectionBlock"><h2>Evento no encontrado</h2><Link href="/eventos">← Volver a Eventos</Link></section></main>;
 return <main className="siteShell">
  <header className="top siteTop"><Link href="/eventos" className="logoLink">← Eventos</Link></header>
  <section className="wrap sectionBlock" style={{maxWidth:700}}>
   <EventRegistrationForm slug={slug} event={event}/>
  </section>
 </main>;
}