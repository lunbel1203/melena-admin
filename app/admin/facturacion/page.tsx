"use client";

import Link from "next/link";
import { useState } from "react";

type Status = "en-atencion" | "por-cobrar" | "sin-asignar" | "en-espera";
type Tab = "salon" | "cerradas";

type ClientCard = {
  id: string;
  initial: string;
  name: string;
  status: Status;
  timeLabel: string;
  time: string;
  visits: string;
  servicio?: string;
  extra?: string;
  estilista?: string;
  deposito?: string;
  resta?: string;
  total?: string;
  estimado?: string;
};

const statusLabel: Record<Status, string> = {
  "en-atencion":  "En atención",
  "por-cobrar":   "Por cobrar",
  "sin-asignar":  "Sin asignar",
  "en-espera":    "En espera",
};

const statusClass: Record<Status, string> = {
  "en-atencion": "bg-green-50 text-green-700",
  "por-cobrar":  "bg-orange-50 text-orange-600",
  "sin-asignar": "bg-amber-50 text-amber-600",
  "en-espera":   "bg-blue-50 text-blue-600",
};

const clients: ClientCard[] = [
  {
    id: "c1", initial: "V", name: "Valentina Reyes",
    status: "en-atencion", timeLabel: "Desde", time: "11:02 am",
    visits: "8 visitas · cita 11:00 am",
    servicio: 'Tape-in 20"', estilista: "Mariana Ríos",
    deposito: "RD$1,000 pagado", resta: "RD$2,200",
  },
  {
    id: "c2", initial: "D", name: "Daniela Paz",
    status: "en-atencion", timeLabel: "Desde", time: "10:15 am",
    visits: "3 visitas · cita 10:00 am",
    servicio: "Nano ring", estilista: "Sofía Luna",
    deposito: "RD$1,000 pagado", resta: "RD$3,800",
  },
  {
    id: "c3", initial: "C", name: "Camila Santos",
    status: "por-cobrar", timeLabel: "Terminó", time: "11:40 am",
    visits: "5 visitas · cita 9:00 am",
    servicio: "Retoque tape-in", extra: "Sellador · RD$450",
    estilista: "Mariana Ríos", total: "RD$2,250",
  },
  {
    id: "c4", initial: "R", name: "Renata Morales",
    status: "sin-asignar", timeLabel: "Llegó", time: "11:05 am",
    visits: "Sin cita · llegó sin reservar",
  },
  {
    id: "c5", initial: "L", name: "Lucía Ferrer",
    status: "en-espera", timeLabel: "Llegó", time: "11:20 am",
    visits: "1 visita · cita 11:30 am",
    servicio: "Ponytail", estilista: "Vanessa Gil",
    deposito: "Sin depósito", estimado: "RD$1,900",
  },
];

const closed = [
  { initial: "A", name: "Andrea Peña",   servicio: "Tape-in 18\"", estilista: "Sofía Luna",   total: "RD$3,200", hora: "9:45 am" },
  { initial: "M", name: "María Torres",  servicio: "Ponytail",      estilista: "Vanessa Gil",  total: "RD$1,900", hora: "10:30 am" },
];

function ClientCardView({ c }: { c: ClientCard }) {
  if (c.status === "sin-asignar") {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[c.status]}`}>
            {statusLabel[c.status]}
          </span>
          <span className="text-xs text-zinc-400">{c.timeLabel} {c.time}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
            {c.initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
            <p className="text-xs text-zinc-400">{c.visits}</p>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-zinc-500">Falta asignar estilista y servicio para abrir su factura.</p>
        </div>

        <button className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
          Asignar y abrir factura
        </button>
      </div>
    );
  }

  if (c.status === "por-cobrar") {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[c.status]}`}>
            {statusLabel[c.status]}
          </span>
          <span className="text-xs text-zinc-400">{c.timeLabel} {c.time}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
            {c.initial}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
            <p className="text-xs text-zinc-400">{c.visits}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {c.servicio && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Servicio</span>
              <span className="text-zinc-800 font-medium">{c.servicio}</span>
            </div>
          )}
          {c.extra && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Extra</span>
              <span className="text-zinc-800 font-medium">{c.extra}</span>
            </div>
          )}
          {c.estilista && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Estilista</span>
              <span className="text-zinc-800 font-medium">{c.estilista}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3">
          <span className="text-xs font-semibold text-zinc-400">Total a cobrar</span>
          <span className="text-base font-bold">{c.total}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button className="py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Ver detalle
          </button>
          <button className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
            Cobrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[c.status]}`}>
          {statusLabel[c.status]}
        </span>
        <span className="text-xs text-zinc-400">{c.timeLabel} {c.time}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
          {c.initial}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
          <p className="text-xs text-zinc-400">{c.visits}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {c.servicio && (
          <div className="flex justify-between">
            <span className="text-zinc-400">Servicio</span>
            <span className="text-zinc-800 font-medium">{c.servicio}</span>
          </div>
        )}
        {c.estilista && (
          <div className="flex justify-between">
            <span className="text-zinc-400">Estilista</span>
            <span className="text-zinc-800 font-medium">{c.estilista}</span>
          </div>
        )}
        {c.deposito && (
          <div className="flex justify-between">
            <span className="text-zinc-400">Depósito</span>
            <span className="text-zinc-800 font-medium">{c.deposito}</span>
          </div>
        )}
      </div>

      {c.resta && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-xs text-zinc-400">Resta por cobrar</span>
          <span className="text-base font-bold text-zinc-900">{c.resta}</span>
        </div>
      )}
      {c.estimado && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-xs text-zinc-400">Estimado</span>
          <span className="text-base font-bold text-zinc-900">{c.estimado}</span>
        </div>
      )}

      {c.status === "en-atencion" && (
        <div className="grid grid-cols-2 gap-2">
          <button className="py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            + Servicio
          </button>
          <button className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
            Cerrar y cobrar
          </button>
        </div>
      )}
    </div>
  );
}

function AddCard() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[220px] text-center">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xl font-light">
        +
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700">Dar entrada a una clienta</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-[160px]">
          Registra el check-in, asigna la estilista y el servicio para abrir su factura.
        </p>
      </div>
      <Link href="/admin/facturacion/check-in" className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
        + Check-in
      </Link>
    </div>
  );
}

export default function FacturacionPage() {
  const [tab, setTab] = useState<Tab>("salon");

  const enEspera    = clients.filter((c) => c.status === "en-espera").length;
  const enAtencion  = clients.filter((c) => c.status === "en-atencion").length;
  const porCobrar   = clients.filter((c) => c.status === "por-cobrar").length;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Facturación</h1>
          <p className="text-sm text-zinc-400 mt-1">Clientas en el establecimiento · miércoles 2 sep</p>
        </div>
        <Link href="/admin/facturacion/check-in" className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap self-start">
          + Check-in de clienta
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">En espera</p>
          <p className="text-3xl font-bold text-zinc-900">{enEspera}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">En atención</p>
          <p className="text-3xl font-bold text-zinc-900">{enAtencion}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Por cobrar</p>
          <p className="text-3xl font-bold text-zinc-900">{porCobrar}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Facturado hoy</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">RD$18,450</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-zinc-200 mb-5">
        {(["salon", "cerradas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t === "salon" ? "En el salón" : "Cerradas hoy"}
          </button>
        ))}
      </div>

      {/* ── En el salón ── */}
      {tab === "salon" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <ClientCardView key={c.id} c={c} />
          ))}
          <AddCard />
        </div>
      )}

      {/* ── Cerradas hoy ── */}
      {tab === "cerradas" && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
            {["Clienta", "Servicio", "Estilista", "Total", "Hora"].map((h) => (
              <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {closed.length === 0 ? (
            <p className="px-6 py-8 text-sm text-zinc-400">No hay facturas cerradas hoy.</p>
          ) : (
            closed.map((r, i) => (
              <div key={i} className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {r.initial}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 truncate">{r.name}</span>
                </div>
                <span className="text-sm text-zinc-600">{r.servicio}</span>
                <span className="text-sm text-zinc-600">{r.estilista}</span>
                <span className="text-sm font-semibold text-zinc-900">{r.total}</span>
                <span className="text-sm text-zinc-400">{r.hora}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
