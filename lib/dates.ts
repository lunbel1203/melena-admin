const DIAS_ABBR = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(d: Date, n: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function addMonths(d: Date, n: number) {
  const copy = new Date(d);
  copy.setMonth(copy.getMonth() + n);
  return copy;
}

export function isSameDay(a: Date, b: Date) {
  return toISODate(a) === toISODate(b);
}

/** Lunes de la semana que contiene `d` */
export function startOfWeekMonday(d: Date) {
  const copy = new Date(d);
  const dow = copy.getDay(); // 0=dom..6=sáb
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(copy, diff);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function diaAbbr(d: Date) {
  return DIAS_ABBR[d.getDay()];
}

export function formatRangoSemana(inicio: Date, fin: Date) {
  const mismoMes = inicio.getMonth() === fin.getMonth();
  const diaInicio = inicio.getDate();
  const diaFin = fin.getDate();
  const mesFin = MESES[fin.getMonth()].slice(0, 3);
  const anio = fin.getFullYear();
  if (mismoMes) {
    return `${diaInicio} – ${diaFin} ${mesFin} ${anio}`;
  }
  const mesInicio = MESES[inicio.getMonth()].slice(0, 3);
  return `${diaInicio} ${mesInicio} – ${diaFin} ${mesFin} ${anio}`;
}

export function formatMesAnio(d: Date) {
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDiaLargo(d: Date) {
  const dow = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][d.getDay()];
  return `${dow} ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

/** Minutos desde medianoche a partir de "HH:MM" o "HH:MM:SS" */
export function horaAMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHora(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
