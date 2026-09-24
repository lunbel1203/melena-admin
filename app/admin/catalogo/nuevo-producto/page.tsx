"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database.types";

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

const CATEGORIA_CABELLO = "Extensión de cabello";
const categoriasPreset = [CATEGORIA_CABELLO, "Cuidado capilar", "Herramientas y accesorios"];

const tiposCabello = [
  { id: "virgin", label: "Virgin" },
  { id: "remy", label: "Remy" },
] as const;
const largosOpts = [12, 14, 16, 18, 20, 22, 24, 26];

interface Proveedor {
  id: string;
  nombre: string;
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

export default function NuevoProductoPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categoriaOtra, setCategoriaOtra] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);

  const [tipoCabello, setTipoCabello] = useState<"" | "virgin" | "remy">("");
  const [color, setColor] = useState("");
  const [largos, setLargos] = useState<number[]>([]);

  const [precio, setPrecio] = useState("");
  const [costo, setCosto] = useState("");
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("5");

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const esCabello = categoria === CATEGORIA_CABELLO;
  const categoriaFinal = categoria === "otra" ? categoriaOtra.trim() : categoria;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("proveedores").select("id, nombre").eq("activo", true).order("nombre");
      setProveedores(data ?? []);
    })();
  }, [supabase]);

  function toggleLargo(l: number) {
    setLargos((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]));
  }

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    setError(null);
    const ext = file.name.split(".").pop();
    const path = `${slugify(nombre) || "producto"}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("fotos-catalogo").upload(path, file);
    if (uploadError) {
      setSubiendoFoto(false);
      return setError(uploadError.message);
    }
    const { data } = supabase.storage.from("fotos-catalogo").getPublicUrl(path);
    setFotoUrl(data.publicUrl);
    setSubiendoFoto(false);
  }

  const puedeEnviar =
    nombre.trim() &&
    categoriaFinal &&
    Number(precio) > 0 &&
    (!esCabello || (tipoCabello && largos.length > 0)) &&
    !enviando;

  async function crearProducto() {
    setEnviando(true);
    setError(null);

    const base = {
      categoria: categoriaFinal,
      descripcion: descripcion.trim() || null,
      precio: Number(precio),
      costo: costo ? Number(costo) : null,
      proveedor_id: proveedorId || null,
      stock_minimo: Math.max(0, Math.round(Number(stockMinimo) || 0)),
      foto_url: fotoUrl,
    };

    const filas: TablesInsert<"productos">[] = esCabello
      ? largos.map((l) => ({
          ...base,
          nombre: `${nombre.trim()} ${l}"`,
          slug: slugify(`${nombre}-${l}`),
          tipo_cabello: tipoCabello as "virgin" | "remy",
          color: color.trim() || null,
          largo_pulgadas: l,
          stock: Math.round(Number(stock) || 0),
        }))
      : [
          {
            ...base,
            nombre: nombre.trim(),
            slug: slugify(nombre),
            tipo_cabello: null,
            color: null,
            largo_pulgadas: null,
            stock: Math.round(Number(stock) || 0),
          },
        ];

    const { error: insertError } = await supabase.from("productos").insert(filas);

    if (insertError) {
      setEnviando(false);
      setError(insertError.code === "23505" ? "Ya existe un producto con un nombre muy parecido." : insertError.message);
      return;
    }

    router.push("/admin/catalogo");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-zinc-50">
      <div className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center gap-3">
        <Link href="/admin/catalogo" className="text-zinc-400 hover:text-zinc-700 transition-colors">
          <BackIcon />
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">Nuevo producto</h1>
      </div>

      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[940px] mx-auto">
        {/* LEFT */}
        <div className="flex-1 min-w-0 space-y-4">

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Foto</SectionLabel>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200 shrink-0">
                {fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={fotoUrl} alt="Foto del producto" className="w-full h-full object-cover" />
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
                    const file = e.target.files?.[0];
                    if (file) subirFoto(file);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>1 · Información básica</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Nombre del producto</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Rubio balayage, Shampoo hidratante, Plancha profesional..."
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Descripción</label>
                <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción que verán las clientas..."
                  rows={2} className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Proveedor</label>
                <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors bg-white">
                  <option value="">Sin proveedor</option>
                  {proveedores.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>2 · Categoría</SectionLabel>
            <div className="flex gap-2 flex-wrap mb-3">
              {categoriasPreset.map((c) => (
                <button key={c} onClick={() => setCategoria(c)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${categoria === c ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                  {c}
                </button>
              ))}
              <button onClick={() => setCategoria("otra")}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${categoria === "otra" ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                Otra
              </button>
            </div>
            {categoria === "otra" && (
              <input value={categoriaOtra} onChange={(e) => setCategoriaOtra(e.target.value)} placeholder="Escribe la categoría..."
                className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
            )}
          </div>

          {esCabello && (
            <>
              <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                <SectionLabel>3 · Tipo y color</SectionLabel>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-zinc-500 mb-2">Tipo</p>
                  <div className="flex gap-2 flex-wrap">
                    {tiposCabello.map((t) => (
                      <button key={t.id} onClick={() => setTipoCabello(t.id)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${tipoCabello === t.id ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Color</label>
                  <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Rubio con raíz oscura"
                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200 p-5">
                <SectionLabel>4 · Largos disponibles</SectionLabel>
                <p className="text-xs text-zinc-400 mb-3">Se crea un producto separado por cada largo (cada uno con su propio stock).</p>
                <div className="flex flex-wrap gap-2">
                  {largosOpts.map((l) => (
                    <button key={l} onClick={() => toggleLargo(l)}
                      className={`px-3.5 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${largos.includes(l) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-100 text-zinc-700 hover:border-zinc-200"}`}>
                      {l}&quot;
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>{esCabello ? "5" : "3"} · Precios e inventario</SectionLabel>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Precio de venta (RD$)</label>
                <input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="4200"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Costo (RD$)</label>
                <input type="number" min={0} value={costo} onChange={(e) => setCosto(e.target.value)} placeholder="2400"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">
                  {esCabello ? "Stock inicial (c/u)" : "Stock inicial"}
                </label>
                <input type="number" min={0} value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Alerta de stock bajo</label>
                <input type="number" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} min="0"
                  className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-[300px] shrink-0">
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="p-5 border-b border-zinc-100">
              <SectionLabel>Resumen</SectionLabel>
              <div className="space-y-3">
                {[
                  ["Nombre", nombre || "—"],
                  ["Categoría", categoriaFinal || "—"],
                  ...(esCabello ? [["Tipo", tiposCabello.find((t) => t.id === tipoCabello)?.label || "—"]] : []),
                  ...(esCabello ? [["Largos", largos.length ? largos.map((l) => `${l}"`).join(", ") : "—"]] : []),
                  ["Precio", precio ? `RD$${Number(precio).toLocaleString("es-DO")}` : "—"],
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
              <Link href="/admin/catalogo" className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 text-center hover:bg-zinc-50 transition-colors">
                Cancelar
              </Link>
              <button
                onClick={crearProducto}
                disabled={!puedeEnviar}
                className="w-full py-3 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors disabled:opacity-40"
              >
                {enviando ? "Creando…" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
