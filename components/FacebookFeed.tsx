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
    <section className="panel" style={{ marginTop: 24 }}>
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

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          marginTop: 16,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 500,
            minWidth: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
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
    </section>
  );
}
