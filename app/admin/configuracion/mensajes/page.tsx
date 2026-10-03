"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  armarMensajeCita,
  PLANTILLA_CITA_CONFIRMADA,
  PLANTILLA_DEPOSITO_RECHAZADO,
  PLANTILLA_RECORDATORIO,
  VARIABLES_CITA,
  VARIABLES_DEPOSITO,
} from "@/lib/whatsapp-citas";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}

export default function MensajesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [plantilla, setPlantilla] = useState("");
  const [plantillaRechazo, setPlantillaRechazo] = useState("");
  const [plantillaRecordatorio, setPlantillaRecordatorio] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("negocio_config")
        .select("mensaje_cita_confirmada, mensaje_deposito_rechazado, mensaje_recordatorio_cita")
        .eq("id", true)
        .maybeSingle();
      setPlantilla(data?.mensaje_cita_confirmada ?? PLANTILLA_CITA_CONFIRMADA);
      setPlantillaRechazo(data?.mensaje_deposito_rechazado ?? PLANTILLA_DEPOSITO_RECHAZADO);
      setPlantillaRecordatorio(data?.mensaje_recordatorio_cita ?? PLANTILLA_RECORDATORIO);
      setCargando(false);
    })();
  }, [supabase]);

  async function guardar() {
    if (!plantilla.trim() || !plantillaRechazo.trim() || !plantillaRecordatorio.trim()) return setError("Los mensajes no pueden quedar vacíos.");
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase.from("negocio_config").update({ mensaje_cita_confirmada: plantilla, mensaje_deposito_rechazado: plantillaRechazo, mensaje_recordatorio_cita: plantillaRecordatorio }).eq("id", true);
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  const vistaPrevia = armarMensajeCita(plantilla, {
    nombre: "Valentina Rojas",
    servicio: "Nano ring",
    fecha: new Date().toISOString().slice(0, 10),
    hora: "16:00",
    estilista: "Angie",
  });

  const vistaRechazo = armarMensajeCita(plantillaRechazo, {
    nombre: "Valentina Rojas",
    servicio: "Nano ring",
    fecha: new Date().toISOString().slice(0, 10),
    hora: "16:00",
  });

  const vistaRecordatorio = armarMensajeCita(plantillaRecordatorio, {
    nombre: "Valentina Rojas",
    servicio: "Nano ring",
    fecha: new Date().toISOString().slice(0, 10),
    hora: "16:00",
    estilista: "Angie",
  });

  if (cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Mensajes a clientas</SectionLabel>
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Cita confirmada (botón &quot;Notificar por WhatsApp&quot;)</label>
      <textarea
        value={plantilla}
        onChange={(e) => setPlantilla(e.target.value)}
        rows={10}
        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors resize-y"
      />
      <p className="text-[11px] text-zinc-400 mt-1.5">
        Evita los emojis: WhatsApp de escritorio (Mac y Windows) no los muestra bien cuando el mensaje se abre desde un enlace y salen como &quot;�&quot;. Variables que se reemplazan solas: {VARIABLES_CITA.join(", ")}. Si la cita no tiene estilista, se quita el renglón que menciona {"{estilista}"}.
      </p>
      <button
        type="button"
        onClick={() => setPlantilla(PLANTILLA_CITA_CONFIRMADA)}
        className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 mt-2"
      >
        Restaurar el texto original
      </button>

      <p className="text-xs font-semibold text-zinc-500 mt-6 mb-1.5">Vista previa (con datos de ejemplo)</p>
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-zinc-800 whitespace-pre-wrap">{vistaPrevia}</div>

      <hr className="border-zinc-100 my-6" />

      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Comprobante rechazado (botón &quot;Notificar por WhatsApp&quot; en depósitos rechazados)</label>
      <textarea
        value={plantillaRechazo}
        onChange={(e) => setPlantillaRechazo(e.target.value)}
        rows={7}
        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors resize-y"
      />
      <p className="text-[11px] text-zinc-400 mt-1.5">Variables: {VARIABLES_DEPOSITO.join(", ")}.</p>
      <button
        type="button"
        onClick={() => setPlantillaRechazo(PLANTILLA_DEPOSITO_RECHAZADO)}
        className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 mt-2"
      >
        Restaurar el texto original
      </button>
      <p className="text-xs font-semibold text-zinc-500 mt-6 mb-1.5">Vista previa (con datos de ejemplo)</p>
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-zinc-800 whitespace-pre-wrap">{vistaRechazo}</div>

      <hr className="border-zinc-100 my-6" />

      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Recordatorio de cita (botón &quot;Recordar por WhatsApp&quot; en el detalle de la cita)</label>
      <textarea
        value={plantillaRecordatorio}
        onChange={(e) => setPlantillaRecordatorio(e.target.value)}
        rows={8}
        className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors resize-y"
      />
      <p className="text-[11px] text-zinc-400 mt-1.5">Variables: {VARIABLES_CITA.join(", ")}.</p>
      <button
        type="button"
        onClick={() => setPlantillaRecordatorio(PLANTILLA_RECORDATORIO)}
        className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 mt-2"
      >
        Restaurar el texto original
      </button>
      <p className="text-xs font-semibold text-zinc-500 mt-6 mb-1.5">Vista previa (con datos de ejemplo)</p>
      <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-zinc-800 whitespace-pre-wrap">{vistaRecordatorio}</div>
    </div>
  );
}
