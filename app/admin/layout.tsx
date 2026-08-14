"use client";

import { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isRoot = pathname === "/admin";

  return <>
    {!isRoot && <header className="top">
      <button className="btn2" onClick={() => router.push("/admin")}>← Administración</button>
      <b>La Comarca · Administración</b>
      <div className="actions" style={{ flexWrap: "wrap", justifyContent: "flex-end" }}>
        <button className="btn2" onClick={() => router.push("/admin/metricas")}>📊 Métricas</button>
        <button className="btn2" onClick={() => router.push("/admin/usuarios")}>👥 Usuarios</button>
        <button className="btn2" onClick={() => router.push("/admin/clientes")}>👤 Clientes</button>
        <button className="btn2" onClick={() => router.push("/admin/exportaciones")}>📤 Exportaciones</button>
        <button className="btn2" onClick={() => router.push("/admin/importaciones")}>📥 Inventario / Excel</button>
        <button className="btn2" onClick={() => router.push("/admin/auditoria")}>🧾 Auditoría</button>
        <button className="btn2" onClick={() => router.push("/admin/orders")}>📦 Pedidos</button>
        <button className="btn2" onClick={() => router.push("/admin/permisos")}>🔐 Permisos</button>
        <button className="btn2" onClick={() => router.push("/admin/etiquetas")}>🏷️ Etiquetas</button>
        <button className="btn2" onClick={() => router.push("/pokemon")}>← Catálogo</button>
      </div>
    </header>}
    {children}
  </>;
}
