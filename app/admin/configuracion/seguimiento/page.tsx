"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import MensajeEditor from "@/components/configuracion/mensaje-editor";

type EstadoCheckin = Database["public"]["Enums"]["estado_checkin"];
type RespuestaCheckin = Database["public"]["Enums"]["respuesta_checkin"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

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

interface SeguimientoConfig {
  mensaje_plantilla: string;
  canal_email: boolean;
  canal_push: boolean;
  canal_whatsapp: boolean;
}

interface Seguimiento {
  id: string;
  fecha_programada: string;
  dia_programado: number;
  estado: EstadoCheckin;
  respuesta: RespuestaCheckin | null;
  clientas: { nombre: string } | null;
  servicios: { nombre: string } | null;
}

const VARIABLES_MENSAJE = ["nombre", "servicio"];
const EJEMPLO_VARIABLES = { nombre: "Ana Beltré", servicio: "Tape-in" };

// Formato dominicano: día/mes/año (la columna es date "YYYY-MM-DD"; se
// parte el string en vez de usar Date() para no arrastrar corrimientos de zona horaria).
function formatearFechaDO(fechaISO: string) {
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}

const ESTADO_LABEL: Record<EstadoCheckin, string> = {
  pendiente: "Pendiente",
  enviado: "Enviado",
  respondido: "Respondido",
};
const ESTADO_CLASE: Record<EstadoCheckin, string> = {
  pendiente: "bg-zinc-100 text-zinc-600",
  enviado: "bg-blue-50 text-blue-600",
  respondido: "bg-teal-50 text-teal-600",
};

export default function SeguimientoPage() {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<SeguimientoConfig | null>(null);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: cfg }, { data: lista }] = await Promise.all([
        supabase.from("seguimiento_config").select("*").eq("id", true).single(),
        supabase
          .from("check_ins")
          .select("id, fecha_programada, dia_programado, estado, respuesta, clientas(nombre), servicios(nombre)")
          .order("fecha_programada", { ascending: false })
          .limit(30),
      ]);
      if (cfg) setConfig(cfg);
      setSeguimientos(lista ?? []);
      setCargando(false);
    })();
  }, [supabase]);

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase.from("seguimiento_config").update(config).eq("id", true);
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
        <SectionLabel>Mensaje</SectionLabel>
        <p className="text-xs text-zinc-400 mb-3">
          Se envía a la clienta en los días de seguimiento configurados por servicio (Catálogo).
        </p>
        <MensajeEditor
          value={config.mensaje_plantilla}
          onChange={(v) => setConfig({ ...config, mensaje_plantilla: v })}
          variables={VARIABLES_MENSAJE}
          ejemplo={EJEMPLO_VARIABLES}
        />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Canales de envío</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Por dónde se envía el seguimiento.</p>

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

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>Seguimientos</SectionLabel>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Se generan solos al cobrar una factura, según los días configurados en cada servicio (Catálogo).
        </p>

        {seguimientos.length === 0 ? (
          <p className="text-sm text-zinc-400">Sin seguimientos programados todavía.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  <th className="pb-2 pr-3">Fecha</th>
                  <th className="pb-2 pr-3">Clienta</th>
                  <th className="pb-2 pr-3">Servicio</th>
                  <th className="pb-2 pr-3">Día</th>
                  <th className="pb-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {seguimientos.map((s) => (
                  <tr key={s.id} className="border-t border-zinc-100">
                    <td className="py-2.5 pr-3 text-zinc-700">{formatearFechaDO(s.fecha_programada)}</td>
                    <td className="py-2.5 pr-3 text-zinc-800 font-medium">{s.clientas?.nombre ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-zinc-600">{s.servicios?.nombre ?? "—"}</td>
                    <td className="py-2.5 pr-3 text-zinc-500">+{s.dia_programado}d</td>
                    <td className="py-2.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_CLASE[s.estado]}`}>
                        {ESTADO_LABEL[s.estado]}
                        {s.respuesta === "molestia" && " · molestia"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
