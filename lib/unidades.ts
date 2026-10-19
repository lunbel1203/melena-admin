// Unidades en las que se cobra un servicio o un producto (gramo, unidad, paquete…).
// El precio del catálogo es "por cada N" de la unidad (p. ej. gramo, por cada 100); al facturar, la cantidad es de esa unidad.
// Las claves coinciden con las del check de la base (servicios, productos y lineas_factura).

export const UNIDADES = [
  { clave: "unidad", nombre: "Unidad", plural: "unidades", abrev: "u", baseSugerida: 1 },
  { clave: "gramo", nombre: "Gramo", plural: "gramos", abrev: "g", baseSugerida: 100 },
  { clave: "paquete", nombre: "Paquete", plural: "paquetes", abrev: "paq.", baseSugerida: 1 },
  { clave: "capa", nombre: "Capa", plural: "capas", abrev: "capa", baseSugerida: 1 },
  { clave: "linea", nombre: "Línea", plural: "líneas", abrev: "línea", baseSugerida: 1 },
  { clave: "pulgada", nombre: "Pulgada", plural: "pulgadas", abrev: "pulg.", baseSugerida: 1 },
  { clave: "libra", nombre: "Libra", plural: "libras", abrev: "lb", baseSugerida: 1 },
] as const;

export type UnidadClave = (typeof UNIDADES)[number]["clave"];

export const unidadDe = (clave: string | null | undefined) => UNIDADES.find((u) => u.clave === clave) ?? UNIDADES[0];

/** "x2" para unidades; "250 g" para el resto */
export function cantidadTexto(cantidad: number, clave: string | null | undefined) {
  const u = unidadDe(clave);
  return u.clave === "unidad" ? `x${cantidad}` : `${cantidad} ${u.abrev}`;
}

/** "por cada 100 gramos" · "por gramo" · "por unidad" */
export function precioPorTexto(clave: string | null | undefined, base: number | null | undefined) {
  const u = unidadDe(clave);
  const n = Math.max(1, base ?? 1);
  return n > 1 ? `por cada ${n} ${u.plural}` : `por ${u.nombre.toLowerCase()}`;
}

/** Lo que se cobra por `cantidad` de la unidad, con el precio del catálogo (por cada `base`) */
export const totalPorUnidad = (precio: number, base: number | null | undefined, cantidad: number) => (precio / Math.max(1, base ?? 1)) * cantidad;
