{loading ? (
  <div className="empty">Cargando tickets...</div>
) : (
  <section className="grid gap-7 lg:grid-cols-[1fr_460px] items-start mb-5">
    <div className="grid">
      {cards.map(card => (
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

    <aside style={{ display: "flex", justifyContent: "center" }}>
      <img
        src="/liga-ranking-agosto.webp"
        alt="Top de Ligas · Agosto"
        style={{
          width: "100%",
          maxWidth: 460,
          height: "auto",
          objectFit: "contain",
          filter: "drop-shadow(0 0 28px rgba(214,163,64,.22))",
        }}
      />
    </aside>
  </section>
)}
