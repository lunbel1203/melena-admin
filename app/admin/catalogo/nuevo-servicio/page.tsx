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

const categorias = [
  { id: "Instalación",   desc: "Servicio de extensiones completo" },
  { id: "Express",       desc: "Servicio rápido, menos de 1 hora" },
  { id: "Mantenimiento", desc: "Retoque, retiro o cuidado" },
];

const staffList = ["Mariana Ríos", "Sofía Luna", "Vanessa Gil", "Todas"];

export default function NuevoServicioPage() {
  const [nombre, setNombre]       = useState("");
  const [categoria, setCategoria] = useState("");
  const [duracion, setDuracion]   = useState("");
  const [precio, setPrecio]       = useState("");
  const [deposito, setDeposito]   = useState("");
  const [sinDeposito, setSinDeposito] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  function toggleStaff(s: string) {
    if (s === "Todas") { setSelectedStaff(["Todas"]); return; }
    setSelectedStaff((prev) => {
      const without = prev.filter((x) => x !== "Todas");
      return without.includes(s) ? without.filter((x) => x !== s) : [...without, s];
    });
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo?tab=servicios" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nuevo servicio</h1>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del servicio</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Tape-in"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Descripción pública</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción que verán las clientas al agendar..."
                  rows={3} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Categoría</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {categorias.map((c) => (
                <button key={c.id} onClick={() => setCategoria(c.id)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${categoria === c.id ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-200"}`}>
                  <p className="text-sm font-semibold text-zinc-900">{c.id}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Duración y precio</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Duración estimada</label>
                <input value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Ej. 1.5 h"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio</label>
                <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="RD$3,200"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Depósito de reserva</label>
              <input value={sinDeposito ? "" : deposito} onChange={(e) => setDeposito(e.target.value)}
                disabled={sinDeposito} placeholder="RD$1,000"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-40 mb-2" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sinDeposito} onChange={(e) => setSinDeposito(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                <span className="text-sm text-zinc-600">Sin depósito requerido</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>4 · Quién lo ofrece</SectionLabel>
            <div className="space-y-2">
              {staffList.map((s) => {
                const active = selectedStaff.includes(s);
                return (
                  <button key={s} onClick={() => toggleStaff(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                      {s === "Todas" ? "✦" : s.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-zinc-900">{s}</span>
                    {active && <span className="ml-auto text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Seleccionada</span>}
                  </button>
                );
              })}
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
                  ["Nombre",    nombre     || "—"],
                  ["Categoría", categoria  || "—"],
                  ["Duración",  duracion   || "—"],
                  ["Precio",    precio     || "—"],
                  ["Depósito",  sinDeposito ? "Sin depósito" : deposito || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link href="/admin/catalogo?tab=servicios" className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Crear servicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
