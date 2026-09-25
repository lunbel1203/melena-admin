"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <rect x="0.5" y="0.5" width="6" height="6" rx="1" />
      <rect x="9.5" y="0.5" width="6" height="6" rx="1" />
      <rect x="0.5" y="9.5" width="6" height="6" rx="1" />
      <rect x="9.5" y="9.5" width="6" height="6" rx="1" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="3" width="13" height="11.5" rx="1.5" />
      <path d="M1.5 7h13" />
      <path d="M5 1.5V4M11 1.5V4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="8" cy="5" r="3.5" />
      <path d="M1.5 14.5c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <path d="M1.5 9.5h3.5l1.5 2h3l1.5-2h3.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="5.5" cy="4.5" r="3" />
      <path d="M1 14c0-2.8 2-4.5 4.5-4.5S10 11.2 10 14" />
      <circle cx="12" cy="4.5" r="2.5" />
      <path d="M10.5 14c0-2 0.7-3.5 1.5-3.5s1.5 1.5 1.5 3.5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L1.5 5.5l6.5 4 6.5-4L8 1.5z" />
      <path d="M1.5 10l6.5 4 6.5-4" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 1.5v13" />
      <rect x="3" y="8.5" width="3" height="6" rx="0.5" />
      <rect x="7.5" y="5" width="3" height="9.5" rx="0.5" />
      <rect x="12" y="2.5" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3.5" width="9" height="7" rx="1" />
      <path d="M10 6h2.5l2 3v2.5H10V6z" />
      <circle cx="3.5" cy="11.5" r="1.5" />
      <circle cx="12" cy="11.5" r="1.5" />
    </svg>
  );
}

function ReceiptIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 1.5h10v13l-1.5-1-2 1.5-2-1.5-2 1.5L3 14.5V1.5z" />
      <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="2.25" />
      <path d="M8 1.5v1.7M8 12.8v1.7M14.5 8h-1.7M3.2 8H1.5M12.4 3.6l-1.2 1.2M4.8 11.2l-1.2 1.2M12.4 12.4l-1.2-1.2M4.8 4.8L3.6 3.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L2.5 3.5v4c0 3.6 2.4 6.3 5.5 7 3.1-.7 5.5-3.4 5.5-7v-4L8 1.5z" />
    </svg>
  );
}

const navItems = [
  { name: "Resumen",     href: "/admin/resumen",     icon: GridIcon,     modulo: "resumen" },
  { name: "Agenda",      href: "/admin/agenda",      icon: CalendarIcon, modulo: "agenda" },
  { name: "Clientas",    href: "/admin/clientas",    icon: UserIcon,     modulo: "clientas" },
  { name: "Depósitos",   href: "/admin/depositos",   icon: InboxIcon,    modulo: "depositos" },
  { name: "Personal",    href: "/admin/personal",    icon: UsersIcon,    modulo: "personal" },
  { name: "Catálogo",    href: "/admin/catalogo",    icon: LayersIcon,   modulo: "catalogo" },
  { name: "Proveedores", href: "/admin/proveedores",  icon: TruckIcon,   modulo: "proveedores" },
  { name: "Facturación", href: "/admin/facturacion", icon: ReceiptIcon,  modulo: "facturacion" },
  { name: "Reportes",    href: "/admin/reportes",    icon: ChartIcon,    modulo: "reportes" },
  { name: "Configuración", href: "/admin/configuracion", icon: GearIcon, modulo: "configuracion" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const [usuario, setUsuario] = useState<{ nombre: string; rolNombre: string } | null>(null);
  const [esAdmin, setEsAdmin] = useState(false);
  const [modulosVisibles, setModulosVisibles] = useState<Set<string> | null>(null);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("empleados")
        .select("nombre, rol_id, roles(nombre, es_admin_total)")
        .eq("user_id", user.id)
        .single();
      if (!data) return;
      const rol = Array.isArray(data.roles) ? data.roles[0] : data.roles;
      setUsuario({ nombre: data.nombre, rolNombre: rol?.nombre ?? "" });

      if (rol?.es_admin_total) {
        setEsAdmin(true);
        setModulosVisibles(null);
      } else {
        setEsAdmin(false);
        const { data: permisos } = await supabase
          .from("rol_permisos")
          .select("permiso_clave")
          .eq("rol_id", data.rol_id)
          .like("permiso_clave", "%.ver");
        setModulosVisibles(new Set((permisos ?? []).map((p) => p.permiso_clave.replace(/\.ver$/, ""))));
      }
    })();
  }, [supabase]);

  const itemsVisibles = modulosVisibles ? navItems.filter((item) => modulosVisibles.has(item.modulo)) : navItems;

  return (
    <aside className="w-52 h-screen bg-zinc-900 flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
        <Image
          src="/Melena logo blanco.png"
          alt="Melena"
          width={120}
          height={36}
          className="object-contain"
          priority
        />
        <span className="text-zinc-500 text-xs font-medium tracking-widest">ADMIN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {itemsVisibles.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={name}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-zinc-900"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  <span className="shrink-0">
                    <Icon />
                  </span>
                  {name}
                </Link>
              </li>
            );
          })}
        </ul>

        {esAdmin && (
          <ul className="space-y-0.5 mt-4 pt-4 border-t border-zinc-800">
            <li>
              <Link
                href="/admin/seguridad"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/seguridad")
                    ? "bg-white text-zinc-900"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                <span className="shrink-0">
                  <ShieldIcon />
                </span>
                Seguridad
              </Link>
            </li>
          </ul>
        )}
      </nav>

      {/* User */}
      <Link
        href="/admin/perfil"
        className="border-t border-zinc-800 px-4 py-4 flex items-center gap-3 hover:bg-zinc-800 transition-colors group"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-white text-sm font-semibold shrink-0 overflow-hidden">
          {usuario ? usuario.nombre.charAt(0).toUpperCase() : ""}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-white text-sm font-medium truncate group-hover:text-zinc-100">
            {usuario ? usuario.nombre : "Cargando…"}
          </div>
          <div className="text-zinc-400 text-xs">{usuario ? usuario.rolNombre : ""}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-600 group-hover:text-zinc-400 shrink-0">
          <path d="M5 3l4 4-4 4" />
        </svg>
      </Link>
    </aside>
  );
}
