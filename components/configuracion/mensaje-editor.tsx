"use client";

import { useRef } from "react";

function renderizarMensaje(plantilla: string, variables: Record<string, string>) {
  return plantilla.replace(/\{\{(\w+)\}\}/g, (_, clave) => variables[clave] ?? `{{${clave}}}`);
}

export default function MensajeEditor({
  value,
  onChange,
  variables,
  ejemplo,
}: {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
  ejemplo: Record<string, string>;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function insertarVariable(variable: string) {
    const placeholder = `{{${variable}}}`;
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + placeholder);
      return;
    }
    const inicio = textarea.selectionStart ?? value.length;
    const fin = textarea.selectionEnd ?? value.length;
    const nuevoTexto = value.slice(0, inicio) + placeholder + value.slice(fin);
    onChange(nuevoTexto);
    requestAnimationFrame(() => {
      textarea.focus();
      const nuevaPos = inicio + placeholder.length;
      textarea.setSelectionRange(nuevaPos, nuevaPos);
    });
  }

  return (
    <div>
      <p className="text-xs text-zinc-400 mb-2">Haz clic para insertar en el mensaje:</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {variables.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => insertarVariable(v)}
            className="text-xs font-mono px-2.5 py-1 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-colors"
          >
            {`{{${v}}}`}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm resize-none mb-3"
      />

      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">Así se ve</p>
      <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-3 text-sm text-zinc-700">
        {renderizarMensaje(value, ejemplo)}
      </div>
    </div>
  );
}
