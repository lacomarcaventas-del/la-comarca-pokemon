"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    FB?: {
      XFBML?: {
        parse: (root?: HTMLElement) => void;
      };
    };
  }
}

export default function FacebookFeed() {
  useEffect(() => {
    const parseFacebookPlugin = () => {
      window.FB?.XFBML?.parse();
    };

    // If the SDK is already ready, parse this component immediately.
    if (window.FB?.XFBML) {
      parseFacebookPlugin();
      return;
    }

    const existingScript = document.getElementById(
      "facebook-jssdk"
    ) as HTMLScriptElement | null;

    if (existingScript) {
      // The script tag may exist before the SDK has finished loading.
      existingScript.addEventListener("load", parseFacebookPlugin, {
        once: true,
      });
      return () => {
        existingScript.removeEventListener("load", parseFacebookPlugin);
      };
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src =
      "https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v25.0";
    script.addEventListener("load", parseFacebookPlugin, { once: true });
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", parseFacebookPlugin);
    };
  }, []);

  return (
    <section className="panel" style={{ width: "100%", maxWidth: 1100, margin: "24px auto 0" }}>
      <div className="categoryHeader">
        <div>
          <h2>📢 La Comarca en Facebook</h2>
          <p className="muted">
            Publicaciones recientes de nuestra página oficial.
          </p>
        </div>
        <a
          className="btn2"
          href="https://www.facebook.com/ComarcaTCG"
          target="_blank"
          rel="noreferrer"
        >
          Ver Facebook
        </a>
      </div>

      <div className="facebookFeedStage">
        <div className="facebookFeedScale">
          <div
            className="fb-page"
            data-href="https://www.facebook.com/ComarcaTCG"
            data-tabs="timeline"
            data-width="500"
            data-height="700"
            data-small-header="false"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="true"
            style={{ width: "100%" }}
          >
            <blockquote
              cite="https://www.facebook.com/ComarcaTCG"
              className="fb-xfbml-parse-ignore"
            >
              <a href="https://www.facebook.com/ComarcaTCG">La Comarca</a>
            </blockquote>
          </div>
        </div>
      </div>
      <style jsx>{`
        .facebookFeedStage { width: 100%; min-height: 805px; margin-top: 16px; display: flex; justify-content: center; overflow: visible; }
        .facebookFeedScale { width: 500px; height: 700px; flex: 0 0 500px; transform: scale(1.15); transform-origin: top center; }
        @media (max-width: 640px) {
          .facebookFeedStage { min-height: 700px; overflow: hidden; }
          .facebookFeedScale { transform: scale(1); width: min(500px, 100%); flex-basis: min(500px, 100%); }
        }
      `}</style>
    </section>
  );
}
