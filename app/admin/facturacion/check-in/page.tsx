"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { avisar } from "@/lib/alerts";
import { toISODate } from "@/lib/dates";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="6" cy="6" r="5" />
      <path d="M10.5 10.5L14 14" />
    </svg>
  );
}

type Client = { id: string; initial: string; name: string; phone: string };
type Cita = {
  id: string;
  clienta_id: string;
  servicio_id: string;
  empleado_id: string | null;
  hora_inicio: string;
  deposito: number;
};
type Service = { id: string; name: string; duration: string; price: number; priceLabel: string };
type Stylist = { id: string; initial: string; name: string; status: "disponible" | "ocupada"; detail: string };

const statusBadge: Record<Stylist["status"], string> = {
  disponible: "bg-green-50 text-green-700",
  ocupada:    "bg-zinc-100 text-zinc-500",
};

const statusLabel: Record<Stylist["status"], string> = {
  disponible: "Disponible",
  ocupada:    "Ocupada",
};

const rd = (n: number) => `RD$${Math.round(n).toLocaleString("es-DO")}`;

function duracion(min: number) {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} h`;
}

function CheckInForm() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const visitaParam = useSearchParams().get("visita");

  const [search,          setSearch]          = useState("");
  const [resultados,      setResultados]      = useState<Client[]>([]);
  const [selectedClient,  setSelectedClient]  = useState<Client | null>(null);
  const [services,        setServices]        = useState<Service[]>([]);
  const [stylists,        setStylists]        = useState<Stylist[]>([]);
  const [serviciosPorEmpleado, setServiciosPorEmpleado] = useState<Record<string, Set<string>>>({});
  const [citasHoy,        setCitasHoy]        = useState<Cita[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [nota,            setNota]            = useState("");
  const [guardando,       setGuardando]       = useState(false);
  const [entrada]                             = useState(() => new Date());

  const citaClienta = selectedClient ? citasHoy.find((c) => c.clienta_id === selectedClient.id) ?? null : null;

  // Carga inicial: catálogo, estilistas, citas de hoy y, si viene ?visita=, su clienta
  useEffect(() => {
    (async () => {
      const hoy = toISODate(new Date());
      const [svc, emp, se, citas, ocupadas] = await Promise.all([
        supabase.from("servicios").select("id, nombre, precio, duracion_minutos").eq("activo", true).order("nombre"),
        supabase.from("empleados").select("id, nombre").eq("activo", true).order("nombre"),
        supabase.from("servicios_empleados").select("servicio_id, empleado_id"),
        supabase
          .from("citas")
          .select("id, clienta_id, servicio_id, empleado_id, hora_inicio, depositos ( monto, estado )")
          .eq("fecha", hoy)
          .in("estado", ["pendiente_confirmacion", "confirmada"]),
        supabase.from("visitas").select("estilista_id, clientas ( nombre )").eq("estado", "en_atencion"),
      ]);

      const atendiendo = new Map<string, string>();
      for (const o of (ocupadas.data ?? []) as unknown as { estilista_id: string | null; clientas: { nombre: string } | null }[]) {
        if (o.estilista_id) atendiendo.set(o.estilista_id, o.clientas?.nombre ?? "una clienta");
      }

      setServices(
        (svc.data ?? []).map((s) => ({
          id: s.id,
          name: s.nombre,
          duration: duracion(s.duracion_minutos),
          price: Number(s.precio),
          priceLabel: rd(Number(s.precio)),
        })),
      );
      setStylists(
        (emp.data ?? []).map((e) => ({
          id: e.id,
          initial: e.nombre.charAt(0).toUpperCase(),
          name: e.nombre,
          status: atendiendo.has(e.id) ? "ocupada" : "disponible",
          detail: atendiendo.has(e.id) ? `Atendiendo a ${atendiendo.get(e.id)} · la clienta quedará en espera` : "Libre ahora",
        })),
      );
      const mapa: Record<string, Set<string>> = {};
      for (const r of se.data ?? []) (mapa[r.servicio_id] ??= new Set()).add(r.empleado_id);
      setServiciosPorEmpleado(mapa);
      setCitasHoy(
        ((citas.data ?? []) as unknown as (Omit<Cita, "deposito"> & { depositos: { monto: number; estado: string }[] | null })[]).map((c) => ({
          id: c.id,
          clienta_id: c.clienta_id,
          servicio_id: c.servicio_id,
          empleado_id: c.empleado_id,
          hora_inicio: c.hora_inicio,
          deposito: (c.depositos ?? []).filter((d) => d.estado === "verificado").reduce((s, d) => s + Number(d.monto), 0),
        })),
      );

      if (visitaParam) {
        const { data } = await supabase
          .from("visitas")
          .select("clienta_id, clientas ( id, nombre, telefono )")
          .eq("id", visitaParam)
          .maybeSingle();
        const cl = (data as unknown as { clientas: { id: string; nombre: string; telefono: string } | null } | null)?.clientas;
        if (cl) setSelectedClient({ id: cl.id, initial: cl.nombre.charAt(0).toUpperCase(), name: cl.nombre, phone: cl.telefono });
      }
    })();
  }, [supabase, visitaParam]);

  // Búsqueda de clientas por nombre o teléfono
  useEffect(() => {
    const q = search.trim();
    if (!q) return;
    const t = setTimeout(async () => {
      const limpio = q.replace(/[%,()]/g, "");
      const { data } = await supabase
        .from("clientas")
        .select("id, nombre, telefono")
        .or(`nombre.ilike.%${limpio}%,telefono.ilike.%${limpio}%`)
        .order("nombre")
        .limit(8);
      setResultados((data ?? []).map((c) => ({ id: c.id, initial: c.nombre.charAt(0).toUpperCase(), name: c.nombre, phone: c.telefono })));
    }, 250);
    return () => clearTimeout(t);
  }, [search, supabase]);

  // Al elegir clienta con cita hoy: precargar servicio y estilista de la cita
  useEffect(() => {
    if (!citaClienta) return;
    setSelectedService((prev) => prev ?? services.find((s) => s.id === citaClienta.servicio_id) ?? null);
    setSelectedStylist((prev) => prev ?? stylists.find((s) => s.id === citaClienta.empleado_id) ?? null);
  }, [citaClienta, services, stylists]);

  // Las ocupadas también se pueden elegir: la clienta queda en espera hasta que termine
  const estilistasVisibles = useMemo(() => {
    const permitidas = selectedService ? serviciosPorEmpleado[selectedService.id] : undefined;
    const lista = permitidas && permitidas.size > 0 ? stylists.filter((s) => permitidas.has(s.id)) : stylists;
    return [...lista].sort((a, b) => Number(a.status === "ocupada") - Number(b.status === "ocupada"));
  }, [stylists, serviciosPorEmpleado, selectedService]);

  const showList = search.trim().length > 0 || !selectedClient;
  const filtered = search.trim() ? resultados : [];
  const deposito = citaClienta?.deposito ?? 0;
  const puedeConfirmar = !!selectedClient && !!selectedService && !!selectedStylist && !guardando;

  async function darEntrada() {
    if (!selectedClient || !selectedService || !selectedStylist) return;
    setGuardando(true);
    const { error } = await supabase.rpc("dar_entrada_clienta", {
      p_clienta_id: selectedClient.id,
      p_servicio_id: selectedService.id,
      p_estilista_id: selectedStylist.id,
      p_cita_id: citaClienta?.id,
      p_notas: nota.trim() || undefined,
      p_visita_id: visitaParam ?? undefined,
    });
    if (error) {
      await avisar("No se pudo dar entrada", error.message);
      setGuardando(false);
      return;
    }
    router.push("/admin/facturacion");
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link href="/admin/facturacion" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3">
          <ChevronLeft />
          Facturación
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Check-in de clienta</h1>
        <p className="text-sm text-zinc-400 mt-1">Al confirmar se abre su factura y la estilista la ve en su app.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Step 1 — Clienta */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              1 · Clienta
            </p>

            {/* Search */}
            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {}}
                placeholder="Buscar por nombre o teléfono..."
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
              />
            </div>

            {/* Client list when searching */}
            {showList && (
              <div className="border border-zinc-200 rounded-xl overflow-hidden mb-3">
                {filtered.length === 0 && (
                  <p className="px-4 py-3 text-sm text-zinc-400">Sin resultados.</p>
                )}
                {filtered.map((c) => {
                  const isSelected = selectedClient?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedClient(c); setSearch(""); setSelectedService(null); setSelectedStylist(null); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-100 last:border-0 transition-colors ${
                        isSelected ? "bg-zinc-50" : "hover:bg-zinc-50"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                        {c.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-zinc-900">{c.name}</p>
                        <p className="text-xs text-zinc-400">
                          {c.phone} · {citasHoy.some((x) => x.clienta_id === c.id) ? "cita hoy" : "sin cita para hoy"}
                        </p>
                      </div>
                      {isSelected && (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 text-white shrink-0">
                          Seleccionada
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected client (compact, when not searching) */}
            {selectedClient && !showList && (
              <div className="flex items-center gap-3 px-4 py-3 border border-zinc-200 rounded-xl mb-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                  {selectedClient.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">{selectedClient.name}</p>
                  <p className="text-xs text-zinc-400">
                    {selectedClient.phone} · {citaClienta ? "cita hoy" : "sin cita para hoy"}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-900 text-white shrink-0">
                  Seleccionada
                </span>
              </div>
            )}

            <p className="text-xs text-zinc-400">¿Primera vez? <Link href="/admin/clientas/nueva" className="underline hover:text-zinc-600">Crea su perfil primero</Link>.</p>
          </div>

          {/* Step 2 — Servicio */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              2 · Servicio
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`text-left px-4 py-3.5 rounded-xl border-2 transition-colors ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-zinc-900">{svc.name}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{svc.duration} · {svc.priceLabel}</p>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Step 3 — Estilista */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              3 · Estilista
            </p>

            <div className="flex flex-col gap-2">
              {estilistasVisibles.length === 0 && (
                <p className="text-sm text-zinc-400">No hay estilistas para este servicio.</p>
              )}
              {estilistasVisibles.map((st) => {
                const isSelected = selectedStylist?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStylist(st)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                      isSelected
                        ? "border-zinc-900 bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                      {st.initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900">{st.name}</p>
                      <p className="text-xs text-zinc-400">{st.detail}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusBadge[st.status]}`}>
                      {statusLabel[st.status]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:w-72 flex flex-col gap-4">

          {/* Resumen */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Resumen del check-in
            </p>
            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Clienta</span>
                <span className="text-zinc-900 font-medium text-right">{selectedClient?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Servicio</span>
                <span className="text-zinc-900 font-medium">{selectedService?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estilista</span>
                <span className="text-zinc-900 font-medium">{selectedStylist?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Entrada</span>
                <span className="text-zinc-900 font-medium">{entrada.toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Duración estimada</span>
                <span className="text-zinc-900 font-medium">{selectedService?.duration ?? "—"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3">
              <span className="text-xs font-semibold text-zinc-400">Total estimado</span>
              <span className="text-base font-bold">
                {selectedService ? rd(selectedService.price) : "—"}
              </span>
            </div>
          </div>

          {/* Depósito */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Depósito
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-500">
                {deposito > 0 ? "Depósito previo" : "Sin depósito previo"}
              </span>
              <span className="text-sm font-semibold text-zinc-900">
                {rd(deposito)}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {deposito > 0
                ? "Depósito verificado al reservar la cita; se descuenta de la factura."
                : citaClienta
                ? "La cita no tiene depósito verificado."
                : "Llegó sin reservar, se cobra el total al cerrar la factura."}
            </p>
          </div>

          {/* Nota para la estilista */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Nota para la estilista
            </p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej. cuero sensible, prefiere raya al lado..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/facturacion"
              className="py-2.5 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              onClick={darEntrada}
              disabled={!puedeConfirmar}
              className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {guardando ? "Guardando…" : "Dar entrada"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense fallback={null}>
      <CheckInForm />
    </Suspense>
  );
}
