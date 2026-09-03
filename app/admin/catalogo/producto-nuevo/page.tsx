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

function PhotoPlaceholderIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
      <rect x="3" y="5" width="32" height="26" rx="3.5" />
      <circle cx="12" cy="15" r="3" />
      <path d="M3 27l9-9 6 6 4-4 13 12" />
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

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

/* ── Helpers ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1.5">
      {children}
    </p>
  );
}

function Select({ value, onChange, children }: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 bg-white focus:outline-none focus:border-zinc-400 transition-colors pr-8"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
        <ChevronIcon />
      </span>
    </div>
  );
}

/* ── Photo upload slot ── */
function PhotoSlot({ label }: { label: string }) {
  const [img, setImg] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex-1">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setImg(URL.createObjectURL(file));
        }}
      />
      {img ? (
        <div className="relative rounded-xl overflow-hidden border border-zinc-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt={label} className="w-full h-28 object-cover" />
          <button
            type="button"
            onClick={() => { setImg(null); if (ref.current) ref.current.value = ""; }}
            className="absolute top-1.5 right-1.5 bg-white border border-zinc-200 rounded-full p-1 text-zinc-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
            title="Eliminar"
          >
            <TrashIcon />
          </button>
        </div>
      ) : (
        <div
          onClick={() => ref.current?.click()}
          className="border-2 border-dashed border-zinc-200 rounded-xl py-6 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
        >
          <PhotoPlaceholderIcon />
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className="text-[11px] text-zinc-400 underline">or browse files</p>
        </div>
      )}
    </div>
  );
}

/* ── Data ── */
const ALL_LARGOS = ['14"', '16"', '18"', '20"', '22"', '24"'];

/* ── Page ── */
export default function NuevoProductoPage() {
  /* Información */
  const [nombre, setNombre]         = useState("");
  const [tipo, setTipo]             = useState("Remy");
  const [color, setColor]           = useState("");
  const [textura, setTextura]       = useState("Liso");
  const [largos, setLargos]         = useState<Set<string>>(new Set(['18"', '20"', '22"']));

  const toggleLargo = (l: string) =>
    setLargos((prev) => { const n = new Set(prev); n.has(l) ? n.delete(l) : n.add(l); return n; });

  /* Precio e inventario */
  const [precioVenta, setPrecioVenta]   = useState("RD$4,200");
  const [costo, setCosto]               = useState("");
  const [stockInicial, setStockInicial] = useState("");
  const [alertaStock, setAlertaStock]   = useState("5 unidades");
  const [proveedor, setProveedor]       = useState("Hair Import RD");

  /* Descripción */
  const [descripcion, setDescripcion] = useState("");

  /* Publicación */
  const [pubSitio, setPubSitio]         = useState(true);
  const [pubApp, setPubApp]             = useState(true);
  const [pubWhatsapp, setPubWhatsapp]   = useState(true);
  const [masVendido, setMasVendido]     = useState(false);

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Nuevo producto</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Cabello e insumos que entran al inventario.</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Información */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Información</h2>

            {/* Nombre + Tipo */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Rubio balayage"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Tipo de cabello</FieldLabel>
                <Select value={tipo} onChange={setTipo}>
                  <option>Remy</option>
                  <option>Virgin</option>
                  <option>Sintético</option>
                </Select>
              </div>
            </div>

            {/* Color + Textura */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <FieldLabel>Color</FieldLabel>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Rubio con raíz oscura"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Textura</FieldLabel>
                <Select value={textura} onChange={setTextura}>
                  <option>Liso</option>
                  <option>Ondulado</option>
                  <option>Rizado</option>
                  <option>Muy rizado</option>
                </Select>
              </div>
            </div>

            {/* Largos disponibles */}
            <div>
              <FieldLabel>Largos disponibles</FieldLabel>
              <div className="flex flex-wrap gap-2">
                {ALL_LARGOS.map((l) => {
                  const active = largos.has(l);
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => toggleLargo(l)}
                      className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                        active
                          ? "bg-zinc-900 text-white border-zinc-900"
                          : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Precio e inventario */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Precio e inventario</h2>

            {/* Precio + Costo + Stock */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <FieldLabel>Precio de venta</FieldLabel>
                <Select value={precioVenta} onChange={setPrecioVenta}>
                  <option>RD$1,200</option>
                  <option>RD$1,900</option>
                  <option>RD$2,500</option>
                  <option>RD$3,200</option>
                  <option>RD$3,600</option>
                  <option>RD$4,200</option>
                  <option>RD$5,100</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Costo</FieldLabel>
                <input
                  type="text"
                  value={costo}
                  onChange={(e) => setCosto(e.target.value)}
                  placeholder="RD$2,400"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Stock inicial</FieldLabel>
                <input
                  type="number"
                  min={0}
                  value={stockInicial}
                  onChange={(e) => setStockInicial(e.target.value)}
                  placeholder="14"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            {/* Alerta + Proveedor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Alerta de stock bajo</FieldLabel>
                <Select value={alertaStock} onChange={setAlertaStock}>
                  <option>3 unidades</option>
                  <option>5 unidades</option>
                  <option>10 unidades</option>
                  <option>15 unidades</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Proveedor</FieldLabel>
                <Select value={proveedor} onChange={setProveedor}>
                  <option>Hair Import RD</option>
                  <option>Otro proveedor</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Descripción pública */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Descripción pública</h2>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cabello remy con degradado natural, se puede teñir y planchar."
              rows={4}
              className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[300px] shrink-0 space-y-4">

          {/* Fotos del producto */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Fotos del producto
            </p>
            <div className="flex gap-3">
              <PhotoSlot label="Principal" />
              <PhotoSlot label="Detalle" />
            </div>
          </div>

          {/* Publicación */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Publicación
            </p>
            <div className="space-y-0 divide-y divide-zinc-100">
              {[
                { label: "Catálogo del sitio web",      checked: pubSitio,    onChange: setPubSitio },
                { label: "Catálogo de la app",           checked: pubApp,      onChange: setPubApp },
                { label: "Botones whatsapp y agendar",  checked: pubWhatsapp, onChange: setPubWhatsapp },
                { label: "Marcar como más vendido",      checked: masVendido,  onChange: setMasVendido },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center justify-between py-3 cursor-pointer group">
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    {label}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
              Borrador
            </button>
            <button className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
              Publicar producto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
