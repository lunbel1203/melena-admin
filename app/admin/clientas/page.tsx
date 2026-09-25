"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toISODate } from "@/lib/dates";

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

interface Clienta {
  id: string;
  nombre: string;
  telefono: string;
}
interface Cita {
  clienta_id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicios: { nombre: string } | { nombre: string }[] | null;
}

const statusClass: Record<string, string> = {
  Molestia: "bg-orange-50 text-orange-600",
  Nueva: "bg-zinc-100 text-zinc-600",
  Activa: "bg-green-50 text-green-700",
  Inactiva: "bg-zinc-100 text-zinc-500",
};

function nombreServicio(s: Cita["servicios"]) {
  if (!s) return null;
  return Array.isArray(s) ? s[0]?.nombre ?? null : s.nombre;
}

export default function ClientasPage() {
  const supabase = useMemo(() => createClient(), []);
  const [clientas, setClientas] = useState<Clienta[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [ticketsAbiertos, setTicketsAbiertos] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const [{ data: cl }, { data: ct }, { data: tk }] = await Promise.all([
        supabase.from("clientas").select("id, nombre, telefono").order("nombre"),
        supabase.from("citas").select("clienta_id, fecha, hora_inicio, estado, servicios(nombre)").order("fecha", { ascending: false }),
        supabase.from("tickets_molestia").select("clienta_id").in("estado", ["abierto", "en_proceso"]),
      ]);
      setClientas(cl ?? []);
      setCitas((ct ?? []) as Cita[]);
      setTicketsAbiertos(new Set((tk ?? []).map((t) => t.clienta_id)));
      setCargando(false);
    })();
  }, [supabase]);

  const hoy = toISODate(new Date());

  const filas = useMemo(() => {
    return clientas
      .filter((c) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q);
      })
      .map((c) => {
        const propias = citas.filter((ci) => ci.clienta_id === c.id);
        const completadas = propias.filter((ci) => ci.estado === "completada");
        const proxima = propias
          .filter((ci) => (ci.estado === "pendiente_confirmacion" || ci.estado === "confirmada") && ci.fecha >= hoy)
          .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio))[0];
        const ultima = completadas.sort((a, b) => (b.fecha + b.hora_inicio).localeCompare(a.fecha + a.hora_inicio))[0];

        let estado: string;
        if (ticketsAbiertos.has(c.id)) estado = "Molestia";
        else if (propias.length === 0) estado = "Nueva";
        else if (proxima) estado = "Activa";
        else estado = "Inactiva";

        return {
          ...c,
          servicio: nombreServicio(proxima?.servicios ?? ultima?.servicios ?? null),
          ultimaVisita: ultima?.fecha ?? null,
          proximaCita: proxima?.fecha ?? null,
          estado,
        };
      });
  }, [clientas, citas, ticketsAbiertos, search, hoy]);

  const citasHoy = citas.filter((c) => c.fecha === hoy && c.estado !== "cancelada").length;

  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 shrink-0">Clientas</h1>

          <div className="relative hidden sm:flex items-center ml-1">
            <span className="absolute left-3 text-zinc-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar clienta..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/admin/clientas/nueva"
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              + Nueva clienta
            </Link>
          </div>
        </div>

        <div className="mt-3 sm:hidden relative flex items-center">
          <span className="absolute left-3 text-zinc-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clienta..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm min-w-[140px]">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Clientas registradas
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">{clientas.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm min-w-[120px]">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Citas hoy
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">{citasHoy}</p>
        </div>
      </div>

      {/* ── Tabla todas las clientas ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Todas las clientas</h2>
          <span className="text-xs text-zinc-400">{clientas.length} clientas · mostrando {filas.length}</span>
        </div>

        {/* Columnas header */}
        {filas.length > 0 && (
          <div className="hidden sm:grid grid-cols-[2fr_1.3fr_1fr_1fr_auto_28px] gap-x-4 px-5 sm:px-6 py-2.5 border-b border-zinc-50">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Clienta</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Servicio</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Última visita</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Próxima cita</span>
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Estado</span>
            <span />
          </div>
        )}

        {cargando ? (
          <p className="px-5 sm:px-6 py-8 text-sm text-zinc-400">Cargando…</p>
        ) : filas.length === 0 ? (
          <p className="px-5 sm:px-6 py-8 text-sm text-zinc-400">
            {clientas.length === 0 ? "No hay clientas registradas todavía." : "Ninguna clienta coincide con la búsqueda."}
          </p>
        ) : (
          filas.map((c) => (
            <Link
              key={c.id}
              href={`/admin/clientas/${c.id}`}
              className="flex sm:grid sm:grid-cols-[2fr_1.3fr_1fr_1fr_auto_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 transition-colors cursor-pointer"
            >
              {/* Clienta */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600 shrink-0">
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{c.nombre}</p>
                  <p className="text-xs text-zinc-400">{c.telefono}</p>
                </div>
              </div>

              {/* Servicio */}
              <span className="hidden sm:block text-sm text-zinc-600">{c.servicio ?? "—"}</span>

              {/* Última visita */}
              <span className="hidden sm:block text-sm text-zinc-500">{c.ultimaVisita ?? "—"}</span>

              {/* Próxima cita */}
              <span className="hidden sm:block text-sm text-zinc-500">{c.proximaCita ?? "Sin agendar"}</span>

              {/* Estado */}
              <span className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass[c.estado]}`}>
                {c.estado}
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
