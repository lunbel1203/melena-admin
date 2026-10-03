"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { addDays, startOfWeekMonday, toISODate } from "@/lib/dates";

type PeriodId = "dia" | "semana" | "mes";

type FacturaRow = {
  id: string;
  cobrada_at: string;
  subtotal: number;
  itbis: number;
  total: number;
  metodo_pago: string | null;
  clientas: { nombre: string } | null;
  lineas_factura: {
    tipo: "servicio" | "producto";
    descripcion: string;
    cantidad: number;
    subtotal: number;
    porcentaje_comision: number;
    empleado_id: string;
    empleados: { nombre: string } | null;
  }[];
};

type Rango = { inicio: Date; fin: Date; label: string; anterior: { inicio: Date; fin: Date }; vs: string; barTitle: string };

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const ORIGENES: Record<string, string> = { web: "Sitio web", app: "App", whatsapp: "WhatsApp", panel: "Recepción", sin: "Sin registrar" };

const rd = (n: number) => `RD$${Math.round(n).toLocaleString("es-DO")}`;
const compacto = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${Math.round(n / 1000)}K` : `${Math.round(n)}`);
const compactoRD = (n: number) => (n >= 10_000 ? `RD$${compacto(n)}` : rd(n));
const bruto = (f: Pick<FacturaRow, "subtotal" | "itbis">) => Number(f.subtotal) + Number(f.itbis);

function rangos(periodo: PeriodId, hoy: Date): Rango {
  const h0 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  if (periodo === "dia") {
    const ayer = addDays(h0, -1);
    return {
      inicio: h0, fin: addDays(h0, 1), anterior: { inicio: ayer, fin: h0 }, vs: "ayer", barTitle: "Facturación por hora",
      label: h0.toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    };
  }
  if (periodo === "semana") {
    const lunes = startOfWeekMonday(h0);
    const fin = addDays(lunes, 7);
    return {
      inicio: lunes, fin, anterior: { inicio: addDays(lunes, -7), fin: lunes }, vs: "semana pasada", barTitle: "Facturación por día",
      label: `Semana del ${lunes.getDate()} al ${addDays(fin, -1).getDate()} de ${MESES[addDays(fin, -1).getMonth()]} ${fin.getFullYear()}`,
    };
  }
  const inicio = new Date(h0.getFullYear(), h0.getMonth(), 1);
  const fin = new Date(h0.getFullYear(), h0.getMonth() + 1, 1);
  const prev = new Date(h0.getFullYear(), h0.getMonth() - 1, 1);
  return {
    inicio, fin, anterior: { inicio: prev, fin: inicio }, vs: MESES[prev.getMonth()], barTitle: "Facturación por semana",
    label: `${MESES[h0.getMonth()][0].toUpperCase()}${MESES[h0.getMonth()].slice(1)} ${h0.getFullYear()}`,
  };
}

function resumir(rows: FacturaRow[]) {
  const lineas = rows.flatMap((f) => f.lineas_factura);
  const facturado = rows.reduce((s, f) => s + bruto(f), 0);
  const servicios = lineas.filter((l) => l.tipo === "servicio").reduce((s, l) => s + l.cantidad, 0);
  const comisiones = lineas.reduce((s, l) => s + (Number(l.subtotal) * Number(l.porcentaje_comision)) / 100, 0);
  return { facturado, servicios, comisiones, ticket: rows.length ? facturado / rows.length : 0, facturas: rows.length };
}

function variacion(actual: number, previo: number) {
  if (previo === 0) return actual === 0 ? null : { texto: "sin datos del período anterior", up: true, neutro: true };
  const pct = Math.round(((actual - previo) / previo) * 100);
  return { texto: `${Math.abs(pct)}%`, up: pct >= 0, neutro: pct === 0 };
}

function Delta({ v, vs }: { v: ReturnType<typeof variacion>; vs: string }) {
  if (!v) return <p className="text-xs text-zinc-400 mt-1.5">Sin movimiento</p>;
  if (v.neutro && v.texto.startsWith("sin")) return <p className="text-xs text-zinc-400 mt-1.5">Sin datos de {vs}</p>;
  return (
    <p className={`text-xs mt-1.5 flex items-center gap-1 ${v.up ? "text-emerald-600" : "text-red-500"}`}>
      <span>{v.up ? "↑" : "↓"}</span> {v.texto} vs. {vs}
    </p>
  );
}

function descargarCSV(rows: FacturaRow[], nombre: string) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lineas = [
    ["Fecha", "Hora", "Clienta", "Servicios", "Productos", "Subtotal", "ITBIS", "Total (antes de depósito)", "Método de pago"].map(esc).join(","),
    ...rows.map((f) => {
      const d = new Date(f.cobrada_at);
      return [
        toISODate(d),
        d.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" }),
        f.clientas?.nombre ?? "",
        f.lineas_factura.filter((l) => l.tipo === "servicio").map((l) => `${l.descripcion} x${l.cantidad}`).join("; "),
        f.lineas_factura.filter((l) => l.tipo === "producto").map((l) => `${l.descripcion} x${l.cantidad}`).join("; "),
        Number(f.subtotal),
        Number(f.itbis),
        bruto(f),
        f.metodo_pago ?? "",
      ].map(esc).join(",");
    }),
  ];
  const blob = new Blob(["﻿" + lineas.join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ── Page ── */
export default function ReportesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [period, setPeriod] = useState<PeriodId>("mes");
  const [rows, setRows] = useState<FacturaRow[] | null>(null);
  const [origenes, setOrigenes] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const rango = useMemo(() => rangos(period, new Date()), [period]);

  useEffect(() => {
    let vivo = true;
    setRows(null);
    (async () => {
      const desde = rango.anterior.inicio;
      const [f, c] = await Promise.all([
        supabase
          .from("facturas")
          .select(`id, cobrada_at, subtotal, itbis, total, metodo_pago, clientas ( nombre ),
            lineas_factura ( tipo, descripcion, cantidad, subtotal, porcentaje_comision, empleado_id, empleados ( nombre ) )`)
          .eq("estado", "cobrada")
          .gte("cobrada_at", desde.toISOString())
          .lt("cobrada_at", rango.fin.toISOString())
          .order("cobrada_at")
          .limit(5000),
        supabase
          .from("citas")
          .select("origen")
          .gte("fecha", toISODate(rango.inicio))
          .lt("fecha", toISODate(rango.fin))
          .neq("estado", "cancelada")
          .limit(5000),
      ]);
      if (!vivo) return;
      if (f.error || c.error) {
        setError((f.error ?? c.error)!.message);
        return;
      }
      const conteo: Record<string, number> = {};
      for (const r of c.data ?? []) conteo[r.origen ?? "sin"] = (conteo[r.origen ?? "sin"] ?? 0) + 1;
      setError(null);
      setOrigenes(conteo);
      setRows(f.data as unknown as FacturaRow[]);
    })();
    return () => { vivo = false; };
  }, [supabase, rango]);

  const periodo = useMemo(
    () => (rows ?? []).filter((f) => new Date(f.cobrada_at) >= rango.inicio),
    [rows, rango],
  );
  const previo = useMemo(
    () => (rows ?? []).filter((f) => new Date(f.cobrada_at) < rango.inicio),
    [rows, rango],
  );

  const actual = useMemo(() => resumir(periodo), [periodo]);
  const antes = useMemo(() => resumir(previo), [previo]);

  // Barras según el período
  const bars = useMemo(() => {
    const suma = new Map<number, number>();
    const idx = (d: Date) =>
      period === "dia" ? d.getHours()
      : period === "semana" ? (d.getDay() + 6) % 7
      : Math.floor((d.getDate() - 1) / 7);
    for (const f of periodo) suma.set(idx(new Date(f.cobrada_at)), (suma.get(idx(new Date(f.cobrada_at))) ?? 0) + bruto(f));

    let claves: number[];
    let etiqueta: (k: number) => string;
    if (period === "dia") {
      const horas = [...suma.keys()];
      const min = Math.min(8, ...horas);
      const max = Math.max(19, ...horas);
      claves = Array.from({ length: max - min + 1 }, (_, i) => min + i);
      etiqueta = (k) => `${k % 12 === 0 ? 12 : k % 12}${k < 12 ? "a" : "p"}`;
    } else if (period === "semana") {
      claves = [0, 1, 2, 3, 4, 5, 6];
      etiqueta = (k) => ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][k];
    } else {
      const ultimo = new Date(rango.fin.getFullYear(), rango.fin.getMonth(), 0).getDate();
      claves = Array.from({ length: Math.ceil(ultimo / 7) }, (_, i) => i);
      etiqueta = (k) => `Sem ${k + 1}`;
    }
    const valores = claves.map((k) => ({ label: etiqueta(k), value: suma.get(k) ?? 0 }));
    const maximo = Math.max(...valores.map((v) => v.value));
    return { valores, maximo };
  }, [periodo, period, rango]);

  const topServicios = useMemo(() => {
    const m = new Map<string, number>();
    for (const l of periodo.flatMap((f) => f.lineas_factura)) {
      if (l.tipo === "servicio") m.set(l.descripcion, (m.get(l.descripcion) ?? 0) + l.cantidad);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [periodo]);

  const porEstilista = useMemo(() => {
    const m = new Map<string, { nombre: string; monto: number }>();
    for (const l of periodo.flatMap((f) => f.lineas_factura)) {
      const e = m.get(l.empleado_id) ?? { nombre: l.empleados?.nombre ?? "—", monto: 0 };
      e.monto += Number(l.subtotal);
      m.set(l.empleado_id, e);
    }
    const orden = [...m.values()].sort((a, b) => b.monto - a.monto);
    const top = orden.slice(0, 3);
    const resto = orden.slice(3).reduce((s, e) => s + e.monto, 0);
    return resto > 0 ? [...top, { nombre: "Otras", monto: resto }] : top;
  }, [periodo]);

  const totalCitas = Object.values(origenes).reduce((s, n) => s + n, 0);
  const listaOrigenes = Object.entries(origenes)
    .map(([k, n]) => ({ label: ORIGENES[k] ?? k, n, pct: Math.round((n / totalCitas) * 100) }))
    .sort((a, b) => b.n - a.n);

  const periods: { id: PeriodId; label: string }[] = [
    { id: "dia", label: "Día" },
    { id: "semana", label: "Semana" },
    { id: "mes", label: "Mes" },
  ];

  const cargando = rows === null && !error;
  const pctComision = actual.facturado > 0 ? Math.round((actual.comisiones / actual.facturado) * 100) : 0;
  const difServicios = actual.servicios - antes.servicios;

  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reportes</h1>
          <p className="text-sm text-zinc-400 mt-0.5 capitalize">{rango.label}</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <div className="flex items-center bg-zinc-100 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p.id ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => descargarCSV(periodo, `reporte-${period}-${toISODate(rango.inicio)}`)}
            disabled={periodo.length === 0}
            className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            Exportar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar el reporte: {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Facturado</p>
          <p className="text-2xl font-bold text-zinc-900">{cargando ? "—" : compactoRD(actual.facturado)}</p>
          {!cargando && <Delta v={variacion(actual.facturado, antes.facturado)} vs={rango.vs} />}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Servicios</p>
          <p className="text-2xl font-bold text-zinc-900">{cargando ? "—" : actual.servicios}</p>
          {!cargando && (
            <p className={`text-xs mt-1.5 ${difServicios > 0 ? "text-emerald-600" : difServicios < 0 ? "text-red-500" : "text-zinc-400"}`}>
              {difServicios === 0 ? `Igual que ${rango.vs}` : `${difServicios > 0 ? "↑" : "↓"} ${Math.abs(difServicios)} vs. ${rango.vs}`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">{cargando ? "—" : rd(actual.ticket)}</p>
          {!cargando && <Delta v={variacion(actual.ticket, antes.ticket)} vs={rango.vs} />}
        </div>

        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Comisiones</p>
          <p className="text-2xl font-bold text-white">{cargando ? "—" : compactoRD(actual.comisiones)}</p>
          {!cargando && <p className="text-xs text-zinc-400 mt-1.5">{pctComision}% del facturado</p>}
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-zinc-900">{rango.barTitle}</h2>
          <span className="text-xs text-zinc-400">RD$</span>
        </div>

        <div className="flex gap-3" style={{ height: 160 }}>
          {bars.valores.map((bar) => {
            const CHART_H = 160;
            const barH = bars.maximo > 0 ? Math.max(bar.value > 0 ? 4 : 0, Math.round((bar.value / bars.maximo) * CHART_H)) : 0;
            const labelTop = CHART_H - barH - 22;
            const esMaximo = bar.value > 0 && bar.value === bars.maximo;
            return (
              <div key={bar.label} className="relative flex-1" style={{ height: CHART_H }}>
                {bar.value > 0 && (
                  <span
                    className="absolute left-0 right-0 text-center text-xs font-semibold text-zinc-500"
                    style={{ top: Math.max(0, labelTop) }}
                  >
                    {compacto(bar.value)}
                  </span>
                )}
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${esMaximo ? "bg-zinc-900" : "bg-zinc-200"}`}
                  style={{ height: barH }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-2.5">
          {bars.valores.map((bar) => (
            <div key={bar.label} className="flex-1 text-center">
              <span className="text-xs text-zinc-400">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom 3 columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Servicios más solicitados</h2>
          <div className="space-y-3">
            {!cargando && topServicios.length === 0 && <p className="text-sm text-zinc-400">Sin servicios cobrados en este período.</p>}
            {topServicios.map(([nombre, n]) => (
              <div key={nombre} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-700">{nombre}</span>
                <span className="text-sm font-semibold text-zinc-900">{n}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Ingreso por estilista</h2>
          <div className="space-y-3">
            {!cargando && porEstilista.length === 0 && <p className="text-sm text-zinc-400">Sin ingresos en este período.</p>}
            {porEstilista.map((s) => (
              <div key={s.nombre} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-700">{s.nombre}</span>
                <span className="text-sm font-semibold text-zinc-900">{compactoRD(s.monto)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Origen de las citas</h2>
          <div className="space-y-4">
            {!cargando && listaOrigenes.length === 0 && <p className="text-sm text-zinc-400">Sin citas en este período.</p>}
            {listaOrigenes.map((o) => (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-700">{o.label}</span>
                  <span className="text-sm font-semibold text-zinc-900">{o.pct}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-700 rounded-full" style={{ width: `${o.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
