"use client";

import { useEffect, useMemo, useState } from "react";
import { enlaceWhatsApp } from "@/lib/alerts";
import { parseISODate } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

// Texto por defecto; el real se edita en Configuración → Mensajes (negocio_config.mensaje_cita_confirmada)
export const PLANTILLA_CITA_CONFIRMADA = `Hola {nombre}, tu cita en Melena está confirmada.

• Servicio: {servicio}
• Fecha: {fecha}
• Hora: {hora}
• Estilista: {estilista}

Te esperamos. Si necesitas reagendar o cancelar, avísanos por aquí.`;

export const VARIABLES_CITA = ["{nombre}", "{servicio}", "{fecha}", "{hora}", "{estilista}"];

function hora12(hhmm: string) {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const sufijo = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

export function fechaLarga(iso: string) {
  return parseISODate(iso).toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
}

export function armarMensajeCita(
  plantilla: string,
  c: { nombre: string; servicio: string; fecha: string; hora: string; estilista?: string | null },
) {
  const valores: Record<string, string> = {
    nombre: c.nombre.trim().split(" ")[0],
    servicio: c.servicio,
    fecha: fechaLarga(c.fecha),
    hora: hora12(c.hora),
    estilista: c.estilista ?? "",
  };
  return plantilla
    .split("\n")
    // si no hay estilista asignada, se quita el renglón que la menciona
    .filter((linea) => c.estilista || !linea.includes("{estilista}"))
    .join("\n")
    .replace(/\{(\w+)\}/g, (m, k) => (k in valores ? valores[k] : m));
}

// Plantilla guardada en el panel (con respaldo al texto por defecto)
export function useMensajeCitaConfirmada() {
  const supabase = useMemo(() => createClient(), []);
  const [plantilla, setPlantilla] = useState(PLANTILLA_CITA_CONFIRMADA);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("negocio_config").select("mensaje_cita_confirmada").eq("id", true).maybeSingle();
      if (data?.mensaje_cita_confirmada?.trim()) setPlantilla(data.mensaje_cita_confirmada);
    })();
  }, [supabase]);

  return plantilla;
}

// Enlace de WhatsApp a la clienta avisándole que su cita quedó confirmada
export function enlaceCitaConfirmada(
  plantilla: string,
  c: {
    telefono: string | null | undefined;
    nombre: string;
    servicio: string;
    fecha: string; // yyyy-mm-dd
    hora: string; // hh:mm[:ss]
    estilista?: string | null;
  },
) {
  return enlaceWhatsApp(c.telefono, armarMensajeCita(plantilla, c));
}

export const BOTON_WHATSAPP_CLASES =
  "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors";
