"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GUIA_ROLES, ROLES, TEMAS, temasParaRoles, type Rol, type Tema } from "@/lib/ayuda";

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function textoDe(t: Tema) {
  return sinTildes([t.titulo, t.resumen, ...t.bloques.flatMap((b) => [b.titulo ?? "", ...(b.pasos ?? []), ...(b.notas ?? [])])].join(" "));
}

/** Manual de ayuda: lo que le toca a cada rol, con pasos. Quien es administrador puede ver la guía de cualquier rol. */
export default function AyudaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [misRoles, setMisRoles] = useState<string[]>([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  // "mis" = mis roles · "todo" = manual completo · o el nombre de un rol
  const [vista, setVista] = useState<string>("mis");
  const [busqueda, setBusqueda] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setCargando(false);
      const [{ data: emp }, { data: admin }] = await Promise.all([
        supabase.from("empleados").select("roles!empleados_rol_id_fkey(nombre), empleados_roles(roles(nombre))").eq("user_id", user.id).maybeSingle(),
        supabase.rpc("es_admin"),
      ]);
      const uno = <T,>(x: T | T[] | null) => (Array.isArray(x) ? x[0] : x);
      const principal = uno(emp?.roles)?.nombre;
      const extras = (emp?.empleados_roles ?? []).map((r) => uno(r.roles)?.nombre);
      const nombres = [...new Set([principal, ...extras].filter((n): n is string => !!n))];
      setMisRoles(nombres);
      setEsAdmin(admin === true);
      // la administración arranca viendo todo; las demás, lo de sus roles
      setVista(admin === true ? "todo" : "mis");
      setCargando(false);
    })();
  }, [supabase]);

  const rolesVistos = vista === "mis" ? misRoles : vista === "todo" ? [] : [vista];
  const temas = useMemo(() => {
    const lista = temasParaRoles(rolesVistos, vista === "todo");
    const q = sinTildes(busqueda.trim());
    return q ? lista.filter((t) => textoDe(t).includes(q)) : lista;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vista, misRoles, busqueda]);

  const rolesConGuia = rolesVistos.filter((r): r is Rol => (ROLES as readonly string[]).includes(r));
  const buscando = busqueda.trim().length > 0;

  const chip = (activo: boolean) =>
    `px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-colors ${activo ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"}`;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Ayuda</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Cómo hacer cada tarea, según tu rol
            {!cargando && misRoles.length > 0 && (
              <>
                {" "}· Tu rol: <span className="font-semibold text-zinc-600">{misRoles.join(" · ")}</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="print:hidden text-sm font-semibold text-zinc-700 border border-zinc-200 bg-white px-4 py-2 rounded-xl hover:bg-zinc-50"
        >
          Imprimir
        </button>
      </div>

      <div className="print:hidden flex flex-wrap items-center gap-2 mb-4">
        {misRoles.length > 0 && !esAdmin && (
          <button onClick={() => setVista("mis")} className={chip(vista === "mis")}>
            Mi rol
          </button>
        )}
        {(esAdmin ? ROLES : misRoles.length > 1 ? misRoles : []).map((r) => (
          <button key={r} onClick={() => setVista(r)} className={chip(vista === r)}>
            {r}
          </button>
        ))}
        <button onClick={() => setVista("todo")} className={chip(vista === "todo")}>
          Todo el manual
        </button>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar en la ayuda…"
          className="ml-auto py-2 px-3 text-sm bg-white border border-zinc-200 rounded-xl w-64 max-w-full placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
        />
      </div>

      {/* Guía del rol: qué haces y qué puedes hacer */}
      {!buscando &&
        rolesConGuia.map((r) => (
          <div key={r} className="bg-zinc-900 text-white rounded-2xl p-5 mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">Tu guía · {r}</p>
            <p className="text-sm text-zinc-200">{GUIA_ROLES[r].descripcion}</p>
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-300 list-disc pl-5">
              {GUIA_ROLES[r].tareas.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}

      {cargando && <p className="text-sm text-zinc-400">Cargando…</p>}
      {!cargando && temas.length === 0 && <p className="text-sm text-zinc-400 py-8 text-center">No encontré nada con esa búsqueda. Prueba con otra palabra o abre “Todo el manual”.</p>}

      <div className="space-y-3 max-w-4xl">
        {temas.map((t) => {
          const abiertoAhora = abierto === t.id || buscando;
          return (
            <section key={t.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden break-inside-avoid">
              <button
                onClick={() => setAbierto(abierto === t.id ? null : t.id)}
                className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 hover:bg-zinc-50 print:hover:bg-white"
                aria-expanded={abiertoAhora}
              >
                <span>
                  <span className="block text-base font-semibold text-zinc-900">{t.titulo}</span>
                  <span className="block text-sm text-zinc-400 mt-0.5">{t.resumen}</span>
                </span>
                <span className={`print:hidden text-zinc-400 transition-transform ${abiertoAhora ? "rotate-90" : ""}`}>›</span>
              </button>
              <div className={`${abiertoAhora ? "block" : "hidden"} print:block px-5 pb-5 border-t border-zinc-100`}>
                {t.bloques.map((b, i) => (
                  <div key={i} className="mt-4">
                    {b.titulo && <h3 className="text-sm font-bold text-zinc-900 mb-2">{b.titulo}</h3>}
                    {b.pasos && (
                      <ol className="space-y-2">
                        {b.pasos.map((p, j) => (
                          <li key={j} className="flex gap-3 text-sm text-zinc-700">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{j + 1}</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                    {b.notas && (
                      <ul className={`space-y-1.5 text-sm text-zinc-600 list-disc pl-5 ${b.pasos ? "mt-3 bg-zinc-50 rounded-xl py-3 pr-4" : ""}`}>
                        {b.notas.map((n, j) => (
                          <li key={j}>{n}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="print:hidden text-xs text-zinc-400 mt-6 max-w-4xl">
        ¿Algo no está claro o falta? Dile al administrador y se agrega a esta guía. Hay {TEMAS.length} temas en total.
      </p>
    </div>
  );
}
