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

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

type FilterTab = "Todas" | "Estilistas" | "Recepción" | "Caja";

const tabs: FilterTab[] = ["Todas", "Estilistas", "Recepción", "Caja"];

const staffList = [
  {
    id: "p1",
    initial: "M",
    name: "Mariana Ríos",
    specialty: "Tape-in · nano ring",
    role: "Estilista" as const,
    services: 42,
    billed: "RD$134,400",
    commission: "RD$33,600",
    freeDays: 4,
    blocked: false,
  },
  {
    id: "p2",
    initial: "S",
    name: "Sofía Luna",
    specialty: "Tape-in · bulk",
    role: "Estilista" as const,
    services: 31,
    billed: "RD$96,100",
    commission: "RD$24,025",
    freeDays: 6,
    blocked: false,
  },
  {
    id: "p3",
    initial: "V",
    name: "Vanessa Gil",
    specialty: "Bulk · cortina",
    role: "Estilista" as const,
    services: 24,
    billed: "RD$72,000",
    commission: "RD$18,000",
    freeDays: 5,
    blocked: false,
  },
  {
    id: "p4",
    initial: "C",
    name: "Camila Torres",
    specialty: "Recepción y caja",
    role: "Recepción" as const,
    services: null,
    billed: null,
    commission: null,
    freeDays: null,
    blocked: true,
  },
];

const rolFilter: Record<FilterTab, string | null> = {
  Todas: null,
  Estilistas: "Estilista",
  Recepción: "Recepción",
  Caja: "Caja",
};

export default function PersonalPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("Todas");
  const [search, setSearch] = useState("");

  const filtered = staffList.filter((s) => {
    const matchTab = rolFilter[activeTab] === null || s.role === rolFilter[activeTab];
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mr-auto">Personal</h1>

        {/* Tabs */}
        <div className="flex items-center bg-zinc-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Link
          href="/admin/personal/nueva"
          className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
        >
          + Nueva empleada
        </Link>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4 max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar empleada..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
        />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">

        {/* Header columnas */}
        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.2fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
          {["Empleada", "Rol", "Servicios", "Facturado", "Comisión", "Disponibilidad", ""].map((h) => (
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
              href={`/admin/personal/${s.id}`}
              className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.2fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
            >
              {/* Empleada */}
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  s.initial === "M" ? "bg-zinc-900 text-white" : "bg-zinc-200 text-zinc-600"
                }`}>
                  {s.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{s.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{s.specialty}</p>
                </div>
              </div>

              {/* Rol */}
              <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                {s.role}
              </span>

              {/* Servicios */}
              <span className="hidden sm:block text-sm text-zinc-700">
                {s.services ?? "—"}
              </span>

              {/* Facturado */}
              <span className="hidden sm:block text-sm text-zinc-700">
                {s.billed ?? "—"}
              </span>

              {/* Comisión */}
              <span className="hidden sm:block text-sm font-medium text-zinc-900">
                {s.commission ?? "—"}
              </span>

              {/* Disponibilidad */}
              <div className="hidden sm:block">
                {s.blocked ? (
                  <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full">
                    Bloqueada
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                    {s.freeDays} días libres
                  </span>
                )}
              </div>

              {/* Chevron */}
              <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0">
                <ChevronIcon />
              </span>
            </Link>
          ))
        )}

        {/* ── Footer total ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">
              Total comisiones del mes
            </p>
            <p className="text-xs text-zinc-400">Cada empleada ve su propio detalle desde la app.</p>
          </div>
          <p className="text-2xl font-bold text-zinc-900">RD$75,625</p>
        </div>
      </div>
    </div>
  );
}
