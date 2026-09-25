"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type RolEmpleado = Database["public"]["Enums"]["rol_empleado"];

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
const rolFilter: Record<FilterTab, RolEmpleado | null> = {
  Todas: null,
  Estilistas: "estilista",
  Recepción: "recepcion",
  Caja: "caja",
};
const ROL_LABEL: Record<RolEmpleado, string> = {
  admin: "Admin",
  recepcion: "Recepción",
  caja: "Caja",
  estilista: "Estilista",
};

interface Empleado {
  id: string;
  nombre: string;
  rol: RolEmpleado;
  puesto: string | null;
  activo: boolean;
  foto_url: string | null;
}

interface Stats {
  servicios: number;
  facturado: number;
  comision: number;
}

const formatoRD = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 });

export default function PersonalPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<FilterTab>("Todas");
  const [search, setSearch] = useState("");
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [stats, setStats] = useState<Map<string, Stats>>(new Map());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const inicioMesISO = inicioMes.toISOString();

      const [{ data: emps }, { data: lineas }, { data: comisiones }] = await Promise.all([
        supabase.from("empleados").select("id, nombre, rol, puesto, activo, foto_url").order("nombre"),
        supabase
          .from("lineas_factura")
          .select("empleado_id, subtotal, tipo, facturas!inner(estado, cobrada_at)")
          .eq("facturas.estado", "cobrada")
          .gte("facturas.cobrada_at", inicioMesISO),
        supabase.from("comisiones").select("empleado_id, monto").gte("created_at", inicioMesISO),
      ]);

      const mapa = new Map<string, Stats>();
      (lineas ?? []).forEach((l) => {
        const s = mapa.get(l.empleado_id) ?? { servicios: 0, facturado: 0, comision: 0 };
        if (l.tipo === "servicio") s.servicios += 1;
        s.facturado += Number(l.subtotal ?? 0);
        mapa.set(l.empleado_id, s);
      });
      (comisiones ?? []).forEach((c) => {
        const s = mapa.get(c.empleado_id) ?? { servicios: 0, facturado: 0, comision: 0 };
        s.comision += Number(c.monto);
        mapa.set(c.empleado_id, s);
      });

      setEmpleados(emps ?? []);
      setStats(mapa);
      setCargando(false);
    })();
  }, [supabase]);

  const filtered = empleados.filter((e) => {
    const matchTab = rolFilter[activeTab] === null || e.rol === rolFilter[activeTab];
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalComisiones = Array.from(stats.values()).reduce((acc, s) => acc + s.comision, 0);

  if (cargando) return <p className="p-8 text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mr-auto">Personal</h1>

        <div className="flex items-center bg-zinc-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
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

        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
          {["Empleada", "Rol", "Servicios (mes)", "Facturado (mes)", "Comisión (mes)", "Estado", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-400">Sin resultados.</p>
        ) : (
          filtered.map((e) => {
            const s = stats.get(e.id);
            const esEstilista = e.rol === "estilista";
            return (
              <Link
                key={e.id}
                href={`/admin/personal/${e.id}`}
                className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0 overflow-hidden">
                    {e.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
                    ) : (
                      e.nombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{e.nombre}</p>
                    <p className="text-xs text-zinc-400 truncate">{e.puesto ?? "—"}</p>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                  {ROL_LABEL[e.rol]}
                </span>

                <span className="hidden sm:block text-sm text-zinc-700">
                  {esEstilista ? s?.servicios ?? 0 : "—"}
                </span>

                <span className="hidden sm:block text-sm text-zinc-700">
                  {s && s.facturado > 0 ? formatoRD.format(s.facturado) : "—"}
                </span>

                <span className="hidden sm:block text-sm font-medium text-zinc-900">
                  {s && s.comision > 0 ? formatoRD.format(s.comision) : "—"}
                </span>

                <div className="hidden sm:block">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    e.activo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {e.activo ? "Activa" : "Inactiva"}
                  </span>
                </div>

                <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0">
                  <ChevronIcon />
                </span>
              </Link>
            );
          })
        )}

        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">
              Total comisiones del mes
            </p>
            <p className="text-xs text-zinc-400">Facturas cobradas desde el día 1.</p>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatoRD.format(totalComisiones)}</p>
        </div>
      </div>
    </div>
  );
}
