"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/types/database.types";

export interface Red {
  red: "instagram" | "facebook" | "tiktok";
  etiqueta: string;
  url: string;
}
export interface General {
  whatsapp: string;
  telefono: string;
  correo: string;
  direccion_lineas: string[];
  horario_lineas: string[];
  horario_corto: string;
  mapa_consulta: string;
  redes: Red[];
}
export interface Hero {
  titulo: string;
  subtitulo: string;
  boton_texto: string;
  boton_enlace: string;
  imagen: string;
}
export interface Garantias {
  items: { titulo: string; descripcion: string }[];
}
export interface Sobre {
  titulo: string;
  texto: string;
  imagen: string;
}
export interface TituloSeccion {
  titulo: string;
}
export interface Contacto {
  titulo: string;
  subtitulo: string;
  boton_whatsapp: string;
  titulo_direccion: string;
  titulo_horario: string;
  titulo_telefono: string;
  titulo_correo: string;
}
export interface Footer {
  descripcion: string;
  navegacion: { etiqueta: string; enlace: string }[];
  copyright: string;
  titulo_navegacion: string;
  titulo_contacto: string;
}
export interface Menu {
  enlaces: { etiqueta: string; enlace: string }[];
  boton_texto: string;
  boton_enlace: string;
}
export interface Marca {
  nombre: string;
  logo: string;
  favicon: string;
}
export interface Botones {
  whatsapp: string;
  agendar: string;
}
export interface TextosSeccion {
  titulo_inicio: string;
  subtitulo_inicio: string;
  titulo_pagina: string;
  subtitulo_pagina: string;
  boton_ver_mas: string;
  boton_tarjeta: string;
}
export interface TextosAgenda {
  titulo: string;
  subtitulo: string;
  deposito_titulo: string;
  boton_enviar: string;
  aviso_revision: string;
  exito_titulo: string;
  exito_mensaje: string;
  exito_boton: string;
  etiqueta_nombre: string;
  placeholder_nombre: string;
  etiqueta_telefono: string;
  placeholder_telefono: string;
  etiqueta_correo: string;
  placeholder_correo: string;
  paso_servicio: string;
  paso_servicio_cabello: string;
  cargando_servicios: string;
  paso_estilista: string;
  buscando_estilistas: string;
  paso_fecha: string;
  buscando_horarios: string;
  sin_horarios: string;
  sin_cupos: string;
  deposito_monto: string;
  comprobante_etiqueta: string;
  comprobante_formatos: string;
  etiqueta_comentario: string;
  placeholder_comentario: string;
  enviando: string;
}
export interface TextosWhatsApp {
  servicio_intro: string;
  servicio_incluye: string;
  servicio_cierre: string;
  producto_intro: string;
  producto_precios: string;
  producto_elegido: string;
  producto_cierre: string;
  etiqueta_precio: string;
  etiqueta_color: string;
  etiqueta_largo: string;
  ver_en_web: string;
  reserva: string;
}
export interface NoEncontrada {
  titulo: string;
  mensaje: string;
  boton_texto: string;
  boton_enlace: string;
}
export interface Seo {
  titulo: string;
  descripcion: string;
}

export const REDES: Red["red"][] = ["instagram", "facebook", "tiktok"];

// Las fotos que vienen de la web original son rutas relativas (/hero.jpg):
// para previsualizarlas en el panel se les antepone la URL pública de la web.
export function urlFoto(src: string | null | undefined) {
  if (!src) return "";
  if (/^https?:/i.test(src)) return src;
  return `${process.env.NEXT_PUBLIC_WEB_URL ?? ""}${src}`;
}

export async function subirFotoWeb(file: File, carpeta: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${carpeta}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("fotos-web").upload(path, file);
  if (error) throw new Error(error.message);
  return supabase.storage.from("fotos-web").getPublicUrl(path).data.publicUrl;
}

// Carga un bloque de web_contenido y lo guarda con upsert.
export function useBloque<T>(clave: string, defecto: T) {
  const supabase = useMemo(() => createClient(), []);
  const [valor, setValor] = useState<T>(defecto);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("web_contenido").select("valor").eq("clave", clave).maybeSingle();
      if (data?.valor) setValor({ ...defecto, ...(data.valor as object) } as T);
      setCargando(false);
    })();
    // defecto es un literal estable por pantalla: solo se usa para completar campos faltantes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, clave]);

  const guardar = useCallback(async () => {
    setGuardando(true);
    setError(null);
    setGuardado(false);
    const { error } = await supabase.from("web_contenido").upsert({ clave, valor: valor as unknown as Json });
    setGuardando(false);
    if (error) return setError(error.message);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2500);
  }, [supabase, clave, valor]);

  return { valor, setValor, cargando, guardando, guardado, error, guardar };
}
