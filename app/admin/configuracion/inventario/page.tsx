"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

function Toggle({ activo, onClick }: { activo: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${activo ? "bg-teal-500" : "bg-zinc-200"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${activo ? "left-[18px]" : "left-0.5"}`} />
    </button>
  );
}

interface Categoria {
  id: string;
  nombre: string;
  activo: boolean;
  es_cabello: boolean;
}

export default function InventarioPage() {
  const supabase = useMemo(() => createClient(), []);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEsCabello, setNuevoEsCabello] = useState(false);
  const [creando, setCreando] = useState(false);

  async function cargar() {
    setCargando(true);
    const { data } = await supabase.from("categorias_productos").select("*").order("nombre");
    setCategorias(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActivo(c: Categoria) {
    setError(null);
    const { error } = await supabase.from("categorias_productos").update({ activo: !c.activo }).eq("id", c.id);
    if (error) return setError(error.message);
    cargar();
  }

  async function toggleEsCabello(c: Categoria) {
    setError(null);
    const { error } = await supabase.from("categorias_productos").update({ es_cabello: !c.es_cabello }).eq("id", c.id);
    if (error) return setError(error.message);
    cargar();
  }

  async function crearCategoria() {
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    setError(null);
    const { error } = await supabase.from("categorias_productos").insert({ nombre: nuevoNombre.trim(), es_cabello: nuevoEsCabello });
    setCreando(false);
    if (error) {
      return setError(error.code === "23505" ? "Ya existe una categoría con ese nombre." : error.message);
    }
    setNuevoNombre("");
    setNuevoEsCabello(false);
    setMostrarNueva(false);
    cargar();
  }

  async function eliminarCategoria(c: Categoria) {
    const ok = await confirmar({
      titulo: `¿Eliminar la categoría "${c.nombre}"?`,
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    setError(null);
    const { count } = await supabase
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("categoria", c.nombre);
    if (count && count > 0) {
      setError(`No se puede eliminar "${c.nombre}": ${count} producto(s) la usan. Desactívala en su lugar.`);
      return;
    }
    const { error } = await supabase.from("categorias_productos").delete().eq("id", c.id);
    if (error) return setError(error.message);
    cargar();
  }

  if (cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Categorías de productos</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Alimentan el desplegable de categoría en Nuevo producto y Editar producto. Desactiva una categoría para
          dejar de ofrecerla sin borrar los productos que ya la usan.
        </p>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <div className="space-y-2 mb-3">
          {categorias.length === 0 && <p className="text-sm text-zinc-400">Sin categorías todavía.</p>}
          {categorias.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border border-zinc-100 rounded-xl px-4 py-3">
              <span className={`text-sm font-medium ${c.activo ? "text-zinc-900" : "text-zinc-400"}`}>{c.nombre}</span>
              <div className="flex items-center gap-4 shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={c.es_cabello}
                    onChange={() => toggleEsCabello(c)}
                    className="w-3.5 h-3.5 accent-zinc-900"
                  />
                  <span className="text-xs text-zinc-500">Es cabello</span>
                </label>
                <Toggle activo={c.activo} onClick={() => toggleActivo(c)} />
                <button onClick={() => eliminarCategoria(c)} className="text-xs text-zinc-400 hover:text-red-500">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {mostrarNueva ? (
          <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
            <input
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              placeholder="Nombre de la categoría"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400"
              onKeyDown={(e) => e.key === "Enter" && crearCategoria()}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={nuevoEsCabello} onChange={(e) => setNuevoEsCabello(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
              <span className="text-sm text-zinc-600">Es cabello (pide tipo, color y largo; crea un producto por cada largo)</span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => { setMostrarNueva(false); setNuevoNombre(""); }} className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600">
                Cancelar
              </button>
              <button onClick={crearCategoria} disabled={creando} className="flex-1 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold disabled:opacity-50">
                {creando ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarNueva(true)} className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors">
            + Nueva categoría
          </button>
        )}
      </div>
    </div>
  );
}
