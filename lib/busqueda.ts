/** Minúsculas y sin tildes: "Ángela" → "angela". */
export const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const soloDigitos = (t: string) => t.replace(/\D/g, "");

/**
 * ¿El texto contiene todas las palabras de la búsqueda? Ignora tildes y mayúsculas, y un número
 * también coincide con un teléfono guardado con guiones o paréntesis ("8095551234" ≈ "809-555-1234").
 */
export function coincide(texto: string, q: string) {
  const palabras = sinTildes(q).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return true;
  const t = sinTildes(texto);
  const digitos = soloDigitos(texto);
  return palabras.every((w) => t.includes(w) || (/^[\d+\-().]+$/.test(w) && soloDigitos(w).length >= 3 && digitos.includes(soloDigitos(w))));
}
