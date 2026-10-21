"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GRAMOS_MAX, gramosValidos } from "@/lib/gramos";
import { horaAMinutos, minutosAHora } from "@/lib/dates";

type Servicio = { id: string; nombre: string; duracion_minutos: number; pide_gramos: boolean };
type Empleado = { id: string; nombre: string };

/**
 * Una cita reservada como "Sin servicio definido" no tiene servicio ni estilista.
 * Aquí se eligen: se actualiza la cita (y la hora de fin, que depende de la duración del servicio).
 */
export default function DefinirServicioCita({
  citaId,
  horaInicio,
  onGuardado,
}: {
  citaId: string;
  horaInicio: string;
  onGuardado: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [servicioId, setServicioId] = useState("");
  const [empleadoId, setEmpleadoId] = useState("");
  const [ofrecen, setOfrecen] = useState<Set<string> | null>(null);
  const [gramosTxt, setGramosTxt] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: srv }, { data: emp }] = await Promise.all([
        supabase.from("servicios").select("id, nombre, duracion_minutos, pide_gramos").eq("activo", true).eq("es_sin_definir", false).order("nombre"),
        supabase.from("empleados").select("id, nombre").eq("activo", true).order("nombre"),
      ]);
      setServicios(srv ?? []);
      setEmpleados(emp ?? []);
    })();
  }, [supabase]);

  // quién ofrece el servicio elegido (sin asignaciones en el catálogo = cualquiera)
  useEffect(() => {
    if (!servicioId) return;
    let cancelado = false;
    (async () => {
      const { data } = await supabase.from("servicios_empleados").select("empleado_id").eq("servicio_id", servicioId);
      if (cancelado) return;
      setOfrecen(data && data.length > 0 ? new Set(data.map((r) => r.empleado_id)) : null);
      setEmpleadoId("");
    })();
    return () => {
      cancelado = true;
    };
  }, [supabase, servicioId]);

  const servicio = servicios.find((s) => s.id === servicioId) ?? null;
  const opciones = ofrecen ? empleados.filter((e) => ofrecen.has(e.id)) : empleados;
  const gramos = gramosValidos(gramosTxt);
  const puedeGuardar = !!servicio && !!empleadoId && (!servicio.pide_gramos || gramos !== null) && !guardando;

  async function guardar() {
    if (!servicio || !empleadoId) return;
    setGuardando(true);
    setError(null);
    const horaFin = minutosAHora(horaAMinutos(horaInicio.slice(0, 5)) + servicio.duracion_minutos);
    const { error: err } = await supabase
      .from("citas")
      .update({
        servicio_id: servicio.id,
        empleado_id: empleadoId,
        hora_fin: horaFin,
        gramos: servicio.pide_gramos ? gramos : null,
      })
      .eq("id", citaId);
    setGuardando(false);
    if (err) {
      setError(err.code === "23P01" ? "Esa estilista ya tiene una cita a esa hora. Elige otra." : err.message);
      return;
    }
    onGuardado();
  }

  return (
    <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-1">Falta definir</p>
      <p className="text-sm font-semibold text-zinc-900">Servicio y estilista</p>
      <p className="text-xs text-zinc-500 mt-0.5 mb-4">
        La clienta reservó sin elegirlos. Defínelos para poder marcar su llegada; la hora de fin se ajusta a la duración del servicio.
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Servicio</label>
          <select
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 bg-white"
          >
            <option value="">Elige un servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Estilista</label>
          <select
            value={empleadoId}
            onChange={(e) => setEmpleadoId(e.target.value)}
            disabled={!servicio}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 bg-white disabled:opacity-50"
          >
            <option value="">{servicio ? "Elige quién la atiende" : "Elige primero el servicio"}</option>
            {opciones.map((e) => (
              <option key={e.id} value={e.id}>{e.nombre}</option>
            ))}
          </select>
        </div>

        {servicio?.pide_gramos && (
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Gramos (máx. {GRAMOS_MAX})</label>
            <input
              inputMode="numeric"
              value={gramosTxt}
              onChange={(e) => setGramosTxt(e.target.value.replace(/\D/g, "").slice(0, 3))}
              placeholder="Ej. 150"
              className="w-36 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 bg-white"
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}

      <button
        onClick={guardar}
        disabled={!puedeGuardar}
        className="mt-4 w-full py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
      >
        {guardando ? "Guardando…" : "Guardar servicio y estilista"}
      </button>
    </div>
  );
}
