"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { parseISODate } from "@/lib/dates";

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

type FilterTab = "Todos" | "Cabello" | "Insumos" | "Otros";

const tabs: FilterTab[] = ["Todos", "Cabello", "Insumos", "Otros"];

type Supplier = {
  id: string;
  initial: string;
  name: string;
  location: string;
  categoria: string;
  contacto: string;
  ultimaOrden: string;
  comprasAno: number;
  estado: "Activo" | "Por recibir" | "Inactivo";
};

type OrdenResumen = { proveedor_id: string; fecha: string; estado: string; total: number };

const estadoClass: Record<Supplier["estado"], string> = {
  Activo: "bg-green-50 text-green-700",
  "Por recibir": "bg-orange-50 text-orange-600",
  Inactivo: "bg-zinc-100 text-zinc-500",
};

const rd = (n: number) =>
  n >= 10_000 ? `RD$${Math.round(n / 1000)}K` : `RD$${Math.round(n).toLocaleString("es-DO")}`;

function fechaCorta(iso: string) {
  const d = parseISODate(iso);
  const mismoAnio = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("es-DO", mismoAnio ? { day: "numeric", month: "short" } : { month: "short", year: "numeric" });
}

export default function ProveedoresPage() {
  const supabase = useMemo(() => createClient(), []);
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("Todos");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ordenesMes, setOrdenesMes] = useState(0);
  const [comprasMes, setComprasMes] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const ahora = new Date();
      const inicioAnio = `${ahora.getFullYear()}-01-01`;
      const inicioMes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`;
      const [p, o] = await Promise.all([
        supabase.from("proveedores").select("id, nombre, pais, categoria, contacto, telefono, email, activo").order("nombre"),
        supabase.from("ordenes_compra").select("proveedor_id, fecha, estado, total").neq("estado", "cancelada").order("fecha", { ascending: false }).limit(5000),
      ]);
      if (p.error || o.error) {
        setError((p.error ?? o.error)!.message);
        setCargando(false);
        return;
      }
      const ordenes = (o.data ?? []) as OrdenResumen[];
      setOrdenesMes(ordenes.filter((x) => x.fecha >= inicioMes).length);
      setComprasMes(ordenes.filter((x) => x.fecha >= inicioMes).reduce((s, x) => s + Number(x.total), 0));

      setSuppliers(
        (p.data ?? []).map((x) => {
          const suyas = ordenes.filter((r) => r.proveedor_id === x.id);
          const abierta = suyas.some((r) => r.estado === "pendiente" || r.estado === "en_transito");
          return {
            id: x.id,
            initial: x.nombre.charAt(0).toUpperCase(),
            name: x.nombre,
            location: x.pais,
            categoria: x.categoria,
            contacto: x.telefono ?? x.email ?? "—",
            ultimaOrden: suyas[0] ? fechaCorta(suyas[0].fecha) : "—",
            comprasAno: suyas.filter((r) => r.fecha >= inicioAnio).reduce((s, r) => s + Number(r.total), 0),
            estado: !x.activo ? "Inactivo" : abierta ? "Por recibir" : "Activo",
          } satisfies Supplier;
        }),
      );
      setError(null);
      setCargando(false);
    })();
  }, [supabase]);

  const filtered = suppliers.filter((s) => {
    const matchTab    = activeTab === "Todos" || (activeTab === "Otros" ? s.categoria !== "Cabello" && s.categoria !== "Insumos" : s.categoria === activeTab);
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const activos    = suppliers.filter((s) => s.estado !== "Inactivo").length;
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
          <p className="text-3xl font-bold text-zinc-900">{ordenesMes}</p>
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
          <p className="text-2xl sm:text-3xl font-bold text-white">{rd(comprasMes)}</p>
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
        {error && <p className="px-6 py-4 text-sm text-red-700">No se pudo cargar: {error}</p>}
        {cargando ? (
          <p className="px-6 py-8 text-sm text-zinc-400">Cargando…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-400">{suppliers.length === 0 ? "Aún no hay proveedores. Agrega el primero." : "Sin resultados."}</p>
        ) : (
          filtered.map((s) => (
            <Link
              key={s.id}
              href={`/admin/proveedores/${s.id}`}
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
              <span className="hidden sm:block text-sm font-semibold text-zinc-900">{rd(s.comprasAno)}</span>

              {/* Estado */}
              <span className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${estadoClass[s.estado]}`}>
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
