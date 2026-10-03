import Swal from "sweetalert2";

const BASE = {
  buttonsStyling: false,
  reverseButtons: true,
  customClass: {
    popup: "!rounded-2xl !p-6",
    title: "!text-lg !font-bold !text-zinc-900",
    htmlContainer: "!text-sm !text-zinc-500",
    confirmButton: "text-sm font-semibold text-white px-4 py-2.5 rounded-xl transition-colors",
    cancelButton: "text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 px-4 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors mr-2",
  },
};

interface ConfirmarOpciones {
  titulo: string;
  texto?: string;
  confirmarTexto?: string;
  cancelarTexto?: string;
  peligroso?: boolean;
}

export async function confirmar(opciones: ConfirmarOpciones) {
  const resultado = await Swal.fire({
    ...BASE,
    title: opciones.titulo,
    text: opciones.texto,
    showCancelButton: true,
    confirmButtonText: opciones.confirmarTexto ?? "Confirmar",
    cancelButtonText: opciones.cancelarTexto ?? "Cancelar",
    customClass: {
      ...BASE.customClass,
      confirmButton: `${BASE.customClass.confirmButton} ${opciones.peligroso ? "!bg-red-600 hover:!bg-red-700" : "!bg-zinc-900 hover:!bg-zinc-700"}`,
    },
  });
  return resultado.isConfirmed;
}

export async function avisar(titulo: string, texto?: string) {
  await Swal.fire({
    ...BASE,
    title: titulo,
    text: texto,
    confirmButtonText: "Entendido",
    customClass: {
      ...BASE.customClass,
      confirmButton: `${BASE.customClass.confirmButton} !bg-zinc-900 hover:!bg-zinc-700`,
    },
  });
}

function normalizarTelefonoDO(telefono: string) {
  const digitos = telefono.replace(/\D/g, "");
  if (digitos.length === 10) return `1${digitos}`;
  return digitos;
}

export function enlaceWhatsApp(telefono: string | null | undefined, mensaje: string) {
  const texto = encodeURIComponent(mensaje);
  if (telefono && telefono.trim()) {
    return `https://wa.me/${normalizarTelefonoDO(telefono)}?text=${texto}`;
  }
  return `https://wa.me/?text=${texto}`;
}

export async function mostrarCredenciales(opciones: {
  titulo: string;
  nombre: string;
  telefono?: string | null;
  email: string;
  password: string;
  /** a quién se le comparten los datos (para el texto del aviso) */
  para?: "la empleada" | "la clienta";
  /** dónde entra la persona: la app, el panel administrativo o ambos (empleadas) */
  plataformas?: "app" | "panel" | "ambas";
}) {
  const para = opciones.para ?? "la empleada";
  const aviso = opciones.para === "la clienta" ? "\n\nEs una contraseña temporal: al entrar, la app te pedirá crear la tuya." : "";
  const panel = typeof window !== "undefined" ? window.location.origin : "";
  const dondeEntra =
    opciones.plataformas === "ambas"
      ? `la app de Melena y al panel administrativo (${panel})`
      : opciones.plataformas === "panel"
      ? `el panel administrativo de Melena (${panel})`
      : "la app de Melena";
  const mensaje = `Hola ${opciones.nombre}, ya puedes entrar a ${dondeEntra} con estos datos:\n\nCorreo: ${opciones.email}\nContraseña: ${opciones.password}${opciones.plataformas === "ambas" ? "\n\nEs la misma cuenta para la app y el panel." : ""}${aviso}`;
  const linkWhatsApp = enlaceWhatsApp(opciones.telefono, mensaje);

  await Swal.fire({
    ...BASE,
    title: opciones.titulo,
    html: `
      <div class="text-left text-sm text-zinc-500 space-y-3">
        <p>Compártelos con ${para} — no se van a volver a mostrar.${opciones.para === "la clienta" ? " Es temporal: la app le pedirá crear su propia contraseña al entrar." : ""}</p>
        <div class="bg-zinc-50 rounded-xl p-3 space-y-1.5 text-zinc-800">
          <p><span class="font-semibold">Correo:</span> ${opciones.email}</p>
          <p><span class="font-semibold">Contraseña:</span> <span class="font-mono tracking-wide">${opciones.password}</span></p>
        </div>
        <a href="${linkWhatsApp}" target="_blank" rel="noopener noreferrer"
           class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold transition-colors no-underline">
          Enviar por WhatsApp
        </a>
        ${!opciones.telefono ? `<p class="text-xs text-zinc-400 text-center">Esta persona no tiene teléfono cargado — vas a tener que elegir el chat a mano.</p>` : ""}
      </div>
    `,
    confirmButtonText: "Entendido",
    customClass: {
      ...BASE.customClass,
      confirmButton: `${BASE.customClass.confirmButton} !bg-zinc-900 hover:!bg-zinc-700 !w-full`,
    },
  });
}
