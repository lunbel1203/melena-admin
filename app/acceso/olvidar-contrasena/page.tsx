"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2.5" width="12" height="9" rx="1.5" />
      <path d="M1 4l6 4.5L13 4" />
    </svg>
  );
}

export default function OlvidarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

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

          {/* Logo móvil */}
          <div className="lg:hidden mb-8">
            <Image
              src="/Melena logo.png"
              alt="Melena Human Hair"
              width={120}
              height={36}
              className="object-contain object-left"
            />
          </div>

          {!sent ? (
            <>
              {/* Encabezado */}
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                Panel administrativo
              </p>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                Recuperar contraseña
              </h1>
              <p className="text-sm text-zinc-500 mb-8">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <div className="flex flex-col gap-5">

                {/* Correo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                    Correo electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@melenahumanhair.com"
                    className="w-full px-4 py-3 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                </div>

                {/* Botón */}
                <button
                  onClick={() => email && setSent(true)}
                  className="w-full py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-40"
                  disabled={!email}
                >
                  Enviar instrucciones
                </button>

                {/* Volver */}
                <Link
                  href="/acceso"
                  className="inline-flex items-center justify-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <ChevronLeft />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Estado: enviado */}
              <div className="flex flex-col items-center text-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <MailIcon />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                    Revisa tu correo
                  </h1>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    Enviamos las instrucciones a{" "}
                    <span className="font-semibold text-zinc-700">{email}</span>.
                    El enlace expira en 30 minutos.
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3">
                  <button
                    onClick={() => setSent(false)}
                    className="w-full py-3 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
                  >
                    Usar otro correo
                  </button>
                  <Link
                    href="/acceso"
                    className="w-full py-3 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors text-center"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>

                <p className="text-xs text-zinc-400">
                  ¿No llegó? Revisa la carpeta de spam o contacta a tu administrador.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
