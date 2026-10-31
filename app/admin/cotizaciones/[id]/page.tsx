"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { enlaceWhatsApp, avisar } from "@/lib/alerts";
import { descargarCotizacionPdf, generarCotizacionPdf, numeroCotizacion } from "@/lib/cotizacion-pdf";

type Cot = {
  id: string; numero: number; nombre_cliente: string; telefono: string | null; estado: "borrador" | "enviada" | "aceptada" | "rechazada";
  vigencia: string | null; deposito_monto: number; descuento: number; subtotal: number; total: number; notas: string | null; created_at: string;
  cotizacion_lineas: { descripcion: string; cantidad: number; precio_unitario: number; orden: number }[];
};
type Negocio = { nombre: string; direccion: string | null; telefono: string | null; instagram: string | null };

const rd = (n: number) => `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const TEXTO = { borrador: "Borrador", enviada: "Enviada", aceptada: "Aceptada", rechazada: "Rechazada" } as const;

export default function CotizacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const supabase = useMemo(() => createClient(), []);
  const [c, setC] = useState<Cot | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [puedeEditar, setPuedeEditar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [cot, neg, permiso] = await Promise.all([
        supabase.from("cotizaciones" as never).select("*, cotizacion_lineas ( descripcion, cantidad, precio_unitario, orden )").eq("id", id).maybeSingle(),
        supabase.from("negocio_config").select("nombre_comercial, direccion, telefono, instagram").eq("id", true).maybeSingle(),
        supabase.rpc("tiene_permiso", { p_clave: "cotizaciones.editar" }),
      ]);
      if (cot.error) setError(cot.error.message);
      setC((cot.data ?? null) as unknown as Cot | null);
      if (neg.data) setNegocio({ nombre: neg.data.nombre_comercial, direccion: neg.data.direccion, telefono: neg.data.telefono, instagram: neg.data.instagram });
      setPuedeEditar(!!permiso.data);
    })();
  }, [supabase, id]);

  function pdf() {
    if (!c) return null;
    return generarCotizacionPdf({
      numero: c.numero, creadaAt: c.created_at, vigencia: c.vigencia, nombreCliente: c.nombre_cliente, telefono: c.telefono,
      lineas: [...c.cotizacion_lineas].sort((a, b) => a.orden - b.orden).map((l) => ({ descripcion: l.descripcion, cantidad: Number(l.cantidad), precioUnitario: Number(l.precio_unitario) })),
      subtotal: Number(c.subtotal), descuento: Number(c.descuento), total: Number(c.total), depositoMonto: Number(c.deposito_monto), notas: c.notas,
      negocio: negocio ?? { nombre: "Melena", direccion: null, telefono: null, instagram: null },
    });
  }

  async function cambiarEstado(estado: Cot["estado"]) {
    if (!c) return;
    const { error: err } = await supabase.from("cotizaciones" as never).update({ estado, updated_at: new Date().toISOString() } as never).eq("id", c.id);
    if (err) return void avisar("No se pudo actualizar", err.message);
    setC({ ...c, estado });
  }

  async function enviarWhatsApp() {
    if (!c) return;
    const doc = pdf();
    if (doc) descargarCotizacionPdf(doc, c.numero); // WhatsApp Web no deja adjuntar solo: se descarga y se arrastra al chat
    if (c.estado === "borrador" && puedeEditar) await cambiarEstado("enviada");
    const msg = `Hola ${c.nombre_cliente.split(" ")[0]}, te comparto tu cotización ${numeroCotizacion(c.numero)} de ${negocio?.nombre ?? "Melena"}. Te adjunto el PDF.`;
    window.open(enlaceWhatsApp(c.telefono, msg), "_blank");
  }

  if (error) return <div className="p-8 text-sm text-red-600">No se pudo cargar: {error}</div>;
  if (!c) return <div className="p-8 text-sm text-zinc-400">Cargando…</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <Link href="/admin/cotizaciones" className="text-sm text-zinc-500 hover:text-zinc-800">← Cotizaciones</Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{numeroCotizacion(c.numero)} · {c.nombre_cliente}</h1>
          <p className="text-sm text-zinc-500 mt-1">{TEXTO[c.estado]} · {new Date(c.created_at).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })}{c.vigencia ? ` · válida hasta el ${new Date(`${c.vigencia}T12:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "long" })}` : ""}</p>
        </div>
        <div className="flex gap-2">
          {puedeEditar && <Link href={`/admin/cotizaciones/nueva?id=${c.id}`} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Editar</Link>}
          <button onClick={() => { const d = pdf(); if (d) descargarCotizacionPdf(d, c.numero); }} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">Descargar PDF</button>
          <button onClick={() => void enviarWhatsApp()} className="px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700">Enviar por WhatsApp</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 divide-y divide-zinc-100">
        {[...c.cotizacion_lineas].sort((a, b) => a.orden - b.orden).map((l, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div>
              <div className="text-sm font-semibold text-zinc-900">{l.descripcion}</div>
              <div className="text-xs text-zinc-400">{Number(l.cantidad)} × {rd(Number(l.precio_unitario))}</div>
            </div>
            <div className="text-sm font-semibold text-zinc-900">{rd(Number(l.cantidad) * Number(l.precio_unitario))}</div>
          </div>
        ))}
        <div className="px-5 py-4 space-y-1 bg-zinc-50 rounded-b-2xl">
          <div className="flex justify-between text-sm text-zinc-500"><span>Subtotal</span><span>{rd(Number(c.subtotal))}</span></div>
          {Number(c.descuento) > 0 && <div className="flex justify-between text-sm text-zinc-500"><span>Descuento</span><span>− {rd(Number(c.descuento))}</span></div>}
          <div className="flex justify-between text-base font-semibold text-zinc-900 pt-1"><span>Total</span><span>{rd(Number(c.total))}</span></div>
          {Number(c.deposito_monto) > 0 && <div className="text-sm text-zinc-500 pt-1">Depósito para apartar: {rd(Number(c.deposito_monto))}</div>}
        </div>
      </div>
      {c.notas && <p className="mt-4 text-sm text-zinc-600 bg-white border border-zinc-200 rounded-2xl p-4">{c.notas}</p>}

      {puedeEditar && (
        <div className="flex gap-2 mt-5">
          {c.estado !== "aceptada" && <button onClick={() => void cambiarEstado("aceptada")} className="px-4 py-2 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50">Marcar aceptada</button>}
          {c.estado !== "rechazada" && c.estado !== "aceptada" && <button onClick={() => void cambiarEstado("rechazada")} className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:bg-zinc-50">Marcar rechazada</button>}
        </div>
      )}
    </div>
  );
}
