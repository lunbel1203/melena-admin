"use client";

import { useState } from "react";
import Link from "next/link";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
      {children}
    </p>
  );
}

const services = [
  { id: "s1", name: "Tape-in",   detail: "Desde RD$3,200" },
  { id: "s2", name: "Nano ring", detail: "Desde RD$4,800" },
  { id: "s3", name: "Bulk",      detail: "Desde RD$2,500" },
  { id: "s4", name: "Ponytail",  detail: "Desde RD$1,900" },
];

export default function NuevaClientaPage() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [nota, setNota] = useState("");

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link
          href="/admin/clientas"
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nueva clienta</h1>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[900px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Datos personales</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Valentina Reyes"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="809 555 0000"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Servicio de interés */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Servicio de interés</SectionLabel>
            <div className="grid grid-cols-2 gap-2.5">
              {services.map((s) => {
                const isSelected = selectedService === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-zinc-900 bg-white"
                        : "border-zinc-100 bg-white hover:border-zinc-200"
                    }`}
                  >
                    <div className="text-sm font-semibold text-zinc-900">{s.name}</div>
                    <div className="text-xs text-zinc-400 mt-1">{s.detail}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nota */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Nota interna</SectionLabel>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Alergias, preferencias, referencias de color..."
              rows={4}
              className="w-full text-sm text-zinc-800 placeholder-zinc-400 resize-none border-0 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lg:w-[320px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="font-semibold text-zinc-900 text-right truncate max-w-[160px]">
                    {nombre || "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Teléfono</span>
                  <span className="font-semibold text-zinc-900">{telefono || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Servicio</span>
                  <span className="font-semibold text-zinc-900">
                    {services.find((s) => s.id === selectedService)?.name ?? "—"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link
                href="/admin/clientas"
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Crear clienta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
