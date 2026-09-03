import Link from "next/link";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="22" height="18" rx="2.5" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M2 19l6-6 4 4 3-3 9 8" />
    </svg>
  );
}

const agendaItems = [
  { time: "09:00", name: "Camila Santos", service: "Retoque tape-in", active: false },
  { time: "11:00", name: "Valentina Reyes", service: 'Tape-in 20"', active: true },
  { time: "13:00", name: "Andrea Peña", service: "Nano ring", active: false },
  { time: "15:00", name: "Sofía Guerrero", service: "Ponytail", active: false },
];

const clientRows = [
  {
    initial: "V",
    avatarClass: "bg-zinc-800 text-white",
    name: "Valentina Reyes",
    service: "Tape-in",
    progress: 80,
    progressColor: "bg-zinc-900",
    next: "3 oct",
  },
  {
    initial: "C",
    avatarClass: "bg-zinc-200 text-zinc-600",
    name: "Camila Santos",
    service: "Retoque",
    progress: 48,
    progressColor: "bg-zinc-500",
    next: "18 sep",
  },
  {
    initial: "A",
    avatarClass: "bg-zinc-100 text-zinc-500",
    name: "Andrea Peña",
    service: "Nano ring",
    progress: 25,
    progressColor: "bg-zinc-400",
    next: "24 sep",
  },
];

const photoStages = ["Antes", "Mes 1", "Mes 2", "Hoy"];

export default function ClientasPage() {
  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 shrink-0">Clientas</h1>

          {/* Search — visible en sm+ */}
          <div className="relative hidden sm:flex items-center ml-1">
            <span className="absolute left-3 text-zinc-400 pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar clienta..."
              className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden md:block text-sm text-zinc-400 font-medium">
              Mié 2 sep 2026
            </span>
            <Link
              href="/admin/clientas/nueva"
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap"
            >
              + Nueva clienta
            </Link>
          </div>
        </div>

        {/* Search — solo mobile */}
        <div className="mt-3 sm:hidden relative flex items-center">
          <span className="absolute left-3 text-zinc-400 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar clienta..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
          />
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Citas hoy
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">14</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Clientas activas
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">148</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Servicios / semana
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">63</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Ingreso del mes
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-white">RD$412K</p>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* ── Columna izquierda ── */}
        <div className="space-y-4">

          {/* Agenda de hoy */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Agenda de hoy</h2>
              <Link
                href="/admin/agenda"
                className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Ver todas ›
              </Link>
            </div>
            {agendaItems.map(({ time, name, service, active }) => (
              <div
                key={name}
                className={`flex items-center gap-3 sm:gap-4 px-5 py-3.5 border-b border-zinc-50 last:border-0 ${
                  active ? "bg-zinc-50" : "hover:bg-zinc-50/60"
                } transition-colors`}
              >
                <span
                  className={`text-sm tabular-nums w-10 shrink-0 ${
                    active ? "font-bold text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {time}
                </span>
                <span
                  className={`text-sm flex-1 ${
                    active ? "font-bold text-zinc-900" : "text-zinc-700"
                  }`}
                >
                  {name}
                </span>
                <span
                  className={`text-sm text-right shrink-0 ${
                    active ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {service}
                </span>
              </div>
            ))}
          </div>

          {/* Tabla Clientas */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Clientas</h2>
            </div>

            {/* Header columnas */}
            <div className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_80px_1fr_64px] gap-x-3 px-5 py-2.5 border-b border-zinc-50">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Clienta
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                Servicio
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest hidden sm:block">
                Progreso
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest text-right">
                Próxima
              </span>
            </div>

            {/* Filas */}
            {clientRows.map(({ initial, avatarClass, name, service, progress, progressColor, next }) => (
              <div
                key={name}
                className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_80px_1fr_64px] gap-x-3 items-center px-5 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${avatarClass}`}
                  >
                    {initial}
                  </div>
                  <span className="text-sm text-zinc-800 font-medium truncate">{name}</span>
                </div>

                <span className="text-sm text-zinc-500">{service}</span>

                <div className="hidden sm:flex items-center">
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${progressColor}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <span className="text-sm text-zinc-400 text-right whitespace-nowrap">{next}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Columna derecha — Perfil ── */}
        <div>
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 space-y-5">

            {/* Encabezado clienta */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
                V
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                      Valentina Reyes
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Clienta desde mar 2024 · 8 visitas
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
                    Activa
                  </span>
                </div>
              </div>
            </div>

            {/* Evolución fotográfica */}
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Evolución fotográfica
              </p>
              <div className="grid grid-cols-4 gap-2">
                {photoStages.map((stage) => (
                  <button
                    key={stage}
                    className="border-2 border-dashed border-zinc-200 rounded-xl py-4 flex flex-col items-center gap-1.5 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <PhotoIcon />
                    <span className="text-[10px] font-medium text-zinc-500">{stage}</span>
                    <span className="text-[9px] text-zinc-400 underline">or browse files</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sesiones + Ficha */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Sesiones
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-zinc-900">6</span>
                  <span className="text-sm text-zinc-400 font-medium">/10</span>
                </div>
              </div>
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Ficha
                </p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Largo</span>
                    <span className="text-sm font-semibold text-zinc-900">20"</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500">Color</span>
                    <span className="text-sm font-semibold text-zinc-900">Ombré</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Próxima cita */}
            <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4">
              <div className="text-center shrink-0 min-w-[36px]">
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest leading-none mb-1">
                  SEP
                </div>
                <div className="text-white text-3xl font-bold leading-none">03</div>
              </div>
              <div className="w-px h-10 bg-zinc-700 shrink-0" />
              <div className="min-w-0">
                <div className="text-zinc-500 text-[9px] font-bold uppercase tracking-widest mb-1">
                  Próxima cita
                </div>
                <div className="text-white text-sm font-medium">
                  11:00 am · Tape-in con Mariana
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="grid grid-cols-2 gap-3">
              <button className="border border-zinc-200 text-zinc-700 text-sm font-semibold py-3 rounded-xl hover:bg-zinc-50 transition-colors">
                Mensaje
              </button>
              <button className="bg-zinc-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-zinc-700 transition-colors">
                Registrar servicio
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
