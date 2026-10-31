/** Filtro de teléfono: solo dígitos y máximo 10 (formato de República Dominicana, p. ej. 8095550142) */
export const soloTelefono = (valor: string) => valor.replace(/\D/g, "").slice(0, 10);
