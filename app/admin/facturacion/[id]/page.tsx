"use client";

import Link from "next/link";
import { useState } from "react";
import { use } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1" width="9" height="5" rx="1" />
      <path d="M3 10H1.5A.5.5 0 0 1 1 9.5v-4A.5.5 0 0 1 1.5 5h12a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H12" />
      <rect x="3" y="9" width="9" height="5" rx="1" />
    </svg>
  );
}

type LineItem = {
  id: string;
  concepto: string;
  subtext?: string;
  tipo: "Servicio" | "Producto";
  initial: string;
  agregadoPor: string;
  rol: string;
  hora: string;
  cant: number;
  importe: string;
};

const lineItems: LineItem[] = [
  {
    id: "l1",
    concepto: 'Instalación tape-in 20"',
    subtext: "Servicio principal de la cita",
    tipo: "Servicio",
    initial: "M",
    agregadoPor: "Mariana Ríos",
    rol: "Estilista",
    hora: "11:02",
    cant: 1,
    importe: "RD$3,200",
  },
  {
    id: "l2",
    concepto: "Cabello virgin castaño 4 · 20\"",
    subtext: "SKU VG-C4-20 · descontado de inventario",
    tipo: "Producto",
    initial: "M",
    agregadoPor: "Mariana Ríos",
    rol: "Estilista",
    hora: "11:14",
    cant: 2,
    importe: "RD$5,600",
  },
  {
    id: "l3",
    concepto: "Lavado y secado",
    subtext: "Agregado durante el servicio",
    tipo: "Servicio",
    initial: "S",
    agregadoPor: "Sofía Luna",
    rol: "Estilista",
    hora: "11:38",
    cant: 1,
    importe: "RD$650",
  },
  {
    id: "l4",
    concepto: "Shampoo sin sulfato 250 ml",
    subtext: "SKU MC-SH-250 · venta al detalle",
    tipo: "Producto",
    initial: "C",
    agregadoPor: "Carla Nova",
    rol: "Recepción",
    hora: "11:52",
    cant: 1,
    importe: "RD$780",
  },
  {
    id: "l5",
    concepto: "Sellador de puntas",
    subtext: "Agregado al cierre del servicio",
    tipo: "Servicio",
    initial: "M",
    agregadoPor: "Mariana Ríos",
    rol: "Estilista",
    hora: "12:05",
    cant: 1,
    importe: "RD$450",
  },
];

const comisiones = [
  { initial: "M", nombre: "Mariana Ríos", lineas: "3 líneas · 15%", monto: "RD$1,387" },
  { initial: "S", nombre: "Sofía Luna",   lineas: "1 línea · 15%",  monto: "RD$97"   },
  { initial: "C", nombre: "Carla Nova",   lineas: "1 línea · 5%",   monto: "RD$39"   },
];

const bitacora = [
  { hora: "11:02", texto: "Carla Nova dio entrada a la cliente" },
  { hora: "11:14", texto: "Mariana Ríos agregó cabello virgin castaño 4" },
  { hora: "11:38", texto: "Sofía Luna agregó lavado y secado" },
  { hora: "12:05", texto: "Mariana Ríos cerró el servicio" },
];

type MetodoPago = "tarjeta" | "efectivo" | "transferencia" | "mixto";

export default function DetalleFacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("tarjeta");
  const [whatsapp, setWhatsapp] = useState(false);

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href="/admin/facturacion"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3"
        >
          <ChevronLeft />
          Facturación
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Factura {id}</h1>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                  Abierta
                </span>
                <span className="text-xs text-zinc-400">·</span>
                <span className="text-xs text-zinc-500 font-medium">en atención</span>
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Entrada 11:02 am · miércoles 2 sep · abierta por Carla Nova (recepción)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
              <PrintIcon />
              Imprimir
            </button>
            <button className="px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
              + Agregar productos y servicios
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Datos de la cliente */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Datos de la cliente
            </p>

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                  V
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Valentina Reyes</p>
                  <p className="text-xs text-zinc-400">Cliente desde marzo 2025 · 8 visitas</p>
                </div>
              </div>
              <Link
                href="/admin/clientas/valentina-reyes"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors whitespace-nowrap"
              >
                Ver perfil
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Teléfono</p>
                <p className="text-sm text-zinc-800">809 555 0142</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Correo</p>
                <p className="text-sm text-zinc-800">valentina.reyes@gmail.com</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Última visita</p>
                <p className="text-sm text-zinc-800">14 jul 2026</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Nota de la cliente</p>
              <p className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3">
                Cuero sensible en la nuca, evitar tensión alta. Prefiere raya al lado.
              </p>
            </div>
          </div>

          {/* Datos del servicio */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Datos del servicio
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Servicio principal</p>
                <p className="text-sm text-zinc-800 font-medium">Tape-in 20"</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Estilista asignada</p>
                <p className="text-sm text-zinc-800 font-medium">Mariana Ríos</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Cita</p>
                <p className="text-sm text-zinc-800 font-medium">11:00 am</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Duración estimada</p>
                <p className="text-sm text-zinc-800 font-medium">1.5 horas</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Cabello usado</p>
                <p className="text-sm text-zinc-800 font-medium">Virgin · castaño 4 · 20"</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Depósito</p>
                <p className="text-sm text-zinc-800 font-medium">RD$1,000 · verificado</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Método de depósito</p>
                <p className="text-sm text-zinc-800 font-medium">Transferencia Popular</p>
              </div>
            </div>
          </div>

          {/* Servicios y productos agregados */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Servicios y productos agregados</p>
                <p className="text-xs text-zinc-400 mt-0.5">5 líneas · registradas por el personal que la atendió</p>
              </div>
              <button className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
                + Agregar
              </button>
            </div>

            {/* Table header */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100 bg-zinc-50/50">
              {["Concepto", "Tipo", "Agregado por", "Hora", "Cant.", "Importe"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>

            {lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-x-4 gap-y-1 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item.concepto}</p>
                  {item.subtext && (
                    <p className="text-xs text-zinc-400 mt-0.5">{item.subtext}</p>
                  )}
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.tipo === "Servicio"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-purple-50 text-purple-700"
                  }`}>
                    {item.tipo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {item.initial}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-800">{item.agregadoPor}</p>
                    <p className="text-xs text-zinc-400">{item.rol}</p>
                  </div>
                </div>
                <span className="text-sm text-zinc-500 sm:block hidden">{item.hora}</span>
                <span className="text-sm text-zinc-700 font-medium sm:block hidden">{item.cant}</span>
                <span className="text-sm font-semibold text-zinc-900 sm:text-right">{item.importe}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:w-72 flex flex-col gap-4 shrink-0">

          {/* Resumen de cobro */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Resumen de cobro
            </p>

            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Servicios (3)</span>
                <span className="text-zinc-800 font-medium">RD$4,300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Productos (2)</span>
                <span className="text-zinc-800 font-medium">RD$6,380</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2.5">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-800 font-medium">RD$10,680</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Itbis 18%</span>
                <span className="text-zinc-800 font-medium">RD$1,922</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Depósito aplicado</span>
                <span className="text-green-700 font-medium">− RD$1,000</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3 mb-3">
              <span className="text-xs font-semibold text-zinc-400">Total a cobrar</span>
              <span className="text-lg font-bold">RD$11,602</span>
            </div>

            <button className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
              Cobrar RD$11,602
            </button>
            <p className="text-[10px] text-zinc-400 text-center mt-2">
              Al cobrar se cierra la factura y se calculan las comisiones.
            </p>
          </div>

          {/* Comisiones estimadas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Comisiones estimadas
            </p>

            <div className="space-y-3">
              {comisiones.map((c) => (
                <div key={c.nombre} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {c.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{c.nombre}</p>
                    <p className="text-xs text-zinc-400">{c.lineas}</p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{c.monto}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Método de pago
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {(["tarjeta", "efectivo", "transferencia", "mixto"] as MetodoPago[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodoPago(m)}
                  className={`py-2.5 text-sm font-semibold rounded-xl border-2 capitalize transition-colors ${
                    metodoPago === m
                      ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
              />
              <span className="text-sm text-zinc-600">Enviar factura por WhatsApp</span>
            </label>
          </div>

          {/* Bitácora */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Bitácora
            </p>

            <div className="space-y-2.5">
              {bitacora.map((entry, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-xs font-semibold text-zinc-400 shrink-0 mt-0.5">{entry.hora}</span>
                  <span className="text-xs text-zinc-600">{entry.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
