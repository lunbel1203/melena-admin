"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/admin/configuracion/negocio", label: "Negocio y contacto" },
  { href: "/admin/configuracion/horario", label: "Horario y agenda" },
  { href: "/admin/configuracion/depositos", label: "Depósitos y pagos" },
  { href: "/admin/configuracion/recordatorios", label: "Recordatorios" },
  { href: "/admin/configuracion/seguimiento", label: "Seguimiento post-servicio" },
  { href: "/admin/configuracion/comisiones", label: "Comisiones" },
  { href: "/admin/configuracion/facturacion", label: "Facturación e impuestos" },
  { href: "/admin/configuracion/inventario", label: "Inventario" },
  { href: "/admin/configuracion/permisos", label: "Roles y permisos" },
];

export default function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Configuración</h1>
        <p className="text-sm text-zinc-400 mt-1">Ajustes generales del negocio · aplican a web, app y panel</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-60 shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 p-2">
            <ul className="space-y-0.5">
              {secciones.map((s) => {
                const active = pathname === s.href;
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={`block px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }`}
                    >
                      {s.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
