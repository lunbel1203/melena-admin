"use client";

import { useRef, useState } from "react";

/* ── Icons ── */
function ImagePlaceholderIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
      <rect x="3" y="3" width="30" height="30" rx="4" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M3 25l9-9 6 6 4-4 11 11" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/* ── Types ── */
type TabId = "pendientes" | "validados" | "rechazados";
type DepositStatus = "pendiente" | "validado" | "rechazado";

interface Deposit {
  id: string;
  client: string;
  clientInitial: string;
  ago: string;
  date: string;
  time: string;
  service: string;
  stylist: string;
  amount: string;
  status: DepositStatus;
  bank: string;
  reference: string;
}

/* ── Data ── */
const deposits: Deposit[] = [
  {
    id: "d1",
    client: "Lucía Ferrer", clientInitial: "L",
    ago: "hace 12 min",
    date: "Mié 3", time: "16:30",
    service: "Nano ring", stylist: "Mariana",
    amount: "RD$1,000",
    status: "pendiente",
    bank: "Popular · 794-xxxxx-9", reference: "TRF-88142",
  },
  {
    id: "d2",
    client: "Carla Núñez", clientInitial: "C",
    ago: "hace 2 h",
    date: "Jue 3", time: "15:00",
    service: "Ponytail", stylist: "Sofía",
    amount: "RD$1,000",
    status: "pendiente",
    bank: "BHD · 512-xxxxx-3", reference: "TRF-88130",
  },
  {
    id: "d3",
    client: "Paula Cruz", clientInitial: "P",
    ago: "ayer",
    date: "Vie 4", time: "10:00",
    service: "Tape-in", stylist: "Vanessa",
    amount: "RD$1,000",
    status: "pendiente",
    bank: "Scotiabank · 321-xxxxx-7", reference: "TRF-88115",
  },
  {
    id: "d4",
    client: "Valentina Reyes", clientInitial: "V",
    ago: "hoy",
    date: "Mié 2", time: "11:00",
    service: "Tape-in", stylist: "Mariana",
    amount: "RD$1,000",
    status: "validado",
    bank: "Popular · 794-xxxxx-9", reference: "TRF-88100",
  },
  {
    id: "d5",
    client: "Daniela Paz", clientInitial: "D",
    ago: "hoy",
    date: "Mié 2", time: "13:00",
    service: "Nano ring", stylist: "Sofía",
    amount: "RD$1,000",
    status: "validado",
    bank: "BHD · 512-xxxxx-1", reference: "TRF-88098",
  },
  {
    id: "d6",
    client: "Ana Belén Díaz", clientInitial: "A",
    ago: "hoy",
    date: "Mié 2", time: "15:00",
    service: "Retiro", stylist: "Mariana",
    amount: "RD$1,000",
    status: "rechazado",
    bank: "Popular · 794-xxxxx-5", reference: "TRF-88091",
  },
];

/* ── Page ── */
export default function DepositosPage() {
  const [activeTab, setActiveTab] = useState<TabId>("pendientes");
  const [selectedId, setSelectedId] = useState<string>("d1");
  const [comprobanteImgs, setComprobanteImgs] = useState<Record<string, string>>({});
  const comprobanteRef = useRef<HTMLInputElement>(null);

  const pendientes = deposits.filter((d) => d.status === "pendiente");
  const validadosHoy = deposits.filter((d) => d.status === "validado");
  const rechazadosMes = deposits.filter((d) => d.status === "rechazado");

  const visiblePending = activeTab === "pendientes" ? pendientes :
                         activeTab === "validados"  ? validadosHoy : rechazadosMes;

  const resolved = [...validadosHoy, ...rechazadosMes];

  const selected = deposits.find((d) => d.id === selectedId) ?? deposits[0];

  const tabs: { id: TabId; label: string }[] = [
    { id: "pendientes", label: "Pendientes" },
    { id: "validados",  label: "Validados" },
    { id: "rechazados", label: "Rechazados" },
  ];

  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Depósitos</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Al validar, la clienta recibe el aviso y se programan los recordatorios.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-zinc-100 rounded-xl p-1 self-start">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === t.id
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Por validar</p>
          <p className="text-3xl font-bold text-zinc-900">{pendientes.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Validados hoy</p>
          <p className="text-3xl font-bold text-zinc-900">{validadosHoy.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Rechazados mes</p>
          <p className="text-3xl font-bold text-zinc-900">{rechazadosMes.length}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-2">Depósitos del mes</p>
          <p className="text-3xl font-bold text-white">RD$74K</p>
        </div>
      </div>

      {/* ── Body: two columns ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Solicitudes pendientes */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-base font-bold text-zinc-900">Solicitudes pendientes</h2>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-5 pb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Clienta</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Cita</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">Monto</span>
            </div>

            {/* Rows */}
            {visiblePending.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-zinc-400">No hay solicitudes en esta categoría</p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {visiblePending.map((dep) => {
                  const isSelected = selectedId === dep.id;
                  return (
                    <button
                      key={dep.id}
                      onClick={() => setSelectedId(dep.id)}
                      className={`w-full grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-5 py-3.5 text-left transition-colors ${
                        isSelected ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                      }`}
                    >
                      {/* Client */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                          {dep.clientInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{dep.client}</p>
                          <p className="text-xs text-zinc-400">{dep.ago}</p>
                        </div>
                      </div>

                      {/* Cita */}
                      <div className="min-w-0">
                        <p className="text-sm text-zinc-700 truncate">{dep.date} · {dep.time}</p>
                        <p className="text-xs text-zinc-400 truncate">{dep.service} · {dep.stylist}</p>
                      </div>

                      {/* Amount */}
                      <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap">{dep.amount}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Resueltos hoy */}
          {activeTab === "pendientes" && resolved.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h2 className="text-base font-bold text-zinc-900">Resueltos hoy</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {resolved.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => setSelectedId(dep.id)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${
                      selectedId === dep.id ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                    }`}
                  >
                    <span className="text-sm font-medium text-zinc-700">{dep.client}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      dep.status === "validado"
                        ? "bg-green-50 text-green-600"
                        : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {dep.status === "validado" ? "Validado" : "Rechazado"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ RIGHT: detail panel ══ */}
        <div className="lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">

            {/* Panel header */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="text-base font-bold text-zinc-900">{selected.client}</p>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                selected.status === "pendiente"
                  ? "bg-orange-50 text-orange-500"
                  : selected.status === "validado"
                  ? "bg-green-50 text-green-600"
                  : "bg-zinc-100 text-zinc-500"
              }`}>
                {selected.status === "pendiente" ? "Pendiente" :
                 selected.status === "validado"  ? "Validado"  : "Rechazado"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              {selected.service} · {selected.date.toLowerCase()} sep, {selected.time} · {selected.stylist}
            </p>

            {/* Comprobante de transferencia */}
            <input
              ref={comprobanteRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setComprobanteImgs((prev) => ({
                  ...prev,
                  [selected.id]: URL.createObjectURL(file),
                }));
              }}
            />

            {comprobanteImgs[selected.id] ? (
              <div className="relative mb-4 rounded-xl overflow-hidden border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={comprobanteImgs[selected.id]}
                  alt="Comprobante de transferencia"
                  className="w-full max-h-52 object-contain bg-zinc-50"
                />
                <button
                  type="button"
                  onClick={() => {
                    setComprobanteImgs((prev) => {
                      const next = { ...prev };
                      delete next[selected.id];
                      return next;
                    });
                    if (comprobanteRef.current) comprobanteRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-white border border-zinc-200 rounded-full p-1.5 text-zinc-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                  title="Eliminar imagen"
                >
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <div
                onClick={() => comprobanteRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <ImagePlaceholderIcon />
                <p className="text-sm text-zinc-500 font-medium mt-1">Comprobante de transferencia</p>
                <p className="text-xs text-zinc-400">Haz clic para subir</p>
              </div>
            )}

            {/* Meta */}
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-400">Monto declarado</span>
                <span className="text-sm font-bold text-zinc-900">{selected.amount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-400">Banco</span>
                <span className="text-sm text-zinc-700 text-right">{selected.bank}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-400">Referencia</span>
                <span className="text-sm font-medium text-zinc-700">{selected.reference}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                Rechazar
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Validar y confirmar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
