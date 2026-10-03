import { enlaceWhatsApp } from "@/lib/alerts";
import { parseISODate } from "@/lib/dates";

function hora12(hhmm: string) {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  const sufijo = h >= 12 ? "pm" : "am";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${sufijo}`;
}

// Enlace de WhatsApp a la clienta avisándole que su cita quedó confirmada
export function enlaceCitaConfirmada(c: {
  telefono: string | null | undefined;
  nombre: string;
  servicio: string;
  fecha: string; // yyyy-mm-dd
  hora: string; // hh:mm[:ss]
  estilista?: string | null;
}) {
  const fecha = parseISODate(c.fecha).toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long" });
  const mensaje = [
    `Hola ${c.nombre.trim().split(" ")[0]}, tu cita en Melena está confirmada ✅`,
    "",
    `• Servicio: ${c.servicio}`,
    `• Fecha: ${fecha}`,
    `• Hora: ${hora12(c.hora)}`,
    c.estilista ? `• Estilista: ${c.estilista}` : null,
    "",
    "Te esperamos. Si necesitas reagendar o cancelar, avísanos por aquí.",
  ]
    .filter((l) => l !== null)
    .join("\n");
  return enlaceWhatsApp(c.telefono, mensaje);
}

export const BOTON_WHATSAPP_CLASES =
  "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-600 text-sm font-semibold text-white hover:bg-green-700 transition-colors";
