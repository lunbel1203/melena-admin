/** Recorte y compresión de fotos para la app (todo en el navegador, antes de subirlas). */

const aBlob = (canvas: HTMLCanvasElement, calidad: number) =>
  new Promise<Blob>((ok, mal) => canvas.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo procesar la imagen"))), "image/jpeg", calidad));

export const formatoPeso = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

/**
 * Recorta el rectángulo (sx, sy, sw, sh) de la imagen y lo deja en JPEG, a lo sumo de `ancho` px
 * (nunca amplía: si la foto es pequeña conserva su resolución) y bajando la calidad hasta cumplir `maxBytes`.
 */
export async function recortarImagen(
  bmp: ImageBitmap,
  rect: { sx: number; sy: number; sw: number; sh: number },
  { ancho, alto, maxBytes }: { ancho: number; alto: number; maxBytes: number },
) {
  const outAncho = Math.max(1, Math.min(ancho, Math.round(rect.sw)));
  const outAlto = Math.max(1, Math.round((outAncho * alto) / ancho));
  const canvas = document.createElement("canvas");
  canvas.width = outAncho;
  canvas.height = outAlto;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Tu navegador no pudo procesar la imagen.");
  ctx.fillStyle = "#ffffff"; // PNG con transparencia → fondo blanco
  ctx.fillRect(0, 0, outAncho, outAlto);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, outAncho, outAlto);

  let calidad = 0.92;
  let blob = await aBlob(canvas, calidad);
  while (blob.size > maxBytes && calidad > 0.5) {
    calidad -= 0.05;
    blob = await aBlob(canvas, calidad);
  }
  if (blob.size > maxBytes) throw new Error("No se logró comprimir la imagen al peso pedido. Prueba con una foto con menos ruido o detalle.");
  return { blob, ancho: outAncho, alto: outAlto };
}
