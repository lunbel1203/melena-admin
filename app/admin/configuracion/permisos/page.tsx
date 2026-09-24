"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type RolEmpleado = Database["public"]["Enums"]["rol_empleado"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

interface Permiso {
  rol: RolEmpleado;
  modulo: string;
  puede_ver: boolean;
}

const ROLES: { rol: RolEmpleado; label: string }[] = [
  { rol: "recepcion", label: "Recepción" },
  { rol: "estilista", label: "Estilista" },
  { rol: "caja", label: "Caja" },
];

const MODULOS: { modulo: string; label: string }[] = [
  { modulo: "resumen", label: "Resumen" },
  { modulo: "agenda", label: "Agenda" },
  { modulo: "clientas", label: "Clientas" },
  { modulo: "depositos", label: "Depósitos" },
  { modulo: "personal", label: "Personal" },
  { modulo: "catalogo", label: "Catálogo" },
  { modulo: "proveedores", label: "Proveedores" },
  { modulo: "facturacion", label: "Facturación" },
  { modulo: "reportes", label: "Reportes" },
  { modulo: "configuracion", label: "Configuración" },
];

function clave(rol: RolEmpleado, modulo: string) {
  return `${rol}::${modulo}`;
}

export default function PermisosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [permisos, setPermisos] = useState<Map<string, boolean>>(new Map());
  const [original, setOriginal] = useState<Map<string, boolean>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("permisos_modulo").select("rol, modulo, puede_ver");
      const mapa = new Map<string, boolean>();
      (data ?? []).forEach((p: Permiso) => mapa.set(clave(p.rol, p.modulo), p.puede_ver));
      setPermisos(mapa);
      setOriginal(mapa);
      setCargando(false);
    })();
  }, [supabase]);

  const huboCambios = useMemo(() => {
    for (const [k, v] of permisos) {
      if (original.get(k) !== v) return true;
    }
    return false;
  }, [permisos, original]);

  function toggle(rol: RolEmpleado, modulo: string) {
    setPermisos((prev) => {
      const next = new Map(prev);
      next.set(clave(rol, modulo), !prev.get(clave(rol, modulo)));
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const filas = ROLES.flatMap(({ rol }) =>
      MODULOS.map(({ modulo }) => ({
        rol,
        modulo,
        puede_ver: permisos.get(clave(rol, modulo)) ?? true,
      }))
    );

    const { error } = await supabase.from("permisos_modulo").upsert(filas, { onConflict: "rol,modulo" });
    setGuardando(false);
    if (error) return setError(error.message);
    setOriginal(new Map(permisos));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={guardar}
          disabled={guardando || !huboCambios}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Qué ve cada rol</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Controla qué secciones aparecen en el menú y a cuáles puede entrar cada rol. Admin siempre ve todo — por
          seguridad, no se le puede quitar acceso desde aquí. Esto no cambia los permisos de la base de datos
          (esos siguen siendo igual de estrictos); solo controla la navegación del panel.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                <th className="pb-2 pr-3">Módulo</th>
                <th className="pb-2 px-3 text-center">Admin</th>
                {ROLES.map(({ rol, label }) => (
                  <th key={rol} className="pb-2 px-3 text-center">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULOS.map(({ modulo, label }) => (
                <tr key={modulo} className="border-t border-zinc-100">
                  <td className="py-2.5 pr-3 text-zinc-700 font-medium">{label}</td>
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked
                      disabled
                      className="w-4 h-4 rounded accent-zinc-300 cursor-not-allowed"
                    />
                  </td>
                  {ROLES.map(({ rol }) => (
                    <td key={rol} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={permisos.get(clave(rol, modulo)) ?? true}
                        onChange={() => toggle(rol, modulo)}
                        className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
