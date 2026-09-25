"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type RolEmpleado = Database["public"]["Enums"]["rol_empleado"];

const ROL_LABEL: Record<RolEmpleado, string> = {
  admin: "Admin",
  recepcion: "Recepción",
  caja: "Caja",
  estilista: "Estilista",
};

const formatoRD = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 });

function formatearFechaDO(fechaISO: string) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="28" height="22" rx="3" />
      <circle cx="10" cy="14" r="3" />
      <path d="M2 24l8-8 5 5 4-4 11 10" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5A.5.5 0 0 0 4.5 14h7a.5.5 0 0 0 .5-.5L13 4" />
    </svg>
  );
}

interface Empleado {
  id: string;
  nombre: string;
  rol: RolEmpleado;
  puesto: string | null;
  telefono: string | null;
  email: string | null;
  foto_url: string | null;
  activo: boolean;
  porcentaje_comision: number | null;
  user_id: string | null;
  created_at: string;
}

interface ServicioLinea {
  id: string;
  descripcion: string;
  subtotal: number | null;
  facturas: { cobrada_at: string | null; clientas: { nombre: string } | null } | null;
  comision: number | null;
}

export default function PerfilEmpleadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [lineas, setLineas] = useState<ServicioLinea[]>([]);
  const [serviciosAsignados, setServiciosAsignados] = useState<string[]>([]);
  const [puedeReportes, setPuedeReportes] = useState(false);
  const [diasBloqueados, setDiasBloqueados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const inicioMesISO = new Date(anio, mes, 1).toISOString();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();

  async function cargar() {
    const { data: emp } = await supabase.from("empleados").select("*").eq("id", id).single();
    if (!emp) return setCargando(false);
    setEmpleado(emp);

    const [{ data: lineasData }, { data: serviciosEmp }, { data: permisos }, { data: disponibilidad }] = await Promise.all([
      supabase
        .from("lineas_factura")
        .select("id, descripcion, subtotal, facturas!inner(cobrada_at, estado, clientas(nombre)), comisiones(monto)")
        .eq("empleado_id", id)
        .eq("facturas.estado", "cobrada")
        .gte("facturas.cobrada_at", inicioMesISO)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("servicios_empleados").select("servicios(nombre)").eq("empleado_id", id),
      emp.rol === "admin"
        ? Promise.resolve({ data: [{ puede_ver: true }] })
        : supabase.from("permisos_modulo").select("puede_ver").eq("rol", emp.rol).eq("modulo", "reportes"),
      supabase
        .from("disponibilidad_empleados")
        .select("fecha")
        .eq("empleado_id", id)
        .eq("dia_completo", true)
        .gte("fecha", `${anio}-${pad(mes + 1)}-01`)
        .lte("fecha", `${anio}-${pad(mes + 1)}-${diasEnMes}`),
    ]);

    setLineas(
      (lineasData ?? []).map((l) => ({
        id: l.id,
        descripcion: l.descripcion,
        subtotal: l.subtotal,
        facturas: Array.isArray(l.facturas) ? l.facturas[0] ?? null : l.facturas,
        comision: Array.isArray(l.comisiones) ? l.comisiones[0]?.monto ?? null : null,
      }))
    );
    setServiciosAsignados((serviciosEmp ?? []).map((s: { servicios: { nombre: string } | null }) => s.servicios?.nombre).filter((n): n is string => !!n));
    setPuedeReportes(!!permisos?.[0]?.puede_ver);
    setDiasBloqueados(new Set((disponibilidad ?? []).map((d) => d.fecha)));
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function subirFoto(file: File) {
    if (!empleado) return;
    setSubiendoFoto(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${empleado.id}/foto-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-empleados").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setError(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-empleados").getPublicUrl(path);
    const { error: updateError } = await supabase.from("empleados").update({ foto_url: data.publicUrl }).eq("id", empleado.id);
    setSubiendoFoto(false);
    if (updateError) return setError(updateError.message);
    setEmpleado({ ...empleado, foto_url: data.publicUrl });
  }

  async function quitarFoto() {
    if (!empleado) return;
    const { error } = await supabase.from("empleados").update({ foto_url: null }).eq("id", empleado.id);
    if (error) return setError(error.message);
    setEmpleado({ ...empleado, foto_url: null });
  }

  async function toggleActivo() {
    if (!empleado) return;
    const { error } = await supabase.from("empleados").update({ activo: !empleado.activo }).eq("id", empleado.id);
    if (error) return setError(error.message);
    setEmpleado({ ...empleado, activo: !empleado.activo });
  }

  async function toggleDia(fecha: string) {
    if (!empleado) return;
    if (diasBloqueados.has(fecha)) {
      await supabase.from("disponibilidad_empleados").delete().eq("empleado_id", empleado.id).eq("fecha", fecha).eq("dia_completo", true);
      setDiasBloqueados((prev) => {
        const next = new Set(prev);
        next.delete(fecha);
        return next;
      });
    } else {
      await supabase.from("disponibilidad_empleados").insert({ empleado_id: empleado.id, fecha, dia_completo: true });
      setDiasBloqueados((prev) => new Set(prev).add(fecha));
    }
  }

  if (cargando) return <p className="p-8 text-sm text-zinc-400">Cargando…</p>;
  if (!empleado) return <p className="p-8 text-sm text-zinc-400">No se encontró esta empleada.</p>;

  const servicios = lineas.filter((l) => l.subtotal !== null);
  const facturado = servicios.reduce((acc, l) => acc + Number(l.subtotal ?? 0), 0);
  const comisionTotal = lineas.reduce((acc, l) => acc + Number(l.comision ?? 0), 0);
  const ticketPromedio = servicios.length > 0 ? facturado / servicios.length : 0;
  const puedeValidarDepositos = empleado.rol === "recepcion" || empleado.rol === "caja" || empleado.rol === "admin";

  const days = Array.from({ length: diasEnMes }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  const nombreMes = hoy.toLocaleDateString("es-DO", { month: "long" });

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/personal" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center text-white text-lg font-bold shrink-0 overflow-hidden">
            {empleado.foto_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={empleado.foto_url} alt={empleado.nombre} className="w-full h-full object-cover" />
            ) : (
              empleado.nombre.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{empleado.nombre}</h1>
              <span className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg">
                {ROL_LABEL[empleado.rol]}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${empleado.activo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {empleado.activo ? "Activa" : "Inactiva"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {empleado.puesto ?? "Sin puesto"} · {empleado.telefono ?? "sin teléfono"} · {empleado.email ?? "sin correo"}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleActivo}
              className="text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
            >
              {empleado.activo ? "Desactivar" : "Activar"}
            </button>
            <Link
              href={`/admin/personal/${id}/editar`}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              Editar empleada
            </Link>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* ── Stats ── */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Servicios del mes</p>
          <p className="text-3xl font-bold text-zinc-900">{servicios.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Facturado</p>
          <p className="text-2xl font-bold text-zinc-900">{facturado > 0 ? formatoRD.format(facturado) : "—"}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">{ticketPromedio > 0 ? formatoRD.format(ticketPromedio) : "—"}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Comisión {empleado.porcentaje_comision ? `(${empleado.porcentaje_comision}%)` : ""}
          </p>
          <p className="text-2xl font-bold text-white">{comisionTotal > 0 ? formatoRD.format(comisionTotal) : "—"}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">

        {/* ══ Columna izquierda ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Servicios registrados este mes</h2>
            </div>

            {lineas.length > 0 ? (
              <>
                <div className="grid grid-cols-[80px_1fr_1fr_auto_auto] gap-x-4 px-5 py-2.5 border-b border-zinc-50">
                  {["Fecha", "Clienta", "Descripción", "Monto", "Comisión"].map((h) => (
                    <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                {lineas.map((l) => (
                  <div
                    key={l.id}
                    className="grid grid-cols-[80px_1fr_1fr_auto_auto] gap-x-4 items-center px-5 py-3.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors"
                  >
                    <span className="text-sm text-zinc-500">
                      {l.facturas?.cobrada_at ? formatearFechaDO(l.facturas.cobrada_at.slice(0, 10)) : "—"}
                    </span>
                    <span className="text-sm font-medium text-zinc-900 truncate">{l.facturas?.clientas?.nombre ?? "—"}</span>
                    <span className="text-sm text-zinc-600 truncate">{l.descripcion}</span>
                    <span className="text-sm font-semibold text-zinc-900">{l.subtotal ? formatoRD.format(l.subtotal) : "—"}</span>
                    <span className="text-sm text-zinc-500">{l.comision ? formatoRD.format(l.comision) : "—"}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin servicios registrados este mes.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Disponibilidad <span className="text-zinc-400 font-normal capitalize">· {nombreMes}</span>
              </h2>
              <p className="text-xs text-zinc-400">Click en un día para bloquearlo/desbloquearlo</p>
            </div>

            <div className="space-y-2">
              {rows.map((row, ri) => (
                <div key={ri} className="flex gap-2">
                  {row.map((day) => {
                    const fecha = `${anio}-${pad(mes + 1)}-${pad(day)}`;
                    const bloqueado = diasBloqueados.has(fecha);
                    const esHoy = day === hoy.getDate();
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDia(fecha)}
                        className={`flex-1 aspect-square max-w-[40px] rounded-lg text-sm font-semibold transition-all flex flex-col items-center justify-center leading-none gap-0.5 ${
                          bloqueado
                            ? "bg-red-100 text-red-500 border border-red-200"
                            : esHoy
                            ? "border-2 border-zinc-900 text-zinc-900"
                            : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{day}</span>
                        {bloqueado && <span className="text-[9px] font-bold text-red-400">✕</span>}
                      </button>
                    );
                  })}
                  {row.length < 7 &&
                    Array.from({ length: 7 - row.length }).map((_, i) => <div key={i} className="flex-1 max-w-[40px]" />)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Columna derecha ══ */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Foto</p>
            {empleado.foto_url ? (
              <div className="relative rounded-xl overflow-hidden group aspect-square w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={empleado.foto_url} alt={empleado.nombre} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={quitarFoto}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-700 flex items-center justify-center shadow transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) subirFoto(file);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={subiendoFoto}
                  className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <ImageIcon />
                  <span className="text-sm font-medium text-zinc-400 mt-1">
                    {subiendoFoto ? "Subiendo…" : "Foto de la empleada"}
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Servicios asignados</p>
            {serviciosAsignados.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {serviciosAsignados.map((s) => (
                  <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 text-white">
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                Sin asignación explícita — puede realizar cualquier servicio que no tenga estilistas específicas asignadas.
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Acceso y permisos</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Rol</span>
                <span className="text-sm font-semibold text-zinc-900">{ROL_LABEL[empleado.rol]}</span>
              </div>
              {empleado.porcentaje_comision !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Comisión</span>
                  <span className="text-sm font-semibold text-zinc-900">{empleado.porcentaje_comision}%</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Validar depósitos</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  puedeValidarDepositos ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {puedeValidarDepositos ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Ver reportes</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  puedeReportes ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {puedeReportes ? "Sí" : "No"}
                </span>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 mt-3">
              Según el rol — se cambia desde Configuración → Roles y permisos.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="12" height="6" rx="1.5" />
                  <path d="M6 11V7a4 4 0 0 1 6 0" strokeLinejoin="round" />
                  <circle cx="9" cy="14" r="1" fill="#9ca3af" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {empleado.user_id ? "Tiene cuenta de la app" : "Sin cuenta de la app"}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {empleado.user_id
                    ? "Puede iniciar sesión en la app con este correo."
                    : "Todavía no hay invitación automática — crear el usuario en Supabase Auth manualmente."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
