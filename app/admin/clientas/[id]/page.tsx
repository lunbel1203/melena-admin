"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avisar, confirmar, enlaceWhatsApp } from "@/lib/alerts";
import { toISODate } from "@/lib/dates";
import { useRouter } from "next/navigation";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}

const statusBadge: Record<string, string> = {
  Activa: "bg-green-100 text-green-700",
  Molestia: "bg-orange-100 text-orange-600",
  Nueva: "bg-zinc-100 text-zinc-600",
  Inactiva: "bg-zinc-100 text-zinc-500",
};

const citaEstadoBadge: Record<string, string> = {
  completada: "bg-zinc-100 text-zinc-600",
  confirmada: "bg-green-50 text-green-700",
  pendiente_confirmacion: "bg-amber-50 text-amber-600",
  cancelada: "bg-red-50 text-red-500",
  no_show: "bg-red-50 text-red-500",
};

const citaEstadoLabel: Record<string, string> = {
  completada: "Completada",
  confirmada: "Confirmada",
  pendiente_confirmacion: "Pendiente",
  cancelada: "Cancelada",
  no_show: "No se presentó",
};

const ticketEstadoBadge: Record<string, string> = {
  abierto: "bg-red-50 text-red-600",
  en_proceso: "bg-amber-50 text-amber-600",
  resuelto: "bg-zinc-100 text-zinc-500",
};

const ticketEstadoLabel: Record<string, string> = {
  abierto: "Abierto",
  en_proceso: "En proceso",
  resuelto: "Resuelto",
};

interface Clienta {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  fecha_nacimiento: string | null;
  notas: string | null;
  created_at: string;
}
interface Cita {
  id: string;
  fecha: string;
  hora_inicio: string;
  estado: string;
  servicios: { nombre: string } | { nombre: string }[] | null;
  empleados: { nombre: string } | { nombre: string }[] | null;
}
interface TicketMolestia {
  id: string;
  descripcion: string | null;
  intensidad: number | null;
  estado: string;
  created_at: string;
}

function uno<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? v[0] ?? null : v;
}

function formatearFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-DO", { day: "numeric", month: "short" });
}

export default function PerfilClientaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [clienta, setClienta] = useState<Clienta | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [tickets, setTickets] = useState<TicketMolestia[]>([]);
  const [totalFacturado, setTotalFacturado] = useState(0);
  const [cantidadFacturas, setCantidadFacturas] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cl }, { data: ct }, { data: tk }, { data: fc }] = await Promise.all([
        supabase.from("clientas").select("id, nombre, telefono, email, fecha_nacimiento, notas, created_at").eq("id", id).single(),
        supabase
          .from("citas")
          .select("id, fecha, hora_inicio, estado, servicios(nombre), empleados(nombre)")
          .eq("clienta_id", id)
          .order("fecha", { ascending: false })
          .order("hora_inicio", { ascending: false }),
        supabase
          .from("tickets_molestia")
          .select("id, descripcion, intensidad, estado, created_at")
          .eq("clienta_id", id)
          .order("created_at", { ascending: false }),
        supabase.from("facturas").select("total").eq("clienta_id", id).eq("estado", "cobrada"),
      ]);
      setClienta(cl);
      setCitas((ct ?? []) as Cita[]);
      setTickets(tk ?? []);
      setTotalFacturado((fc ?? []).reduce((sum, f) => sum + Number(f.total), 0));
      setCantidadFacturas((fc ?? []).length);
      setCargando(false);
    })();
  }, [supabase, id]);

  const hoy = toISODate(new Date());
  const ahoraHHMM = new Date().toTimeString().slice(0, 5);

  const proximaCita = citas
    .filter((c) => (c.estado === "pendiente_confirmacion" || c.estado === "confirmada") && (c.fecha > hoy || (c.fecha === hoy && c.hora_inicio >= ahoraHHMM)))
    .sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio))[0];

  const visitas = citas.filter((c) => c.estado === "completada").length;
  const ticketAbierto = tickets.find((t) => t.estado === "abierto" || t.estado === "en_proceso");

  let estado: string;
  if (ticketAbierto) estado = "Molestia";
  else if (citas.length === 0) estado = "Nueva";
  else if (proximaCita) estado = "Activa";
  else estado = "Inactiva";

  async function eliminarClienta() {
    if (!clienta) return;
    const ok = await confirmar({
      titulo: `¿Eliminar a ${clienta.nombre}?`,
      texto: "Esto también elimina sus citas agendadas. No se puede deshacer.",
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    setEliminando(true);
    const { error } = await supabase.from("clientas").delete().eq("id", clienta.id);
    setEliminando(false);
    if (error) {
      if (error.code === "23503") {
        return avisar("No se pudo eliminar", "Tiene facturas o check-ins registrados.");
      }
      return avisar("No se pudo eliminar", error.message);
    }
    router.push("/admin/clientas");
  }

  if (cargando) {
    return <div className="min-h-full bg-zinc-50 p-8"><p className="text-sm text-zinc-400">Cargando…</p></div>;
  }

  if (!clienta) {
    return (
      <div className="min-h-full bg-zinc-50 p-8 flex flex-col items-center justify-center text-center gap-3">
        <p className="text-sm font-semibold text-zinc-700">Clienta no encontrada.</p>
        <Link href="/admin/clientas" className="text-sm text-zinc-500 hover:text-zinc-800 underline">Volver a Clientas</Link>
      </div>
    );
  }

  const initial = clienta.nombre.charAt(0).toUpperCase();
  const desde = new Date(clienta.created_at).toLocaleDateString("es-DO", { month: "short", year: "numeric" });

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/admin/clientas" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>

          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{clienta.nombre}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[estado]}`}>
                {estado}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {clienta.telefono}{clienta.email ? ` · ${clienta.email}` : ""} · desde {desde}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={enlaceWhatsApp(clienta.telefono, `Hola ${clienta.nombre}, te escribimos de Melena.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
            >
              Enviar mensaje
            </a>
            <Link
              href={`/admin/agenda/nueva?clienta_id=${clienta.id}`}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              Registrar servicio
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Visitas</p>
          <p className="text-3xl font-bold text-zinc-900">{visitas}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Total facturado</p>
          <p className="text-2xl font-bold text-zinc-900">RD${totalFacturado.toLocaleString("es-DO")}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">
            {cantidadFacturas > 0 ? `RD$${Math.round(totalFacturado / cantidadFacturas).toLocaleString("es-DO")}` : "—"}
          </p>
        </div>

        {proximaCita ? (
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Próxima cita</p>
            <p className="text-base font-bold text-white leading-snug">
              {formatearFecha(proximaCita.fecha)} · {proximaCita.hora_inicio.slice(0, 5)}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {uno(proximaCita.servicios)?.nombre ?? "—"}{uno(proximaCita.empleados) ? ` con ${uno(proximaCita.empleados)?.nombre}` : ""}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 flex items-center">
            <p className="text-sm font-semibold text-zinc-500">Sin próxima cita</p>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">

        {/* ══ Columna izquierda ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Historial de citas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Historial de citas</h2>
            </div>

            {citas.length > 0 ? (
              <>
                <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 px-5 py-2.5 border-b border-zinc-50">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Fecha</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Servicio</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Estilista</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Estado</span>
                </div>
                {citas.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 items-center px-5 py-3.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors"
                  >
                    <span className="text-sm text-zinc-500">{formatearFecha(c.fecha)}</span>
                    <span className="text-sm text-zinc-800 font-medium">{uno(c.servicios)?.nombre ?? "—"}</span>
                    <span className="text-sm text-zinc-500">{uno(c.empleados)?.nombre ?? "—"}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full justify-self-start ${citaEstadoBadge[c.estado] ?? "bg-zinc-100 text-zinc-500"}`}>
                      {citaEstadoLabel[c.estado] ?? c.estado}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin citas registradas aún.</p>
            )}
          </div>

          {/* Molestias reportadas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Molestias reportadas</h2>
            </div>

            {tickets.length > 0 ? (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">
                      {t.descripcion || "Sin descripción"}{t.intensidad ? ` · intensidad ${t.intensidad}/5` : ""}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Reportado el {new Date(t.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${ticketEstadoBadge[t.estado] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {ticketEstadoLabel[t.estado] ?? t.estado}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin molestias reportadas.</p>
            )}
          </div>
        </div>

        {/* ══ Columna derecha ══ */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 space-y-4">

          {/* Notas internas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Notas internas
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {clienta.notas || "Sin notas."}
            </p>
          </div>

          {/* Datos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Datos
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Teléfono</span>
                <span className="text-sm font-semibold text-zinc-900">{clienta.telefono}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Correo</span>
                <span className="text-sm font-semibold text-zinc-900 text-right truncate max-w-[160px]">{clienta.email || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Nacimiento</span>
                <span className="text-sm font-semibold text-zinc-900">{clienta.fecha_nacimiento ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Eliminar */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <button
              onClick={eliminarClienta}
              disabled={eliminando}
              className="w-full py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {eliminando ? "Eliminando…" : "Eliminar clienta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
