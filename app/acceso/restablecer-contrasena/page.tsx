"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 0 0 9.4 9.5M4.2 4.3C2.8 5.3 1.7 6.8 1 8c1.2 2.2 3.8 5 7 5 1.3 0 2.5-.4 3.5-1.1M6.5 3.2C7 3.1 7.5 3 8 3c3.2 0 5.8 2.8 7 5-.5.9-1.2 1.8-2 2.5" />
    </svg>
  );
}

export default function RestablecerContrasenaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setCargando(false);

    if (updateError) {
      setError("No se pudo actualizar la contraseña. Pide un nuevo enlace e intenta de nuevo.");
      return;
    }

    router.push("/admin/resumen");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Panel izquierdo ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_20%_50%,_white_1px,_transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div>
          <Image
            src="/Melena logo blanco.png"
            alt="Melena Human Hair"
            width={140}
            height={40}
            className="object-contain object-left"
          />
        </div>

        <div>
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
            El salón,<br />
            <span className="italic font-light text-zinc-400">en orden</span>
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
            Clientas, agenda, facturación e inventario en un solo lugar. Acceso exclusivo para el equipo Melena.
          </p>
        </div>

        <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest">
          Melena Human Hair · República Dominicana
        </p>
      </div>

      {/* ── Panel derecho ── */}
      <div className="flex-1 flex items-center justify-center bg-stone-50 p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Image
              src="/Melena logo.png"
              alt="Melena Human Hair"
              width={120}
              height={36}
              className="object-contain object-left"
            />
          </div>

          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
            Panel administrativo
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Nueva contraseña</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Elige una contraseña nueva para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Confirmar contraseña
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
              />
            </div>

            {error && <p className="text-xs text-red-500 -mt-2">{error}</p>}

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors mt-1 disabled:opacity-60"
            >
              {cargando ? "Guardando…" : "Guardar contraseña"}
            </button>

            <Link
              href="/acceso"
              className="text-center text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
