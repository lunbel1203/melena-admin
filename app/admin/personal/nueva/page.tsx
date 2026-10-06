"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="28" height="22" rx="3" />
      <circle cx="10" cy="14" r="3" />
      <path d="M2 24l8-8 5 5 4-4 11 10" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5A.5.5 0 0 1 5.5 2h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5A.5.5 0 0 0 4.5 14h7a.5.5 0 0 0 .5-.5L13 4" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}

const DESCRIPCION_ROL: Record<string, string> = {
  Cajera: "Cobra, valida depósitos y maneja la agenda",
  "Asesora Capilar": "Asesora y vende a las clientas",
  "Gestora de citas": "Gestiona la agenda y las clientas",
  "Taller de costura": "Costura profesional de extensiones",
  Shamponier: "Lava la cabeza y las extensiones",
  "Sala de postura": "Instala y mantiene extensiones",
  Admin: "Acceso total al panel, sin restricciones",
};

interface Servicio {
  id: string;
  nombre: string;
}

interface Rol {
  id: string;
  nombre: string;
}

export default function NuevaEmpleadaPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [puesto, setPuesto] = useState("");
  const [rolIds, setRolIds] = useState<string[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [comision, setComision] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data }, { data: rolesData }] = await Promise.all([
        supabase.from("servicios").select("id, nombre").eq("activo", true).order("nombre"),
        supabase.from("roles").select("id, nombre").order("nombre"),
      ]);
      setServicios(data ?? []);
      setRoles(rolesData ?? []);
    })();
  }, [supabase]);

  function elegirFoto(file: File) {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  function quitarFoto() {
    if (fotoPreview) URL.revokeObjectURL(fotoPreview);
    setFotoFile(null);
    setFotoPreview(null);
  }

  function toggleServicio(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Puede tener varios roles; el primero que marca es el principal (el que se muestra y define la comisión base)
  function alternarRol(id: string) {
    setRolIds((prev) => (prev.includes(id) ? (prev.length > 1 ? prev.filter((r) => r !== id) : prev) : [...prev, id]));
  }

  async function crear() {
    if (!nombre.trim() || rolIds.length === 0) {
      return setError("Falta el nombre o el rol.");
    }
    setGuardando(true);
    setError(null);

    const { data: nuevo, error: insError } = await supabase
      .from("empleados")
      .insert({
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        email: correo.trim() || null,
        puesto: puesto.trim() || null,
        rol_id: rolIds[0],
        porcentaje_comision: comision.trim() ? Number(comision) : null,
      })
      .select("id")
      .single();

    if (insError || !nuevo) {
      setGuardando(false);
      return setError(insError?.message ?? "No se pudo crear la empleada.");
    }

    const { error: rolesError } = await supabase
      .from("empleados_roles")
      .insert(rolIds.map((rol_id) => ({ empleado_id: nuevo.id, rol_id })));
    if (rolesError) {
      setGuardando(false);
      return setError(rolesError.message);
    }

    if (seleccionados.size > 0) {
      const { error: relError } = await supabase
        .from("servicios_empleados")
        .insert(Array.from(seleccionados).map((servicio_id) => ({ empleado_id: nuevo.id, servicio_id })));
      if (relError) {
        setGuardando(false);
        return setError(relError.message);
      }
    }

    if (fotoFile) {
      const ext = fotoFile.name.split(".").pop();
      const path = `${nuevo.id}/foto-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("fotos-empleados").upload(path, fotoFile);
      if (uploadError) {
        setGuardando(false);
        return setError(uploadError.message);
      }
      const { data } = supabase.storage.from("fotos-empleados").getPublicUrl(path);
      const { error: fotoError } = await supabase.from("empleados").update({ foto_url: data.publicUrl }).eq("id", nuevo.id);
      if (fotoError) {
        setGuardando(false);
        return setError(fotoError.message);
      }
    }

    setGuardando(false);
    router.push(`/admin/personal/${nuevo.id}`);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/personal" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nueva empleada</h1>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

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
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Puesto</label>
                <input
                  type="text"
                  value={puesto}
                  onChange={(e) => setPuesto(e.target.value)}
                  placeholder="Ej. Postura, Shampoo, Costura, Ventas..."
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

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Roles (puede tener varios)</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roles.map((r) => {
                const on = rolIds.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => alternarRol(r.id)}
                    className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                      on ? "border-zinc-900 bg-white" : "border-zinc-100 hover:border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-900">{r.nombre}</p>
                      {on && rolIds[0] === r.id && rolIds.length > 1 && (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Principal</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{DESCRIPCION_ROL[r.nombre] ?? "Rol personalizado"}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Servicios que realiza</SectionLabel>
            <p className="text-xs text-zinc-400 mb-3">
              Opcional — si no marcas ninguno, queda disponible para cualquier servicio sin estilistas asignadas.
            </p>
            <div className="flex flex-wrap gap-2">
              {servicios.map((s) => {
                const active = seleccionados.has(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleServicio(s.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"
                    }`}
                  >
                    {s.nombre}
                  </button>
                );
              })}
            </div>
          </div>

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
        </div>

        {/* ══ RIGHT ══ */}
        <div className="lg:w-[300px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Foto</SectionLabel>
            {fotoPreview ? (
              <div className="relative rounded-xl overflow-hidden group aspect-square w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoPreview} alt="Foto de la empleada" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={quitarFoto}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-red-50 text-red-500 hover:text-red-700 flex items-center justify-center shadow transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) elegirFoto(file);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                >
                  <ImageIcon />
                  <span className="text-sm font-medium text-zinc-400 mt-1">Foto de la empleada</span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
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
                  <span className="font-semibold text-zinc-900">{rolIds.map((id) => roles.find((r) => r.id === id)?.nombre).filter(Boolean).join(" · ") || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Comisión</span>
                  <span className="font-semibold text-zinc-900">{comision ? `${comision}%` : "—"}</span>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Link
                href="/admin/personal"
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                onClick={crear}
                disabled={guardando}
                className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {guardando ? "Creando…" : "Crear empleada"}
              </button>
              <p className="text-[10px] text-zinc-400 text-center">
                Esto crea el perfil de personal. Todavía no genera una cuenta de acceso a la app — eso se hace por separado en Supabase Auth.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
