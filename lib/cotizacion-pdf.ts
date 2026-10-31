import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface DatosCotizacionPdf {
  numero: number;
  creadaAt: string;
  vigencia: string | null;
  nombreCliente: string;
  telefono: string | null;
  lineas: { descripcion: string; cantidad: number; precioUnitario: number }[];
  subtotal: number;
  descuento: number;
  total: number;
  depositoMonto: number;
  notas: string | null;
  negocio: { nombre: string; direccion: string | null; telefono: string | null; instagram: string | null };
}

const MARGEN = 18;
type Color = [number, number, number];
const GRIS: Color = [113, 113, 122];
const TINTA: Color = [24, 24, 27];
const dinero = (n: number) => `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fecha = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
export const numeroCotizacion = (n: number) => `COT-${String(n).padStart(4, "0")}`;

export function generarCotizacionPdf(d: DatosCotizacionPdf) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const derecha = ancho - MARGEN;
  let y = MARGEN;

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(...TINTA);
  doc.text(d.negocio.nombre, MARGEN, y + 4);
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
  const datos = [d.negocio.direccion, d.negocio.telefono ? `Tel. ${d.negocio.telefono}` : null, d.negocio.instagram].filter(Boolean) as string[];
  doc.text(datos.flatMap((t) => doc.splitTextToSize(t, 95) as string[]), MARGEN, y + 10);

  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...TINTA);
  doc.text("COTIZACIÓN", derecha, y + 4, { align: "right" });
  doc.setFontSize(11);
  doc.text(numeroCotizacion(d.numero), derecha, y + 11, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
  doc.text(fecha(d.creadaAt), derecha, y + 17, { align: "right" });

  y += 30;
  doc.setDrawColor(228, 228, 231).setLineWidth(0.3).line(MARGEN, y, derecha, y);
  y += 7;
  doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(...GRIS);
  doc.text("PARA", MARGEN, y);
  doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(...TINTA);
  doc.text(d.nombreCliente, MARGEN, y + 6);
  if (d.telefono) {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
    doc.text(d.telefono, MARGEN, y + 11);
  }
  y += 18;

  autoTable(doc, {
    startY: y,
    margin: { left: MARGEN, right: MARGEN },
    head: [["Descripción", "Cant.", "Precio", "Total"]],
    body: d.lineas.map((l) => [l.descripcion, String(l.cantidad), dinero(l.precioUnitario), dinero(l.cantidad * l.precioUnitario)]),
    styles: { font: "helvetica", fontSize: 9, textColor: TINTA, cellPadding: 2.5 },
    headStyles: { fillColor: [244, 244, 245], textColor: GRIS, fontSize: 8, fontStyle: "bold" },
    columnStyles: { 1: { halign: "right", cellWidth: 16 }, 2: { halign: "right", cellWidth: 32 }, 3: { halign: "right", cellWidth: 34 } },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  const fila = (etiqueta: string, valor: string, negrita = false) => {
    doc.setFont("helvetica", negrita ? "bold" : "normal").setFontSize(negrita ? 12 : 9.5).setTextColor(...(negrita ? TINTA : GRIS));
    doc.text(etiqueta, derecha - 70, y);
    doc.text(valor, derecha, y, { align: "right" });
    y += negrita ? 8 : 6;
  };
  fila("Subtotal", dinero(d.subtotal));
  if (d.descuento > 0) fila("Descuento", `- ${dinero(d.descuento)}`);
  doc.setDrawColor(...TINTA).setLineWidth(0.4).line(derecha - 70, y - 3, derecha, y - 3);
  y += 2;
  fila("Total", dinero(d.total), true);

  if (d.depositoMonto > 0) {
    y += 2;
    doc.setFillColor(253, 241, 236).roundedRect(MARGEN, y, derecha - MARGEN, 14, 2, 2, "F");
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(...TINTA);
    doc.text(`Depósito para apartar: ${dinero(d.depositoMonto)}`, MARGEN + 4, y + 6);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...GRIS);
    doc.text("Se descuenta del total al momento del servicio.", MARGEN + 4, y + 11);
    y += 20;
  }
  doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...GRIS);
  if (d.notas) {
    const t = doc.splitTextToSize(`Notas: ${d.notas}`, derecha - MARGEN) as string[];
    doc.text(t, MARGEN, y);
    y += t.length * 4 + 4;
  }
  const pie = `${d.vigencia ? `Válida hasta el ${fecha(d.vigencia)}. ` : ""}Los precios pueden variar según el largo y la cantidad final de cabello.`;
  doc.text(doc.splitTextToSize(pie, derecha - MARGEN) as string[], MARGEN, y);
  return doc;
}

export function descargarCotizacionPdf(doc: jsPDF, numero: number) {
  doc.save(`cotizacion-${String(numero).padStart(4, "0")}.pdf`);
}
