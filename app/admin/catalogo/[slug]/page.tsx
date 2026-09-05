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
function ImageIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="24" height="20" rx="3" />
      <circle cx="9" cy="12" r="2.5" />
      <path d="M2 21l7-7 4 4 3-3 10 9" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5L13 4" />
    </svg>
  );
}

/* ── Photo slot ── */
function PhotoSlot({ label, large }: { label: string; large?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
    e.target.value = "";
  }
  function onDelete() { if (preview) URL.revokeObjectURL(preview); setPreview(null); }

  const h = large ? "h-36" : "h-24";
  if (preview) return (
    <div className={`relative rounded-xl overflow-hidden group ${h}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={preview} alt={label} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDelete} className="w-6 h-6 rounded-full bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 flex items-center justify-center shadow transition-colors">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
  return (
    <>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={onFile} />
      <button onClick={() => ref.current?.click()} className={`w-full ${h} border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-colors`}>
        <ImageIcon size={large ? 28 : 20} />
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <span className="text-[10px] text-zinc-400 underline">or browse files</span>
      </button>
    </>
  );
}

/* ── Data ── */
const serviceData: Record<string, {
  type: "service";
  name: string; badge: string; subtitle: string;
  stats: { label: string; value: string; sub?: string }[];
  ficha: { categoria: string; duracion: string; precio: string; deposito: string; descripcion: string };
  staff: { initial: string; name: string; stats: string; status: string; available: boolean }[];
  weeklyBars: number[];
  publication: { label: string; value: string }[];
  checkinDays: string[];
  checkinStats: { label: string; value: string }[];
}> = {
  "tape-in": {
    type: "service",
    name: "Tape-in", badge: "Publicado", subtitle: "Instalación · 1.5 h · RD$3,200",
    stats: [
      { label: "Citas del mes",        value: "38",       sub: "↑ 6 vs. julio" },
      { label: "Facturado",            value: "RD$121K",  sub: "29% del total" },
      { label: "Ticket promedio",      value: "RD$3,200", sub: "Sin variación" },
      { label: "Molestias reportadas", value: "4",        sub: "10% de las citas" },
    ],
    ficha: { categoria: "Instalación", duracion: "1.5 horas", precio: "RD$3,200", deposito: "RD$1,000", descripcion: "Cintas adhesivas de doble cara, instalación rápida y retirable. Ideal para uso diario." },
    staff: [
      { initial: "M", name: "Mariana Ríos", stats: "21 citas · RD$67K", status: "Disponible",  available: true },
      { initial: "S", name: "Sofía Luna",   stats: "17 citas · RD$54K", status: "Disponible",  available: true },
      { initial: "V", name: "Vanessa Gil",  stats: "Sin citas",          status: "No lo ofrece",available: false },
    ],
    weeklyBars: [30, 45, 55, 90, 40],
    publication: [
      { label: "Sitio web",        value: "Activo" },
      { label: "App de clientas",  value: "Activo" },
      { label: "Botón de whatsapp",value: "Activo" },
    ],
    checkinDays: ["Día 3", "Día 30"],
    checkinStats: [
      { label: "Tasa de respuesta",   value: "71%" },
      { label: "Molestia más común",  value: "Tirantez" },
    ],
  },
  "nano-ring": {
    type: "service",
    name: "Nano ring", badge: "Publicado", subtitle: "Instalación · 3 h · RD$4,800",
    stats: [
      { label: "Citas del mes",        value: "22",       sub: "↑ 3 vs. julio" },
      { label: "Facturado",            value: "RD$105K",  sub: "22% del total" },
      { label: "Ticket promedio",      value: "RD$4,800", sub: "Sin variación" },
      { label: "Molestias reportadas", value: "2",        sub: "9% de las citas" },
    ],
    ficha: { categoria: "Instalación", duracion: "3 horas", precio: "RD$4,800", deposito: "RD$1,000", descripcion: "Anillos de nano queratina sin calor. Larga duración y mínimo daño capilar." },
    staff: [
      { initial: "M", name: "Mariana Ríos", stats: "22 citas · RD$105K", status: "Disponible", available: true },
    ],
    weeklyBars: [20, 35, 40, 60, 30],
    publication: [
      { label: "Sitio web",        value: "Activo" },
      { label: "App de clientas",  value: "Activo" },
      { label: "Botón de whatsapp",value: "Activo" },
    ],
    checkinDays: ["Día 3", "Día 30"],
    checkinStats: [
      { label: "Tasa de respuesta",  value: "68%" },
      { label: "Molestia más común", value: "Picazón" },
    ],
  },
  "bulk": {
    type: "service",
    name: "Bulk", badge: "Publicado", subtitle: "Instalación · 4 h · RD$4,500",
    stats: [
      { label: "Citas del mes",        value: "15",       sub: "= vs. julio" },
      { label: "Facturado",            value: "RD$67K",   sub: "14% del total" },
      { label: "Ticket promedio",      value: "RD$4,500", sub: "Sin variación" },
      { label: "Molestias reportadas", value: "1",        sub: "7% de las citas" },
    ],
    ficha: { categoria: "Instalación", duracion: "4 horas", precio: "RD$4,500", deposito: "RD$1,000", descripcion: "Extensiones bulk trenzadas directamente en el cabello. Sin adhesivos ni anillos." },
    staff: [
      { initial: "V", name: "Vanessa Gil", stats: "10 citas · RD$45K", status: "Disponible", available: true },
      { initial: "S", name: "Sofía Luna",  stats: "5 citas · RD$22K",  status: "Disponible", available: true },
    ],
    weeklyBars: [15, 25, 30, 45, 20],
    publication: [
      { label: "Sitio web",        value: "Activo" },
      { label: "App de clientas",  value: "Activo" },
      { label: "Botón de whatsapp",value: "Activo" },
    ],
    checkinDays: ["Día 3", "Día 30"],
    checkinStats: [
      { label: "Tasa de respuesta",  value: "55%" },
      { label: "Molestia más común", value: "Tirantez" },
    ],
  },
  "ponytail": {
    type: "service",
    name: "Ponytail", badge: "Publicado", subtitle: "Express · 30 min · RD$1,900",
    stats: [
      { label: "Citas del mes",        value: "12",       sub: "↓ 2 vs. julio" },
      { label: "Facturado",            value: "RD$22K",   sub: "5% del total" },
      { label: "Ticket promedio",      value: "RD$1,900", sub: "Sin variación" },
      { label: "Molestias reportadas", value: "0",        sub: "0% de las citas" },
    ],
    ficha: { categoria: "Express", duracion: "30 minutos", precio: "RD$1,900", deposito: "Sin depósito", descripcion: "Cola de cabello de extensión. Rápido y de alto impacto visual." },
    staff: [
      { initial: "M", name: "Mariana Ríos", stats: "7 citas · RD$13K",  status: "Disponible", available: true },
      { initial: "S", name: "Sofía Luna",   stats: "5 citas · RD$9.5K", status: "Disponible", available: true },
    ],
    weeklyBars: [10, 15, 20, 25, 15],
    publication: [
      { label: "Sitio web",        value: "Activo" },
      { label: "App de clientas",  value: "Activo" },
      { label: "Botón de whatsapp",value: "Activo" },
    ],
    checkinDays: ["Día 1"],
    checkinStats: [
      { label: "Tasa de respuesta",  value: "40%" },
      { label: "Molestia más común", value: "—" },
    ],
  },
  "retiro-de-extensiones": {
    type: "service",
    name: "Retiro de extensiones", badge: "Solo app", subtitle: "Mantenimiento · 45 min · RD$1,200",
    stats: [
      { label: "Citas del mes",        value: "8",        sub: "= vs. julio" },
      { label: "Facturado",            value: "RD$9.6K",  sub: "2% del total" },
      { label: "Ticket promedio",      value: "RD$1,200", sub: "Sin variación" },
      { label: "Molestias reportadas", value: "0",        sub: "0% de las citas" },
    ],
    ficha: { categoria: "Mantenimiento", duracion: "45 minutos", precio: "RD$1,200", deposito: "Sin depósito", descripcion: "Retiro seguro de extensiones con productos especializados." },
    staff: [
      { initial: "M", name: "Mariana Ríos", stats: "5 citas · RD$6K", status: "Disponible", available: true },
      { initial: "S", name: "Sofía Luna",   stats: "3 citas · RD$3.6K", status: "Disponible", available: true },
    ],
    weeklyBars: [5, 10, 8, 12, 8],
    publication: [
      { label: "Sitio web",        value: "Inactivo" },
      { label: "App de clientas",  value: "Activo" },
      { label: "Botón de whatsapp",value: "Inactivo" },
    ],
    checkinDays: ["Día 1"],
    checkinStats: [
      { label: "Tasa de respuesta",  value: "30%" },
      { label: "Molestia más común", value: "—" },
    ],
  },
};

const productData: Record<string, {
  type: "product";
  name: string; badge: string; subtitle: string;
  stats: { label: string; value: string; sub?: string; bar?: number }[];
  ficha: { tipo: string; color: string; textura: string; precio: string; costo: string; alerta: string; largos: { label: string; agotado?: boolean }[] };
  movements: { date: string; movement: string; ref: string; stock: number }[];
  publication: { label: string; value: string }[];
  servicios: { name: string; citas: string }[];
}> = {
  "rubio-balayage": {
    type: "product",
    name: 'Rubio balayage 18"', badge: "Remy", subtitle: "SKU RB-18 · Hair Import RD",
    stats: [
      { label: "Stock actual",    value: "14", bar: 70 },
      { label: "Vendidas del mes",value: "9",  sub: "↑ 2 vs. julio" },
      { label: "Margen",          value: "43%",sub: "RD$1,800 por unidad" },
      { label: "Ingreso del mes", value: "RD$37.8K", sub: "9 unidades" },
    ],
    ficha: {
      tipo: "Remy", color: "Rubio con raíz oscura", textura: "Liso",
      precio: "RD$4,200", costo: "RD$2,400", alerta: "5 unidades",
      largos: [{ label: '18"' }, { label: '20"' }, { label: '22"' }, { label: '24"', agotado: true }],
    },
    movements: [
      { date: "24 ago", movement: "Salida · 1 unidad",   ref: "Valentina Reyes", stock: 14 },
      { date: "19 ago", movement: "Entrada · 10 unidades",ref: "Hair Import RD",  stock: 15 },
      { date: "12 ago", movement: "Salida · 2 unidades",  ref: "Renata Morales",  stock: 5  },
      { date: "5 ago",  movement: "Ajuste · −1 unidad",   ref: "Merma",           stock: 7  },
    ],
    publication: [
      { label: "Catálogo del sitio web", value: "Activo" },
      { label: "Catálogo de la app",     value: "Activo" },
      { label: "Whatsapp y agendar",     value: "Activo" },
      { label: "Más vendido",            value: "No" },
    ],
    servicios: [
      { name: "Tape-in",   citas: "6 citas" },
      { name: "Nano ring", citas: "3 citas" },
    ],
  },
  "negro-natural": {
    type: "product",
    name: 'Negro natural 16"', badge: "Virgin", subtitle: "SKU NN-16 · Hair Import RD",
    stats: [
      { label: "Stock actual",    value: "3",  bar: 15 },
      { label: "Vendidas del mes",value: "5",  sub: "↑ 1 vs. julio" },
      { label: "Margen",          value: "38%",sub: "RD$1,368 por unidad" },
      { label: "Ingreso del mes", value: "RD$18K", sub: "5 unidades" },
    ],
    ficha: {
      tipo: "Virgin", color: "Negro azabache", textura: "Liso",
      precio: "RD$3,600", costo: "RD$2,232", alerta: "5 unidades",
      largos: [{ label: '14"' }, { label: '16"' }, { label: '18"' }],
    },
    movements: [
      { date: "22 ago", movement: "Salida · 2 unidades",   ref: "Camila Santos",  stock: 3 },
      { date: "15 ago", movement: "Salida · 3 unidades",   ref: "Andrea Peña",    stock: 5 },
      { date: "10 ago", movement: "Entrada · 8 unidades",  ref: "Hair Import RD", stock: 8 },
    ],
    publication: [
      { label: "Catálogo del sitio web", value: "Activo" },
      { label: "Catálogo de la app",     value: "Activo" },
      { label: "Whatsapp y agendar",     value: "Activo" },
      { label: "Más vendido",            value: "No" },
    ],
    servicios: [
      { name: "Nano ring", citas: "5 citas" },
      { name: "Tape-in",   citas: "2 citas" },
    ],
  },
  "chocolate-ombre": {
    type: "product",
    name: 'Chocolate ombré 22"', badge: "Remy", subtitle: "SKU CO-22 · Hair Import RD",
    stats: [
      { label: "Stock actual",    value: "9",  bar: 45 },
      { label: "Vendidas del mes",value: "6",  sub: "= vs. julio" },
      { label: "Margen",          value: "41%",sub: "RD$2,091 por unidad" },
      { label: "Ingreso del mes", value: "RD$30.6K", sub: "6 unidades" },
    ],
    ficha: {
      tipo: "Remy", color: "Degradado a caramelo", textura: "Liso",
      precio: "RD$5,100", costo: "RD$3,009", alerta: "5 unidades",
      largos: [{ label: '20"' }, { label: '22"' }, { label: '24"' }],
    },
    movements: [
      { date: "23 ago", movement: "Salida · 1 unidad",    ref: "Valentina Reyes", stock: 9  },
      { date: "14 ago", movement: "Salida · 2 unidades",  ref: "Daniela Paz",     stock: 10 },
      { date: "8 ago",  movement: "Entrada · 5 unidades", ref: "Hair Import RD",  stock: 12 },
    ],
    publication: [
      { label: "Catálogo del sitio web", value: "Activo" },
      { label: "Catálogo de la app",     value: "Activo" },
      { label: "Whatsapp y agendar",     value: "Activo" },
      { label: "Más vendido",            value: "Activo" },
    ],
    servicios: [
      { name: "Tape-in",   citas: "4 citas" },
      { name: "Nano ring", citas: "2 citas" },
    ],
  },
  "castano-natural": {
    type: "product",
    name: 'Castaño natural 20"', badge: "Virgin", subtitle: "SKU CN-20 · Hair Import RD",
    stats: [
      { label: "Stock actual",    value: "11", bar: 55 },
      { label: "Vendidas del mes",value: "4",  sub: "↓ 1 vs. julio" },
      { label: "Margen",          value: "39%",sub: "RD$1,111 por unidad" },
      { label: "Ingreso del mes", value: "RD$11.4K", sub: "4 unidades" },
    ],
    ficha: {
      tipo: "Virgin", color: "Castaño medio uniforme", textura: "Liso",
      precio: "RD$2,850", costo: "RD$1,739", alerta: "5 unidades",
      largos: [{ label: '16"' }, { label: '18"' }, { label: '20"' }],
    },
    movements: [
      { date: "21 ago", movement: "Salida · 1 unidad",    ref: "Lucia Ferrer",   stock: 11 },
      { date: "12 ago", movement: "Salida · 3 unidades",  ref: "Camila Santos",  stock: 12 },
      { date: "5 ago",  movement: "Entrada · 6 unidades", ref: "Hair Import RD", stock: 15 },
    ],
    publication: [
      { label: "Catálogo del sitio web", value: "Activo"   },
      { label: "Catálogo de la app",     value: "Activo"   },
      { label: "Whatsapp y agendar",     value: "Activo"   },
      { label: "Más vendido",            value: "No" },
    ],
    servicios: [
      { name: "Tape-in",   citas: "3 citas" },
      { name: "Nano ring", citas: "1 cita"  },
    ],
  },
};

/* ── Helpers ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">{children}</p>;
}

function PublicationRow({ label, value }: { label: string; value: string }) {
  const active = value === "Activo";
  const inactive = value === "Inactivo" || value === "No";
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0">
      <span className="text-sm text-zinc-600">{label}</span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        active   ? "bg-green-50 text-green-700" :
        inactive ? "bg-zinc-100 text-zinc-500"  :
                   "bg-zinc-100 text-zinc-500"
      }`}>{value}</span>
    </div>
  );
}

/* ── Page ── */
export default function CatalogoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const service = serviceData[slug];
  const product = productData[slug];

  if (service) return <ServiceDetail data={service} slug={slug} />;
  if (product) return <ProductDetail data={product} slug={slug} />;
  return <div className="p-8 text-zinc-400">Página no encontrada.</div>;
}

/* ══════════════════════════════════════════
   SERVICE DETAIL
══════════════════════════════════════════ */
function ServiceDetail({ data, slug }: { data: typeof serviceData[string]; slug: string }) {
  const [activeCheckin, setActiveCheckin] = useState(0);
  const maxBar = Math.max(...data.weeklyBars);

  return (
    <div className="min-h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/catalogo?tab=servicios" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{data.name}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${data.badge === "Publicado" ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
                {data.badge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{data.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap">
              Despublicar
            </button>
            <Link href={`/admin/catalogo/${slug}/editar`} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Editar servicio
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.stats.map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 sm:p-5 ${i === 3 ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-100 shadow-sm"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${i === 3 ? "text-zinc-500" : "text-zinc-400"}`}>{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${i === 3 ? "text-white" : "text-zinc-900"}`}>{s.value}</p>
            {s.sub && <p className={`text-xs mt-1 ${i === 3 ? "text-zinc-400" : "text-zinc-400"}`}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Ficha */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Ficha del servicio</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
              {[
                ["Categoría", data.ficha.categoria],
                ["Duración",  data.ficha.duracion],
                ["Precio",    data.ficha.precio],
                ["Depósito de reserva", data.ficha.deposito],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{l}</p>
                  <p className="text-sm font-semibold text-zinc-900">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Descripción pública</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{data.ficha.descripcion}</p>
            </div>
          </div>

          {/* Quién lo ofrece */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Quién lo ofrece</h2>
            </div>
            {data.staff.map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-100 last:border-0">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">{s.initial}</div>
                <span className="text-sm font-semibold text-zinc-900 flex-1">{s.name}</span>
                <span className="text-sm text-zinc-400 hidden sm:block">{s.stats}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${s.available ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>

          {/* Citas por semana */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-5">Citas por semana</h2>
            <div className="flex items-end gap-3">
              {data.weeklyBars.map((v, i) => {
                const BAR_MAX_PX = 80;
                const barH = Math.max(4, Math.round((v / maxBar) * BAR_MAX_PX));
                const isMax = v === maxBar;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-md"
                      style={{ height: barH, backgroundColor: isMax ? "#18181b" : "#e4e4e7" }}
                    />
                    <span className="text-[10px] text-zinc-400">Sem {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="lg:w-[300px] xl:w-[310px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Foto del servicio</SectionLabel>
            <PhotoSlot label="Foto del servicio" large />
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Publicación</SectionLabel>
            {data.publication.map((p) => <PublicationRow key={p.label} {...p} />)}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Check-ins de bienestar</SectionLabel>
            <div className="flex gap-2 mb-4">
              {data.checkinDays.map((d, i) => (
                <button key={d} onClick={() => setActiveCheckin(i)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${activeCheckin === i ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
                  {d}
                </button>
              ))}
            </div>
            {data.checkinStats.map((s) => (
              <div key={s.label} className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0">
                <span className="text-sm text-zinc-600">{s.label}</span>
                <span className="text-sm font-semibold text-zinc-900">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PRODUCT DETAIL
══════════════════════════════════════════ */
function ProductDetail({ data, slug }: { data: typeof productData[string]; slug: string }) {
  return (
    <div className="min-h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{data.name}</h1>
              <span className="text-xs font-semibold border border-zinc-200 text-zinc-600 px-2.5 py-1 rounded-lg">{data.badge}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">{data.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap">
              Registrar entrada
            </button>
            <Link href={`/admin/catalogo/${slug}/editar`} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Editar producto
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {data.stats.map((s, i) => (
          <div key={i} className={`rounded-2xl border p-4 sm:p-5 ${i === 3 ? "bg-zinc-900 border-zinc-900" : "bg-white border-zinc-100 shadow-sm"}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2 ${i === 3 ? "text-zinc-500" : "text-zinc-400"}`}>{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${i === 3 ? "text-white" : "text-zinc-900"}`}>{s.value}</p>
            {s.bar !== undefined && (
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-zinc-800 rounded-full" style={{ width: `${s.bar}%` }} />
              </div>
            )}
            {s.sub && <p className={`text-xs mt-1.5 ${i === 3 ? "text-zinc-400" : "text-zinc-400"}`}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Body */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Ficha */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Ficha del producto</h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-4">
              {[
                ["Tipo",    data.ficha.tipo],
                ["Color",   data.ficha.color],
                ["Textura", data.ficha.textura],
                ["Precio de venta", data.ficha.precio],
                ["Costo",           data.ficha.costo],
                ["Alerta de stock", data.ficha.alerta],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{l}</p>
                  <p className="text-sm font-semibold text-zinc-900">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Largos disponibles</p>
              <div className="flex flex-wrap gap-2">
                {data.ficha.largos.map((l) => (
                  <span key={l.label} className={`text-xs font-semibold px-3 py-1.5 rounded-full ${l.agotado ? "border border-zinc-200 text-zinc-400" : "bg-zinc-900 text-white"}`}>
                    {l.label}{l.agotado ? " · agotado" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Movimientos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Movimientos de inventario</h2>
            </div>
            <div className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 px-5 py-2.5 border-b border-zinc-50">
              {["Fecha", "Movimiento", "Referencia", "Stock"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>
            {data.movements.map((m, i) => (
              <div key={i} className="grid grid-cols-[80px_1fr_1fr_auto] gap-x-4 items-center px-5 py-3.5 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors">
                <span className="text-sm text-zinc-500">{m.date}</span>
                <span className={`text-sm font-medium ${m.movement.startsWith("Entrada") ? "text-green-700" : m.movement.startsWith("Ajuste") ? "text-orange-600" : "text-zinc-900"}`}>{m.movement}</span>
                <span className="text-sm text-zinc-500">{m.ref}</span>
                <span className="text-sm font-semibold text-zinc-900">{m.stock}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div className="lg:w-[300px] xl:w-[310px] shrink-0 space-y-4">

          {/* Fotos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Fotos</SectionLabel>
            <div className="space-y-2">
              <PhotoSlot label="Foto principal" large />
              <div className="grid grid-cols-2 gap-2">
                <PhotoSlot label="Detalle" />
                <PhotoSlot label="Instalado" />
              </div>
            </div>
          </div>

          {/* Publicación */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Publicación</SectionLabel>
            {data.publication.map((p) => <PublicationRow key={p.label} {...p} />)}
          </div>

          {/* Servicios que lo usan */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <SectionLabel>Servicios que lo usan</SectionLabel>
            {data.servicios.map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2.5 border-b border-zinc-100 last:border-0">
                <span className="text-sm font-medium text-zinc-900">{s.name}</span>
                <span className="text-sm text-zinc-400">{s.citas}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
