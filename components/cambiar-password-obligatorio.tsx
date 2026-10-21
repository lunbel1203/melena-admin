"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Primera entrada con la contraseña temporal que genera el sistema: hasta que no elija la suya
 * no se muestra el panel (AdminShell). No pide la actual: acaba de entrar con ella.
 */
export default function CambiarPasswordObligatorio({ nombre, onListo }: { nombre: string; onListo: () => void }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [ver, setVer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const largoOk = nueva.length >= 8;
  const iguales = nueva.length > 0 && nueva === confirmar;

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!largoOk) return setError("Usa al menos 8 caracteres.");
    if (!iguales) return setError("Las contraseñas no coinciden.");
    setGuardando(true);

    const { error: errPass } = await supabase.auth.updateUser({ password: nueva });
    if (errPass) {
      setGuardando(false);
      return setError(
        /different from the old|same as the old/i.test(errPass.message)
          ? "Elige una contraseña distinta a la temporal."
          : /weak|short|least/i.test(errPass.message)
            ? "Esa contraseña es muy débil. Prueba con otra más larga."
            : errPass.message,
      );
    }

    const { error: errMarca } = await supabase.rpc("marcar_password_cambiada");
    setGuardando(false);
    if (errMarca) return setError("Tu contraseña se cambió, pero no pudimos terminar el proceso. Cierra sesión y entra con la nueva.");
    onListo();
  }

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push("/acceso");
    router.refresh();
  }

  const campo = "w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 bg-white";

  return (
    <div className="min-h-full flex items-center justify-center bg-zinc-50 px-6 py-10">
      <form onSubmit={guardar} className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200 p-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">Hola{nombre ? `, ${nombre}` : ""}. Crea tu contraseña</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Entraste con la contraseña temporal que generó el sistema. Por tu seguridad, elige una propia antes de continuar.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nueva contraseña</label>
          <input type={ver ? "text" : "password"} autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} placeholder="Mínimo 8 caracteres" className={campo} />
        </div>
        <div>
          <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Confirma tu contraseña</label>
          <input type={ver ? "text" : "password"} autoComplete="new-password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} className={campo} />
        </div>

        <label className="flex items-center gap-2 text-xs text-zinc-500">
          <input type="checkbox" checked={ver} onChange={(e) => setVer(e.target.checked)} /> Mostrar contraseñas
        </label>

        <div className="space-y-0.5 text-xs">
          <p className={largoOk ? "text-emerald-600" : "text-zinc-400"}>{largoOk ? "✓" : "•"} Al menos 8 caracteres</p>
          <p className={iguales ? "text-emerald-600" : "text-zinc-400"}>{iguales ? "✓" : "•"} Las dos contraseñas coinciden</p>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!largoOk || !iguales || guardando}
          className="w-full py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
        >
          {guardando ? "Guardando…" : "Guardar y continuar"}
        </button>
        <button type="button" onClick={cerrarSesion} className="w-full text-xs text-zinc-400 hover:text-zinc-600">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
