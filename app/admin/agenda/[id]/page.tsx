"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";
import { BOTON_WHATSAPP_CLASES, enlaceCitaConfirmada } from "@/lib/whatsapp-citas";
import {
  addDays,
  diaAbbr,
  formatDiaLargo,
  horaAMinutos,
  minutosAHora,
  parseISODate,
  toISODate,
} from "@/lib/dates";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
      <rect x="3" y="3" width="26" height="26" rx="3" />
      <circle cx="11" cy="11" r="3" />
      <path d="M3 22l7-7 5 5 4-4 10 10" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
      <path d="M7 3h11l5 5v17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M18 3v5h5" />
    </svg>
  );
}

/* ── Tipos ── */
type StepStatus = "done" | "pending" | "locked" | "rejected";

interface CitaDetalle {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  notas: string | null;
  created_at: string;
  empleado_id: string | null;
  clienta: { id: string; nombre: string; telefono: string; email: string | null };
  servicio: { id: string; nombre: string; duracion_minutos: number; precio: number };
  empleado: { id: string; nombre: string } | null;
}

interface Deposito {
  id: string;
  monto: number;
  comprobante_url: string;
  estado: string;
  verificado_at: string | null;
  notas_verificacion: string | null;
}

function formatPrecio(n: number) {
  return `RD$${n.toLocaleString("es-DO")}`;
}
function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-DO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
function esPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-4">{children}</p>;
}

/* ── Step icon ── */
function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6l3 3 5-5" />
        </svg>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-orange-400" />
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-red-400 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-red-400" />
      </div>
    );
  }
  return <div className="w-6 h-6 rounded-full border-2 border-zinc-200 shrink-0" />;
}

const DIAS_A_MOSTRAR = 14;

/* ── Page ── */
export default function CitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);

  const [cita, setCita] = useState<CitaDetalle | null>(null);
  const [deposito, setDeposito] = useState<Deposito | null>(null);
  const [visitas, setVisitas] = useState<number | null>(null);
  const [ultimoServicio, setUltimoServicio] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mostrarReagendar, setMostrarReagendar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState<Date | null>(null);
  const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
  const [nuevaHora, setNuevaHora] = useState<string | null>(null);
  const [cargandoHoras, setCargandoHoras] = useState(false);

  async function cargar() {
    setCargando(true);
    const { data, error } = await supabase
      .from("citas")
      .select(
        "id, fecha, hora_inicio, hora_fin, estado, notas, created_at, empleado_id, clientas(id, nombre, telefono, email), servicios(id, nombre, duracion_minutos, precio), empleados(id, nombre)",
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      setNotFound(true);
      setCargando(false);
      return;
    }

    setCita({
      id: data.id,
      fecha: data.fecha,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      estado: data.estado,
      notas: data.notas,
      created_at: data.created_at,
      empleado_id: data.empleado_id,
      clienta: data.clientas!,
      servicio: data.servicios!,
      empleado: data.empleados,
    });

    const { data: dep } = await supabase
      .from("depositos")
      .select("id, monto, comprobante_url, estado, verificado_at, notas_verificacion")
      .eq("cita_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    // Los comprobantes nuevos guardan la ruta del bucket privado: se firma el enlace al abrir la cita
    if (dep && dep.comprobante_url && !/^https?:/i.test(dep.comprobante_url)) {
      const { data: firmada } = await supabase.storage.from("comprobantes-deposito").createSignedUrl(dep.comprobante_url, 60 * 60);
      if (firmada?.signedUrl) dep.comprobante_url = firmada.signedUrl;
    }
    setDeposito(dep);

    const { count } = await supabase
      .from("citas")
      .select("id", { count: "exact", head: true })
      .eq("clienta_id", data.clientas!.id);
    setVisitas(count ?? 1);

    const { data: anterior } = await supabase
      .from("citas")
      .select("fecha, servicios(nombre)")
      .eq("clienta_id", data.clientas!.id)
      .neq("id", id)
      .order("fecha", { ascending: false })
      .limit(1)
      .maybeSingle();
    setUltimoServicio(anterior ? `${anterior.servicios?.nombre} · ${parseISODate(anterior.fecha).toLocaleDateString("es-DO", { month: "short", year: "numeric" })}` : "Primera visita");

    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* Reagendar: horarios disponibles del estilista asignado */
  useEffect(() => {
    if (!mostrarReagendar || !nuevaFecha || !cita?.empleado_id) return;
    let cancelado = false;
    (async () => {
      setCargandoHoras(true);
      setNuevaHora(null);
      const { data } = await supabase.rpc("horarios_disponibles_estilista", {
        p_empleado_id: cita.empleado_id!,
        p_fecha: toISODate(nuevaFecha),
        p_duracion_minutos: cita.servicio.duracion_minutos,
      });
      if (cancelado) return;
      setHorasDisponibles((data ?? []).map((s: { hora_inicio: string }) => s.hora_inicio.slice(0, 5)));
      setCargandoHoras(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [mostrarReagendar, nuevaFecha, cita?.empleado_id, cita?.servicio.duracion_minutos, supabase]);

  const dias = useMemo(() => {
    const lista: Date[] = [];
    let d = new Date();
    while (lista.length < DIAS_A_MOSTRAR) {
      if (d.getDay() !== 0) lista.push(new Date(d));
      d = addDays(d, 1);
    }
    return lista;
  }, []);

  async function confirmarDeposito() {
    if (!deposito) return;
    setAccionando(true);
    setError(null);
    const { data: miId } = await supabase.rpc("empleado_id_actual");
    const { error } = await supabase
      .from("depositos")
      .update({ estado: "verificado", verificado_por: miId, verificado_at: new Date().toISOString() })
      .eq("id", deposito.id);
    setAccionando(false);
    if (error) return setError(error.message);
    cargar();
  }

  async function rechazarDeposito() {
    if (!deposito) return;
    const ok = await confirmar({
      titulo: "¿Rechazar este comprobante?",
      texto: "La cita se cancelará y el horario quedará libre.",
      confirmarTexto: "Rechazar",
      peligroso: true,
    });
    if (!ok) return;
    setAccionando(true);
    setError(null);
    const { error } = await supabase.from("depositos").update({ estado: "rechazado" }).eq("id", deposito.id);
    setAccionando(false);
    if (error) return setError(error.message);
    cargar();
  }

  async function cancelarCita() {
    const ok = await confirmar({
      titulo: "¿Cancelar esta cita?",
      texto: "Esta acción no se puede deshacer.",
      confirmarTexto: "Cancelar cita",
      peligroso: true,
    });
    if (!ok) return;
    setAccionando(true);
    setError(null);
    const { error } = await supabase.from("citas").update({ estado: "cancelada" }).eq("id", id);
    setAccionando(false);
    if (error) return setError(error.message);
    cargar();
  }

  async function guardarReagendo() {
    if (!nuevaFecha || !nuevaHora || !cita) return;
    setAccionando(true);
    setError(null);
    const horaFin = minutosAHora(horaAMinutos(nuevaHora) + cita.servicio.duracion_minutos);
    const { error } = await supabase
      .from("citas")
      .update({ fecha: toISODate(nuevaFecha), hora_inicio: nuevaHora, hora_fin: horaFin })
      .eq("id", id);
    setAccionando(false);
    if (error) {
      setError(error.code === "23P01" ? "Ese horario ya no está disponible." : error.message);
      return;
    }
    setMostrarReagendar(false);
    cargar();
  }

  if (cargando) {
    return <div className="min-h-full bg-zinc-50 flex items-center justify-center"><p className="text-sm text-zinc-400">Cargando…</p></div>;
  }

  if (notFound || !cita) {
    return (
      <div className="min-h-full bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-sm">Cita no encontrada</p>
          <Link href="/admin/agenda" className="text-sm font-medium text-zinc-900 underline mt-2 inline-block">
            Volver a la agenda
          </Link>
        </div>
      </div>
    );
  }

  const isPendingDeposit = deposito?.estado === "pendiente";
  const cancelada = cita.estado === "cancelada";
  const confirmada = cita.estado === "confirmada" || cita.estado === "completada";
  const total = cita.servicio.precio;
  const depositoMonto = deposito?.estado === "verificado" ? deposito.monto : 0;

  const steps: { label: string; detail: string; status: StepStatus }[] = [
    {
      label: "Cita creada",
      detail: formatFechaHora(cita.created_at),
      status: "done",
    },
    {
      label: "Comprobante subido",
      detail: deposito ? formatFechaHora(cita.created_at) : confirmada ? "Cobro en salón" : "Sin comprobante todavía",
      status: deposito || confirmada ? "done" : "pending",
    },
    {
      label: "Validación del depósito",
      detail: !deposito
        ? "No aplica"
        : deposito.estado === "verificado"
          ? `Validado ${deposito.verificado_at ? formatFechaHora(deposito.verificado_at) : ""}`
          : deposito.estado === "rechazado"
            ? "Comprobante rechazado"
            : "Pendiente de recepción",
      status: !deposito ? "done" : deposito.estado === "verificado" ? "done" : deposito.estado === "rechazado" ? "rejected" : "pending",
    },
    {
      label: cancelada ? "Cita cancelada" : "Cita confirmada",
      detail: cancelada ? "—" : confirmada ? "La clienta fue notificada" : "Se dispara al validar el depósito",
      status: cancelada ? "rejected" : confirmada ? "done" : "locked",
    },
  ];

  const inicioCita = parseISODate(cita.fecha);
  inicioCita.setHours(...(cita.hora_inicio.split(":").map(Number) as [number, number]));
  const avisos = [
    {
      label: "Recordatorio · un día antes",
      when: formatFechaHora(new Date(inicioCita.getTime() - 24 * 60 * 60 * 1000).toISOString()) + (cancelada ? " · cancelado" : ""),
    },
    {
      label: "Recordatorio · dos horas antes",
      when: formatFechaHora(new Date(inicioCita.getTime() - 2 * 60 * 60 * 1000).toISOString()) + (cancelada ? " · cancelado" : ""),
    },
  ];

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/agenda" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900">Cita #{cita.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Creada el {formatFechaHora(cita.created_at)}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {cancelada && (
              <span className="text-sm font-medium text-zinc-500 border border-zinc-200 px-3 py-2 rounded-xl bg-zinc-100 whitespace-nowrap">
                Cancelada
              </span>
            )}
            {isPendingDeposit && (
              <span className="text-sm font-medium text-orange-500 border border-orange-200 px-3 py-2 rounded-xl bg-orange-50 whitespace-nowrap">
                Depósito por validar
              </span>
            )}
            {!cancelada && (
              <>
                <button
                  onClick={() => {
                    setMostrarReagendar((v) => !v);
                    setNuevaFecha(null);
                  }}
                  className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
                >
                  Reagendar
                </button>
                {isPendingDeposit ? (
                  <button
                    onClick={confirmarDeposito}
                    disabled={accionando}
                    className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    Confirmar cita
                  </button>
                ) : (
                  <button
                    onClick={cancelarCita}
                    disabled={accionando}
                    className="text-sm font-semibold text-red-600 border border-red-100 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors whitespace-nowrap disabled:opacity-50"
                  >
                    Cancelar cita
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {mostrarReagendar && (
          <div className="mt-4 border border-zinc-200 rounded-xl p-4 max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">Nueva fecha y hora</p>
            <div className="grid grid-cols-7 gap-1.5 mb-3">
              {dias.map((d) => (
                <button
                  key={toISODate(d)}
                  onClick={() => setNuevaFecha(d)}
                  className={`flex flex-col items-center py-1.5 rounded-lg border text-center transition-all ${
                    nuevaFecha && toISODate(nuevaFecha) === toISODate(d)
                      ? "bg-zinc-900 border-zinc-900 text-white"
                      : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-[10px] font-medium leading-none">{diaAbbr(d)}</span>
                  <span className="text-sm font-bold mt-0.5 leading-none">{d.getDate()}</span>
                </button>
              ))}
            </div>
            {nuevaFecha && (
              <div className="mb-3">
                {cargandoHoras ? (
                  <p className="text-sm text-zinc-400">Cargando horarios…</p>
                ) : horasDisponibles.length === 0 ? (
                  <p className="text-sm text-orange-500">{cita.empleado?.nombre ?? "La estilista"} no tiene espacio ese día.</p>
                ) : (
                  <div className="grid grid-cols-5 gap-1.5">
                    {horasDisponibles.map((h) => (
                      <button
                        key={h}
                        onClick={() => setNuevaHora(h)}
                        className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                          nuevaHora === h ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={guardarReagendo}
              disabled={!nuevaFecha || !nuevaHora || accionando}
              className="w-full py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
            >
              Guardar nuevo horario
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">
        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Servicio</p>
                <p className="text-sm font-semibold text-zinc-900">{cita.servicio.nombre}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{formatDiaLargo(parseISODate(cita.fecha))}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Fecha y hora</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {diaAbbr(parseISODate(cita.fecha))} {parseISODate(cita.fecha).getDate()} · {cita.hora_inicio.slice(0, 5)}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">Termina {cita.hora_fin.slice(0, 5)}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Estilista</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                    {(cita.empleado?.nombre ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{cita.empleado?.nombre ?? "Sin asignar"}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Total</p>
                <p className="text-sm font-semibold text-zinc-900">{formatPrecio(total)}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Depósito {formatPrecio(depositoMonto)} · resta {formatPrecio(total - depositoMonto)}
                </p>
              </div>
            </div>
          </div>

          {/* Estado de la cita */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Estado de la cita</SectionLabel>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <StepIcon status={step.status} />
                  <div className="min-w-0 pt-0.5">
                    <p
                      className={`text-sm font-semibold leading-none ${
                        step.status === "pending" ? "text-orange-500" : step.status === "rejected" ? "text-red-500" : step.status === "locked" ? "text-zinc-300" : "text-zinc-900"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className={`text-xs mt-1 ${step.status === "locked" ? "text-zinc-300" : "text-zinc-400"}`}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avisos programados */}
          {!cancelada && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <SectionLabel>Avisos programados</SectionLabel>
              <div className="space-y-3">
                {avisos.map((n, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-700">{n.label}</span>
                    <span className="text-xs text-zinc-400 text-right whitespace-nowrap">{n.when}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cita.notas && (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <SectionLabel>Nota para la estilista</SectionLabel>
              <p className="text-sm text-zinc-700">{cita.notas}</p>
            </div>
          )}
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[320px] shrink-0 space-y-4">
          {/* Client card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-zinc-200 flex items-center justify-center text-base font-bold text-zinc-600 shrink-0">
                {cita.clienta.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900">{cita.clienta.nombre}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {cita.clienta.telefono} · {visitas ?? 1} {visitas === 1 ? "visita" : "visitas"}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">Última visita</span>
                <span className="text-xs font-medium text-zinc-700 text-right">{ultimoServicio ?? "…"}</span>
              </div>
            </div>

            {cita.estado === "confirmada" && (
              <a
                href={enlaceCitaConfirmada({
                  telefono: cita.clienta.telefono,
                  nombre: cita.clienta.nombre,
                  servicio: cita.servicio.nombre,
                  fecha: cita.fecha,
                  hora: cita.hora_inicio,
                  estilista: cita.empleado?.nombre,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BOTON_WHATSAPP_CLASES} mb-2`}
              >
                Notificar por WhatsApp
              </a>
            )}

            <Link
              href={`/admin/clientas/${cita.clienta.id}`}
              className="block text-center w-full py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              Ver perfil completo
            </Link>
          </div>

          {/* Comprobante */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Comprobante del depósito</SectionLabel>

            {!deposito ? (
              <p className="text-sm text-zinc-400 mb-2">Cobro en salón — no requiere depósito.</p>
            ) : (
              <>
                {esPdf(deposito.comprobante_url) ? (
                  <a
                    href={deposito.comprobante_url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                  >
                    <PdfIcon />
                    <p className="text-sm text-zinc-500 font-medium mt-1">Ver comprobante (PDF)</p>
                  </a>
                ) : (
                  <a
                    href={deposito.comprobante_url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-2 border-dashed border-zinc-200 rounded-xl overflow-hidden flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={deposito.comprobante_url} alt="Comprobante de depósito" className="w-full max-h-64 object-contain bg-zinc-50" />
                  </a>
                )}

                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400">Monto declarado</span>
                    <span className="text-xs font-bold text-zinc-900">{formatPrecio(deposito.monto)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-zinc-400">Estado</span>
                    <span className="text-xs font-medium text-zinc-700 text-right capitalize">{deposito.estado}</span>
                  </div>
                </div>

                {deposito.estado === "pendiente" && (
                  <div className="flex gap-2.5">
                    <button
                      onClick={rechazarDeposito}
                      disabled={accionando}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={confirmarDeposito}
                      disabled={accionando}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      Validar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
