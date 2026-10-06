/**
 * Prepara una foto para la app: la recorta a la proporción pedida, la reduce al tamaño
 * máximo y la comprime en JPEG hasta que pese poco, sin perder calidad visible.
 */
export interface ImagenOptimizada {
  blob: Blob;
  ancho: number;
  alto: number;
  original: { ancho: number; alto: number; bytes: number };
}

const aBlob = (canvas: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo procesar la imagen"))), "image/jpeg", calidad));

export async function optimizarImagen(
  file: File,
  { ancho, alto, maxBytes, minAncho }: { ancho: number; alto: number; maxBytes: number; minAncho: number },
): Promise<ImagenOptimizada> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("Usa una imagen JPG, PNG o WebP.");
  if (file.size > 25 * 1024 * 1024) throw new Error("La imagen pesa más de 25 MB. Usa una más liviana.");

  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  if (bmp.width < minAncho) throw new Error(`La imagen es muy pequeña (${bmp.width} px de ancho). Usa una de al menos ${minAncho} px para que se vea nítida.`);

  // Tamaño final: el recomendado, o el máximo que permita la foto sin ampliarla
  const proporcion = ancho / alto;
  const outAncho = Math.min(ancho, bmp.width, Math.floor(bmp.height * proporcion));
  const outAlto = Math.round(outAncho / proporcion);

  const canvas = document.createElement("canvas");
  canvas.width = outAncho;
  canvas.height = outAlto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.fillStyle = "#ffffff"; // PNG con transparencia → fondo blanco
  ctx.fillRect(0, 0, outAncho, outAlto);
  ctx.imageSmoothingQuality = "high";
  // recorte centrado ("cover") a la proporción de la pantalla
  const escala = Math.max(outAncho / bmp.width, outAlto / bmp.height);
  const w = bmp.width * escala;
  const h = bmp.height * escala;
  ctx.drawImage(bmp, (outAncho - w) / 2, (outAlto - h) / 2, w, h);

  // baja la calidad poco a poco hasta cumplir el peso (no menos de 0.55 para que no se vea pobre)
  let calidad = 0.9;
  let blob = await aBlob(canvas, calidad);
  while (blob.size > maxBytes && calidad > 0.55) {
    calidad -= 0.05;
    blob = await aBlob(canvas, calidad);
  }
  if (blob.size > maxBytes) throw new Error("No se logró comprimir la imagen al peso pedido. Prueba con una foto con menos detalle o ruido.");

  return { blob, ancho: outAncho, alto: outAlto, original: { ancho: bmp.width, alto: bmp.height, bytes: file.size } };
}

export const formatoPeso = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);
