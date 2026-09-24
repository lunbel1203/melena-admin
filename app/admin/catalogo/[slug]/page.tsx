"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 18 18" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6.5A1.5 1.5 0 0 1 3 5h1.5L6 3h6l1.5 2H15a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 15H3a1.5 1.5 0 0 1-1.5-1.5v-7z" />
      <circle cx="9" cy="10" r="2.5" />
    </svg>
  );
}

function formatPrecio(n: number) {
  return `RD$${n.toLocaleString("es-DO")}`;
}

interface ServicioDetalle {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  duracion_minutos: number;
  precio: number;
  deposito_requerido: boolean;
  deposito_monto: number | null;
  dias_seguimiento: number[];
  foto_url: string | null;
  activo: boolean;
}

interface ProductoDetalle {
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

interface Estilista {
  id: string;
  nombre: string;
  puesto: string | null;
}

/* ── Page ── */
export default function CatalogoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const supabase = useMemo(() => createClient(), []);
  const [servicio, setServicio] = useState<ServicioDetalle | null | undefined>(undefined);
  const [producto, setProducto] = useState<ProductoDetalle | null | undefined>(undefined);

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
  if (servicio) return <ServicioDetalleView servicio={servicio} slug={slug} />;
  if (producto) return <ProductoDetalleView producto={producto} slug={slug} />;
  return <div className="p-8 text-zinc-400">Página no encontrada.</div>;
}

/* ══════════════════════════════════════════
   SERVICIO
══════════════════════════════════════════ */
function ServicioDetalleView({ servicio, slug }: { servicio: ServicioDetalle; slug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [activo, setActivo] = useState(servicio.activo);
  const [fotoUrl, setFotoUrl] = useState(servicio.foto_url);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [staff, setStaff] = useState<Estilista[]>([]);
  const [cargandoStaff, setCargandoStaff] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("servicios_empleados")
        .select("empleados(id, nombre, puesto)")
        .eq("servicio_id", servicio.id);
      setStaff((data ?? []).map((r) => r.empleados).filter((e): e is Estilista => e !== null));
      setCargandoStaff(false);
    })();
  }, [supabase, servicio.id]);

  async function togglePublicado() {
    const nuevo = !activo;
    setActivo(nuevo);
    const { error } = await supabase.from("servicios").update({ activo: nuevo }).eq("id", servicio.id);
    if (error) {
      setActivo(!nuevo);
      setError(error.message);
    }
  }

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${slug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-servicios").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setError(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-servicios").getPublicUrl(path);
    const { error: dbError } = await supabase.from("servicios").update({ foto_url: data.publicUrl }).eq("id", servicio.id);
    setSubiendoFoto(false);
    if (dbError) return setError(dbError.message);
    setFotoUrl(data.publicUrl);
  }

  return (
    <div className="min-h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/catalogo?tab=servicios" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{servicio.nombre}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
                {activo ? "Publicado" : "Inactivo"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {servicio.categoria ?? "Sin categoría"} · {servicio.duracion_minutos} min · {formatPrecio(servicio.precio)}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={togglePublicado}
              className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
            >
              {activo ? "Despublicar" : "Publicar"}
            </button>
            <Link href={`/admin/catalogo/${slug}/editar`} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Editar servicio
            </Link>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Body */}
      <div className="px-5 sm:px-8 py-6 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Ficha del servicio</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-4">
              {[
                ["Categoría", servicio.categoria ?? "—"],
                ["Duración", `${servicio.duracion_minutos} min`],
                ["Precio", formatPrecio(servicio.precio)],
                ["Depósito de reserva", servicio.deposito_requerido ? formatPrecio(servicio.deposito_monto ?? 1000) : "Sin depósito"],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{l}</p>
                  <p className="text-sm font-semibold text-zinc-900">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Descripción pública</p>
              <p className="text-sm text-zinc-600 leading-relaxed">{servicio.descripcion || "Sin descripción."}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-100">
              <h2 className="text-sm font-semibold text-zinc-900">Quién lo ofrece</h2>
            </div>
            {cargandoStaff ? (
              <p className="px-5 py-4 text-sm text-zinc-400">Cargando…</p>
            ) : staff.length === 0 ? (
              <p className="px-5 py-4 text-sm text-zinc-500">Cualquier estilista activa puede ofrecerlo.</p>
            ) : (
              staff.map((s) => (
                <div key={s.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-100 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                    {s.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 flex-1">{s.nombre}</span>
                  {s.puesto && <span className="text-xs text-zinc-400">{s.puesto}</span>}
                </div>
              ))
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-2">Seguimiento post-servicio</h2>
            <p className="text-sm text-zinc-600">
              {servicio.dias_seguimiento.length > 0
                ? `Se contacta a la clienta a los ${servicio.dias_seguimiento.join(" y ")} día(s) después.`
                : "Sin seguimiento configurado."}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="lg:w-[300px] xl:w-[310px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Foto del servicio</p>
            <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center mb-3">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt={servicio.nombre} className="w-full h-full object-cover" />
              ) : (
                <CameraIcon />
              )}
            </div>
            <button
              onClick={() => fotoInputRef.current?.click()}
              disabled={subiendoFoto}
              className="w-full py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
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
    </div>
  );
}

/* ══════════════════════════════════════════
   PRODUCTO
══════════════════════════════════════════ */
function ProductoDetalleView({ producto, slug }: { producto: ProductoDetalle; slug: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [activo, setActivo] = useState(producto.activo);
  const [fotoUrl, setFotoUrl] = useState(producto.foto_url);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  async function togglePublicado() {
    const nuevo = !activo;
    setActivo(nuevo);
    const { error } = await supabase.from("productos").update({ activo: nuevo }).eq("id", producto.id);
    if (error) {
      setActivo(!nuevo);
      setError(error.message);
    }
  }

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
    const { error: dbError } = await supabase.from("productos").update({ foto_url: data.publicUrl }).eq("id", producto.id);
    setSubiendoFoto(false);
    if (dbError) return setError(dbError.message);
    setFotoUrl(data.publicUrl);
  }

  const stockBajo = producto.stock <= producto.stock_minimo;
  const margen = producto.costo ? Math.round(((producto.precio - producto.costo) / producto.precio) * 100) : null;
  const detalle = [
    producto.tipo_cabello ? (producto.tipo_cabello === "virgin" ? "Virgin" : "Remy") : null,
    producto.color,
    producto.largo_pulgadas ? `${producto.largo_pulgadas}"` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="min-h-full bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-100 px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900">{producto.nombre}</h1>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${activo ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-600"}`}>
                {activo ? "Publicado" : "Inactivo"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {producto.categoria}
              {detalle ? ` · ${detalle}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={togglePublicado}
              className="border border-zinc-200 text-zinc-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap"
            >
              {activo ? "Despublicar" : "Publicar"}
            </button>
            <Link href={`/admin/catalogo/${slug}/editar`} className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Editar producto
            </Link>
          </div>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Stats */}
      <div className="px-5 sm:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-zinc-100 shadow-sm bg-white p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Stock actual</p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{producto.stock}</p>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${stockBajo ? "bg-orange-400" : "bg-zinc-800"}`}
              style={{ width: `${Math.min(100, Math.round((producto.stock / Math.max(producto.stock_minimo * 4, 1)) * 100))}%` }}
            />
          </div>
          {stockBajo && <p className="text-xs text-orange-500 font-semibold mt-1">Stock bajo</p>}
        </div>
        <div className="rounded-2xl border border-zinc-100 shadow-sm bg-white p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Precio</p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{formatPrecio(producto.precio)}</p>
        </div>
        <div className="rounded-2xl border border-zinc-100 shadow-sm bg-white p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Costo</p>
          <p className="text-2xl sm:text-3xl font-bold text-zinc-900">{producto.costo != null ? formatPrecio(producto.costo) : "—"}</p>
        </div>
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">Margen</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{margen != null ? `${margen}%` : "—"}</p>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 sm:px-8 pb-8 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Ficha del producto</h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 mb-4">
              {[
                ["Tipo", producto.tipo_cabello ? (producto.tipo_cabello === "virgin" ? "Virgin" : "Remy") : "—"],
                ["Color", producto.color ?? "—"],
                ["Largo", producto.largo_pulgadas ? `${producto.largo_pulgadas}"` : "—"],
                ["Precio de venta", formatPrecio(producto.precio)],
                ["Costo", producto.costo != null ? formatPrecio(producto.costo) : "—"],
                ["Alerta de stock", `${producto.stock_minimo} unidades`],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">{l}</p>
                  <p className="text-sm font-semibold text-zinc-900">{v}</p>
                </div>
              ))}
            </div>
            {producto.descripcion && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 mb-1">Descripción</p>
                <p className="text-sm text-zinc-600 leading-relaxed">{producto.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="lg:w-[300px] xl:w-[310px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">Foto</p>
            <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center mb-3">
              {fotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoUrl} alt={producto.nombre} className="w-full h-full object-cover" />
              ) : (
                <CameraIcon />
              )}
            </div>
            <button
              onClick={() => fotoInputRef.current?.click()}
              disabled={subiendoFoto}
              className="w-full py-2 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors disabled:opacity-50"
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
    </div>
  );
}
