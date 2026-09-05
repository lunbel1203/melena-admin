"use client";

import Link from "next/link";
import { use } from "react";


function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

type Order = {
  fecha: string;
  contenido: string;
  unidades: number;
  total: string;
  estado: "Recibida" | "En tránsito" | "Pendiente";
};

type Product = {
  initial: string;
  name: string;
  costo: string;
  stock: number;
  stockLow?: boolean;
};

type Supplier = {
  initial: string;
  name: string;
  estado: "Activo" | "Inactivo" | "Por recibir";
  categoria: string;
  location: string;
  desde: string;
  stats: { ordenesAno: number; unidadesRecibidas: number; costoPromedio: string; comprasAno: string };
  contacto: { persona: string; telefono: string; correo: string };
  condiciones: { moneda: string; formaPago: string; plazo: string; rnc: string };
  direccion: string;
  nota: string;
  ordenes: Order[];
  productos: Product[];
};

const supplierData: Record<string, Supplier> = {
  "hair-import-rd": {
    initial: "H", name: "Hair Import RD",
    estado: "Activo", categoria: "Cabello", location: "Santo Domingo", desde: "feb 2021",
    stats: { ordenesAno: 18, unidadesRecibidas: 312, costoPromedio: "RD$2,700", comprasAno: "RD$842K" },
    contacto: { persona: "Rafael Guzmán", telefono: "809 555 7712", correo: "ventas@hairimport.do" },
    condiciones: { moneda: "RD$", formaPago: "Transferencia", plazo: "7 a 10 días", rnc: "1-01-84210-3" },
    direccion: "Calle El Conde 48, Zona Colonial\nSanto Domingo, Rep. Dominicana",
    nota: "Pedido mínimo de 6 unidades. Avisar con una semana de anticipación para colores personalizados.",
    ordenes: [
      { fecha: "19 ago", contenido: 'Rubio balayage 18" y 20"', unidades: 10, total: "RD$24,000", estado: "Recibida" },
      { fecha: "2 ago",  contenido: 'Castaño natural 20"',       unidades: 12, total: "RD$28,800", estado: "Recibida" },
      { fecha: "28 jul", contenido: 'Negro natural 16"',          unidades: 8,  total: "RD$19,200", estado: "Recibida" },
      { fecha: "1 sep",  contenido: 'Chocolate ombré 22"',        unidades: 6,  total: "RD$16,200", estado: "En tránsito" },
    ],
    productos: [
      { initial: "R", name: "Rubio balayage", costo: "RD$2,400", stock: 14 },
      { initial: "C", name: "Castaño natural", costo: "RD$1,700", stock: 11 },
      { initial: "N", name: "Negro natural",   costo: "RD$2,100", stock: 3, stockLow: true },
    ],
  },
  "virgin-hair-co": {
    initial: "V", name: "Virgin Hair Co.",
    estado: "Activo", categoria: "Cabello", location: "Miami, EE.UU.", desde: "ene 2023",
    stats: { ordenesAno: 9, unidadesRecibidas: 178, costoPromedio: "RD$3,100", comprasAno: "RD$514K" },
    contacto: { persona: "Marie Johnson", telefono: "+1 305 555 0134", correo: "orders@virginhairco.com" },
    condiciones: { moneda: "USD", formaPago: "Transferencia", plazo: "15 a 20 días", rnc: "N/A" },
    direccion: "2850 NW 36th St\nMiami, FL 33142, EE.UU.",
    nota: "Pedidos en USD. Incluye costo de envío internacional.",
    ordenes: [
      { fecha: "2 ago",  contenido: 'Chocolate ombré 22" · 24"', unidades: 8, total: "RD$42,000", estado: "Recibida" },
      { fecha: "15 jun", contenido: 'Rubio balayage 20"',          unidades: 6, total: "RD$31,800", estado: "Recibida" },
    ],
    productos: [
      { initial: "C", name: "Chocolate ombré",  costo: "RD$2,900", stock: 9 },
      { initial: "R", name: "Rubio balayage",   costo: "RD$3,400", stock: 14 },
    ],
  },
  "adhesivos-pro": {
    initial: "A", name: "Adhesivos Pro",
    estado: "Por recibir", categoria: "Insumos", location: "Santiago", desde: "mar 2024",
    stats: { ordenesAno: 6, unidadesRecibidas: 240, costoPromedio: "RD$420", comprasAno: "RD$96K" },
    contacto: { persona: "Carlos Méndez", telefono: "809 555 3390", correo: "ventas@adhesivosPro.do" },
    condiciones: { moneda: "RD$", formaPago: "Efectivo", plazo: "3 a 5 días", rnc: "1-31-05820-1" },
    direccion: "Ave. Las Carreras 12, Los Jardines\nSantiago, Rep. Dominicana",
    nota: "Entrega directa al salón. Llamar antes de enviar.",
    ordenes: [
      { fecha: "28 ago", contenido: "Cintas tape-in · Adhesivo keratin", unidades: 40, total: "RD$16,000", estado: "En tránsito" },
      { fecha: "10 jul", contenido: "Cintas tape-in",                     unidades: 30, total: "RD$9,600",  estado: "Recibida" },
    ],
    productos: [
      { initial: "C", name: "Cintas tape-in",     costo: "RD$320", stock: 40 },
      { initial: "A", name: "Adhesivo keratina",  costo: "RD$580", stock: 12 },
    ],
  },
  "beauty-supply-dr": {
    initial: "B", name: "Beauty Supply DR",
    estado: "Activo", categoria: "Insumos", location: "Santo Domingo", desde: "ago 2022",
    stats: { ordenesAno: 11, unidadesRecibidas: 390, costoPromedio: "RD$310", comprasAno: "RD$71K" },
    contacto: { persona: "Lidia Castillo", telefono: "809 555 8801", correo: "info@beautysupplydr.com" },
    condiciones: { moneda: "RD$", formaPago: "Transferencia", plazo: "1 a 3 días", rnc: "1-01-23456-7" },
    direccion: "C/ Beller 34, Gazcue\nSanto Domingo, Rep. Dominicana",
    nota: "Proveedor de confianza para insumos de mantenimiento.",
    ordenes: [
      { fecha: "14 ago", contenido: "Microanillos · Herramientas", unidades: 60, total: "RD$9,200", estado: "Recibida" },
      { fecha: "30 jul", contenido: "Shampoo profesional x12",      unidades: 12, total: "RD$6,800", estado: "Recibida" },
    ],
    productos: [
      { initial: "M", name: "Microanillos",        costo: "RD$180", stock: 60 },
      { initial: "S", name: "Shampoo profesional", costo: "RD$520", stock: 12 },
    ],
  },
  "remy-trading": {
    initial: "R", name: "Remy Trading",
    estado: "Inactivo", categoria: "Cabello", location: "Panamá", desde: "oct 2022",
    stats: { ordenesAno: 2, unidadesRecibidas: 24, costoPromedio: "RD$1,900", comprasAno: "RD$38K" },
    contacto: { persona: "José Vargas", telefono: "+507 555 2210", correo: "jvargas@remytrading.pa" },
    condiciones: { moneda: "USD", formaPago: "Crédito 30 días", plazo: "+30 días", rnc: "N/A" },
    direccion: "Calle 50, Torre Global Bank\nPanamá City, Panamá",
    nota: "Actualmente inactivo. Último pedido en marzo 2026.",
    ordenes: [
      { fecha: "mar 2026", contenido: 'Negro natural 14" · 16"', unidades: 10, total: "RD$21,000", estado: "Recibida" },
      { fecha: "ene 2026", contenido: 'Castaño natural 16"',      unidades: 14, total: "RD$17,000", estado: "Recibida" },
    ],
    productos: [
      { initial: "N", name: "Negro natural",   costo: "RD$1,800", stock: 3, stockLow: true },
      { initial: "C", name: "Castaño natural", costo: "RD$1,950", stock: 11 },
    ],
  },
};

const estadoBadge: Record<string, string> = {
  Activo:       "bg-green-50 text-green-700",
  "Por recibir": "bg-orange-50 text-orange-600",
  Inactivo:     "bg-zinc-100 text-zinc-500",
};

const ordenEstadoBadge: Record<string, string> = {
  Recibida:    "bg-green-50 text-green-700",
  "En tránsito": "bg-orange-50 text-orange-600",
  Pendiente:   "bg-zinc-100 text-zinc-500",
};

export default function ProveedorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const s = supplierData[slug];

  if (!s) {
    return (
      <div className="min-h-full bg-zinc-50 p-8">
        <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 mb-4 transition-colors">
          <ChevronLeft /> Proveedores
        </Link>
        <p className="text-sm text-zinc-500">Proveedor no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Back ── */}
      <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-4">
        <ChevronLeft />
        Proveedores
      </Link>

      {/* ── Hero ── */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-600 shrink-0">
          {s.initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold text-zinc-900">{s.name}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${estadoBadge[s.estado]}`}>
              {s.estado}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">
            {s.categoria} · {s.location} · desde {s.desde}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/admin/proveedores/${slug}/editar`} className="px-4 py-2 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
            Editar
          </Link>
          <button className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
            Registrar orden
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Órdenes del año</p>
          <p className="text-3xl font-bold text-zinc-900">{s.stats.ordenesAno}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Unidades recibidas</p>
          <p className="text-3xl font-bold text-zinc-900">{s.stats.unidadesRecibidas}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Costo promedio</p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{s.stats.costoPromedio}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Compras del año</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{s.stats.comprasAno}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Órdenes de compra */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Órdenes de compra</h2>
            </div>

            {/* Header */}
            <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-x-4 px-5 sm:px-6 py-2.5 border-b border-zinc-100">
              {["Fecha", "Contenido", "Unidades", "Total", "Estado"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {s.ordenes.map((o, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-x-4 items-center px-5 sm:px-6 py-3.5 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-500">{o.fecha}</span>
                <span className="text-sm text-zinc-700 truncate">{o.contenido}</span>
                <span className="text-sm text-zinc-600">{o.unidades}</span>
                <span className="text-sm font-semibold text-zinc-900">{o.total}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${ordenEstadoBadge[o.estado]}`}>
                  {o.estado}
                </span>
              </div>
            ))}
          </div>

          {/* Productos que suministra */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Productos que suministra</h2>
            </div>

            {s.productos.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-zinc-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                  {p.initial}
                </div>
                <span className="text-sm font-semibold text-zinc-900 flex-1">{p.name}</span>
                <span className="text-sm text-zinc-400">Costo {p.costo}</span>
                <span className={`text-sm font-semibold ml-4 ${p.stockLow ? "text-orange-500" : "text-zinc-500"}`}>
                  {p.stock} en stock
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:w-64 flex flex-col gap-4">

          {/* Contacto */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Contacto</p>
            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-start">
                <span className="text-xs text-zinc-400">Persona</span>
                <span className="text-sm text-zinc-800 font-medium text-right">{s.contacto.persona}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-zinc-400">Teléfono</span>
                <span className="text-sm text-zinc-800 font-medium text-right">{s.contacto.telefono}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-zinc-400">Correo</span>
                <span className="text-sm text-zinc-800 font-medium text-right break-all">{s.contacto.correo}</span>
              </div>
            </div>
            <a
              href={`https://wa.me/${s.contacto.telefono.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-sm font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl text-center hover:bg-zinc-100 transition-colors"
            >
              Escribir por WhatsApp
            </a>
          </div>

          {/* Condiciones */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Condiciones</p>
            <div className="space-y-2.5">
              <div className="flex justify-between">
                <span className="text-xs text-zinc-400">Moneda</span>
                <span className="text-sm text-zinc-800 font-medium">{s.condiciones.moneda}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-400">Forma de pago</span>
                <span className="text-sm text-zinc-800 font-medium">{s.condiciones.formaPago}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-400">Plazo de entrega</span>
                <span className="text-sm text-zinc-800 font-medium">{s.condiciones.plazo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-zinc-400">RNC</span>
                <span className="text-sm text-zinc-800 font-medium">{s.condiciones.rnc}</span>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Dirección</p>
            <p className="text-sm text-zinc-700 whitespace-pre-line">{s.direccion}</p>
          </div>

          {/* Nota interna */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Nota interna</p>
            <p className="text-sm text-zinc-700">{s.nota}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
