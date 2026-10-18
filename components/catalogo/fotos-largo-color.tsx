"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subirFotoWeb } from "@/lib/pagina-web";
import { formatoPeso, reducirImagen } from "@/lib/imagen";

interface Producto {
  id: string;
  color: string | null;
  largo_pulgadas: number | null;
  foto_url: string | null;
}

/** Fotos de cada producto de una línea de cabello, ordenadas por color y largo (ej. 16" castaño). */
export default function FotosLargoColor({ categoriaNombre }: { categoriaNombre: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [subirA, setSubirA] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from("productos")
      .select("id, color, largo_pulgadas, foto_url")
      .eq("categoria", categoriaNombre)
      .eq("activo", true)
      .order("color", { nullsFirst: true })
      .order("largo_pulgadas", { nullsFirst: true });
    if (error) setError(error.message);
    setProductos(data ?? []);
    setCargando(false);
  }, [supabase, categoriaNombre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const porColor = useMemo(() => {
    const mapa = new Map<string, Producto[]>();
    for (const p of productos) {
      const clave = p.color ?? "Único";
      mapa.set(clave, [...(mapa.get(clave) ?? []), p]);
    }
    return [...mapa.entries()];
  }, [productos]);

  async function elegirFoto(file: File | undefined) {
    const id = subirA;
    if (!file || !id) return;
    setTrabajando(id);
    setError(null);
    setAviso(null);
    try {
      const blob = await reducirImagen(file, { maxLado: 1200, maxBytes: 300 * 1024 });
      const url = await subirFotoWeb(new File([blob], "producto.jpg", { type: "image/jpeg" }), "productos");
      const { error } = await supabase.from("productos").update({ foto_url: url }).eq("id", id);
      if (error) throw new Error(error.message);
      setAviso(`Foto guardada · ${formatoPeso(blob.size)}`);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto");
    }
    setTrabajando(null);
    setSubirA(null);
    if (archivo.current) archivo.current.value = "";
  }

  async function quitarFoto(id: string) {
    setTrabajando(id);
    setError(null);
    const { error } = await supabase.from("productos").update({ foto_url: null }).eq("id", id);
    setTrabajando(null);
    if (error) return setError(error.message);
    cargar();
  }

  if (cargando) return <p className="text-xs text-zinc-400">Cargando productos…</p>;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-zinc-500">Fotos por color y largo</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Una foto para cada largo de cada color (por ejemplo, el 16&quot; castaño). En la web y en la app, al elegir color y largo se ve esa foto; si no hay, se
          usa la del color y, si tampoco, la de la línea. La foto se ajusta sola a 1200 px y 300 KB.
        </p>
      </div>

      {porColor.length === 0 && <p className="text-xs text-zinc-400">Esta línea todavía no tiene productos. Créalos en Catálogo → Nuevo producto.</p>}

      {porColor.map(([color, items]) => (
        <div key={color} className="bg-white border border-zinc-200 rounded-xl p-3">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm font-semibold text-zinc-900">{color}</p>
            <p className="text-[11px] text-zinc-400">
              {items.filter((p) => p.foto_url).length} de {items.length} con foto
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {items.map((p) => (
              <div key={p.id} className="w-20">
                <button
                  type="button"
                  disabled={trabajando === p.id}
                  onClick={() => {
                    setSubirA(p.id);
                    archivo.current?.click();
                  }}
                  className="relative block w-20 h-20 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 hover:border-zinc-400 disabled:opacity-50"
                  aria-label={`${p.foto_url ? "Cambiar" : "Subir"} la foto de ${color} ${p.largo_pulgadas ?? ""}`}
                >
                  {p.foto_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.foto_url} alt={`${color} ${p.largo_pulgadas ?? ""}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-zinc-400">{trabajando === p.id ? "Subiendo…" : "+ Foto"}</span>
                  )}
                </button>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-semibold text-zinc-700">{p.largo_pulgadas != null ? `${p.largo_pulgadas}"` : "Único"}</span>
                  {p.foto_url && (
                    <button type="button" onClick={() => quitarFoto(p.id)} disabled={trabajando === p.id} className="text-[11px] text-zinc-400 hover:text-red-500">
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0])} />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {aviso && <p className="text-xs text-teal-600">{aviso}</p>}
    </div>
  );
}
