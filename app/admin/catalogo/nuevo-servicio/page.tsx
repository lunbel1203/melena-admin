"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

const categorias = [
  { id: "Instalación",   desc: "Servicio de extensiones completo" },
  { id: "Express",       desc: "Servicio rápido, menos de 1 hora" },
  { id: "Mantenimiento", desc: "Retoque, retiro o cuidado" },
  { id: "Taller de costura", desc: "Trabajo de máquina o a mano en el taller" },
];

interface Estilista {
  id: string;
  nombre: string;
  puesto: string | null;
}

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function NuevoServicioPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [duracion, setDuracion] = useState("");
  const [precio, setPrecio] = useState("");
  const [deposito, setDeposito] = useState("");
  const [sinDeposito, setSinDeposito] = useState(false);
  const [pideGramos, setPideGramos] = useState(false);
  const [mostrarEnWeb, setMostrarEnWeb] = useState(true);

  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("empleados")
        .select("id, nombre, puesto, roles!inner(nombre)")
        .eq("roles.nombre", "Estilista")
        .eq("activo", true)
        .order("nombre");
      setEstilistas((data ?? []).map((e) => ({ id: e.id, nombre: e.nombre, puesto: e.puesto })));
    })();
  }, [supabase]);

  function toggleStaff(id: string) {
    if (id === "Todas") { setSelectedStaff(["Todas"]); return; }
    setSelectedStaff((prev) => {
      const without = prev.filter((x) => x !== "Todas");
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
    });
  }

  const puedeEnviar = nombre.trim() && categoria && Number(duracion) > 0 && Number(precio) > 0 && !enviando;

  async function crearServicio() {
    setEnviando(true);
    setError(null);

    const { data: servicio, error: servicioError } = await supabase
      .from("servicios")
      .insert({
        nombre: nombre.trim(),
        slug: slugify(nombre),
        descripcion: descripcion.trim() || null,
        categoria,
        duracion_minutos: Math.round(Number(duracion)),
        precio: Number(precio),
        deposito_requerido: !sinDeposito,
        pide_gramos: pideGramos,
        mostrar_en_web: mostrarEnWeb,
        deposito_monto: sinDeposito ? null : deposito ? Number(deposito) : null,
      })
      .select("id")
      .single();

    if (servicioError) {
      setEnviando(false);
      setError(servicioError.code === "23505" ? "Ya existe un servicio con un nombre muy parecido." : servicioError.message);
      return;
    }

    if (selectedStaff.length > 0 && !selectedStaff.includes("Todas")) {
      const { error: staffError } = await supabase
        .from("servicios_empleados")
        .insert(selectedStaff.map((empleado_id) => ({ servicio_id: servicio.id, empleado_id })));
      if (staffError) {
        setEnviando(false);
        setError(`El servicio se creó, pero no se pudo asignar el personal: ${staffError.message}`);
        return;
      }
    }

    router.push("/admin/catalogo?tab=servicios");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo?tab=servicios" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nuevo servicio</h1>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del servicio</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Tape-in"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Descripción pública</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción que verán las clientas al agendar..."
                  rows={3} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Categoría</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categorias.map((c) => (
                <button key={c.id} onClick={() => setCategoria(c.id)}
                  className={`text-left px-4 py-3.5 rounded-xl border-2 transition-all ${categoria === c.id ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-200"}`}>
                  <p className="text-sm font-semibold text-zinc-900">{c.id}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>3 · Duración y precio</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Duración (minutos)</label>
                <input type="number" min={1} value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="90"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio (RD$)</label>
                <input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="3200"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Depósito de reserva (RD$)</label>
              <input type="number" min={0} value={sinDeposito ? "" : deposito} onChange={(e) => setDeposito(e.target.value)}
                disabled={sinDeposito} placeholder="1000 (por defecto)"
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors disabled:opacity-40 mb-2" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sinDeposito} onChange={(e) => setSinDeposito(e.target.checked)} className="w-4 h-4 accent-zinc-900" />
                <span className="text-sm text-zinc-600">Sin depósito requerido</span>
              </label>
            </div>

            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" checked={pideGramos} onChange={(e) => setPideGramos(e.target.checked)} className="w-4 h-4 mt-0.5 accent-zinc-900" />
              <span className="text-sm text-zinc-600">
                Pedir gramos al agendar
                <span className="block text-xs text-zinc-400">La clienta escribe cuántos gramos se va a poner (máx. 800; cada paquete son 100 g). Úsalo en método suizo, postura y mantenimiento de tape.</span>
              </span>
            </label>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Publicación</SectionLabel>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-700">
                Mostrar en la web y en la app
                <span className="block text-xs text-zinc-400">
                  Si lo apagas, las clientas no lo ven ni lo pueden reservar. El equipo sí lo puede agregar a la factura (para servicios que se hacen en el salón, sin cita).
                </span>
              </span>
              <button
                type="button"
                onClick={() => setMostrarEnWeb((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${mostrarEnWeb ? "bg-zinc-900" : "bg-zinc-200"}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${mostrarEnWeb ? "left-5" : "left-1"}`} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>4 · Quién lo ofrece</SectionLabel>
            {estilistas.length === 0 ? (
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
        </div>

        {/* RIGHT */}
        <div className="lg:w-[300px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre",    nombre     || "—"],
                  ["Categoría", categoria  || "—"],
                  ["Duración",  duracion ? `${duracion} min` : "—"],
                  ["Precio",    precio ? `RD$${Number(precio).toLocaleString("es-DO")}` : "—"],
                  ["Depósito",  sinDeposito ? "Sin depósito" : deposito ? `RD$${Number(deposito).toLocaleString("es-DO")}` : "RD$1,000 (por defecto)"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between text-sm gap-3">
                    <span className="text-zinc-500 shrink-0">{l}</span>
                    <span className="font-semibold text-zinc-900 text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <div className="px-5 pt-4">
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
            <div className="p-5 flex flex-col gap-3">
              <Link href="/admin/catalogo?tab=servicios" className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button
                onClick={crearServicio}
                disabled={!puedeEnviar}
                className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {enviando ? "Creando…" : "Crear servicio"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
