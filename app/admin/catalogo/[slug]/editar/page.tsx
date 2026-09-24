"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

const categoriasServicio = ["Instalación", "Express", "Mantenimiento"];

interface ServicioRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  duracion_minutos: number;
  precio: number;
  deposito_requerido: boolean;
  deposito_monto: number | null;
  dias_seguimiento: number[];
  activo: boolean;
}

interface Estilista {
  id: string;
  nombre: string;
  puesto: string | null;
}

function parseDias(texto: string) {
  return texto
    .split(/[,\s]+/)
    .map((v) => v.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

/* ── Base data mock (productos todavía no conectados) ── */
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

const tipos      = ["Remy", "Virgin", "Sintético"];
const texturas   = ["Liso", "Ondulado", "Rizado"];
const largosOpts = ['12"', '14"', '16"', '18"', '20"', '22"', '24"', '26"'];

export default function EditarCatalogoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [servicio, setServicio] = useState<ServicioRow | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("servicios").select("*").eq("slug", slug).maybeSingle();
      setServicio(data);
    })();
  }, [slug, supabase]);

  const prd = productBase[slug];

  if (servicio === undefined) return <div className="p-8 text-zinc-400">Cargando…</div>;
  if (servicio) return <EditarServicio servicio={servicio} slug={slug} />;
  if (prd) return <EditarProducto base={prd} slug={slug} />;
  return <div className="p-8 text-zinc-400">No encontrado.</div>;
}

/* ══ EDITAR SERVICIO ══ */
function EditarServicio({ servicio, slug }: { servicio: ServicioRow; slug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [nombre, setNombre] = useState(servicio.nombre);
  const [descripcion, setDescripcion] = useState(servicio.descripcion ?? "");
  const [categoria, setCategoria] = useState(servicio.categoria ?? "");
  const [duracion, setDuracion] = useState(String(servicio.duracion_minutos));
  const [precio, setPrecio] = useState(String(servicio.precio));
  const [deposito, setDeposito] = useState(servicio.deposito_monto != null ? String(servicio.deposito_monto) : "");
  const [sinDeposito, setSinDeposito] = useState(!servicio.deposito_requerido);
  const [diasSeguimiento, setDiasSeguimiento] = useState(servicio.dias_seguimiento.join(", "));
  const [activo, setActivo] = useState(servicio.activo);

  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [cargandoStaff, setCargandoStaff] = useState(true);

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: activos }, { data: asignados }] = await Promise.all([
        supabase.from("empleados").select("id, nombre, puesto").eq("rol", "estilista").eq("activo", true).order("nombre"),
        supabase.from("servicios_empleados").select("empleado_id").eq("servicio_id", servicio.id),
      ]);
      setEstilistas(activos ?? []);
      setSelectedStaff(asignados && asignados.length > 0 ? asignados.map((a) => a.empleado_id) : ["Todas"]);
      setCargandoStaff(false);
    })();
  }, [supabase, servicio.id]);

  function toggleStaff(id: string) {
    if (id === "Todas") { setSelectedStaff(["Todas"]); return; }
    setSelectedStaff((prev) => {
      const without = prev.filter((x) => x !== "Todas");
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
    });
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const { error: servicioError } = await supabase
      .from("servicios")
      .update({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        categoria: categoria || null,
        duracion_minutos: Math.round(Number(duracion)) || servicio.duracion_minutos,
        precio: Number(precio) || 0,
        deposito_requerido: !sinDeposito,
        deposito_monto: sinDeposito ? null : deposito ? Number(deposito) : null,
        dias_seguimiento: parseDias(diasSeguimiento),
        activo,
      })
      .eq("id", servicio.id);

    if (servicioError) {
      setGuardando(false);
      setError(servicioError.message);
      return;
    }

    const { error: deleteError } = await supabase.from("servicios_empleados").delete().eq("servicio_id", servicio.id);
    if (deleteError) {
      setGuardando(false);
      setError(`Se guardó el servicio, pero no se pudo actualizar el personal: ${deleteError.message}`);
      return;
    }
    if (selectedStaff.length > 0 && !selectedStaff.includes("Todas")) {
      const { error: staffError } = await supabase
        .from("servicios_empleados")
        .insert(selectedStaff.map((empleado_id) => ({ servicio_id: servicio.id, empleado_id })));
      if (staffError) {
        setGuardando(false);
        setError(`Se guardó el servicio, pero no se pudo asignar el personal: ${staffError.message}`);
        return;
      }
    }

    setGuardando(false);
    setGuardado(true);
    router.refresh();
    setTimeout(() => setGuardado(false), 2500);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href={`/admin/catalogo/${slug}`} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Editar servicio</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{servicio.nombre}</p>
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
              {categoriasServicio.map((c) => (
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
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Duración (minutos)</label>
                <input type="number" min={1} value={duracion} onChange={(e) => setDuracion(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio (RD$)</label>
                <input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Depósito de reserva (RD$)</label>
              <input type="number" min={0} value={sinDeposito ? "" : deposito} onChange={(e) => setDeposito(e.target.value)}
                disabled={sinDeposito} placeholder="1000"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-40 mb-2" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sinDeposito} onChange={(e) => setSinDeposito(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                <span className="text-sm text-zinc-600">Sin depósito requerido</span>
              </label>
            </div>
          </div>

          {/* Seguimiento post-servicio */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Seguimiento post-servicio</SectionLabel>
            <p className="text-xs text-zinc-400 mb-3">
              Días después del servicio en que se contacta a la clienta para saber cómo va (separados por coma). Déjalo vacío para no hacer seguimiento.
            </p>
            <input value={diasSeguimiento} onChange={(e) => setDiasSeguimiento(e.target.value)} placeholder="Ej. 3, 30"
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
          </div>

          {/* Quién lo ofrece */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Quién lo ofrece</SectionLabel>
            {cargandoStaff ? (
              <p className="text-sm text-zinc-400">Cargando…</p>
            ) : estilistas.length === 0 ? (
              <p className="text-sm text-zinc-400">No hay estilistas activas configuradas.</p>
            ) : (
              <div className="space-y-2">
                <button onClick={() => toggleStaff("Todas")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${selectedStaff.includes("Todas") ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">✦</div>
                  <span className="text-sm font-semibold text-zinc-900">Todas</span>
                  {selectedStaff.includes("Todas") && <span className="ml-auto text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">Seleccionada</span>}
                </button>
                {estilistas.map((s) => {
                  const active = selectedStaff.includes(s.id);
                  return (
                    <button key={s.id} onClick={() => toggleStaff(s.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? "border-zinc-900 bg-zinc-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                      <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                        {s.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-zinc-900">{s.nombre}</div>
                        {s.puesto && <div className="text-xs text-zinc-400">{s.puesto}</div>}
                      </div>
                      {active && <span className="ml-auto text-xs font-semibold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full shrink-0">Seleccionada</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Publicación */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Publicación</SectionLabel>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Activo (visible para agendar)</span>
              <Toggle value={activo} onChange={() => setActivo((v) => !v)} />
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
                  ["Categoría", categoria || "—"],
                  ["Duración",  duracion ? `${duracion} min` : "—"],
                  ["Precio",    precio ? `RD$${Number(precio).toLocaleString("es-DO")}` : "—"],
                  ["Depósito",  sinDeposito ? "Sin depósito" : deposito ? `RD$${Number(deposito).toLocaleString("es-DO")}` : "—"],
                  ["Seguimiento", parseDias(diasSeguimiento).length ? parseDias(diasSeguimiento).map((d) => `${d}d`).join(", ") : "Sin seguimiento"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {error && <p className="text-xs text-red-500 px-5 pt-3">{error}</p>}
            {guardado && <p className="text-xs font-medium text-teal-600 px-5 pt-3">Guardado ✓</p>}
            <div className="p-5 flex flex-col gap-3">
              <Link href={`/admin/catalogo/${slug}`}
                className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button onClick={guardar} disabled={guardando}
                className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-50">
                {guardando ? "Guardando…" : "Guardar cambios"}
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
