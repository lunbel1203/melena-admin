"use client";

import { useState } from "react";

/** Imagen del comprobante; si el archivo está dañado o no abre, lo dice en vez de mostrar un icono roto */
export default function ImagenComprobante({ src, alt }: { src: string; alt: string }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) {
    return (
      <div className="w-full px-4 py-8 text-center bg-zinc-50">
        <p className="text-sm font-medium text-zinc-600">No se pudo mostrar la imagen</p>
        <p className="text-xs text-zinc-400 mt-1">El archivo está dañado o no se pudo subir bien. Pídele a la clienta que lo envíe otra vez.</p>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFallo(true)} className="w-full max-h-64 object-contain bg-zinc-50" />;
}
