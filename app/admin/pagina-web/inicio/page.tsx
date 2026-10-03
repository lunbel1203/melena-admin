"use client";

import { useBloque, type Garantias, type Hero, type Sobre } from "@/lib/pagina-web";
import { Area, BarraGuardar, Campo, Etiqueta, SubirFoto, Tarjeta } from "@/components/pagina-web/campos";

const HERO: Hero = { titulo: "", subtitulo: "", boton_texto: "", boton_enlace: "/agendar", imagen: "" };
const GARANTIAS: Garantias = { items: [] };
const SOBRE: Sobre = { titulo: "", texto: "", imagen: "" };

function HeroCard() {
  const b = useBloque<Hero>("hero", HERO);
  const set = (k: keyof Hero) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Portada (hero)</Etiqueta>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-4">
          <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
          <Area label="Texto debajo del título" value={b.valor.subtitulo} onChange={set("subtitulo")} filas={4} />
          <Campo label="Texto del botón" value={b.valor.boton_texto} onChange={set("boton_texto")} />
          <Campo
            label="Enlace del botón"
            value={b.valor.boton_enlace}
            onChange={set("boton_enlace")}
            ayuda="/agendar lleva al formulario de citas."
          />
        </div>
        <SubirFoto label="Foto de la portada" value={b.valor.imagen} onChange={set("imagen")} carpeta="hero" proporcion="aspect-[4/5]" />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function GarantiasCard() {
  const b = useBloque<Garantias>("garantias", GARANTIAS);
  const items = b.valor.items;
  const cambiar = (i: number, k: "titulo" | "descripcion", v: string) =>
    b.setValor({ items: items.map((it, j) => (j === i ? { ...it, [k]: v } : it)) });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Franja de garantías (debajo de la portada)</Etiqueta>
      <div className="space-y-4 mb-4">
        {items.map((it, i) => (
          <div key={i} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
            <Campo label="Título" value={it.titulo} onChange={(v) => cambiar(i, "titulo", v)} />
            <Campo label="Descripción" value={it.descripcion} onChange={(v) => cambiar(i, "descripcion", v)} />
            <button
              onClick={() => b.setValor({ items: items.filter((_, j) => j !== i) })}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-2.5"
            >
              Quitar
            </button>
          </div>
        ))}
        {items.length < 4 && (
          <button
            onClick={() => b.setValor({ items: [...items, { titulo: "", descripcion: "" }] })}
            className="text-xs font-semibold border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
          >
            + Agregar
          </button>
        )}
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function SobreCard() {
  const b = useBloque<Sobre>("sobre", SOBRE);
  const set = (k: keyof Sobre) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Sobre Melena</Etiqueta>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-4">
          <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
          <Area label="Texto" value={b.valor.texto} onChange={set("texto")} filas={7} />
        </div>
        <SubirFoto label="Foto del salón" value={b.valor.imagen} onChange={set("imagen")} carpeta="sobre" proporcion="aspect-video" />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function InicioPage() {
  return (
    <>
      <HeroCard />
      <GarantiasCard />
      <SobreCard />
    </>
  );
}
