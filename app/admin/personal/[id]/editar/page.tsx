"use client";

import Link from "next/link";
import { use, useState } from "react";

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
  { id: "Estilista",  desc: "Realiza servicios de extensiones" },
  { id: "Recepción",  desc: "Gestiona citas y atención al cliente" },
  { id: "Caja",       desc: "Manejo de pagos y depósitos" },
];

const allServices = ["Tape-in", "Nano ring", "Bulk", "Ponytail", "Cortina", "Retiro"];

const staffData: Record<string, {
  name: string; phone: string; email: string; role: string;
  commission: number; specialties: string[];
  canValidateDeposits: boolean; canSeeReports: boolean;
  schedule: { day: string; hours: string }[];
}> = {
  p1: {
    name: "Mariana Ríos", phone: "809 555 0188", email: "mariana@melenahumanhair.com",
    role: "Estilista", commission: 25,
    specialties: ["Tape-in", "Nano ring", "Bulk"],
    canValidateDeposits: false, canSeeReports: false,
    schedule: [
      { day: "Lunes a viernes", hours: "10:00 – 19:00" },
      { day: "Sábado",          hours: "9:00 – 17:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
  },
  p2: {
    name: "Sofía Luna", phone: "809 555 0201", email: "sofia@melenahumanhair.com",
    role: "Estilista", commission: 20,
    specialties: ["Tape-in", "Bulk"],
    canValidateDeposits: false, canSeeReports: false,
    schedule: [
      { day: "Lunes a viernes", hours: "9:00 – 18:00" },
      { day: "Sábado",          hours: "9:00 – 15:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
  },
  p3: {
    name: "Vanessa Gil", phone: "809 555 0314", email: "vanessa@melenahumanhair.com",
    role: "Estilista", commission: 20,
    specialties: ["Bulk", "Cortina"],
    canValidateDeposits: false, canSeeReports: false,
    schedule: [
      { day: "Lunes a viernes", hours: "10:00 – 18:00" },
      { day: "Sábado",          hours: "10:00 – 14:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
  },
  p4: {
    name: "Camila Torres", phone: "809 555 0422", email: "camila@melenahumanhair.com",
    role: "Recepción", commission: 0,
    specialties: [],
    canValidateDeposits: true, canSeeReports: true,
    schedule: [
      { day: "Lunes a viernes", hours: "8:00 – 17:00" },
      { day: "Sábado",          hours: "8:00 – 13:00" },
      { day: "Domingo",         hours: "Cerrado" },
    ],
  },
};

export default function EditarEmpleadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const base = staffData[id] ?? staffData["p1"];

  const [nombre, setNombre]           = useState(base.name);
  const [telefono, setTelefono]       = useState(base.phone);
  const [correo, setCorreo]           = useState(base.email);
  const [rol, setRol]                 = useState(base.role);
  const [comision, setComision]       = useState(String(base.commission));
  const [specialties, setSpecialties] = useState<string[]>(base.specialties);
  const [canDeposits, setCanDeposits] = useState(base.canValidateDeposits);
  const [canReports, setCanReports]   = useState(base.canSeeReports);

  function toggleSpecialty(s: string) {
    setSpecialties((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/admin/personal/${id}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Editar empleada</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{base.name}</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Datos personales</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Correo electrónico</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rol */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Rol</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRol(r.id)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                    rol === r.id ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">{r.id}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Especialidades</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {allServices.map((s) => {
                const active = specialties.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSpecialty(s)}
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
            <SectionLabel>Comisión</SectionLabel>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={comision}
                onChange={(e) => setComision(e.target.value)}
                min="0"
                max="100"
                className="w-28 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <span className="text-sm font-semibold text-zinc-500">% sobre servicios realizados</span>
            </div>
          </div>

          {/* Acceso y permisos */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Acceso y permisos</SectionLabel>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Validar depósitos</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Puede confirmar o rechazar comprobantes de pago</p>
                </div>
                <button
                  onClick={() => setCanDeposits((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${canDeposits ? "bg-zinc-900" : "bg-zinc-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${canDeposits ? "left-5" : "left-1"}`} />
                </button>
              </label>
              <div className="border-t border-zinc-100" />
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Ver reportes</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Tiene acceso a la sección de reportes</p>
                </div>
                <button
                  onClick={() => setCanReports((v) => !v)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${canReports ? "bg-zinc-900" : "bg-zinc-200"}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${canReports ? "left-5" : "left-1"}`} />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lg:w-[300px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen de cambios</SectionLabel>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="font-semibold text-zinc-900 text-right max-w-[150px] truncate">{nombre}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rol</span>
                  <span className="font-semibold text-zinc-900">{rol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Comisión</span>
                  <span className="font-semibold text-zinc-900">{comision ? `${comision}%` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Validar depósitos</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${canDeposits ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {canDeposits ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Ver reportes</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${canReports ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {canReports ? "Sí" : "No"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link
                href={`/admin/personal/${id}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
