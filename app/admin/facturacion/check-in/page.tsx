"use client";

import Link from "next/link";
import { useState } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

type Client = { id: string; initial: string; name: string; phone: string; hasCita: boolean };
type Service = { id: string; name: string; duration: string; price: number; priceLabel: string };
type Stylist = { id: string; initial: string; name: string; status: "disponible" | "ocupada" | "casi-libre"; detail: string };

const allClients: Client[] = [
  { id: "c1", initial: "R", name: "Renata Morales",   phone: "809 555 0377", hasCita: false },
  { id: "c2", initial: "V", name: "Valentina Reyes",  phone: "809 555 1201", hasCita: true  },
  { id: "c3", initial: "C", name: "Camila Santos",    phone: "809 555 4390", hasCita: true  },
  { id: "c4", initial: "A", name: "Andrea Peña",      phone: "809 555 7823", hasCita: false },
  { id: "c5", initial: "L", name: "Lucía Ferrer",     phone: "809 555 6614", hasCita: true  },
  { id: "c6", initial: "D", name: "Daniela Paz",      phone: "809 555 9902", hasCita: false },
];

const services: Service[] = [
  { id: "tape-in",  name: "Tape-in",   duration: "1.5 h",   price: 3200, priceLabel: "RD$3,200" },
  { id: "nano",     name: "Nano ring", duration: "3 h",     price: 4800, priceLabel: "RD$4,800" },
  { id: "ponytail", name: "Ponytail",  duration: "30 min",  price: 1900, priceLabel: "RD$1,900" },
  { id: "retoque",  name: "Retoque",   duration: "45 min",  price: 1800, priceLabel: "RD$1,800" },
];

const stylists: Stylist[] = [
  { id: "mariana", initial: "M", name: "Mariana Ríos",  status: "ocupada",     detail: "Atendiendo a Valentina Reyes" },
  { id: "vanessa", initial: "V", name: "Vanessa Gil",   status: "disponible",  detail: "Libre hasta las 11:30 am" },
  { id: "sofia",   initial: "S", name: "Sofía Luna",    status: "casi-libre",  detail: "Termina en 25 min" },
];

const statusBadge: Record<Stylist["status"], string> = {
  disponible:  "bg-green-50 text-green-700",
  ocupada:     "bg-zinc-100 text-zinc-500",
  "casi-libre":"bg-orange-50 text-orange-600",
};

const statusLabel: Record<Stylist["status"], string> = {
  disponible:  "Disponible",
  ocupada:     "Ocupada",
  "casi-libre":"Casi libre",
};

export default function CheckInPage() {
  const [search,          setSearch]          = useState("");
  const [selectedClient,  setSelectedClient]  = useState<Client | null>(allClients[0]);
  const [selectedService, setSelectedService] = useState<Service | null>(services[0]);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(stylists[1]);
  const [addProduct,      setAddProduct]      = useState(false);
  const [nota,            setNota]            = useState("");

  const filtered = allClients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const showList = search.length > 0 || !selectedClient;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link href="/admin/facturacion" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3">
          <ChevronLeft />
          Facturación
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Check-in de clienta</h1>
        <p className="text-sm text-zinc-400 mt-1">Al confirmar se abre su factura y la estilista la ve en su app.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Step 1 — Clienta */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              1 · Clienta
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {}}
                placeholder="Buscar por nombre o teléfono..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Client list when searching */}
            {showList && (
              <div className="border border-zinc-200 rounded-xl overflow-hidden mb-3">
                {filtered.map((c) => {
                  const isSelected = selectedClient?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedClient(c); setSearch(""); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-100 last:border-0 transition-colors ${
                        isSelected ? "bg-zinc-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                        {c.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                        <p className="text-xs text-zinc-400">
                          {c.phone} · {c.hasCita ? "cita hoy" : "sin cita para hoy"}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 text-white shrink-0">
                          Seleccionada
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected client (compact, when not searching) */}
            {selectedClient && !showList && (
              <div className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl mb-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                  {selectedClient.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{selectedClient.name}</p>
                  <p className="text-xs text-zinc-400">
                    {selectedClient.phone} · {selectedClient.hasCita ? "cita hoy" : "sin cita para hoy"}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 text-white shrink-0">
                  Seleccionada
                </span>
              </div>
            )}

            <p className="text-xs text-zinc-400">Si es su primera vez, el perfil se crea con este check-in.</p>
          </div>

          {/* Step 2 — Servicio */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              2 · Servicio
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {services.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`text-left px-4 py-3.5 rounded-xl border-2 transition-colors ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-zinc-900">{svc.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{svc.duration} · {svc.priceLabel}</p>
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addProduct}
                onChange={(e) => setAddProduct(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
              />
              <span className="text-sm text-zinc-600">Agregar producto de cabello a la factura</span>
            </label>
          </div>

          {/* Step 3 — Estilista */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              3 · Estilista disponible ahora
            </p>

            <div className="flex flex-col gap-2">
              {stylists.map((st) => {
                const isSelected = selectedStylist?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => st.status !== "ocupada" && setSelectedStylist(st)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50"
                        : st.status === "ocupada"
                        ? "border-zinc-100 bg-white cursor-default opacity-70"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                      {st.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{st.name}</p>
                      <p className="text-xs text-zinc-400">{st.detail}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusBadge[st.status]}`}>
                      {statusLabel[st.status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:w-72 flex flex-col gap-4">

          {/* Resumen */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Resumen del check-in
            </p>
            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Clienta</span>
                <span className="text-zinc-900 font-medium text-right">{selectedClient?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Servicio</span>
                <span className="text-zinc-900 font-medium">{selectedService?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estilista</span>
                <span className="text-zinc-900 font-medium">{selectedStylist?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entrada</span>
                <span className="text-zinc-900 font-medium">11:05 am</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duración estimada</span>
                <span className="text-zinc-900 font-medium">{selectedService?.duration ?? "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-zinc-400">Total estimado</span>
              <span className="text-base font-bold">
                {selectedService ? `RD$${selectedService.price.toLocaleString("es-DO")}` : "—"}
              </span>
            </div>
          </div>

          {/* Depósito */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Depósito
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">
                {selectedClient?.hasCita ? "Depósito previo" : "Sin depósito previo"}
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                {selectedClient?.hasCita ? "RD$1,000" : "RD$0"}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {selectedClient?.hasCita
                ? "Depósito registrado al reservar la cita."
                : "Llegó sin reservar, se cobra el total al cerrar la factura."}
            </p>
          </div>

          {/* Nota para la estilista */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Nota para la estilista
            </p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. cuero sensible, prefiere raya al lado..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/facturacion"
              className="py-2.5 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
              Dar entrada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
