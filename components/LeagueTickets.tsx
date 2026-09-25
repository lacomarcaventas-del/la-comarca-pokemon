"use client";

type LeagueTicket = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string;
};

const cards: LeagueTicket[] = [
  {
    id: "novato",
    name: "Entrada a la liga · Novato",
    price: 299,
    stock: 12,
    image_url: "/placeholder.svg",
  },
  {
    id: "intermedia",
    name: "Entrada a la liga · Intermedia",
    price: 499,
    stock: 8,
    image_url: "/placeholder.svg",
  },
  {
    id: "elite",
    name: "Entrada a la liga · Élite",
    price: 799,
    stock: 5,
    image_url: "/placeholder.svg",
  },
];

function displayName(card: LeagueTicket) {
  return card.name;
}

export default function LeagueTickets() {
  const loading = false;

  function add(card: LeagueTicket) {
    console.info("Ticket seleccionado:", card.name);
  }

  return (
    <>
      {loading ? (
        <div className="empty">Cargando tickets...</div>
      ) : (
        <section className="grid gap-7 lg:grid-cols-[1fr_460px] items-start mb-5">
          <div className="grid gap-5">
            {cards.map((card) => (
              <article className="card" key={card.id}>
                <div className="cardImage">
                  <img src={card.image_url || "/placeholder.svg"} alt={displayName(card)} />
                </div>

                <div className="info">
                  <b>{displayName(card)}</b>

                  <div className="muted">
                    Entrada a la liga · ${Number(card.price).toLocaleString("es-MX")} MXN
                  </div>

                  <div className="stock">{card.stock} disponible(s)</div>

                  <button
                    type="button"
                    className="btn"
                    style={{ width: "100%", marginTop: 10 }}
                    onClick={() => add(card)}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="flex justify-center lg:justify-end">
            <img
              src="/liga-ranking-agosto.webp"
              alt="Top de Ligas · Agosto"
              className="w-full max-w-[460px] h-auto object-contain"
            />
          </aside>
        </section>
      )}
    </>
  );
}
