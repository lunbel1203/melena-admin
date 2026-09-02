const dailyData = [
  { day: "L", value: 42, isToday: false },
  { day: "M", value: 62, isToday: false },
  { day: "M", value: 34, isToday: false },
  { day: "J", value: 91, isToday: true },
  { day: "V", value: 68, isToday: false },
  { day: "S", value: 54, isToday: false },
  { day: "D", value: 22, isToday: false },
];

const stylists = [
  { name: "Mariana Ríos", percentage: 92, barColor: "bg-zinc-900", blocked: false },
  { name: "Sofía Luna", percentage: 78, barColor: "bg-zinc-700", blocked: false },
  { name: "Vanessa Gil", percentage: 64, barColor: "bg-zinc-400", blocked: false },
  { name: "Camila Torres", percentage: 0, barColor: "", blocked: true },
];

const currentClients = [
  {
    initial: "V",
    avatarClass: "bg-violet-100 text-violet-700",
    name: "Valentina Reyes",
    detail: "Tape-in · Mariana",
    status: "En curso",
    statusClass: "bg-green-50 text-green-600",
  },
  {
    initial: "D",
    avatarClass: "bg-zinc-800 text-white",
    name: "Daniela Paz",
    detail: "Nano ring · Sofía",
    status: "En curso",
    statusClass: "bg-green-50 text-green-600",
  },
  {
    initial: "R",
    avatarClass: "bg-rose-100 text-rose-600",
    name: "Renata Morales",
    detail: "Check-in 11:05 am",
    status: "Sin asignar",
    statusClass: "bg-orange-50 text-orange-500",
  },
];

export default function ResumenPage() {
  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 lg:mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Buenos días, Ana
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Esto es lo que pasa hoy en el salón.
          </p>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 sm:pt-1">
          <span className="hidden sm:block text-sm text-zinc-400 font-medium">
            Mié 2 sep 2026
          </span>
          <button className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
            + Nueva cita
          </button>
        </div>
      </div>

      {/* Stats */}
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
            Ocupación
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-zinc-900">82%</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[10px] sm:text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mb-2 sm:mb-3">
            Ingreso del mes
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-white">RD$412K</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">

        {/* Bar chart */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-5 sm:mb-6">
            Facturación por día
          </h2>
          <div className="flex items-end gap-2 h-36 sm:h-40">
            {dailyData.map(({ value, isToday }, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-xl ${
                  isToday ? "bg-zinc-900" : "bg-zinc-100"
                }`}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2.5">
            {dailyData.map(({ day }, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs text-zinc-400">{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stylists occupancy */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 sm:mb-5">
            Ocupación por estilista
          </h2>
          <div className="space-y-4 sm:space-y-5">
            {stylists.map(({ name, percentage, blocked, barColor }) => (
              <div key={name}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm text-zinc-700 font-medium">{name}</span>
                  {blocked ? (
                    <span className="text-xs text-zinc-400 font-medium">Bloqueada</span>
                  ) : (
                    <span className="text-sm font-semibold text-zinc-900">
                      {percentage}%
                    </span>
                  )}
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  {!blocked && (
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">

        {/* Requires action */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-sm font-semibold text-zinc-900">Requiere acción</h2>
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">
              6 pendientes
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-600">3 depósitos por validar</span>
              <button className="bg-zinc-900 text-white text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors shrink-0">
                Revisar
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-600">2 tickets de molestia abiertos</span>
              <button className="border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shrink-0">
                Ver
              </button>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-zinc-600">1 estilista sin disponibilidad</span>
              <button className="border border-zinc-200 text-zinc-700 text-xs font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-zinc-50 transition-colors shrink-0">
                Configurar
              </button>
            </div>
          </div>
        </div>

        {/* In salon now */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-100 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4 sm:mb-5">
            En el salón ahora
          </h2>
          <div className="space-y-4">
            {currentClients.map(({ initial, avatarClass, name, detail, status, statusClass }) => (
              <div key={name} className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarClass}`}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-900 truncate">{name}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{detail}</div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass}`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
