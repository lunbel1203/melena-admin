"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Fila = { id: string; numero: number; nombre_cliente: string; total: number; estado: "borrador" | "enviada" | "aceptada" | "rechazada"; created_at: string };

const ESTADOS = {
  borrador: { texto: "Borrador", clase: "bg-zinc-100 text-zinc-600" },
  enviada: { texto: "Enviada", clase: "bg-orange-50 text-orange-600" },
  aceptada: { texto: "Aceptada", clase: "bg-green-50 text-green-700" },
  rechazada: { texto: "Rechazada", clase: "bg-red-50 text-red-600" },
} as const;

const rd = (n: number) => `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function CotizacionesPage() {
  const supabase = useMemo(() => createClient(), []);
  const [filas, setFilas] = useState<Fila[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [puedeCrear, setPuedeCrear] = useState(false);

  useEffect(() => {
    (async () => {
      const [lista, permiso] = await Promise.all([
        supabase.from("cotizaciones" as never).select("id, numero, nombre_cliente, total, estado, created_at").order("created_at", { ascending: false }).limit(200),
        supabase.rpc("tiene_permiso", { p_clave: "cotizaciones.crear" }),
      ]);
      if (lista.error) setError(lista.error.message);
      setFilas((lista.data ?? []) as unknown as Fila[]);
      setPuedeCrear(!!permiso.data);
    })();
  }, [supabase]);

  const visibles = (filas ?? []).filter((f) => `${f.nombre_cliente} COT-${String(f.numero).padStart(4, "0")}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Cotizaciones</h1>
          <p className="text-sm text-zinc-500 mt-1">Arma una cotización y envíala en PDF por WhatsApp.</p>
        </div>
        {puedeCrear && (
          <Link href="/admin/cotizaciones/nueva" className="px-4 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800">Nueva cotización</Link>
        )}
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por clienta o número" className="w-full sm:w-80 mb-4 px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-zinc-400" />
      {error && <p className="mb-4 text-sm text-red-600">No se pudo cargar: {error}</p>}
      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
        {filas === null ? (
          <p className="p-6 text-sm text-zinc-400">Cargando…</p>
        ) : visibles.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">{q ? "Sin resultados." : "Aún no hay cotizaciones."}</p>
        ) : (
          visibles.map((f) => (
            <Link key={f.id} href={`/admin/cotizaciones/${f.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-zinc-900 truncate">{f.nombre_cliente}</div>
                <div className="text-xs text-zinc-400 mt-0.5">COT-{String(f.numero).padStart(4, "0")} · {new Date(f.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
              <div className="text-sm font-semibold text-zinc-900">{rd(Number(f.total))}</div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTADOS[f.estado].clase}`}>{ESTADOS[f.estado].texto}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
