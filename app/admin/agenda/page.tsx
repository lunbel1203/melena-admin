"use client";

import { useState } from "react";

/* ── Iconos ── */
function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 12l4-4-4-4" />
    </svg>
  );
}

/* ── Tipos ── */
type FilterId = "tape-in" | "nano-ring" | "otros";
type CardVariant = "normal" | "current" | "warning" | "blocked";

interface Appointment {
  id: string;
  time?: string;
  name: string;
  service: string;
  filter?: FilterId;
  variant?: CardVariant;
}

interface Day {
  abbr: string;
  num: string;
  isToday?: boolean;
  appointments: Appointment[];
}

/* ── Datos ── */
const serviceFilters: { id: FilterId; label: string; dotClass: string }[] = [
  { id: "tape-in",   label: "Tape-in",   dotClass: "bg-zinc-800" },
  { id: "nano-ring", label: "Nano ring", dotClass: "bg-zinc-500" },
  { id: "otros",     label: "Otros",     dotClass: "bg-zinc-300" },
];

const weekDays: Day[] = [
  {
    abbr: "LUN", num: "31",
    appointments: [
      { id: "a1", time: "09:00", name: "Camila Santos", service: "Retoque tape-in", filter: "tape-in" },
      { id: "a2", time: "13:30", name: "Mariana Díaz",  service: "Nano ring",       filter: "nano-ring" },
    ],
  },
  {
    abbr: "MAR", num: "01",
    appointments: [
      { id: "b1", time: "10:00", name: "Lucía Mejía", service: "Ponytail",  filter: "otros" },
      { id: "b2", time: "15:00", name: "Andrea Peña", service: "Tape-in",   filter: "tape-in" },
    ],
  },
  {
    abbr: "MIÉ", num: "02", isToday: true,
    appointments: [
      { id: "c1", time: "09:00", name: "Sofía Guerrero",  service: "Nano ring",           filter: "nano-ring" },
      { id: "c2", time: "11:00", name: "Valentina Reyes", service: 'Tape-in 20"',          filter: "tape-in",  variant: "current" },
      { id: "c3", time: "16:30", name: "Lucía Ferrer",    service: "Depósito por validar", filter: "tape-in",  variant: "warning" },
    ],
  },
  {
    abbr: "JUE", num: "03",
    appointments: [
      { id: "d1", time: "09:30", name: "Paola Reyes",   service: "Tape-in", filter: "tape-in" },
      { id: "d2", time: "14:00", name: "Gabriela Cruz", service: "Ponytail", filter: "otros" },
    ],
  },
  {
    abbr: "VIE", num: "04",
    appointments: [
      { id: "e1", time: "09:00", name: "Carla Núñez",   service: "Nano ring",    filter: "nano-ring" },
      { id: "e2",               name: "Camila Torres", service: "Día bloqueado", variant: "blocked" },
    ],
  },
  {
    abbr: "SÁB", num: "05",
    appointments: [
      { id: "f1", time: "10:00", name: "Renata Morales", service: "Tape-in", filter: "tape-in" },
    ],
  },
];

/* ── Tarjeta grid (desktop) ── */
function GridCard({ appt }: { appt: Appointment }) {
  const variant = appt.variant ?? "normal";

  if (variant === "blocked") {
    return (
      <div className="border-2 border-dashed border-zinc-200 rounded-xl p-3">
        <div className="text-sm font-medium text-zinc-400">{appt.name}</div>
        <div className="text-xs text-zinc-300 mt-0.5">{appt.service}</div>
      </div>
    );
  }
  if (variant === "current") {
    return (
      <div className="bg-zinc-900 rounded-xl p-3 cursor-pointer">
        <div className="text-xs text-zinc-500">{appt.time}</div>
        <div className="text-sm font-bold text-white mt-0.5 leading-snug">{appt.name}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{appt.service}</div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-3 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
      <div className="text-xs text-zinc-400">{appt.time}</div>
      <div className="text-sm font-bold text-zinc-900 mt-0.5 leading-snug">{appt.name}</div>
      <div className={`text-xs mt-0.5 ${variant === "warning" ? "text-orange-500 font-medium" : "text-zinc-400"}`}>
        {appt.service}
      </div>
    </div>
  );
}

/* ── Fila de lista (mobile / tablet) ── */
function ListItem({ appt }: { appt: Appointment }) {
  const variant = appt.variant ?? "normal";

  if (variant === "blocked") {
    return (
      <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 flex items-center gap-4">
        <span className="text-sm text-zinc-300 w-12 shrink-0 tabular-nums">—</span>
        <div>
          <div className="text-sm font-medium text-zinc-400">{appt.name}</div>
          <div className="text-xs text-zinc-300 mt-0.5">{appt.service}</div>
        </div>
      </div>
    );
  }
  if (variant === "current") {
    return (
      <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4 cursor-pointer">
        <span className="text-sm font-semibold text-zinc-400 w-12 shrink-0 tabular-nums">{appt.time}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white">{appt.name}</div>
          <div className="text-xs text-zinc-400 mt-0.5">{appt.service}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 flex items-center gap-4 hover:border-zinc-300 transition-colors cursor-pointer">
      <span className="text-sm font-semibold text-zinc-400 w-12 shrink-0 tabular-nums">{appt.time}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-zinc-900">{appt.name}</div>
        <div className={`text-xs mt-0.5 ${variant === "warning" ? "text-orange-500 font-medium" : "text-zinc-400"}`}>
          {appt.service}
        </div>
      </div>
    </div>
  );
}

/* ── Página ── */
export default function AgendaPage() {
  const todayIndex = weekDays.findIndex((d) => d.isToday) ?? 0;
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [activeFilters, setActiveFilters] = useState<Set<FilterId>>(
    () => new Set(["tape-in", "nano-ring", "otros"])
  );

  const toggleFilter = (id: FilterId) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isVisible = (appt: Appointment) => {
    if (appt.variant === "blocked") return true;
    if (!appt.filter) return true;
    return activeFilters.has(appt.filter);
  };

  /* Bloques reutilizables */
  const weekNav = (
    <div className="flex items-center bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <button className="px-2.5 py-2 hover:bg-zinc-50 transition-colors text-zinc-500 border-r border-zinc-200">
        <ChevronLeftIcon />
      </button>
      <span className="text-sm font-medium text-zinc-700 px-3 whitespace-nowrap">
        31 ago – 6 sep 2026
      </span>
      <button className="px-2.5 py-2 hover:bg-zinc-50 transition-colors text-zinc-500 border-l border-zinc-200">
        <ChevronRightIcon />
      </button>
    </div>
  );

  const filterDots = (
    <div className="flex items-center gap-4">
      {serviceFilters.map((f) => (
        <button
          key={f.id}
          onClick={() => toggleFilter(f.id)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            activeFilters.has(f.id) ? "text-zinc-700" : "text-zinc-300"
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
            activeFilters.has(f.id) ? f.dotClass : "bg-zinc-200"
          }`} />
          {f.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* ══ Header ══ */}
      <div className="mb-6 lg:mb-8">
        {/* Fila principal */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Agenda</h1>

          {/* Week nav — desktop */}
          <div className="hidden lg:flex">{weekNav}</div>

          <div className="flex-1" />

          {/* Filters — desktop */}
          <div className="hidden lg:flex">{filterDots}</div>

          <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
            + Nueva cita
          </button>
        </div>

        {/* Segunda fila — mobile y tablet */}
        <div className="mt-3 lg:hidden flex flex-wrap items-center gap-3">
          {weekNav}
          <div className="flex-1" />
          {filterDots}
        </div>
      </div>

      {/* ══ Vista mobile / tablet (< lg) ══ */}
      <div className="lg:hidden">

        {/* Selector de día — scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {weekDays.map((day, i) => {
            const isSelected = i === selectedDay;
            const isTodayUnselected = day.isToday && !isSelected;
            return (
              <button
                key={day.num}
                onClick={() => setSelectedDay(i)}
                className={`flex flex-col items-center px-4 py-2.5 rounded-xl shrink-0 min-w-[60px] transition-colors ${
                  isSelected
                    ? "bg-zinc-900 text-white"
                    : isTodayUnselected
                    ? "bg-white border-2 border-zinc-900 text-zinc-900"
                    : "bg-white border border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                  {day.isToday ? "HOY" : day.abbr}
                </span>
                <span className="text-xl font-bold mt-1 leading-none">{day.num}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de citas del día seleccionado */}
        <div className="mt-4 space-y-2">
          {(() => {
            const visibleAppts = weekDays[selectedDay].appointments.filter(isVisible);
            if (visibleAppts.length === 0) {
              return (
                <div className="bg-white rounded-2xl border border-zinc-100 p-10 text-center">
                  <p className="text-sm text-zinc-400">No hay citas para este día</p>
                </div>
              );
            }
            return visibleAppts.map((appt) => (
              <ListItem key={appt.id} appt={appt} />
            ));
          })()}
        </div>
      </div>

      {/* ══ Vista desktop: grid de 6 columnas (lg+) ══ */}
      <div className="hidden lg:block overflow-x-auto -mx-8 px-8">
        <div className="min-w-[700px]">

          {/* Cabeceras */}
          <div className="grid grid-cols-6 gap-3 mb-1">
            {weekDays.map((day) => (
              <div
                key={day.num}
                className={`pb-3 ${
                  day.isToday ? "border-b-2 border-zinc-900" : "border-b border-zinc-200"
                }`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-wider ${
                  day.isToday ? "text-zinc-700" : "text-zinc-400"
                }`}>
                  {day.isToday ? `${day.abbr} · HOY` : day.abbr}
                </p>
                <p className={`text-2xl font-bold mt-0.5 leading-none ${
                  day.isToday ? "text-zinc-900" : "text-zinc-500"
                }`}>
                  {day.num}
                </p>
              </div>
            ))}
          </div>

          {/* Columnas de citas */}
          <div className="grid grid-cols-6 gap-3 pt-4">
            {weekDays.map((day) => (
              <div key={day.num} className="space-y-2">
                {day.appointments.filter(isVisible).map((appt) => (
                  <GridCard key={appt.id} appt={appt} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
