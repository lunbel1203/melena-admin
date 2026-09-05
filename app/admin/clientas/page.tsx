import Link from "next/link";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-");
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

const clientRows = [
  {
    initial: "V",
    name: "Valentina Reyes",
    phone: "809 555 0142",
    service: 'Tape-in 20"',
    progress: 90,
    lastVisit: "24 ago",
    nextAppt: "3 sep",
    status: "Activa",
    statusClass: "bg-green-50 text-green-700",
  },
  {
    initial: "C",
    name: "Camila Santos",
    phone: "809 555 0188",
    service: "Retoque",
    progress: 50,
    lastVisit: "18 ago",
    nextAppt: "18 sep",
    status: "Activa",
    statusClass: "bg-green-50 text-green-700",
  },
  {
    initial: "A",
    name: "Andrea Peña",
    phone: "809 555 0231",
    service: "Nano ring",
    progress: 30,
    lastVisit: "12 ago",
    nextAppt: "24 sep",
    status: "Activa",
    statusClass: "bg-green-50 text-green-700",
  },
  {
    initial: "R",
    name: "Renata Morales",
    phone: "809 555 0377",
    service: 'Tape-in 18"',
    progress: 18,
    lastVisit: "2 sep",
    nextAppt: "Sin agendar",
    status: "Molestia",
    statusClass: "bg-orange-50 text-orange-600",
  },
  {
    initial: "L",
    name: "Lucia Ferrer",
    phone: "809 555 0410",
    service: "Nano ring",
    progress: 8,
    lastVisit: "—",
    nextAppt: "2 sep",
    status: "Nueva",
    statusClass: "bg-zinc-100 text-zinc-600",
  },
  {
    initial: "D",
    name: "Daniela Paz",
    phone: "809 555 0522",
    service: "Sin servicio",
    progress: 55,
    lastVisit: "4 may",
    nextAppt: "Sin agendar",
    status: "Inactiva",
    statusClass: "bg-zinc-100 text-zinc-500",
  },
];

export default function ClientasPage() {
  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 shrink-0">Clientas</h1>

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
      <div className="flex gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm min-w-[140px]">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Clientas activas
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">148</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-100 shadow-sm min-w-[120px]">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Citas hoy
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">14</p>
        </div>
      </div>

      {/* ── Tabla todas las clientas ── */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100">
          <h2 className="text-sm font-semibold text-zinc-900">Todas las clientas</h2>
          <span className="text-xs text-zinc-400">148 clientas · mostrando 6</span>
        </div>

        {/* Columnas header */}
        <div className="hidden sm:grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto_28px] gap-x-4 px-5 sm:px-6 py-2.5 border-b border-zinc-50">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Clienta</span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Servicio actual</span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Progreso</span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Última visita</span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Próxima cita</span>
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Estado</span>
          <span />
        </div>

        {/* Filas */}
        {clientRows.map(({ initial, name, phone, service, progress, lastVisit, nextAppt, status, statusClass }) => (
          <Link
            key={name}
            href={`/admin/clientas/${slugify(name)}`}
            className="flex sm:grid sm:grid-cols-[2fr_1.2fr_1fr_1fr_1fr_auto_28px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/70 transition-colors cursor-pointer"
          >
            {/* Clienta */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-semibold text-zinc-600 shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{name}</p>
                <p className="text-xs text-zinc-400">{phone}</p>
              </div>
            </div>

            {/* Servicio */}
            <span className="hidden sm:block text-sm text-zinc-600">{service}</span>

            {/* Progreso */}
            <div className="hidden sm:flex items-center">
              <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-800"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Última visita */}
            <span className="hidden sm:block text-sm text-zinc-500">{lastVisit}</span>

            {/* Próxima cita */}
            <span className="hidden sm:block text-sm text-zinc-500">{nextAppt}</span>

            {/* Estado */}
            <span className={`hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusClass}`}>
              {status}
            </span>

            {/* Chevron */}
            <span className="text-zinc-300 ml-auto sm:ml-0 shrink-0">
              <ChevronIcon />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
