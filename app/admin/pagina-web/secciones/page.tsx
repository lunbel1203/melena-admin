"use client";

import { useBloque, type TextosAgenda, type TextosSeccion, type TextosWhatsApp } from "@/lib/pagina-web";
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
  etiqueta_nombre: "",
  placeholder_nombre: "",
  etiqueta_telefono: "",
  placeholder_telefono: "",
  etiqueta_correo: "",
  placeholder_correo: "",
  paso_servicio: "",
  paso_servicio_cabello: "",
  cargando_servicios: "",
  paso_estilista: "",
  buscando_estilistas: "",
  paso_fecha: "",
  buscando_horarios: "",
  sin_horarios: "",
  sin_cupos: "",
  deposito_monto: "",
  comprobante_etiqueta: "",
  comprobante_formatos: "",
  etiqueta_comentario: "",
  placeholder_comentario: "",
  enviando: "",
};
const WHATSAPP: TextosWhatsApp = {
  servicio_intro: "",
  servicio_incluye: "",
  servicio_cierre: "",
  producto_intro: "",
  producto_precios: "",
  producto_elegido: "",
  producto_cierre: "",
  etiqueta_precio: "",
  etiqueta_color: "",
  etiqueta_largo: "",
  ver_en_web: "",
  reserva: "",
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
        <Campo label="Etiqueta del nombre" value={b.valor.etiqueta_nombre} onChange={set("etiqueta_nombre")} />
        <Campo label="Ejemplo en el campo de nombre" value={b.valor.placeholder_nombre} onChange={set("placeholder_nombre")} />
        <Campo label="Etiqueta del teléfono" value={b.valor.etiqueta_telefono} onChange={set("etiqueta_telefono")} />
        <Campo label="Ejemplo en el campo de teléfono" value={b.valor.placeholder_telefono} onChange={set("placeholder_telefono")} />
        <Campo label="Etiqueta del correo" value={b.valor.etiqueta_correo} onChange={set("etiqueta_correo")} />
        <Campo label="Ejemplo en el campo de correo" value={b.valor.placeholder_correo} onChange={set("placeholder_correo")} />
        <Campo label="Paso 1 (solo servicio)" value={b.valor.paso_servicio} onChange={set("paso_servicio")} />
        <Campo label="Paso 1 (cabello y servicio)" value={b.valor.paso_servicio_cabello} onChange={set("paso_servicio_cabello")} />
        <Campo label="Paso 2 (estilista)" value={b.valor.paso_estilista} onChange={set("paso_estilista")} />
        <Campo label="Paso 3 (día y hora)" value={b.valor.paso_fecha} onChange={set("paso_fecha")} />
        <Campo label="Mientras carga los servicios" value={b.valor.cargando_servicios} onChange={set("cargando_servicios")} />
        <Campo label="Mientras busca estilistas" value={b.valor.buscando_estilistas} onChange={set("buscando_estilistas")} />
        <Campo label="Mientras busca horarios" value={b.valor.buscando_horarios} onChange={set("buscando_horarios")} />
        <Campo label="Cuando un día no tiene horarios" value={b.valor.sin_horarios} onChange={set("sin_horarios")} />
        <div className="sm:col-span-2">
          <Campo label="Cuando la estilista no tiene cupos" value={b.valor.sin_cupos} onChange={set("sin_cupos")} ayuda="{dias} se reemplaza por la cantidad de días." />
        </div>
        <Campo label="Texto del monto del depósito" value={b.valor.deposito_monto} onChange={set("deposito_monto")} />
        <Campo label="Texto de subir el comprobante" value={b.valor.comprobante_etiqueta} onChange={set("comprobante_etiqueta")} />
        <Campo label="Formatos del comprobante" value={b.valor.comprobante_formatos} onChange={set("comprobante_formatos")} />
        <Campo label="Etiqueta del comentario" value={b.valor.etiqueta_comentario} onChange={set("etiqueta_comentario")} />
        <Campo label="Ejemplo en el comentario" value={b.valor.placeholder_comentario} onChange={set("placeholder_comentario")} />
        <Campo label="Texto del botón mientras envía" value={b.valor.enviando} onChange={set("enviando")} />
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

function WhatsAppCard() {
  const b = useBloque<TextosWhatsApp>("whatsapp", WHATSAPP);
  const set = (k: keyof TextosWhatsApp) => (v: string) => b.setValor({ ...b.valor, [k]: v });
  if (b.cargando) return <p className="text-sm text-zinc-400">Cargando…</p>;
  return (
    <Tarjeta>
      <Etiqueta>Mensajes de WhatsApp</Etiqueta>
      <p className="text-xs text-zinc-400 mb-4">
        Son los textos que le llegan al salón cuando alguien pulsa &quot;Consultar por whatsapp&quot; o termina de reservar. El nombre, el precio, la duración, el color y el largo se agregan solos.
      </p>
      <p className="text-xs font-semibold text-zinc-500 mb-2">Consulta de un servicio</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Campo label="Saludo" value={b.valor.servicio_intro} onChange={set("servicio_intro")} />
        <Campo label="Título de la lista de lo que incluye" value={b.valor.servicio_incluye} onChange={set("servicio_incluye")} />
        <div className="sm:col-span-2">
          <Campo label="Cierre" value={b.valor.servicio_cierre} onChange={set("servicio_cierre")} />
        </div>
      </div>
      <p className="text-xs font-semibold text-zinc-500 mb-2">Consulta de un producto de cabello</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Campo label="Saludo" value={b.valor.producto_intro} onChange={set("producto_intro")} />
        <Campo label="Título de la lista de precios" value={b.valor.producto_precios} onChange={set("producto_precios")} ayuda="{color} se reemplaza por el color elegido." />
        <Campo label="Marca del largo elegido" value={b.valor.producto_elegido} onChange={set("producto_elegido")} />
        <div className="sm:col-span-2">
          <Campo label="Cierre" value={b.valor.producto_cierre} onChange={set("producto_cierre")} />
        </div>
      </div>
      <p className="text-xs font-semibold text-zinc-500 mb-2">Etiquetas comunes</p>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <Campo label="Precio" value={b.valor.etiqueta_precio} onChange={set("etiqueta_precio")} />
        <Campo label="Color" value={b.valor.etiqueta_color} onChange={set("etiqueta_color")} />
        <Campo label="Largo" value={b.valor.etiqueta_largo} onChange={set("etiqueta_largo")} />
        <Campo label="Enlace a la web" value={b.valor.ver_en_web} onChange={set("ver_en_web")} />
      </div>
      <p className="text-xs font-semibold text-zinc-500 mb-2">Después de reservar una cita</p>
      <div className="mb-4">
        <Area
          label="Mensaje"
          value={b.valor.reserva}
          onChange={set("reserva")}
          filas={3}
          ayuda="Variables: {servicio}, {fecha}, {hora}, {estilista} y {nombre}."
        />
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
      <WhatsAppCard />
    </>
  );
}
