"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { avisar, confirmar, mostrarCredenciales } from "@/lib/alerts";

interface Solicitud {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  estado: string;
  nota: string | null;
  created_at: string;
  resuelta_at: string | null;
  clienta_id: string | null;
  clienta_nombre: string | null;
  clienta_telefono: string | null;
  clienta_email: string | null;
  clienta_tiene_cuenta: boolean | null;
  clienta_visitas: number | null;
  clienta_ultima_visita: string | null;
  coincide_por: string | null;
}

interface Candidata {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
}

const fechaCorta = (iso: string) => new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" });

function hace(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.floor(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

export default function SolicitudesCuentaPage() {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<"pendiente" | "resueltas">("pendiente");
  const [lista, setLista] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  // búsqueda manual de la clienta (cuando no hubo coincidencia)
  const [buscandoId, setBuscandoId] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [candidatas, setCandidatas] = useState<Candidata[]>([]);

  const cargar = useCallback(async () => {
    const { data } = await supabase.rpc("listar_solicitudes_cuenta", { p_estado: "todas" });
    setLista((data ?? []) as Solicitud[]);
    setCargando(false);
  }, [supabase]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    const q = busqueda.trim();
    if (!buscandoId || q.length < 2) return setCandidatas([]);
    const t = setTimeout(async () => {
      const { data } = await supabase.from("clientas").select("id, nombre, telefono, email").or(`nombre.ilike.%${q.replace(/[,%]/g, " ")}%,telefono.ilike.%${q.replace(/[,%]/g, " ")}%`).order("nombre").limit(6);
      setCandidatas(data ?? []);
    }, 250);
    return () => clearTimeout(t);
  }, [supabase, buscandoId, busqueda]);

  const pendientes = lista.filter((s) => s.estado === "pendiente");
  const resueltas = lista.filter((s) => s.estado !== "pendiente");
  const visibles = tab === "pendiente" ? pendientes : resueltas;

  async function activar(s: Solicitud) {
    if (!s.clienta_id) return;
    setTrabajando(s.id);
    try {
      // el correo de la solicitud es el de la cuenta: si la ficha tiene otro, se confirma el cambio
      if ((s.clienta_email ?? "").toLowerCase() !== s.email.toLowerCase()) {
        const usar = await confirmar({
          titulo: "El correo es distinto al de su ficha",
          texto: s.clienta_email
            ? `En la ficha de ${s.clienta_nombre} está ${s.clienta_email}, pero pidió la cuenta con ${s.email}. ¿Usar ${s.email}?`
            : `${s.clienta_nombre} no tiene correo en su ficha. ¿Guardar ${s.email} y crear la cuenta con él?`,
          confirmarTexto: "Usar este correo",
        });
        if (!usar) return;
        const { error } = await supabase.from("clientas").update({ email: s.email }).eq("id", s.clienta_id);
        if (error) return avisar("No se pudo guardar el correo", error.message);
      }

      const { data, error: fnError } = await supabase.functions.invoke("gestionar-cuenta-clienta", {
        body: { clienta_id: s.clienta_id, accion: "crear" },
      });
      if (fnError) {
        let mensaje = fnError.message;
        if (fnError instanceof FunctionsHttpError) {
          const body = await fnError.context.json().catch(() => null);
          if (body?.error) {
            mensaje = /already been registered|already exists/i.test(body.error)
              ? "Ese correo ya tiene una cuenta (de otra clienta o del personal)."
              : body.error;
          }
        }
        return avisar("No se pudo activar la cuenta", mensaje);
      }

      await supabase.rpc("resolver_solicitud_cuenta", { p_id: s.id, p_estado: "aprobada" });
      await cargar();
      await mostrarCredenciales({
        titulo: "Cuenta activada",
        nombre: (s.clienta_nombre ?? s.nombre).split(" ")[0],
        telefono: s.telefono,
        email: data.email,
        password: data.password,
        para: "la clienta",
      });
    } finally {
      setTrabajando(null);
    }
  }

  async function rechazar(s: Solicitud) {
    const ok = await confirmar({
      titulo: `¿Rechazar la solicitud de ${s.nombre}?`,
      texto: "No se crea ninguna cuenta. La persona no recibe aviso.",
      confirmarTexto: "Rechazar",
      peligroso: true,
    });
    if (!ok) return;
    setTrabajando(s.id);
    const { error } = await supabase.rpc("resolver_solicitud_cuenta", { p_id: s.id, p_estado: "rechazada" });
    setTrabajando(null);
    if (error) return avisar("No se pudo rechazar", error.message);
    cargar();
  }

  async function marcarResuelta(s: Solicitud) {
    setTrabajando(s.id);
    const { error } = await supabase.rpc("resolver_solicitud_cuenta", { p_id: s.id, p_estado: "aprobada", p_nota: "Ya tenía cuenta" });
    setTrabajando(null);
    if (error) return avisar("No se pudo cerrar", error.message);
    cargar();
  }

  async function vincular(s: Solicitud, c: Candidata) {
    setTrabajando(s.id);
    const { error } = await supabase.from("solicitudes_cuenta").update({ clienta_id: c.id }).eq("id", s.id);
    setTrabajando(null);
    if (error) return avisar("No se pudo vincular", error.message);
    setBuscandoId(null);
    setBusqueda("");
    cargar();
  }

  return (
    <div className="min-h-full bg-zinc-50 p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
          <Link href="/admin/clientas" className="hover:text-zinc-700">Clientas</Link>
          <span>/</span>
          <span className="text-zinc-600">Solicitudes de cuenta</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Solicitudes de cuenta</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Personas que pidieron su cuenta desde la app. Verifica que sean clientas y activa su acceso: se les crea el usuario y les envías los datos por WhatsApp.
        </p>
      </div>

      <div className="flex items-center gap-6 border-b border-zinc-200 mb-5">
        {([["pendiente", `Pendientes (${pendientes.length})`], ["resueltas", `Resueltas (${resueltas.length})`]] as const).map(([t, texto]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${tab === t ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-400 hover:text-zinc-600"}`}
          >
            {texto}
          </button>
        ))}
      </div>

      {cargando && <p className="text-sm text-zinc-400">Cargando…</p>}
      {!cargando && visibles.length === 0 && (
        <p className="text-sm text-zinc-400 py-10 text-center">{tab === "pendiente" ? "No hay solicitudes pendientes." : "Todavía no hay solicitudes resueltas."}</p>
      )}

      <div className="space-y-3 max-w-3xl">
        {visibles.map((s) => {
          const esClienta = !!s.clienta_id;
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-zinc-200 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-zinc-900">{s.nombre}</p>
                  <p className="text-sm text-zinc-500">{s.telefono} · {s.email}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Solicitó {hace(s.created_at)} · {fechaCorta(s.created_at)}</p>
                </div>
                {s.estado === "pendiente" ? (
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${esClienta ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"}`}>
                    {esClienta ? "Es clienta" : "No aparece como clienta"}
                  </span>
                ) : (
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${s.estado === "aprobada" ? "bg-teal-50 text-teal-700" : "bg-zinc-100 text-zinc-500"}`}>
                    {s.estado === "aprobada" ? "Aprobada" : "Rechazada"}
                    {s.resuelta_at ? ` · ${fechaCorta(s.resuelta_at)}` : ""}
                  </span>
                )}
              </div>

              {esClienta && (
                <div className="mt-3 bg-zinc-50 rounded-xl px-4 py-3 text-sm">
                  <p className="text-zinc-800">
                    <span className="font-semibold">{s.clienta_nombre}</span>
                    <span className="text-zinc-400"> · coincide por {s.coincide_por}</span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {s.clienta_visitas ?? 0} {s.clienta_visitas === 1 ? "visita" : "visitas"}
                    {s.clienta_ultima_visita ? ` · última ${fechaCorta(s.clienta_ultima_visita)}` : ""}
                    {s.clienta_tiene_cuenta ? " · ya tiene cuenta en la app" : ""}
                  </p>
                  {s.clienta_id && (
                    <Link href={`/admin/clientas/${s.clienta_id}`} className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 mt-1 inline-block">
                      Ver ficha
                    </Link>
                  )}
                </div>
              )}

              {s.estado === "pendiente" && (
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  {esClienta && !s.clienta_tiene_cuenta && (
                    <button
                      onClick={() => activar(s)}
                      disabled={trabajando === s.id}
                      className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 disabled:opacity-50"
                    >
                      {trabajando === s.id ? "Activando…" : "Activar cuenta"}
                    </button>
                  )}
                  {esClienta && s.clienta_tiene_cuenta && (
                    <button onClick={() => marcarResuelta(s)} disabled={trabajando === s.id} className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 disabled:opacity-50">
                      Ya tiene cuenta · cerrar
                    </button>
                  )}
                  {!esClienta && (
                    <button
                      onClick={() => {
                        setBuscandoId(buscandoId === s.id ? null : s.id);
                        setBusqueda("");
                      }}
                      className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50"
                    >
                      Buscar clienta
                    </button>
                  )}
                  <button onClick={() => rechazar(s)} disabled={trabajando === s.id} className="text-sm font-semibold text-zinc-500 hover:text-red-600 px-3 py-2">
                    {esClienta ? "No es ella · rechazar" : "Rechazar"}
                  </button>
                </div>
              )}

              {buscandoId === s.id && (
                <div className="mt-3 border border-zinc-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs text-zinc-400">Si ya es clienta pero dejó otro teléfono o correo, búscala por nombre o teléfono y vincúlala.</p>
                  <input
                    autoFocus
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Nombre o teléfono de la clienta"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400"
                  />
                  {candidatas.map((c) => (
                    <button key={c.id} onClick={() => vincular(s, c)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-50 border border-zinc-100">
                      <p className="text-sm font-medium text-zinc-900">{c.nombre}</p>
                      <p className="text-xs text-zinc-400">{c.telefono}{c.email ? ` · ${c.email}` : ""}</p>
                    </button>
                  ))}
                  {busqueda.trim().length >= 2 && candidatas.length === 0 && <p className="text-xs text-zinc-400">Sin resultados.</p>}
                </div>
              )}

              {s.nota && s.estado !== "pendiente" && <p className="text-xs text-zinc-400 mt-3">{s.nota}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
