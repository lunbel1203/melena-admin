"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, horaAMinutos, startOfMonth, startOfWeekMonday, toISODate } from "@/lib/dates";

const DIAS = ["L", "M", "M", "J", "V", "S", "D"];
const BAR_COLORS = ["bg-zinc-900", "bg-zinc-700", "bg-zinc-400", "bg-zinc-300"];

type Stylist = { name: string; percentage: number; blocked: boolean };
type DayBar = { day: string; value: number; amount: number; isToday: boolean };
type EnSalon = { id: string; initial: string; avatar: string; name: string; detail: string; status: string; statusClass: string };

type Datos = {
  nombre: string | null;
  citasHoy: number;
  clientasActivas: number;
  ocupacion: number | null;
  ingresoMes: number;
  dias: DayBar[];
  estilistas: Stylist[];
  depositosPendientes: number;
  ticketsAbiertos: number;
  sinDisponibilidad: number;
  enSalon: EnSalon[];
};

const AVATARS = [
  "bg-violet-100 text-violet-700",
  "bg-zinc-800 text-white",
  "bg-rose-100 text-rose-600",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
];

function compacto(n: number) {
  if (n >= 1_000_000) return `RD$${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `RD$${Math.round(n / 1000)}K`;
  return `RD$${Math.round(n).toLocaleString("es-DO")}`;
}

function saludo(h: number) {
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

function minutosEntre(inicio: string, fin: string) {
  return horaAMinutos(fin) - horaAMinutos(inicio);
}

function horaCorta(iso: string) {
  return new Date(iso).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
}

async function cargarDatos(supabase: ReturnType<typeof createClient>): Promise<Datos> {
  const ahora = new Date();
  const hoy = toISODate(ahora);
  const lunes = startOfWeekMonday(ahora);
  const inicioMes = startOfMonth(ahora);
  const hace90 = addDays(ahora, -90);
  const desde = lunes < inicioMes ? lunes : inicioMes;

  const [auth, citas, activas, cobradas, salon, se, bloqueos, depos, tickets, abiertas] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("citas").select("empleado_id, hora_inicio, hora_fin").eq("fecha", hoy).neq("estado", "cancelada").neq("estado", "no_show"),
    supabase.from("visitas").select("clienta_id").eq("estado", "cerrada").gte("created_at", hace90.toISOString()).limit(5000),
    supabase.from("facturas").select("subtotal, itbis, cobrada_at").eq("estado", "cobrada").gte("cobrada_at", desde.toISOString()).limit(5000),
    supabase.rpc("horario_salon", { p_fecha: hoy }),
    supabase.from("servicios_empleados").select("empleado_id, empleados!inner ( nombre, activo )"),
    supabase.from("disponibilidad_empleados").select("empleado_id, dia_completo").eq("fecha", hoy),
    supabase.from("depositos").select("id", { count: "exact", head: true }).eq("estado", "pendiente"),
    supabase.from("tickets_molestia").select("id", { count: "exact", head: true }).eq("estado", "abierto"),
    supabase
      .from("visitas")
      .select(`id, estado, created_at, estilista_id,
        clientas ( nombre ),
        estilista:empleados!visitas_estilista_id_fkey ( nombre ),
        facturas ( lineas_factura ( descripcion, tipo, created_at ) )`)
      .neq("estado", "cerrada")
      .order("created_at"),
  ]);

  // Nombre de quien inicia sesión
  let nombre: string | null = null;
  if (auth.data.user) {
    const { data } = await supabase.from("empleados").select("nombre").eq("user_id", auth.data.user.id).maybeSingle();
    nombre = data?.nombre.split(" ")[0] ?? null;
  }

  const citasHoy = citas.data ?? [];

  // Estilistas = personal activo que realiza servicios
  const estilistasMap = new Map<string, string>();
  for (const r of (se.data ?? []) as unknown as { empleado_id: string; empleados: { nombre: string; activo: boolean } }[]) {
    if (r.empleados.activo) estilistasMap.set(r.empleado_id, r.empleados.nombre);
  }
  const bloqueadas = new Set((bloqueos.data ?? []).filter((b) => b.dia_completo).map((b) => b.empleado_id));

  // Capacidad por estilista hoy: horario del salón menos la pausa
  const h = (salon.data ?? [])[0];
  const capacidad = h?.abierto && h.apertura && h.cierre
    ? minutosEntre(h.apertura, h.cierre) - (h.pausa_inicio && h.pausa_fin ? minutosEntre(h.pausa_inicio, h.pausa_fin) : 0)
    : 0;

  const reservado = new Map<string, number>();
  for (const c of citasHoy) {
    if (c.empleado_id) reservado.set(c.empleado_id, (reservado.get(c.empleado_id) ?? 0) + minutosEntre(c.hora_inicio, c.hora_fin));
  }

  const estilistas: Stylist[] = [...estilistasMap.entries()]
    .map(([id, name]) => ({
      name,
      blocked: bloqueadas.has(id),
      percentage: capacidad > 0 ? Math.min(100, Math.round(((reservado.get(id) ?? 0) / capacidad) * 100)) : 0,
    }))
    .sort((a, b) => Number(a.blocked) - Number(b.blocked) || b.percentage - a.percentage);

  const disponibles = estilistas.filter((e) => !e.blocked);
  const ocupacion = capacidad > 0 && disponibles.length > 0
    ? Math.round(
        ([...estilistasMap.keys()].filter((id) => !bloqueadas.has(id)).reduce((s, id) => s + Math.min(reservado.get(id) ?? 0, capacidad), 0) /
          (capacidad * disponibles.length)) * 100,
      )
    : null;

  // Facturación: semana actual por día + total del mes
  const porDia = new Map<string, number>();
  let ingresoMes = 0;
  for (const f of cobradas.data ?? []) {
    if (!f.cobrada_at) continue;
    const bruto = Number(f.subtotal) + Number(f.itbis);
    const fecha = new Date(f.cobrada_at);
    if (fecha >= inicioMes) ingresoMes += bruto;
    const k = toISODate(fecha);
    porDia.set(k, (porDia.get(k) ?? 0) + bruto);
  }
  const semana = Array.from({ length: 7 }, (_, i) => addDays(lunes, i));
  const maximo = Math.max(1, ...semana.map((d) => porDia.get(toISODate(d)) ?? 0));
  const dias: DayBar[] = semana.map((d, i) => {
    const amount = porDia.get(toISODate(d)) ?? 0;
    return { day: DIAS[i], amount, value: Math.max(3, Math.round((amount / maximo) * 100)), isToday: toISODate(d) === hoy };
  });

  const sinDisponibilidad = [...estilistasMap.keys()].filter((id) => bloqueadas.has(id)).length;

  const enSalon: EnSalon[] = ((abiertas.data ?? []) as unknown as {
    id: string; estado: string; created_at: string; estilista_id: string | null;
    clientas: { nombre: string } | null;
    estilista: { nombre: string } | null;
    facturas: { lineas_factura: { descripcion: string; tipo: string; created_at: string }[] } | null; // 1:1 → objeto
  }[]).map((v, i) => {
    const nombreC = v.clientas?.nombre ?? "Clienta";
    const servicio = v.facturas?.lineas_factura.filter((l) => l.tipo === "servicio").sort((a, b) => a.created_at.localeCompare(b.created_at))[0]?.descripcion;
    const [status, statusClass] =
      !v.estilista_id ? ["Sin asignar", "bg-orange-50 text-orange-500"]
      : v.estado === "en_atencion" ? ["En curso", "bg-green-50 text-green-600"]
      : v.estado === "por_cobrar" ? ["Por cobrar", "bg-orange-50 text-orange-500"]
      : ["En espera", "bg-blue-50 text-blue-600"];
    const detail = v.estilista_id
      ? `${servicio ?? "Servicio"} · ${v.estilista?.nombre.split(" ")[0] ?? ""}`
      : `Check-in ${horaCorta(v.created_at)}`;
    return { id: v.id, initial: nombreC.charAt(0).toUpperCase(), name: nombreC, detail, status, statusClass, avatar: AVATARS[i % AVATARS.length] } satisfies EnSalon;
  });

  return {
    nombre,
    citasHoy: citasHoy.length,
    clientasActivas: new Set((activas.data ?? []).map((v) => v.clienta_id)).size,
    ocupacion,
    ingresoMes,
    dias,
    estilistas,
    depositosPendientes: depos.count ?? 0,
    ticketsAbiertos: tickets.count ?? 0,
    sinDisponibilidad,
    enSalon,
  };
}

export default function ResumenPage() {
  const supabase = useMemo(() => createClient(), []);
  const [d, setD] = useState<Datos | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos(supabase).then(setD).catch((e: Error) => setError(e.message));
  }, [supabase]);

  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-DO", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const pendientes = d ? d.depositosPendientes + d.ticketsAbiertos + d.sinDisponibilidad : 0;
  const dash = d ? null : "—";

  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 lg:mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            {saludo(ahora.getHours())}{d?.nombre ? `, ${d.nombre}` : ""}
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Esto es lo que pasa hoy en el salón.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:pt-1">
          <span className="hidden sm:block text-sm text-zinc-400 font-medium capitalize">
            {fecha}
          </span>
          <Link
            href="/admin/agenda/nueva"
            className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
          >
            + Nueva cita
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar el resumen: {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Citas hoy
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">{dash ?? d!.citasHoy}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Clientas activas
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">{dash ?? d!.clientasActivas}</p>
          <p className="text-[10px] text-zinc-400 mt-1">con visita en 90 días</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Ocupación
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">{dash ?? (d!.ocupacion === null ? "—" : `${d!.ocupacion}%`)}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Ingreso del mes
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-white">{dash ?? compacto(d!.ingresoMes)}</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-5 sm:mb-6">
            Facturación por día
          </h2>
          <div className="flex items-end gap-2 h-36 sm:h-40">
            {(d?.dias ?? []).map(({ value, isToday, amount, day }, i) => (
              <div
                key={i}
                title={`${day}: ${compacto(amount)}`}
                className={`flex-1 rounded-t-xl ${isToday ? "bg-zinc-900" : "bg-zinc-100"}`}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2.5">
            {DIAS.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs text-zinc-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stylists occupancy */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 sm:mb-5">
            Ocupación por estilista
          </h2>
          <div className="space-y-4 sm:space-y-5">
            {d && d.estilistas.length === 0 && (
              <p className="text-sm text-zinc-400">No hay estilistas con servicios asignados.</p>
            )}
            {(d?.estilistas ?? []).map(({ name, percentage, blocked }, i) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-zinc-700 font-medium">{name}</span>
                  {blocked ? (
                    <span className="text-xs text-zinc-400 font-medium">Bloqueada</span>
                  ) : (
                    <span className="text-sm font-semibold text-zinc-900">{percentage}%</span>
                  )}
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  {!blocked && (
                    <div
                      className={`h-full rounded-full ${BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* Requires action */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">Requiere acción</h2>
            {d && pendientes > 0 && (
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
                {pendientes} {pendientes === 1 ? "pendiente" : "pendientes"}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {d && pendientes === 0 && <p className="text-sm text-zinc-400">Todo al día.</p>}
            {d && d.depositosPendientes > 0 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-600">
                  {d.depositosPendientes} {d.depositosPendientes === 1 ? "depósito por validar" : "depósitos por validar"}
                </span>
                <Link href="/admin/depositos" className="bg-zinc-900 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors shrink-0">
                  Revisar
                </Link>
              </div>
            )}
            {d && d.ticketsAbiertos > 0 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-600">
                  {d.ticketsAbiertos} {d.ticketsAbiertos === 1 ? "ticket de molestia abierto" : "tickets de molestia abiertos"}
                </span>
                <Link href="/admin/clientas" className="border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shrink-0">
                  Ver
                </Link>
              </div>
            )}
            {d && d.sinDisponibilidad > 0 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-600">
                  {d.sinDisponibilidad} {d.sinDisponibilidad === 1 ? "estilista sin disponibilidad hoy" : "estilistas sin disponibilidad hoy"}
                </span>
                <Link href="/admin/personal" className="border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shrink-0">
                  Configurar
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* In salon now */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">En el salón ahora</h2>
            <Link href="/admin/facturacion" className="text-xs font-semibold text-zinc-500 hover:text-zinc-800">
              Ver todo
            </Link>
          </div>
          <div className="space-y-4">
            {d && d.enSalon.length === 0 && <p className="text-sm text-zinc-400">No hay clientas en el salón.</p>}
            {(d?.enSalon ?? []).map(({ id, initial, avatar, name, detail, status, statusClass }) => (
              <div key={id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatar}`}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 truncate">{name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{detail}</div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass}`}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
