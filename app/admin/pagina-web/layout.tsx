"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/admin/pagina-web/inicio", label: "Inicio" },
  { href: "/admin/pagina-web/antes-despues", label: "Antes y después" },
  { href: "/admin/pagina-web/testimonios", label: "Testimonios" },
  { href: "/admin/pagina-web/contacto", label: "Contacto y horarios" },
  { href: "/admin/pagina-web/footer-seo", label: "Footer y buscadores" },
];

export default function PaginaWebLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Página web</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Contenido del sitio público · los servicios y el catálogo se manejan desde Catálogo
        </p>
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

        <div className="flex-1 min-w-0 space-y-5">{children}</div>
      </div>
    </div>
  );
}
