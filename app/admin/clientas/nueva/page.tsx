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

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5l4 4 4-4" />
    </svg>
  );
}

/* ── Reusable field label ── */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1.5">
      {children}
    </p>
  );
}

/* ── Select wrapper ── */
function Select({ children, value, onChange }: {
  children: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
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

/* ── Page ── */
export default function NuevaClientaPage() {
  /* Contact */
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNac, setFechaNac] = useState("");
  const [comoConocio, setComoConocio] = useState("Instagram");

  /* Hair */
  const [tipoCabello, setTipoCabello] = useState("Rizado");
  const [colorBase, setColorBase] = useState("Castaño");
  const [largo, setLargo] = useState('14"');
  const [alergias, setAlergias] = useState("");

  /* Consent */
  const [consentWhatsapp, setConsentWhatsapp] = useState(true);
  const [consentCheckin, setConsentCheckin] = useState(true);
  const [consentFotos, setConsentFotos] = useState(false);

  /* Profile photo */
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  /* First appointment */
  const [agendarCita, setAgendarCita] = useState(true);
  const [servicio, setServicio] = useState("Tape-in");
  const [estilista, setEstilista] = useState("Mariana Ríos");

  /* Internal note */
  const [nota, setNota] = useState("");

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/clientas" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Nueva clienta</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            El perfil también se crea automáticamente al registrar un check-in.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos de contacto */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Datos de contacto</h2>

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel>Nombre</FieldLabel>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Apellido</FieldLabel>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Apellido"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            {/* Teléfono + Correo */}
            <div className="grid grid-cols-2 gap-3 mb-3">
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
              <div>
                <FieldLabel>Correo</FieldLabel>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            {/* Fecha de nacimiento + Cómo nos conoció */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Fecha de nacimiento</FieldLabel>
                <input
                  type="text"
                  value={fechaNac}
                  onChange={(e) => setFechaNac(e.target.value)}
                  placeholder="dd / mm / aaaa"
                  className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div>
                <FieldLabel>Cómo nos conoció</FieldLabel>
                <Select value={comoConocio} onChange={setComoConocio}>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>Referido</option>
                  <option>Google</option>
                  <option>TikTok</option>
                  <option>Otro</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Ficha de cabello */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Ficha de cabello</h2>

            {/* Tipo + Color + Largo */}
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <FieldLabel>Tipo de cabello</FieldLabel>
                <Select value={tipoCabello} onChange={setTipoCabello}>
                  <option>Liso</option>
                  <option>Ondulado</option>
                  <option>Rizado</option>
                  <option>Muy rizado</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Color base</FieldLabel>
                <Select value={colorBase} onChange={setColorBase}>
                  <option>Negro</option>
                  <option>Castaño</option>
                  <option>Rubio</option>
                  <option>Rojizo</option>
                  <option>Canoso</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Largo actual</FieldLabel>
                <Select value={largo} onChange={setLargo}>
                  <option>10"</option>
                  <option>12"</option>
                  <option>14"</option>
                  <option>16"</option>
                  <option>18"</option>
                  <option>20"</option>
                  <option>22"</option>
                </Select>
              </div>
            </div>

            {/* Alergias */}
            <div>
              <FieldLabel>Alergias o sensibilidades</FieldLabel>
              <textarea
                value={alergias}
                onChange={(e) => setAlergias(e.target.value)}
                placeholder="Ej. cuero sensible, alergia a adhesivos..."
                rows={4}
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Consentimiento */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Consentimiento</h2>
            <div className="space-y-3">
              {[
                {
                  label: "Acepta recibir recordatorios de cita por whatsapp",
                  checked: consentWhatsapp,
                  onChange: setConsentWhatsapp,
                },
                {
                  label: "Acepta los check-ins de bienestar después de la instalación",
                  checked: consentCheckin,
                  onChange: setConsentCheckin,
                },
                {
                  label: "Autoriza uso de fotos antes/después en redes",
                  checked: consentFotos,
                  onChange: setConsentFotos,
                },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
                  />
                  <span className="text-sm text-zinc-600 group-hover:text-zinc-800 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[320px] shrink-0 space-y-4">

          {/* Foto de perfil */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Foto de perfil
            </p>

            <input
              ref={fotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setFotoPerfil(URL.createObjectURL(file));
              }}
            />

            {fotoPerfil ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fotoPerfil}
                  alt="Foto de perfil"
                  className="w-full h-44 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setFotoPerfil(null);
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
                className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer mb-3"
              >
                <PhotoPlaceholderIcon />
                <p className="text-sm text-zinc-500 font-medium mt-1">Foto de la clienta</p>
                <p className="text-xs text-zinc-400 underline">or browse files</p>
              </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed">
              Opcional. Ayuda a la estilista a reconocerla al llegar.
            </p>
          </div>

          {/* Primera cita */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Primera cita
            </p>

            <label className="flex items-center gap-2.5 cursor-pointer group mb-4">
              <input
                type="checkbox"
                checked={agendarCita}
                onChange={(e) => setAgendarCita(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
              />
              <span className="text-sm text-zinc-700 group-hover:text-zinc-900 transition-colors font-medium">
                Agendar cita al guardar el perfil
              </span>
            </label>

            {agendarCita && (
              <div className="space-y-3">
                <div>
                  <FieldLabel>Servicio</FieldLabel>
                  <Select value={servicio} onChange={setServicio}>
                    <option>Tape-in</option>
                    <option>Nano ring</option>
                    <option>Ponytail</option>
                    <option>Retiro de extensiones</option>
                  </Select>
                </div>
                <div>
                  <FieldLabel>Estilista</FieldLabel>
                  <Select value={estilista} onChange={setEstilista}>
                    <option>Mariana Ríos</option>
                    <option>Sofía Luna</option>
                    <option>Vanessa Gil</option>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Nota interna */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Nota interna
            </p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Visible solo para el equipo..."
              rows={3}
              className="w-full text-sm text-zinc-800 placeholder-zinc-400 resize-none border-0 outline-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/admin/clientas"
              className="flex-1 py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button className="flex-1 py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
              Guardar clienta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
