"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { confirmar } from "@/lib/alerts";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 2l3 3-8 8-3.5 1 1-3.5 8-8z" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 .5.5V4M6 7v5M10 7v5M3 4l1 9.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5L13 4" />
    </svg>
  );
}

interface Producto {
  id: string;
  slug: string;
  nombre: string;
  categoria: string;
  tipo_cabello: string | null;
  color: string | null;
  largo_pulgadas: number | null;
  precio: number;
  stock: number;
  stock_minimo: number;
  activo: boolean;
  foto_url: string | null;
}

interface Servicio {
  id: string;
  slug: string;
  nombre: string;
  categoria: string | null;
  duracion_minutos: number;
  precio: number;
  deposito_requerido: boolean;
  deposito_monto: number | null;
  activo: boolean;
  quienLoOfrece: string;
}

function formatPrecio(n: number) {
  return `RD$${n.toLocaleString("es-DO")}`;
}
function formatDuracion(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return resto === 0 ? `${h} h` : `${h}.${Math.round((resto / 60) * 10)} h`;
}

const categoryBadge = "bg-zinc-100 text-zinc-600 border border-zinc-200";

type Tab = "productos" | "servicios";

export default function CatalogoPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("productos");
  const [searchP, setSearchP] = useState("");
  const [searchS, setSearchS] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);

    const [{ data: prod }, { data: serv }, { data: serviciosEmpleados }] = await Promise.all([
      supabase
        .from("productos")
        .select("id, slug, nombre, categoria, tipo_cabello, color, largo_pulgadas, precio, stock, stock_minimo, activo, foto_url")
        .order("nombre"),
      supabase
        .from("servicios")
        .select("id, slug, nombre, categoria, duracion_minutos, precio, deposito_requerido, deposito_monto, activo")
        .order("nombre"),
      supabase.from("servicios_empleados").select("servicio_id, empleados(nombre)"),
    ]);

    const staffPorServicio = new Map<string, string[]>();
    (serviciosEmpleados ?? []).forEach((row) => {
      const nombre = row.empleados?.nombre;
      if (!nombre) return;
      const lista = staffPorServicio.get(row.servicio_id) ?? [];
      lista.push(nombre);
      staffPorServicio.set(row.servicio_id, lista);
    });

    setProductos(prod ?? []);
    setServicios(
      (serv ?? []).map((s) => ({
        ...s,
        quienLoOfrece: staffPorServicio.get(s.id)?.join(" · ") || "Todas",
      })),
    );

    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function eliminarProducto(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `¿Eliminar "${nombre}"?`,
      texto: "Esta acción no se puede deshacer.",
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    setError(null);
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      setError(
        error.code === "23503"
          ? `No se puede eliminar "${nombre}": tiene facturas o movimientos asociados. Desactívalo en su lugar desde Editar.`
          : error.message,
      );
      return;
    }
    cargar();
  }

  async function eliminarServicio(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `¿Eliminar "${nombre}"?`,
      texto: "Esta acción no se puede deshacer.",
      confirmarTexto: "Eliminar",
      peligroso: true,
    });
    if (!ok) return;
    setError(null);
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) {
      setError(
        error.code === "23503"
          ? `No se puede eliminar "${nombre}": tiene citas o facturas asociadas. Desactívalo en su lugar desde Editar.`
          : error.message,
      );
      return;
    }
    cargar();
  }

  const filteredProducts = productos.filter((p) => p.nombre.toLowerCase().includes(searchP.toLowerCase()));
  const filteredServices = servicios.filter((s) => s.nombre.toLowerCase().includes(searchS.toLowerCase()));
  const stockLowCount = productos.filter((p) => p.stock <= p.stock_minimo).length;

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Catálogo</h1>
        <p className="text-sm text-zinc-400 mt-1">Lo que se publica aquí alimenta el sitio web y la app.</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-zinc-200 mb-5">
        {(["productos", "servicios"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
      {cargando && <p className="text-sm text-zinc-400 mb-4">Cargando…</p>}

      {/* ══ PRODUCTOS ══ */}
      {tab === "productos" && !cargando && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchP}
                onChange={(e) => setSearchP(e.target.value)}
                placeholder="Buscar producto..."
                className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
              />
            </div>
            {stockLowCount > 0 && (
              <span className="text-sm font-semibold text-orange-500">
                {stockLowCount} con stock bajo
              </span>
            )}
            <Link href="/admin/catalogo/nuevo-producto" className="ml-auto bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              + Nuevo producto
            </Link>
          </div>

          {/* Tabla productos */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr_72px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
              {["Producto", "Categoría", "Detalle", "Precio", "Stock", "Estado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="px-6 py-10 text-sm text-zinc-400 text-center">
                {productos.length === 0 ? "Todavía no has publicado productos." : "Ningún producto coincide con la búsqueda."}
              </p>
            )}

            {filteredProducts.map((p) => {
              const stockBajo = p.stock <= p.stock_minimo;
              const detalle = [p.tipo_cabello, p.color, p.largo_pulgadas ? `${p.largo_pulgadas}"` : null].filter(Boolean).join(" · ");
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/admin/catalogo/${p.slug}`)}
                  className="flex sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1.4fr_1fr_72px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0 overflow-hidden">
                      {p.foto_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.foto_url} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        p.nombre.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">{p.nombre}</p>
                      <p className="text-xs text-zinc-400 truncate">{detalle || "—"}</p>
                    </div>
                  </div>

                  <span className="hidden sm:inline-block text-xs font-medium text-zinc-600 border border-zinc-200 px-2.5 py-1 rounded-lg w-fit">
                    {p.categoria}
                  </span>

                  <span className="hidden sm:block text-sm text-zinc-600 truncate">{detalle || "—"}</span>

                  <span className="hidden sm:block text-sm font-semibold text-zinc-900">{formatPrecio(p.precio)}</span>

                  <div className="hidden sm:block">
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden mb-1 w-24">
                      <div
                        className={`h-full rounded-full ${stockBajo ? "bg-orange-400" : "bg-zinc-800"}`}
                        style={{ width: `${Math.min(100, Math.round((p.stock / Math.max(p.stock_minimo * 4, 1)) * 100))}%` }}
                      />
                    </div>
                    <p className={`text-xs ${stockBajo ? "text-orange-500 font-semibold" : "text-zinc-400"}`}>
                      {p.stock} unidades{stockBajo ? " · stock bajo" : ""}
                    </p>
                  </div>

                  <span className={`hidden sm:block text-sm ${p.activo ? "text-zinc-500" : "text-zinc-300"}`}>
                    {p.activo ? "Publicado" : "Inactivo"}
                  </span>

                  <div className="flex items-center gap-1 ml-auto sm:ml-0 shrink-0">
                    <Link
                      href={`/admin/catalogo/${p.slug}/editar`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      title="Editar"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarProducto(p.id, p.nombre);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ══ SERVICIOS ══ */}
      {tab === "servicios" && !cargando && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchS}
                onChange={(e) => setSearchS(e.target.value)}
                placeholder="Buscar servicio..."
                className="pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl w-52 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-300"
              />
            </div>
            <span className="text-sm text-zinc-400">{servicios.filter((s) => s.activo).length} servicios activos</span>
            <Link href="/admin/catalogo/nuevo-servicio" className="ml-auto bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              + Nuevo servicio
            </Link>
          </div>

          {/* Tabla servicios */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="hidden sm:grid grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1fr_72px] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
              {["Servicio", "Categoría", "Duración", "Precio", "Depósito", "Estado", ""].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <p className="px-6 py-10 text-sm text-zinc-400 text-center">
                {servicios.length === 0 ? "Todavía no has publicado servicios." : "Ningún servicio coincide con la búsqueda."}
              </p>
            )}

            {filteredServices.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/admin/catalogo/${s.slug}`)}
                className="flex sm:grid sm:grid-cols-[2fr_1.1fr_1fr_1fr_1fr_1fr_72px] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                    {s.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{s.nombre}</p>
                    <p className="text-xs text-zinc-400 truncate">{s.quienLoOfrece}</p>
                  </div>
                </div>

                <span className={`hidden sm:inline-block text-xs font-medium px-2.5 py-1 rounded-lg w-fit ${categoryBadge}`}>
                  {s.categoria || "—"}
                </span>

                <span className="hidden sm:block text-sm text-zinc-600">{formatDuracion(s.duracion_minutos)}</span>

                <span className="hidden sm:block text-sm font-semibold text-zinc-900">{formatPrecio(s.precio)}</span>

                <span className={`hidden sm:block text-sm ${!s.deposito_requerido ? "text-zinc-400" : "text-zinc-700"}`}>
                  {s.deposito_requerido ? formatPrecio(s.deposito_monto ?? 1000) : "Sin depósito"}
                </span>

                <span className={`hidden sm:block text-sm ${s.activo ? "text-zinc-500" : "text-zinc-300"}`}>
                  {s.activo ? "Publicado" : "Inactivo"}
                </span>

                <div className="flex items-center gap-1 ml-auto sm:ml-0 shrink-0">
                  <Link
                    href={`/admin/catalogo/${s.slug}/editar`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                    title="Editar"
                  >
                    <EditIcon />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      eliminarServicio(s.id, s.nombre);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Eliminar"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
