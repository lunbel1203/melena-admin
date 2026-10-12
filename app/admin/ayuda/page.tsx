"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FECHA_MANUAL,
  GUIA_ROLES,
  ROLES,
  TEMAS_ACERCA,
  TEMAS_TECNICOS,
  TEMAS_TERMINOS,
  VERSION_MANUAL,
  paraQuien,
  temasParaRoles,
  type Rol,
  type Tema,
} from "@/lib/ayuda";
import { generarManualPdf, manualMarkdown } from "@/lib/manual-pdf";

type Pestana = "usuario" | "tecnico" | "terminos" | "acerca";

const PESTANAS: { id: Pestana; texto: string; soloAdmin?: boolean }[] = [
  { id: "usuario", texto: "Manual de usuario" },
  { id: "tecnico", texto: "Manual técnico", soloAdmin: true },
  { id: "terminos", texto: "Términos y condiciones" },
  { id: "acerca", texto: "Acerca de" },
];

const TITULOS: Record<Pestana, string> = {
  usuario: "Manual de usuario",
  tecnico: "Manual técnico",
  terminos: "Términos y condiciones",
  acerca: "Acerca de",
};

const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const textoDe = (t: Tema) =>
  sinTildes([t.titulo, t.resumen, ...t.bloques.flatMap((b) => [b.titulo ?? "", ...(b.pasos ?? []), ...(b.notas ?? [])])].join(" "));

/** Centro de ayuda: manual por rol con contenido a la izquierda, descarga en PDF e impresión. */
export default function AyudaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [pestana, setPestana] = useState<Pestana>("usuario");
  const [misRoles, setMisRoles] = useState<string[]>([]);
  const [esAdmin, setEsAdmin] = useState(false);
  const [cargando, setCargando] = useState(true);
  // "mis" = mis roles · "todo" = manual completo · o el nombre de un rol
  const [vista, setVista] = useState<string>("mis");
  const [busqueda, setBusqueda] = useState("");
  const [activo, setActivo] = useState<string>("");
  const docRef = useRef<HTMLDivElement>(null);

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
      setMisRoles([...new Set([principal, ...extras].filter((n): n is string => !!n))]);
      setEsAdmin(admin === true);
      setVista(admin === true ? "todo" : "mis");
      setCargando(false);
    })();
  }, [supabase]);

  const rolesVistos = vista === "mis" ? misRoles : vista === "todo" ? [] : [vista];

  const temas: Tema[] = useMemo(() => {
    const base =
      pestana === "usuario" ? temasParaRoles(rolesVistos, vista === "todo") : pestana === "tecnico" ? TEMAS_TECNICOS : pestana === "terminos" ? TEMAS_TERMINOS : TEMAS_ACERCA;
    const q = sinTildes(busqueda.trim());
    return q ? base.filter((t) => textoDe(t).includes(q)) : base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana, vista, misRoles, busqueda]);

  const numerado = pestana === "usuario" || pestana === "tecnico";
  const rolesConGuia = pestana === "usuario" && !busqueda.trim() ? rolesVistos.filter((r): r is Rol => (ROLES as readonly string[]).includes(r)) : [];

  // al cambiar de pestaña o filtro: arriba y primer capítulo activo
  useEffect(() => {
    docRef.current?.scrollTo({ top: 0 });
    setActivo(temas[0]?.id ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pestana, vista, busqueda]);

  // el capítulo que se está leyendo se resalta en el contenido
  useEffect(() => {
    const raiz = docRef.current;
    if (!raiz) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActivo(visible.target.id.replace("cap-", ""));
      },
      { root: raiz, rootMargin: "0px 0px -55% 0px", threshold: 0 },
    );
    raiz.querySelectorAll("section[id^='cap-']").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [temas, pestana]);

  const ir = useCallback((id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function descargarPdf() {
    generarManualPdf({
      titulo: TITULOS[pestana],
      version: VERSION_MANUAL,
      fecha: FECHA_MANUAL,
      temas,
      nombreArchivo: `melena-${pestana === "usuario" ? "manual-de-usuario" : pestana}.pdf`,
    });
  }

  function descargarTexto() {
    const md = manualMarkdown(TITULOS[pestana], VERSION_MANUAL, FECHA_MANUAL, temas);
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `melena-${pestana === "usuario" ? "manual-de-usuario" : pestana}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const boton = "inline-flex items-center gap-2 text-sm font-semibold px-3.5 py-2 rounded-lg border transition-colors";

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8 print:bg-white print:p-0">
      {/* Migas */}
      <nav className="print:hidden flex items-center gap-2 text-xs text-zinc-400 mb-3">
        <Link href="/admin/resumen" className="hover:text-zinc-700">Inicio</Link>
        <span>›</span>
        <span>Ayuda</span>
        <span>›</span>
        <span className="text-zinc-700 font-medium">Centro de ayuda</span>
      </nav>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Centro de ayuda</h1>
          <p className="text-sm text-zinc-400 mt-1">Manuales del sistema: léalos aquí o descárguelos en PDF.</p>
        </div>
        <div className="print:hidden flex items-center gap-2 flex-wrap">
          <button onClick={() => window.print()} className={`${boton} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}>
            Imprimir
          </button>
          <button onClick={descargarTexto} className={`${boton} border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}>
            Descargar
          </button>
          <button onClick={descargarPdf} className={`${boton} border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700`}>
            Descargar PDF
          </button>
        </div>
      </div>

      {/* Pestañas */}
      <div className="print:hidden flex items-center gap-2 flex-wrap mb-5">
        {PESTANAS.filter((p) => !p.soloAdmin || esAdmin).map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setPestana(p.id);
              setBusqueda("");
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${pestana === p.id ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}
          >
            {p.texto}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">
        {/* ── Contenido ── */}
        <aside className="print:hidden bg-white rounded-2xl border border-zinc-200 overflow-hidden lg:sticky lg:top-4">
          <div className="px-4 py-3.5 border-b border-zinc-100 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" />
            </svg>
            <span className="text-sm font-bold text-zinc-900">Contenido</span>
          </div>
          <div className="p-3 space-y-2.5 border-b border-zinc-100">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en el manual…"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg placeholder:text-zinc-400 focus:outline-none focus:border-zinc-500"
            />
            {pestana === "usuario" && (
              <label className="block">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">Ver ayuda de</span>
                <select
                  value={vista}
                  onChange={(e) => setVista(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                >
                  {!esAdmin && misRoles.length > 0 && <option value="mis">Mi rol ({misRoles.join(" · ")})</option>}
                  {(esAdmin ? ROLES : misRoles.length > 1 ? misRoles : []).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                  <option value="todo">Todo el manual</option>
                </select>
              </label>
            )}
          </div>
          <nav className="max-h-[calc(100vh-380px)] min-h-40 overflow-y-auto py-2">
            <button onClick={() => ir("introduccion")} className={`w-full text-left px-4 py-1.5 text-sm ${activo === "introduccion" ? "text-zinc-900 font-semibold" : "text-zinc-600 hover:text-zinc-900"}`}>
              Introducción
            </button>
            {temas.map((t, i) => (
              <div key={t.id} className="mt-1">
                <button
                  onClick={() => ir(`cap-${t.id}`)}
                  className={`w-full text-left px-4 py-1.5 text-sm rounded-md ${activo === t.id ? "bg-zinc-100 text-zinc-900 font-semibold" : "text-zinc-700 hover:bg-zinc-50"}`}
                >
                  {numerado ? `${i + 1}. ` : ""}{t.titulo}
                </button>
                {activo === t.id &&
                  t.bloques
                    .filter((b) => b.titulo)
                    .map((b, j) => (
                      <button key={j} onClick={() => ir(`cap-${t.id}-${j}`)} className="w-full text-left pl-8 pr-4 py-1 text-xs text-zinc-500 hover:text-zinc-900">
                        {b.titulo}
                      </button>
                    ))}
              </div>
            ))}
            {!cargando && temas.length === 0 && <p className="px-4 py-3 text-xs text-zinc-400">No encontré nada con esa búsqueda.</p>}
          </nav>
        </aside>

        {/* ── Documento ── */}
        <article className="bg-white rounded-2xl border border-zinc-200 overflow-hidden print:border-0 print:rounded-none">
          <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-zinc-100">
            <span className="text-sm font-bold text-zinc-900">{TITULOS[pestana]}</span>
            <span className="text-xs text-zinc-400">Versión {VERSION_MANUAL}</span>
          </header>

          <div ref={docRef} className="lg:max-h-[calc(100vh-250px)] overflow-y-auto print:max-h-none print:overflow-visible px-5 sm:px-8 py-6 scroll-smooth">
            <div className="max-w-3xl">
              {cargando && <p className="text-sm text-zinc-400">Cargando…</p>}

              <section id="introduccion">
                <h2 className="text-2xl font-bold text-zinc-900 pb-2 border-b border-zinc-200">Introducción</h2>
                <div className="mt-4 rounded-lg border-l-4 border-zinc-900 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                  {pestana === "usuario" && (
                    <>
                      Guías cortas por módulo, <strong>según tu rol</strong>. Cada persona ve solo los módulos y botones que permite su rol; si falta una opción, pídele el permiso
                      al administrador. También puedes descargar este manual en PDF o imprimirlo con los botones de arriba.
                    </>
                  )}
                  {pestana === "tecnico" && <>Para administración: cómo está armado el sistema, cómo se actualiza y cómo resolver los problemas técnicos más comunes. No incluye contraseñas ni claves.</>}
                  {pestana === "terminos" && <>Normas para el equipo que usa el panel y la app del personal. Úsalo como referencia al incorporar a una persona nueva.</>}
                  {pestana === "acerca" && <>Información general de la plataforma de Melena.</>}
                </div>

                {rolesConGuia.map((r) => (
                  <div key={r} className="mt-4 rounded-xl bg-zinc-900 text-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">Tu guía · {r}</p>
                    <p className="text-sm text-zinc-200">{GUIA_ROLES[r].descripcion}</p>
                    <ul className="mt-3 space-y-1.5 text-sm text-zinc-300 list-disc pl-5">
                      {GUIA_ROLES[r].tareas.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                {numerado && temas.length > 0 && (
                  <div className="mt-5 overflow-hidden rounded-lg border border-zinc-200">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-500">
                        <tr>
                          <th className="text-left font-semibold px-4 py-2.5 w-12">#</th>
                          <th className="text-left font-semibold px-4 py-2.5">Módulo</th>
                          <th className="text-left font-semibold px-4 py-2.5">Para quién</th>
                        </tr>
                      </thead>
                      <tbody>
                        {temas.map((t, i) => (
                          <tr key={t.id} className="border-t border-zinc-100">
                            <td className="px-4 py-2.5 text-zinc-500">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => ir(`cap-${t.id}`)} className="text-left font-medium text-zinc-900 underline-offset-2 hover:underline">
                                {t.titulo}
                              </button>
                            </td>
                            <td className="px-4 py-2.5 text-zinc-600">{paraQuien(t)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {temas.map((t, i) => (
                <section key={t.id} id={`cap-${t.id}`} className="mt-10 scroll-mt-4 break-inside-avoid-page">
                  <h2 className="text-2xl font-bold text-zinc-900 pb-2 border-b border-zinc-200">
                    {numerado ? `${i + 1}. ` : ""}{t.titulo}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-2">Para quién: {paraQuien(t)}</p>
                  <p className="text-sm text-zinc-600 mt-2">{t.resumen}</p>

                  {t.bloques.map((b, j) => (
                    <div key={j} id={`cap-${t.id}-${j}`} className="mt-5 scroll-mt-4">
                      {b.titulo && <h3 className="text-base font-bold text-zinc-900 mb-2">{b.titulo}</h3>}
                      {b.pasos && (
                        <ol className="space-y-2.5">
                          {b.pasos.map((p, k) => (
                            <li key={k} className="flex gap-3 text-sm text-zinc-700">
                              <span className="shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center mt-0.5">{k + 1}</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ol>
                      )}
                      {b.notas && (
                        <ul className={`space-y-1.5 text-sm text-zinc-600 list-disc pl-5 ${b.pasos ? "mt-3 rounded-lg bg-zinc-50 py-3 pr-4" : ""}`}>
                          {b.notas.map((n, k) => (
                            <li key={k}>{n}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </section>
              ))}

              <p className="print:hidden text-xs text-zinc-400 mt-10 pb-4">
                ¿Algo no está claro o falta? Díselo al administrador y se agrega a este manual. · Versión {VERSION_MANUAL} · {FECHA_MANUAL}
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
