"use client";

import { useEffect, useState } from "react";
import { dmaAIso, formatearDma, isoADma } from "@/lib/dates";

// Campo de fecha en español (DD/MM/AAAA) en lugar del selector del navegador, que sigue el
// idioma del navegador y puede verse en inglés (mm/dd/yyyy).
// `value` y `onChange` usan el formato AAAA-MM-DD (o "" si está vacío o incompleto).
export default function CampoFecha({
  value,
  onChange,
  onInvalidChange,
  className,
  placeholder = "DD/MM/AAAA",
  disabled,
}: {
  value: string;
  onChange: (iso: string) => void;
  /** avisa si lo escrito es una fecha incompleta o imposible (para bloquear el guardado) */
  onInvalidChange?: (invalida: boolean) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [texto, setTexto] = useState(isoADma(value));

  // si el valor cambia desde afuera (cargar datos, limpiar el formulario), se actualiza el texto
  useEffect(() => {
    if (value !== (dmaAIso(texto) ?? "")) setTexto(isoADma(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const invalida = texto.length === 10 && !dmaAIso(texto);

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={10}
      disabled={disabled}
      value={texto}
      placeholder={placeholder}
      onChange={(e) => {
        const t = formatearDma(e.target.value);
        setTexto(t);
        onChange(dmaAIso(t) ?? "");
        onInvalidChange?.(t.length > 0 && !dmaAIso(t));
      }}
      title={invalida ? "Fecha no válida: usa día/mes/año, por ejemplo 18/03/1994" : undefined}
      className={`${className ?? ""} ${invalida ? "!border-red-400" : ""}`}
    />
  );
}
