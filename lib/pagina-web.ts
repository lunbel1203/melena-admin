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
}
export interface Footer {
  descripcion: string;
  navegacion: { etiqueta: string; enlace: string }[];
  copyright: string;
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
