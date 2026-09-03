"use client";

import { useRef, useState } from "react";
import Link from "next/link";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10 10l4 4" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13V5M7 8l3-3 3 3" />
      <path d="M3 15h14" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L1.5 13.5h13L8 2z" />
      <path d="M8 6.5v3M8 11.5v.5" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/* ── Data ── */
const clients = [
  { id: "c1", name: "Valentina Reyes", phone: "809 555 0142", visits: 8 },
];

const services = [
  { id: "s1", name: "Tape-in",  duration: "1.5 h",   price: "RD$3,200" },
  { id: "s2", name: "Nano ring", duration: "3 h",    price: "RD$4,800" },
  { id: "s3", name: "Ponytail", duration: "30 min",  price: "RD$1,900" },
  { id: "s4", name: "Retiro",   duration: "45 min",  price: "RD$1,200" },
];

const staff = [
  { id: "p1", name: "Mariana Ríos",  role: "Especialista en tape-in", freeDays: 4, available: true },
  { id: "p2", name: "Sofía Luna",    role: "Tape-in · bulk",          freeDays: 6, available: true },
  { id: "p3", name: "Camila Torres", role: "Vacaciones al 5 sep",     freeDays: 0, available: false },
];

const days = [
  { id: "d1", abbr: "Lun", num: 1 },
  { id: "d2", abbr: "Mar", num: 2 },
  { id: "d3", abbr: "Mié", num: 3 },
  { id: "d4", abbr: "Jue", num: 4 },
  { id: "d5", abbr: "Vie", num: 5 },
  { id: "d6", abbr: "Sáb", num: 6 },
  { id: "d7", abbr: "Lun", num: 8 },
  { id: "d8", abbr: "Mar", num: 9 },
];

const timeSlots = ["9:00", "11:00", "13:00", "15:00", "16:30", "18:00"];

/* ── Avatar ── */
function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const letter = name.charAt(0).toUpperCase();
  const dim = size === "sm" ? "w-8 h-8 text-sm" : "w-10 h-10 text-base";
  return (
    <div className={`${dim} rounded-full bg-zinc-200 flex items-center justify-center font-semibold text-zinc-600 shrink-0`}>
      {letter}
    </div>
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
      {children}
    </p>
  );
}

/* ── Page ── */
export default function NuevaCitaPage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>("c1");
  const [selectedService, setSelectedService] = useState<string | null>("s1");
  const [selectedStaff, setSelectedStaff] = useState<string | null>("p1");
  const [selectedDay, setSelectedDay] = useState<string | null>("d3");
  const [selectedTime, setSelectedTime] = useState<string | null>("11:00");
  const [payInSalon, setPayInSalon] = useState(false);
  const [comprobante, setComprobante] = useState<string | null>(null);
  const comprobanteRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");

  const selectedStaffName = staff.find((p) => p.id === selectedStaff)?.name.split(" ")[0] ?? "Personal";

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link
          href="/admin/agenda"
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nueva cita</h1>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 1 · Clienta */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Clienta</SectionLabel>

            {/* Search */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, teléfono o correo..."
                className="w-full pl-9 pr-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Results */}
            <div className="space-y-2">
              {clients.map((c) => {
                const isSelected = selectedClient === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClient(c.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-zinc-300 bg-zinc-50"
                        : "border-zinc-100 hover:border-zinc-200"
                    }`}
                  >
                    <Avatar name={c.name} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900">{c.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {c.phone} · {c.visits} visitas
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0">
                        Seleccionada
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-xs text-zinc-400 mt-3">
              ¿Clienta nueva? Se crea el perfil al registrar el check-in.
            </p>
          </div>

          {/* 2 · Servicio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Servicio</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {services.map((s) => {
                const isSelected = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-white"
                        : "border-zinc-100 bg-white hover:border-zinc-200"
                    }`}
                  >
                    <div className="text-sm font-semibold text-zinc-900">{s.name}</div>
                    <div className="text-xs text-zinc-400 mt-1">
                      {s.duration} · {s.price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 · Personal disponible */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Personal disponible</SectionLabel>
            <div className="space-y-2">
              {staff.map((p) => {
                const isSelected = selectedStaff === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={!p.available}
                    onClick={() => p.available && setSelectedStaff(p.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                      !p.available
                        ? "border-zinc-100 cursor-default"
                        : isSelected
                        ? "border-zinc-300 bg-zinc-50"
                        : "border-zinc-100 hover:border-zinc-200"
                    }`}
                  >
                    <Avatar name={p.name} size="sm" />
                    <div className="flex-1 min-w-0 text-left">
                      <div className={`text-sm font-semibold ${p.available ? "text-zinc-900" : "text-zinc-400"}`}>
                        {p.name}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5">{p.role}</div>
                    </div>
                    {p.available ? (
                      <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full shrink-0">
                        {p.freeDays} días libres
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 shrink-0">No disponible</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[380px] shrink-0 space-y-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">

            {/* 4 · Fecha y hora */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>4 · Fecha y hora con {selectedStaffName}</SectionLabel>

              {/* Day chips — 4 per row */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {days.map((d) => {
                  const isSelected = selectedDay === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDay(d.id)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-[11px] font-medium leading-none">{d.abbr}</span>
                      <span className="text-base font-bold mt-0.5 leading-none">{d.num}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time slots */}
              <div className="mb-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Horarios del {days.find((d) => d.id === selectedDay)?.abbr.toLowerCase() ?? "día"}{" "}
                  {days.find((d) => d.id === selectedDay)?.num}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warning */}
              <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                <span className="shrink-0 mt-0.5"><WarnIcon /></span>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  La 1:00 pm está ocupada.{" "}
                  <span className="font-semibold">Sofía Luna</span> y{" "}
                  <span className="font-semibold">Vanessa Gil</span> sí la tienen libre.
                </p>
              </div>
            </div>

            {/* 5 · Depósito de reserva */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>5 · Depósito de reserva</SectionLabel>

              {!payInSalon && (
                <>
                  {/* Amount */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-zinc-600">Monto requerido</span>
                    <span className="text-base font-bold text-zinc-900">RD$1,000</span>
                  </div>

                  {/* Upload area */}
                  <input
                    ref={comprobanteRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setComprobante(URL.createObjectURL(file));
                    }}
                  />

                  {comprobante ? (
                    /* Preview with delete */
                    <div className="relative mb-3 rounded-xl overflow-hidden border border-zinc-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={comprobante}
                        alt="Comprobante"
                        className="w-full max-h-48 object-contain bg-zinc-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setComprobante(null);
                          if (comprobanteRef.current) comprobanteRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-white border border-zinc-200 rounded-full p-1.5 text-zinc-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                        title="Eliminar imagen"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => comprobanteRef.current?.click()}
                      className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-4 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all mb-3"
                    >
                      <span className="text-zinc-400"><UploadIcon /></span>
                      <span className="text-sm text-zinc-500 font-medium">Adjuntar comprobante</span>
                    </button>
                  )}
                </>
              )}

              {/* Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={payInSalon}
                  onChange={(e) => {
                    setPayInSalon(e.target.checked);
                    if (e.target.checked) {
                      setComprobante(null);
                      if (comprobanteRef.current) comprobanteRef.current.value = "";
                    }
                  }}
                  className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer"
                />
                <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors">
                  Cobrar en el salón (sin depósito previo)
                </span>
              </label>
            </div>

            {/* Nota interna */}
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Nota interna</SectionLabel>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Cuero sensible, usar cinta hipoalergénica..."
                rows={4}
                className="w-full text-sm text-zinc-800 placeholder-zinc-400 resize-none border-0 outline-none leading-relaxed"
              />
            </div>

            {/* Actions */}
            <div className="p-5 flex gap-3">
              <Link
                href="/admin/agenda"
                className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Crear cita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
