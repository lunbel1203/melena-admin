"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avisar, confirmar, enlaceWhatsApp } from "@/lib/alerts";
import { parseISODate, toISODate } from "@/lib/dates";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

type EstadoOrden = "pendiente" | "en_transito" | "recibida" | "cancelada";

type Orden = {
  id: string;
  fecha: string;
  estado: EstadoOrden;
  total: number;
  notas: string | null;
  ordenes_compra_lineas: { descripcion: string; cantidad: number; costo_unitario: number }[];
};

type Producto = { id: string; nombre: string; costo: number | null; stock: number; stock_minimo: number; foto_url: string | null };

type Proveedor = {
  id: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  activo: boolean;
  created_at: string;
  categoria: string;
  rnc: string | null;
  pais: string;
  moneda: string;
  forma_pago: string;
  plazo_entrega: string;
  nota: string | null;
};

type LineaForm = { productoId: string; descripcion: string; cantidad: number; costo: number };

const ordenLabel: Record<EstadoOrden, string> = {
  pendiente: "Pendiente",
  en_transito: "En tránsito",
  recibida: "Recibida",
  cancelada: "Cancelada",
};

const ordenEstadoBadge: Record<EstadoOrden, string> = {
  recibida: "bg-green-50 text-green-700",
  en_transito: "bg-orange-50 text-orange-600",
  pendiente: "bg-zinc-100 text-zinc-500",
  cancelada: "bg-red-50 text-red-600",
};

const rd = (n: number) => `RD$${n.toLocaleString("es-DO", { maximumFractionDigits: 2 })}`;
const rdCompacto = (n: number) => (n >= 10_000 ? `RD$${Math.round(n / 1000)}K` : rd(Math.round(n)));

function fechaCorta(iso: string) {
  const d = parseISODate(iso);
  return d.toLocaleDateString("es-DO", d.getFullYear() === new Date().getFullYear() ? { day: "numeric", month: "short" } : { month: "short", year: "numeric" });
}

const inputCls = "w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400";

export default function ProveedorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: id } = use(params);
  const supabase = useMemo(() => createClient(), []);

  const [prov, setProv] = useState<Proveedor | null>(null);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  // Registrar orden
  const [abierto, setAbierto] = useState(false);
  const [catalogo, setCatalogo] = useState<Producto[]>([]);
  const [fecha, setFecha] = useState(() => toISODate(new Date()));
  const [estadoInicial, setEstadoInicial] = useState<"pendiente" | "en_transito" | "recibida">("pendiente");
  const [notas, setNotas] = useState("");
  const [lineas, setLineas] = useState<LineaForm[]>([{ productoId: "", descripcion: "", cantidad: 1, costo: 0 }]);

  const cargar = useCallback(async () => {
    const [p, o, pr] = await Promise.all([
      supabase.from("proveedores").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("ordenes_compra")
        .select("id, fecha, estado, total, notas, ordenes_compra_lineas ( descripcion, cantidad, costo_unitario )")
        .eq("proveedor_id", id)
        .order("fecha", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase.from("productos").select("id, nombre, costo, stock, stock_minimo, foto_url").eq("proveedor_id", id).order("nombre"),
    ]);
    if (p.error || o.error || pr.error) {
      setError((p.error ?? o.error ?? pr.error)!.message);
      setCargando(false);
      return;
    }
    setProv(p.data as Proveedor | null);
    setOrdenes((o.data ?? []) as unknown as Orden[]);
    setProductos((pr.data ?? []).map((x) => ({ ...x, costo: x.costo === null ? null : Number(x.costo) })));
    setError(null);
    setCargando(false);
  }, [supabase, id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  const stats = useMemo(() => {
    const anio = `${new Date().getFullYear()}-01-01`;
    const delAnio = ordenes.filter((o) => o.fecha >= anio && o.estado !== "cancelada");
    const recibidas = delAnio.filter((o) => o.estado === "recibida");
    const unidades = recibidas.reduce((s, o) => s + o.ordenes_compra_lineas.reduce((a, l) => a + l.cantidad, 0), 0);
    const gastoRecibido = recibidas.reduce((s, o) => s + Number(o.total), 0);
    return {
      ordenes: delAnio.length,
      unidades,
      costoPromedio: unidades > 0 ? gastoRecibido / unidades : 0,
      compras: delAnio.reduce((s, o) => s + Number(o.total), 0),
    };
  }, [ordenes]);

  async function abrirRegistro() {
    setAbierto(true);
    if (catalogo.length > 0) return;
    const { data } = await supabase.from("productos").select("id, nombre, costo, stock, stock_minimo, foto_url").eq("activo", true).order("nombre");
    setCatalogo((data ?? []).map((x) => ({ ...x, costo: x.costo === null ? null : Number(x.costo) })));
  }

  function setLinea(i: number, cambios: Partial<LineaForm>) {
    setLineas((prev) => prev.map((l, k) => (k === i ? { ...l, ...cambios } : l)));
  }

  function elegirProducto(i: number, productoId: string) {
    const p = catalogo.find((x) => x.id === productoId);
    setLinea(i, { productoId, descripcion: p?.nombre ?? "", costo: p?.costo ?? 0 });
  }

  const totalForm = lineas.reduce((s, l) => s + l.cantidad * l.costo, 0);

  async function registrar() {
    const validas = lineas.filter((l) => l.productoId || l.descripcion.trim());
    if (validas.length === 0 || validas.some((l) => l.cantidad < 1 || l.costo < 0)) {
      await avisar("Revisa las líneas", "Cada línea necesita un producto o descripción, cantidad y costo.");
      return;
    }
    setProcesando(true);
    const { error } = await supabase.rpc("crear_orden_compra", {
      p_proveedor_id: id,
      p_fecha: fecha,
      p_estado: estadoInicial,
      p_notas: notas,
      p_lineas: validas.map((l) => ({
        producto_id: l.productoId || null,
        descripcion: l.descripcion.trim(),
        cantidad: l.cantidad,
        costo_unitario: l.costo,
      })),
    });
    if (error) {
      await avisar("No se pudo registrar la orden", error.message);
    } else {
      setAbierto(false);
      setLineas([{ productoId: "", descripcion: "", cantidad: 1, costo: 0 }]);
      setNotas("");
      setEstadoInicial("pendiente");
      await cargar();
    }
    setProcesando(false);
  }

  async function cambiarEstado(o: Orden, estado: "en_transito" | "recibida" | "cancelada") {
    const textos = {
      en_transito: ["¿Marcar como en tránsito?", "Confirmar"],
      recibida: ["¿Marcar como recibida?", "Se suma lo recibido al inventario y se actualiza el costo de cada producto."],
      cancelada: ["¿Cancelar esta orden?", "No se podrá revertir."],
    } as const;
    const ok = await confirmar({
      titulo: textos[estado][0],
      texto: estado === "en_transito" ? undefined : textos[estado][1],
      confirmarTexto: estado === "cancelada" ? "Cancelar orden" : "Confirmar",
      peligroso: estado === "cancelada",
    });
    if (!ok) return;
    setProcesando(true);
    const { error } = await supabase.rpc("cambiar_estado_orden_compra", { p_orden_id: o.id, p_estado: estado });
    if (error) await avisar("No se pudo actualizar la orden", error.message);
    await cargar();
    setProcesando(false);
  }

  if (cargando) return <div className="min-h-full bg-zinc-50 p-8 text-sm text-zinc-400">Cargando…</div>;

  if (!prov) {
    return (
      <div className="min-h-full bg-zinc-50 p-8">
        <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 mb-4 transition-colors">
          <ChevronLeft /> Proveedores
        </Link>
        <p className="text-sm text-zinc-500">{error ? `No se pudo cargar: ${error}` : "Proveedor no encontrado."}</p>
      </div>
    );
  }

  const abiertas = ordenes.some((o) => o.estado === "pendiente" || o.estado === "en_transito");
  const estado = !prov.activo ? "Inactivo" : abiertas ? "Por recibir" : "Activo";
  const estadoBadge: Record<string, string> = {
    Activo: "bg-green-50 text-green-700",
    "Por recibir": "bg-orange-50 text-orange-600",
    Inactivo: "bg-zinc-100 text-zinc-500",
  };
  const desde = new Date(prov.created_at).toLocaleDateString("es-DO", { month: "short", year: "numeric" });

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-4">
        <ChevronLeft />
        Proveedores
      </Link>

      {/* ── Hero ── */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-600 shrink-0">
          {prov.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-900">{prov.nombre}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoBadge[estado]}`}>{estado}</span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">
            {prov.categoria} · {prov.pais} · desde {desde}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/admin/proveedores/${prov.id}/editar`} className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Editar
          </Link>
          <button onClick={abrirRegistro} className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
            Registrar orden
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Órdenes del año</p>
          <p className="text-3xl font-bold text-zinc-900">{stats.ordenes}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Unidades recibidas</p>
          <p className="text-3xl font-bold text-zinc-900">{stats.unidades}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Costo promedio</p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{stats.unidades > 0 ? rd(Math.round(stats.costoPromedio)) : "—"}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Compras del año</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{rdCompacto(stats.compras)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Órdenes de compra */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Órdenes de compra</h2>
            </div>

            <div className="hidden sm:grid grid-cols-[0.8fr_2fr_0.8fr_1fr_1.2fr] gap-x-4 px-5 sm:px-6 py-2.5 border-b border-zinc-100">
              {["Fecha", "Contenido", "Unidades", "Total", "Estado"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {ordenes.length === 0 && <p className="px-6 py-8 text-sm text-zinc-400">Aún no hay órdenes con este proveedor.</p>}

            {ordenes.map((o) => {
              const abierta = o.estado === "pendiente" || o.estado === "en_transito";
              return (
                <div key={o.id} className="px-5 sm:px-6 py-3.5 border-b border-zinc-100 last:border-0">
                  <div className="grid grid-cols-1 sm:grid-cols-[0.8fr_2fr_0.8fr_1fr_1.2fr] gap-x-4 gap-y-1 items-center">
                    <span className="text-sm text-zinc-500">{fechaCorta(o.fecha)}</span>
                    <span className="text-sm text-zinc-700 truncate" title={o.notas ?? undefined}>
                      {o.ordenes_compra_lineas.map((l) => l.descripcion).join(" · ")}
                    </span>
                    <span className="text-sm text-zinc-600">{o.ordenes_compra_lineas.reduce((s, l) => s + l.cantidad, 0)}</span>
                    <span className="text-sm font-semibold text-zinc-900">{rd(Number(o.total))}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${ordenEstadoBadge[o.estado]}`}>
                      {ordenLabel[o.estado]}
                    </span>
                  </div>
                  {abierta && (
                    <div className="flex gap-3 mt-2 text-xs font-semibold">
                      {o.estado === "pendiente" && (
                        <button onClick={() => cambiarEstado(o, "en_transito")} disabled={procesando} className="text-zinc-600 hover:text-zinc-900">
                          Marcar en tránsito
                        </button>
                      )}
                      <button onClick={() => cambiarEstado(o, "recibida")} disabled={procesando} className="text-green-700 hover:text-green-900">
                        Marcar recibida
                      </button>
                      <button onClick={() => cambiarEstado(o, "cancelada")} disabled={procesando} className="text-red-500 hover:text-red-700">
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Productos que suministra */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Productos que suministra</h2>
            </div>

            {productos.length === 0 && (
              <p className="px-6 py-8 text-sm text-zinc-400">
                Ningún producto del catálogo tiene a este proveedor asignado.
              </p>
            )}

            {productos.map((p) => {
              const bajo = p.stock <= p.stock_minimo;
              return (
                <div key={p.id} className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-zinc-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                    {p.foto_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.foto_url} alt={p.nombre} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      p.nombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 flex-1 min-w-0 truncate">{p.nombre}</span>
                  <span className="text-sm text-zinc-400">Costo {p.costo === null ? "—" : rd(p.costo)}</span>
                  <span className={`text-sm font-semibold ml-4 ${bajo ? "text-orange-500" : "text-zinc-500"}`}>
                    {p.stock} en stock
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:w-64 flex flex-col gap-4">

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Contacto</p>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-start gap-3">
                <span className="text-xs text-zinc-400">Persona</span>
                <span className="text-sm text-zinc-800 font-medium text-right">{prov.contacto ?? "—"}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="text-xs text-zinc-400">Teléfono</span>
                <span className="text-sm text-zinc-800 font-medium text-right">{prov.telefono ?? "—"}</span>
              </div>
              <div className="flex justify-between items-start gap-3">
                <span className="text-xs text-zinc-400">Correo</span>
                <span className="text-sm text-zinc-800 font-medium text-right break-all">{prov.email ?? "—"}</span>
              </div>
            </div>
            {prov.telefono && (
              <a
                href={enlaceWhatsApp(prov.telefono, "")}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl text-center hover:bg-zinc-100 transition-colors"
              >
                Escribir por WhatsApp
              </a>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Condiciones</p>
            <div className="space-y-2.5">
              {[
                ["Moneda", prov.moneda],
                ["Forma de pago", prov.forma_pago],
                ["Plazo de entrega", prov.plazo_entrega],
                ["RNC", prov.rnc ?? "N/A"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <span className="text-xs text-zinc-400">{k}</span>
                  <span className="text-sm text-zinc-800 font-medium text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Dirección</p>
            <p className="text-sm text-zinc-700 whitespace-pre-line">{prov.direccion ?? "—"}</p>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Nota interna</p>
            <p className="text-sm text-zinc-700">{prov.nota ?? "—"}</p>
          </div>
        </div>
      </div>

      {/* ── Registrar orden ── */}
      {abierto && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setAbierto(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <p className="text-base font-bold text-zinc-900">Registrar orden · {prov.nombre}</p>
              <button onClick={() => setAbierto(false)} className="text-zinc-400 hover:text-zinc-700 text-sm">Cerrar</button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Fecha</label>
                  <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Estado</label>
                  <select value={estadoInicial} onChange={(e) => setEstadoInicial(e.target.value as typeof estadoInicial)} className={inputCls}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_transito">En tránsito</option>
                    <option value="recibida">Ya recibida</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Líneas · montos en RD$</p>
                <div className="flex flex-col gap-3">
                  {lineas.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_64px_96px_auto] gap-2 items-start">
                      <div className="flex flex-col gap-1.5">
                        <select value={l.productoId} onChange={(e) => elegirProducto(i, e.target.value)} className={inputCls}>
                          <option value="">Otro (escribir descripción)</option>
                          {catalogo.map((p) => (
                            <option key={p.id} value={p.id}>{p.nombre}</option>
                          ))}
                        </select>
                        {!l.productoId && (
                          <input
                            value={l.descripcion}
                            onChange={(e) => setLinea(i, { descripcion: e.target.value })}
                            placeholder="Descripción"
                            className={inputCls}
                          />
                        )}
                      </div>
                      <input
                        type="number" min={1} value={l.cantidad} aria-label="Cantidad"
                        onChange={(e) => setLinea(i, { cantidad: Math.max(1, Math.floor(Number(e.target.value) || 1)) })}
                        className={inputCls}
                      />
                      <input
                        type="number" min={0} step="0.01" value={l.costo} aria-label="Costo unitario"
                        onChange={(e) => setLinea(i, { costo: Math.max(0, Number(e.target.value) || 0) })}
                        className={inputCls}
                      />
                      <button
                        onClick={() => setLineas((prev) => (prev.length > 1 ? prev.filter((_, k) => k !== i) : prev))}
                        className="px-2 py-2 text-sm text-zinc-400 hover:text-red-600"
                        aria-label="Quitar línea"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLineas((prev) => [...prev, { productoId: "", descripcion: "", cantidad: 1, costo: 0 }])}
                  className="mt-3 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  + Agregar línea
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Nota</label>
                <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
              </div>

              {estadoInicial === "recibida" && (
                <p className="text-xs text-zinc-500 bg-zinc-50 rounded-xl px-3 py-2">
                  Al registrarla como recibida se suma al inventario y se actualiza el costo de los productos.
                </p>
              )}
            </div>

            <div className="p-5 border-t border-zinc-100 flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-500">Total <strong className="text-zinc-900">{rd(totalForm)}</strong></span>
              <button
                onClick={registrar}
                disabled={procesando}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {procesando ? "Guardando…" : "Registrar orden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
