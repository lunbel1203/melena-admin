"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

const navItems = [
  { name: "Resumen", href: "/admin/resumen", icon: GridIcon },
  { name: "Agenda", href: "/admin/agenda", icon: CalendarIcon },
  { name: "Clientas", href: "/admin/clientas", icon: UserIcon },
  { name: "Depósitos", href: "/admin/depositos", icon: InboxIcon },
  { name: "Personal", href: "/admin/personal", icon: UsersIcon },
  { name: "Catálogo", href: "/admin/catalogo", icon: LayersIcon },
  { name: "Reportes", href: "/admin/reportes", icon: ChartIcon },
];

const services = [
  { name: "Tape-in", href: "/admin/servicios/tape-in" },
  { name: "Nano ring", href: "/admin/servicios/nano-ring" },
  { name: "Bulk", href: "/admin/servicios/bulk" },
  { name: "Ponytail", href: "/admin/servicios/ponytail" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 bg-zinc-900 flex flex-col shrink-0">
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
          {navItems.map(({ name, href, icon: Icon }) => {
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

        <div className="mt-7 mb-2">
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.18em] px-3 mb-2 font-semibold">
            Servicios
          </p>
          <ul className="space-y-0.5">
            {services.map(({ name, href }) => {
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
                    <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                    {name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-zinc-800 px-4 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          A
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-medium truncate">Ana Beltré</div>
          <div className="text-zinc-400 text-xs">Gerente</div>
        </div>
      </div>
    </aside>
  );
}
