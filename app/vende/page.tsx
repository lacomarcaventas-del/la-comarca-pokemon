"use client";

import { useState } from "react";

const juegos = [
  "Pokémon",
  "Magic",
  "Yu-Gi-Oh!",
  "One Piece",
  "Lorcana",
  "HeroClix",
  "Gundam",
  "Otro",
];

export default function VendePage() {
  const [paso, setPaso] = useState(1);
  const [juego, setJuego] = useState("Pokémon");

  return (
    <main className="min-h-screen bg-[#ECE9E1] text-zinc-900">
      <div className="mx-auto max-w-7xl px-5 py-8">

        {/* HERO */}
        <section
          className="relative overflow-hidden rounded-[34px]"
          style={{
            background:
              "linear-gradient(135deg,#03291f 0%,#184636 55%,#6B4F2A 100%)",
          }}
        >
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(120deg,transparent_0%,transparent_47%,rgba(255,255,255,.25)_50%,transparent_53%,transparent_100%)] bg-[length:240px_240px]" />

          <div className="relative p-8 md:p-14 text-white">

            <div className="inline-flex rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-200">
              Compra directa · Sin intermediarios
            </div>

            <h1 className="mt-6 text-5xl md:text-7xl font-black leading-none">
              Véndele tus
              <br />
              coleccionables
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-white/80">
              Cartas, figuras, binders y colecciones completas. Si son de interés
              para La Comarca, un agente se pondrá en contacto contigo para
              coordinar la operación.
            </p>

            <button
              onClick={() => setPaso(1)}
              className="mt-8 rounded-full bg-yellow-400 px-8 py-4 font-bold text-black transition hover:scale-105"
            >
              Comenzar solicitud
            </button>
          </div>
        </section>

        {/* CONTENIDO */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          {/* FORMULARIO */}
          <section className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-xl border border-zinc-200">

            <Barra paso={paso} />

            {paso === 1 && (
              <div className="space-y-6">

                <Titulo>Datos de contacto</Titulo>

                <Grid>
                  <Campo label="Nombre" />
                  <Campo label="WhatsApp" />
                  <Campo label="Ciudad" />
                  <Campo label="Mejor horario para llamarte" placeholder="16:00–19:00" />
                </Grid>

                <Campo label="Correo (opcional)" />

              </div>
            )}

            {paso === 2 && (
              <div className="space-y-6">

                <Titulo>Artículos</Titulo>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                  {juegos.map((j) => (
                    <button
                      key={j}
                      onClick={() => setJuego(j)}
                      className={`rounded-xl border p-3 text-sm transition ${
                        juego === j
                          ? "border-yellow-500 bg-yellow-100"
                          : "hover:bg-zinc-50"
                      }`}
                    >
                      {j}
                    </button>
                  ))}

                </div>

                <Grid>
                  <Campo label="Nombre del artículo" placeholder="Umbreon ex" />
                  <Campo label="Cantidad" placeholder="1" />
                  <Campo label="Rareza específica" placeholder="SIR" />
                  <Campo label="Idioma" placeholder="Español" />
                  <Campo label="Condición" placeholder="Near Mint" />
                  <Campo label="Monto esperado" placeholder="$8,000 MXN" />
                </Grid>

                <div>
                  <label className="font-semibold">Defectos</label>

                  <textarea
                    rows={4}
                    className="mt-2 w-full rounded-xl border p-3"
                    placeholder="Describe cualquier detalle relevante."
                  />
                </div>

                <CajaUpload texto="Hasta 10 fotografías por artículo" />

                <button className="rounded-xl border px-5 py-3 hover:bg-zinc-50">
                  + Agregar otro artículo
                </button>

              </div>
            )}

            {paso === 3 && (
              <div className="space-y-6">

                <Titulo>Colección completa</Titulo>

                <p className="text-zinc-600">
                  Si es una colección completa, adjunta un Excel con el listado
                  y hasta 10 fotografías generales.
                </p>

                <Campo
                  label="Nombre de la colección"
                  placeholder="Binder Pokémon 2023-2026"
                />

                <CajaUpload texto="Arrastra aquí tu Excel (.xlsx o .csv)" />

                <CajaUpload texto="Hasta 10 fotografías generales" />

              </div>
            )}

            {paso === 4 && (
              <div className="space-y-6">

                <Titulo>Pago y logística</Titulo>

                <Campo
                  label="Monto esperado por toda la operación"
                  placeholder="$12,500 MXN"
                />

                <div className="rounded-2xl border p-5">

                  <div className="font-semibold">
                    ¿Aceptarías crédito en tienda?
                  </div>

                  <div className="mt-4 flex gap-3 flex-wrap">

                    {["Sí", "No", "Podemos revisarlo"].map((x) => (
                      <button
                        key={x}
                        className="rounded-full border px-4 py-2 hover:bg-zinc-50"
                      >
                        {x}
                      </button>
                    ))}

                  </div>

                </div>

                <TarjetaInfo
                  titulo="Entrega sin envío"
                  texto="CDMX · Puebla · Mérida · Campeche."
                />

                <TarjetaInfo
                  titulo="Resto de la República"
                  texto="Coordinamos el envío contigo. Opciones desde $200 MXN (3 kg)."
                />

              </div>
            )}

            {paso === 5 && (
              <div className="space-y-6">

                <Titulo>Confirmar solicitud</Titulo>

                <ul className="space-y-3 text-sm">

                  <li>✔ Escribe la rareza específica cuando aplique.</li>

                  <li>✔ Indica cualquier defecto del artículo.</li>

                  <li>✔ Si es colección, adjunta el Excel y las fotografías.</li>

                  <li>✔ Un agente de La Comarca se pondrá en contacto contigo.</li>

                </ul>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">

                  <div className="text-sm">Vista previa del folio</div>

                  <div className="mt-2 text-3xl font-black text-emerald-900">
                    LC-2026-0001
                  </div>

                </div>

              </div>
            )}

            <div className="mt-10 flex justify-between">

              <button
                onClick={() => setPaso(Math.max(1, paso - 1))}
                disabled={paso === 1}
                className="rounded-xl border px-5 py-3 disabled:opacity-30 hover:bg-zinc-50"
              >
                Regresar
              </button>

              <button
                onClick={() => setPaso(Math.min(5, paso + 1))}
                className="rounded-xl bg-black px-6 py-3 text-white hover:bg-zinc-800"
              >
                {paso === 5 ? "Enviar solicitud" : "Continuar"}
              </button>

            </div>

          </section>

          {/* RESUMEN */}
          <aside className="sticky top-6 h-fit rounded-3xl bg-white p-8 shadow-xl border border-zinc-200">

            <h3 className="text-2xl font-bold">Resumen</h3>

            <div className="mt-6 rounded-2xl border p-5">

              <div className="font-semibold">Umbreon ex</div>

              <div className="text-sm text-zinc-500">
                SIR · Near Mint
              </div>

              <div className="mt-2 text-xl font-bold">$8,000</div>

            </div>

            <div className="mt-8 space-y-5 text-sm">

              <Dato titulo="Juego" valor={juego} />

              <Dato
                titulo="Entrega local"
                valor="CDMX · Puebla · Mérida · Campeche"
              />

              <Dato
                titulo="Resto del país"
                valor="Envíos desde $200 MXN (3 kg)"
              />

              <Dato
                titulo="Folio"
                valor="Se genera al enviar"
              />

            </div>

          </aside>

        </div>
      </div>
    </main>
  );
}

/* COMPONENTES */

function Barra({ paso }: { paso: number }) {

  const pasos = [
    "Datos",
    "Artículos",
    "Colección",
    "Pago",
    "Confirmar",
  ];

  return (
    <div className="mb-10">

      <div className="flex justify-between items-center gap-2">

        {pasos.map((p, i) => (

          <div key={p} className="flex flex-col items-center flex-1">

            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                paso === i + 1
                  ? "bg-yellow-400 text-black"
                  : paso > i + 1
                  ? "bg-emerald-700 text-white"
                  : "bg-zinc-200 text-zinc-600"
              }`}
            >
              {i + 1}
            </div>

            <span className="mt-2 text-xs text-zinc-500 text-center">
              {p}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}

function Titulo({ children }: { children: React.ReactNode }) {
  return <h2 className="text-3xl font-black">{children}</h2>;
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function Campo({
  label,
  placeholder = "",
}: {
  label: string;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="font-semibold">{label}</label>

      <input
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-zinc-300 p-3 focus:border-yellow-500 outline-none"
      />

    </div>
  );
}

function CajaUpload({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-300 p-8 text-center text-zinc-500">
      {texto}
    </div>
  );
}

function TarjetaInfo({
  titulo,
  texto,
}: {
  titulo: string;
  texto: string;
}) {
  return (
    <div className="rounded-2xl border bg-zinc-50 p-5">

      <div className="font-semibold">{titulo}</div>

      <p className="mt-1 text-sm">{texto}</p>

    </div>
  );
}

function Dato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <div>

      <div className="text-zinc-500">{titulo}</div>

      <div className="font-semibold">{valor}</div>

    </div>
  );
}
