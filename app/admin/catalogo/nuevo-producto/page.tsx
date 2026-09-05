"use client";

import Link from "next/link";
import { useState } from "react";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}

const tipos = ["Remy", "Virgin", "Sintético"];
const texturas = ["Liso", "Ondulado", "Rizado"];
const largosOpts = ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"'];

export default function NuevoProductoPage() {
  const [nombre, setNombre]       = useState("");
  const [tipo, setTipo]           = useState("");
  const [color, setColor]         = useState("");
  const [textura, setTextura]     = useState("");
  const [precio, setPrecio]       = useState("");
  const [costo, setCosto]         = useState("");
  const [alerta, setAlerta]       = useState("5");
  const [largos, setLargos]       = useState<string[]>([]);
  const [sku, setSku]             = useState("");
  const [proveedor, setProveedor] = useState("");

  function toggleLargo(l: string) {
    setLargos((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nuevo producto</h1>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del producto</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder='Ej. Rubio balayage 18"'
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">SKU</label>
                  <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="RB-18"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Proveedor</label>
                  <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} placeholder="Hair Import RD"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Color</label>
                <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Rubio con raíz oscura"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Tipo y textura</SectionLabel>
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-500 mb-2">Tipo</p>
              <div className="flex gap-2 flex-wrap">
                {tipos.map((t) => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${tipo === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-2">Textura</p>
              <div className="flex gap-2 flex-wrap">
                {texturas.map((t) => (
                  <button key={t} onClick={() => setTextura(t)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${textura === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Largos disponibles</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {largosOpts.map((l) => (
                <button key={l} onClick={() => toggleLargo(l)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${largos.includes(l) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>4 · Precios e inventario</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio de venta</label>
                <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="RD$4,200"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Costo</label>
                <input value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="RD$2,400"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Alerta de stock</label>
                <input type="number" value={alerta} onChange={(e) => setAlerta(e.target.value)} min="1"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-[300px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre",  nombre  || "—"],
                  ["Tipo",    tipo    || "—"],
                  ["Color",   color   || "—"],
                  ["Precio",  precio  || "—"],
                  ["Largos",  largos.length ? largos.join(", ") : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link href="/admin/catalogo" className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Crear producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
