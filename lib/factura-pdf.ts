import { GState, jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface DatosFacturaPdf {
  numero: number;
  estado: "abierta" | "cobrada" | "cancelada";
  creadaAt: string;
  cobradaAt: string | null;
  metodoPago: string | null;
  subtotal: number;
  /** Descuento aplicado (RD$), antes del ITBIS */
  descuento?: number;
  itbis: number;
  itbisPorcentaje: number;
  depositoAplicado: number;
  total: number; // lo que se paga ahora (ya con el depósito descontado)
  clienta: { nombre: string; telefono: string | null; email: string | null } | null;
  atendidaPor: string[];
  cobradaPor: string | null;
  lineas: { descripcion: string; tipo: "servicio" | "producto"; cantidad: number; precioUnitario: number; subtotal: number; empleado: string | null }[];
  negocio: {
    nombre: string;
    razonSocial: string | null;
    rnc: string | null;
    direccion: string | null;
    telefono: string | null;
    instagram: string | null;
  };
  pie: string;
  /** PNG del logo en base64 (data URL) y su proporción ancho/alto */
  logo?: { dataUrl: string; proporcion: number } | null;
}

const MARGEN = 18;
type Color = [number, number, number];
const GRIS: Color = [113, 113, 122];
const TINTA: Color = [24, 24, 27];
const ROJO: Color = [185, 28, 28];
const AMBAR: Color = [180, 83, 9];

const dinero = (n: number) =>
  `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Las fuentes estándar del PDF no traen el espacio fino (U+202F) que usa Intl en "a. m.": se cambia por uno normal
const limpio = (t: string) => t.replace(/[\u202f\u00a0]/g, " ");

const fechaLarga = (iso: string) =>
  limpio(new Date(iso).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" }));

const hora = (iso: string) =>
  limpio(new Date(iso).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase());

const METODOS: Record<string, string> = { tarjeta: "Tarjeta", efectivo: "Efectivo", transferencia: "Transferencia", mixto: "Mixto" };
const ESTADOS = { abierta: "ABIERTA · SIN COBRAR", cobrada: "COBRADA", cancelada: "CANCELADA" } as const;

/** Convierte una imagen pública (logo) en data URL para incrustarla en el PDF */
export async function cargarLogo(url: string): Promise<DatosFacturaPdf["logo"]> {
  try {
    const blob = await (await fetch(url)).blob();
    const origen = await new Promise<string>((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result));
      lector.onerror = reject;
      lector.readAsDataURL(blob);
    });
    // se reduce a 480 px de ancho para que el PDF pese poco
    return await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, 480 / img.width);
        const lienzo = document.createElement("canvas");
        lienzo.width = Math.round(img.width * escala);
        lienzo.height = Math.round(img.height * escala);
        lienzo.getContext("2d")?.drawImage(img, 0, 0, lienzo.width, lienzo.height);
        resolve({ dataUrl: lienzo.toDataURL("image/png"), proporcion: img.width / img.height });
      };
      img.onerror = () => resolve(null);
      img.src = origen;
    });
  } catch {
    return null;
  }
}

export function generarFacturaPdf(d: DatosFacturaPdf) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const derecha = ancho - MARGEN;

  // ── Encabezado: logo + datos del negocio (izquierda) y número de factura (derecha)
  let y = MARGEN;
  if (d.logo) {
    const w = 34;
    doc.addImage(d.logo.dataUrl, "PNG", MARGEN - 2, y - 4, w, w / d.logo.proporcion);
    y += w / d.logo.proporcion - 2;
  } else {
    doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...TINTA);
    doc.text(d.negocio.nombre, MARGEN, y + 4);
    y += 8;
  }
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
  const datosNegocio = [
    d.negocio.razonSocial ?? d.negocio.nombre,
    d.negocio.rnc ? `RNC ${d.negocio.rnc}` : null,
    d.negocio.direccion,
    d.negocio.telefono ? `Tel. ${d.negocio.telefono}` : null,
    d.negocio.instagram,
  ].filter(Boolean) as string[];
  const lineasNegocio = datosNegocio.flatMap((t) => doc.splitTextToSize(t, 95) as string[]);
  doc.text(lineasNegocio, MARGEN, y + 3);
  const finNegocio = y + 3 + lineasNegocio.length * 4;

  doc.setFont("helvetica", "bold").setFontSize(22).setTextColor(...TINTA);
  doc.text("FACTURA", derecha, MARGEN + 4, { align: "right" });
  doc.setFontSize(11);
  doc.text(`N.º ${String(d.numero).padStart(6, "0")}`, derecha, MARGEN + 11, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
  doc.text(`Fecha: ${fechaLarga(d.cobradaAt ?? d.creadaAt)}`, derecha, MARGEN + 17, { align: "right" });
  doc.setFont("helvetica", "bold").setFontSize(8.5).setTextColor(...(d.estado === "cobrada" ? TINTA : d.estado === "cancelada" ? ROJO : AMBAR));
  doc.text(ESTADOS[d.estado], derecha, MARGEN + 23, { align: "right" });

  y = Math.max(finNegocio, MARGEN + 28) + 4;
  doc.setDrawColor(228, 228, 231).setLineWidth(0.3).line(MARGEN, y, derecha, y);
  y += 7;

  // ── Cliente y detalle de la visita
  const columna = (titulo: string, filas: [string, string][], x: number) => {
    doc.setFont("helvetica", "bold").setFontSize(7.5).setTextColor(...GRIS);
    doc.text(titulo.toUpperCase(), x, y);
    let yy = y + 5;
    for (const [etiqueta, valor] of filas) {
      doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...GRIS);
      doc.text(etiqueta, x, yy);
      doc.setFont("helvetica", "bold").setTextColor(...TINTA);
      const partes = doc.splitTextToSize(valor, 50) as string[];
      doc.text(partes, x + 26, yy);
      yy += Math.max(1, partes.length) * 4.2;
    }
    return yy;
  };
  const filasCliente: [string, string][] = [["Nombre", d.clienta?.nombre ?? "—"]];
  if (d.clienta?.telefono) filasCliente.push(["Teléfono", d.clienta.telefono]);
  if (d.clienta?.email) filasCliente.push(["Correo", d.clienta.email]);
  const filasVisita: [string, string][] = [["Entrada", `${fechaLarga(d.creadaAt)}, ${hora(d.creadaAt)}`]];
  if (d.atendidaPor.length) filasVisita.push(["Atendió", d.atendidaPor.join(", ")]);
  if (d.cobradaPor) filasVisita.push(["Cobró", d.cobradaPor]);
  if (d.metodoPago) filasVisita.push(["Método de pago", METODOS[d.metodoPago] ?? d.metodoPago]);
  const y1 = columna("Facturado a", filasCliente, MARGEN);
  const y2 = columna("Detalle", filasVisita, ancho / 2 + 2);
  y = Math.max(y1, y2) + 4;

  // ── Tabla de líneas
  autoTable(doc, {
    startY: y,
    margin: { left: MARGEN, right: MARGEN },
    head: [["Descripción", "Cant.", "Precio", "Subtotal"]],
    body: d.lineas.map((l) => [
      `${l.descripcion}\n${l.tipo === "servicio" ? "Servicio" : "Producto"}${l.empleado ? ` · ${l.empleado}` : ""}`,
      String(l.cantidad),
      dinero(l.precioUnitario),
      dinero(l.subtotal),
    ]),
    theme: "plain",
    styles: { font: "helvetica", fontSize: 9, textColor: [...TINTA], cellPadding: { top: 2.6, bottom: 2.6, left: 2, right: 2 }, lineColor: [228, 228, 231], lineWidth: 0 },
    headStyles: { fontSize: 7.5, fontStyle: "bold", textColor: [...GRIS], fillColor: [250, 250, 250], lineWidth: { bottom: 0.3 } as never },
    bodyStyles: { lineWidth: { bottom: 0.2 } as never },
    columnStyles: { 0: { cellWidth: "auto" }, 1: { halign: "center", cellWidth: 16 }, 2: { halign: "right", cellWidth: 32 }, 3: { halign: "right", cellWidth: 34, fontStyle: "bold" } },
    didParseCell: (data) => {
      if (data.section === "head" && data.column.index > 0) data.cell.styles.halign = data.column.index === 1 ? "center" : "right";
    },
  });
  const docAny = doc as unknown as { lastAutoTable?: { finalY: number } };
  y = (docAny.lastAutoTable?.finalY ?? y) + 8;

  // ── Totales (a la derecha)
  const descuento = d.descuento ?? 0;
  const totalBruto = d.subtotal - descuento + d.itbis;
  const filasTotales: [string, string, boolean?][] = [
    ["Subtotal", dinero(d.subtotal)],
    ...(descuento > 0 ? ([["Descuento", `- ${dinero(descuento)}`]] as [string, string][]) : []),
    [`ITBIS (${d.itbisPorcentaje}%)`, dinero(d.itbis)],
    ["Total de la factura", dinero(totalBruto)],
  ];
  if (d.depositoAplicado > 0) filasTotales.push(["Depósito aplicado", `- ${dinero(d.depositoAplicado)}`]);
  const alturaTotales = filasTotales.length * 6 + 14;
  if (y + alturaTotales > alto - 30) {
    doc.addPage();
    y = MARGEN;
  }
  const xEtiqueta = derecha - 78;
  for (const [etiqueta, valor] of filasTotales) {
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(...GRIS);
    doc.text(etiqueta, xEtiqueta, y);
    doc.setTextColor(...TINTA);
    doc.text(valor, derecha, y, { align: "right" });
    y += 6;
  }
  y += 1;
  doc.setFillColor(...TINTA).roundedRect(xEtiqueta - 4, y - 5.5, 82, 11, 2, 2, "F");
  doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(255, 255, 255);
  doc.text(d.estado === "cobrada" ? "Total pagado" : "Total a pagar", xEtiqueta, y + 1.2);
  doc.setFontSize(12);
  doc.text(dinero(d.total), derecha - 3, y + 1.6, { align: "right" });

  // ── Marca de agua si está cancelada
  if (d.estado === "cancelada") {
    doc.saveGraphicsState();
    doc.setGState(new GState({ opacity: 0.12 }));
    doc.setTextColor(185, 28, 28).setFont("helvetica", "bold").setFontSize(70);
    doc.text("CANCELADA", ancho / 2, alto / 2, { align: "center", angle: 30 });
    doc.restoreGraphicsState();
  }

  // ── Pie en todas las páginas
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setDrawColor(228, 228, 231).setLineWidth(0.3).line(MARGEN, alto - 22, derecha, alto - 22);
    doc.setFont("helvetica", "normal").setFontSize(8.5).setTextColor(...GRIS);
    doc.text(doc.splitTextToSize(d.pie, ancho - MARGEN * 2) as string[], ancho / 2, alto - 16, { align: "center" });
    doc.setFontSize(7.5);
    doc.text(`Página ${i} de ${paginas}`, derecha, alto - 8, { align: "right" });
  }

  return doc;
}

/** Abre el PDF en una pestaña nueva con el diálogo de impresión */
export function imprimirPdf(doc: jsPDF) {
  doc.autoPrint();
  const url = doc.output("bloburl");
  window.open(url.toString(), "_blank");
}

export function descargarPdf(doc: jsPDF, numero: number) {
  doc.save(`factura-${String(numero).padStart(6, "0")}.pdf`);
}
