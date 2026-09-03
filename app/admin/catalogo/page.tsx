"use client";

import { useRef, useState } from "react";

/* ── Icons ── */
function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
      <rect x="2" y="2" width="24" height="24" rx="3" />
      <circle cx="9.5" cy="9.5" r="2.5" />
      <path d="M2 19l7-7 5 5 3-3 9 9" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/* ── Types ── */
type CategoryId = "instalacion" | "express" | "mantenimiento";
type Platform = "web-app" | "solo-app";

interface Service {
  id: string;
  name: string;
  category: CategoryId;
  duration: string;
  price: string;
  platform: Platform;
}

interface Product {
  id: string;
  image: null;
  tag: string;
  tagLow?: boolean;
  name: string;
  units: number;
  maxUnits: number;
  price: string;
  stockLow?: boolean;
}

/* ── Data ── */
const services: Service[] = [
  { id: "s1", name: "Tape-in",             category: "instalacion",  duration: "1.5 h",  price: "RD$3,200", platform: "web-app"  },
  { id: "s2", name: "Nano ring",           category: "instalacion",  duration: "3 h",    price: "RD$4,800", platform: "web-app"  },
  { id: "s3", name: "Ponytail",            category: "express",      duration: "30 min", price: "RD$1,900", platform: "web-app"  },
  { id: "s4", name: "Retiro de extensiones", category: "mantenimiento", duration: "45 min", price: "RD$1,200", platform: "solo-app" },
];

const products: Product[] = [
  { id: "p1", image: null, tag: "Remy",      name: 'Rubio balayage 18"',   units: 14, maxUnits: 20, price: "RD$4,200" },
  { id: "p2", image: null, tag: "Stock bajo", tagLow: true, name: 'Negro natural 16"',    units: 3,  maxUnits: 20, price: "RD$3,600", stockLow: true },
  { id: "p3", image: null, tag: "Remy",      name: 'Chocolate ombré 22"',  units: 9,  maxUnits: 20, price: "RD$5,100" },
  { id: "p4", image: null, tag: "Virgin",    name: 'Castaño natural 20"',  units: 11, maxUnits: 20, price: "RD$2,850" },
];

const categoryStyles: Record<CategoryId, { label: string; className: string }> = {
  instalacion:   { label: "Instalación",   className: "bg-amber-50 text-amber-600 border border-amber-200" },
  express:       { label: "Express",       className: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  mantenimiento: { label: "Mantenimiento", className: "bg-sky-50 text-sky-600 border border-sky-200" },
};

const stockLowCount = products.filter((p) => p.stockLow).length;

/* ── Product Image Upload Card ── */
function ProductImageArea({ productId }: { productId: string }) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  }

  function handleClick() {
    inputRef.current?.click();
  }

  return (
    <div
      className="relative border-b border-zinc-100 aspect-[4/3] flex flex-col items-center justify-center gap-1.5 bg-zinc-50 cursor-pointer group overflow-hidden"
      onClick={handleClick}
      title="Haz clic para subir una imagen"
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={`Subir imagen para producto ${productId}`}
      />

      {imageSrc ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt="Imagen del producto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Hover overlay to change image */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
            <CameraIcon />
            <span className="text-xs font-medium">Cambiar imagen</span>
          </div>
        </>
      ) : (
        <>
          <ImageIcon />
          <span className="text-xs text-zinc-400 group-hover:text-zinc-600 transition-colors">
            Haz clic para subir
          </span>
        </>
      )}
    </div>
  );
}

/* ── Page ── */
export default function CatalogoPage() {
  return (
    <div className="min-h-full bg-zinc-50 p-5 lg:p-7">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Catálogo</h1>
          <p className="text-sm text-zinc-400 mt-1">Lo que se publica aquí alimenta el sitio web y la app.</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap">
            + Producto
          </button>
          <button className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
            + Servicio
          </button>
        </div>
      </div>

      {/* ── Servicios ── */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden mb-5">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-bold text-zinc-900">Servicios</h2>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-4 px-5 pb-2.5 border-b border-zinc-100">
          {["Servicio", "Categoría", "Duración", "Precio", "Publicado"].map((h) => (
            <span key={h} className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {services.map((s) => {
          const cat = categoryStyles[s.category];
          return (
            <div
              key={s.id}
              className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] gap-4 items-center px-5 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors cursor-pointer"
            >
              <span className="text-sm font-medium text-zinc-900">{s.name}</span>

              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-block w-fit ${cat.className}`}>
                {cat.label}
              </span>

              <span className="text-sm text-zinc-600">{s.duration}</span>

              <span className="text-sm font-semibold text-zinc-900">{s.price}</span>

              <span className="text-sm text-zinc-500">
                {s.platform === "web-app" ? "Web · app" : "Solo app"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Inventario de cabello ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-zinc-900">Inventario de cabello</h2>
          {stockLowCount > 0 && (
            <span className="text-sm font-semibold text-orange-500">
              {stockLowCount} con stock bajo
            </span>
          )}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const stockPct = Math.round((p.units / p.maxUnits) * 100);
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-sm hover:border-zinc-300 transition-all cursor-pointer"
              >
                {/* Image area */}
                <ProductImageArea productId={p.id} />

                {/* Info */}
                <div className="p-3.5">
                  {/* Tag */}
                  <span className={`text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full inline-block mb-2 ${
                    p.tagLow
                      ? "bg-orange-50 text-orange-500"
                      : "bg-zinc-100 text-zinc-500"
                  }`}>
                    {p.tag}
                  </span>

                  {/* Name */}
                  <p className="text-sm font-bold text-zinc-900 leading-snug mb-2">{p.name}</p>

                  {/* Stock bar */}
                  <div className="h-1 bg-zinc-100 rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full ${p.stockLow ? "bg-orange-400" : "bg-zinc-700"}`}
                      style={{ width: `${stockPct}%` }}
                    />
                  </div>

                  {/* Units & price */}
                  <p className="text-xs text-zinc-400">
                    <span className={p.stockLow ? "text-orange-500 font-semibold" : ""}>
                      {p.units} unidades
                    </span>
                    {" · "}
                    <span className={p.stockLow ? "text-orange-500 font-semibold" : ""}>
                      {p.price}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
