"use client";

import { useState } from "react";

/* ── Types ── */
type PeriodId = "dia" | "semana" | "mes";

/* ── Data ── */
const weekBars = [
  { label: "Sem 1", value: 72,  display: "72K",  dark: false },
  { label: "Sem 2", value: 94,  display: "94K",  dark: false },
  { label: "Sem 3", value: 61,  display: "61K",  dark: false },
  { label: "Sem 4", value: 131, display: "131K", dark: true  },
  { label: "Sem 5", value: 54,  display: "54K",  dark: false },
];
const maxBar = Math.max(...weekBars.map((b) => b.value));

const topServices = [
  { name: "Tape-in",  count: 38 },
  { name: "Nano ring", count: 27 },
  { name: "Ponytail", count: 19 },
  { name: "Retoque",  count: 13 },
];

const stylistRevenue = [
  { name: "Mariana Ríos", amount: "RD$134K" },
  { name: "Sofía Luna",   amount: "RD$96K"  },
  { name: "Vanessa Gil",  amount: "RD$72K"  },
  { name: "Otras",        amount: "RD$110K" },
];

const origins = [
  { label: "Sitio web",  pct: 54 },
  { label: "App",        pct: 28 },
  { label: "Whatsapp",   pct: 18 },
];

/* ── Page ── */
export default function ReportesPage() {
  const [period, setPeriod] = useState<PeriodId>("mes");

  const periods: { id: PeriodId; label: string }[] = [
    { id: "dia",    label: "Día" },
    { id: "semana", label: "Semana" },
    { id: "mes",    label: "Mes" },
  ];

  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Reportes</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Agosto 2026</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          {/* Period tabs */}
          <div className="flex items-center bg-zinc-100 rounded-xl p-1">
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  period === p.id
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors">
            Exportar
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Facturado</p>
          <p className="text-2xl font-bold text-zinc-900">RD$412K</p>
          <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
            <span>↑</span> 18% vs. julio
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Servicios</p>
          <p className="text-2xl font-bold text-zinc-900">128</p>
          <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
            <span>↑</span> 11 servicios
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">RD$3,220</p>
          <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
            <span>↑</span> 4% vs. julio
          </p>
        </div>

        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Comisiones</p>
          <p className="text-2xl font-bold text-white">RD$75.6K</p>
          <p className="text-xs text-zinc-400 mt-1.5">16% del facturado</p>
        </div>
      </div>

      {/* ── Bar chart ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-bold text-zinc-900">Facturación por semana</h2>
          <span className="text-xs text-zinc-400">RD$ · agosto 2026</span>
        </div>

        {/* Bars — pixel heights so el porcentaje nunca depende de un flex sin altura definida */}
        <div className="flex gap-3" style={{ height: 160 }}>
          {weekBars.map((bar) => {
            const CHART_H = 160;
            const barH = Math.round((bar.value / maxBar) * CHART_H);
            const labelTop = CHART_H - barH - 22;
            return (
              <div key={bar.label} className="relative flex-1" style={{ height: CHART_H }}>
                {/* Value label just above the bar */}
                <span
                  className="absolute left-0 right-0 text-center text-xs font-semibold text-zinc-500"
                  style={{ top: Math.max(0, labelTop) }}
                >
                  {bar.display}
                </span>
                {/* Bar anchored to bottom */}
                <div
                  className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${bar.dark ? "bg-zinc-900" : "bg-zinc-200"}`}
                  style={{ height: barH }}
                />
              </div>
            );
          })}
        </div>

        {/* Week labels */}
        <div className="flex gap-3 mt-2.5">
          {weekBars.map((bar) => (
            <div key={bar.label} className="flex-1 text-center">
              <span className="text-xs text-zinc-400">{bar.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom 3 columns ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Servicios más solicitados */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Servicios más solicitados</h2>
          <div className="space-y-3">
            {topServices.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-700">{s.name}</span>
                <span className="text-sm font-semibold text-zinc-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingreso por estilista */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Ingreso por estilista</h2>
          <div className="space-y-3">
            {stylistRevenue.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-700">{s.name}</span>
                <span className="text-sm font-semibold text-zinc-900">{s.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Origen de las citas */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-4">Origen de las citas</h2>
          <div className="space-y-4">
            {origins.map((o) => (
              <div key={o.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-700">{o.label}</span>
                  <span className="text-sm font-semibold text-zinc-900">{o.pct}%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 rounded-full"
                    style={{ width: `${o.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
