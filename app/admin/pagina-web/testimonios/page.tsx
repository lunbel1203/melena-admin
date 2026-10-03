"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";
import { useBloque, type TituloSeccion } from "@/lib/pagina-web";
import { Area, BarraGuardar, Campo, Etiqueta, Tarjeta } from "@/components/pagina-web/campos";

interface Testimonio {
  id: string;
  estrellas: number;
  texto: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

function TituloCard() {
  const b = useBloque<TituloSeccion>("testimonios", { titulo: "" });
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

export default function TestimoniosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [lista, setLista] = useState<Testimonio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState<Testimonio | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [recarga, setRecarga] = useState(0);
  const cargar = useCallback(() => setRecarga((n) => n + 1), []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("web_testimonios").select("*").order("orden").order("created_at");
      setLista(data ?? []);
      setCargando(false);
    })();
  }, [supabase, recarga]);

  async function guardar() {
    if (!editando) return;
    if (!editando.texto.trim() || !editando.nombre.trim()) return setError("Escribe el testimonio y el nombre.");
    setGuardando(true);
    setError(null);
    const campos = { estrellas: editando.estrellas, texto: editando.texto.trim(), nombre: editando.nombre.trim(), activo: editando.activo };
    const { error } = editando.id
      ? await supabase.from("web_testimonios").update(campos).eq("id", editando.id)
      : await supabase.from("web_testimonios").insert({ ...campos, orden: (lista.at(-1)?.orden ?? 0) + 1 });
    setGuardando(false);
    if (error) return setError(error.message);
    setEditando(null);
    cargar();
  }

  async function alternar(t: Testimonio) {
    await supabase.from("web_testimonios").update({ activo: !t.activo }).eq("id", t.id);
    cargar();
  }

  async function mover(i: number, dir: -1 | 1) {
    const otro = lista[i + dir];
    if (!otro) return;
    const t = lista[i];
    await Promise.all([
      supabase.from("web_testimonios").update({ orden: otro.orden }).eq("id", t.id),
      supabase.from("web_testimonios").update({ orden: t.orden }).eq("id", otro.id),
    ]);
    cargar();
  }

  async function eliminar(t: Testimonio) {
    const ok = await confirmar({ titulo: "¿Eliminar este testimonio?", texto: `De ${t.nombre}. No se puede deshacer.`, confirmarTexto: "Eliminar" });
    if (!ok) return;
    const { error } = await supabase.from("web_testimonios").delete().eq("id", t.id);
    if (error) return setError(error.message);
    cargar();
  }

  return (
    <>
      <TituloCard />
      <Tarjeta>
        <div className="flex items-center justify-between mb-4">
          <Etiqueta>Testimonios</Etiqueta>
          <button
            onClick={() => setEditando({ id: "", estrellas: 5, texto: "", nombre: "", orden: 0, activo: true })}
            className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors"
          >
            + Nuevo
          </button>
        </div>
        {error && !editando && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {editando && (
          <div className="border border-zinc-200 rounded-xl p-4 mb-4 space-y-4 bg-zinc-50">
            <Area label="Testimonio" value={editando.texto} onChange={(v) => setEditando({ ...editando, texto: v })} filas={3} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Campo label="Nombre" value={editando.nombre} onChange={(v) => setEditando({ ...editando, nombre: v })} placeholder="Valentina R." />
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Estrellas</label>
                <select
                  value={editando.estrellas}
                  onChange={(e) => setEditando({ ...editando, estrellas: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 bg-white"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {"★".repeat(n)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              {error && <span className="text-xs text-red-500">{error}</span>}
              <button onClick={() => { setEditando(null); setError(null); }} className="text-sm font-semibold text-zinc-600 px-3 py-2">
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        )}

        {cargando ? (
          <p className="text-sm text-zinc-400">Cargando…</p>
        ) : lista.length === 0 ? (
          <p className="text-sm text-zinc-400">Todavía no hay testimonios.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {lista.map((t, i) => (
              <li key={t.id} className={`py-3 flex items-start gap-3 ${t.activo ? "" : "opacity-50"}`}>
                <div className="flex flex-col">
                  <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-25 text-xs leading-none p-1" aria-label="Subir">▲</button>
                  <button onClick={() => mover(i, 1)} disabled={i === lista.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-25 text-xs leading-none p-1" aria-label="Bajar">▼</button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700">{t.texto}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {t.nombre} · {"★".repeat(t.estrellas)}
                    {!t.activo && " · oculto"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold shrink-0">
                  <button onClick={() => alternar(t)} className="text-zinc-500 hover:text-zinc-800">{t.activo ? "Ocultar" : "Mostrar"}</button>
                  <button onClick={() => setEditando(t)} className="text-zinc-500 hover:text-zinc-800">Editar</button>
                  <button onClick={() => eliminar(t)} className="text-red-500 hover:text-red-600">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Tarjeta>
    </>
  );
}
