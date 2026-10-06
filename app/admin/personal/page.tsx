"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

// Pestañas: "Todas" y un filtro por cada rol (una empleada puede tener varios)
const TODAS = "Todas";

interface Empleado {
  id: string;
  nombre: string;
  rolNombre: string;
  /** Todos sus roles (principal y adicionales) */
  rolesNombres: string[];
  puesto: string | null;
  activo: boolean;
  foto_url: string | null;
  /** Tiene una cuenta (correo y contraseña) para entrar */
  tieneCuenta: boolean;
  /** Plataformas a las que su rol le da acceso */
  accesoApp: boolean;
  accesoPanel: boolean;
}

interface Stats {
  servicios: number;
  facturado: number;
  comision: number;
}

type FiltroCuenta = "Todas" | "Con cuenta" | "Sin cuenta";
const filtrosCuenta: FiltroCuenta[] = ["Todas", "Con cuenta", "Sin cuenta"];

const formatoRD = new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 });

export default function PersonalPage() {
  const supabase = useMemo(() => createClient(), []);
  const [activeTab, setActiveTab] = useState<string>(TODAS);
  const [rolesLista, setRolesLista] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filtroCuenta, setFiltroCuenta] = useState<FiltroCuenta>("Todas");
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [stats, setStats] = useState<Map<string, Stats>>(new Map());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    (async () => {
      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);
      const inicioMesISO = inicioMes.toISOString();

      const [{ data: emps }, { data: lineas }, { data: comisiones }, { data: permisosRol }, { data: rolesData }] = await Promise.all([
        supabase.from("empleados").select("id, nombre, puesto, activo, foto_url, user_id, rol_id, roles(nombre, es_admin_total), empleados_roles(rol_id, roles(nombre, es_admin_total))").order("nombre"),
        supabase
          .from("lineas_factura")
          .select("empleado_id, subtotal, tipo, facturas!inner(estado, cobrada_at)")
          .eq("facturas.estado", "cobrada")
          .gte("facturas.cobrada_at", inicioMesISO),
        supabase.from("comisiones").select("empleado_id, monto").gte("created_at", inicioMesISO),
        supabase.from("rol_permisos").select("rol_id, permiso_clave").in("permiso_clave", ["acceso.app_movil", "acceso.panel_admin"]),
        supabase.from("roles").select("nombre").order("nombre"),
      ]);
      setRolesLista((rolesData ?? []).map((r) => r.nombre));

      // plataformas que permite cada rol (el admin total entra a todo)
      const accesoPorRol = new Map<string, Set<string>>();
      (permisosRol ?? []).forEach((p) => {
        const set = accesoPorRol.get(p.rol_id) ?? new Set<string>();
        set.add(p.permiso_clave);
        accesoPorRol.set(p.rol_id, set);
      });

      const mapa = new Map<string, Stats>();
      (lineas ?? []).forEach((l) => {
        const s = mapa.get(l.empleado_id) ?? { servicios: 0, facturado: 0, comision: 0 };
        if (l.tipo === "servicio") s.servicios += 1;
        s.facturado += Number(l.subtotal ?? 0);
        mapa.set(l.empleado_id, s);
      });
      (comisiones ?? []).forEach((c) => {
        const s = mapa.get(c.empleado_id) ?? { servicios: 0, facturado: 0, comision: 0 };
        s.comision += Number(c.monto);
        mapa.set(c.empleado_id, s);
      });

      setEmpleados(
        (emps ?? []).map((e) => {
          const uno = <T,>(x: T | T[] | null) => (Array.isArray(x) ? x[0] : x);
          const principal = uno(e.roles);
          const extras = (e.empleados_roles ?? []).map((r) => ({ rol_id: r.rol_id, rol: uno(r.roles) }));
          // todos sus roles: el principal primero y luego los adicionales
          const todos = [{ rol_id: e.rol_id, rol: principal }, ...extras.filter((x) => x.rol_id !== e.rol_id)];
          const permisos = new Set<string>();
          todos.forEach((x) => accesoPorRol.get(x.rol_id)?.forEach((c) => permisos.add(c)));
          const admin = todos.some((x) => x.rol?.es_admin_total);
          return {
            id: e.id,
            nombre: e.nombre,
            puesto: e.puesto,
            activo: e.activo,
            foto_url: e.foto_url,
            rolNombre: todos.map((x) => x.rol?.nombre).filter(Boolean).join(" · "),
            rolesNombres: todos.map((x) => x.rol?.nombre).filter((n): n is string => !!n),
            tieneCuenta: !!e.user_id,
            accesoApp: admin || permisos.has("acceso.app_movil"),
            accesoPanel: admin || permisos.has("acceso.panel_admin"),
          };
        })
      );
      setStats(mapa);
      setCargando(false);
    })();
  }, [supabase]);

  const filtered = empleados.filter((e) => {
    const matchTab = activeTab === TODAS || e.rolesNombres.includes(activeTab);
    const matchSearch = e.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCuenta = filtroCuenta === "Todas" || (filtroCuenta === "Con cuenta" ? e.tieneCuenta : !e.tieneCuenta);
    return matchTab && matchSearch && matchCuenta;
  });

  const conCuenta = empleados.filter((e) => e.tieneCuenta);
  const entranApp = conCuenta.filter((e) => e.accesoApp).length;
  const entranPanel = conCuenta.filter((e) => e.accesoPanel).length;

  const totalComisiones = Array.from(stats.values()).reduce((acc, s) => acc + s.comision, 0);

  if (cargando) return <p className="p-8 text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mr-auto">Personal</h1>

        <div className="flex items-center bg-zinc-100 rounded-xl p-1">
          {[TODAS, ...rolesLista].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Link
          href="/admin/personal/nueva"
          className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
        >
          + Nueva empleada
        </Link>
      </div>

      {/* ── Acceso: quiénes ya tienen cuenta ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-5 py-4 mb-4 flex items-center gap-x-8 gap-y-3 flex-wrap">
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Con cuenta</p>
          <p className="text-lg font-bold text-zinc-900">{conCuenta.length} <span className="text-sm font-medium text-zinc-400">de {empleados.length}</span></p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Entran a la app</p>
          <p className="text-lg font-bold text-zinc-900">{entranApp}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">Entran al panel</p>
          <p className="text-lg font-bold text-zinc-900">{entranPanel}</p>
        </div>
        <div className="flex items-center bg-zinc-100 rounded-xl p-1 ml-auto">
          {filtrosCuenta.map((f) => (
            <button
              key={f}
              onClick={() => setFiltroCuenta(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filtroCuenta === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-4 max-w-xs">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar empleada..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
        />
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">

        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.3fr_1fr_28px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
          {["Empleada", "Rol", "Servicios (mes)", "Facturado (mes)", "Comisión (mes)", "Acceso", "Estado", ""].map((h) => (
            <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="px-6 py-8 text-sm text-zinc-400">Sin resultados.</p>
        ) : (
          filtered.map((e) => {
            const s = stats.get(e.id);
                        return (
              <Link
                key={e.id}
                href={`/admin/personal/${e.id}`}
                className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.3fr_1fr_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0 overflow-hidden">
                    {e.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.foto_url} alt={e.nombre} className="w-full h-full object-cover" />
                    ) : (
                      e.nombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{e.nombre}</p>
                    <p className="text-xs text-zinc-400 truncate">{e.puesto ?? "—"}</p>
                  </div>
                </div>

                <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                  {e.rolNombre}
                </span>

                <span className="hidden sm:block text-sm text-zinc-700">
                  {s && s.servicios > 0 ? s.servicios : "—"}
                </span>

                <span className="hidden sm:block text-sm text-zinc-700">
                  {s && s.facturado > 0 ? formatoRD.format(s.facturado) : "—"}
                </span>

                <span className="hidden sm:block text-sm font-medium text-zinc-900">
                  {s && s.comision > 0 ? formatoRD.format(s.comision) : "—"}
                </span>

                <div className="hidden sm:flex flex-col items-start gap-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${e.tieneCuenta ? "bg-teal-50 text-teal-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {e.tieneCuenta ? "Con cuenta" : "Sin cuenta"}
                  </span>
                  {e.tieneCuenta ? (
                    <span className="text-[10px] font-medium text-zinc-400">
                      {[e.accesoApp ? "App" : null, e.accesoPanel ? "Panel" : null].filter(Boolean).join(" · ") || "Sin acceso por su rol"}
                    </span>
                  ) : null}
                </div>

                <div className="hidden sm:block">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    e.activo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {e.activo ? "Activa" : "Inactiva"}
                  </span>
                </div>

                <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0">
                  <ChevronIcon />
                </span>
              </Link>
            );
          })
        )}

        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-0.5">
              Total comisiones del mes
            </p>
            <p className="text-xs text-zinc-400">Facturas cobradas desde el día 1.</p>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatoRD.format(totalComisiones)}</p>
        </div>
      </div>
    </div>
  );
}
