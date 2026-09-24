"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-3">{children}</p>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
      />
    </div>
  );
}

export default function NegocioContactoPage() {
  const supabase = useMemo(() => createClient(), []);
  const [nombreComercial, setNombreComercial] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [moneda, setMoneda] = useState("RD$");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("negocio_config").select("*").eq("id", true).single();
      if (data) {
        setNombreComercial(data.nombre_comercial);
        setTelefono(data.telefono ?? "");
        setWhatsapp(data.whatsapp ?? "");
        setDireccion(data.direccion ?? "");
        setInstagram(data.instagram ?? "");
        setMoneda(data.moneda);
      }
      setCargando(false);
    })();
  }, [supabase]);

  async function guardar() {
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase
      .from("negocio_config")
      .update({
        nombre_comercial: nombreComercial.trim(),
        telefono: telefono.trim() || null,
        whatsapp: whatsapp.trim() || null,
        direccion: direccion.trim() || null,
        instagram: instagram.trim() || null,
        moneda: moneda.trim() || "RD$",
      })
      .eq("id", true);
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }

  if (cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Negocio y contacto</SectionLabel>
        <div className="flex items-center gap-3">
          {guardado && <span className="text-xs font-medium text-teal-600">Guardado ✓</span>}
          <button
            onClick={guardar}
            disabled={guardando}
            className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
      <p className="text-xs text-zinc-400 mb-5">Se muestran en el sitio web, la app y las facturas.</p>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nombre comercial" value={nombreComercial} onChange={setNombreComercial} placeholder="Melena Human Hair" />
        <Field label="Moneda" value={moneda} onChange={setMoneda} placeholder="Peso dominicano (RD$)" />
        <Field label="Teléfono" value={telefono} onChange={setTelefono} placeholder="809 555 0100" />
        <Field label="WhatsApp" value={whatsapp} onChange={setWhatsapp} placeholder="809 555 0101" />
        <Field label="Dirección" value={direccion} onChange={setDireccion} placeholder="Av. Winston Churchill 1099, Santo Domingo" />
        <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="@melenahumanhair" />
      </div>
    </div>
  );
}
