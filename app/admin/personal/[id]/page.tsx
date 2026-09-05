"use client";

import Link from "next/link";
import { use, useRef, useState } from "react";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="28" height="22" rx="3" />
      <circle cx="10" cy="14" r="3" />
      <path d="M2 24l8-8 5 5 4-4 11 10" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5A.5.5 0 0 0 4.5 14h7a.5.5 0 0 0 .5-.5L13 4" />
    </svg>
  );
}

/* ── Photo upload ── */
function PhotoUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function handleDelete() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden group aspect-square w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Foto empleada" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 flex items-center justify-center shadow transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
      >
        <ImageIcon />
        <span className="text-sm font-medium text-zinc-400 mt-1">Foto de la empleada</span>
        <span className="text-xs text-zinc-400 underline">or browse files</span>
      </button>
    </>
  );
}

/* ── Data ── */
const MONTH_DAYS = 30;
const TODAY = 3;

const staffProfiles: Record<string, {
  name: string; initial: string; email: string; phone: string; since: string;
  role: string; commission: number;
  servicesMonth: number; billed: string; avgTicket: string; commissionAmount: string;
  specialties: string[];
  serviceLog: { date: string; client: string; service: string; amount: string; commission: string }[];
  blockedDays: number[];
  schedule: { day: string; hours: string }[];
  canValidateDeposits: boolean; canSeeReports: boolean;
}> = {
  p1: {
    name: "Mariana Ríos", initial: "M",
    email: "mariana@melenahumanhair.com", phone: "809 555 0188", since: "desde ene 2022",
    role: "Estilista", commission: 25,
    servicesMonth: 42, billed: "RD$134,400", avgTicket: "RD$3,200", commissionAmount: "RD$33,600",
    specialties: ["Tape-in", "Nano ring", "Bulk"],
    serviceLog: [
      { date: "24 ago", client: "Valentina Reyes", service: 'Tape-in 20"', amount: "RD$3,200", commission: "RD$800" },
      { date: "23 ago", client: "Renata Morales",  service: "Nano ring",   amount: "RD$4,800", commission: "RD$1,200" },
      { date: "22 ago", client: "Daniela Paz",     service: "Retoque",     amount: "RD$1,800", commission: "RD$450" },
      { date: "20 ago", client: "Camila Santos",   service: 'Tape-in 18"', amount: "RD$3,200", commission: "RD$800" },
    ],
    blockedDays: [14, 15, 21],
    schedule: [
      { day: "Lunes a viernes", hours: "10:00 – 19:00" },
      { day: "Sábado",          hours: "9:00 – 17:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
    canValidateDeposits: false, canSeeReports: false,
  },
  p2: {
    name: "Sofía Luna", initial: "S",
    email: "sofia@melenahumanhair.com", phone: "809 555 0201", since: "desde mar 2023",
    role: "Estilista", commission: 20,
    servicesMonth: 31, billed: "RD$96,100", avgTicket: "RD$3,100", commissionAmount: "RD$24,025",
    specialties: ["Tape-in", "Bulk"],
    serviceLog: [
      { date: "24 ago", client: "Andrea Peña",    service: "Nano ring",   amount: "RD$4,800", commission: "RD$960" },
      { date: "21 ago", client: "Lucia Ferrer",   service: 'Tape-in 16"', amount: "RD$3,200", commission: "RD$640" },
    ],
    blockedDays: [7, 8, 22, 23],
    schedule: [
      { day: "Lunes a viernes", hours: "9:00 – 18:00" },
      { day: "Sábado",          hours: "9:00 – 15:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
    canValidateDeposits: false, canSeeReports: false,
  },
  p3: {
    name: "Vanessa Gil", initial: "V",
    email: "vanessa@melenahumanhair.com", phone: "809 555 0314", since: "desde jul 2023",
    role: "Estilista", commission: 20,
    servicesMonth: 24, billed: "RD$72,000", avgTicket: "RD$3,000", commissionAmount: "RD$18,000",
    specialties: ["Bulk", "Cortina"],
    serviceLog: [
      { date: "23 ago", client: "Camila Santos", service: "Bulk", amount: "RD$3,200", commission: "RD$640" },
    ],
    blockedDays: [20],
    schedule: [
      { day: "Lunes a viernes", hours: "10:00 – 18:00" },
      { day: "Sábado",          hours: "10:00 – 14:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
    canValidateDeposits: false, canSeeReports: false,
  },
  p4: {
    name: "Camila Torres", initial: "C",
    email: "camila@melenahumanhair.com", phone: "809 555 0422", since: "desde feb 2024",
    role: "Recepción", commission: 0,
    servicesMonth: 0, billed: "—", avgTicket: "—", commissionAmount: "—",
    specialties: [],
    serviceLog: [],
    blockedDays: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    schedule: [
      { day: "Lunes a viernes", hours: "8:00 – 17:00" },
      { day: "Sábado",          hours: "8:00 – 13:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
    canValidateDeposits: true, canSeeReports: true,
  },
};

/* ── Page ── */
export default function PerfilEmpleadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const profile = staffProfiles[id] ?? staffProfiles["p1"];

  const [blockedDays, setBlockedDays] = useState<Set<number>>(
    () => new Set(profile.blockedDays)
  );
  const [selectedDay, setSelectedDay] = useState<number>(TODAY);
  const [calFilter, setCalFilter] = useState<"none" | "disponible" | "bloqueado">("none");

  function toggleDay(day: number) {
    setBlockedDays((prev) => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  }

  const days = Array.from({ length: MONTH_DAYS }, (_, i) => i + 1);
  const rows: number[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  const allSpecialties = ["Tape-in", "Nano ring", "Bulk", "Ponytail", "Cortina", "Retiro"];

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/personal" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="w-11 h-11 rounded-full bg-zinc-900 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {profile.initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{profile.name}</h1>
              <span className="text-xs font-semibold text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg">
                {profile.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {profile.email} · {profile.phone} · {profile.since}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href={`/admin/personal/${id}/editar`}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              Editar empleada
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Servicios del mes</p>
          <p className="text-3xl font-bold text-zinc-900">{profile.servicesMonth}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Facturado</p>
          <p className="text-2xl font-bold text-zinc-900">{profile.billed}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">{profile.avgTicket}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">
            Comisión {profile.commission > 0 ? `(${profile.commission}%)` : ""}
          </p>
          <p className="text-2xl font-bold text-white">{profile.commissionAmount}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">

        {/* ══ Columna izquierda ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Servicios registrados */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Servicios registrados</h2>
            </div>

            {profile.serviceLog.length > 0 ? (
              <>
                <div className="grid grid-cols-[80px_1fr_1fr_auto_auto] gap-x-4 px-5 py-2.5 border-b border-zinc-50">
                  {["Fecha", "Clienta", "Servicio", "Monto", "Comisión"].map((h) => (
                    <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
                  ))}
                </div>
                {profile.serviceLog.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[80px_1fr_1fr_auto_auto] gap-x-4 items-center px-5 py-3.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors"
                  >
                    <span className="text-sm text-zinc-500">{row.date}</span>
                    <span className="text-sm font-medium text-zinc-900">{row.client}</span>
                    <span className="text-sm text-zinc-600">{row.service}</span>
                    <span className="text-sm font-semibold text-zinc-900">{row.amount}</span>
                    <span className="text-sm text-zinc-500">{row.commission}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin servicios registrados este mes.</p>
            )}
          </div>

          {/* Disponibilidad / Calendario */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-zinc-900">
                Disponibilidad <span className="text-zinc-400 font-normal">· septiembre</span>
              </h2>
              <button
                onClick={() => toggleDay(selectedDay)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
                  blockedDays.has(selectedDay)
                    ? "border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {blockedDays.has(selectedDay) ? "Desbloquear día" : "Bloquear día"}
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {rows.map((row, ri) => (
                <div key={ri} className="flex gap-2">
                  {row.map((day) => {
                    const isBlocked   = blockedDays.has(day);
                    const isSelected  = selectedDay === day;
                    const isToday     = day === TODAY;
                    const highlighted =
                      calFilter === "disponible" ? !isBlocked :
                      calFilter === "bloqueado"  ?  isBlocked : false;
                    const dimmed =
                      calFilter === "disponible" ?  isBlocked :
                      calFilter === "bloqueado"  ? !isBlocked : false;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 aspect-square max-w-[40px] rounded-lg text-sm font-semibold transition-all flex flex-col items-center justify-center leading-none gap-0.5 ${
                          isSelected
                            ? "bg-zinc-900 text-white ring-2 ring-zinc-900 ring-offset-1"
                            : highlighted && isBlocked
                            ? "bg-red-100 text-red-500 border border-red-200"
                            : highlighted
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : dimmed
                            ? "opacity-25 bg-zinc-50 text-zinc-400"
                            : isBlocked
                            ? "bg-zinc-100 text-zinc-400 border border-zinc-200"
                            : isToday
                            ? "border-2 border-zinc-900 text-zinc-900"
                            : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                        }`}
                      >
                        <span>{day}</span>
                        {isBlocked && (
                          <span className={`text-[9px] font-bold ${isSelected ? "text-white/70" : highlighted ? "text-red-400" : "text-zinc-400"}`}>✕</span>
                        )}
                      </button>
                    );
                  })}
                  {row.length < 7 &&
                    Array.from({ length: 7 - row.length }).map((_, i) => (
                      <div key={i} className="flex-1 max-w-[40px]" />
                    ))
                  }
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCalFilter((f) => f === "disponible" ? "none" : "disponible")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  calFilter === "disponible"
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                <span className={`w-3 h-3 rounded border inline-block ${calFilter === "disponible" ? "bg-green-100 border-green-300" : "bg-zinc-50 border-zinc-300"}`} />
                Disponible
              </button>
              <button
                onClick={() => setCalFilter((f) => f === "bloqueado" ? "none" : "bloqueado")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                  calFilter === "bloqueado"
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                <span className={`w-3 h-3 rounded border inline-flex items-center justify-center text-[7px] font-bold ${calFilter === "bloqueado" ? "bg-red-100 border-red-200 text-red-400" : "bg-zinc-100 border-zinc-200 text-zinc-400"}`}>✕</span>
                Bloqueado
              </button>
            </div>
          </div>
        </div>

        {/* ══ Columna derecha ══ */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 space-y-4">

          {/* Foto */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Foto</p>
            <PhotoUpload />
          </div>

          {/* Especialidades */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Especialidades</p>
            {profile.specialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allSpecialties.map((s) => {
                  const active = profile.specialties.includes(s);
                  return active ? (
                    <span
                      key={s}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 text-white"
                    >
                      {s}
                    </span>
                  ) : (
                    <span
                      key={s}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-zinc-200 text-zinc-500"
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Sin especialidades asignadas.</p>
            )}
          </div>

          {/* Acceso y permisos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Acceso y permisos</p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Rol</span>
                <span className="text-sm font-semibold text-zinc-900">{profile.role}</span>
              </div>
              {profile.commission > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Comisión</span>
                  <span className="text-sm font-semibold text-zinc-900">{profile.commission}%</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Validar depósitos</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.canValidateDeposits ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {profile.canValidateDeposits ? "Sí" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Ver reportes</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  profile.canSeeReports ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
                }`}>
                  {profile.canSeeReports ? "Sí" : "No"}
                </span>
              </div>
            </div>
          </div>

          {/* Cuenta de la app */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="12" height="6" rx="1.5" />
                  <path d="M6 11V7a4 4 0 0 1 6 0" strokeLinejoin="round" />
                  <circle cx="9" cy="14" r="1" fill="#9ca3af" stroke="none" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Cuenta de la app pendiente</p>
                <p className="text-xs text-zinc-400 mt-0.5">Invitación sin aceptar</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Con su usuario podrá ver el salón del día, tomar clientas, registrar servicios y revisar sus comisiones desde la app.
            </p>
            <button className="w-full py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
              Reenviar invitación
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-2">
              Se envió a {profile.email}
            </p>
          </div>

          {/* Horario habitual */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Horario habitual</p>
            <div className="space-y-3">
              {profile.schedule.map(({ day, hours }) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-700">{day}</span>
                  <span className={`text-sm ${hours === "Cerrado" ? "text-zinc-400" : "text-zinc-900"}`}>
                    {hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
