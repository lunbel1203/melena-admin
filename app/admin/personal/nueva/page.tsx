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
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">
      {children}
    </p>
  );
}

const roles = [
  { id: "estilista",  label: "Estilista",   desc: "Realiza servicios de extensiones" },
  { id: "recepcion",  label: "Recepción",    desc: "Gestiona citas y atención al cliente" },
  { id: "caja",       label: "Caja",         desc: "Manejo de pagos y depósitos" },
];

const services = ["Tape-in", "Nano ring", "Bulk", "Ponytail", "Cortina", "Retiro"];

export default function NuevaEmpleadaPage() {
  const [nombre, setNombre]       = useState("");
  const [telefono, setTelefono]   = useState("");
  const [correo, setCorreo]       = useState("");
  const [rol, setRol]             = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [comision, setComision]   = useState("");
  const [nota, setNota]           = useState("");

  function toggleService(s: string) {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/personal" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nueva empleada</h1>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Datos personales</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Mariana Ríos"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="809 555 0000"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Correo electrónico</label>
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
          </div>

          {/* Rol */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Rol</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRol(r.id)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                    rol === r.id
                      ? "border-zinc-900 bg-white"
                      : "border-zinc-100 hover:border-zinc-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">{r.label}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Servicios que realiza */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Servicios que realiza</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const active = selectedServices.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleService(s)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-100 text-zinc-700 hover:border-zinc-200"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comisión */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>4 · Comisión</SectionLabel>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={comision}
                onChange={(e) => setComision(e.target.value)}
                placeholder="25"
                min="0"
                max="100"
                className="w-28 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <span className="text-sm font-semibold text-zinc-500">% sobre servicios realizados</span>
            </div>
          </div>

          {/* Nota interna */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Nota interna</SectionLabel>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Horario preferido, días de descanso, observaciones..."
              rows={3}
              className="w-full text-sm text-zinc-800 placeholder-zinc-400 resize-none border-0 outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lg:w-[300px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="font-semibold text-zinc-900 text-right max-w-[150px] truncate">{nombre || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Teléfono</span>
                  <span className="font-semibold text-zinc-900">{telefono || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rol</span>
                  <span className="font-semibold text-zinc-900">
                    {roles.find((r) => r.id === rol)?.label ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Comisión</span>
                  <span className="font-semibold text-zinc-900">{comision ? `${comision}%` : "—"}</span>
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">Servicios</span>
                    <span className="font-semibold text-zinc-900 text-right">{selectedServices.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link
                href="/admin/personal"
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Crear empleada
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
