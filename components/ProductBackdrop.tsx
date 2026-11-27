"use client";

import { useEffect, useState, type ReactNode } from "react";
import { supabaseBrowser } from "../lib/supabase";

type BackdropProduct = {
  id: string;
  name: string;
  image_url: string | null;
};

export default function ProductBackdrop({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<BackdropProduct[]>([]);

  useEffect(() => {
    let active = true;

    async function loadInventoryImages() {
      try {
        const supabase = supabaseBrowser();
        const pageSize = 1000;
        let from = 0;
        let available: BackdropProduct[] = [];

        while (true) {
          const { data, error } = await supabase
            .from("cards")
            .select("id,name,image_url,stock,published")
            .eq("published", true)
            .gt("stock", 0)
            .not("image_url", "is", null)
            .range(from, from + pageSize - 1);

          if (error) throw error;
          const page = (data || []) as BackdropProduct[];
          available = available.concat(page);
          if (page.length < pageSize) break;
          from += pageSize;
        }

        const excluded = new Set(["producto al azar", "producto al azar 1", "producto al azar 2"]);
        const eligible = available.filter((product) =>
          product.image_url && !excluded.has(String(product.name || "").trim().toLowerCase())
        );

        for (let index = eligible.length - 1; index > 0; index--) {
          const randomIndex = Math.floor(Math.random() * (index + 1));
          [eligible[index], eligible[randomIndex]] = [eligible[randomIndex], eligible[index]];
        }

        if (active) setProducts(eligible.slice(0, 30));
      } catch (error) {
        console.error("No fue posible cargar las imágenes del fondo de inventario", error);
        if (active) setProducts([]);
      }
    }

    loadInventoryImages();
    return () => { active = false; };
  }, []);

  return (
    <div className="accountBackdrop">
      <div className="productBackdropLayer" aria-hidden="true">
        {products.map((product, index) => {
          const column = index % 6;
          const row = Math.floor(index / 6);
          const left = [2, 18, 34, 52, 70, 86][column];
          const top = [5, 29, 57, 78, 14][row % 5] + ((index * 7) % 9);
          const width = 76 + ((index * 19) % 54);
          const rotation = ((index * 17) % 34) - 17;

          return (
            <img
              key={product.id}
              className="productBackdropImage"
              src={product.image_url || ""}
              alt=""
              loading="lazy"
              draggable={false}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}px`,
                height: `${width * 1.35}px`,
                transform: `rotate(${rotation}deg)`,
              }}
            />
          );
        })}
      </div>
      {children}
    </div>
  );
}
