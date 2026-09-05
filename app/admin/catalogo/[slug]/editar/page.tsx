"use client";

import Link from "next/link";
import { use, useState } from "react";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${value ? "bg-zinc-900" : "bg-zinc-200"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-1"}`} />
    </button>
  );
}

/* ── Base data per slug ── */
const serviceBase: Record<string, {
  isService: true;
  name: string; categoria: string; duracion: string; precio: string;
  deposito: string; sinDeposito: boolean; descripcion: string;
  staff: string[]; sitioWeb: boolean; appClientas: boolean; whatsapp: boolean;
}> = {
  "tape-in": {
    isService: true,
    name: "Tape-in", categoria: "Instalación", duracion: "1.5 h",
    precio: "RD$3,200", deposito: "RD$1,000", sinDeposito: false,
    descripcion: "Cintas adhesivas de doble cara, instalación rápida y retirable. Ideal para uso diario.",
    staff: ["Mariana Ríos", "Sofía Luna"],
    sitioWeb: true, appClientas: true, whatsapp: true,
  },
  "nano-ring": {
    isService: true,
    name: "Nano ring", categoria: "Instalación", duracion: "3 h",
    precio: "RD$4,800", deposito: "RD$1,000", sinDeposito: false,
    descripcion: "Anillos de nano queratina sin calor. Larga duración y mínimo daño capilar.",
    staff: ["Mariana Ríos"],
    sitioWeb: true, appClientas: true, whatsapp: true,
  },
  "bulk": {
    isService: true,
    name: "Bulk", categoria: "Instalación", duracion: "4 h",
    precio: "RD$4,500", deposito: "RD$1,000", sinDeposito: false,
    descripcion: "Extensiones bulk trenzadas directamente en el cabello. Sin adhesivos ni anillos.",
    staff: ["Vanessa Gil", "Sofía Luna"],
    sitioWeb: true, appClientas: true, whatsapp: true,
  },
  "ponytail": {
    isService: true,
    name: "Ponytail", categoria: "Express", duracion: "30 min",
    precio: "RD$1,900", deposito: "", sinDeposito: true,
    descripcion: "Cola de cabello de extensión. Rápido y de alto impacto visual.",
    staff: ["Mariana Ríos", "Sofía Luna"],
    sitioWeb: true, appClientas: true, whatsapp: true,
  },
  "retiro-de-extensiones": {
    isService: true,
    name: "Retiro de extensiones", categoria: "Mantenimiento", duracion: "45 min",
    precio: "RD$1,200", deposito: "", sinDeposito: true,
    descripcion: "Retiro seguro de extensiones con productos especializados.",
    staff: ["Mariana Ríos", "Sofía Luna"],
    sitioWeb: false, appClientas: true, whatsapp: false,
  },
};

const productBase: Record<string, {
  isService: false;
  name: string; tipo: string; color: string; textura: string;
  precio: string; costo: string; alerta: string;
  largos: string[]; sitioWeb: boolean; appClientas: boolean; whatsapp: boolean; masVendido: boolean;
}> = {
  "rubio-balayage": {
    isService: false,
    name: 'Rubio balayage 18"', tipo: "Remy", color: "Rubio con raíz oscura", textura: "Liso",
    precio: "RD$4,200", costo: "RD$2,400", alerta: "5",
    largos: ['18"', '20"', '22"'],
    sitioWeb: true, appClientas: true, whatsapp: true, masVendido: false,
  },
  "negro-natural": {
    isService: false,
    name: 'Negro natural 16"', tipo: "Virgin", color: "Negro azabache", textura: "Liso",
    precio: "RD$3,600", costo: "RD$2,232", alerta: "5",
    largos: ['14"', '16"', '18"'],
    sitioWeb: true, appClientas: true, whatsapp: true, masVendido: false,
  },
  "chocolate-ombre": {
    isService: false,
    name: 'Chocolate ombré 22"', tipo: "Remy", color: "Degradado a caramelo", textura: "Liso",
    precio: "RD$5,100", costo: "RD$3,009", alerta: "5",
    largos: ['20"', '22"', '24"'],
    sitioWeb: true, appClientas: true, whatsapp: true, masVendido: true,
  },
  "castano-natural": {
    isService: false,
    name: 'Castaño natural 20"', tipo: "Virgin", color: "Castaño medio uniforme", textura: "Liso",
    precio: "RD$2,850", costo: "RD$1,739", alerta: "5",
    largos: ['16"', '18"', '20"'],
    sitioWeb: true, appClientas: true, whatsapp: true, masVendido: false,
  },
};

const categorias = ["Instalación", "Express", "Mantenimiento"];
const staffAll   = ["Mariana Ríos", "Sofía Luna", "Vanessa Gil", "Todas"];
const tipos      = ["Remy", "Virgin", "Sintético"];
const texturas   = ["Liso", "Ondulado", "Rizado"];
const largosOpts = ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"'];

export default function EditarCatalogoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const svc = serviceBase[slug];
  const prd = productBase[slug];

  if (svc) return <EditarServicio base={svc} slug={slug} />;
  if (prd) return <EditarProducto base={prd} slug={slug} />;
  return <div className="p-8 text-zinc-400">No encontrado.</div>;
}

/* ══ EDITAR SERVICIO ══ */
function EditarServicio({ base, slug }: { base: typeof serviceBase[string]; slug: string }) {
  const [nombre,      setNombre]      = useState(base.name);
  const [categoria,   setCategoria]   = useState(base.categoria);
  const [duracion,    setDuracion]    = useState(base.duracion);
  const [precio,      setPrecio]      = useState(base.precio);
  const [deposito,    setDeposito]    = useState(base.deposito);
  const [sinDeposito, setSinDeposito] = useState(base.sinDeposito);
  const [descripcion, setDescripcion] = useState(base.descripcion);
  const [staff,       setStaff]       = useState<string[]>(base.staff);
  const [sitioWeb,    setSitioWeb]    = useState(base.sitioWeb);
  const [appCli,      setAppCli]      = useState(base.appClientas);
  const [whatsapp,    setWhatsapp]    = useState(base.whatsapp);

  function toggleStaff(s: string) {
    setStaff((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/admin/catalogo/${slug}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Editar servicio</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{base.name}</p>
        </div>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Info básica */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del servicio</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Descripción pública</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
              </div>
            </div>
          </div>

          {/* Categoría */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Categoría</SectionLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {categorias.map((c) => (
                <button key={c} onClick={() => setCategoria(c)}
                  className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${categoria === c ? "border-zinc-900 text-zinc-900" : "border-zinc-100 text-zinc-600 hover:border-zinc-200"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Duración y precio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Duración y precio</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Duración</label>
                <input value={duracion} onChange={(e) => setDuracion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio</label>
                <input value={precio} onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Depósito de reserva</label>
              <input value={sinDeposito ? "" : deposito} onChange={(e) => setDeposito(e.target.value)}
                disabled={sinDeposito} placeholder="RD$1,000"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-40 mb-2" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sinDeposito} onChange={(e) => setSinDeposito(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                <span className="text-sm text-zinc-600">Sin depósito requerido</span>
              </label>
            </div>
          </div>

          {/* Quién lo ofrece */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Quién lo ofrece</SectionLabel>
            <div className="space-y-2">
              {staffAll.map((s) => {
                const active = staff.includes(s);
                return (
                  <button key={s} onClick={() => toggleStaff(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                    <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">{s.charAt(0)}</div>
                    <span className="text-sm font-semibold text-zinc-900 flex-1">{s}</span>
                    {active && <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Activa</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publicación */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Publicación</SectionLabel>
            <div className="space-y-4">
              {[
                ["Sitio web",         sitioWeb, () => setSitioWeb((v) => !v)],
                ["App de clientas",   appCli,   () => setAppCli((v) => !v)],
                ["Botón de whatsapp", whatsapp, () => setWhatsapp((v) => !v)],
              ].map(([label, val, fn]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700">{label as string}</span>
                  <Toggle value={val as boolean} onChange={fn as () => void} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:w-[280px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre",    nombre],
                  ["Categoría", categoria],
                  ["Duración",  duracion],
                  ["Precio",    precio],
                  ["Depósito",  sinDeposito ? "Sin depósito" : deposito || "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link href={`/admin/catalogo/${slug}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══ EDITAR PRODUCTO ══ */
function EditarProducto({ base, slug }: { base: typeof productBase[string]; slug: string }) {
  const [nombre,     setNombre]     = useState(base.name);
  const [tipo,       setTipo]       = useState(base.tipo);
  const [color,      setColor]      = useState(base.color);
  const [textura,    setTextura]    = useState(base.textura);
  const [precio,     setPrecio]     = useState(base.precio);
  const [costo,      setCosto]      = useState(base.costo);
  const [alerta,     setAlerta]     = useState(base.alerta);
  const [largos,     setLargos]     = useState<string[]>(base.largos);
  const [sitioWeb,   setSitioWeb]   = useState(base.sitioWeb);
  const [appCli,     setAppCli]     = useState(base.appClientas);
  const [whatsapp,   setWhatsapp]   = useState(base.whatsapp);
  const [masVendido, setMasVendido] = useState(base.masVendido);

  function toggleLargo(l: string) {
    setLargos((prev) => prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/admin/catalogo/${slug}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Editar producto</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{base.name}</p>
        </div>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del producto</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Color</label>
                <input value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Tipo y textura</SectionLabel>
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-500 mb-2">Tipo</p>
              <div className="flex gap-2 flex-wrap">
                {tipos.map((t) => (
                  <button key={t} onClick={() => setTipo(t)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${tipo === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 mb-2">Textura</p>
              <div className="flex gap-2 flex-wrap">
                {texturas.map((t) => (
                  <button key={t} onClick={() => setTextura(t)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${textura === t ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Largos disponibles</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {largosOpts.map((l) => (
                <button key={l} onClick={() => toggleLargo(l)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${largos.includes(l) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Precios</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio de venta</label>
                <input value={precio} onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Costo</label>
                <input value={costo} onChange={(e) => setCosto(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Alerta de stock</label>
                <input value={alerta} onChange={(e) => setAlerta(e.target.value)} type="number" min="1"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Publicación</SectionLabel>
            <div className="space-y-4">
              {([
                ["Catálogo del sitio web", sitioWeb,   () => setSitioWeb((v)   => !v)],
                ["Catálogo de la app",     appCli,     () => setAppCli((v)     => !v)],
                ["Whatsapp y agendar",     whatsapp,   () => setWhatsapp((v)   => !v)],
                ["Más vendido",            masVendido, () => setMasVendido((v) => !v)],
              ] as [string, boolean, () => void][]).map(([label, val, fn]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-700">{label}</span>
                  <Toggle value={val} onChange={fn} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-[280px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre",  nombre],
                  ["Tipo",    tipo],
                  ["Color",   color],
                  ["Precio",  precio],
                  ["Largos",  largos.length ? largos.join(", ") : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <Link href={`/admin/catalogo/${slug}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
