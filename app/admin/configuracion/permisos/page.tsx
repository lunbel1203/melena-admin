"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

interface Rol {
  id: string;
  nombre: string;
  es_admin_total: boolean;
}

interface Permiso {
  clave: string;
  etiqueta: string;
  modulo: string;
  orden: number;
}

function clave(rolId: string, permisoClave: string) {
  return `${rolId}::${permisoClave}`;
}

export default function PermisosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [catalogo, setCatalogo] = useState<Permiso[]>([]);
  const [permisos, setPermisos] = useState<Map<string, boolean>>(new Map());
  const [original, setOriginal] = useState<Map<string, boolean>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: rolesData }, { data: catalogoData }, { data: rolPermisos }] = await Promise.all([
        supabase.from("roles").select("id, nombre, es_admin_total").order("nombre"),
        supabase.from("permisos_catalogo").select("clave, etiqueta, modulo, orden").order("orden"),
        supabase.from("rol_permisos").select("rol_id, permiso_clave"),
      ]);
      const mapa = new Map<string, boolean>();
      (rolPermisos ?? []).forEach((p) => mapa.set(clave(p.rol_id, p.permiso_clave), true));
      setRoles(rolesData ?? []);
      setCatalogo(catalogoData ?? []);
      setPermisos(mapa);
      setOriginal(mapa);
      setCargando(false);
    })();
  }, [supabase]);

  const rolesEditables = roles.filter((r) => !r.es_admin_total);

  const huboCambios = useMemo(() => {
    if (permisos.size !== original.size) return true;
    for (const [k, v] of permisos) {
      if (original.get(k) !== v) return true;
    }
    return false;
  }, [permisos, original]);

  function toggle(rolId: string, permisoClave: string) {
    setPermisos((prev) => {
      const next = new Map(prev);
      const k = clave(rolId, permisoClave);
      if (next.get(k)) next.delete(k);
      else next.set(k, true);
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const aAgregar: { rol_id: string; permiso_clave: string }[] = [];
    for (const [k, v] of permisos) {
      if (v && !original.get(k)) {
        const [rol_id, permiso_clave] = k.split("::");
        aAgregar.push({ rol_id, permiso_clave });
      }
    }
    const aQuitar: { rol_id: string; permiso_clave: string }[] = [];
    for (const [k, v] of original) {
      if (v && !permisos.get(k)) {
        const [rol_id, permiso_clave] = k.split("::");
        aQuitar.push({ rol_id, permiso_clave });
      }
    }

    if (aAgregar.length > 0) {
      const { error } = await supabase.from("rol_permisos").insert(aAgregar);
      if (error) {
        setGuardando(false);
        return setError(error.message);
      }
    }
    for (const { rol_id, permiso_clave } of aQuitar) {
      const { error } = await supabase.from("rol_permisos").delete().eq("rol_id", rol_id).eq("permiso_clave", permiso_clave);
      if (error) {
        setGuardando(false);
        return setError(error.message);
      }
    }

    setGuardando(false);
    setOriginal(new Map(permisos));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  const modulos = catalogo.filter((p) => p.modulo === "modulo");
  const acciones = catalogo.filter((p) => p.modulo === "accion");

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
        <SectionLabel>Permisos por rol</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Controla qué secciones ve cada rol y qué acciones puntuales puede hacer (verificar depósitos, cobrar
          facturas, gestionar catálogo y personal, ver comisiones de otras). Admin siempre tiene todo — por
          seguridad, no se le puede quitar acceso desde aquí.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                <th className="pb-2 pr-3">Permiso</th>
                <th className="pb-2 px-3 text-center">Admin</th>
                {rolesEditables.map((r) => (
                  <th key={r.id} className="pb-2 px-3 text-center">
                    {r.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modulos.map((p) => (
                <tr key={p.clave} className="border-t border-zinc-100">
                  <td className="py-2.5 pr-3 text-zinc-700 font-medium">{p.etiqueta}</td>
                  <td className="py-2.5 px-3 text-center">
                    <input type="checkbox" checked disabled className="w-4 h-4 rounded accent-zinc-300 cursor-not-allowed" />
                  </td>
                  {rolesEditables.map((r) => (
                    <td key={r.id} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!permisos.get(clave(r.id, p.clave))}
                        onChange={() => toggle(r.id, p.clave)}
                        className="w-4 h-4 rounded accent-teal-500 cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td colSpan={2 + rolesEditables.length} className="pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Acciones
                </td>
              </tr>
              {acciones.map((p) => (
                <tr key={p.clave} className="border-t border-zinc-100">
                  <td className="py-2.5 pr-3 text-zinc-700 font-medium">{p.etiqueta}</td>
                  <td className="py-2.5 px-3 text-center">
                    <input type="checkbox" checked disabled className="w-4 h-4 rounded accent-zinc-300 cursor-not-allowed" />
                  </td>
                  {rolesEditables.map((r) => (
                    <td key={r.id} className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!permisos.get(clave(r.id, p.clave))}
                        onChange={() => toggle(r.id, p.clave)}
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
