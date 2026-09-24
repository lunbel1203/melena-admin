"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

const NOMBRES_DIA: Record<number, string> = {
  1: "Lunes", 2: "Martes", 3: "Miércoles", 4: "Jueves", 5: "Viernes", 6: "Sábado", 0: "Domingo",
};
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0];

interface DiaHorario {
  dia_semana: number;
  abierto: boolean;
  apertura: string | null;
  cierre: string | null;
  pausa_inicio: string | null;
  pausa_fin: string | null;
}
interface DiaEspecial {
  id: string;
  fecha: string;
  nombre: string;
  cerrado: boolean;
  hora_cierre_especial: string | null;
}
interface ReglasAgenda {
  bloque_minutos: number;
  tiempo_entre_citas_minutos: number;
  anticipacion_minima_horas: number;
  reservar_hasta_dias: number;
  cancelar_sin_penalidad_horas: number;
  zona_horaria: string;
  aceptar_clientas_sin_cita: boolean;
  sugerir_otra_estilista: boolean;
  permitir_cualquier_estilista: boolean;
}

function hhmm(v: string | null) {
  return v ? v.slice(0, 5) : "";
}

export default function HorarioAgendaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [dias, setDias] = useState<DiaHorario[]>([]);
  const [especiales, setEspeciales] = useState<DiaEspecial[]>([]);
  const [reglas, setReglas] = useState<ReglasAgenda | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [mostrarNuevoEspecial, setMostrarNuevoEspecial] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCerrado, setNuevoCerrado] = useState(true);
  const [nuevaHoraCierre, setNuevaHoraCierre] = useState("");

  async function cargar() {
    setCargando(true);
    const [{ data: hs }, { data: de }, { data: ra }] = await Promise.all([
      supabase.from("horario_semanal").select("*"),
      supabase.from("dias_especiales").select("*").order("fecha"),
      supabase.from("reglas_agenda").select("*").eq("id", true).single(),
    ]);
    setDias(hs ?? []);
    setEspeciales(de ?? []);
    if (ra) setReglas(ra);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizarDia(dia_semana: number, cambios: Partial<DiaHorario>) {
    setDias((prev) => prev.map((d) => (d.dia_semana === dia_semana ? { ...d, ...cambios } : d)));
  }

  async function guardarTodo() {
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const resultados = await Promise.all([
      ...dias.map((d) =>
        supabase
          .from("horario_semanal")
          .update({
            abierto: d.abierto,
            apertura: d.abierto ? d.apertura : null,
            cierre: d.abierto ? d.cierre : null,
            pausa_inicio: d.pausa_inicio || null,
            pausa_fin: d.pausa_fin || null,
          })
          .eq("dia_semana", d.dia_semana),
      ),
      reglas ? supabase.from("reglas_agenda").update(reglas).eq("id", true) : Promise.resolve({ error: null }),
    ]);

    setGuardando(false);
    const conError = resultados.find((r) => r.error);
    if (conError?.error) return setError(conError.error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  async function agregarDiaEspecial() {
    if (!nuevaFecha || !nuevoNombre.trim()) return;
    setError(null);
    const { error } = await supabase.from("dias_especiales").insert({
      fecha: nuevaFecha,
      nombre: nuevoNombre.trim(),
      cerrado: nuevoCerrado,
      hora_cierre_especial: nuevoCerrado ? null : nuevaHoraCierre || null,
    });
    if (error) return setError(error.message);
    setMostrarNuevoEspecial(false);
    setNuevaFecha("");
    setNuevoNombre("");
    setNuevoCerrado(true);
    setNuevaHoraCierre("");
    cargar();
  }

  async function eliminarDiaEspecial(id: string) {
    await supabase.from("dias_especiales").delete().eq("id", id);
    setEspeciales((prev) => prev.filter((d) => d.id !== id));
  }

  if (cargando || !reglas) return <p className="text-sm text-zinc-400">Cargando…</p>;

  const diasOrdenados = ORDEN_DIAS.map((n) => dias.find((d) => d.dia_semana === n)).filter(Boolean) as DiaHorario[];

  return (
    <div className="space-y-4">
      {/* Header con guardar */}
      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={guardarTodo}
          disabled={guardando}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {/* Horario del salón */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Horario del salón</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Horarios que se ofrecen para agendar en web y app.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                <th className="pb-2 pr-3">Día</th>
                <th className="pb-2 pr-3">Abierto</th>
                <th className="pb-2 pr-3">Apertura</th>
                <th className="pb-2 pr-3">Cierre</th>
                <th className="pb-2">Pausa</th>
              </tr>
            </thead>
            <tbody>
              {diasOrdenados.map((d) => (
                <tr key={d.dia_semana} className="border-t border-zinc-100">
                  <td className="py-2.5 pr-3 font-semibold text-zinc-800">{NOMBRES_DIA[d.dia_semana]}</td>
                  <td className="py-2.5 pr-3">
                    <button
                      onClick={() => actualizarDia(d.dia_semana, { abierto: !d.abierto })}
                      className={`w-10 h-6 rounded-full transition-colors relative ${d.abierto ? "bg-teal-500" : "bg-zinc-200"}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${d.abierto ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                  </td>
                  {d.abierto ? (
                    <>
                      <td className="py-2.5 pr-3">
                        <input type="time" value={hhmm(d.apertura)} onChange={(e) => actualizarDia(d.dia_semana, { apertura: e.target.value })}
                          className="px-2.5 py-1.5 border border-zinc-200 rounded-lg text-sm" />
                      </td>
                      <td className="py-2.5 pr-3">
                        <input type="time" value={hhmm(d.cierre)} onChange={(e) => actualizarDia(d.dia_semana, { cierre: e.target.value })}
                          className="px-2.5 py-1.5 border border-zinc-200 rounded-lg text-sm" />
                      </td>
                      <td className="py-2.5">
                        {d.pausa_inicio ? (
                          <div className="flex items-center gap-1.5">
                            <input type="time" value={hhmm(d.pausa_inicio)} onChange={(e) => actualizarDia(d.dia_semana, { pausa_inicio: e.target.value })}
                              className="px-2 py-1.5 border border-zinc-200 rounded-lg text-sm w-24" />
                            <span className="text-zinc-400">–</span>
                            <input type="time" value={hhmm(d.pausa_fin)} onChange={(e) => actualizarDia(d.dia_semana, { pausa_fin: e.target.value })}
                              className="px-2 py-1.5 border border-zinc-200 rounded-lg text-sm w-24" />
                            <button onClick={() => actualizarDia(d.dia_semana, { pausa_inicio: null, pausa_fin: null })}
                              className="text-xs text-zinc-400 hover:text-red-500 ml-1">Quitar</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => actualizarDia(d.dia_semana, { pausa_inicio: "13:00", pausa_fin: "14:00" })}
                            className="text-xs text-zinc-400 hover:text-zinc-700 underline"
                          >
                            Sin pausa · agregar
                          </button>
                        )}
                      </td>
                    </>
                  ) : (
                    <td colSpan={3} className="py-2.5 text-zinc-400 text-sm">Cerrado · no se ofrecen horarios para agendar</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Días especiales */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <SectionLabel>Días especiales y feriados</SectionLabel>
          <p className="text-xs text-zinc-400 mb-4">Cierres u horarios reducidos.</p>

          <div className="space-y-2 mb-3">
            {especiales.length === 0 && <p className="text-sm text-zinc-400">Sin días especiales configurados.</p>}
            {especiales.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-zinc-500 shrink-0 w-14">{d.fecha.slice(8, 10)} {["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][Number(d.fecha.slice(5,7))-1]}</span>
                  <span className="text-zinc-800 truncate">{d.nombre}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.cerrado ? "bg-orange-50 text-orange-600" : "bg-zinc-100 text-zinc-600"}`}>
                    {d.cerrado ? "Cerrado" : `Hasta ${hhmm(d.hora_cierre_especial)}`}
                  </span>
                  <button onClick={() => eliminarDiaEspecial(d.id)} className="text-zinc-300 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>

          {mostrarNuevoEspecial ? (
            <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
              <input type="date" value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
              <input value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} placeholder="Nombre del día"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400" />
              <label className="flex items-center gap-2 text-sm text-zinc-600">
                <input type="checkbox" checked={nuevoCerrado} onChange={(e) => setNuevoCerrado(e.target.checked)} className="accent-zinc-900" />
                Cerrado todo el día
              </label>
              {!nuevoCerrado && (
                <input type="time" value={nuevaHoraCierre} onChange={(e) => setNuevaHoraCierre(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
              )}
              <div className="flex gap-2">
                <button onClick={() => setMostrarNuevoEspecial(false)} className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600">Cancelar</button>
                <button onClick={agregarDiaEspecial} className="flex-1 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold">Agregar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setMostrarNuevoEspecial(true)} className="w-full py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
              + Agregar día especial
            </button>
          )}
        </div>

        {/* Reglas de agenda */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <SectionLabel>Reglas de agenda</SectionLabel>
          <p className="text-xs text-zinc-400 mb-4">Cómo se calculan los horarios disponibles.</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Bloques de agenda</label>
              <select value={reglas.bloque_minutos} onChange={(e) => setReglas({ ...reglas, bloque_minutos: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
                {[15, 30, 45, 60].map((m) => <option key={m} value={m}>Cada {m} min</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Tiempo entre citas</label>
              <input type="number" min={0} value={reglas.tiempo_entre_citas_minutos}
                onChange={(e) => setReglas({ ...reglas, tiempo_entre_citas_minutos: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Anticipación mínima (h)</label>
              <input type="number" min={0} value={reglas.anticipacion_minima_horas}
                onChange={(e) => setReglas({ ...reglas, anticipacion_minima_horas: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Reservar hasta (días)</label>
              <input type="number" min={1} value={reglas.reservar_hasta_dias}
                onChange={(e) => setReglas({ ...reglas, reservar_hasta_dias: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Cancelar sin penalidad (h antes)</label>
              <input type="number" min={0} value={reglas.cancelar_sin_penalidad_horas}
                onChange={(e) => setReglas({ ...reglas, cancelar_sin_penalidad_horas: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1 block">Zona horaria</label>
              <input value={reglas.zona_horaria} onChange={(e) => setReglas({ ...reglas, zona_horaria: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
            </div>
          </div>

          <div className="space-y-3">
            {([
              ["aceptar_clientas_sin_cita", "Aceptar clientas sin cita", "Recepción hace check-in con estilistas libres"],
              ["sugerir_otra_estilista", "Sugerir otra estilista si está ocupada", "Se muestra en web y app al elegir fecha y hora"],
              ["permitir_cualquier_estilista", "Permitir elegir “cualquier estilista”", "El sistema asigna la primera disponible"],
            ] as const).map(([key, titulo, detalle]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => setReglas({ ...reglas, [key]: !reglas[key] })}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 mt-0.5 ${reglas[key] ? "bg-teal-500" : "bg-zinc-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${reglas[key] ? "left-[18px]" : "left-0.5"}`} />
                </button>
                <span>
                  <span className="block text-sm text-zinc-800">{titulo}</span>
                  <span className="block text-xs text-zinc-400">{detalle}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-zinc-400">
          Cada empleada usa este horario por defecto. Sus turnos, días libres y bloqueos se ajustan desde su perfil en Personal.
        </p>
        <a href="/admin/personal" className="text-xs font-semibold text-zinc-700 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors whitespace-nowrap">
          Ir a disponibilidad del personal
        </a>
      </div>
    </div>
  );
}
