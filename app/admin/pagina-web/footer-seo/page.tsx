"use client";

import { useBloque, type Footer, type NoEncontrada, type Privacidad, type Seo } from "@/lib/pagina-web";
import { Area, BarraGuardar, Campo, Etiqueta, Tarjeta } from "@/components/pagina-web/campos";

const FOOTER: Footer = { descripcion: "", navegacion: [], copyright: "", titulo_navegacion: "", titulo_contacto: "" };
const SEO: Seo = { titulo: "", descripcion: "" };
const PRIVACIDAD: Privacidad = { titulo: "", actualizado: "", texto: "" };
const NO_ENCONTRADA: NoEncontrada = { titulo: "", mensaje: "", boton_texto: "", boton_enlace: "/" };

function FooterCard() {
  const b = useBloque<Footer>("footer", FOOTER);
  const nav = b.valor.navegacion;
  const cambiar = (i: number, k: "etiqueta" | "enlace", v: string) =>
    b.setValor({ ...b.valor, navegacion: nav.map((n, j) => (j === i ? { ...n, [k]: v } : n)) });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Footer</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">
        La dirección, el teléfono, el correo y las redes del footer salen de Contacto y horarios.
      </p>
      <div className="space-y-4 mb-4">
        <Area label="Descripción" value={b.valor.descripcion} onChange={(v) => b.setValor({ ...b.valor, descripcion: v })} filas={2} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Campo label="Título de la columna de navegación" value={b.valor.titulo_navegacion} onChange={(v) => b.setValor({ ...b.valor, titulo_navegacion: v })} />
          <Campo label="Título de la columna de contacto" value={b.valor.titulo_contacto} onChange={(v) => b.setValor({ ...b.valor, titulo_contacto: v })} />
        </div>
        <div>
          <p className="text-xs font-semibold text-zinc-500 mb-1.5">Enlaces de navegación</p>
          <div className="space-y-3">
            {nav.map((n, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-3 items-end">
                <Campo label="Texto" value={n.etiqueta} onChange={(v) => cambiar(i, "etiqueta", v)} />
                <Campo label="Enlace" value={n.enlace} onChange={(v) => cambiar(i, "enlace", v)} placeholder="/servicios o /#testimonios" />
                <button
                  onClick={() => b.setValor({ ...b.valor, navegacion: nav.filter((_, j) => j !== i) })}
                  className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-2.5"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button
              onClick={() => b.setValor({ ...b.valor, navegacion: [...nav, { etiqueta: "", enlace: "" }] })}
              className="text-xs font-semibold border border-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-50"
            >
              + Agregar enlace
            </button>
          </div>
        </div>
        <Campo
          label="Derechos de autor"
          value={b.valor.copyright}
          onChange={(v) => b.setValor({ ...b.valor, copyright: v })}
          ayuda="El año se agrega solo: © 2026 + este texto."
        />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function SeoCard() {
  const b = useBloque<Seo>("seo", SEO);
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Buscadores (Google)</Etiqueta>
      <div className="space-y-4 mb-4">
        <Campo
          label="Título de la pestaña"
          value={b.valor.titulo}
          onChange={(v) => b.setValor({ ...b.valor, titulo: v })}
          ayuda="Es lo que aparece en la pestaña del navegador y como título en Google."
        />
        <Area label="Descripción" value={b.valor.descripcion} onChange={(v) => b.setValor({ ...b.valor, descripcion: v })} filas={3} ayuda="Idealmente menos de 160 caracteres." />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function PrivacidadCard() {
  const b = useBloque<Privacidad>("privacidad", PRIVACIDAD);
  const set = (k: keyof Privacidad) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Política de privacidad</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">
        Se publica en <span className="font-mono">/privacidad</span> y la app enlaza a esa página. Formato: una línea que empieza con &quot;## &quot; abre una sección,
        con &quot;- &quot; es un elemento de lista, y el resto son párrafos. {"{correo}"} se reemplaza por el correo de contacto. Es un texto base: conviene que lo revise un abogado.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
        <Campo label="Última actualización" value={b.valor.actualizado} onChange={set("actualizado")} placeholder="3 de octubre de 2026" />
        <div className="sm:col-span-2">
          <Area label="Texto" value={b.valor.texto} onChange={set("texto")} filas={22} />
        </div>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function NoEncontradaCard() {
  const b = useBloque<NoEncontrada>("no_encontrada", NO_ENCONTRADA);
  const set = (k: keyof NoEncontrada) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Página no encontrada (404)</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">Lo que ve quien entra a un enlace que no existe.</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div className="sm:col-span-2">
          <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
        </div>
        <div className="sm:col-span-2">
          <Area label="Mensaje" value={b.valor.mensaje} onChange={set("mensaje")} filas={2} />
        </div>
        <Campo label="Texto del botón" value={b.valor.boton_texto} onChange={set("boton_texto")} />
        <Campo label="Enlace del botón" value={b.valor.boton_enlace} onChange={set("boton_enlace")} />
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function FooterSeoPage() {
  return (
    <>
      <FooterCard />
      <SeoCard />
      <PrivacidadCard />
      <NoEncontradaCard />
    </>
  );
}
