"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Registro {
  id: number;
  created_at: string;
  actor: string;
  categoria: string;
  accion: string;
  descripcion: string;
}

const CATEGORIAS: Record<string, { texto: string; clase: string }> = {
  acceso: { texto: "Acceso", clase: "bg-zinc-100 text-zinc-600" },
  facturacion: { texto: "Facturación", clase: "bg-blue-50 text-blue-700" },
  descuento: { texto: "Descuento", clase: "bg-amber-50 text-amber-700" },
  personal: { texto: "Personal", clase: "bg-violet-50 text-violet-700" },
  permisos: { texto: "Permisos", clase: "bg-rose-50 text-rose-700" },
  clientas: { texto: "Clientas", clase: "bg-teal-50 text-teal-700" },
  depositos: { texto: "Depósitos", clase: "bg-emerald-50 text-emerald-700" },
  citas: { texto: "Citas", clase: "bg-sky-50 text-sky-700" },
  catalogo: { texto: "Catálogo", clase: "bg-orange-50 text-orange-700" },
};

const PAGINA = 50;
const RANGOS = [
  { id: "hoy", texto: "Hoy", dias: 0 },
  { id: "7", texto: "7 días", dias: 7 },
  { id: "30", texto: "30 días", dias: 30 },
  { id: "todo", texto: "Todo", dias: -1 },
] as const;

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-DO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Quién hizo qué: accesos, cobros, descuentos, cambios de personal, permisos y más. Solo administración. */
export default function BitacoraPage() {
  const supabase = useMemo(() => createClient(), []);
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [hayMas, setHayMas] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [actor, setActor] = useState("");
  const [rango, setRango] = useState<(typeof RANGOS)[number]["id"]>("7");
  const [busqueda, setBusqueda] = useState("");
  const [buscar, setBuscar] = useState("");
  const [actores, setActores] = useState<string[]>([]);

  // espera a que termine de escribir para consultar
  useEffect(() => {
    const t = setTimeout(() => setBuscar(busqueda.trim()), 350);
    return () => clearTimeout(t);
  }, [busqueda]);

  useEffect(() => {
    supabase
      .from("bitacora")
      .select("actor")
      .order("id", { ascending: false })
      .limit(1000)
      .then(({ data }) => setActores([...new Set((data ?? []).map((r) => r.actor))].sort((a, b) => a.localeCompare(b, "es"))));
  }, [supabase]);

  const consultar = useCallback(
    async (desde: number) => {
      let q = supabase.from("bitacora").select("id, created_at, actor, categoria, accion, descripcion").order("id", { ascending: false }).range(desde, desde + PAGINA);
      if (categoria) q = q.eq("categoria", categoria);
      if (actor) q = q.eq("actor", actor);
      if (buscar) q = q.ilike("descripcion", `%${buscar.replace(/[%,]/g, " ")}%`);
      const dias = RANGOS.find((r) => r.id === rango)!.dias;
      if (dias >= 0) {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - dias);
        q = q.gte("created_at", d.toISOString());
      }
      const { data, error } = await q;
      if (error) return { error: error.message, filas: [] as Registro[], mas: false };
      const filas = (data ?? []) as Registro[];
      return { error: null, filas: filas.slice(0, PAGINA), mas: filas.length > PAGINA };
    },
    [supabase, categoria, actor, buscar, rango],
  );

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    consultar(0).then((r) => {
      if (!vivo) return;
      setError(r.error);
      setRegistros(r.filas);
      setHayMas(r.mas);
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [consultar]);

  async function cargarMas() {
    const r = await consultar(registros.length);
    setRegistros((prev) => [...prev, ...r.filas]);
    setHayMas(r.mas);
  }

  const campo = "py-2 pl-3 pr-8 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-700 focus:outline-none focus:border-zinc-400";

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Bitácora</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Quién hizo qué en el panel y la app: accesos, cobros, descuentos, cambios de personal, roles y permisos, depósitos y precios. Solo la ve administración.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center bg-zinc-100 rounded-xl p-1">
          {RANGOS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRango(r.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${rango === r.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              {r.texto}
            </button>
          ))}
        </div>
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={campo} aria-label="Tipo">
          <option value="">Todos los tipos</option>
          {Object.entries(CATEGORIAS).map(([k, v]) => (
            <option key={k} value={k}>{v.texto}</option>
          ))}
        </select>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={campo} aria-label="Persona">
          <option value="">Todas las personas</option>
          {actores.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en la descripción…"
          className="py-2 px-3 text-sm bg-white border border-zinc-200 rounded-xl w-56 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
        />
      </div>

      {error && <p className="text-sm text-red-500 mb-3">No se pudo cargar: {error}</p>}

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {cargando && <p className="px-6 py-10 text-sm text-zinc-400 text-center">Cargando…</p>}
        {!cargando && registros.length === 0 && !error && (
          <p className="px-6 py-10 text-sm text-zinc-400 text-center">No hay movimientos con esos filtros.</p>
        )}
        {!cargando &&
          registros.map((r) => {
            const c = CATEGORIAS[r.categoria] ?? { texto: r.categoria, clase: "bg-zinc-100 text-zinc-600" };
            return (
              <div key={r.id} className="flex items-start gap-4 px-5 sm:px-6 py-3.5 border-b border-zinc-100 last:border-0">
                <span className="w-28 shrink-0 text-xs text-zinc-400 pt-0.5">{fechaHora(r.created_at)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-zinc-800">
                    <span className="font-semibold text-zinc-900">{r.actor}</span> · {r.descripcion}
                  </p>
                </div>
                <span className={`hidden sm:inline-block shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${c.clase}`}>{c.texto}</span>
              </div>
            );
          })}
      </div>

      {hayMas && !cargando && (
        <div className="flex justify-center mt-4">
          <button onClick={cargarMas} className="text-sm font-semibold text-zinc-700 border border-zinc-200 bg-white px-5 py-2.5 rounded-xl hover:bg-zinc-50">
            Ver más
          </button>
        </div>
      )}
    </div>
  );
}
