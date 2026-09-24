"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MensajeEditor from "@/components/configuracion/mensaje-editor";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

interface RecordatoriosConfig {
  recordatorio_24h_activo: boolean;
  recordatorio_24h_horas: number;
  recordatorio_2h_activo: boolean;
  recordatorio_2h_horas: number;
  canal_email: boolean;
  canal_push: boolean;
  canal_whatsapp: boolean;
  mensaje_plantilla: string;
}

const VARIABLES_MENSAJE = ["nombre", "servicio", "fecha", "hora"];

const EJEMPLO_VARIABLES = {
  nombre: "Ana Beltré",
  servicio: "Tape-in",
  fecha: "2026-09-30",
  hora: "14:00",
};

function Toggle({ activo, onClick }: { activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${activo ? "bg-teal-500" : "bg-zinc-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${activo ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

export default function RecordatoriosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<RecordatoriosConfig | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("recordatorios_config").select("*").eq("id", true).single();
      if (data) setConfig(data);
      setCargando(false);
    })();
  }, [supabase]);

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase.from("recordatorios_config").update(config).eq("id", true);
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando || !config) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={guardar}
          disabled={guardando}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Recordatorios de cita</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Se envían automáticamente a la clienta antes de su cita (cada 15 min se revisa si hay que enviar alguno).
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-3 py-2 border-b border-zinc-100">
            <Toggle activo={config.recordatorio_24h_activo} onClick={() => setConfig({ ...config, recordatorio_24h_activo: !config.recordatorio_24h_activo })} />
            <span className="text-sm text-zinc-700 flex-1">Primer recordatorio</span>
            <input
              type="number"
              min={1}
              disabled={!config.recordatorio_24h_activo}
              value={config.recordatorio_24h_horas}
              onChange={(e) => setConfig({ ...config, recordatorio_24h_horas: Number(e.target.value) })}
              className="w-16 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm disabled:opacity-50"
            />
            <span className="text-sm text-zinc-400">horas antes</span>
          </div>

          <div className="flex items-center gap-3 py-2">
            <Toggle activo={config.recordatorio_2h_activo} onClick={() => setConfig({ ...config, recordatorio_2h_activo: !config.recordatorio_2h_activo })} />
            <span className="text-sm text-zinc-700 flex-1">Segundo recordatorio</span>
            <input
              type="number"
              min={1}
              disabled={!config.recordatorio_2h_activo}
              value={config.recordatorio_2h_horas}
              onChange={(e) => setConfig({ ...config, recordatorio_2h_horas: Number(e.target.value) })}
              className="w-16 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm disabled:opacity-50"
            />
            <span className="text-sm text-zinc-400">horas antes</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Mensaje</SectionLabel>
        <p className="text-xs text-zinc-400 mb-3">Texto que recibe la clienta.</p>
        <MensajeEditor
          value={config.mensaje_plantilla}
          onChange={(v) => setConfig({ ...config, mensaje_plantilla: v })}
          variables={VARIABLES_MENSAJE}
          ejemplo={EJEMPLO_VARIABLES}
        />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Canales de envío</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Por dónde se envían los recordatorios y avisos automáticos.</p>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle activo={config.canal_email} onClick={() => setConfig({ ...config, canal_email: !config.canal_email })} />
            <span className="text-sm text-zinc-700">Email</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle activo={config.canal_push} onClick={() => setConfig({ ...config, canal_push: !config.canal_push })} />
            <span className="text-sm text-zinc-700">Notificación push (app)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <Toggle activo={config.canal_whatsapp} onClick={() => setConfig({ ...config, canal_whatsapp: !config.canal_whatsapp })} />
            <span className="text-sm text-zinc-700">WhatsApp</span>
          </label>
          {config.canal_whatsapp && (
            <p className="text-xs text-orange-500 pl-[52px]">
              Falta conectar un proveedor de WhatsApp (Twilio o Meta Cloud API) para que este canal envíe mensajes de verdad.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
