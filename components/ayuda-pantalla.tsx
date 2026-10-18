"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AyudaPantalla } from "@/lib/ayuda-pantallas";

function IconoAyuda() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="8" cy="8" r="6.25" />
      <path d="M6.2 6.3a1.9 1.9 0 1 1 2.7 1.7c-.6.3-.9.7-.9 1.3" />
      <path d="M8 11.6v.01" />
    </svg>
  );
}

/** Botón "Ayuda" de la cabecera: abre una ventana con la explicación de la pantalla actual. */
export default function AyudaPantallaBoton({ ayuda, compacto = false }: { ayuda: AyudaPantalla; compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const disparadorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    cerrarRef.current?.focus();
    const disparador = disparadorRef.current;
    return () => {
      document.removeEventListener("keydown", alTeclear);
      disparador?.focus();
    };
  }, [abierto]);

  return (
    <>
      <button
        ref={disparadorRef}
        type="button"
        onClick={() => setAbierto(true)}
        className={
          compacto
            ? "text-zinc-400 hover:text-white transition-colors"
            : "inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        }
        aria-label={`Ayuda de ${ayuda.titulo}`}
        aria-haspopup="dialog"
      >
        <IconoAyuda />
        {!compacto && <span>Ayuda</span>}
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4 print:hidden" onClick={() => setAbierto(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ayuda-pantalla-titulo"
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-3 border-b border-zinc-100">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Ayuda de esta pantalla</p>
                <h2 id="ayuda-pantalla-titulo" className="text-lg font-bold text-zinc-900">
                  {ayuda.titulo}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">{ayuda.resumen}</p>
              </div>
              <button
                ref={cerrarRef}
                type="button"
                onClick={() => setAbierto(false)}
                className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
                aria-label="Cerrar ayuda"
              >
                Cerrar
              </button>
            </div>

            <div className="overflow-y-auto px-5 py-4 space-y-5">
              {ayuda.bloques.map((b, i) => (
                <section key={i}>
                  {b.titulo && <h3 className="text-sm font-semibold text-zinc-900 mb-2">{b.titulo}</h3>}
                  {b.pasos && (
                    <ol className="space-y-2">
                      {b.pasos.map((p, k) => (
                        <li key={k} className="flex gap-3 text-sm text-zinc-700">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{k + 1}</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {b.notas && (
                    <ul className={`space-y-1.5 ${b.pasos ? "mt-3" : ""}`}>
                      {b.notas.map((n, k) => (
                        <li key={k} className="flex gap-2 text-sm text-zinc-500">
                          <span aria-hidden="true">•</span>
                          <span>{n}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-zinc-100 text-sm">
              <Link href="/admin/ayuda" onClick={() => setAbierto(false)} className="font-medium text-zinc-900 underline underline-offset-2 hover:text-zinc-600">
                Ver el manual completo
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
