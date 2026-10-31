"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { soloTelefono } from "@/lib/telefono";
import { avisar } from "@/lib/alerts";

type Linea = { tipo: "servicio" | "producto" | "libre"; descripcion: string; cantidad: number; precio_unitario: number };
type Opcion = { key: string; tipo: "servicio" | "producto"; descripcion: string; detalle: string; precio: number };
type ClientaRes = { id: string; nombre: string; telefono: string | null };
type Tab = "servicios" | "cabello" | "libre";

const rd = (n: number) => `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dinero = (t: string) => Number(t.replace(/[^\d.]/g, "")) || 0;
const sinTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const hoyMas = (dias: number) => { const d = new Date(); d.setDate(d.getDate() + dias); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

function Formulario() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const id = useSearchParams().get("id");

  const [clientaId, setClientaId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClientaRes[]>([]);
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [descuento, setDescuento] = useState("");
  const [deposito, setDeposito] = useState("");
  const [dias, setDias] = useState<number | null>(15);
  const [vigenciaFija, setVigenciaFija] = useState<string | null>(null);
  const [notas, setNotas] = useState("");
  const [catalogo, setCatalogo] = useState<{ servicios: Opcion[]; cabello: Opcion[] }>({ servicios: [], cabello: [] });
  const [tab, setTab] = useState<Tab>("servicios");
  const [q, setQ] = useState("");
  const [libre, setLibre] = useState({ descripcion: "", precio: "" });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [sv, pr] = await Promise.all([
        supabase.from("servicios").select("id, nombre, categoria, precio").eq("activo", true).eq("es_sin_definir", false).order("nombre"),
        supabase.from("productos").select("id, nombre, categoria, color, largo_pulgadas, precio").eq("activo", true).order("categoria").order("color").order("largo_pulgadas"),
      ]);
      setCatalogo({
        servicios: (sv.data ?? []).map((s) => ({ key: s.id, tipo: "servicio" as const, descripcion: s.nombre, detalle: s.categoria ?? "", precio: Number(s.precio) })),
        cabello: (pr.data ?? []).map((p) => ({ key: p.id, tipo: "producto" as const, descripcion: [p.categoria, p.color, p.largo_pulgadas ? `${p.largo_pulgadas}"` : null].filter(Boolean).join(" ") || p.nombre, detalle: p.nombre, precio: Number(p.precio) })),
      });
      if (id) {
        const { data } = await supabase.from("cotizaciones" as never).select("*, cotizacion_lineas ( tipo, descripcion, cantidad, precio_unitario, orden )").eq("id", id).maybeSingle();
        const c = data as unknown as { clienta_id: string | null; nombre_cliente: string; telefono: string | null; vigencia: string | null; deposito_monto: number; descuento: number; notas: string | null; cotizacion_lineas: (Linea & { orden: number })[] } | null;
        if (c) {
          setClientaId(c.clienta_id); setNombre(c.nombre_cliente); setTelefono(c.telefono ?? "");
          setLineas([...c.cotizacion_lineas].sort((a, b) => a.orden - b.orden).map((l) => ({ tipo: l.tipo, descripcion: l.descripcion, cantidad: Number(l.cantidad), precio_unitario: Number(l.precio_unitario) })));
          setDescuento(c.descuento ? String(c.descuento) : ""); setDeposito(c.deposito_monto ? String(c.deposito_monto) : "");
          setVigenciaFija(c.vigencia); setDias(null); setNotas(c.notas ?? "");
        }
      }
    })();
  }, [supabase, id]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (busqueda.trim().length < 2) return setResultados([]);
      const { data } = await supabase.from("clientas").select("id, nombre, telefono").ilike("nombre", `%${busqueda.trim()}%`).order("nombre").limit(6);
      setResultados((data ?? []) as ClientaRes[]);
    }, 250);
    return () => clearTimeout(t);
  }, [supabase, busqueda]);

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0);
  const total = Math.max(subtotal - dinero(descuento), 0);
  const vigencia = dias ? hoyMas(dias) : vigenciaFija;
  const opciones = (tab === "servicios" ? catalogo.servicios : tab === "cabello" ? catalogo.cabello : []).filter((o) => sinTildes(`${o.descripcion} ${o.detalle}`).includes(sinTildes(q))).slice(0, 60);

  function agregar(l: Linea) {
    setLineas((prev) => {
      const i = prev.findIndex((x) => x.tipo === l.tipo && x.descripcion === l.descripcion && x.precio_unitario === l.precio_unitario);
      return i >= 0 ? prev.map((x, j) => (j === i ? { ...x, cantidad: x.cantidad + 1 } : x)) : [...prev, l];
    });
  }
  const cantidad = (i: number, delta: number) => setLineas((prev) => prev.flatMap((l, j) => (j !== i ? [l] : l.cantidad + delta <= 0 ? [] : [{ ...l, cantidad: l.cantidad + delta }])));

  async function guardar() {
    setError(null);
    if (!nombre.trim()) return setError("Escribe el nombre de la clienta o elige una existente.");
    if (lineas.length === 0) return setError("Agrega al menos un servicio o producto.");
    setGuardando(true);
    const { data, error: err } = await (supabase as unknown as { rpc: (f: string, a: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }> }).rpc("guardar_cotizacion", {
      p_id: id, p_clienta_id: clientaId, p_nombre_cliente: nombre.trim(), p_telefono: telefono || null, p_vigencia: vigencia,
      p_deposito_monto: dinero(deposito), p_descuento: dinero(descuento), p_notas: notas.trim() || null, p_lineas: lineas,
    });
    setGuardando(false);
    if (err) { setError(err.message); return void avisar("No se pudo guardar", err.message); }
    router.push(`/admin/cotizaciones/${data as string}`);
  }

  const campo = "w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400";
  const seccion = "bg-white rounded-2xl border border-zinc-200 p-5";

  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-5">
      <Link href="/admin/cotizaciones" className="text-sm text-zinc-500 hover:text-zinc-800">← Cotizaciones</Link>
      <h1 className="text-2xl font-semibold text-zinc-900">{id ? "Editar cotización" : "Nueva cotización"}</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className={seccion}>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Clienta</h2>
        {!clientaId && <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar una clienta existente" className={`${campo} mb-2`} />}
        {!clientaId && resultados.length > 0 && (
          <div className="mb-3 border border-zinc-100 rounded-xl divide-y divide-zinc-100">
            {resultados.map((c) => (
              <button key={c.id} type="button" onClick={() => { setClientaId(c.id); setNombre(c.nombre); setTelefono(c.telefono ?? ""); setBusqueda(""); setResultados([]); }} className="w-full text-left px-4 py-2.5 hover:bg-zinc-50">
                <div className="text-sm font-semibold text-zinc-900">{c.nombre}</div><div className="text-xs text-zinc-400">{c.telefono}</div>
              </button>
            ))}
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <input value={nombre} onChange={(e) => { setNombre(e.target.value); setClientaId(null); }} placeholder="Nombre" className={campo} />
          <input value={telefono} onChange={(e) => setTelefono(soloTelefono(e.target.value))} inputMode="numeric" placeholder="Teléfono (WhatsApp)" className={campo} />
        </div>
      </div>

      <div className={seccion}>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Agregar</h2>
        <div className="flex gap-2 mb-3">
          {(["servicios", "cabello", "libre"] as Tab[]).map((t) => (
            <button key={t} type="button" onClick={() => { setTab(t); setQ(""); }} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${tab === t ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>{t === "servicios" ? "Servicios" : t === "cabello" ? "Cabello" : "Concepto libre"}</button>
          ))}
        </div>
        {tab === "libre" ? (
          <div className="flex flex-wrap gap-2">
            <input value={libre.descripcion} onChange={(e) => setLibre((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Concepto" className={`${campo} flex-1 min-w-[200px]`} />
            <input value={libre.precio} onChange={(e) => setLibre((p) => ({ ...p, precio: e.target.value.replace(/[^\d.]/g, "") }))} inputMode="decimal" placeholder="Precio RD$" className={`${campo} w-36`} />
            <button type="button" disabled={!libre.descripcion.trim() || !dinero(libre.precio)} onClick={() => { agregar({ tipo: "libre", descripcion: libre.descripcion.trim(), cantidad: 1, precio_unitario: dinero(libre.precio) }); setLibre({ descripcion: "", precio: "" }); }} className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold disabled:opacity-40">Agregar</button>
          </div>
        ) : (
          <>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tab === "servicios" ? "Buscar servicio" : "Buscar color o largo"} className={`${campo} mb-2`} />
            <div className="max-h-64 overflow-y-auto border border-zinc-100 rounded-xl divide-y divide-zinc-100">
              {opciones.length === 0 && <p className="p-4 text-sm text-zinc-400">Sin resultados.</p>}
              {opciones.map((o) => (
                <button key={o.key} type="button" onClick={() => agregar({ tipo: o.tipo, descripcion: o.descripcion, cantidad: 1, precio_unitario: o.precio })} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-zinc-50">
                  <span><span className="block text-sm font-semibold text-zinc-900">{o.descripcion}</span>{o.detalle && <span className="block text-xs text-zinc-400">{o.detalle}</span>}</span>
                  <span className="text-sm font-semibold text-zinc-900">{o.precio > 0 ? rd(o.precio) : "—"}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={seccion}>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Detalle</h2>
        {lineas.length === 0 ? <p className="text-sm text-zinc-400">Aún no hay líneas.</p> : (
          <div className="divide-y divide-zinc-100">
            {lineas.map((l, i) => (
              <div key={`${l.descripcion}-${i}`} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-zinc-900 truncate">{l.descripcion}</div><div className="text-xs text-zinc-400">{rd(l.precio_unitario)} c/u</div></div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => cantidad(i, -1)} className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50" aria-label="Una menos">−</button>
                  <span className="w-7 text-center text-sm font-semibold">{l.cantidad}</span>
                  <button type="button" onClick={() => cantidad(i, 1)} className="w-8 h-8 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50" aria-label="Una más">+</button>
                </div>
                <div className="w-28 text-right text-sm font-semibold text-zinc-900">{rd(l.cantidad * l.precio_unitario)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={seccion}>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Condiciones</h2>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <input value={descuento} onChange={(e) => setDescuento(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="Descuento RD$" className={campo} />
          <input value={deposito} onChange={(e) => setDeposito(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" placeholder="Depósito para apartar RD$" className={campo} />
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {[7, 15, 30].map((d) => <button key={d} type="button" onClick={() => setDias(d)} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${dias === d ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-600"}`}>Válida {d} días</button>)}
          <button type="button" onClick={() => { setDias(null); setVigenciaFija(null); }} className={`px-3.5 py-1.5 rounded-full text-sm font-medium border ${dias === null && !vigenciaFija ? "bg-zinc-900 text-white border-zinc-900" : "border-zinc-200 text-zinc-600"}`}>Sin vencimiento</button>
        </div>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} placeholder="Notas para la clienta" className={campo} />
      </div>

      <div className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-zinc-200 p-5">
        <div><div className="text-xs text-zinc-400">Total</div><div className="text-2xl font-semibold text-zinc-900">{rd(total)}</div></div>
        <button type="button" onClick={() => void guardar()} disabled={guardando} className="px-6 py-3 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 disabled:opacity-50">{guardando ? "Guardando…" : "Guardar cotización"}</button>
      </div>
    </div>
  );
}

export default function NuevaCotizacionPage() {
  return <Suspense fallback={<div className="p-8 text-sm text-zinc-400">Cargando…</div>}><Formulario /></Suspense>;
}
