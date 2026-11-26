"use client";

import { useEffect, useState } from "react";

const messages = [
  { lang: "es", text: "ENVIAMOS A TODO EL MUNDO" },
  { lang: "en", text: "WE SHIP WORLDWIDE" },
  { lang: "zh", text: "全球配送" },
  { lang: "ru", text: "ДОСТАВЛЯЕМ ПО ВСЕМУ МИРУ" },
  { lang: "ja", text: "世界中へ発送" },
  { lang: "pt", text: "ENVIAMOS PARA TODO O MUNDO" },
  { lang: "de", text: "WIR VERSENDEN WELTWEIT" },
  { lang: "fr", text: "NOUS EXPÉDIONS DANS LE MONDE ENTIER" },
];

export default function ShippingMessage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % messages.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, []);

  const message = messages[active];

  return (
    <strong
      key={message.lang}
      lang={message.lang}
      aria-live="polite"
      aria-atomic="true"
      className="shippingWorldMessage"
    >
      {message.text}
    </strong>
  );
}
