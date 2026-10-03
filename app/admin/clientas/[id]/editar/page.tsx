"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import CampoFecha from "@/components/campo-fecha";

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

export default function EditarClientaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [fechaInvalida, setFechaInvalida] = useState(false);
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [tieneCuenta, setTieneCuenta] = useState(false);

  useEffect(() => {
    supabase
      .from("clientas")
      .select("nombre, telefono, email, fecha_nacimiento, notas, user_id")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) setNoEncontrada(true);
        else {
          setNombre(data.nombre);
          setTelefono(data.telefono);
          setCorreo(data.email ?? "");
          setFechaNacimiento(data.fecha_nacimiento ?? "");
          setNota(data.notas ?? "");
          setTieneCuenta(!!data.user_id);
        }
        setCargando(false);
      });
  }, [supabase, id]);

  const puedeGuardar = nombre.trim() && telefono.trim() && !guardando;

  async function guardar() {
    if (!nombre.trim() || !telefono.trim()) return setError("Falta el nombre o el teléfono.");
    if (fechaInvalida) return setError("La fecha de nacimiento no es válida. Usa día/mes/año, por ejemplo 18/03/1994.");
    setGuardando(true);
    setError(null);

    const cambios: { nombre: string; telefono: string; fecha_nacimiento: string | null; notas: string | null; email?: string | null } = {
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      fecha_nacimiento: fechaNacimiento || null,
      notas: nota.trim() || null,
    };
    // Con cuenta en la app, el correo es el de acceso y no se cambia desde aquí
    if (!tieneCuenta) cambios.email = correo.trim() || null;

    const { error: upError } = await supabase.from("clientas").update(cambios).eq("id", id);
    setGuardando(false);
    if (upError) {
      return setError(upError.code === "23505" ? "Ya existe otra clienta con ese teléfono." : upError.message);
    }
    router.push(`/admin/clientas/${id}`);
  }

  if (cargando) return <div className="min-h-full bg-zinc-50 p-8 text-sm text-zinc-400">Cargando…</div>;
  if (noEncontrada) {
    return (
      <div className="min-h-full bg-zinc-50 p-8">
        <Link href="/admin/clientas" className="text-sm text-zinc-500 hover:text-zinc-800 underline">Volver a Clientas</Link>
        <p className="mt-4 text-sm text-zinc-500">Clienta no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50">
      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link
          href={`/admin/clientas/${id}`}
          className="text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Editar clienta</h1>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[900px] mx-auto">

        {/* ══ LEFT ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Datos personales</SectionLabel>
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
                  disabled={tieneCuenta}
                  placeholder="correo@ejemplo.com"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors disabled:bg-zinc-50 disabled:text-zinc-400"
                />
                {tieneCuenta ? (
                  <p className="text-xs text-zinc-400 mt-1.5">Con cuenta en la app, este correo es el de acceso y no se cambia desde aquí.</p>
                ) : (
                  <p className="text-xs text-zinc-400 mt-1.5">Necesario para invitarla a la app.</p>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">
                  Fecha de nacimiento
                </label>
                <CampoFecha
                  value={fechaNacimiento}
                  onChange={setFechaNacimiento}
                  onInvalidChange={setFechaInvalida}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
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
                  <span className="text-zinc-500">Correo</span>
                  <span className="font-semibold text-zinc-900 text-right truncate max-w-[160px]">{correo || "—"}</span>
                </div>
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Link
                href={`/admin/clientas/${id}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                onClick={guardar}
                disabled={!puedeGuardar}
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
