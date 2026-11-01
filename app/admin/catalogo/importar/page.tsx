"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readSheet } from "read-excel-file/browser";
import { createClient } from "@/lib/supabase/client";
import type { TablesInsert } from "@/types/database.types";

const COLUMNAS = ["Nombre", "Categoría", "Precio", "Stock", "Costo", "Stock mínimo", "Descripción"] as const;

function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const quitaTildes = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

type Fila = { linea: number; fila: TablesInsert<"productos"> | null; error: string | null };

/** "1,250.50" / "1250" / 1250 → número (o null si no es un número) */
function numero(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function ImportarInventario() {
  const supabase = createClient();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [filas, setFilas] = useState<Fila[]>([]);
  const [archivo, setArchivo] = useState<string | null>(null);
  const [leyendo, setLeyendo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hecho, setHecho] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("categorias_productos")
      .select("nombre")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => setCategorias((data ?? []).map((c) => c.nombre)));
  }, [supabase]);

  async function leer(file: File) {
    setError(null);
    setHecho(null);
    setFilas([]);
    setArchivo(file.name);
    setLeyendo(true);
    try {
      const data = await readSheet(file);
      if (data.length < 2) throw new Error("El archivo no tiene filas de productos.");
      const cab = data[0].map((c) => quitaTildes(String(c ?? "")));
      const col = (nombre: string) => cab.indexOf(quitaTildes(nombre));
      const idx = Object.fromEntries(COLUMNAS.map((c) => [c, col(c)])) as Record<(typeof COLUMNAS)[number], number>;
      const faltan = (["Nombre", "Categoría", "Precio"] as const).filter((c) => idx[c] < 0);
      if (faltan.length) throw new Error(`Faltan columnas: ${faltan.join(", ")}. Descarga la plantilla para ver el formato.`);

      const porNombre = new Map(categorias.map((c) => [quitaTildes(c), c]));
      const vistos = new Set<string>();
      const lista: Fila[] = [];
      data.slice(1).forEach((r, i) => {
        const celda = (c: (typeof COLUMNAS)[number]) => (idx[c] >= 0 ? r[idx[c]] : null);
        const nombre = String(celda("Nombre") ?? "").trim();
        if (!nombre && r.every((x) => x === null || x === "")) return; // fila vacía
        const linea = i + 2;
        const categoria = porNombre.get(quitaTildes(String(celda("Categoría") ?? "")));
        const precio = numero(celda("Precio"));
        const stock = numero(celda("Stock")) ?? 0;
        const costo = numero(celda("Costo"));
        const minimo = numero(celda("Stock mínimo")) ?? 0;
        const slug = slugify(nombre);
        let err: string | null = null;
        if (!nombre) err = "Falta el nombre";
        else if (!categoria) err = `Categoría "${String(celda("Categoría") ?? "")}" no existe`;
        else if (precio === null || precio < 0) err = "Precio inválido";
        else if (stock < 0 || minimo < 0) err = "Stock inválido";
        else if (vistos.has(slug)) err = "Nombre repetido en el archivo";
        vistos.add(slug);
        lista.push({
          linea,
          error: err,
          fila: err
            ? null
            : {
                nombre,
                slug,
                categoria: categoria!,
                precio: precio!,
                stock: Math.round(stock),
                costo,
                stock_minimo: Math.round(minimo),
                descripcion: String(celda("Descripción") ?? "").trim() || null,
              },
        });
      });
      if (!lista.length) throw new Error("El archivo no tiene filas de productos.");
      setFilas(lista);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo. Usa un .xlsx.");
    }
    setLeyendo(false);
  }

  const validas = filas.filter((f) => f.fila).map((f) => f.fila!);
  const conError = filas.length - validas.length;

  async function importar() {
    setGuardando(true);
    setError(null);
    // se actualiza por nombre (slug): si el producto ya existe se corrigen precio, stock y costo; si no, se crea
    const { error: err } = await supabase.from("productos").upsert(validas, { onConflict: "slug" });
    setGuardando(false);
    if (err) return setError(`No se pudo importar: ${err.message}`);
    setHecho(validas.length);
    setFilas([]);
  }

  function plantilla() {
    const csv = "﻿" + [COLUMNAS.join(","), `Shampoo hidratante,${categorias[0] ?? "Cuidado"},850,12,400,3,Shampoo de 500 ml`].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    a.download = "plantilla-inventario.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/admin/catalogo" className="text-sm text-zinc-500 hover:text-zinc-900">← Catálogo</Link>
      <h1 className="text-2xl font-bold text-zinc-900 mt-2">Importar inventario desde Excel</h1>
      <p className="text-sm text-zinc-500 mt-1">
        Sube un archivo .xlsx con las columnas: {COLUMNAS.join(", ")}. Nombre, Categoría y Precio son obligatorias.
        Si el nombre ya existe, se actualizan su precio, stock y costo; si no, se crea el producto.
      </p>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <label className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 cursor-pointer">
          Elegir archivo .xlsx
          <input type="file" accept=".xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void leer(f); e.target.value = ""; }} />
        </label>
        <button onClick={plantilla} className="text-sm font-semibold px-4 py-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50">Descargar plantilla (.csv)</button>
        {archivo ? <span className="text-sm text-zinc-500">{leyendo ? "Leyendo…" : archivo}</span> : null}
      </div>
      <p className="text-xs text-zinc-400 mt-2">La plantilla se abre en Excel; guárdala como .xlsx antes de subirla.</p>

      {error ? <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p> : null}
      {hecho !== null ? <p className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">Listo: {hecho} productos importados. <Link href="/admin/catalogo" className="underline">Ver catálogo</Link></p> : null}

      {filas.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm text-zinc-700">{validas.length} listos para importar{conError ? ` · ${conError} con error (se omiten)` : ""}</p>
            <button onClick={() => void importar()} disabled={guardando || validas.length === 0}
              className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 disabled:bg-zinc-200 disabled:text-zinc-400">
              {guardando ? "Importando…" : `Importar ${validas.length}`}
            </button>
          </div>
          <div className="overflow-x-auto border border-zinc-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs text-zinc-500">
                <tr><th className="px-3 py-2">Fila</th><th className="px-3 py-2">Nombre</th><th className="px-3 py-2">Categoría</th><th className="px-3 py-2 text-right">Precio</th><th className="px-3 py-2 text-right">Stock</th><th className="px-3 py-2">Estado</th></tr>
              </thead>
              <tbody>
                {filas.slice(0, 200).map((f) => (
                  <tr key={f.linea} className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-zinc-400">{f.linea}</td>
                    <td className="px-3 py-2">{f.fila?.nombre ?? "—"}</td>
                    <td className="px-3 py-2">{f.fila?.categoria ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{f.fila?.precio ?? "—"}</td>
                    <td className="px-3 py-2 text-right">{f.fila?.stock ?? "—"}</td>
                    <td className={`px-3 py-2 ${f.error ? "text-red-600" : "text-green-700"}`}>{f.error ?? "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filas.length > 200 ? <p className="text-xs text-zinc-400 mt-2">Se muestran las primeras 200 filas; se importan todas las válidas.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
