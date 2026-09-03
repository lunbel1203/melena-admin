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
    <svg width="36" height="36" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
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

function Select({
  value,
  onChange,
  children,
}: {
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

/* ── Data ── */
const staffList = [
  { id: "p1", name: "Mariana Ríos", initial: "M" },
  { id: "p2", name: "Sofía Luna",   initial: "S" },
  { id: "p3", name: "Vanessa Gil",  initial: "V" },
];

/* ── Page ── */
export default function NuevoServicioPage() {
  /* Información */
  const [nombre, setNombre]           = useState("");
  const [categoria, setCategoria]     = useState("Instalación");
  const [duracion, setDuracion]       = useState("1.5 horas");
  const [precio, setPrecio]           = useState("RD$3,200");
  const [descripcion, setDescripcion] = useState("");

  /* Staff */
  const [assignedStaff, setAssignedStaff] = useState<Set<string>>(
    new Set(["p1", "p2"])
  );
  const toggleStaff = (id: string) =>
    setAssignedStaff((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* Seguimiento */
  const [deposito, setDeposito]       = useState("RD$1,000");
  const [checkins, setCheckins]       = useState("Día 3 y día 30");

  /* Foto */
  const [foto, setFoto] = useState<string | null>(null);
  const fotoRef = useRef<HTMLInputElement>(null);

  /* Publicación */
  const [pubSitio, setPubSitio]       = useState(true);
  const [pubApp, setPubApp]           = useState(true);
  const [pubWhatsapp, setPubWhatsapp] = useState(true);

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Nuevo servicio</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Al publicarlo aparece en el sitio web y en la app.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Información */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Información</h2>

            {/* Nombre */}
            <div className="mb-3">
              <FieldLabel>Nombre del servicio</FieldLabel>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Tape-in premium"
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {/* Categoría */}
            <div className="mb-3">
              <FieldLabel>Categoría</FieldLabel>
              <Select value={categoria} onChange={setCategoria}>
                <option>Instalación</option>
                <option>Express</option>
                <option>Mantenimiento</option>
              </Select>
            </div>

            {/* Duración + Precio */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <FieldLabel>Duración</FieldLabel>
                <Select value={duracion} onChange={setDuracion}>
                  <option>30 min</option>
                  <option>45 min</option>
                  <option>1 hora</option>
                  <option>1.5 horas</option>
                  <option>2 horas</option>
                  <option>3 horas</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Precio</FieldLabel>
                <Select value={precio} onChange={setPrecio}>
                  <option>RD$1,200</option>
                  <option>RD$1,900</option>
                  <option>RD$2,500</option>
                  <option>RD$3,200</option>
                  <option>RD$4,800</option>
                  <option>RD$5,500</option>
                </Select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <FieldLabel>Descripción pública</FieldLabel>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Cintas adhesivas de doble cara, instalación rápida y retirable."
                rows={3}
                className="w-full border border-zinc-200 rounded-xl px-3.5 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Quién lo puede ofrecer */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Quién lo puede ofrecer</h2>

            <div className="space-y-2">
              {staffList.map((s) => {
                const isOn = assignedStaff.has(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                      isOn
                        ? "border-zinc-900 bg-white"
                        : "border-zinc-100 bg-white hover:border-zinc-200"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {s.initial}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-zinc-900">{s.name}</span>
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggleStaff(s.id)}
                      className="w-4 h-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer shrink-0"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Seguimiento y reserva */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Seguimiento y reserva</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>Depósito para reservar</FieldLabel>
                <Select value={deposito} onChange={setDeposito}>
                  <option>Sin depósito</option>
                  <option>RD$500</option>
                  <option>RD$1,000</option>
                  <option>RD$1,500</option>
                  <option>RD$2,000</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Check-ins de bienestar</FieldLabel>
                <Select value={checkins} onChange={setCheckins}>
                  <option>Ninguno</option>
                  <option>Día 3</option>
                  <option>Día 30</option>
                  <option>Día 3 y día 30</option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[300px] shrink-0 space-y-4">

          {/* Foto del servicio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Foto del servicio
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
              <div className="relative rounded-xl overflow-hidden border border-zinc-200 mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={foto} alt="Foto del servicio" className="w-full h-40 object-cover" />
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
                className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer mb-3"
              >
                <PhotoPlaceholderIcon />
                <p className="text-sm text-zinc-500 font-medium mt-1">Foto del servicio</p>
                <p className="text-xs text-zinc-400 underline">or browse files</p>
              </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed">
              Se usa en la tarjeta del sitio web.
            </p>
          </div>

          {/* Publicación */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-3">
              Publicación
            </p>

            <div className="space-y-0 divide-y divide-zinc-100">
              {[
                { label: "Sitio web",        checked: pubSitio,    onChange: setPubSitio },
                { label: "App de clientas",   checked: pubApp,      onChange: setPubApp },
                { label: "Botón de whatsapp", checked: pubWhatsapp, onChange: setPubWhatsapp },
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
              Publicar servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
