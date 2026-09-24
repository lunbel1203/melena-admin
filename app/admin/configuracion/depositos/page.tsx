"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type RolEmpleado = Database["public"]["Enums"]["rol_empleado"];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

const ROLES: { id: RolEmpleado; label: string }[] = [
  { id: "admin", label: "Admin" },
  { id: "recepcion", label: "Recepción" },
  { id: "caja", label: "Caja" },
  { id: "estilista", label: "Estilista" },
];

interface DepositoConfig {
  monto: number;
  plazo_horas: number;
  accion_si_no_sube_a_tiempo: string;
  reembolsable_hasta_horas: number | null;
  quien_puede_verificar: RolEmpleado[];
}
interface CuentaBancaria {
  id: string;
  banco: string;
  tipo_cuenta: string;
  numero_cuenta: string;
  titular: string;
  activa: boolean;
}

export default function DepositosPagosPage() {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<DepositoConfig | null>(null);
  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [mostrarNuevaCuenta, setMostrarNuevaCuenta] = useState(false);
  const [nuevoBanco, setNuevoBanco] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("");
  const [nuevoNumero, setNuevoNumero] = useState("");
  const [nuevoTitular, setNuevoTitular] = useState("Melena Human Hair SRL");

  async function cargar() {
    setCargando(true);
    const [{ data: dc }, { data: cb }] = await Promise.all([
      supabase.from("deposito_config").select("*").eq("id", true).single(),
      supabase.from("cuentas_bancarias").select("*").order("created_at"),
    ]);
    if (dc) setConfig(dc);
    setCuentas(cb ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleRol(rol: RolEmpleado) {
    if (!config) return;
    const tiene = config.quien_puede_verificar.includes(rol);
    setConfig({
      ...config,
      quien_puede_verificar: tiene
        ? config.quien_puede_verificar.filter((r) => r !== rol)
        : [...config.quien_puede_verificar, rol],
    });
  }

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase.from("deposito_config").update(config).eq("id", true);
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  async function agregarCuenta() {
    if (!nuevoBanco.trim() || !nuevoNumero.trim()) return;
    const { error } = await supabase.from("cuentas_bancarias").insert({
      banco: nuevoBanco.trim(),
      tipo_cuenta: nuevoTipo.trim() || "Corriente",
      numero_cuenta: nuevoNumero.trim(),
      titular: nuevoTitular.trim() || "Melena Human Hair SRL",
    });
    if (error) return setError(error.message);
    setMostrarNuevaCuenta(false);
    setNuevoBanco("");
    setNuevoTipo("");
    setNuevoNumero("");
    cargar();
  }

  async function quitarCuenta(id: string) {
    await supabase.from("cuentas_bancarias").update({ activa: false }).eq("id", id);
    cargar();
  }

  if (cargando || !config) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
        <button
          onClick={guardar}
          disabled={guardando}
          className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {guardando ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>Depósito de reserva</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Requerido para confirmar cualquier cita.</p>

        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1 block">Monto del depósito</label>
            <input type="number" min={0} value={config.monto} onChange={(e) => setConfig({ ...config, monto: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1 block">Plazo para subir comprobante (h)</label>
            <input type="number" min={1} value={config.plazo_horas} onChange={(e) => setConfig({ ...config, plazo_horas: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500 mb-1 block">Si no se sube a tiempo</label>
            <select value={config.accion_si_no_sube_a_tiempo} onChange={(e) => setConfig({ ...config, accion_si_no_sube_a_tiempo: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white">
              <option value="liberar_horario">Liberar el horario</option>
              <option value="mantener">Mantener la cita pendiente</option>
            </select>
          </div>
        </div>

        <label className="text-xs font-semibold text-zinc-500 mb-2 block">Cuentas para transferencia</label>
        <div className="grid sm:grid-cols-2 gap-2.5 mb-3">
          {cuentas.filter((c) => c.activa).map((c) => (
            <div key={c.id} className="border border-zinc-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{c.banco}</p>
                <p className="text-xs text-zinc-400 truncate">{c.tipo_cuenta} · {c.numero_cuenta} · {c.titular}</p>
              </div>
              <button onClick={() => quitarCuenta(c.id)} className="text-xs text-zinc-400 hover:text-red-500 shrink-0">Quitar</button>
            </div>
          ))}
        </div>

        {mostrarNuevaCuenta ? (
          <div className="border border-zinc-200 rounded-xl p-3 space-y-2 mb-3">
            <div className="grid sm:grid-cols-2 gap-2">
              <input value={nuevoBanco} onChange={(e) => setNuevoBanco(e.target.value)} placeholder="Banco"
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400" />
              <input value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} placeholder="Tipo de cuenta (Corriente/Ahorro)"
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400" />
              <input value={nuevoNumero} onChange={(e) => setNuevoNumero(e.target.value)} placeholder="Número de cuenta"
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400" />
              <input value={nuevoTitular} onChange={(e) => setNuevoTitular(e.target.value)} placeholder="Titular"
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm placeholder-zinc-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setMostrarNuevaCuenta(false)} className="flex-1 py-2 rounded-lg border border-zinc-200 text-sm text-zinc-600">Cancelar</button>
              <button onClick={agregarCuenta} className="flex-1 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold">Agregar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setMostrarNuevaCuenta(true)} className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors mb-4">
            + Agregar cuenta
          </button>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap pt-3 border-t border-zinc-100">
          <div>
            <p className="text-xs font-semibold text-zinc-500 mb-1.5">Quién puede verificar depósitos</p>
            <div className="flex gap-1.5 flex-wrap">
              {ROLES.map((r) => (
                <button key={r.id} onClick={() => toggleRol(r.id)}
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                    config.quien_puede_verificar.includes(r.id) ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 text-zinc-500"
                  }`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setConfig({ ...config, reembolsable_hasta_horas: config.reembolsable_hasta_horas === null ? 48 : null })}
              className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${config.reembolsable_hasta_horas !== null ? "bg-teal-500" : "bg-zinc-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${config.reembolsable_hasta_horas !== null ? "left-[18px]" : "left-0.5"}`} />
            </button>
            <span className="text-sm text-zinc-700">
              Reembolsable si cancela con
              {config.reembolsable_hasta_horas !== null ? (
                <input
                  type="number"
                  min={1}
                  value={config.reembolsable_hasta_horas}
                  onClick={(e) => e.preventDefault()}
                  onChange={(e) => setConfig({ ...config, reembolsable_hasta_horas: Number(e.target.value) })}
                  className="w-14 mx-1.5 px-2 py-1 border border-zinc-200 rounded-lg text-sm"
                />
              ) : (
                " — "
              )}
              h
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
