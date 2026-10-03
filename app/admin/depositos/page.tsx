"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";
import {
  BOTON_WHATSAPP_CLASES,
  enlaceCitaConfirmada,
  useMensajeCitaConfirmada,
  useMensajeDepositoRechazado,
} from "@/lib/whatsapp-citas";
import { toISODate } from "@/lib/dates";

/* ── Icons ── */
function PdfIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
      <path d="M7 3h11l5 5v17a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M18 3v5h5" />
    </svg>
  );
}

/* ── Tipos ── */
type TabId = "pendientes" | "validados" | "rechazados";

interface DepositoRow {
  id: string;
  monto: number;
  comprobante_url: string;
  estado: string;
  verificado_at: string | null;
  created_at: string;
  cita_id: string;
  clienta_nombre: string;
  clienta_telefono: string | null;
  fecha: string;
  hora_inicio: string;
  servicio_nombre: string;
  estilista_nombre: string | null;
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
function hace(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export default function DepositosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [depositos, setDepositos] = useState<DepositoRow[]>([]);
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("pendientes");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const plantillaMensaje = useMensajeCitaConfirmada();
  const plantillaRechazo = useMensajeDepositoRechazado();

  async function cargar() {
    setCargando(true);
    const { data } = await supabase
      .from("depositos")
      .select(
        "id, monto, comprobante_url, estado, verificado_at, created_at, cita_id, citas(fecha, hora_inicio, clientas(nombre, telefono), servicios(nombre), empleados(nombre))",
      )
      .order("created_at", { ascending: false });

    const filas: DepositoRow[] = (data ?? []).map((d) => {
      const cita = Array.isArray(d.citas) ? d.citas[0] : d.citas;
      const clienta = cita ? (Array.isArray(cita.clientas) ? cita.clientas[0] : cita.clientas) : null;
      const servicio = cita ? (Array.isArray(cita.servicios) ? cita.servicios[0] : cita.servicios) : null;
      const estilista = cita ? (Array.isArray(cita.empleados) ? cita.empleados[0] : cita.empleados) : null;
      return {
        id: d.id,
        monto: d.monto,
        comprobante_url: d.comprobante_url,
        estado: d.estado,
        verificado_at: d.verificado_at,
        created_at: d.created_at,
        cita_id: d.cita_id,
        clienta_nombre: clienta?.nombre ?? "—",
        clienta_telefono: clienta?.telefono ?? null,
        fecha: cita?.fecha ?? "",
        hora_inicio: cita?.hora_inicio?.slice(0, 5) ?? "",
        servicio_nombre: servicio?.nombre ?? "—",
        estilista_nombre: estilista?.nombre ?? null,
      };
    });

    // Los comprobantes nuevos guardan la ruta del bucket privado: se firma el enlace al abrirlos
    const rutas = filas.map((f) => f.comprobante_url).filter((u) => u && !/^https?:/i.test(u));
    if (rutas.length > 0) {
      const { data: firmadas } = await supabase.storage.from("comprobantes-deposito").createSignedUrls(rutas, 60 * 60);
      const porRuta = new Map((firmadas ?? []).map((f) => [f.path, f.signedUrl]));
      for (const f of filas) {
        if (porRuta.has(f.comprobante_url)) f.comprobante_url = porRuta.get(f.comprobante_url)!;
      }
    }

    setDepositos(filas);
    setSelectedId((prev) => (prev && filas.some((f) => f.id === prev) ? prev : filas[0]?.id ?? null));
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendientes = depositos.filter((d) => d.estado === "pendiente");
  const validados = depositos.filter((d) => d.estado === "verificado");
  const rechazados = depositos.filter((d) => d.estado === "rechazado");

  const hoy = toISODate(new Date());
  const validadosHoy = validados.filter((d) => (d.verificado_at ?? d.created_at).slice(0, 10) === hoy);
  const rechazadosHoy = rechazados.filter((d) => d.created_at.slice(0, 10) === hoy);
  const rechazadosMes = rechazados.filter((d) => d.created_at.slice(0, 7) === hoy.slice(0, 7));
  const montoMes = validados
    .filter((d) => (d.verificado_at ?? d.created_at).slice(0, 7) === hoy.slice(0, 7))
    .reduce((sum, d) => sum + Number(d.monto), 0);

  const visibles = activeTab === "pendientes" ? pendientes : activeTab === "validados" ? validados : rechazados;
  const resueltosHoy = [...validadosHoy, ...rechazadosHoy];

  const selected = depositos.find((d) => d.id === selectedId) ?? null;

  const tabs: { id: TabId; label: string }[] = [
    { id: "pendientes", label: "Pendientes" },
    { id: "validados", label: "Validados" },
    { id: "rechazados", label: "Rechazados" },
  ];

  async function confirmarDeposito() {
    if (!selected) return;
    setAccionando(true);
    setError(null);
    const { data: miId } = await supabase.rpc("empleado_id_actual");
    const { error } = await supabase
      .from("depositos")
      .update({ estado: "verificado", verificado_por: miId, verificado_at: new Date().toISOString() })
      .eq("id", selected.id);
    setAccionando(false);
    if (error) return setError(error.message);
    cargar();
  }

  async function rechazarDeposito() {
    if (!selected) return;
    const ok = await confirmar({
      titulo: `¿Rechazar el comprobante de ${selected.clienta_nombre}?`,
      texto: "La cita se cancelará y el horario quedará libre.",
      confirmarTexto: "Rechazar",
      peligroso: true,
    });
    if (!ok) return;
    setAccionando(true);
    setError(null);
    const { error } = await supabase.from("depositos").update({ estado: "rechazado" }).eq("id", selected.id);
    setAccionando(false);
    if (error) return setError(error.message);
    cargar();
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Depósitos</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Al validar, la clienta recibe el aviso y la cita queda confirmada.
          </p>
        </div>

        <div className="flex items-center bg-zinc-100 rounded-xl p-1 self-start">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Por validar</p>
          <p className="text-3xl font-bold text-zinc-900">{pendientes.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Validados hoy</p>
          <p className="text-3xl font-bold text-zinc-900">{validadosHoy.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Rechazados mes</p>
          <p className="text-3xl font-bold text-zinc-900">{rechazadosMes.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Validado este mes</p>
          <p className="text-3xl font-bold text-white">{formatPrecio(montoMes)}</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {/* ── Body: two columns ── */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-bold text-zinc-900">
                {activeTab === "pendientes" ? "Solicitudes pendientes" : activeTab === "validados" ? "Validados" : "Rechazados"}
              </h2>
            </div>

            {!cargando && visibles.length > 0 && (
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Clienta</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Cita</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Monto</span>
              </div>
            )}

            {cargando ? (
              <p className="px-5 py-8 text-sm text-zinc-400">Cargando…</p>
            ) : visibles.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-400">No hay solicitudes en esta categoría</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {visibles.map((dep) => {
                  const isSelected = selectedId === dep.id;
                  return (
                    <button
                      key={dep.id}
                      onClick={() => setSelectedId(dep.id)}
                      className={`w-full grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-5 py-3.5 text-left transition-colors ${
                        isSelected ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                          {dep.clienta_nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{dep.clienta_nombre}</p>
                          <p className="text-xs text-zinc-400">{hace(dep.created_at)}</p>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm text-zinc-700 truncate">{dep.fecha} · {dep.hora_inicio}</p>
                        <p className="text-xs text-zinc-400 truncate">
                          {dep.servicio_nombre}{dep.estilista_nombre ? ` · ${dep.estilista_nombre}` : ""}
                        </p>
                      </div>

                      <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap">{formatPrecio(dep.monto)}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {activeTab === "pendientes" && resueltosHoy.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-base font-bold text-zinc-900">Resueltos hoy</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {resueltosHoy.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => setSelectedId(dep.id)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
                      selectedId === dep.id ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                    }`}
                  >
                    <span className="text-sm font-medium text-zinc-700">{dep.clienta_nombre}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        dep.estado === "verificado" ? "bg-green-50 text-green-600" : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {dep.estado === "verificado" ? "Validado" : "Rechazado"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT: detail panel ══ */}
        <div className="lg:w-[320px] shrink-0">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <p className="text-sm text-zinc-400">Selecciona un depósito de la lista.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200 p-5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-base font-bold text-zinc-900">{selected.clienta_nombre}</p>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    selected.estado === "pendiente"
                      ? "bg-orange-50 text-orange-500"
                      : selected.estado === "verificado"
                      ? "bg-green-50 text-green-600"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {selected.estado === "pendiente" ? "Pendiente" : selected.estado === "verificado" ? "Validado" : "Rechazado"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                {selected.servicio_nombre} · {selected.fecha}, {selected.hora_inicio}
                {selected.estilista_nombre ? ` · ${selected.estilista_nombre}` : ""}
              </p>

              {esPdf(selected.comprobante_url) ? (
                <a
                  href={selected.comprobante_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all"
                >
                  <PdfIcon />
                  <p className="text-sm text-zinc-500 font-medium mt-1">Ver comprobante (PDF)</p>
                </a>
              ) : (
                <a
                  href={selected.comprobante_url}
                  target="_blank"
                  rel="noreferrer"
                  className="border-2 border-dashed border-zinc-200 rounded-xl overflow-hidden flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.comprobante_url} alt="Comprobante de transferencia" className="w-full max-h-64 object-contain bg-zinc-50" />
                </a>
              )}

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-zinc-400">Monto declarado</span>
                  <span className="text-sm font-bold text-zinc-900">{formatPrecio(selected.monto)}</span>
                </div>
                {selected.verificado_at && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-400">Validado</span>
                    <span className="text-sm text-zinc-700">{formatFechaHora(selected.verificado_at)}</span>
                  </div>
                )}
              </div>

              {selected.estado === "pendiente" && (
                <div className="flex gap-2.5 mb-3">
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
                    Validar y confirmar
                  </button>
                </div>
              )}

              {selected.estado === "rechazado" && (
                <a
                  href={enlaceCitaConfirmada(plantillaRechazo, {
                    telefono: selected.clienta_telefono,
                    nombre: selected.clienta_nombre,
                    servicio: selected.servicio_nombre,
                    fecha: selected.fecha,
                    hora: selected.hora_inicio,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BOTON_WHATSAPP_CLASES} mb-3`}
                >
                  Notificar por WhatsApp
                </a>
              )}

              {selected.estado === "verificado" && (
                <a
                  href={enlaceCitaConfirmada(plantillaMensaje, {
                    telefono: selected.clienta_telefono,
                    nombre: selected.clienta_nombre,
                    servicio: selected.servicio_nombre,
                    fecha: selected.fecha,
                    hora: selected.hora_inicio,
                    estilista: selected.estilista_nombre,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BOTON_WHATSAPP_CLASES} mb-3`}
                >
                  Notificar por WhatsApp
                </a>
              )}

              <Link
                href={`/admin/agenda/${selected.cita_id}`}
                className="block text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                Ver la cita completa →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
