"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type RolEmpleado = Database["public"]["Enums"]["rol_empleado"];
type TipoLinea = Database["public"]["Enums"]["tipo_linea_factura"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

const ROLES: { id: RolEmpleado; label: string }[] = [
  { id: "estilista", label: "Estilista" },
  { id: "recepcion", label: "Recepción" },
  { id: "caja", label: "Caja" },
];

interface ComisionesConfig {
  corte: string;
  calcular_sobre: string;
}

export default function ComisionesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [porcentajes, setPorcentajes] = useState<Record<RolEmpleado, Record<TipoLinea, number>> | null>(null);
  const [config, setConfig] = useState<ComisionesConfig | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  async function cargar() {
    setCargando(true);
    const [{ data: dr }, { data: cc }] = await Promise.all([
      supabase.from("comisiones_default_rol").select("*"),
      supabase.from("comisiones_config").select("*").eq("id", true).single(),
    ]);
    if (dr) {
      const mapa = {} as Record<RolEmpleado, Record<TipoLinea, number>>;
      for (const fila of dr) {
        mapa[fila.rol] ??= { servicio: 0, producto: 0 };
        mapa[fila.rol][fila.tipo] = Number(fila.porcentaje);
      }
      setPorcentajes(mapa);
    }
    if (cc) setConfig(cc);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizarPorcentaje(rol: RolEmpleado, tipo: TipoLinea, valor: number) {
    setPorcentajes((prev) => (prev ? { ...prev, [rol]: { ...prev[rol], [tipo]: valor } } : prev));
  }

  async function guardar() {
    if (!porcentajes || !config) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const resultados = await Promise.all([
      ...ROLES.flatMap(({ id: rol }) =>
        (["servicio", "producto"] as TipoLinea[]).map((tipo) =>
          supabase
            .from("comisiones_default_rol")
            .update({ porcentaje: porcentajes[rol][tipo] })
            .eq("rol", rol)
            .eq("tipo", tipo),
        ),
      ),
      supabase.from("comisiones_config").update(config).eq("id", true),
    ]);
    setGuardando(false);
    const conError = resultados.find((r) => r.error);
    if (conError?.error) return setError(conError.error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando || !porcentajes || !config) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={guardar}
          disabled={guardando}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Comisiones · Porcentaje por rol</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Se aplica por defecto según el rol. Cada empleada puede tener un porcentaje distinto desde su perfil en Personal.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                <th className="pb-2 pr-3">Rol</th>
                <th className="pb-2 pr-3">Servicios</th>
                <th className="pb-2">Productos</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map(({ id: rol, label }) => (
                <tr key={rol} className="border-t border-zinc-100">
                  <td className="py-2.5 pr-3 font-semibold text-zinc-800">{label}</td>
                  <td className="py-2.5 pr-3">
                    <div className="relative w-24">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={porcentajes[rol].servicio}
                        onChange={(e) => actualizarPorcentaje(rol, "servicio", Number(e.target.value))}
                        className="w-full pl-3 pr-6 py-1.5 border border-zinc-200 rounded-lg text-sm"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <div className="relative w-24">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={porcentajes[rol].producto}
                        onChange={(e) => actualizarPorcentaje(rol, "producto", Number(e.target.value))}
                        className="w-full pl-3 pr-6 py-1.5 border border-zinc-200 rounded-lg text-sm"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Cálculo</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Cómo y cuándo se calculan las comisiones.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Corte de comisiones</label>
            <select
              value={config.corte}
              onChange={(e) => setConfig({ ...config, corte: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
            >
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Calcular sobre</label>
            <select
              value={config.calcular_sobre}
              onChange={(e) => setConfig({ ...config, calcular_sobre: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white"
            >
              <option value="subtotal_sin_itbis">Subtotal sin ITBIS</option>
              <option value="total_con_itbis">Total con ITBIS</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-zinc-400">
          Para dar un porcentaje distinto a una empleada específica, edítalo desde su perfil en Personal.
        </p>
        <a href="/admin/personal" className="text-xs font-semibold text-zinc-700 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors whitespace-nowrap">
          Ir a Personal
        </a>
      </div>
    </div>
  );
}
