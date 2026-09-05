"use client";

import Link from "next/link";
import { useState } from "react";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

/* ── Data ── */
const products = [
  {
    id: "p1", initial: "R",
    name: "Rubio balayage",    sub: "Rubio con raíz oscura",
    tipo: "Remy",   largos: '18" · 20" · 22"',
    price: "RD$4,200", units: 14, maxUnits: 20, stockLow: false,
    published: "Web · app",
  },
  {
    id: "p2", initial: "N",
    name: "Negro natural",     sub: "Negro azabache",
    tipo: "Virgin", largos: '14" · 16" · 18"',
    price: "RD$3,600", units: 3,  maxUnits: 20, stockLow: true,
    published: "Web · app",
  },
  {
    id: "p3", initial: "C",
    name: "Chocolate ombré",   sub: "Degradado a caramelo",
    tipo: "Remy",   largos: '20" · 22" · 24"',
    price: "RD$5,100", units: 9,  maxUnits: 20, stockLow: false,
    published: "Web · app",
  },
  {
    id: "p4", initial: "C",
    name: "Castaño natural",   sub: "Castaño medio uniforme",
    tipo: "Virgin", largos: '16" · 18" · 20"',
    price: "RD$2,850", units: 11, maxUnits: 20, stockLow: false,
    published: "Web · app",
  },
];

const services = [
  {
    id: "s1", initial: "T",
    name: "Tape-in",              stylists: "Mariana · Sofía",
    category: "Instalación",  duration: "1.5 h",
    price: "RD$3,200", deposit: "RD$1,000", published: "Web · app",
  },
  {
    id: "s2", initial: "N",
    name: "Nano ring",            stylists: "Mariana",
    category: "Instalación",  duration: "3 h",
    price: "RD$4,800", deposit: "RD$1,000", published: "Web · app",
  },
  {
    id: "s3", initial: "B",
    name: "Bulk",                 stylists: "Vanessa · Sofía",
    category: "Instalación",  duration: "4 h",
    price: "RD$4,500", deposit: "RD$1,000", published: "Web · app",
  },
  {
    id: "s4", initial: "P",
    name: "Ponytail",             stylists: "Todas",
    category: "Express",      duration: "30 min",
    price: "RD$1,900", deposit: "Sin depósito", published: "Web · app",
  },
  {
    id: "s5", initial: "R",
    name: "Retiro de extensiones",stylists: "Todas",
    category: "Mantenimiento",duration: "45 min",
    price: "RD$1,200", deposit: "Sin depósito", published: "Solo app",
  },
];

const categoryBadge: Record<string, string> = {
  Instalación:   "bg-zinc-100 text-zinc-600 border border-zinc-200",
  Express:       "bg-zinc-100 text-zinc-600 border border-zinc-200",
  Mantenimiento: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

const stockLowCount = products.filter((p) => p.stockLow).length;

type Tab = "productos" | "servicios";

export default function CatalogoPage() {
  const [tab, setTab]             = useState<Tab>("productos");
  const [searchP, setSearchP]     = useState("");
  const [searchS, setSearchS]     = useState("");

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchP.toLowerCase())
  );
  const filteredServices = services.filter((s) =>
    s.name.toLowerCase().includes(searchS.toLowerCase())
  );

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Catálogo</h1>
        <p className="text-sm text-zinc-400 mt-1">Lo que se publica aquí alimenta el sitio web y la app.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-zinc-200 mb-5">
        {(["productos", "servicios"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ══ PRODUCTOS ══ */}
      {tab === "productos" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchP}
                onChange={(e) => setSearchP(e.target.value)}
                placeholder="Buscar producto..."
                className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
              />
            </div>
            {stockLowCount > 0 && (
              <span className="text-sm font-semibold text-orange-500">
                {stockLowCount} con stock bajo
              </span>
            )}
            <Link href="/admin/catalogo/nuevo-producto" className="ml-auto bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              + Nuevo producto
            </Link>
          </div>

          {/* Tabla productos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
              {["Producto", "Tipo", "Largos", "Precio", "Stock", "Publicado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {filteredProducts.map((p) => {
              const pct = Math.round((p.units / p.maxUnits) * 100);
              return (
                <Link
                  key={p.id}
                  href={`/admin/catalogo/${slugify(p.name)}`}
                  className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
                >
                  {/* Producto */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                      {p.initial}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{p.name}</p>
                      <p className="text-xs text-zinc-400 truncate">{p.sub}</p>
                    </div>
                  </div>

                  {/* Tipo */}
                  <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                    {p.tipo}
                  </span>

                  {/* Largos */}
                  <span className="hidden sm:block text-sm text-zinc-600">{p.largos}</span>

                  {/* Precio */}
                  <span className="hidden sm:block text-sm font-semibold text-zinc-900">{p.price}</span>

                  {/* Stock */}
                  <div className="hidden sm:block">
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-1 w-24">
                      <div
                        className={`h-full rounded-full ${p.stockLow ? "bg-orange-400" : "bg-zinc-800"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className={`text-xs ${p.stockLow ? "text-orange-500 font-semibold" : "text-zinc-400"}`}>
                      {p.units} unidades{p.stockLow ? " · stock bajo" : ""}
                    </p>
                  </div>

                  {/* Publicado */}
                  <span className="hidden sm:block text-sm text-zinc-500">{p.published}</span>

                  {/* Chevron */}
                  <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0"><ChevronIcon /></span>
                </Link>
              );
            })}
          </div>
        </>
      )}

      {/* ══ SERVICIOS ══ */}
      {tab === "servicios" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchS}
                onChange={(e) => setSearchS(e.target.value)}
                placeholder="Buscar servicio..."
                className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
              />
            </div>
            <span className="text-sm text-zinc-400">{services.length} servicios activos</span>
            <Link href="/admin/catalogo/nuevo-servicio" className="ml-auto bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              + Nuevo servicio
            </Link>
          </div>

          {/* Tabla servicios */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
              {["Servicio", "Categoría", "Duración", "Precio", "Depósito", "Publicado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {filteredServices.map((s) => (
              <Link
                key={s.id}
                href={`/admin/catalogo/${slugify(s.name)}`}
                className="flex sm:grid sm:grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
              >
                {/* Servicio */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                    {s.initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{s.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{s.stylists}</p>
                  </div>
                </div>

                {/* Categoría */}
                <span className={`hidden sm:inline-block text-xs font-medium px-2.5 py-1 rounded-lg w-fit ${categoryBadge[s.category]}`}>
                  {s.category}
                </span>

                {/* Duración */}
                <span className="hidden sm:block text-sm text-zinc-600">{s.duration}</span>

                {/* Precio */}
                <span className="hidden sm:block text-sm font-semibold text-zinc-900">{s.price}</span>

                {/* Depósito */}
                <span className={`hidden sm:block text-sm ${s.deposit === "Sin depósito" ? "text-zinc-400" : "text-zinc-700"}`}>
                  {s.deposit}
                </span>

                {/* Publicado */}
                <span className="hidden sm:block text-sm text-zinc-500">{s.published}</span>

                {/* Chevron */}
                <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0"><ChevronIcon /></span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
