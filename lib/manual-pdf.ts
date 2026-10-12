import { jsPDF } from "jspdf";
import { paraQuien, type Tema } from "@/lib/ayuda";

// Las fuentes estándar del PDF no traen algunos símbolos: se cambian por equivalentes.
const limpio = (t: string) => t.replace(/→/g, ">").replace(/[‑–—]/g, "-").replace(/ /g, " ");

const MARGEN = 18;
const TINTA: [number, number, number] = [24, 24, 27];
const GRIS: [number, number, number] = [113, 113, 122];

/** Manual completo en PDF: portada, contenido y capítulos con sus pasos y notas. */
export function generarManualPdf(opciones: { titulo: string; version: string; fecha: string; temas: Tema[]; nombreArchivo: string }) {
  const { titulo, version, fecha, temas, nombreArchivo } = opciones;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const util = ancho - MARGEN * 2;
  let y = MARGEN;

  const asegurar = (h: number) => {
    if (y + h > alto - 20) {
      doc.addPage();
      y = MARGEN;
    }
  };
  const texto = (t: string, { size = 10, bold = false, color = TINTA, x = MARGEN, w = util, gap = 1.4 }: { size?: number; bold?: boolean; color?: [number, number, number]; x?: number; w?: number; gap?: number } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size).setTextColor(...color);
    const lineas = doc.splitTextToSize(limpio(t), w) as string[];
    const alturaLinea = size * 0.42;
    for (const l of lineas) {
      asegurar(alturaLinea + 1);
      doc.text(l, x, y);
      y += alturaLinea + gap;
    }
  };

  // Portada
  doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(...TINTA);
  doc.text("Melena", MARGEN, y + 6);
  y += 16;
  texto(titulo, { size: 16, bold: true });
  texto(`Versión ${version} · ${fecha}`, { size: 10, color: GRIS });
  y += 2;
  doc.setDrawColor(228, 228, 231).line(MARGEN, y, ancho - MARGEN, y);
  y += 8;

  // Contenido
  texto("Contenido", { size: 13, bold: true });
  y += 1;
  temas.forEach((t, i) => texto(`${i + 1}. ${t.titulo}`, { size: 10, gap: 1.8 }));
  y += 4;

  // Capítulos
  temas.forEach((t, i) => {
    asegurar(30);
    y += 4;
    doc.setDrawColor(228, 228, 231).line(MARGEN, y - 3, ancho - MARGEN, y - 3);
    texto(`${i + 1}. ${t.titulo}`, { size: 14, bold: true, gap: 2 });
    texto(`Para quién: ${paraQuien(t)}`, { size: 9, color: GRIS });
    texto(t.resumen, { size: 10, color: GRIS, gap: 2 });
    for (const b of t.bloques) {
      y += 1.5;
      if (b.titulo) {
        asegurar(12);
        texto(b.titulo, { size: 11, bold: true, gap: 1.6 });
      }
      b.pasos?.forEach((p, j) => {
        asegurar(8);
        const x0 = MARGEN + 2;
        doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...TINTA);
        doc.text(`${j + 1}.`, x0, y);
        texto(p, { x: x0 + 7, w: util - 9, gap: 1.3 });
        y += 0.8;
      });
      b.notas?.forEach((n) => {
        asegurar(8);
        const x0 = MARGEN + 2;
        doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(...GRIS);
        doc.text("-", x0 + 1, y);
        texto(n, { x: x0 + 6, w: util - 8, color: TINTA, gap: 1.3 });
        y += 0.8;
      });
    }
  });

  // Pie con número de página
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...GRIS);
    doc.text(`Melena · ${titulo} · v${version}`, MARGEN, alto - 10);
    doc.text(`Página ${p} de ${total}`, ancho - MARGEN, alto - 10, { align: "right" });
  }
  doc.save(nombreArchivo);
}

/** El mismo manual como texto Markdown (para guardarlo o abrirlo en cualquier editor). */
export function manualMarkdown(titulo: string, version: string, fecha: string, temas: Tema[]) {
  const l: string[] = [`# Melena · ${titulo}`, "", `Versión ${version} · ${fecha}`, ""];
  temas.forEach((t, i) => {
    l.push(`## ${i + 1}. ${t.titulo}`, "", `*Para quién: ${paraQuien(t)}*`, "", t.resumen, "");
    for (const b of t.bloques) {
      if (b.titulo) l.push(`### ${b.titulo}`, "");
      b.pasos?.forEach((p, j) => l.push(`${j + 1}. ${p}`));
      if (b.pasos) l.push("");
      b.notas?.forEach((n) => l.push(`- ${n}`));
      if (b.notas) l.push("");
    }
  });
  return l.join("\n");
}
