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
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
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

/* ── Field label ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1.5">
      {children}
    </p>
  );
}

type RoleId = "Estilista" | "Recepción" | "Caja" | "Admin";

const ROLES: RoleId[] = ["Estilista", "Recepción", "Caja", "Admin"];

const ALL_SPECIALTIES = ["Tape-in", "Nano ring", "Bulk", "Cortina", "Ponytail", "Colorimetría"];

const PERMISSIONS = [
  "Ver el salón y tomar clientas",
  "Registrar servicios y comisiones",
  "Validar depósitos",
  "Ver reportes del negocio",
];

const DEFAULT_PERMS: Record<RoleId, string[]> = {
  Estilista:  ["Ver el salón y tomar clientas", "Registrar servicios y comisiones"],
  Recepción:  ["Ver el salón y tomar clientas", "Validar depósitos"],
  Caja:       ["Ver el salón y tomar clientas", "Validar depósitos"],
  Admin:      ["Ver el salón y tomar clientas", "Registrar servicios y comisiones", "Validar depósitos", "Ver reportes del negocio"],
};

const SCHEDULE = [
  { day: "Lunes a viernes", hours: "10:00 – 19:00" },
  { day: "Sábado",          hours: "9:00 – 17:00" },
  { day: "Domingo",         hours: null },
];

/* ── Page ── */
export default function NuevaEmpleadaPage() {
  /* Access */
  const [nombre, setNombre]       = useState("");
  const [telefono, setTelefono]   = useState("");
  const [correo, setCorreo]       = useState("");
  const [cedula, setCedula]       = useState("");
  const [enviarInvite, setEnviarInvite] = useState(true);

  /* Role & permissions */
  const [rol, setRol] = useState<RoleId>("Estilista");
  const [perms, setPerms] = useState<Set<string>>(new Set(DEFAULT_PERMS["Estilista"]));

  const handleRoleChange = (r: RoleId) => {
    setRol(r);
    setPerms(new Set(DEFAULT_PERMS[r]));
  };

  const togglePerm = (p: string) => {
    setPerms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  /* Specialties */
  const [specialties, setSpecialties] = useState<Set<string>>(
    new Set(["Tape-in", "Nano ring"])
  );
  const toggleSpecialty = (s: string) => {
    setSpecialties((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  /* Photo */
  const [foto, setFoto] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  /* Commission */
  const [commission, setCommission] = useState<"20%" | "25%" | "30%">("25%");

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/personal" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Nueva empleada</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Recibe una invitación para entrar a la app con su cuenta.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos y acceso */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Datos y acceso</h2>

            {/* Nombre + Teléfono */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel>Nombre completo</FieldLabel>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y apellido"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Teléfono</FieldLabel>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="809 000 0000"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            {/* Correo */}
            <div className="mb-3">
              <FieldLabel>Correo de acceso</FieldLabel>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="nombre@melenahumanhair.com"
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Cédula */}
            <div className="mb-4">
              <FieldLabel>Cédula</FieldLabel>
              <input
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="000-0000000-0"
                className="w-full sm:w-1/2 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Invite checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={enviarInvite}
                onChange={(e) => setEnviarInvite(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
              />
              <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
                Enviar invitación de acceso a la app
              </span>
            </label>
          </div>

          {/* Rol y permisos */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Rol y permisos</h2>

            {/* Role selector */}
            <div className="flex gap-2 flex-wrap mb-5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleChange(r)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    rol === r
                      ? "border-zinc-900 text-zinc-900 bg-white"
                      : "border-zinc-200 text-zinc-500 bg-white hover:border-zinc-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Permissions */}
            <div className="space-y-0 divide-y divide-zinc-100">
              {PERMISSIONS.map((p) => (
                <label key={p} className="flex items-center justify-between py-3 cursor-pointer group">
                  <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors">
                    {p}
                  </span>
                  <input
                    type="checkbox"
                    checked={perms.has(p)}
                    onChange={() => togglePerm(p)}
                    className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Especialidades</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_SPECIALTIES.map((s) => {
                const active = specialties.has(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSpecialty(s)}
                    className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                      active
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[300px] shrink-0 space-y-4">

          {/* Foto */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Foto
            </p>

            <input
              ref={fotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFoto(URL.createObjectURL(file));
              }}
            />

            {foto ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="Foto de la empleada" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFoto(null);
                    if (fotoRef.current) fotoRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 bg-white border border-zinc-200 rounded-full p-1.5 text-zinc-500 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors"
                  title="Eliminar foto"
                >
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fotoRef.current?.click()}
                className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer"
              >
                <PhotoPlaceholderIcon />
                <p className="text-sm text-zinc-500 font-medium mt-1">Foto de la empleada</p>
                <p className="text-xs text-zinc-400 underline">or browse files</p>
              </div>
            )}
          </div>

          {/* Comisión */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Comisión
            </p>

            <div className="flex gap-2 mb-3">
              {(["20%", "25%", "30%"] as const).map((pct) => (
                <button
                  key={pct}
                  onClick={() => setCommission(pct)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                    commission === pct
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {pct}
                </button>
              ))}
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Se aplica sobre el monto de cada servicio registrado.
            </p>
          </div>

          {/* Horario habitual */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Horario habitual
            </p>

            <div className="space-y-0 divide-y divide-zinc-100">
              {SCHEDULE.map(({ day, hours }) => (
                <div key={day} className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-zinc-700">{day}</span>
                  {hours ? (
                    <span className="text-sm font-medium text-zinc-900">{hours}</span>
                  ) : (
                    <span className="text-sm text-zinc-400">Cerrado</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/personal"
              className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
              Crear cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
