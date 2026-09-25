"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";

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

const MODULOS: { modulo: string; etiqueta: string }[] = [
  { modulo: "plataforma", etiqueta: "Plataforma" },
  { modulo: "resumen", etiqueta: "Resumen" },
  { modulo: "agenda", etiqueta: "Agenda" },
  { modulo: "clientas", etiqueta: "Clientas" },
  { modulo: "depositos", etiqueta: "Depósitos" },
  { modulo: "personal", etiqueta: "Personal" },
  { modulo: "catalogo", etiqueta: "Catálogo" },
  { modulo: "proveedores", etiqueta: "Proveedores" },
  { modulo: "facturacion", etiqueta: "Facturación" },
  { modulo: "reportes", etiqueta: "Reportes" },
  { modulo: "configuracion", etiqueta: "Configuración" },
];

function clave(rolId: string, permisoClave: string) {
  return `${rolId}::${permisoClave}`;
}

export default function SeguridadPage() {
  const supabase = useMemo(() => createClient(), []);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [nombresOriginales, setNombresOriginales] = useState<Map<string, string>>(new Map());
  const [catalogo, setCatalogo] = useState<Permiso[]>([]);
  const [permisos, setPermisos] = useState<Map<string, boolean>>(new Map());
  const [original, setOriginal] = useState<Map<string, boolean>>(new Map());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [mostrarNuevoRol, setMostrarNuevoRol] = useState(false);
  const [nuevoRolNombre, setNuevoRolNombre] = useState("");
  const [creandoRol, setCreandoRol] = useState(false);
  const [errorRoles, setErrorRoles] = useState<string | null>(null);

  async function cargar() {
    const [{ data: rolesData }, { data: catalogoData }, { data: rolPermisos }] = await Promise.all([
      supabase.from("roles").select("id, nombre, es_admin_total").order("nombre"),
      supabase.from("permisos_catalogo").select("clave, etiqueta, modulo, orden").order("orden"),
      supabase.from("rol_permisos").select("rol_id, permiso_clave"),
    ]);
    const mapa = new Map<string, boolean>();
    (rolPermisos ?? []).forEach((p) => mapa.set(clave(p.rol_id, p.permiso_clave), true));
    setRoles(rolesData ?? []);
    setNombresOriginales(new Map((rolesData ?? []).map((r) => [r.id, r.nombre])));
    setCatalogo(catalogoData ?? []);
    setPermisos(mapa);
    setOriginal(mapa);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const rolesEditables = roles.filter((r) => !r.es_admin_total);

  function renombrar(rolId: string, nombre: string) {
    setRoles((prev) => prev.map((r) => (r.id === rolId ? { ...r, nombre } : r)));
  }

  const rolesRenombrados = rolesEditables.filter((r) => nombresOriginales.get(r.id) !== r.nombre);

  const huboCambios = useMemo(() => {
    if (rolesRenombrados.length > 0) return true;
    if (permisos.size !== original.size) return true;
    for (const [k, v] of permisos) {
      if (original.get(k) !== v) return true;
    }
    return false;
  }, [permisos, original, rolesRenombrados]);

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

    for (const r of rolesRenombrados) {
      const { error } = await supabase.from("roles").update({ nombre: r.nombre }).eq("id", r.id);
      if (error) {
        setGuardando(false);
        return setError(error.code === "23505" ? "Ya existe un rol con ese nombre." : error.message);
      }
    }

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
    setNombresOriginales(new Map(roles.map((r) => [r.id, r.nombre])));
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  async function crearRol() {
    if (!nuevoRolNombre.trim()) return;
    setCreandoRol(true);
    setErrorRoles(null);
    const { data: nuevo, error } = await supabase
      .from("roles")
      .insert({ nombre: nuevoRolNombre.trim() })
      .select("id")
      .single();
    if (error || !nuevo) {
      setCreandoRol(false);
      return setErrorRoles(error?.code === "23505" ? "Ya existe un rol con ese nombre." : error?.message ?? "No se pudo crear el rol.");
    }
    const { error: comisionesError } = await supabase.from("comisiones_default_rol").insert([
      { rol_id: nuevo.id, tipo: "servicio", porcentaje: 0 },
      { rol_id: nuevo.id, tipo: "producto", porcentaje: 0 },
    ]);
    setCreandoRol(false);
    if (comisionesError) return setErrorRoles(comisionesError.message);
    setNuevoRolNombre("");
    setMostrarNuevoRol(false);
    cargar();
  }

  async function eliminarRol(r: Rol) {
    const ok = await confirmar({
      titulo: `¿Eliminar el rol "${r.nombre}"?`,
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    setErrorRoles(null);
    const { error } = await supabase.from("roles").delete().eq("id", r.id);
    if (error) {
      return setErrorRoles(
        error.code === "23503"
          ? `No se puede eliminar "${r.nombre}": hay empleadas con ese rol. Cámbialas de rol primero.`
          : error.message
      );
    }
    cargar();
  }

  if (cargando) return <p className="p-8 text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Seguridad</h1>
          <p className="text-sm text-zinc-400 mt-1">Roles y qué puede hacer cada uno, módulo por módulo.</p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Roles</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Crea roles con el nombre que quieras. Admin siempre existe, tiene todo, y no se puede renombrar ni eliminar.
        </p>

        {errorRoles && <p className="text-xs text-red-500 mb-3">{errorRoles}</p>}

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between gap-3 border border-zinc-100 rounded-xl px-4 py-3 bg-zinc-50">
            <span className="text-sm font-medium text-zinc-500">Admin</span>
            <span className="text-xs font-semibold text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-100">Acceso total</span>
          </div>
          {rolesEditables.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 border border-zinc-100 rounded-xl px-4 py-3">
              <input
                value={r.nombre}
                onChange={(e) => renombrar(r.id, e.target.value)}
                className="text-sm font-medium text-zinc-900 flex-1 min-w-0 outline-none focus:border-b focus:border-zinc-300"
              />
              <button onClick={() => eliminarRol(r)} className="text-xs text-zinc-400 hover:text-red-500 shrink-0">
                Eliminar
              </button>
            </div>
          ))}
        </div>

        {mostrarNuevoRol ? (
          <div className="border border-zinc-200 rounded-xl p-3 space-y-2">
            <input
              value={nuevoRolNombre}
              onChange={(e) => setNuevoRolNombre(e.target.value)}
              placeholder="Nombre del rol (ej. Supervisor)"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400"
              onKeyDown={(e) => e.key === "Enter" && crearRol()}
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setMostrarNuevoRol(false); setNuevoRolNombre(""); }}
                className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600"
              >
                Cancelar
              </button>
              <button
                onClick={crearRol}
                disabled={creandoRol}
                className="flex-1 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold disabled:opacity-50"
              >
                {creandoRol ? "Creando…" : "Crear"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setMostrarNuevoRol(true)}
            className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors"
          >
            + Nuevo rol
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Permisos por módulo</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Para cada módulo, qué puede hacer cada rol. Admin siempre tiene todo — por seguridad no se le puede
          quitar acceso desde aquí.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                <th className="pb-2 pr-3">Acción</th>
                <th className="pb-2 px-3 text-center">Admin</th>
                {rolesEditables.map((r) => (
                  <th key={r.id} className="pb-2 px-3 text-center">
                    {r.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULOS.map(({ modulo, etiqueta }) => {
                const filas = catalogo.filter((p) => p.modulo === modulo);
                if (filas.length === 0) return null;
                return (
                  <Fragment key={modulo}>
                    <tr>
                      <td colSpan={2 + rolesEditables.length} className="pt-4 pb-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                        {etiqueta}
                      </td>
                    </tr>
                    {filas.map((p) => (
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
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
