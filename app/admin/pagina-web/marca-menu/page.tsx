"use client";

import { useBloque, type Botones, type Marca, type Menu } from "@/lib/pagina-web";
import { BarraGuardar, Campo, Etiqueta, SubirFoto, Tarjeta } from "@/components/pagina-web/campos";

const MARCA: Marca = { nombre: "", logo: "", favicon: "" };
const MENU: Menu = { enlaces: [], boton_texto: "", boton_enlace: "/agendar" };
const BOTONES: Botones = { whatsapp: "", agendar: "" };

function MarcaCard() {
  const b = useBloque<Marca>("marca", MARCA);
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Marca</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">El logo se muestra en el header y en el footer; el ícono, en la pestaña del navegador.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <Campo label="Nombre" value={b.valor.nombre} onChange={(v) => b.setValor({ ...b.valor, nombre: v })} placeholder="Melena" />
        </div>
        <SubirFoto label="Logo" value={b.valor.logo} onChange={(v) => b.setValor({ ...b.valor, logo: v })} carpeta="marca" proporcion="aspect-[5/3]" />
        <SubirFoto label="Ícono de la pestaña (favicon)" value={b.valor.favicon} onChange={(v) => b.setValor({ ...b.valor, favicon: v })} carpeta="marca" proporcion="aspect-square" />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function MenuCard() {
  const b = useBloque<Menu>("menu", MENU);
  const enlaces = b.valor.enlaces;
  const cambiar = (i: number, k: "etiqueta" | "enlace", v: string) =>
    b.setValor({ ...b.valor, enlaces: enlaces.map((e, j) => (j === i ? { ...e, [k]: v } : e)) });
  function mover(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= enlaces.length) return;
    const copia = [...enlaces];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    b.setValor({ ...b.valor, enlaces: copia });
  }
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Menú del header</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">
        Para llevar a una sección de la portada usa /#servicios, /#catalogo, /#antes-y-despues, /#testimonios, /#sobre-nosotros o /#contacto.
      </p>
      <div className="space-y-3 mb-4">
        {enlaces.map((e, i) => (
          <div key={i} className="grid sm:grid-cols-[auto_1fr_1.5fr_auto] gap-3 items-end">
            <span className="flex flex-col pb-1.5">
              <button onClick={() => mover(i, -1)} disabled={i === 0} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-25 text-xs leading-none p-1" aria-label="Subir">▲</button>
              <button onClick={() => mover(i, 1)} disabled={i === enlaces.length - 1} className="text-zinc-400 hover:text-zinc-700 disabled:opacity-25 text-xs leading-none p-1" aria-label="Bajar">▼</button>
            </span>
            <Campo label="Texto" value={e.etiqueta} onChange={(v) => cambiar(i, "etiqueta", v)} />
            <Campo label="Enlace" value={e.enlace} onChange={(v) => cambiar(i, "enlace", v)} />
            <button
              onClick={() => b.setValor({ ...b.valor, enlaces: enlaces.filter((_, j) => j !== i) })}
              className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-2.5"
            >
              Quitar
            </button>
          </div>
        ))}
        <button
          onClick={() => b.setValor({ ...b.valor, enlaces: [...enlaces, { etiqueta: "", enlace: "" }] })}
          className="text-xs font-semibold border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
        >
          + Agregar enlace
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Texto del botón del header" value={b.valor.boton_texto} onChange={(v) => b.setValor({ ...b.valor, boton_texto: v })} />
        <Campo label="Enlace del botón" value={b.valor.boton_enlace} onChange={(v) => b.setValor({ ...b.valor, boton_enlace: v })} />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function BotonesCard() {
  const b = useBloque<Botones>("botones", BOTONES);
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Botones de las fichas de servicios y productos</Etiqueta>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Botón de WhatsApp" value={b.valor.whatsapp} onChange={(v) => b.setValor({ ...b.valor, whatsapp: v })} />
        <Campo label="Botón de agendar" value={b.valor.agendar} onChange={(v) => b.setValor({ ...b.valor, agendar: v })} />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function MarcaMenuPage() {
  return (
    <>
      <MarcaCard />
      <MenuCard />
      <BotonesCard />
    </>
  );
}
