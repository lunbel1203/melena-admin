import type { SupabaseClient } from "@supabase/supabase-js";

export type Choque = { campo: "email" | "telefono"; donde: "clienta" | "empleada" | "cuenta"; nombre: string };

/**
 * Pregunta a la base si el correo o el teléfono ya los usa otro usuario (clienta, empleada o cuenta de acceso).
 * `clientaId` / `empleadoId`: la ficha que se está editando, para no compararla consigo misma.
 * Si la función aún no existe o falla, no bloquea el guardado: la base sigue protegiendo el teléfono único de las clientas.
 */
export async function verificarContacto(
  supabase: SupabaseClient,
  datos: { email?: string | null; telefono?: string | null; clientaId?: string; empleadoId?: string },
): Promise<Choque[]> {
  const email = datos.email?.trim() || null;
  const telefono = datos.telefono?.trim() || null;
  if (!email && !telefono) return [];
  try {
    const { data, error } = await supabase.rpc("verificar_contacto", {
      p_email: email,
      p_telefono: telefono,
      p_clienta_id: datos.clientaId ?? null,
      p_empleado_id: datos.empleadoId ?? null,
    });
    if (error) return [];
    return (data ?? []) as Choque[];
  } catch {
    return [];
  }
}

const QUIEN: Record<Choque["donde"], string> = { clienta: "clienta", empleada: "empleada", cuenta: "cuenta de acceso" };

/** "Este correo ya está registrado con Mariela Peña (clienta). Este teléfono ya está registrado con …" */
export function mensajeContacto(choques: Choque[]): string {
  const frases = choques.map((c) =>
    c.donde === "cuenta"
      ? "Este correo ya tiene una cuenta de acceso."
      : `${c.campo === "email" ? "Este correo" : "Este teléfono"} ya está registrado con ${c.nombre} (${QUIEN[c.donde]}).`,
  );
  return [...new Set(frases)].join(" ");
}

/**
 * ¿Sigue activa la sesión? Sin sesión las peticiones van como usuario anónimo y la base responde
 * "permission denied for function es_admin", que no le dice nada a quien está guardando.
 */
export async function sesionActiva(supabase: SupabaseClient): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getUser();
    return !error && !!data.user;
  } catch {
    return false;
  }
}

export const MENSAJE_SESION_VENCIDA = "Tu sesión venció. Recarga la página e inicia sesión de nuevo para guardar.";
