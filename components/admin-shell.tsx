"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M2 5h16M2 10h16M2 15h16" />
    </svg>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
          {children}
        </main>
      </div>
    </div>
  );
}
