"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avisar } from "@/lib/alerts";

type Status = "en-atencion" | "por-cobrar" | "sin-asignar" | "en-espera";
type Tab = "salon" | "cerradas";

type ClientCard = {
  id: string; // visita_id
  facturaId?: string;
  initial: string;
  name: string;
  status: Status;
  timeLabel: string;
  time: string;
  visits: string;
  servicio?: string;
  extra?: string;
  estilista?: string;
  deposito?: string;
  resta?: string;
  total?: string;
  estimado?: string;
};

type Cerrada = { id: string; initial: string; name: string; servicio: string; estilista: string; total: string; hora: string };

type VisitaRow = {
  id: string;
  estado: "en_espera" | "en_atencion" | "por_cobrar" | "cerrada";
  created_at: string;
  atencion_inicio_at: string | null;
  servicio_fin_at: string | null;
  clienta_id: string;
  clientas: { nombre: string } | null;
  estilista: { nombre: string } | null;
  citas: { hora_inicio: string } | null;
  facturas: {
    id: string;
    estado: string;
    subtotal: number;
    itbis: number;
    total: number;
    deposito_aplicado: number;
    cobrada_at: string | null;
    lineas_factura: { descripcion: string; tipo: "servicio" | "producto"; cantidad: number; precio_unitario: number }[];
  }[] | null;
};

const VISITA_SELECT = `
  id, estado, created_at, atencion_inicio_at, servicio_fin_at, clienta_id,
  clientas ( nombre ),
  estilista:empleados!visitas_estilista_id_fkey ( nombre ),
  citas ( hora_inicio ),
  facturas ( id, estado, subtotal, itbis, total, deposito_aplicado, cobrada_at,
    lineas_factura ( descripcion, tipo, cantidad, precio_unitario ) )
`;

const statusLabel: Record<Status, string> = {
  "en-atencion":  "En atención",
  "por-cobrar":   "Por cobrar",
  "sin-asignar":  "Sin asignar",
  "en-espera":    "En espera",
};

const statusClass: Record<Status, string> = {
  "en-atencion": "bg-green-50 text-green-700",
  "por-cobrar":  "bg-orange-50 text-orange-600",
  "sin-asignar": "bg-amber-50 text-amber-600",
  "en-espera":   "bg-blue-50 text-blue-600",
};

const rd = (n: number) => `RD$${Math.round(n).toLocaleString("es-DO")}`;

function horaCorta(iso: string) {
  return new Date(iso)
    .toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true })
    .replace(/\s/g, " ")
    .toLowerCase();
}

function horaDeCita(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return horaCorta(d.toISOString());
}

function aTarjeta(v: VisitaRow, visitasPrevias: number): ClientCard {
  const nombre = v.clientas?.nombre ?? "Clienta";
  const factura = v.facturas?.[0];
  const servicios = factura?.lineas_factura.filter((l) => l.tipo === "servicio") ?? [];
  const productos = factura?.lineas_factura.filter((l) => l.tipo === "producto") ?? [];
  const status: Status =
    !v.estilista ? "sin-asignar"
    : v.estado === "por_cobrar" ? "por-cobrar"
    : v.estado === "en_atencion" ? "en-atencion"
    : "en-espera";

  const visitas = `${visitasPrevias} ${visitasPrevias === 1 ? "visita" : "visitas"}`;
  const visits = v.citas
    ? `${visitas} · cita ${horaDeCita(v.citas.hora_inicio)}`
    : `${visitas} · sin cita`;

  const [timeLabel, time] =
    status === "por-cobrar" && v.servicio_fin_at ? ["Terminó", horaCorta(v.servicio_fin_at)]
    : status === "en-atencion" && v.atencion_inicio_at ? ["Desde", horaCorta(v.atencion_inicio_at)]
    : ["Llegó", horaCorta(v.created_at)];

  const deposito = factura ? Number(factura.deposito_aplicado) : 0;
  const bruto = factura ? Number(factura.subtotal) + Number(factura.itbis) : 0;

  return {
    id: v.id,
    facturaId: factura?.id,
    initial: nombre.charAt(0).toUpperCase(),
    name: nombre,
    status,
    timeLabel,
    time,
    visits,
    servicio: servicios[0]?.descripcion,
    extra: productos.length
      ? `${productos[0].descripcion} · ${rd(Number(productos[0].precio_unitario) * productos[0].cantidad)}${productos.length > 1 ? ` +${productos.length - 1}` : ""}`
      : undefined,
    estilista: v.estilista?.nombre,
    deposito: factura ? (deposito > 0 ? `${rd(deposito)} pagado` : "Sin depósito") : undefined,
    resta: factura && status !== "por-cobrar" && status !== "en-espera" ? rd(Number(factura.total)) : undefined,
    total: factura ? rd(Number(factura.total)) : undefined,
    estimado: status === "en-espera" && factura ? rd(bruto) : undefined,
  };
}

function Avatar({ c }: { c: ClientCard }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
        {c.initial}
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
        <p className="text-xs text-zinc-400">{c.visits}</p>
      </div>
    </div>
  );
}

function CardHeader({ c }: { c: ClientCard }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusClass[c.status]}`}>
        {statusLabel[c.status]}
      </span>
      <span className="text-xs text-zinc-400">{c.timeLabel} {c.time}</span>
    </div>
  );
}

function ClientCardView({ c, onAvanzar, ocupado }: { c: ClientCard; onAvanzar: (c: ClientCard) => void; ocupado: boolean }) {
  const detalleHref = c.facturaId ? `/admin/facturacion/${c.facturaId}` : undefined;

  if (c.status === "sin-asignar") {
    return (
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
        <CardHeader c={c} />
        <Avatar c={c} />
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-zinc-500">Falta asignar estilista y servicio para abrir su factura.</p>
        </div>
        <Link
          href={`/admin/facturacion/check-in?visita=${c.id}`}
          className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors text-center"
        >
          Asignar y abrir factura
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
      <CardHeader c={c} />
      <Avatar c={c} />

      <div className="space-y-2 text-sm">
        {c.servicio && (
          <div className="flex justify-between gap-3">
            <span className="text-zinc-400">Servicio</span>
            <span className="text-zinc-800 font-medium text-right">{c.servicio}</span>
          </div>
        )}
        {c.status === "por-cobrar" && c.extra && (
          <div className="flex justify-between gap-3">
            <span className="text-zinc-400">Extra</span>
            <span className="text-zinc-800 font-medium text-right">{c.extra}</span>
          </div>
        )}
        {c.estilista && (
          <div className="flex justify-between gap-3">
            <span className="text-zinc-400">Estilista</span>
            <span className="text-zinc-800 font-medium">{c.estilista}</span>
          </div>
        )}
        {c.status !== "por-cobrar" && c.deposito && (
          <div className="flex justify-between gap-3">
            <span className="text-zinc-400">Depósito</span>
            <span className="text-zinc-800 font-medium">{c.deposito}</span>
          </div>
        )}
      </div>

      {c.status === "por-cobrar" && c.total && (
        <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3">
          <span className="text-xs font-semibold text-zinc-400">Total a cobrar</span>
          <span className="text-base font-bold">{c.total}</span>
        </div>
      )}
      {c.status === "en-atencion" && c.resta && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-xs text-zinc-400">Resta por cobrar</span>
          <span className="text-base font-bold text-zinc-900">{c.resta}</span>
        </div>
      )}
      {c.status === "en-espera" && c.estimado && (
        <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
          <span className="text-xs text-zinc-400">Estimado</span>
          <span className="text-base font-bold text-zinc-900">{c.estimado}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {detalleHref ? (
          <Link
            href={detalleHref}
            className="py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-center"
          >
            Ver detalle
          </Link>
        ) : <span />}
        {c.status === "por-cobrar" && detalleHref ? (
          <Link
            href={detalleHref}
            className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors text-center"
          >
            Cobrar
          </Link>
        ) : (
          <button
            onClick={() => onAvanzar(c)}
            disabled={ocupado}
            className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {c.status === "en-espera" ? "Iniciar atención" : "Terminar servicio"}
          </button>
        )}
      </div>
    </div>
  );
}

function AddCard() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[220px] text-center">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-xl font-light">
        +
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-700">Dar entrada a una clienta</p>
        <p className="text-xs text-zinc-400 mt-1 max-w-[160px]">
          Registra el check-in, asigna la estilista y el servicio para abrir su factura.
        </p>
      </div>
      <Link href="/admin/facturacion/check-in" className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
        + Check-in
      </Link>
    </div>
  );
}

export default function FacturacionPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("salon");
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [closed, setClosed] = useState<Cerrada[]>([]);
  const [facturadoHoy, setFacturadoHoy] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const [abiertas, cerradasHoy] = await Promise.all([
      supabase.from("visitas").select(VISITA_SELECT).neq("estado", "cerrada").order("created_at"),
      supabase
        .from("visitas")
        .select(VISITA_SELECT)
        .eq("estado", "cerrada")
        .gte("created_at", inicioHoy.toISOString())
        .order("created_at", { ascending: false }),
    ]);

    if (abiertas.error || cerradasHoy.error) {
      setError((abiertas.error ?? cerradasHoy.error)!.message);
      setCargando(false);
      return;
    }

    // facturas.visita_id es único: PostgREST devuelve un objeto, no un arreglo
    const normalizar = (rows: unknown[]) =>
      (rows as (Omit<VisitaRow, "facturas"> & { facturas: VisitaRow["facturas"] | NonNullable<VisitaRow["facturas"]>[number] })[]).map((r) => ({
        ...r,
        facturas: Array.isArray(r.facturas) ? r.facturas : r.facturas ? [r.facturas] : [],
      })) as VisitaRow[];
    const abiertasRows = normalizar(abiertas.data ?? []);
    const cerradasRows = normalizar(cerradasHoy.data ?? []);

    // Visitas anteriores (cerradas) de cada clienta presente, para "N visitas"
    const clientaIds = [...new Set(abiertasRows.map((v) => v.clienta_id))];
    const conteo = new Map<string, number>();
    if (clientaIds.length) {
      const { data } = await supabase
        .from("visitas")
        .select("clienta_id")
        .eq("estado", "cerrada")
        .in("clienta_id", clientaIds);
      for (const r of data ?? []) conteo.set(r.clienta_id, (conteo.get(r.clienta_id) ?? 0) + 1);
    }

    setClients(abiertasRows.map((v) => aTarjeta(v, conteo.get(v.clienta_id) ?? 0)));

    const cobradas = cerradasRows.filter((v) => v.facturas?.[0]?.estado === "cobrada");
    setClosed(
      cobradas.map((v) => {
        const f = v.facturas![0];
        const nombre = v.clientas?.nombre ?? "Clienta";
        return {
          id: f.id,
          initial: nombre.charAt(0).toUpperCase(),
          name: nombre,
          servicio: f.lineas_factura.find((l) => l.tipo === "servicio")?.descripcion ?? "—",
          estilista: v.estilista?.nombre ?? "—",
          total: rd(Number(f.subtotal) + Number(f.itbis)),
          hora: f.cobrada_at ? horaCorta(f.cobrada_at) : "—",
        };
      }),
    );
    setFacturadoHoy(cobradas.reduce((s, v) => s + Number(v.facturas![0].subtotal) + Number(v.facturas![0].itbis), 0));
    setError(null);
    setCargando(false);
  }, [supabase]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function avanzar(c: ClientCard) {
    setOcupado(true);
    const ahora = new Date().toISOString();
    const cambios =
      c.status === "en-espera"
        ? { estado: "en_atencion" as const, atencion_inicio_at: ahora }
        : { estado: "por_cobrar" as const, servicio_fin_at: ahora };
    const { error } = await supabase.from("visitas").update(cambios).eq("id", c.id);
    if (error) await avisar("No se pudo actualizar la visita", error.message);
    await cargar();
    setOcupado(false);
  }

  const enEspera   = clients.filter((c) => c.status === "en-espera").length;
  const enAtencion = clients.filter((c) => c.status === "en-atencion").length;
  const porCobrar  = clients.filter((c) => c.status === "por-cobrar").length;

  const fechaHoy = new Date().toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "short" });

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Facturación</h1>
          <p className="text-sm text-zinc-400 mt-1">Clientas en el establecimiento · {fechaHoy}</p>
        </div>
        <Link href="/admin/facturacion/check-in" className="bg-zinc-900 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap self-start">
          + Check-in de clienta
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudo cargar la facturación: {error}
        </div>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">En espera</p>
          <p className="text-3xl font-bold text-zinc-900">{enEspera}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">En atención</p>
          <p className="text-3xl font-bold text-zinc-900">{enAtencion}</p>
        </div>
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">Por cobrar</p>
          <p className="text-3xl font-bold text-zinc-900">{porCobrar}</p>
        </div>
        <div className="bg-zinc-900 rounded-2xl p-4 sm:p-5">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Facturado hoy</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">{rd(facturadoHoy)}</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-6 border-b border-zinc-200 mb-5">
        {(["salon", "cerradas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            {t === "salon" ? "En el salón" : "Cerradas hoy"}
          </button>
        ))}
      </div>

      {cargando && <p className="text-sm text-zinc-400">Cargando…</p>}

      {/* ── En el salón ── */}
      {!cargando && tab === "salon" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((c) => (
            <ClientCardView key={c.id} c={c} onAvanzar={avanzar} ocupado={ocupado} />
          ))}
          <AddCard />
        </div>
      )}

      {/* ── Cerradas hoy ── */}
      {!cargando && tab === "cerradas" && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="hidden sm:grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100">
            {["Clienta", "Servicio", "Estilista", "Total", "Hora"].map((h) => (
              <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{h}</span>
            ))}
          </div>
          {closed.length === 0 ? (
            <p className="px-6 py-8 text-sm text-zinc-400">No hay facturas cerradas hoy.</p>
          ) : (
            closed.map((r) => (
              <Link
                key={r.id}
                href={`/admin/facturacion/${r.id}`}
                className="grid grid-cols-[2fr_2fr_1.5fr_1fr_1fr] gap-x-4 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {r.initial}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 truncate">{r.name}</span>
                </div>
                <span className="text-sm text-zinc-600">{r.servicio}</span>
                <span className="text-sm text-zinc-600">{r.estilista}</span>
                <span className="text-sm font-semibold text-zinc-900">{r.total}</span>
                <span className="text-sm text-zinc-400">{r.hora}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
