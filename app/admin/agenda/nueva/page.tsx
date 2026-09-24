"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addDays, diaAbbr, minutosAHora, horaAMinutos, toISODate } from "@/lib/dates";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10 10l4 4" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13V5M7 8l3-3 3 3" />
      <path d="M3 15h14" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L1.5 13.5h13L8 2z" />
      <path d="M8 6.5v3M8 11.5v.5" />
    </svg>
  );
}

/* ── Tipos ── */
interface Clienta {
  id: string;
  nombre: string;
  telefono: string;
}
interface Servicio {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
}
interface Estilista {
  id: string;
  nombre: string;
  puesto: string | null;
}

function formatDuracion(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${h} h` : `${h}.${Math.round((resto / 60) * 10)} h`;
}

function formatPrecio(precio: number) {
  return `RD$${precio.toLocaleString("es-DO")}`;
}

/* ── Avatar ── */
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const letter = name.charAt(0).toUpperCase();
  const dim = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return (
    <div className={`${dim} rounded-full bg-zinc-200 flex items-center justify-center font-semibold text-zinc-600 shrink-0`}>
      {letter}
    </div>
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
      {children}
    </p>
  );
}

const DIAS_A_MOSTRAR = 14;

/* ── Page ── */
export default function NuevaCitaPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  /* Paso 1: clienta */
  const [search, setSearch] = useState("");
  const [resultados, setResultados] = useState<Clienta[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [selectedClienta, setSelectedClienta] = useState<Clienta | null>(null);
  const [modoNueva, setModoNueva] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  useEffect(() => {
    if (search.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("clientas")
        .select("id, nombre, telefono")
        .or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%`)
        .limit(6);
      setResultados(data ?? []);
      setBuscando(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, supabase]);

  /* Paso 2: servicio */
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicioId, setSelectedServicioId] = useState<string | null>(null);
  const selectedServicio = servicios.find((s) => s.id === selectedServicioId) ?? null;

  /* Paso 3/4: personal, fecha y hora */
  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [selectedEstilistaId, setSelectedEstilistaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const hoy = new Date();
    return hoy.getDay() === 0 ? addDays(hoy, 1) : hoy;
  });
  const [horariosPorEstilista, setHorariosPorEstilista] = useState<Map<string, string[]>>(new Map());
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [selectedHora, setSelectedHora] = useState<string | null>(null);

  const dias = useMemo(() => {
    const lista: Date[] = [];
    let d = new Date();
    while (lista.length < DIAS_A_MOSTRAR) {
      if (d.getDay() !== 0) lista.push(new Date(d));
      d = addDays(d, 1);
    }
    return lista;
  }, []);

  /* Catálogo inicial */
  useEffect(() => {
    (async () => {
      const [{ data: srv }, { data: emp }] = await Promise.all([
        supabase.from("servicios").select("id, nombre, duracion_minutos, precio").eq("activo", true).order("nombre"),
        supabase.from("empleados").select("id, nombre, puesto").eq("rol", "estilista").eq("activo", true).order("nombre"),
      ]);
      setServicios(srv ?? []);
      setEstilistas(emp ?? []);
    })();
  }, [supabase]);

  /* Qué estilistas ofrecen el servicio elegido (según el catálogo). Sin filas = cualquiera. */
  const [estilistaIdsServicio, setEstilistaIdsServicio] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!selectedServicioId) {
      setEstilistaIdsServicio(null);
      return;
    }
    let cancelado = false;
    (async () => {
      const { data } = await supabase
        .from("servicios_empleados")
        .select("empleado_id")
        .eq("servicio_id", selectedServicioId);
      if (cancelado) return;
      setEstilistaIdsServicio(data && data.length > 0 ? new Set(data.map((r) => r.empleado_id)) : null);
      setSelectedEstilistaId(null);
      setSelectedHora(null);
    })();
    return () => {
      cancelado = true;
    };
  }, [supabase, selectedServicioId]);

  const estilistasDelServicio = useMemo(
    () => (estilistaIdsServicio === null ? estilistas : estilistas.filter((e) => estilistaIdsServicio.has(e.id))),
    [estilistas, estilistaIdsServicio],
  );

  /* Disponibilidad de las estilistas del servicio para el día elegido */
  useEffect(() => {
    if (!selectedServicio || estilistasDelServicio.length === 0) {
      setHorariosPorEstilista(new Map());
      return;
    }
    let cancelado = false;
    (async () => {
      setCargandoHorarios(true);
      setSelectedHora(null);
      const fechaISO = toISODate(selectedDate);
      const resultados = await Promise.all(
        estilistasDelServicio.map((e) =>
          supabase.rpc("horarios_disponibles_estilista", {
            p_empleado_id: e.id,
            p_fecha: fechaISO,
            p_duracion_minutos: selectedServicio.duracion_minutos,
          }),
        ),
      );
      if (cancelado) return;

      const ahora = new Date();
      const esHoy = isSameISODate(selectedDate, ahora);
      const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

      const mapa = new Map<string, string[]>();
      estilistasDelServicio.forEach((e, i) => {
        let slots = (resultados[i].data ?? []).map((s: { hora_inicio: string }) => s.hora_inicio.slice(0, 5));
        if (esHoy) slots = slots.filter((hora) => horaAMinutos(hora) > minutosAhora);
        mapa.set(e.id, slots);
      });
      setHorariosPorEstilista(mapa);
      setCargandoHorarios(false);
    })();
    return () => {
      cancelado = true;
    };
  }, [supabase, selectedServicio, selectedDate, estilistasDelServicio]);

  const horasEstilistaSeleccionada = selectedEstilistaId ? horariosPorEstilista.get(selectedEstilistaId) ?? [] : [];
  const otrasConEspacio = estilistasDelServicio.filter(
    (e) => e.id !== selectedEstilistaId && (horariosPorEstilista.get(e.id)?.length ?? 0) > 0,
  );

  /* Paso 5: depósito */
  const [payInSalon, setPayInSalon] = useState(false);
  const [comprobante, setComprobante] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const clientaLista = selectedClienta || (modoNueva && nuevoNombre.trim() && nuevoTelefono.trim());
  const puedeEnviar =
    clientaLista &&
    selectedServicio &&
    selectedEstilistaId &&
    selectedHora &&
    (payInSalon || comprobante) &&
    !enviando;

  async function crearCita() {
    if (!selectedServicio || !selectedEstilistaId || !selectedHora) return;
    setEnviando(true);
    setErrorEnvio(null);

    try {
      let clientaId = selectedClienta?.id ?? null;

      if (!clientaId && modoNueva) {
        const { data: nueva, error } = await supabase
          .from("clientas")
          .insert({ nombre: nuevoNombre.trim(), telefono: nuevoTelefono.trim() })
          .select("id")
          .single();
        if (error) throw new Error(error.code === "23505" ? "Ya existe una clienta con ese teléfono." : error.message);
        clientaId = nueva.id;
      }

      if (!clientaId) throw new Error("Selecciona o crea una clienta.");

      const horaInicio = selectedHora;
      const horaFin = minutosAHora(horaAMinutos(selectedHora) + selectedServicio.duracion_minutos);
      const fechaISO = toISODate(selectedDate);

      const { data: cita, error: citaError } = await supabase
        .from("citas")
        .insert({
          clienta_id: clientaId,
          servicio_id: selectedServicio.id,
          empleado_id: selectedEstilistaId,
          fecha: fechaISO,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          estado: payInSalon ? "confirmada" : "pendiente_confirmacion",
          notas: note.trim() || null,
        })
        .select("id")
        .single();

      if (citaError) {
        if (citaError.code === "23P01") throw new Error("Ese horario ya no está disponible. Elige otro.");
        throw new Error(citaError.message);
      }

      if (!payInSalon && comprobante) {
        const ext = comprobante.name.split(".").pop();
        const path = `${cita.id}/comprobante-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("comprobantes-deposito").upload(path, comprobante);
        if (!uploadError) {
          const { data: signed } = await supabase.storage
            .from("comprobantes-deposito")
            .createSignedUrl(path, 60 * 60 * 24 * 365);
          if (signed?.signedUrl) {
            await supabase.from("depositos").insert({ cita_id: cita.id, comprobante_url: signed.signedUrl });
          }
        }
      }

      router.push("/admin/agenda");
      router.refresh();
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : "No se pudo crear la cita.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/agenda" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nueva cita</h1>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">
        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 1 · Clienta */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Clienta</SectionLabel>

            {!modoNueva ? (
              <>
                <div className="relative mb-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedClienta(null);
                    }}
                    placeholder="Buscar por nombre o teléfono..."
                    className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  {buscando && <p className="text-xs text-zinc-400">Buscando…</p>}
                  {!buscando && search.trim().length >= 2 && resultados.length === 0 && (
                    <p className="text-xs text-zinc-400">No se encontró ninguna clienta con ese dato.</p>
                  )}
                  {resultados.map((c) => {
                    const isSelected = selectedClienta?.id === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => setSelectedClienta(c)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                          isSelected ? "border-zinc-300 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"
                        }`}
                      >
                        <Avatar name={c.nombre} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-zinc-900">{c.nombre}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">{c.telefono}</div>
                        </div>
                        {isSelected && (
                          <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0">
                            Seleccionada
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setModoNueva(true)}
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors mt-3"
                >
                  + Clienta nueva
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
                <input
                  type="tel"
                  value={nuevoTelefono}
                  onChange={(e) => setNuevoTelefono(e.target.value)}
                  placeholder="Teléfono"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
                <button
                  onClick={() => {
                    setModoNueva(false);
                    setNuevoNombre("");
                    setNuevoTelefono("");
                  }}
                  className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  ← Buscar clienta existente
                </button>
              </div>
            )}
          </div>

          {/* 2 · Servicio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Servicio</SectionLabel>
            {servicios.length === 0 ? (
              <p className="text-sm text-zinc-400">No hay servicios activos configurados.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {servicios.map((s) => {
                  const isSelected = selectedServicioId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedServicioId(s.id)}
                      className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                        isSelected ? "border-zinc-900 bg-white" : "border-zinc-100 bg-white hover:border-zinc-200"
                      }`}
                    >
                      <div className="text-sm font-semibold text-zinc-900">{s.nombre}</div>
                      <div className="text-xs text-zinc-400 mt-1">
                        {formatDuracion(s.duracion_minutos)} · {formatPrecio(s.precio)}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3 · Personal disponible */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Personal disponible</SectionLabel>
            {!selectedServicio ? (
              <p className="text-sm text-zinc-400">Elige un servicio primero.</p>
            ) : estilistasDelServicio.length === 0 ? (
              <p className="text-sm text-zinc-400">No hay estilistas asignadas a este servicio en el catálogo.</p>
            ) : (
              <div className="space-y-2">
                {estilistasDelServicio.map((p) => {
                  const slots = horariosPorEstilista.get(p.id) ?? [];
                  const disponible = cargandoHorarios || slots.length > 0;
                  const isSelected = selectedEstilistaId === p.id;
                  return (
                    <button
                      key={p.id}
                      disabled={!cargandoHorarios && slots.length === 0}
                      onClick={() => {
                        setSelectedEstilistaId(p.id);
                        setSelectedHora(null);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                        !disponible
                          ? "border-zinc-100 cursor-default"
                          : isSelected
                          ? "border-zinc-300 bg-zinc-50"
                          : "border-zinc-100 hover:border-zinc-200"
                      }`}
                    >
                      <Avatar name={p.nombre} size="sm" />
                      <div className="flex-1 min-w-0 text-left">
                        <div className={`text-sm font-semibold ${disponible ? "text-zinc-900" : "text-zinc-400"}`}>
                          {p.nombre}
                        </div>
                        {p.puesto && <div className="text-xs text-zinc-400 mt-0.5">{p.puesto}</div>}
                      </div>
                      {cargandoHorarios ? (
                        <span className="text-xs font-medium text-zinc-300 shrink-0">…</span>
                      ) : slots.length > 0 ? (
                        <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0">
                          {slots.length} horarios libres
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-zinc-400 shrink-0">Sin espacio</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[380px] shrink-0 space-y-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            {/* 4 · Fecha y hora */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>
                4 · Fecha y hora{selectedEstilistaId && ` con ${estilistas.find((e) => e.id === selectedEstilistaId)?.nombre.split(" ")[0]}`}
              </SectionLabel>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {dias.map((d) => {
                  const isSelected = isSameISODate(d, selectedDate);
                  return (
                    <button
                      key={toISODate(d)}
                      onClick={() => setSelectedDate(d)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                        isSelected ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-[11px] font-medium leading-none">{diaAbbr(d)}</span>
                      <span className="text-base font-bold mt-0.5 leading-none">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>

              {!selectedEstilistaId ? (
                <p className="text-sm text-zinc-400">Elige una estilista para ver sus horarios.</p>
              ) : (
                <div className="mb-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                    Horarios del {diaAbbr(selectedDate).toLowerCase()} {selectedDate.getDate()}
                  </p>
                  {cargandoHorarios ? (
                    <p className="text-sm text-zinc-400">Cargando horarios…</p>
                  ) : horasEstilistaSeleccionada.length === 0 ? (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                      <span className="shrink-0 mt-0.5"><WarnIcon /></span>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        No tiene espacio libre este día.
                        {otrasConEspacio.length > 0 && (
                          <>
                            {" "}Sí están libres:{" "}
                            {otrasConEspacio.map((e, i) => (
                              <span key={e.id}>
                                <button
                                  onClick={() => { setSelectedEstilistaId(e.id); setSelectedHora(null); }}
                                  className="font-semibold underline hover:no-underline"
                                >
                                  {e.nombre}
                                </button>
                                {i < otrasConEspacio.length - 1 ? ", " : "."}
                              </span>
                            ))}
                          </>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                      {horasEstilistaSeleccionada.map((t) => {
                        const isSelected = selectedHora === t;
                        return (
                          <button
                            key={t}
                            onClick={() => setSelectedHora(t)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                              isSelected ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5 · Depósito de reserva */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>5 · Depósito de reserva</SectionLabel>

              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-600">Monto requerido</span>
                <span className="text-base font-bold text-zinc-900">RD$1,000</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={payInSalon}
                className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-4 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all mb-3 disabled:opacity-40 disabled:hover:bg-white"
              >
                <span className="text-zinc-400"><UploadIcon /></span>
                <span className="text-sm text-zinc-500 font-medium">
                  {comprobante ? comprobante.name : "Adjuntar comprobante"}
                </span>
              </button>

              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={payInSalon}
                  onChange={(e) => {
                    setPayInSalon(e.target.checked);
                    if (e.target.checked) setComprobante(null);
                  }}
                  className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors">
                  Cobrar en el salón (sin depósito previo)
                </span>
              </label>
            </div>

            {/* Nota para la estilista */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Nota para la estilista</SectionLabel>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cuero sensible, usar cinta hipoalergénica..."
                rows={4}
                className="w-full px-3.5 py-3 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 resize-none focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors leading-relaxed"
              />
            </div>

            {errorEnvio && (
              <div className="px-5 pt-4">
                <p className="text-xs text-red-500">{errorEnvio}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-5 flex gap-3">
              <Link
                href="/admin/agenda"
                className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                onClick={crearCita}
                disabled={!puedeEnviar}
                className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {enviando ? "Creando…" : "Crear cita"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function isSameISODate(a: Date, b: Date) {
  return toISODate(a) === toISODate(b);
}
