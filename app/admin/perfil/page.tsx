"use client";

import Link from "next/link";
import { useRef, useState } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6.5A1.5 1.5 0 0 1 3 5h1.5L6 3h6l1.5 2H15a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 15H3a1.5 1.5 0 0 1-1.5-1.5v-7z" />
      <circle cx="9" cy="10" r="2.5" />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.8 1 8c1.2 2.2 3.8 5 7 5 1.3 0 2.5-.4 3.5-1.1M6.5 3.2C7 3.1 7.5 3 8 3c3.2 0 5.8 2.8 7 5-.5.9-1.2 1.8-2 2.5" />
    </svg>
  );
}

function PhotoUpload({ name }: { name: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="relative w-24 h-24 shrink-0">
      {/* Avatar / foto */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center border-4 border-white shadow-sm">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-zinc-600">{initial}</span>
        )}
      </div>

      {/* Botón de cámara */}
      <button
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow hover:bg-zinc-700 transition-colors"
        title="Cambiar foto"
      >
        <CameraIcon />
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

function PasswordField({ label }: { label: string }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="••••••••"
          className="w-full px-4 py-2.5 pr-10 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const [nombre, setNombre] = useState("Ana Beltré");
  const [correo, setCorreo] = useState("ana.beltre@melenahumanhair.com");
  const [telefono, setTelefono] = useState("809 555 0001");

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href="/admin/resumen"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3"
        >
          <ChevronLeft />
          Panel
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Mi perfil</h1>
        <p className="text-sm text-zinc-400 mt-1">Gerente · Melena Human Hair</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 max-w-3xl">

        {/* ── Información personal ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Foto + nombre */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-5">
              Foto de perfil
            </p>
            <div className="flex items-center gap-5">
              <PhotoUpload name={nombre} />
              <div>
                <p className="text-base font-semibold text-zinc-900">{nombre}</p>
                <p className="text-sm text-zinc-400">Gerente</p>
                <p className="text-xs text-zinc-400 mt-2">
                  Haz clic en el ícono de cámara para cambiar tu foto.
                </p>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-5">
              Datos personales
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              <button className="self-start px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>

        {/* ── Seguridad ── */}
        <div className="lg:w-72 flex flex-col gap-4 shrink-0">

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-5">
              Cambiar contraseña
            </p>
            <div className="flex flex-col gap-4">
              <PasswordField label="Contraseña actual" />
              <PasswordField label="Nueva contraseña" />
              <PasswordField label="Confirmar nueva contraseña" />
              <button className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
                Actualizar contraseña
              </button>
            </div>
          </div>

          {/* Sesión */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Sesión
            </p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Último acceso</span>
                <span className="text-zinc-700 font-medium">Hoy, 11:02 am</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Rol</span>
                <span className="text-zinc-700 font-medium">Gerente</span>
              </div>
            </div>
            <Link
              href="/acceso"
              className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
