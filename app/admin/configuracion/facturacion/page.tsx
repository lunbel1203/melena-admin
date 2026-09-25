"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-1">{children}</p>;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface FacturacionConfig {
  rnc: string | null;
  razon_social: string | null;
  itbis_porcentaje: number;
}

export default function FacturacionPage() {
  const supabase = useMemo(() => createClient(), []);
  const [config, setConfig] = useState<FacturacionConfig | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("facturacion_config").select("*").eq("id", true).single();
      if (data) setConfig(data);
      setCargando(false);
    })();
  }, [supabase]);

  async function guardar() {
    if (!config) return;
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase
      .from("facturacion_config")
      .update({
        rnc: config.rnc?.trim() || null,
        razon_social: config.razon_social?.trim() || null,
        itbis_porcentaje: config.itbis_porcentaje,
      })
      .eq("id", true);
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
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
        <SectionLabel>Datos fiscales</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">Se usan al imprimir o enviar la factura.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="RNC"
            value={config.rnc ?? ""}
            onChange={(v) => setConfig({ ...config, rnc: v })}
            placeholder="130-12345-6"
          />
          <Field
            label="Razón social"
            value={config.razon_social ?? ""}
            onChange={(v) => setConfig({ ...config, razon_social: v })}
            placeholder="Melena Human Hair SRL"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5">
        <SectionLabel>ITBIS</SectionLabel>
        <p className="text-xs text-zinc-400 mb-4">
          Tasa aplicada al subtotal de cada factura. Cambiar esto afecta todas las facturas que se abran después de guardar.
        </p>
        <div className="max-w-[220px]">
          <Field
            label="Tasa de ITBIS"
            type="number"
            value={String(config.itbis_porcentaje)}
            onChange={(v) => setConfig({ ...config, itbis_porcentaje: Number(v) || 0 })}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
}
