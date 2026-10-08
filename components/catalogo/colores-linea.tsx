"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";
import { subirFotoWeb } from "@/lib/pagina-web";
import { formatoPeso, reducirImagen } from "@/lib/imagen";

interface Color {
  id: string;
  nombre: string;
  foto_url: string | null;
  orden: number;
}

/** Colores de una línea de cabello, cada uno con su foto (la que se ve al elegirlo en el detalle del producto). */
export default function ColoresLinea({ categoriaId, categoriaNombre }: { categoriaId: string; categoriaNombre: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [colores, setColores] = useState<Color[]>([]);
  const [productosPorColor, setProductosPorColor] = useState<Record<string, number>>({});
  const [cargando, setCargando] = useState(true);
  const [nuevo, setNuevo] = useState("");
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [subirA, setSubirA] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    const [{ data: cols }, { data: prods }] = await Promise.all([
      supabase.from("categoria_colores").select("id, nombre, foto_url, orden").eq("categoria_id", categoriaId).order("orden").order("nombre"),
      supabase.from("productos").select("color").eq("categoria", categoriaNombre).eq("activo", true),
    ]);
    setColores(cols ?? []);
    const cuenta: Record<string, number> = {};
    (prods ?? []).forEach((p) => {
      if (p.color) cuenta[p.color.toLowerCase()] = (cuenta[p.color.toLowerCase()] ?? 0) + 1;
    });
    setProductosPorColor(cuenta);
    setCargando(false);
  }, [supabase, categoriaId, categoriaNombre]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function agregar() {
    const nombre = nuevo.trim();
    if (!nombre) return;
    setTrabajando("nuevo");
    setError(null);
    const orden = colores.reduce((m, c) => Math.max(m, c.orden), 0) + 1;
    const { error } = await supabase.from("categoria_colores").insert({ categoria_id: categoriaId, nombre, orden });
    setTrabajando(null);
    if (error) return setError(error.code === "23505" ? "Ese color ya existe en esta línea." : error.message);
    setNuevo("");
    cargar();
  }

  async function elegirFoto(file: File | undefined) {
    const id = subirA;
    if (!file || !id) return;
    setTrabajando(id);
    setError(null);
    setAviso(null);
    try {
      const blob = await reducirImagen(file, { maxLado: 1200, maxBytes: 300 * 1024 });
      const url = await subirFotoWeb(new File([blob], "color.jpg", { type: "image/jpeg" }), "colores");
      const { error } = await supabase.from("categoria_colores").update({ foto_url: url }).eq("id", id);
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

  async function quitarFoto(c: Color) {
    setTrabajando(c.id);
    const { error } = await supabase.from("categoria_colores").update({ foto_url: null }).eq("id", c.id);
    setTrabajando(null);
    if (error) return setError(error.message);
    cargar();
  }

  async function eliminar(c: Color) {
    const usados = productosPorColor[c.nombre.toLowerCase()] ?? 0;
    const ok = await confirmar({
      titulo: `¿Quitar el color "${c.nombre}"?`,
      texto: usados > 0 ? `Solo se quita su foto y su lugar en esta lista: los ${usados} producto(s) con ese color no se borran.` : "Se elimina de esta línea.",
      confirmarTexto: "Quitar",
      peligroso: true,
    });
    if (!ok) return;
    setTrabajando(c.id);
    const { error } = await supabase.from("categoria_colores").delete().eq("id", c.id);
    setTrabajando(null);
    if (error) return setError(error.message);
    cargar();
  }

  if (cargando) return <p className="text-xs text-zinc-400">Cargando colores…</p>;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-zinc-500">Colores y fotos</p>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          Al elegir un color en el detalle del producto, su foto reemplaza a la foto principal. Los precios y largos de cada color salen de los productos
          (créalos en Catálogo → Nuevo producto con ese mismo color). La foto se ajusta sola a 1200 px y 300 KB.
        </p>
      </div>

      {colores.length === 0 && <p className="text-xs text-zinc-400">Todavía no hay colores en esta línea.</p>}
      <div className="grid sm:grid-cols-2 gap-2">
        {colores.map((c) => (
          <div key={c.id} className="flex items-center gap-3 bg-white border border-zinc-200 rounded-xl p-2.5">
            <div className="w-14 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center text-[10px] text-zinc-400 text-center">
              {c.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.foto_url} alt={c.nombre} className="w-full h-full object-cover" />
              ) : (
                "Sin foto"
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900 truncate">{c.nombre}</p>
              <p className="text-[11px] text-zinc-400">{productosPorColor[c.nombre.toLowerCase()] ?? 0} productos</p>
              <div className="flex items-center gap-3 mt-1">
                <button
                  type="button"
                  disabled={trabajando === c.id}
                  onClick={() => {
                    setSubirA(c.id);
                    archivo.current?.click();
                  }}
                  className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 disabled:opacity-50"
                >
                  {trabajando === c.id ? "Subiendo…" : c.foto_url ? "Cambiar foto" : "Subir foto"}
                </button>
                {c.foto_url && (
                  <button type="button" onClick={() => quitarFoto(c)} className="text-xs text-zinc-400 hover:text-zinc-700">
                    Quitar foto
                  </button>
                )}
                <button type="button" onClick={() => eliminar(c)} className="text-xs text-zinc-400 hover:text-red-500 ml-auto">
                  Quitar color
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <input ref={archivo} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegirFoto(e.target.files?.[0])} />

      <div className="flex items-center gap-2">
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && agregar()}
          placeholder="Nuevo color (ej. Rubio ceniza)"
          className="flex-1 max-w-xs px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400 bg-white"
        />
        <button
          type="button"
          onClick={agregar}
          disabled={trabajando === "nuevo" || !nuevo.trim()}
          className="text-sm font-semibold text-white bg-zinc-900 px-3.5 py-2 rounded-lg hover:bg-zinc-700 disabled:opacity-40"
        >
          Agregar color
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {aviso && <p className="text-xs text-teal-600">{aviso}</p>}
    </div>
  );
}
