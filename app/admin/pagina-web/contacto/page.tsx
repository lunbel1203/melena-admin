"use client";

import { REDES, useBloque, type Contacto, type General } from "@/lib/pagina-web";
import { BarraGuardar, Campo, Etiqueta, Lineas, Tarjeta } from "@/components/pagina-web/campos";

const GENERAL: General = {
  whatsapp: "",
  telefono: "",
  correo: "",
  direccion_lineas: [],
  horario_lineas: [],
  horario_corto: "",
  mapa_consulta: "",
  redes: [],
};
const CONTACTO: Contacto = { titulo: "", subtitulo: "", boton_whatsapp: "" };

function DatosCard() {
  const b = useBloque<General>("general", GENERAL);
  const g = b.valor;
  const set = <K extends keyof General>(k: K) => (v: General[K]) => b.setValor({ ...g, [k]: v });
  const red = (nombre: (typeof REDES)[number]) => g.redes.find((r) => r.red === nombre) ?? { red: nombre, etiqueta: "", url: "" };
  const cambiarRed = (nombre: (typeof REDES)[number], campo: "etiqueta" | "url", v: string) =>
    b.setValor({ ...g, redes: REDES.map((n) => (n === nombre ? { ...red(n), [campo]: v } : red(n))) });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Datos de contacto</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">
        Se usan en la barra superior, la sección Contacto, el footer y el botón de WhatsApp: se cambian una sola vez aquí.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Teléfono (como se muestra)" value={g.telefono} onChange={set("telefono")} placeholder="+1 (809) 770-9332" />
        <Campo
          label="WhatsApp (solo números)"
          value={g.whatsapp}
          onChange={(v) => set("whatsapp")(v.replace(/\D/g, ""))}
          placeholder="18097709332"
          ayuda="Con código de país, sin + ni espacios."
        />
        <Campo label="Correo" value={g.correo} onChange={set("correo")} placeholder="hola@melenahumanhair.com" />
        <Campo
          label="Ubicación en el mapa"
          value={g.mapa_consulta}
          onChange={set("mapa_consulta")}
          ayuda="Lo que escribirías en Google Maps."
        />
        <Lineas label="Dirección" value={g.direccion_lineas} onChange={set("direccion_lineas")} />
        <Lineas label="Horario (sección Contacto)" value={g.horario_lineas} onChange={set("horario_lineas")} />
        <Campo
          label="Horario corto (barra superior)"
          value={g.horario_corto}
          onChange={set("horario_corto")}
          placeholder="Lunes a sábado, 10:00 am – 7:00 pm"
        />
      </div>

      <Etiqueta>Redes sociales</Etiqueta>
      <div className="space-y-3 mb-4">
        {REDES.map((n) => (
          <div key={n} className="grid sm:grid-cols-[100px_1fr_1.5fr] gap-3 items-end">
            <p className="text-sm font-semibold text-zinc-700 capitalize pb-2.5">{n}</p>
            <Campo label="Nombre visible" value={red(n).etiqueta} onChange={(v) => cambiarRed(n, "etiqueta", v)} placeholder="@melenahumanhair" />
            <Campo label="Enlace" value={red(n).url} onChange={(v) => cambiarRed(n, "url", v)} placeholder="https://instagram.com/melenahumanhair" />
          </div>
        ))}
        <p className="text-[11px] text-zinc-400">Si dejas una red vacía, no se muestra.</p>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function TextosCard() {
  const b = useBloque<Contacto>("contacto", CONTACTO);
  const set = (k: keyof Contacto) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Textos de la sección Contacto</Etiqueta>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
        <Campo label="Texto del botón de WhatsApp" value={b.valor.boton_whatsapp} onChange={set("boton_whatsapp")} />
        <div className="sm:col-span-2">
          <Campo label="Subtítulo" value={b.valor.subtitulo} onChange={set("subtitulo")} />
        </div>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function ContactoPage() {
  return (
    <>
      <DatosCard />
      <TextosCard />
    </>
  );
}
