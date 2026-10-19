"use client";

import { UNIDADES, unidadDe } from "@/lib/unidades";

/** Unidad en la que se cobra (unidad, gramo, paquete…) y de cuántas unidades es el precio (p. ej. gramo, por cada 100). */
export default function CampoUnidad({
  unidad,
  base,
  onChange,
}: {
  unidad: string;
  base: string;
  onChange: (unidad: string, base: string) => void;
}) {
  const u = unidadDe(unidad);
  const n = Math.max(1, Math.floor(Number(base) || 1));

  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Unidad de cobro</label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={u.clave}
          onChange={(e) => onChange(e.target.value, String(unidadDe(e.target.value).baseSugerida))}
          className="px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors bg-white"
        >
          {UNIDADES.map((x) => (
            <option key={x.clave} value={x.clave}>{x.nombre}</option>
          ))}
        </select>
        {u.clave !== "unidad" && (
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            El precio es por cada
            <input
              type="number"
              min={1}
              step={1}
              value={base}
              onChange={(e) => onChange(u.clave, e.target.value)}
              aria-label={`Cantidad de ${u.plural} a la que corresponde el precio`}
              className="w-20 px-3 py-2 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
            />
            {u.plural}
          </label>
        )}
      </div>
      <p className="text-[11px] text-zinc-400 mt-1">
        {u.clave === "unidad"
          ? "Se cobra por pieza o por servicio completo."
          : `Al facturar se escribe cuántos ${u.plural} son y se cobra proporcional: el precio de ${n} ${n === 1 ? u.nombre.toLowerCase() : u.plural} es el que escribes arriba.`}
      </p>
    </div>
  );
}
