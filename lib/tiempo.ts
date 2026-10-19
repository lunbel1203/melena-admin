/** 4320 → "1 h 12 min"; 2520 → "42 min"; 30 → "menos de 1 min" */
export function duracionTexto(segundos: number) {
  if (segundos < 60) return "menos de 1 min";
  const min = Math.round(segundos / 60);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Minutos (puede traer decimales) en el mismo formato */
export const minutosTexto = (min: number) => duracionTexto(Math.round(min * 60));
