"use client";

import { useBloque, type TextosAgenda, type TextosSeccion } from "@/lib/pagina-web";
import { Area, BarraGuardar, Campo, Etiqueta, Tarjeta } from "@/components/pagina-web/campos";

const SECCION: TextosSeccion = {
  titulo_inicio: "",
  subtitulo_inicio: "",
  titulo_pagina: "",
  subtitulo_pagina: "",
  boton_ver_mas: "",
  boton_tarjeta: "",
};
const AGENDA: TextosAgenda = {
  titulo: "",
  subtitulo: "",
  deposito_titulo: "",
  boton_enviar: "",
  aviso_revision: "",
  exito_titulo: "",
  exito_mensaje: "",
  exito_boton: "",
};

function SeccionCard({ clave, titulo, nota, botonTarjeta }: { clave: "servicios" | "catalogo"; titulo: string; nota: string; botonTarjeta: string }) {
  const b = useBloque<TextosSeccion>(clave, SECCION);
  const set = (k: keyof TextosSeccion) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>{titulo}</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">{nota}</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Título en la portada" value={b.valor.titulo_inicio} onChange={set("titulo_inicio")} />
        <Campo label="Texto del botón 'ver más' de la portada" value={b.valor.boton_ver_mas} onChange={set("boton_ver_mas")} />
        <div className="sm:col-span-2">
          <Campo label="Subtítulo en la portada" value={b.valor.subtitulo_inicio} onChange={set("subtitulo_inicio")} />
        </div>
        <Campo label="Título de la página completa" value={b.valor.titulo_pagina} onChange={set("titulo_pagina")} />
        <Campo label={botonTarjeta} value={b.valor.boton_tarjeta} onChange={set("boton_tarjeta")} />
        <div className="sm:col-span-2">
          <Campo label="Subtítulo de la página completa" value={b.valor.subtitulo_pagina} onChange={set("subtitulo_pagina")} />
        </div>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

function AgendaCard() {
  const b = useBloque<TextosAgenda>("agenda", AGENDA);
  const set = (k: keyof TextosAgenda) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Formulario de agendar cita</Etiqueta>
      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <Campo label="Título" value={b.valor.titulo} onChange={set("titulo")} />
        <Campo label="Título del paso de depósito" value={b.valor.deposito_titulo} onChange={set("deposito_titulo")} />
        <div className="sm:col-span-2">
          <Campo label="Subtítulo" value={b.valor.subtitulo} onChange={set("subtitulo")} />
        </div>
        <Campo label="Texto del botón de enviar" value={b.valor.boton_enviar} onChange={set("boton_enviar")} />
        <div className="sm:col-span-2">
          <Area label="Aviso debajo del botón" value={b.valor.aviso_revision} onChange={set("aviso_revision")} filas={2} />
        </div>
        <Campo label="Título al enviar la solicitud" value={b.valor.exito_titulo} onChange={set("exito_titulo")} />
        <Campo label="Botón de WhatsApp al enviar" value={b.valor.exito_boton} onChange={set("exito_boton")} />
        <div className="sm:col-span-2">
          <Area label="Mensaje al enviar la solicitud" value={b.valor.exito_mensaje} onChange={set("exito_mensaje")} filas={2} />
        </div>
      </div>
      <BarraGuardar guardando={b.guardando} guardado={b.guardado} error={b.error} onGuardar={b.guardar} />
    </Tarjeta>
  );
}

export default function SeccionesPage() {
  return (
    <>
      <SeccionCard
        clave="servicios"
        titulo="Servicios"
        nota="Cada servicio (nombre, precio, foto, descripción, qué incluye, galería) se edita en Catálogo → servicio."
        botonTarjeta="Texto del botón de cada tarjeta"
      />
      <SeccionCard
        clave="catalogo"
        titulo="Catálogo de cabello"
        nota="Cada línea (descripción, nota, foto, orden) se edita en Configuración → Inventario → Ficha web; los precios, en los productos."
        botonTarjeta="Texto del botón de cada tarjeta"
      />
      <AgendaCard />
    </>
  );
}
