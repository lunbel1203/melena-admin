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
