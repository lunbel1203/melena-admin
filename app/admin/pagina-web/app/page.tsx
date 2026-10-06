"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subirFotoWeb, useBloque } from "@/lib/pagina-web";
import { BarraGuardar, Etiqueta, Tarjeta } from "@/components/pagina-web/campos";
import { formatoPeso, optimizarImagen, type ImagenOptimizada } from "@/lib/imagen";

// Pantalla de bienvenida de la app: la foto ocupa todo el ancho y algo más de la mitad del alto
// (≈ 390 × 450 pt, vertical). En pantallas 3x equivale a 1170 × 1350 px.
const ANCHO = 1170;
const ALTO = 1350;
const MAX_KB = 350;
const MIN_ANCHO = 900;

interface BienvenidaApp {
  imagen: string;
}

export default function ImagenAppPage() {
  const b = useBloque<BienvenidaApp>("app_bienvenida", { imagen: "" });
  const ref = useRef<HTMLInputElement>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ImagenOptimizada | null>(null);

  async function elegir(file: File | undefined) {
    if (!file) return;
    setProcesando(true);
    setError(null);
    setResultado(null);
    try {
      const img = await optimizarImagen(file, { ancho: ANCHO, alto: ALTO, maxBytes: MAX_KB * 1024, minAncho: MIN_ANCHO });
      const url = await subirFotoWeb(new File([img.blob], "bienvenida.jpg", { type: "image/jpeg" }), "app");
      setResultado(img);
      b.setValor({ imagen: url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo preparar la imagen");
    }
    setProcesando(false);
    if (ref.current) ref.current.value = "";
  }

  async function guardar() {
    // la imagen que estaba publicada antes de este guardado
    const { data } = await createClient().from("web_contenido").select("valor").eq("clave", "app_bienvenida").maybeSingle();
    const previa = (data?.valor as { imagen?: string } | null)?.imagen || null;
    await b.guardar();
    // limpia del almacenamiento la imagen anterior cuando se reemplaza
    const marca = "/fotos-web/";
    if (previa && previa !== b.valor.imagen && previa.includes(marca)) {
      await createClient().storage.from("fotos-web").remove([previa.slice(previa.indexOf(marca) + marca.length)]);
    }
  }

  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <Tarjeta>
      <Etiqueta>Imagen de la pantalla principal de la app</Etiqueta>
      <div className="grid sm:grid-cols-[minmax(0,260px)_1fr] gap-6 mb-5">
        {/* Vista previa tal como la verá la clienta */}
        <div>
          <div className="relative w-full max-w-[260px] aspect-[390/450] rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
            {b.valor.imagen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.valor.imagen} alt="Imagen de la app" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 text-center px-4">
                Sin imagen: la app muestra un recuadro gris
              </div>
            )}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">Vista previa de la parte superior de la pantalla de bienvenida.</p>
        </div>

        <div className="space-y-4">
          <ul className="text-sm text-zinc-600 space-y-1.5">
            <li>
              <span className="font-semibold text-zinc-900">Tamaño recomendado:</span> {ANCHO} × {ALTO} px (vertical, proporción 13:15)
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Peso máximo:</span> {MAX_KB} KB · formato JPG, PNG o WebP
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Mínimo aceptado:</span> {MIN_ANCHO} px de ancho
            </li>
            <li className="text-zinc-400 text-xs pt-1">
              Sube la foto en la mejor calidad que tengas: el panel la recorta al formato, la ajusta y la comprime sola para que
              se vea brillante y la app abra rápido. Deja la cara y el cabello hacia el centro: los bordes pueden recortarse en
              teléfonos más altos o más bajos.
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={procesando}
              className="text-sm font-semibold border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-50 disabled:opacity-50"
            >
              {procesando ? "Preparando…" : b.valor.imagen ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {b.valor.imagen && !procesando && (
              <button
                type="button"
                onClick={() => {
                  b.setValor({ imagen: "" });
                  setResultado(null);
                }}
                className="text-xs font-semibold text-zinc-400 hover:text-red-500"
              >
                Quitar
              </button>
            )}
          </div>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegir(e.target.files?.[0])} />

          {error && <p className="text-xs text-red-500">{error}</p>}
          {resultado && (
            <div className="text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-0.5">
              <p className="text-zinc-500">
                Original: {resultado.original.ancho} × {resultado.original.alto} px · {formatoPeso(resultado.original.bytes)}
              </p>
              <p className="font-semibold text-teal-700">
                Optimizada: {resultado.ancho} × {resultado.alto} px · {formatoPeso(resultado.blob.size)}
              </p>
              <p className="text-zinc-400">Pulsa “Guardar cambios” para publicarla en la app.</p>
            </div>
          )}
        </div>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={guardar} />
    </Tarjeta>
  );
}
