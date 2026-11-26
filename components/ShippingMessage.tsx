"use client";

const languages = [
  { lang: "es", items: ["ACEPTAMOS PAYPAL", "ENVIAMOS A TODO EL MUNDO", "ATENCIÓN PERSONALIZADA: mappcomarca@gmail.com", "18 AÑOS DE EXPERIENCIA NOS RESPALDAN"] },
  { lang: "en", items: ["WE ACCEPT PAYPAL", "WE SHIP WORLDWIDE", "PERSONALIZED ASSISTANCE: mappcomarca@gmail.com", "18 YEARS OF EXPERIENCE YOU CAN TRUST"] },
  { lang: "zh", items: ["我们接受 PayPal 付款", "我们提供全球配送", "个性化服务：mappcomarca@gmail.com", "18 年专业经验，值得信赖"] },
  { lang: "ru", items: ["МЫ ПРИНИМАЕМ PAYPAL", "ДОСТАВЛЯЕМ ПО ВСЕМУ МИРУ", "ПЕРСОНАЛЬНАЯ ПОМОЩЬ: mappcomarca@gmail.com", "18 ЛЕТ ОПЫТА — НАМ МОЖНО ДОВЕРЯТЬ"] },
  { lang: "ja", items: ["PayPalでのお支払いに対応", "世界中へ発送", "個別サポート：mappcomarca@gmail.com", "18年の経験と実績"] },
  { lang: "pt", items: ["ACEITAMOS PAYPAL", "ENVIAMOS PARA TODO O MUNDO", "ATENDIMENTO PERSONALIZADO: mappcomarca@gmail.com", "18 ANOS DE EXPERIÊNCIA NOS RESPALDAM"] },
  { lang: "de", items: ["WIR AKZEPTIEREN PAYPAL", "WIR VERSENDEN WELTWEIT", "PERSÖNLICHER SERVICE: mappcomarca@gmail.com", "18 JAHRE ERFAHRUNG SPRECHEN FÜR UNS"] },
  { lang: "fr", items: ["NOUS ACCEPTONS PAYPAL", "NOUS EXPÉDIONS DANS LE MONDE ENTIER", "SERVICE PERSONNALISÉ : mappcomarca@gmail.com", "18 ANS D’EXPÉRIENCE À VOTRE SERVICE"] },
];

function MessageSet({ lang, items }: { lang: string; items: string[] }) {
  return (
    <span className="tickerLanguage" lang={lang}>
      {items.map((item, index) => (
        <span className="tickerItem" key={item}>
          {index === 0 ? <span className="tickerPayPalMark" aria-hidden="true">P</span> : null}
          {item}
        </span>
      ))}
    </span>
  );
}

export default function ShippingMessage() {
  return (
    <div className="worldwideTicker" role="region" aria-label="La Comarca: pagos, envíos y atención al cliente">
      <div className="tickerBoardHead">
        <span className="tickerBoardName">LA COMARCA <b>GLOBAL MARKET</b></span>
        <span className="tickerBoardStatus"><i /> INTERNATIONAL SERVICE BOARD</span>
      </div>
      <div className="tickerScreen">
        <div className="worldwideTickerTrack">
          {[...languages, ...languages].map((language, index) => (
            <MessageSet key={`${language.lang}-${index}`} {...language} />
          ))}
        </div>
      </div>
    </div>
  );
}
