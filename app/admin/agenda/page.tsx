"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  addDays,
  addMonths,
  diaAbbr,
  endOfMonth,
  formatDiaLargo,
  formatMesAnio,
  formatRangoSemana,
  horaAMinutos,
  isSameDay,
  startOfMonth,
  startOfWeekMonday,
  toISODate,
} from "@/lib/dates";

/* ── Iconos ── */
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12l4-4-4-4" />
    </svg>
  );
}

/* ── Tipos ── */
type Vista = "dia" | "semana" | "mes";

interface Servicio {
  id: string;
  nombre: string;
}

interface Estilista {
  id: string;
  nombre: string;
}

interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  empleado_id: string | null;
  clienta_nombre: string;
  servicio_id: string;
  servicio_nombre: string;
  empleado_nombre: string | null;
}

interface Bloqueo {
  id: string;
  empleado_id: string;
  empleado_nombre: string;
  fecha: string;
  dia_completo: boolean;
  hora_inicio: string | null;
  hora_fin: string | null;
  motivo: string | null;
}

const PALETA_SERVICIOS = [
  "bg-zinc-800", "bg-zinc-500", "bg-zinc-300",
  "bg-stone-500", "bg-neutral-600", "bg-zinc-400",
];

const PX_POR_MINUTO = 1.15;

/* ── Página ── */
export default function AgendaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [vista, setVista] = useState<Vista>("semana");
  const [fecha, setFecha] = useState(() => new Date());
  const [selectedDayMobile, setSelectedDayMobile] = useState(0);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [horario, setHorario] = useState({ abierto: true, apertura: "09:00", cierre: "19:00" });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const colorPorServicio = useMemo(() => {
    const map = new Map<string, string>();
    servicios.forEach((s, i) => map.set(s.id, PALETA_SERVICIOS[i % PALETA_SERVICIOS.length]));
    return map;
  }, [servicios]);

  /* Catálogo (una vez) */
  useEffect(() => {
    (async () => {
      const [{ data: srv }, { data: emp }] = await Promise.all([
        supabase.from("servicios").select("id, nombre").eq("activo", true).order("nombre"),
        supabase
          .from("empleados")
          .select("id, nombre, roles!inner(nombre)")
          .eq("roles.nombre", "Estilista")
          .eq("activo", true)
          .order("nombre"),
      ]);
      setServicios(srv ?? []);
      setActiveFilters(new Set((srv ?? []).map((s) => s.id)));
      setEstilistas((emp ?? []).map((e) => ({ id: e.id, nombre: e.nombre })));
    })();
  }, [supabase]);

  /* Horario real del día mostrado (configurado en Configuración → Horario y agenda) */
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const { data } = await supabase.rpc("horario_salon", { p_fecha: toISODate(fecha) });
      if (cancelado) return;
      if (data && data[0]) setHorario(data[0]);
    })();
    return () => {
      cancelado = true;
    };
  }, [supabase, fecha]);

  /* Rango visible según la vista */
  const rango = useMemo(() => {
    if (vista === "dia") return { desde: fecha, hasta: fecha };
    if (vista === "semana") {
      const inicio = startOfWeekMonday(fecha);
      return { desde: inicio, hasta: addDays(inicio, 5) }; // lun–sáb
    }
    const inicioMes = startOfMonth(fecha);
    const finMes = endOfMonth(fecha);
    return { desde: startOfWeekMonday(inicioMes), hasta: addDays(startOfWeekMonday(finMes), 6) };
  }, [vista, fecha]);

  /* Citas y bloqueos del rango visible */
  useEffect(() => {
    let cancelado = false;
    (async () => {
      setCargando(true);
      const desdeISO = toISODate(rango.desde);
      const hastaISO = toISODate(rango.hasta);

      const [{ data: citasData }, { data: bloqueosData }] = await Promise.all([
        supabase
          .from("citas")
          .select(
            "id, fecha, hora_inicio, hora_fin, estado, empleado_id, servicio_id, clientas(nombre), servicios(nombre), empleados(nombre)",
          )
          .gte("fecha", desdeISO)
          .lte("fecha", hastaISO)
          .neq("estado", "cancelada")
          .order("hora_inicio"),
        supabase
          .from("disponibilidad_empleados")
          .select("id, empleado_id, fecha, dia_completo, hora_inicio, hora_fin, motivo, empleados(nombre)")
          .gte("fecha", desdeISO)
          .lte("fecha", hastaISO),
      ]);

      if (cancelado) return;

      setCitas(
        (citasData ?? []).map((c) => ({
          id: c.id,
          fecha: c.fecha,
          hora_inicio: c.hora_inicio,
          hora_fin: c.hora_fin,
          estado: c.estado,
          empleado_id: c.empleado_id,
          servicio_id: c.servicio_id,
          clienta_nombre: c.clientas?.nombre ?? "Clienta",
          servicio_nombre: c.servicios?.nombre ?? "Servicio",
          empleado_nombre: c.empleados?.nombre ?? null,
        })),
      );

      setBloqueos(
        (bloqueosData ?? []).map((b) => ({
          id: b.id,
          empleado_id: b.empleado_id,
          empleado_nombre: b.empleados?.nombre ?? "Estilista",
          fecha: b.fecha,
          dia_completo: b.dia_completo,
          hora_inicio: b.hora_inicio,
          hora_fin: b.hora_fin,
          motivo: b.motivo,
        })),
      );

      setCargando(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [supabase, rango.desde, rango.hasta]);

  const toggleFilter = (id: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const citasVisibles = (dia: string) =>
    citas.filter((c) => c.fecha === dia && activeFilters.has(c.servicio_id));

  const bloqueosDelDia = (dia: string) => bloqueos.filter((b) => b.fecha === dia);

  function shift(direction: 1 | -1) {
    if (vista === "dia") setFecha((f) => addDays(f, direction));
    else if (vista === "semana") setFecha((f) => addDays(f, direction * 7));
    else setFecha((f) => addMonths(f, direction));
  }

  function irAHoy() {
    setFecha(new Date());
  }

  const hoy = new Date();

  /* Bloques reutilizables */
  const navRango = (
    <div className="flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <button onClick={() => shift(-1)} className="px-2.5 py-2 hover:bg-zinc-50 transition-colors text-zinc-500 border-r border-zinc-200">
        <ChevronLeftIcon />
      </button>
      <span className="text-sm font-medium text-zinc-700 px-3 whitespace-nowrap min-w-[9rem] text-center">
        {vista === "dia" && formatDiaLargo(fecha)}
        {vista === "semana" && formatRangoSemana(rango.desde, rango.hasta)}
        {vista === "mes" && formatMesAnio(fecha)}
      </span>
      <button onClick={() => shift(1)} className="px-2.5 py-2 hover:bg-zinc-50 transition-colors text-zinc-500 border-l border-zinc-200">
        <ChevronRightIcon />
      </button>
    </div>
  );

  const botonHoy = (
    <button
      onClick={irAHoy}
      className="text-sm font-medium text-zinc-500 bg-white border border-zinc-200 rounded-xl px-3 py-2 hover:border-zinc-300 transition-colors"
    >
      Hoy
    </button>
  );

  const selectorVista = (
    <div className="flex items-center bg-zinc-100 rounded-xl p-1">
      {(["dia", "semana", "mes"] as Vista[]).map((v) => (
        <button
          key={v}
          onClick={() => setVista(v)}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors capitalize ${
            vista === v ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );

  const filterDots = servicios.length > 0 && (
    <div className="flex items-center gap-4 flex-wrap">
      {servicios.map((s) => (
        <button
          key={s.id}
          onClick={() => toggleFilter(s.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            activeFilters.has(s.id) ? "text-zinc-700" : "text-zinc-300"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
              activeFilters.has(s.id) ? colorPorServicio.get(s.id) : "bg-zinc-200"
            }`}
          />
          {s.nombre}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">
      {/* ══ Header ══ */}
      <div className="mb-6 lg:mb-8 flex flex-col gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Agenda</h1>
          {selectorVista}
          {botonHoy}
          {navRango}
          <div className="flex-1" />
          <Link
            href="/admin/agenda/nueva"
            className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
          >
            + Nueva cita
          </Link>
        </div>
        {filterDots}
      </div>

      {cargando && citas.length === 0 && (
        <p className="text-sm text-zinc-400 mb-4">Cargando agenda…</p>
      )}

      {vista === "dia" && (
        <VistaDia
          fecha={fecha}
          hoy={hoy}
          horario={horario}
          estilistas={estilistas}
          citas={citasVisibles(toISODate(fecha))}
          bloqueos={bloqueosDelDia(toISODate(fecha))}
          colorPorServicio={colorPorServicio}
        />
      )}

      {vista === "semana" && (
        <VistaSemana
          inicio={rango.desde}
          hoy={hoy}
          citasVisibles={citasVisibles}
          bloqueosDelDia={bloqueosDelDia}
          colorPorServicio={colorPorServicio}
          selectedDayMobile={selectedDayMobile}
          setSelectedDayMobile={setSelectedDayMobile}
        />
      )}

      {vista === "mes" && (
        <VistaMes
          gridInicio={rango.desde}
          mesActivo={fecha.getMonth()}
          hoy={hoy}
          citasVisibles={citasVisibles}
          bloqueosDelDia={bloqueosDelDia}
          colorPorServicio={colorPorServicio}
          onSeleccionarDia={(d) => {
            setFecha(d);
            setVista("dia");
          }}
        />
      )}
    </div>
  );
}

/* ════════════════════════ Vista Día ════════════════════════ */

function VistaDia({
  fecha, hoy, horario, estilistas, citas, bloqueos, colorPorServicio,
}: {
  fecha: Date;
  hoy: Date;
  horario: { abierto: boolean; apertura: string; cierre: string };
  estilistas: Estilista[];
  citas: Cita[];
  bloqueos: Bloqueo[];
  colorPorServicio: Map<string, string>;
}) {
  if (!horario.abierto) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
        <p className="text-sm text-zinc-400">El salón permanece cerrado este día.</p>
      </div>
    );
  }

  const sinAsignar = citas.some((c) => !c.empleado_id);
  const columnas = [...estilistas, ...(sinAsignar ? [{ id: "__sin_asignar__", nombre: "Sin asignar" }] : [])];

  if (columnas.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
        <p className="text-sm text-zinc-400">No hay estilistas activas configuradas todavía.</p>
      </div>
    );
  }

  const aperturaMin = horaAMinutos(horario.apertura);
  const cierreMin = horaAMinutos(horario.cierre);
  const totalMin = cierreMin - aperturaMin;
  const alturaTotal = totalMin * PX_POR_MINUTO;

  const horas: number[] = [];
  for (let m = aperturaMin; m <= cierreMin; m += 60) horas.push(m);

  const esHoy = isSameDay(fecha, hoy);

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-x-auto">
      <div className="flex min-w-[640px]">
        {/* Gutter de horas */}
        <div className="w-14 shrink-0 relative border-r border-zinc-100" style={{ height: alturaTotal + 24 }}>
          {horas.map((m) => (
            <span
              key={m}
              className="absolute -translate-y-1/2 text-[11px] text-zinc-400 pr-2 w-full text-right"
              style={{ top: (m - aperturaMin) * PX_POR_MINUTO + 12 }}
            >
              {String(Math.floor(m / 60)).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {/* Columnas por estilista */}
        {columnas.map((col) => {
          const citasCol = citas.filter((c) =>
            col.id === "__sin_asignar__" ? !c.empleado_id : c.empleado_id === col.id,
          );
          const bloqueosCol = bloqueos.filter((b) => b.empleado_id === col.id);

          return (
            <div key={col.id} className="flex-1 min-w-[150px] border-r border-zinc-100 last:border-r-0">
              <div className="h-6 flex items-center justify-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wide border-b border-zinc-100 sticky top-0 bg-white">
                {col.nombre}
              </div>
              <div className="relative" style={{ height: alturaTotal }}>
                {horas.map((m) => (
                  <div
                    key={m}
                    className="absolute w-full border-t border-zinc-50"
                    style={{ top: (m - aperturaMin) * PX_POR_MINUTO }}
                  />
                ))}

                {bloqueosCol.map((b) => {
                  const top = b.dia_completo ? 0 : (horaAMinutos(b.hora_inicio!) - aperturaMin) * PX_POR_MINUTO;
                  const alto = b.dia_completo
                    ? alturaTotal
                    : (horaAMinutos(b.hora_fin!) - horaAMinutos(b.hora_inicio!)) * PX_POR_MINUTO;
                  return (
                    <div
                      key={b.id}
                      className="absolute inset-x-1 rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50/60 flex items-center justify-center px-1"
                      style={{ top, height: Math.max(alto, 24) }}
                    >
                      <span className="text-[11px] text-zinc-400 text-center leading-tight">
                        {b.motivo || "Bloqueada"}
                      </span>
                    </div>
                  );
                })}

                {citasCol.map((c) => {
                  const top = (horaAMinutos(c.hora_inicio) - aperturaMin) * PX_POR_MINUTO;
                  const alto = Math.max((horaAMinutos(c.hora_fin) - horaAMinutos(c.hora_inicio)) * PX_POR_MINUTO, 30);
                  const enCurso =
                    esHoy &&
                    horaAMinutos(c.hora_inicio) <= horaAMinutos(toHHMM(hoy)) &&
                    horaAMinutos(c.hora_fin) > horaAMinutos(toHHMM(hoy));
                  const pendiente = c.estado === "pendiente_confirmacion";

                  return (
                    <Link
                      key={c.id}
                      href={`/admin/agenda/${c.id}`}
                      className={`absolute inset-x-1 rounded-lg p-1.5 overflow-hidden transition-colors ${
                        enCurso
                          ? "bg-zinc-900 text-white hover:bg-zinc-800"
                          : "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                      }`}
                      style={{ top, height: alto }}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorPorServicio.get(c.servicio_id) ?? "bg-zinc-300"}`} />
                        <span className={`text-[10px] tabular-nums ${enCurso ? "text-zinc-400" : "text-zinc-400"}`}>
                          {c.hora_inicio.slice(0, 5)}
                        </span>
                      </div>
                      <div className={`text-xs font-semibold leading-tight truncate ${enCurso ? "text-white" : "text-zinc-900"}`}>
                        {c.clienta_nombre}
                      </div>
                      <div className={`text-[11px] truncate ${pendiente ? "text-orange-500 font-medium" : enCurso ? "text-zinc-400" : "text-zinc-400"}`}>
                        {pendiente ? "Depósito pendiente" : c.servicio_nombre}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function toHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/* ════════════════════════ Vista Semana ════════════════════════ */

function VistaSemana({
  inicio, hoy, citasVisibles, bloqueosDelDia, colorPorServicio, selectedDayMobile, setSelectedDayMobile,
}: {
  inicio: Date;
  hoy: Date;
  citasVisibles: (isoDate: string) => Cita[];
  bloqueosDelDia: (isoDate: string) => Bloqueo[];
  colorPorServicio: Map<string, string>;
  selectedDayMobile: number;
  setSelectedDayMobile: (n: number) => void;
}) {
  const dias = Array.from({ length: 6 }, (_, i) => addDays(inicio, i));

  function Tarjeta({ cita, compacta }: { cita: Cita; compacta?: boolean }) {
    const enCurso = isSameDay(new Date(cita.fecha + "T00:00:00"), hoy) &&
      horaAMinutos(cita.hora_inicio) <= horaAMinutos(toHHMM(hoy)) &&
      horaAMinutos(cita.hora_fin) > horaAMinutos(toHHMM(hoy));
    const pendiente = cita.estado === "pendiente_confirmacion";

    return (
      <Link
        href={`/admin/agenda/${cita.id}`}
        className={`block rounded-xl transition-all ${compacta ? "p-4 flex items-center gap-4" : "p-3"} ${
          enCurso
            ? "bg-zinc-900 hover:bg-zinc-800"
            : "bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
        }`}
      >
        {compacta ? (
          <>
            <span className={`text-sm font-semibold w-12 shrink-0 tabular-nums ${enCurso ? "text-zinc-400" : "text-zinc-400"}`}>
              {cita.hora_inicio.slice(0, 5)}
            </span>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-bold truncate ${enCurso ? "text-white" : "text-zinc-900"}`}>{cita.clienta_nombre}</div>
              <div className={`text-xs mt-0.5 truncate ${pendiente ? "text-orange-500 font-medium" : "text-zinc-400"}`}>
                {pendiente ? "Depósito pendiente" : cita.servicio_nombre}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorPorServicio.get(cita.servicio_id) ?? "bg-zinc-300"}`} />
              <span className={`text-xs ${enCurso ? "text-zinc-500" : "text-zinc-400"}`}>{cita.hora_inicio.slice(0, 5)}</span>
            </div>
            <div className={`text-sm font-bold mt-0.5 leading-snug truncate ${enCurso ? "text-white" : "text-zinc-900"}`}>
              {cita.clienta_nombre}
            </div>
            <div className={`text-xs mt-0.5 truncate ${pendiente ? "text-orange-500 font-medium" : "text-zinc-400"}`}>
              {pendiente ? "Depósito pendiente" : cita.servicio_nombre}
            </div>
          </>
        )}
      </Link>
    );
  }

  function TarjetaBloqueo({ bloqueo, compacta }: { bloqueo: Bloqueo; compacta?: boolean }) {
    return (
      <div className={`border-2 border-dashed border-zinc-200 rounded-xl ${compacta ? "p-4 flex items-center gap-4" : "p-3"}`}>
        {compacta && <span className="text-sm text-zinc-300 w-12 shrink-0 tabular-nums">—</span>}
        <div>
          <div className="text-sm font-medium text-zinc-400">{bloqueo.empleado_nombre}</div>
          <div className="text-xs text-zinc-300 mt-0.5">
            {bloqueo.dia_completo ? "Día bloqueado" : `Bloqueada ${bloqueo.hora_inicio?.slice(0, 5)}–${bloqueo.hora_fin?.slice(0, 5)}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile / tablet */}
      <div className="lg:hidden">
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {dias.map((d, i) => {
            const esHoy = isSameDay(d, hoy);
            const isSelected = i === selectedDayMobile;
            return (
              <button
                key={i}
                onClick={() => setSelectedDayMobile(i)}
                className={`flex flex-col items-center px-4 py-2.5 rounded-xl shrink-0 min-w-[60px] transition-colors ${
                  isSelected ? "bg-zinc-900 text-white" : esHoy ? "bg-white border-2 border-zinc-900 text-zinc-900" : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{esHoy ? "HOY" : diaAbbr(d)}</span>
                <span className="text-xl font-bold mt-1 leading-none">{d.getDate()}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-2">
          {(() => {
            const iso = toISODate(dias[selectedDayMobile]);
            const appts = citasVisibles(iso);
            const bloqueosD = bloqueosDelDia(iso);
            if (appts.length === 0 && bloqueosD.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
                  <p className="text-sm text-zinc-400">No hay citas para este día</p>
                </div>
              );
            }
            return (
              <>
                {appts.map((c) => <Tarjeta key={c.id} cita={c} compacta />)}
                {bloqueosD.map((b) => <TarjetaBloqueo key={b.id} bloqueo={b} compacta />)}
              </>
            );
          })()}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block overflow-x-auto -mx-8 px-8">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-6 gap-3 mb-1">
            {dias.map((d) => {
              const esHoy = isSameDay(d, hoy);
              return (
                <div key={d.toISOString()} className={`pb-3 ${esHoy ? "border-b-2 border-zinc-900" : "border-b border-zinc-200"}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider ${esHoy ? "text-zinc-700" : "text-zinc-400"}`}>
                    {esHoy ? `${diaAbbr(d)} · HOY` : diaAbbr(d)}
                  </p>
                  <p className={`text-2xl font-bold mt-0.5 leading-none ${esHoy ? "text-zinc-900" : "text-zinc-500"}`}>{d.getDate()}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-6 gap-3 pt-4">
            {dias.map((d) => {
              const iso = toISODate(d);
              const appts = citasVisibles(iso);
              const bloqueosD = bloqueosDelDia(iso);
              return (
                <div key={iso} className="space-y-2">
                  {appts.map((c) => <Tarjeta key={c.id} cita={c} />)}
                  {bloqueosD.map((b) => <TarjetaBloqueo key={b.id} bloqueo={b} />)}
                  {appts.length === 0 && bloqueosD.length === 0 && (
                    <p className="text-xs text-zinc-300 text-center pt-4">Sin citas</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════ Vista Mes ════════════════════════ */

function VistaMes({
  gridInicio, mesActivo, hoy, citasVisibles, bloqueosDelDia, colorPorServicio, onSeleccionarDia,
}: {
  gridInicio: Date;
  mesActivo: number;
  hoy: Date;
  citasVisibles: (isoDate: string) => Cita[];
  bloqueosDelDia: (isoDate: string) => Bloqueo[];
  colorPorServicio: Map<string, string>;
  onSeleccionarDia: (d: Date) => void;
}) {
  const dias = Array.from({ length: 7 * 6 }, (_, i) => addDays(gridInicio, i)).slice(
    0,
    // recortar semanas sobrantes si el mes cabe en 5 semanas
    (() => {
      for (let semanas = 5; semanas <= 6; semanas++) {
        const ultimo = addDays(gridInicio, semanas * 7 - 1);
        if (ultimo.getMonth() !== mesActivo || semanas === 6) return semanas * 7;
      }
      return 42;
    })(),
  );

  const cabeceras = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {cabeceras.map((c, i) => (
          <div
            key={c}
            className={`py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
              i === 6 ? "text-zinc-300" : "text-zinc-400"
            }`}
          >
            {c}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {dias.map((d) => {
          const iso = toISODate(d);
          const enMes = d.getMonth() === mesActivo;
          const esHoy = isSameDay(d, hoy);
          const esDomingo = d.getDay() === 0;
          const appts = citasVisibles(iso);
          const bloqueosD = bloqueosDelDia(iso);
          const visibles = appts.slice(0, 3);
          const restantes = appts.length - visibles.length;

          return (
            <button
              key={iso}
              onClick={() => onSeleccionarDia(d)}
              className={`min-h-[100px] sm:min-h-[120px] border-b border-r border-zinc-100 p-1.5 sm:p-2 text-left align-top flex flex-col gap-1 transition-colors hover:bg-zinc-50 ${
                esDomingo ? "bg-zinc-50/50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full ${
                    esHoy ? "bg-zinc-900 text-white" : enMes ? "text-zinc-700" : "text-zinc-300"
                  }`}
                >
                  {d.getDate()}
                </span>
                {bloqueosD.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </div>

              <div className="flex flex-col gap-0.5">
                {visibles.map((c) => (
                  <div key={c.id} className="flex items-center gap-1 text-[10px] sm:text-[11px] truncate">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${colorPorServicio.get(c.servicio_id) ?? "bg-zinc-300"}`} />
                    <span className="text-zinc-400 tabular-nums shrink-0">{c.hora_inicio.slice(0, 5)}</span>
                    <span className="text-zinc-700 truncate">{c.clienta_nombre}</span>
                  </div>
                ))}
                {restantes > 0 && <span className="text-[10px] text-zinc-400 pl-2.5">+{restantes} más</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
