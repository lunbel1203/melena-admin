"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subirFotoWeb, useBloque } from "@/lib/pagina-web";
import { Etiqueta, Tarjeta } from "@/components/pagina-web/campos";
import { formatoPeso, recortarImagen } from "@/lib/imagen";

// Pantalla de bienvenida de la app: la foto ocupa todo el ancho y algo más de la mitad del alto
// (vertical, proporción 13:15; en pantallas 3x son 1170 × 1350 px).
const ANCHO = 1170;
const ALTO = 1350;
const MAX_KB = 350;
const AVISO_ANCHO = 900;

// Visor: marco de 260 × 300 px con la misma proporción que la app
const FW = 260;
const FH = 300;

interface Pendiente {
  bmp: ImageBitmap;
  url: string;
  bytes: number;
}

export default function ImagenAppPage() {
  const b = useBloque<{ imagen: string }>("app_bienvenida", { imagen: "" });
  const ref = useRef<HTMLInputElement>(null);
  const arrastre = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [pendiente, setPendiente] = useState<Pendiente | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [quitar, setQuitar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // libera la vista previa al cambiar o salir
  useEffect(() => () => { if (pendiente) URL.revokeObjectURL(pendiente.url); }, [pendiente]);

  const base = pendiente ? Math.max(FW / pendiente.bmp.width, FH / pendiente.bmp.height) : 1;
  const escala = base * zoom;

  // mantiene la imagen cubriendo todo el marco
  function ajustar(x: number, y: number, sc: number) {
    if (!pendiente) return { x, y };
    return {
      x: Math.min(0, Math.max(FW - pendiente.bmp.width * sc, x)),
      y: Math.min(0, Math.max(FH - pendiente.bmp.height * sc, y)),
    };
  }

  async function elegir(file: File | undefined) {
    if (!file) return;
    setError(null);
    setGuardado(null);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Usa una imagen JPG, PNG o WebP.");
    if (file.size > 25 * 1024 * 1024) return setError("La imagen pesa más de 25 MB. Usa una más liviana.");
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      const sc = Math.max(FW / bmp.width, FH / bmp.height);
      setPendiente({ bmp, url: URL.createObjectURL(file), bytes: file.size });
      setZoom(1);
      setPos({ x: (FW - bmp.width * sc) / 2, y: (FH - bmp.height * sc) / 2 });
      setQuitar(false);
    } catch {
      setError("No se pudo abrir la imagen.");
    }
    if (ref.current) ref.current.value = "";
  }

  function cambiarZoom(z: number) {
    if (!pendiente) return;
    // acerca o aleja desde el centro del marco
    const cx = (FW / 2 - pos.x) / escala;
    const cy = (FH / 2 - pos.y) / escala;
    const sc = base * z;
    setZoom(z);
    setPos(ajustar(FW / 2 - cx * sc, FH / 2 - cy * sc, sc));
  }

  function mover(e: React.PointerEvent) {
    const a = arrastre.current;
    if (!a) return;
    setPos(ajustar(a.px + (e.clientX - a.x), a.py + (e.clientY - a.y), escala));
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(null);
    try {
      const supabase = createClient();
      let nueva = b.valor.imagen;
      let resumen = "";
      if (pendiente) {
        // recorte según lo que se ve en el visor
        const rect = { sx: -pos.x / escala, sy: -pos.y / escala, sw: FW / escala, sh: FH / escala };
        const out = await recortarImagen(pendiente.bmp, rect, { ancho: ANCHO, alto: ALTO, maxBytes: MAX_KB * 1024 });
        nueva = await subirFotoWeb(new File([out.blob], "bienvenida.jpg", { type: "image/jpeg" }), "app");
        resumen = `Guardada: ${out.ancho} × ${out.alto} px · ${formatoPeso(out.blob.size)}`;
      } else if (quitar) {
        nueva = "";
        resumen = "Imagen quitada";
      } else return setGuardando(false);

      const { data } = await supabase.from("web_contenido").select("valor").eq("clave", "app_bienvenida").maybeSingle();
      const previa = (data?.valor as { imagen?: string } | null)?.imagen || null;
      const { error: err } = await supabase.from("web_contenido").upsert({ clave: "app_bienvenida", valor: { imagen: nueva } });
      if (err) throw new Error(err.message);

      // limpia del almacenamiento la imagen anterior
      const marca = "/fotos-web/";
      if (previa && previa !== nueva && previa.includes(marca)) {
        await supabase.storage.from("fotos-web").remove([previa.slice(previa.indexOf(marca) + marca.length)]);
      }
      b.setValor({ imagen: nueva });
      setPendiente(null);
      setQuitar(false);
      setGuardado(resumen);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la imagen");
    }
    setGuardando(false);
  }

  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  const actual = quitar ? "" : b.valor.imagen;
  const cambios = !!pendiente || quitar;
  const pocaResolucion = pendiente ? Math.round(FW / escala) < AVISO_ANCHO : false;

  return (
    <Tarjeta>
      <Etiqueta>Imagen de la pantalla principal de la app</Etiqueta>
      <div className="grid sm:grid-cols-[minmax(0,260px)_1fr] gap-6 mb-5">
        <div>
          {/* Visor: así se verá recortada en la app */}
          <div
            className="relative overflow-hidden rounded-2xl bg-zinc-100 border border-zinc-200 touch-none select-none"
            style={{ width: FW, height: FH, cursor: pendiente ? "grab" : "default" }}
            onPointerDown={(e) => {
              if (!pendiente) return;
              e.currentTarget.setPointerCapture(e.pointerId);
              arrastre.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
            }}
            onPointerMove={mover}
            onPointerUp={() => (arrastre.current = null)}
            onPointerCancel={() => (arrastre.current = null)}
            onWheel={(e) => pendiente && cambiarZoom(Math.min(4, Math.max(1, zoom - e.deltaY * 0.002)))}
          >
            {pendiente ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={pendiente.url}
                alt="Vista previa"
                draggable={false}
                className="absolute max-w-none pointer-events-none"
                style={{ left: pos.x, top: pos.y, width: pendiente.bmp.width * escala, height: pendiente.bmp.height * escala }}
              />
            ) : actual ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={actual} alt="Imagen de la app" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-400 text-center px-4">
                Sin imagen: la app muestra un recuadro gris
              </div>
            )}
          </div>

          {pendiente && (
            <div className="mt-3 max-w-[260px]">
              <label className="text-[11px] font-semibold text-zinc-500 flex justify-between">
                <span>Acercar</span>
                <span>{Math.round(zoom * 100)}%</span>
              </label>
              <input
                type="range"
                min={1}
                max={4}
                step={0.01}
                value={zoom}
                onChange={(e) => cambiarZoom(Number(e.target.value))}
                className="w-full accent-zinc-900"
              />
              <p className="text-[11px] text-zinc-400 mt-1">Arrastra la foto para encuadrarla. Se recorta al guardar.</p>
              {pocaResolucion && (
                <p className="text-[11px] text-amber-600 mt-1">
                  La foto es de baja resolución y se verá menos nítida en la app. Si tienes una mejor, súbela.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <ul className="text-sm text-zinc-600 space-y-1.5">
            <li>
              <span className="font-semibold text-zinc-900">Medida final:</span> {ANCHO} × {ALTO} px (vertical, proporción 13:15)
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Peso máximo:</span> {MAX_KB} KB · JPG, PNG o WebP
            </li>
            <li className="text-zinc-400 text-xs pt-1">
              Sube la foto, muévela y acércala hasta que quede como quieres. Al guardar, el panel la recorta con esa medida y la
              comprime para que se vea brillante y la app abra rápido. Mientras más grande sea la foto original, más nítida se verá
              (lo ideal es {AVISO_ANCHO} px de ancho o más), pero se acepta cualquier tamaño.
            </li>
          </ul>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={guardando}
              className="text-sm font-semibold border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-50 disabled:opacity-50"
            >
              {b.valor.imagen || pendiente ? "Elegir otra foto" : "Subir foto"}
            </button>
            {pendiente && (
              <button type="button" onClick={() => setPendiente(null)} className="text-xs font-semibold text-zinc-400 hover:text-zinc-700">
                Descartar
              </button>
            )}
            {!pendiente && b.valor.imagen && !quitar && (
              <button type="button" onClick={() => setQuitar(true)} className="text-xs font-semibold text-zinc-400 hover:text-red-500">
                Quitar imagen
              </button>
            )}
            {quitar && (
              <button type="button" onClick={() => setQuitar(false)} className="text-xs font-semibold text-zinc-400 hover:text-zinc-700">
                Deshacer
              </button>
            )}
          </div>
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => elegir(e.target.files?.[0])} />
          {pendiente && (
            <p className="text-xs text-zinc-500">
              Original: {pendiente.bmp.width} × {pendiente.bmp.height} px · {formatoPeso(pendiente.bytes)}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && <span className="text-xs text-red-500">{error}</span>}
        {guardado && <span className="text-xs font-medium text-teal-600">{guardado} ✓</span>}
        <button
          onClick={guardar}
          disabled={guardando || !cambios}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {guardando ? "Recortando y guardando…" : "Guardar cambios"}
        </button>
      </div>
    </Tarjeta>
  );
}
