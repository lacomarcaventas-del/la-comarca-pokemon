"use client";

import { useEffect, useState } from "react";

const messages = [
  { lang: "es", text: "ACEPTAMOS PAYPAL" },
  { lang: "es", text: "ENVIAMOS A TODO EL MUNDO" },
  { lang: "es", text: "ATENCIÓN PERSONALIZADA · mappcomarca@gmail.com" },
  { lang: "es", text: "18 AÑOS DE EXPERIENCIA NOS RESPALDAN" },
  { lang: "en", text: "WE ACCEPT PAYPAL" },
  { lang: "en", text: "WE SHIP WORLDWIDE" },
  { lang: "en", text: "PERSONALIZED ASSISTANCE · mappcomarca@gmail.com" },
  { lang: "en", text: "18 YEARS OF EXPERIENCE YOU CAN TRUST" },
  { lang: "zh", text: "我们接受 PayPal 付款" },
  { lang: "zh", text: "我们提供全球配送" },
  { lang: "zh", text: "个性化服务 · mappcomarca@gmail.com" },
  { lang: "zh", text: "18 年专业经验，值得信赖" },
  { lang: "ru", text: "МЫ ПРИНИМАЕМ PAYPAL" },
  { lang: "ru", text: "ДОСТАВЛЯЕМ ПО ВСЕМУ МИРУ" },
  { lang: "ru", text: "ПЕРСОНАЛЬНАЯ ПОМОЩЬ · mappcomarca@gmail.com" },
  { lang: "ru", text: "18 ЛЕТ ОПЫТА — НАМ МОЖНО ДОВЕРЯТЬ" },
  { lang: "ja", text: "PayPalでのお支払いに対応" },
  { lang: "ja", text: "世界中へ発送" },
  { lang: "ja", text: "個別サポート · mappcomarca@gmail.com" },
  { lang: "ja", text: "18年の経験と実績" },
  { lang: "pt", text: "ACEITAMOS PAYPAL" },
  { lang: "pt", text: "ENVIAMOS PARA TODO O MUNDO" },
  { lang: "pt", text: "ATENDIMENTO PERSONALIZADO · mappcomarca@gmail.com" },
  { lang: "pt", text: "18 ANOS DE EXPERIÊNCIA NOS RESPALDAM" },
  { lang: "de", text: "WIR AKZEPTIEREN PAYPAL" },
  { lang: "de", text: "WIR VERSENDEN WELTWEIT" },
  { lang: "de", text: "PERSÖNLICHER SERVICE · mappcomarca@gmail.com" },
  { lang: "de", text: "18 JAHRE ERFAHRUNG SPRECHEN FÜR UNS" },
  { lang: "fr", text: "NOUS ACCEPTONS PAYPAL" },
  { lang: "fr", text: "NOUS EXPÉDIONS DANS LE MONDE ENTIER" },
  { lang: "fr", text: "SERVICE PERSONNALISÉ · mappcomarca@gmail.com" },
  { lang: "fr", text: "18 ANS D’EXPÉRIENCE À VOTRE SERVICE" },
];

export default function ShippingMessage() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % messages.length);
    }, 12000);

    return () => window.clearInterval(timer);
  }, []);

  const message = messages[active];

  return (
    <div className="worldwideTicker" role="region" aria-label="La Comarca: pagos, envíos y atención al cliente">
      <div className="tickerScreen">
        <div className="tickerFlipLine" key={active} lang={message.lang}>
          {message.text}
        </div>
      </div>
    </div>
  );
}
