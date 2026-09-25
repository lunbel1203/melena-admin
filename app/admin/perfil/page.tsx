"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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

function PhotoUpload({
  nombre,
  fotoUrl,
  subiendo,
  onArchivo,
}: {
  nombre: string;
  fotoUrl: string | null;
  subiendo: boolean;
  onArchivo: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onArchivo(file);
    e.target.value = "";
  }

  const initial = nombre.charAt(0).toUpperCase();

  return (
    <div className="relative w-24 h-24 shrink-0">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-200 flex items-center justify-center border-4 border-white shadow-sm">
        {fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl font-bold text-zinc-600">{initial}</span>
        )}
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={subiendo}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow hover:bg-zinc-700 transition-colors disabled:opacity-50"
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

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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

function formatearFecha(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  const hora = d.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true });
  const esHoy = d.toDateString() === new Date().toDateString();
  if (esHoy) return `Hoy, ${hora}`;
  const fecha = d.toLocaleDateString("es-DO", { day: "numeric", month: "short" });
  return `${fecha}, ${hora}`;
}

export default function PerfilPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [empleadoId, setEmpleadoId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [ultimoAcceso, setUltimoAcceso] = useState<string | null>(null);
  const [rol, setRol] = useState<string | null>(null);
  const [negocio, setNegocio] = useState("");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  const [cargando, setCargando] = useState(true);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);
  const [datosGuardados, setDatosGuardados] = useState<string | null>(null);
  const [errorDatos, setErrorDatos] = useState<string | null>(null);

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [passwordGuardada, setPasswordGuardada] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: empleado }, { data: negocioConfig }] = await Promise.all([
        supabase.from("empleados").select("id, nombre, telefono, foto_url, roles(nombre)").eq("user_id", user.id).single(),
        supabase.from("negocio_config").select("nombre_comercial").eq("id", true).single(),
      ]);

      setAuthEmail(user.email ?? "");
      setUltimoAcceso(user.last_sign_in_at ?? null);
      if (negocioConfig) setNegocio(negocioConfig.nombre_comercial);

      if (empleado) {
        setEmpleadoId(empleado.id);
        setNombre(empleado.nombre);
        setCorreo(user.email ?? "");
        setTelefono(empleado.telefono ?? "");
        setFotoUrl(empleado.foto_url);
        const rolRow = Array.isArray(empleado.roles) ? empleado.roles[0] : empleado.roles;
        setRol(rolRow?.nombre ?? null);
      }
      setCargando(false);
    })();
  }, [supabase]);

  async function subirFoto(file: File) {
    if (!empleadoId) return;
    setSubiendoFoto(true);
    setErrorDatos(null);
    const ext = file.name.split(".").pop();
    const path = `${empleadoId}/foto-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-empleados").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setErrorDatos(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-empleados").getPublicUrl(path);
    const { error } = await supabase.from("empleados").update({ foto_url: data.publicUrl }).eq("id", empleadoId);
    setSubiendoFoto(false);
    if (error) return setErrorDatos(error.message);
    setFotoUrl(data.publicUrl);
  }

  async function guardarDatos() {
    if (!empleadoId) return;
    setGuardandoDatos(true);
    setErrorDatos(null);
    setDatosGuardados(null);

    const correoCambio = correo.trim() !== authEmail;

    const [{ error: errorEmpleado }, resultadoAuth] = await Promise.all([
      supabase.from("empleados").update({ nombre: nombre.trim(), telefono: telefono.trim() || null }).eq("id", empleadoId),
      correoCambio ? supabase.auth.updateUser({ email: correo.trim() }) : Promise.resolve({ error: null }),
    ]);

    setGuardandoDatos(false);
    if (errorEmpleado) return setErrorDatos(errorEmpleado.message);
    if (resultadoAuth.error) return setErrorDatos(resultadoAuth.error.message);

    setDatosGuardados(correoCambio ? "Guardado ✓ Revisa tu correo para confirmar el nuevo email." : "Guardado ✓");
    setTimeout(() => setDatosGuardados(null), 4000);
  }

  async function actualizarContrasena() {
    setErrorPassword(null);
    setPasswordGuardada(false);
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      return setErrorPassword("Completa los tres campos.");
    }
    if (nuevaContrasena !== confirmarContrasena) {
      return setErrorPassword("La nueva contraseña no coincide con la confirmación.");
    }
    if (nuevaContrasena.length < 8) {
      return setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
    }

    setGuardandoPassword(true);
    const { error: errorVerificacion } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: contrasenaActual,
    });
    if (errorVerificacion) {
      setGuardandoPassword(false);
      return setErrorPassword("La contraseña actual es incorrecta.");
    }

    const { error } = await supabase.auth.updateUser({ password: nuevaContrasena });
    setGuardandoPassword(false);
    if (error) return setErrorPassword(error.message);

    setContrasenaActual("");
    setNuevaContrasena("");
    setConfirmarContrasena("");
    setPasswordGuardada(true);
    setTimeout(() => setPasswordGuardada(false), 4000);
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/acceso");
    router.refresh();
  }

  if (cargando) {
    return (
      <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">
        <p className="text-sm text-zinc-400">Cargando…</p>
      </div>
    );
  }

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
        <p className="text-sm text-zinc-400 mt-1">{rol ?? "—"} · {negocio}</p>
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
              <PhotoUpload nombre={nombre} fotoUrl={fotoUrl} subiendo={subiendoFoto} onArchivo={subirFoto} />
              <div>
                <p className="text-base font-semibold text-zinc-900">{nombre}</p>
                <p className="text-sm text-zinc-400">{rol ?? ""}</p>
                <p className="text-xs text-zinc-400 mt-2">
                  {subiendoFoto ? "Subiendo foto…" : "Haz clic en el ícono de cámara para cambiar tu foto."}
                </p>
              </div>
            </div>
          </div>

          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Datos personales
              </p>
              {datosGuardados && <span className="text-xs font-medium text-teal-600">{datosGuardados}</span>}
            </div>
            {errorDatos && <p className="text-xs text-red-500 mb-3">{errorDatos}</p>}
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

              <button
                onClick={guardarDatos}
                disabled={guardandoDatos}
                className="self-start px-5 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {guardandoDatos ? "Guardando…" : "Guardar cambios"}
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
            {errorPassword && <p className="text-xs text-red-500 mb-3">{errorPassword}</p>}
            {passwordGuardada && <p className="text-xs font-medium text-teal-600 mb-3">Contraseña actualizada ✓</p>}
            <div className="flex flex-col gap-4">
              <PasswordField label="Contraseña actual" value={contrasenaActual} onChange={setContrasenaActual} />
              <PasswordField label="Nueva contraseña" value={nuevaContrasena} onChange={setNuevaContrasena} />
              <PasswordField label="Confirmar nueva contraseña" value={confirmarContrasena} onChange={setConfirmarContrasena} />
              <button
                onClick={actualizarContrasena}
                disabled={guardandoPassword}
                className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                {guardandoPassword ? "Actualizando…" : "Actualizar contraseña"}
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
                <span className="text-zinc-700 font-medium">{formatearFecha(ultimoAcceso)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Rol</span>
                <span className="text-zinc-700 font-medium">{rol ?? "—"}</span>
              </div>
            </div>
            <button
              onClick={cerrarSesion}
              className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
