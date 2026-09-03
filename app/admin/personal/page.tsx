"use client";

import { useState } from "react";

/* ── Types ── */
type PeriodId = "semana" | "mes" | "año";

interface StaffMember {
  id: string;
  name: string;
  initial: string;
  specialty: string;
  role: string;
  services: number | null;
  billed: string | null;
  commission: string | null;
  commissionRaw: number;
  freeDays: number | null;
  blocked: boolean;
  blockedDays: number[];
}

/* ── Data ── */
const staffList: StaffMember[] = [
  {
    id: "p1",
    name: "Mariana Ríos", initial: "M",
    specialty: "Tape-in · nano ring",
    role: "Estilista",
    services: 42, billed: "RD$134,400", commission: "RD$33,600", commissionRaw: 33600,
    freeDays: 4, blocked: false,
    blockedDays: [14, 15, 21],
  },
  {
    id: "p2",
    name: "Sofía Luna", initial: "S",
    specialty: "Bulk · cortina",
    role: "Estilista",
    services: 31, billed: "RD$96,100", commission: "RD$24,025", commissionRaw: 24025,
    freeDays: 6, blocked: false,
    blockedDays: [7, 8, 22, 23],
  },
  {
    id: "p3",
    name: "Vanessa Gil", initial: "V",
    specialty: "Bulk · cortina",
    role: "Estilista",
    services: 24, billed: "RD$72,000", commission: "RD$18,000", commissionRaw: 18000,
    freeDays: 5, blocked: false,
    blockedDays: [20],
  },
  {
    id: "p4",
    name: "Camila Torres", initial: "C",
    specialty: "Recepción y caja",
    role: "Recepción",
    services: null, billed: null, commission: null, commissionRaw: 0,
    freeDays: null, blocked: true,
    blockedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
];

const MONTH_DAYS = 30; // September
const MONTH_NAME = "septiembre";
const TODAY = 3;

const stylists = staffList.filter((s) => s.commissionRaw > 0);
const maxCommission = Math.max(...stylists.map((s) => s.commissionRaw));
const totalCommission = "RD$75,625";

/* ── Page ── */
export default function PersonalPage() {
  const [period, setPeriod] = useState<PeriodId>("mes");
  const [selectedId, setSelectedId] = useState<string>("p1");
  const [selectedDay, setSelectedDay] = useState<number>(TODAY);
  const [blockedMap, setBlockedMap] = useState<Record<string, Set<number>>>(
    () => Object.fromEntries(staffList.map((s) => [s.id, new Set(s.blockedDays)]))
  );

  const selected = staffList.find((s) => s.id === selectedId) ?? staffList[0];
  const blocked = blockedMap[selectedId] ?? new Set<number>();

  const toggleDay = (day: number) => {
    setBlockedMap((prev) => {
      const next = new Set(prev[selectedId]);
      next.has(day) ? next.delete(day) : next.add(day);
      return { ...prev, [selectedId]: next };
    });
  };

  const periods: { id: PeriodId; label: string }[] = [
    { id: "semana", label: "Semana" },
    { id: "mes",    label: "Mes" },
    { id: "año",    label: "Año" },
  ];

  /* Calendar: rows of 7 */
  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Personal</h1>
          <p className="text-sm text-zinc-400 mt-1">Cada empleada ve su propio detalle desde la app.</p>
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
          <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
            + Empleada
          </button>
        </div>
      </div>

      {/* ── Staff table ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-5">
        {/* Column headers */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.2fr] gap-4 px-5 pt-4 pb-2.5 border-b border-zinc-100">
          {["Empleada", "Rol", "Servicios", "Facturado", "Comisión", "Disponibilidad"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {staffList.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { setSelectedId(s.id); setSelectedDay(TODAY); }}
              className={`w-full grid grid-cols-[2fr_1fr_1fr_1.3fr_1.3fr_1.2fr] gap-4 items-center px-5 py-4 text-left border-b border-zinc-100 last:border-0 transition-colors ${
                isSelected ? "bg-zinc-50" : "hover:bg-zinc-50/60"
              }`}
            >
              {/* Empleada */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                  {s.initial}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">{s.name}</p>
                  <p className="text-xs text-zinc-400 truncate">{s.specialty}</p>
                </div>
              </div>

              {/* Rol */}
              <span className="text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg inline-block w-fit">
                {s.role}
              </span>

              {/* Servicios */}
              <span className="text-sm text-zinc-700">{s.services ?? "—"}</span>

              {/* Facturado */}
              <span className="text-sm text-zinc-700">{s.billed ?? "—"}</span>

              {/* Comisión */}
              <span className="text-sm font-medium text-zinc-900">{s.commission ?? "—"}</span>

              {/* Disponibilidad */}
              {s.blocked ? (
                <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full inline-block w-fit">
                  Bloqueada
                </span>
              ) : (
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full inline-block w-fit whitespace-nowrap">
                  {s.freeDays} días libres
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Bottom row ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Calendar panel */}
        <div className="flex-1 bg-white rounded-2xl border border-zinc-200 p-5">
          {/* Panel header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-sm font-bold text-zinc-900">
              {selected.name}
              <span className="text-zinc-400 font-normal"> · {MONTH_NAME}</span>
            </h2>
            <button className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors whitespace-nowrap">
              Bloquear día
            </button>
          </div>

          {/* Calendar grid */}
          <div className="space-y-2 mb-4">
            {rows.map((row, ri) => (
              <div key={ri} className="flex gap-2">
                {row.map((day) => {
                  const isBlocked = blocked.has(day);
                  const isSelected = selectedDay === day;
                  const isToday = day === TODAY;
                  return (
                    <button
                      key={day}
                      onClick={() => { setSelectedDay(day); toggleDay(day); }}
                      className={`flex-1 aspect-square max-w-[40px] rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? "bg-zinc-900 text-white"
                          : isBlocked
                          ? "bg-zinc-200 text-zinc-400"
                          : isToday
                          ? "border-2 border-zinc-900 text-zinc-900"
                          : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
                {/* Fill last row */}
                {row.length < 7 &&
                  Array.from({ length: 7 - row.length }).map((_, i) => (
                    <div key={i} className="flex-1 max-w-[40px]" />
                  ))
                }
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
              <span className="w-3.5 h-3.5 rounded border border-zinc-300 bg-zinc-50 inline-block" />
              Disponible
            </label>
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
              <span className="w-3.5 h-3.5 rounded border border-zinc-300 bg-zinc-200 inline-block" />
              Bloqueado
            </label>
          </div>
        </div>

        {/* Commission chart */}
        <div className="lg:w-[320px] shrink-0 bg-white rounded-2xl border border-zinc-200 p-5">
          <h2 className="text-sm font-bold text-zinc-900 mb-5">Comisión por estilista</h2>

          <div className="space-y-4 mb-6">
            {stylists.map((s) => {
              const pct = (s.commissionRaw / maxCommission) * 100;
              return (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-700">{s.name}</span>
                    <span className="text-sm font-semibold text-zinc-900">{s.commission}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-700 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="border-t border-zinc-100 pt-4 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Total comisiones del mes</span>
            <span className="text-base font-bold text-zinc-900">{totalCommission}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
