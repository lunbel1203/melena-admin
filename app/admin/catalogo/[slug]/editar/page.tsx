"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6.5A1.5 1.5 0 0 1 3 5h1.5L6 3h6l1.5 2H15a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 15H3a1.5 1.5 0 0 1-1.5-1.5v-7z" />
      <circle cx="9" cy="10" r="2.5" />
    </svg>
  );
}

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
  mostrar_en_web: boolean;
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

interface ProductoRow {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string;
  tipo_cabello: string | null;
  color: string | null;
  largo_pulgadas: number | null;
  precio: number;
  costo: number | null;
  stock: number;
  stock_minimo: number;
  foto_url: string | null;
  activo: boolean;
}

export default function EditarCatalogoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [servicio, setServicio] = useState<ServicioRow | null | undefined>(undefined);
  const [producto, setProducto] = useState<ProductoRow | null | undefined>(undefined);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.from("servicios").select("*").eq("slug", slug).maybeSingle();
      if (s) {
        setServicio(s);
        setProducto(null);
        return;
      }
      const { data: p } = await supabase.from("productos").select("*").eq("slug", slug).maybeSingle();
      setServicio(null);
      setProducto(p ?? null);
    })();
  }, [slug, supabase]);

  if (servicio === undefined || producto === undefined) return <div className="p-8 text-zinc-400">Cargando…</div>;
  if (servicio) return <EditarServicio servicio={servicio} slug={slug} />;
  if (producto) return <EditarProducto producto={producto} slug={slug} />;
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
  const [mostrarEnWeb, setMostrarEnWeb] = useState(servicio.mostrar_en_web);

  const [estilistas, setEstilistas] = useState<Estilista[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [cargandoStaff, setCargandoStaff] = useState(true);

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: activos }, { data: asignados }] = await Promise.all([
        supabase
          .from("empleados")
          .select("id, nombre, puesto, roles!inner(nombre)")
          .eq("roles.nombre", "Estilista")
          .eq("activo", true)
          .order("nombre"),
        supabase.from("servicios_empleados").select("empleado_id").eq("servicio_id", servicio.id),
      ]);
      setEstilistas((activos ?? []).map((e) => ({ id: e.id, nombre: e.nombre, puesto: e.puesto })));
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
        mostrar_en_web: mostrarEnWeb,
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
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-700">Activo (visible para agendar)</span>
              <Toggle value={activo} onChange={() => setActivo((v) => !v)} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Visible en la web (melena-page)</span>
              <Toggle value={mostrarEnWeb} onChange={() => setMostrarEnWeb((v) => !v)} />
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
const TIPOS_CABELLO = [
  { id: "", label: "Ninguno" },
  { id: "virgin", label: "Virgin" },
  { id: "remy", label: "Remy" },
] as const;

function EditarProducto({ producto, slug }: { producto: ProductoRow; slug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [nombre, setNombre] = useState(producto.nombre);
  const [descripcion, setDescripcion] = useState(producto.descripcion ?? "");
  const [categoria, setCategoria] = useState(producto.categoria);
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
  const [tipoCabello, setTipoCabello] = useState<"" | "virgin" | "remy">(
    producto.tipo_cabello === "virgin" || producto.tipo_cabello === "remy" ? producto.tipo_cabello : "",
  );
  const [color, setColor] = useState(producto.color ?? "");
  const [largo, setLargo] = useState(producto.largo_pulgadas != null ? String(producto.largo_pulgadas) : "");
  const [precio, setPrecio] = useState(String(producto.precio));
  const [costo, setCosto] = useState(producto.costo != null ? String(producto.costo) : "");
  const [stock, setStock] = useState(String(producto.stock));
  const [stockMinimo, setStockMinimo] = useState(String(producto.stock_minimo));
  const [activo, setActivo] = useState(producto.activo);
  const [fotoUrl, setFotoUrl] = useState(producto.foto_url);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categorias_productos").select("id, nombre").eq("activo", true).order("nombre");
      setCategorias(data ?? []);
    })();
  }, [supabase]);

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-catalogo").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setError(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-catalogo").getPublicUrl(path);
    setFotoUrl(data.publicUrl);
    setSubiendoFoto(false);
  }

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(false);

    const { error: productoError } = await supabase
      .from("productos")
      .update({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        categoria: categoria.trim() || producto.categoria,
        tipo_cabello: tipoCabello || null,
        color: color.trim() || null,
        largo_pulgadas: largo ? Math.round(Number(largo)) : null,
        precio: Number(precio) || 0,
        costo: costo ? Number(costo) : null,
        stock: Math.max(0, Math.round(Number(stock) || 0)),
        stock_minimo: Math.max(0, Math.round(Number(stockMinimo) || 0)),
        foto_url: fotoUrl,
        activo,
      })
      .eq("id", producto.id);

    setGuardando(false);
    if (productoError) {
      setError(productoError.message);
      return;
    }
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
          <h1 className="text-xl font-bold text-zinc-900">Editar producto</h1>
          <p className="text-xs text-zinc-400 mt-0.5">{producto.nombre}</p>
        </div>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        <div className="flex-1 min-w-0 space-y-4">

          {/* Foto */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Foto</SectionLabel>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                {fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUrl} alt={producto.nombre} className="w-full h-full object-cover" />
                ) : (
                  <CameraIcon />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={subiendoFoto}
                  className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
                >
                  {subiendoFoto ? "Subiendo…" : fotoUrl ? "Cambiar foto" : "Subir foto"}
                </button>
                <input
                  ref={fotoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) subirFoto(f);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del producto</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors bg-white">
                  {!categorias.some((c) => c.nombre === categoria) && (
                    <option value={categoria}>{categoria} (inactiva)</option>
                  )}
                  {categorias.map((c) => (
                    <option key={c.id} value={c.nombre}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Tipo, color y largo</SectionLabel>
            <div className="mb-4">
              <p className="text-xs font-semibold text-zinc-500 mb-2">Tipo de cabello</p>
              <div className="flex gap-2 flex-wrap">
                {TIPOS_CABELLO.map((t) => (
                  <button key={t.id} onClick={() => setTipoCabello(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${tipoCabello === t.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Color</label>
                <input value={color} onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Largo (pulgadas)</label>
                <input type="number" min={0} value={largo} onChange={(e) => setLargo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Precios e inventario</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio de venta (RD$)</label>
                <input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Costo (RD$)</label>
                <input type="number" min={0} value={costo} onChange={(e) => setCosto(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Stock</label>
                <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Alerta de stock bajo</label>
                <input type="number" min={0} value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Publicación</SectionLabel>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-700">Activo (visible en catálogo)</span>
              <Toggle value={activo} onChange={() => setActivo((v) => !v)} />
            </div>
          </div>
        </div>

        <div className="lg:w-[280px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre", nombre],
                  ["Categoría", categoria || "—"],
                  ["Color", color || "—"],
                  ["Largo", largo ? `${largo}"` : "—"],
                  ["Precio", precio ? `RD$${Number(precio).toLocaleString("es-DO")}` : "—"],
                  ["Stock", stock || "0"],
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
