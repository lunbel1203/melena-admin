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

function PhotoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="24" height="20" rx="3" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M2 21l7-7 4 4 3-3 10 9" />
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

/* ── Photo slot interactivo ── */
function PhotoSlot({ label }: { label: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    e.target.value = "";
  }

  function handleDelete() {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  }

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden group aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
        <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 flex items-center justify-center shadow transition-colors"
            title="Eliminar foto"
          >
            <TrashIcon />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 pb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] font-semibold text-white">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-zinc-200 rounded-xl py-5 flex flex-col items-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-colors w-full aspect-square justify-center"
      >
        <PhotoIcon />
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className="text-[10px] text-zinc-400 underline">or browse files</span>
      </button>
    </>
  );
}

function WhatsappBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">
      Whatsapp
    </span>
  );
}

function ActiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">
      Activos
    </span>
  );
}

/* ── Data (mock para todas las clientas) ── */
const profiles: Record<string, {
  name: string; phone: string; email: string; since: string; status: string;
  visits: number; totalBilled: string; avgTicket: string;
  nextDate: string; nextTime: string; nextService: string;
  serviceHistory: { date: string; service: string; stylist: string; amount: string }[];
  checkins: { title: string; sub: string; badge: string; badgeClass: string }[];
  hairFile: { tipo: string; largo: string; color: string; tecnica: string; sesiones: string };
  notes: string;
  stylist: string;
}> = {
  "valentina-reyes": {
    name: "Valentina Reyes", phone: "809 555 0142", email: "valentina.r@correo.com",
    since: "desde mar 2024", status: "Activa",
    visits: 8, totalBilled: "RD$24,600", avgTicket: "RD$3,075",
    nextDate: "Mié 3 sep", nextTime: "11:00 am", nextService: "Tape-in con Mariana",
    serviceHistory: [
      { date: "24 ago", service: 'Tape-in 20"',         stylist: "Mariana Ríos", amount: "RD$3,200" },
      { date: "12 jun", service: "Retoque tape-in",      stylist: "Mariana Ríos", amount: "RD$1,800" },
      { date: "2 abr",  service: 'Tape-in 18"',         stylist: "Sofía Luna",   amount: "RD$3,200" },
      { date: "18 ene", service: "Retiro de extensiones",stylist: "Sofía Luna",   amount: "RD$1,200" },
    ],
    checkins: [
      { title: "Tirantez · intensidad 4/5", sub: "Reportado el 27 ago, día 3 después de la instalación", badge: "Abierto",     badgeClass: "bg-red-50 text-red-600" },
      { title: "Check-in día 30 · todo bien",  sub: "Respondido el 12 jul",                               badge: "Sin molestia", badgeClass: "bg-green-50 text-green-700" },
      { title: "Picazón · intensidad 2/5",     sub: "Reportado el 5 abr · resuelto con cambio de adhesivo", badge: "Resuelto",   badgeClass: "bg-zinc-100 text-zinc-500" },
    ],
    hairFile: { tipo: "Ondulado", largo: '20"', color: "Chocolate ombré", tecnica: "Tape-in", sesiones: "6 / 10" },
    notes: "Cuero sensible: usar cinta hipoalergénica. Prefiere citas en la mañana y avisar por whatsapp, no por llamada.",
    stylist: "Mariana Ríos",
  },
  "camila-santos": {
    name: "Camila Santos", phone: "809 555 0188", email: "camila.s@correo.com",
    since: "desde jun 2024", status: "Activa",
    visits: 5, totalBilled: "RD$14,000", avgTicket: "RD$2,800",
    nextDate: "Mié 18 sep", nextTime: "10:00 am", nextService: "Retoque con Mariana",
    serviceHistory: [
      { date: "18 ago", service: "Retoque",       stylist: "Mariana Ríos", amount: "RD$1,800" },
      { date: "20 jun", service: "Tape-in 18\"",  stylist: "Mariana Ríos", amount: "RD$3,200" },
    ],
    checkins: [
      { title: "Check-in día 15 · todo bien", sub: "Respondido el 2 sep", badge: "Sin molestia", badgeClass: "bg-green-50 text-green-700" },
    ],
    hairFile: { tipo: "Liso", largo: '18"', color: "Castaño natural", tecnica: "Tape-in", sesiones: "3 / 10" },
    notes: "",
    stylist: "Mariana Ríos",
  },
  "andrea-pena": {
    name: "Andrea Peña", phone: "809 555 0231", email: "andrea.p@correo.com",
    since: "desde ago 2024", status: "Activa",
    visits: 3, totalBilled: "RD$9,600", avgTicket: "RD$3,200",
    nextDate: "Mié 24 sep", nextTime: "2:00 pm", nextService: "Nano ring con Sofía",
    serviceHistory: [
      { date: "12 ago", service: "Nano ring", stylist: "Sofía Luna", amount: "RD$4,800" },
    ],
    checkins: [],
    hairFile: { tipo: "Rizado", largo: '16"', color: "Negro natural", tecnica: "Nano ring", sesiones: "2 / 10" },
    notes: "Alérgica al níquel. Usar anillos de silicona.",
    stylist: "Sofía Luna",
  },
  "renata-morales": {
    name: "Renata Morales", phone: "809 555 0377", email: "renata.m@correo.com",
    since: "desde ene 2024", status: "Molestia",
    visits: 6, totalBilled: "RD$18,400", avgTicket: "RD$3,067",
    nextDate: "Sin agendar", nextTime: "", nextService: "",
    serviceHistory: [
      { date: "2 sep",  service: 'Tape-in 18"', stylist: "Sofía Luna",   amount: "RD$3,200" },
      { date: "5 jul",  service: "Retoque",      stylist: "Sofía Luna",   amount: "RD$1,800" },
    ],
    checkins: [
      { title: "Picazón · intensidad 3/5", sub: "Reportado el 5 sep, día 3 de la instalación", badge: "Abierto", badgeClass: "bg-red-50 text-red-600" },
    ],
    hairFile: { tipo: "Liso", largo: '18"', color: "Rubio platino", tecnica: "Tape-in", sesiones: "4 / 10" },
    notes: "Cuero graso. Prefiere extensiones sin cinta.",
    stylist: "Sofía Luna",
  },
  "lucia-ferrer": {
    name: "Lucia Ferrer", phone: "809 555 0410", email: "lucia.f@correo.com",
    since: "desde sep 2026", status: "Nueva",
    visits: 0, totalBilled: "RD$0", avgTicket: "—",
    nextDate: "Jue 2 sep", nextTime: "9:00 am", nextService: "Nano ring con Sofía",
    serviceHistory: [],
    checkins: [],
    hairFile: { tipo: "Ondulado", largo: '14"', color: "Castaño oscuro", tecnica: "Nano ring", sesiones: "0 / 10" },
    notes: "",
    stylist: "Sofía Luna",
  },
  "daniela-paz": {
    name: "Daniela Paz", phone: "809 555 0522", email: "daniela.p@correo.com",
    since: "desde oct 2023", status: "Inactiva",
    visits: 4, totalBilled: "RD$10,200", avgTicket: "RD$2,550",
    nextDate: "Sin agendar", nextTime: "", nextService: "",
    serviceHistory: [
      { date: "4 may",  service: "Retiro de extensiones", stylist: "Mariana Ríos", amount: "RD$1,200" },
      { date: "14 mar", service: 'Tape-in 16"',           stylist: "Mariana Ríos", amount: "RD$3,200" },
    ],
    checkins: [
      { title: "Check-in día 30 · todo bien", sub: "Respondido el 13 abr", badge: "Sin molestia", badgeClass: "bg-green-50 text-green-700" },
    ],
    hairFile: { tipo: "Liso", largo: '16"', color: "Negro azabache", tecnica: "Tape-in", sesiones: "2 / 10" },
    notes: "Prefiere no usar calor. Solo fijaciones en frío.",
    stylist: "Mariana Ríos",
  },
};

const statusBadge: Record<string, string> = {
  Activa:   "bg-green-100 text-green-700",
  Molestia: "bg-orange-100 text-orange-600",
  Nueva:    "bg-zinc-100 text-zinc-600",
  Inactiva: "bg-zinc-100 text-zinc-500",
};

export default function PerfilClientaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const profile = profiles[slug] ?? profiles["valentina-reyes"];
  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/admin/clientas" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>

          {/* Avatar + nombre */}
          <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-white text-lg font-bold shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{profile.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[profile.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                {profile.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {profile.phone} · {profile.email} · {profile.since}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 ml-auto">
            <button className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap">
              Enviar mensaje
            </button>
            <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Registrar servicio
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Visitas</p>
          <p className="text-3xl font-bold text-zinc-900">{profile.visits}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Total facturado</p>
          <p className="text-2xl font-bold text-zinc-900">{profile.totalBilled}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Ticket promedio</p>
          <p className="text-2xl font-bold text-zinc-900">{profile.avgTicket}</p>
        </div>

        {/* Próxima cita */}
        {profile.nextDate !== "Sin agendar" ? (
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
            <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Próxima cita</p>
            <p className="text-base font-bold text-white leading-snug">
              {profile.nextDate} · {profile.nextTime}
            </p>
            <p className="text-xs text-zinc-400 mt-1">{profile.nextService}</p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 flex items-center">
            <p className="text-sm font-semibold text-zinc-500">Sin próxima cita</p>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">

        {/* ══ Columna izquierda ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Historial de servicios */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Historial de servicios</h2>
            </div>

            {profile.serviceHistory.length > 0 ? (
              <>
                <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 px-5 py-2.5 border-b border-zinc-50">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Fecha</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Servicio</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Estilista</span>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Monto</span>
                </div>
                {profile.serviceHistory.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 items-center px-5 py-3.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors"
                  >
                    <span className="text-sm text-zinc-500">{row.date}</span>
                    <span className="text-sm text-zinc-800 font-medium">{row.service}</span>
                    <span className="text-sm text-zinc-500">{row.stylist}</span>
                    <span className="text-sm font-semibold text-zinc-900">{row.amount}</span>
                  </div>
                ))}
              </>
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin servicios registrados aún.</p>
            )}
          </div>

          {/* Check-ins y molestias */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Check-ins y molestias</h2>
            </div>

            {profile.checkins.length > 0 ? (
              profile.checkins.map((c, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-4 px-5 py-4 border-b border-zinc-50 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">{c.title}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{c.sub}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${c.badgeClass}`}>
                    {c.badge}
                  </span>
                </div>
              ))
            ) : (
              <p className="px-5 py-6 text-sm text-zinc-400">Sin check-ins registrados.</p>
            )}
          </div>
        </div>

        {/* ══ Columna derecha ══ */}
        <div className="lg:w-[300px] xl:w-[320px] shrink-0 space-y-4">

          {/* Evolución fotográfica */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Evolución fotográfica
            </p>
            <div className="grid grid-cols-2 gap-2">
              <PhotoSlot label="Antes" />
              <PhotoSlot label="Hoy" />
            </div>
          </div>

          {/* Ficha de cabello */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Ficha de cabello
            </p>
            <div className="space-y-2.5">
              {[
                ["Tipo",     profile.hairFile.tipo],
                ["Largo actual", profile.hairFile.largo],
                ["Color",    profile.hairFile.color],
                ["Técnica",  profile.hairFile.tecnica],
                ["Sesiones", profile.hairFile.sesiones],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">{label}</span>
                  <span className="text-sm font-semibold text-zinc-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Notas internas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              Notas internas
            </p>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {profile.notes || "Sin notas."}
            </p>
          </div>

          {/* Preferencias */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Preferencias
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Estilista habitual</span>
                <span className="text-sm font-semibold text-zinc-900">{profile.stylist}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Recordatorios</span>
                <WhatsappBadge />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Check-ins</span>
                <ActiveBadge />
              </div>
            </div>
          </div>

          {/* Cuenta en la app */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="6" r="3" />
                  <path d="M2 16c0-3.314 3.134-6 7-6s7 2.686 7 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">Aún no tiene cuenta en la app</p>
                <p className="text-xs text-zinc-400 mt-0.5">Sin acceso a citas ni check-ins</p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-4">
              Invítala a crear su usuario para que agende sola, vea su historial y responda los check-ins de bienestar desde su teléfono.
            </p>
            <button className="w-full py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
              Invitar a crear su cuenta
            </button>
            <p className="text-[11px] text-zinc-400 text-center mt-2">
              Se envía un enlace por whatsapp a {profile.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
