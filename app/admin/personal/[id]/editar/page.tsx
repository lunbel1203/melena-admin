"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
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
  Estilista: "Realiza servicios de extensiones",
  Recepción: "Gestiona citas y atención al cliente",
  Caja: "Manejo de pagos y depósitos",
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

export default function EditarEmpleadaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [puesto, setPuesto] = useState("");
  const [rolId, setRolId] = useState("");
  const [roles, setRoles] = useState<Rol[]>([]);
  const [comision, setComision] = useState("");
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [asignados, setAsignados] = useState<Set<string>>(new Set());
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: emp }, { data: todosServicios }, { data: asignadosData }, { data: todosRoles }] = await Promise.all([
        supabase.from("empleados").select("*").eq("id", id).single(),
        supabase.from("servicios").select("id, nombre").eq("activo", true).order("nombre"),
        supabase.from("servicios_empleados").select("servicio_id").eq("empleado_id", id),
        supabase.from("roles").select("id, nombre").order("nombre"),
      ]);
      if (emp) {
        setNombre(emp.nombre);
        setTelefono(emp.telefono ?? "");
        setCorreo(emp.email ?? "");
        setPuesto(emp.puesto ?? "");
        setRolId(emp.rol_id);
        setComision(emp.porcentaje_comision !== null ? String(emp.porcentaje_comision) : "");
        setFotoUrl(emp.foto_url);
      }
      setRoles(todosRoles ?? []);
      setServicios(todosServicios ?? []);
      setAsignados(new Set((asignadosData ?? []).map((a) => a.servicio_id)));
      setCargando(false);
    })();
  }, [id, supabase]);

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${id}/foto-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-empleados").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setError(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-empleados").getPublicUrl(path);
    const { error: updateError } = await supabase.from("empleados").update({ foto_url: data.publicUrl }).eq("id", id);
    setSubiendoFoto(false);
    if (updateError) return setError(updateError.message);
    setFotoUrl(data.publicUrl);
  }

  async function quitarFoto() {
    const { error } = await supabase.from("empleados").update({ foto_url: null }).eq("id", id);
    if (error) return setError(error.message);
    setFotoUrl(null);
  }

  function toggleServicio(servicioId: string) {
    setAsignados((prev) => {
      const next = new Set(prev);
      next.has(servicioId) ? next.delete(servicioId) : next.add(servicioId);
      return next;
    });
  }

  async function guardar() {
    setGuardando(true);
    setError(null);

    const { error: empError } = await supabase
      .from("empleados")
      .update({
        nombre: nombre.trim(),
        telefono: telefono.trim() || null,
        email: correo.trim() || null,
        puesto: puesto.trim() || null,
        rol_id: rolId,
        porcentaje_comision: comision.trim() ? Number(comision) : null,
      })
      .eq("id", id);

    if (empError) {
      setGuardando(false);
      return setError(empError.message);
    }

    const { data: actuales } = await supabase.from("servicios_empleados").select("servicio_id").eq("empleado_id", id);
    const actualesSet = new Set((actuales ?? []).map((a) => a.servicio_id));

    const aAgregar = Array.from(asignados).filter((s) => !actualesSet.has(s));
    const aQuitar = Array.from(actualesSet).filter((s) => !asignados.has(s));

    if (aAgregar.length > 0) {
      const { error: insError } = await supabase
        .from("servicios_empleados")
        .insert(aAgregar.map((servicio_id) => ({ empleado_id: id, servicio_id })));
      if (insError) {
        setGuardando(false);
        return setError(insError.message);
      }
    }
    if (aQuitar.length > 0) {
      const { error: delError } = await supabase
        .from("servicios_empleados")
        .delete()
        .eq("empleado_id", id)
        .in("servicio_id", aQuitar);
      if (delError) {
        setGuardando(false);
        return setError(delError.message);
      }
    }

    setGuardando(false);
    router.push(`/admin/personal/${id}`);
  }

  if (cargando) return <p className="p-8 text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/admin/personal/${id}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Editar empleada</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{nombre}</p>
        </div>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

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

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Rol</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRolId(r.id)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                    rolId === r.id ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-200"
                  }`}
                >
                  <p className="text-sm font-semibold text-zinc-900">{r.nombre}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{DESCRIPCION_ROL[r.nombre] ?? "Rol personalizado"}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Servicios que realiza</SectionLabel>
            <p className="text-xs text-zinc-400 mb-3">
              Si no marcas ninguno, esta empleada queda disponible para cualquier servicio que tampoco tenga estilistas asignadas.
            </p>
            <div className="flex flex-wrap gap-2">
              {servicios.map((s) => {
                const active = asignados.has(s.id);
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
            <SectionLabel>Comisión</SectionLabel>
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
            {fotoUrl ? (
              <div className="relative rounded-xl overflow-hidden group aspect-square w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
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
                    if (file) subirFoto(file);
                    e.target.value = "";
                  }}
                />
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={subiendoFoto}
                  className="w-full border-2 border-dashed border-zinc-200 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  <ImageIcon />
                  <span className="text-sm font-medium text-zinc-400 mt-1">
                    {subiendoFoto ? "Subiendo…" : "Foto de la empleada"}
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen de cambios</SectionLabel>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Nombre</span>
                  <span className="font-semibold text-zinc-900 text-right max-w-[150px] truncate">{nombre || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rol</span>
                  <span className="font-semibold text-zinc-900">{roles.find((r) => r.id === rolId)?.nombre ?? "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Comisión</span>
                  <span className="font-semibold text-zinc-900">{comision ? `${comision}%` : "—"}</span>
                </div>
                <div className="flex justify-between text-sm gap-3">
                  <span className="text-zinc-500 shrink-0">Servicios</span>
                  <span className="font-semibold text-zinc-900 text-right">
                    {asignados.size > 0 ? `${asignados.size} asignados` : "Todos (sin restricción)"}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Link
                href={`/admin/personal/${id}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                onClick={guardar}
                disabled={guardando}
                className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
