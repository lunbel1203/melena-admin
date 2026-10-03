"use client";

import { useRef, useState } from "react";
import { subirFotoWeb, urlFoto } from "@/lib/pagina-web";

export function Tarjeta({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-zinc-200 p-5">{children}</div>;
}

export function Etiqueta({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}

const inputClase =
  "w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors";

export function Campo({
  label,
  value,
  onChange,
  placeholder,
  ayuda,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ayuda?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClase} />
      {ayuda && <p className="text-[11px] text-zinc-400 mt-1">{ayuda}</p>}
    </div>
  );
}

export function Area({
  label,
  value,
  onChange,
  filas = 3,
  ayuda,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  filas?: number;
  ayuda?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={filas} className={`${inputClase} resize-y`} />
      {ayuda && <p className="text-[11px] text-zinc-400 mt-1">{ayuda}</p>}
    </div>
  );
}

// Un renglón de texto por línea (dirección, horario…)
export function Lineas({
  label,
  value,
  onChange,
  ayuda,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  ayuda?: string;
}) {
  return (
    <Area
      label={label}
      value={value.join("\n")}
      onChange={(t) => onChange(t.split("\n"))}
      filas={Math.max(3, value.length + 1)}
      ayuda={ayuda ?? "Una línea por renglón."}
    />
  );
}

export function BarraGuardar({
  guardando,
  guardado,
  error,
  onGuardar,
}: {
  guardando: boolean;
  guardado: boolean;
  error: string | null;
  onGuardar: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      {error && <span className="text-xs text-red-500">{error}</span>}
      {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
      <button
        onClick={onGuardar}
        disabled={guardando}
        className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
      >
        {guardando ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

export function SubirFoto({
  label,
  value,
  onChange,
  carpeta,
  proporcion = "aspect-[4/3]",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  carpeta: string;
  proporcion?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function elegir(file: File | undefined) {
    if (!file) return;
    setSubiendo(true);
    setError(null);
    try {
      onChange(await subirFotoWeb(file, carpeta));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto");
    }
    setSubiendo(false);
  }

  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      <div className={`relative w-full max-w-xs ${proporcion} rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200`}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={urlFoto(value)} alt={label} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400">Sin foto</div>
        )}
      </div>
      <div className="flex items-center gap-3 mt-2">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={subiendo}
          className="text-xs font-semibold border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50 disabled:opacity-50"
        >
          {subiendo ? "Subiendo…" : value ? "Cambiar foto" : "Subir foto"}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => elegir(e.target.files?.[0])} />
    </div>
  );
}
