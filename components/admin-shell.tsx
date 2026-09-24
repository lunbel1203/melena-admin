"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";
import { createClient } from "@/lib/supabase/client";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M2 5h16M2 10h16M2 15h16" />
    </svg>
  );
}

// Segmento de la URL (/admin/<modulo>/...) que corresponde a cada fila de permisos_modulo.
const MODULOS_CONTROLADOS = new Set([
  "resumen", "agenda", "clientas", "depositos", "personal",
  "catalogo", "proveedores", "facturacion", "reportes", "configuracion",
]);

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [esAdmin, setEsAdmin] = useState(true);
  const [modulosVisibles, setModulosVisibles] = useState<Set<string> | null>(null);
  const [cargandoAcceso, setCargandoAcceso] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setCargandoAcceso(false);

      const { data: empleado } = await supabase.from("empleados").select("rol").eq("user_id", user.id).single();
      if (!empleado || empleado.rol === "admin") {
        setEsAdmin(true);
        setCargandoAcceso(false);
        return;
      }
      setEsAdmin(false);

      const { data: permisos } = await supabase
        .from("permisos_modulo")
        .select("modulo, puede_ver")
        .eq("rol", empleado.rol);
      setModulosVisibles(new Set((permisos ?? []).filter((p) => p.puede_ver).map((p) => p.modulo)));
      setCargandoAcceso(false);
    })();
  }, [supabase]);

  const modulo = pathname.split("/")[2] ?? "";
  const rutaControlada = MODULOS_CONTROLADOS.has(modulo);
  const permitido = esAdmin || !rutaControlada || (modulosVisibles?.has(modulo) ?? false);

  return (
    <div className="flex h-full">
      {/* Backdrop móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar: drawer en móvil, fijo en md+ */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:relative md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* Columna de contenido */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Barra superior solo en móvil */}
        <header className="md:hidden flex items-center gap-3 px-4 h-14 bg-zinc-900 shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Abrir menú"
          >
            <MenuIcon />
          </button>
          <span className="text-white text-sm font-bold tracking-[0.18em]">MELENA</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          {cargandoAcceso ? null : permitido ? (
            children
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <p className="text-sm font-semibold text-zinc-700 mb-1">Acceso restringido</p>
              <p className="text-sm text-zinc-400">No tienes permiso para ver esta sección. Pídele a un admin que te lo habilite en Configuración → Roles y permisos.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
