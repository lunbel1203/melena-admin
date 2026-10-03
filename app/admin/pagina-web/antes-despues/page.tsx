"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";
import { subirFotoWeb, urlFoto, useBloque, type TituloSeccion } from "@/lib/pagina-web";
import { BarraGuardar, Campo, Etiqueta, Tarjeta } from "@/components/pagina-web/campos";

interface Foto {
  id: string;
  foto_url: string;
  orden: number;
  activo: boolean;
}

function TituloCard() {
  const b = useBloque<TituloSeccion>("antes_despues", { titulo: "" });
  if (b.cargando) return null;
  return (
    <Tarjeta>
      <Etiqueta>Título de la sección</Etiqueta>
      <div className="mb-4">
        <Campo label="Título" value={b.valor.titulo} onChange={(v) => b.setValor({ titulo: v })} />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function AntesDespuesPage() {
  const supabase = useMemo(() => createClient(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => setRecarga((n) => n + 1), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("web_antes_despues").select("id, foto_url, orden, activo").order("orden").order("created_at");
      setFotos(data ?? []);
      setCargando(false);
    })();
  }, [supabase, recarga]);

  async function agregar(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSubiendo(true);
    setError(null);
    try {
      let orden = fotos.at(-1)?.orden ?? 0;
      for (const file of Array.from(files)) {
        const url = await subirFotoWeb(file, "antes-despues");
        const { error } = await supabase.from("web_antes_despues").insert({ foto_url: url, orden: ++orden });
        if (error) throw new Error(error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la foto");
    }
    setSubiendo(false);
    cargar();
  }

  async function alternar(f: Foto) {
    await supabase.from("web_antes_despues").update({ activo: !f.activo }).eq("id", f.id);
    cargar();
  }

  async function mover(i: number, dir: -1 | 1) {
    const otro = fotos[i + dir];
    if (!otro) return;
    const f = fotos[i];
    await Promise.all([
      supabase.from("web_antes_despues").update({ orden: otro.orden }).eq("id", f.id),
      supabase.from("web_antes_despues").update({ orden: f.orden }).eq("id", otro.id),
    ]);
    cargar();
  }

  async function eliminar(f: Foto) {
    const ok = await confirmar({ titulo: "¿Eliminar esta foto?", texto: "Deja de mostrarse en la web. No se puede deshacer.", confirmarTexto: "Eliminar" });
    if (!ok) return;
    const { error } = await supabase.from("web_antes_despues").delete().eq("id", f.id);
    if (error) return setError(error.message);
    // si la foto estaba en el bucket, también se borra el archivo
    const marca = "/fotos-web/";
    const i = f.foto_url.indexOf(marca);
    if (i >= 0) await supabase.storage.from("fotos-web").remove([f.foto_url.slice(i + marca.length)]);
    cargar();
  }

  return (
    <>
      <TituloCard />
      <Tarjeta>
        <div className="flex items-center justify-between mb-1">
          <Etiqueta>Fotos</Etiqueta>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
            className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {subiendo ? "Subiendo…" : "+ Subir fotos"}
          </button>
        </div>
        <p className="text-xs text-zinc-400 mb-4">Se muestran en este orden. Funcionan mejor las fotos verticales (3:4).</p>
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { agregar(e.target.files); e.target.value = ""; }} />
        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {cargando ? (
          <p className="text-sm text-zinc-400">Cargando…</p>
        ) : fotos.length === 0 ? (
          <p className="text-sm text-zinc-400">Todavía no hay fotos.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {fotos.map((f, i) => (
              <div key={f.id} className="flex flex-col gap-2">
                <div className={`relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 ${f.activo ? "" : "opacity-40"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={urlFoto(f.foto_url)} alt={`Foto ${i + 1}`} className="absolute inset-0 w-full h-full object-cover object-top" />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex gap-1">
                    <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-zinc-500 hover:text-zinc-800 disabled:opacity-25 px-1" aria-label="Mover antes">◀</button>
                    <button onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} className="text-zinc-500 hover:text-zinc-800 disabled:opacity-25 px-1" aria-label="Mover después">▶</button>
                  </span>
                  <span className="flex gap-3">
                    <button onClick={() => alternar(f)} className="text-zinc-500 hover:text-zinc-800">{f.activo ? "Ocultar" : "Mostrar"}</button>
                    <button onClick={() => eliminar(f)} className="text-red-500 hover:text-red-600">Eliminar</button>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Tarjeta>
    </>
  );
}
