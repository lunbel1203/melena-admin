"use client";

import Link from "next/link";
import { useState } from "react";

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

type FilterTab = "Todos" | "Cabello" | "Insumos";

const tabs: FilterTab[] = ["Todos", "Cabello", "Insumos"];

const suppliers = [
  {
    id: "s1", initial: "H",
    name: "Hair Import RD",    location: "Santo Domingo",
    categoria: "Cabello",  contacto: "809 555 7712",
    ultimaOrden: "19 ago", comprasAno: "RD$842K",
    estado: "Activo",     estadoClass: "bg-green-50 text-green-700",
  },
  {
    id: "s2", initial: "V",
    name: "Virgin Hair Co.",   location: "Miami, EE.UU.",
    categoria: "Cabello",  contacto: "+1 305 555 0134",
    ultimaOrden: "2 ago",  comprasAno: "RD$514K",
    estado: "Activo",     estadoClass: "bg-green-50 text-green-700",
  },
  {
    id: "s3", initial: "A",
    name: "Adhesivos Pro",     location: "Santiago",
    categoria: "Insumos",  contacto: "809 555 3390",
    ultimaOrden: "28 ago", comprasAno: "RD$96K",
    estado: "Por recibir", estadoClass: "bg-orange-50 text-orange-600",
  },
  {
    id: "s4", initial: "B",
    name: "Beauty Supply DR",  location: "Santo Domingo",
    categoria: "Insumos",  contacto: "809 555 8801",
    ultimaOrden: "14 ago", comprasAno: "RD$71K",
    estado: "Activo",     estadoClass: "bg-green-50 text-green-700",
  },
  {
    id: "s5", initial: "R",
    name: "Remy Trading",      location: "Panamá",
    categoria: "Cabello",  contacto: "+507 555 2210",
    ultimaOrden: "mar 2026",comprasAno: "RD$38K",
    estado: "Inactivo",   estadoClass: "bg-zinc-100 text-zinc-500",
  },
];

export default function ProveedoresPage() {
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("Todos");

  const filtered = suppliers.filter((s) => {
    const matchTab    = activeTab === "Todos" || s.categoria === activeTab;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const activos    = suppliers.filter((s) => s.estado === "Activo").length;
  const porRecibir = suppliers.filter((s) => s.estado === "Por recibir").length;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Proveedores</h1>
          <p className="text-sm text-zinc-400 mt-1">De dónde viene el cabello y los insumos del salón.</p>
        </div>
        <Link href="/admin/proveedores/nuevo" className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap self-start">
          + Nuevo proveedor
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Proveedores activos
          </p>
          <p className="text-3xl font-bold text-zinc-900">{activos}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Órdenes del mes
          </p>
          <p className="text-3xl font-bold text-zinc-900">7</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Por recibir
          </p>
          <p className="text-3xl font-bold text-zinc-900">{porRecibir}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Compras del mes
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-white">RD$186K</p>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proveedor..."
            className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-56 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
          />
        </div>

        {/* Tabs */}
        <div className="ml-auto flex items-center bg-zinc-900 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">

        {/* Header columnas */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
          {["Proveedor", "Categoría", "Contacto", "Última orden", "Compras año", "Estado", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              {h}
            </span>
          ))}
        </div>

        {/* Filas */}
        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-400">Sin resultados.</p>
        ) : (
          filtered.map((s) => (
            <Link
              key={s.id}
              href={`/admin/proveedores/${slugify(s.name)}`}
              className="flex sm:grid sm:grid-cols-[2fr_1fr_1.2fr_1fr_1fr_1fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
            >
              {/* Proveedor */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                  {s.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{s.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{s.location}</p>
                </div>
              </div>

              {/* Categoría */}
              <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                {s.categoria}
              </span>

              {/* Contacto */}
              <span className="hidden sm:block text-sm text-zinc-600">{s.contacto}</span>

              {/* Última orden */}
              <span className="hidden sm:block text-sm text-zinc-500">{s.ultimaOrden}</span>

              {/* Compras año */}
              <span className="hidden sm:block text-sm font-semibold text-zinc-900">{s.comprasAno}</span>

              {/* Estado */}
              <span className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${s.estadoClass}`}>
                {s.estado}
              </span>

              {/* Chevron */}
              <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0">
                <ChevronIcon />
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
