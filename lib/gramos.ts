/** Servicios con extensiones por peso: la clienta indica los gramos (1 a 800) y cada paquete son 100 g. */
export const GRAMOS_MAX = 800;
export const GRAMOS_POR_PAQUETE = 100;

/** Convierte lo escrito en un entero válido (1 a 800) o null */
export function gramosValidos(texto: string | number | null | undefined): number | null {
  const n = typeof texto === "number" ? texto : /^\d+$/.test((texto ?? "").trim()) ? Number(texto) : NaN;
  return Number.isInteger(n) && n >= 1 && n <= GRAMOS_MAX ? n : null;
}

/** 100 → "1 paquete" · 150 → "1 paquete y medio" · 120 → "1 paquete y 20 g" · 30 → "30 g" */
export function textoPaquetes(gramos: number): string {
  const paquetes = Math.floor(gramos / GRAMOS_POR_PAQUETE);
  const resto = gramos % GRAMOS_POR_PAQUETE;
  const palabra = paquetes === 1 ? "paquete" : "paquetes";
  if (resto === 0) return `${paquetes} ${palabra}`;
  if (resto === 50) return paquetes === 0 ? "Medio paquete" : `${paquetes} ${palabra} y medio`;
  return paquetes === 0 ? `${resto} g` : `${paquetes} ${palabra} y ${resto} g`;
}

/** "150 g · 1 paquete y medio" */
export function resumenGramos(gramos: number): string {
  return `${gramos} g · ${textoPaquetes(gramos)}`;
}
