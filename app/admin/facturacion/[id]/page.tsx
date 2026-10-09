"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { avisar, confirmar, enlaceWhatsApp } from "@/lib/alerts";
import { cargarLogo, descargarPdf, generarFacturaPdf, imprimirPdf } from "@/lib/factura-pdf";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1" width="9" height="5" rx="1" />
      <path d="M3 10H1.5A.5.5 0 0 1 1 9.5v-4A.5.5 0 0 1 1.5 5h12a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H12" />
      <rect x="3" y="9" width="9" height="5" rx="1" />
    </svg>
  );
}

type MetodoPago = "tarjeta" | "efectivo" | "transferencia" | "mixto";

type Linea = {
  id: string;
  tipo: "servicio" | "producto";
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  porcentaje_comision: number;
  created_at: string;
  empleado_id: string;
  empleados: { nombre: string; roles: { nombre: string } | null } | null;
};

type Factura = {
  id: string;
  numero: number;
  estado: "abierta" | "cobrada" | "cancelada";
  subtotal: number;
  itbis: number;
  total: number;
  deposito_aplicado: number;
  descuento: number;
  descuento_tipo: "monto" | "porcentaje";
  descuento_valor: number;
  metodo_pago: MetodoPago | null;
  cobrada_at: string | null;
  created_at: string;
  clientas: { id: string; nombre: string; telefono: string; email: string | null; notas: string | null; created_at: string } | null;
  cobrador: { nombre: string } | null;
  lineas_factura: Linea[];
  visitas: {
    id: string;
    estado: "en_espera" | "en_atencion" | "por_cobrar" | "cerrada";
    created_at: string;
    atencion_inicio_at: string | null;
    servicio_fin_at: string | null;
    notas: string | null;
    recepcion: { nombre: string } | null;
    estilista: { id: string; nombre: string } | null;
    citas: { hora_inicio: string; servicios: { nombre: string; duracion_minutos: number } | null } | null;
  } | null;
};

type Catalogo = { id: string; nombre: string; precio: number; detalle?: string; foto?: string | null };

/** "Se registró hoy" · "5 días de registro" · "3 meses de registro" · "1 año y 2 meses de registro" */
function tiempoDeRegistro(iso: string) {
  const dias = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));
  if (dias === 0) return "se registró hoy";
  if (dias < 60) return `${dias} ${dias === 1 ? "día" : "días"} de registro`;
  const meses = Math.floor(dias / 30.44);
  if (meses < 12) return `${meses} meses de registro`;
  const anios = Math.floor(meses / 12);
  const resto = meses % 12;
  return `${anios} ${anios === 1 ? "año" : "años"}${resto ? ` y ${resto} ${resto === 1 ? "mes" : "meses"}` : ""} de registro`;
}

const FACTURA_SELECT = `
  id, numero, estado, subtotal, itbis, total, deposito_aplicado, descuento, descuento_tipo, descuento_valor, metodo_pago, cobrada_at, created_at,
  clientas ( id, nombre, telefono, email, notas, created_at ),
  cobrador:empleados!facturas_cobrada_por_fkey ( nombre ),
  lineas_factura ( id, tipo, descripcion, cantidad, precio_unitario, subtotal, porcentaje_comision, created_at, empleado_id,
    empleados ( nombre, roles!empleados_rol_id_fkey ( nombre ) ) ),
  visitas ( id, estado, created_at, atencion_inicio_at, servicio_fin_at, notas,
    recepcion:empleados!visitas_empleado_recepcion_id_fkey ( nombre ),
    estilista:empleados!visitas_estilista_id_fkey ( id, nombre ),
    citas ( hora_inicio, servicios ( nombre, duracion_minutos ) ) )
`;

const money = (n: number) =>
  `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const hora = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-DO", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();

const fechaLarga = (iso: string) =>
  new Date(iso).toLocaleDateString("es-DO", { weekday: "long", day: "numeric", month: "short" });

function horaCita(h: string) {
  const [hh, mm] = h.split(":").map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return hora(d.toISOString());
}

function duracion(min: number) {
  if (min < 60) return `${min} min`;
  const h = min / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} horas`;
}

const estadoBadge: Record<Factura["estado"], string> = {
  abierta: "bg-green-50 text-green-700",
  cobrada: "bg-zinc-900 text-white",
  cancelada: "bg-red-50 text-red-700",
};

const visitaLabel: Record<NonNullable<Factura["visitas"]>["estado"], string> = {
  en_espera: "en espera",
  en_atencion: "en atención",
  por_cobrar: "por cobrar",
  cerrada: "cerrada",
};

function Dato({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-zinc-800 font-medium">{value}</p>
    </div>
  );
}

export default function DetalleFacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = useMemo(() => createClient(), []);

  const [factura, setFactura] = useState<Factura | null>(null);
  const [itbisPct, setItbisPct] = useState(18);
  const [visitasClienta, setVisitasClienta] = useState(0);
  const [ultimaVisita, setUltimaVisita] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("tarjeta");
  const [whatsapp, setWhatsapp] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  // Panel "Agregar"
  const [agregando, setAgregando] = useState(false);
  const [tipoAgregar, setTipoAgregar] = useState<"servicio" | "producto">("servicio");
  const [catalogo, setCatalogo] = useState<{ servicio: Catalogo[]; producto: Catalogo[] } | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [empleadosActivos, setEmpleadosActivos] = useState<{ id: string; nombre: string }[]>([]);
  // quién hizo el servicio ("" = la estilista asignada a la visita, o quien cobra si no hay)
  const [quienHizo, setQuienHizo] = useState("");
  // permiso de Seguridad: ver todos los servicios y registrarlos a nombre de otra persona
  const [puedeAgregarAOtros, setPuedeAgregarAOtros] = useState(false);

  // descuento: permiso de Seguridad y lo que se digita (se guarda al salir del campo)
  const [puedeDescuento, setPuedeDescuento] = useState(false);
  const [descTipo, setDescTipo] = useState<"monto" | "porcentaje">("monto");
  const [descValor, setDescValor] = useState("");
  // el descuento se guarda solo mientras se escribe; esta marca evita que la recarga pise lo digitado
  const descEditado = useRef(false);
  const [guardandoDesc, setGuardandoDesc] = useState(false);
  // si la clienta tiene cuenta en la app y desde cuándo
  const [registroApp, setRegistroApp] = useState<{ registrada: boolean; fecha: string | null } | null>(null);

  const estilistaVisitaId = factura?.visitas?.estilista?.id ?? null;

  const cargar = useCallback(async () => {
    const [f, cfg] = await Promise.all([
      supabase.from("facturas").select(FACTURA_SELECT).eq("id", id).maybeSingle(),
      supabase.from("facturacion_config").select("itbis_porcentaje").eq("id", true).maybeSingle(),
    ]);
    if (f.error || !f.data) {
      setError(f.error?.message ?? "Factura no encontrada");
      setCargando(false);
      return;
    }
    const fac = f.data as unknown as Factura;
    setFactura(fac);
    if (cfg.data) setItbisPct(Number(cfg.data.itbis_porcentaje));
    if (fac.metodo_pago) setMetodoPago(fac.metodo_pago);
    if (!descEditado.current) {
      setDescTipo(fac.descuento_tipo);
      setDescValor(Number(fac.descuento_valor) > 0 ? String(Number(fac.descuento_valor)) : "");
    }
    supabase.rpc("tiene_permiso", { p_clave: "facturacion.descuento" }).then(({ data }) => setPuedeDescuento(data === true));
    if (fac.clientas) {
      supabase.rpc("registro_app_clienta", { p_clienta_id: fac.clientas.id }).then(({ data }) => setRegistroApp(data?.[0] ?? null));
    }

    if (fac.clientas) {
      const { data } = await supabase
        .from("visitas")
        .select("created_at")
        .eq("clienta_id", fac.clientas.id)
        .eq("estado", "cerrada")
        .order("created_at", { ascending: false });
      setVisitasClienta(data?.length ?? 0);
      setUltimaVisita(data?.[0]?.created_at ?? null);
    }
    setError(null);
    setCargando(false);
  }, [supabase, id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function abrirAgregar() {
    setAgregando(true);
    if (catalogo) return;
    const [s, p, e, asignados, yo, permiso] = await Promise.all([
      supabase.from("servicios").select("id, nombre, precio, foto_url").eq("activo", true).order("nombre"),
      supabase.from("productos").select("id, nombre, precio, stock, foto_url").eq("activo", true).order("nombre"),
      supabase.from("empleados").select("id, nombre").eq("activo", true).order("nombre"),
      supabase.from("servicios_empleados").select("servicio_id, empleado_id"),
      supabase.rpc("empleado_id_actual"),
      supabase.rpc("tiene_permiso", { p_clave: "facturacion.agregar_a_otros" }),
    ]);
    // Con el permiso (caja, administración) se ven todos los servicios y se elige quién los hizo;
    // sin él, cada quien ve solo los que ofrece (sin asignaciones = cualquiera)
    const todos = permiso.data === true;
    setPuedeAgregarAOtros(todos);
    setEmpleadosActivos(e.data ?? []);
    const conAsignadas = new Set((asignados.data ?? []).map((a) => a.servicio_id));
    const mios = new Set((asignados.data ?? []).filter((a) => a.empleado_id === yo.data).map((a) => a.servicio_id));
    const ofrece = (sid: string) => todos || !conAsignadas.has(sid) || mios.has(sid);
    setCatalogo({
      servicio: (s.data ?? []).filter((x) => ofrece(x.id)).map((x) => ({ id: x.id, nombre: x.nombre, precio: Number(x.precio), foto: x.foto_url })),
      producto: (p.data ?? []).map((x) => ({ id: x.id, nombre: x.nombre, precio: Number(x.precio), detalle: `${x.stock} en stock`, foto: x.foto_url })),
    });
  }

  async function agregar(item: Catalogo) {
    setProcesando(true);
    const { error } = await supabase.rpc("agregar_linea_factura", {
      p_factura_id: id,
      p_tipo: tipoAgregar,
      p_item_id: item.id,
      p_cantidad: cantidad,
      ...(tipoAgregar === "servicio" && puedeAgregarAOtros && (quienHizo || estilistaVisitaId) ? { p_empleado_id: quienHizo || estilistaVisitaId! } : {}),
    });
    if (error) await avisar("No se pudo agregar", error.message);
    else {
      setAgregando(false);
      setBusqueda("");
      setCantidad(1);
      await cargar();
    }
    setProcesando(false);
  }

  async function guardarDescuento(tipo: "monto" | "porcentaje", texto: string) {
    if (!factura) return;
    const valor = Number(texto || 0);
    // valores a medio escribir (vacío, negativo, más de 100 %) no se guardan ni molestan con avisos
    if (!Number.isFinite(valor) || valor < 0 || (tipo === "porcentaje" && valor > 100)) return;
    if (tipo === factura.descuento_tipo && valor === Number(factura.descuento_valor)) return;
    setGuardandoDesc(true);
    const { error } = await supabase.rpc("aplicar_descuento_factura", { p_factura_id: factura.id, p_tipo: tipo, p_valor: valor });
    if (error) await avisar("No se pudo aplicar el descuento", error.message);
    else await cargar();
    setGuardandoDesc(false);
  }

  // guarda 0,4 s después de la última tecla
  useEffect(() => {
    if (!descEditado.current) return;
    const t = setTimeout(() => guardarDescuento(descTipo, descValor), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descValor, descTipo]);

  async function quitarLinea(l: Linea) {
    if (!(await confirmar({ titulo: "¿Quitar esta línea?", texto: l.descripcion, confirmarTexto: "Quitar", peligroso: true }))) return;
    setProcesando(true);
    const { error } = await supabase.from("lineas_factura").delete().eq("id", l.id);
    if (error) await avisar("No se pudo quitar la línea", error.message);
    await cargar();
    setProcesando(false);
  }

  async function cobrar() {
    if (!factura) return;
    const ok = await confirmar({
      titulo: `Cobrar ${money(Number(factura.total))}`,
      texto: `Método de pago: ${metodoPago}. Se cierra la factura, se descuenta el inventario y se calculan las comisiones.`,
      confirmarTexto: "Cobrar",
    });
    if (!ok) return;
    setProcesando(true);
    const { error } = await supabase.rpc("cobrar_factura", { p_factura_id: factura.id, p_metodo_pago: metodoPago });
    if (error) {
      await avisar("No se pudo cobrar", error.message);
    } else {
      if (whatsapp && factura.clientas) {
        const detalle = factura.lineas_factura.map((l) => `• ${l.descripcion} x${l.cantidad}`).join("\n");
        const msg = `Hola ${factura.clientas.nombre.split(" ")[0]}, gracias por visitarnos 💛\n\n${detalle}\n\nTotal pagado: ${money(Number(factura.total))}`;
        window.open(enlaceWhatsApp(factura.clientas.telefono, msg), "_blank");
      }
      await cargar();
    }
    setProcesando(false);
  }

  async function cancelarFactura() {
    if (!factura) return;
    if (!(await confirmar({ titulo: "¿Cancelar esta factura?", texto: "La visita se cierra sin cobro.", confirmarTexto: "Cancelar factura", peligroso: true }))) return;
    setProcesando(true);
    const { error } = await supabase.from("facturas").update({ estado: "cancelada" }).eq("id", factura.id);
    if (error) await avisar("No se pudo cancelar", error.message);
    await cargar();
    setProcesando(false);
  }

  const lineas = useMemo(
    () => [...(factura?.lineas_factura ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [factura],
  );

  const comisiones = useMemo(() => {
    const porEmpleado = new Map<string, { nombre: string; lineas: number; monto: number; pcts: Set<number> }>();
    for (const l of lineas) {
      const e = porEmpleado.get(l.empleado_id) ?? { nombre: l.empleados?.nombre ?? "—", lineas: 0, monto: 0, pcts: new Set<number>() };
      e.lineas += 1;
      e.monto += (Number(l.subtotal) * Number(l.porcentaje_comision)) / 100;
      e.pcts.add(Number(l.porcentaje_comision));
      porEmpleado.set(l.empleado_id, e);
    }
    return [...porEmpleado.values()];
  }, [lineas]);

  const bitacora = useMemo(() => {
    if (!factura?.visitas) return [];
    const v = factura.visitas;
    const ev: { at: string; texto: string }[] = [
      { at: v.created_at, texto: `${v.recepcion?.nombre ?? "Recepción"} dio entrada a la clienta` },
    ];
    if (v.atencion_inicio_at) ev.push({ at: v.atencion_inicio_at, texto: `${v.estilista?.nombre ?? "La estilista"} inició la atención` });
    for (const l of lineas) ev.push({ at: l.created_at, texto: `${l.empleados?.nombre ?? "Alguien"} agregó ${l.descripcion}` });
    if (v.servicio_fin_at) ev.push({ at: v.servicio_fin_at, texto: "Servicio terminado" });
    if (factura.cobrada_at) ev.push({ at: factura.cobrada_at, texto: `${factura.cobrador?.nombre ?? "Caja"} cobró la factura` });
    return ev.sort((a, b) => a.at.localeCompare(b.at));
  }, [factura, lineas]);

  if (cargando) return <div className="min-h-full bg-zinc-50 p-8 text-sm text-zinc-400">Cargando…</div>;
  if (error || !factura) {
    return (
      <div className="min-h-full bg-zinc-50 p-8">
        <Link href="/admin/facturacion" className="text-sm text-zinc-500 hover:text-zinc-800">← Facturación</Link>
        <p className="mt-4 text-sm text-red-700">{error ?? "Factura no encontrada"}</p>
      </div>
    );
  }

  const v = factura.visitas;
  const clienta = factura.clientas;
  const abierta = factura.estado === "abierta";
  // Vista previa inmediata del descuento mientras se escribe (la base lo confirma 0,4 s después)
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const editaDescuento = abierta && puedeDescuento;
  const valorDesc = Number(descValor || 0);
  const descValido = Number.isFinite(valorDesc) && valorDesc >= 0 && (descTipo !== "porcentaje" || valorDesc <= 100);
  const subtotalN = Number(factura.subtotal);
  const usarPrevia = editaDescuento && descValido;
  const descuentoN = usarPrevia ? (descTipo === "porcentaje" ? r2((subtotalN * valorDesc) / 100) : Math.min(valorDesc, subtotalN)) : Number(factura.descuento);
  const itbisN = usarPrevia ? r2(((subtotalN - descuentoN) * itbisPct) / 100) : Number(factura.itbis);
  const totalN = usarPrevia ? r2((subtotalN - descuentoN) * (1 + itbisPct / 100) - Number(factura.deposito_aplicado)) : Number(factura.total);
  const tipoMostrado = usarPrevia ? descTipo : factura.descuento_tipo;
  const valorMostrado = usarPrevia ? valorDesc : Number(factura.descuento_valor);
  // hay un descuento escrito que todavía no se guardó: no se puede cobrar hasta que se confirme
  const descPendiente = usarPrevia && (descTipo !== factura.descuento_tipo || valorDesc !== Number(factura.descuento_valor));
  const servicios = lineas.filter((l) => l.tipo === "servicio");
  const productos = lineas.filter((l) => l.tipo === "producto");
  const suma = (ls: Linea[]) => ls.reduce((s, l) => s + Number(l.subtotal), 0);
  const principal = servicios[0];
  const lista = (catalogo?.[tipoAgregar] ?? []).filter((c) => c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()));

  async function crearPdf() {
    if (!factura) return null;
    const [{ data: neg }, { data: cfg }, logo] = await Promise.all([
      supabase.from("negocio_config").select("nombre_comercial, telefono, direccion, instagram").eq("id", true).maybeSingle(),
      supabase.from("facturacion_config").select("rnc, razon_social, itbis_porcentaje, pie_factura").eq("id", true).maybeSingle(),
      cargarLogo("/Melena logo.png"),
    ]);
    const atendio = Array.from(new Set(factura.lineas_factura.map((l) => l.empleados?.nombre).filter(Boolean) as string[]));
    return generarFacturaPdf({
      numero: factura.numero,
      estado: factura.estado,
      creadaAt: factura.visitas?.created_at ?? factura.created_at,
      cobradaAt: factura.cobrada_at,
      metodoPago: factura.metodo_pago,
      subtotal: Number(factura.subtotal),
      descuento: Number(factura.descuento),
      itbis: Number(factura.itbis),
      itbisPorcentaje: Number(cfg?.itbis_porcentaje ?? itbisPct),
      depositoAplicado: Number(factura.deposito_aplicado),
      total: Number(factura.total),
      clienta: factura.clientas ? { nombre: factura.clientas.nombre, telefono: factura.clientas.telefono, email: factura.clientas.email } : null,
      atendidaPor: atendio,
      cobradaPor: factura.cobrador?.nombre ?? null,
      lineas: [...factura.lineas_factura]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((l) => ({
          descripcion: l.descripcion,
          tipo: l.tipo,
          cantidad: l.cantidad,
          precioUnitario: Number(l.precio_unitario),
          subtotal: Number(l.subtotal),
          empleado: l.empleados?.nombre ?? null,
        })),
      negocio: {
        nombre: neg?.nombre_comercial ?? "Melena",
        razonSocial: cfg?.razon_social ?? null,
        rnc: cfg?.rnc ?? null,
        direccion: neg?.direccion ?? null,
        telefono: neg?.telefono ?? null,
        instagram: neg?.instagram ?? null,
      },
      pie: cfg?.pie_factura ?? "Gracias por tu visita.",
      logo,
    });
  }

  async function imprimirFactura(descargar: boolean) {
    setGenerandoPdf(true);
    try {
      const doc = await crearPdf();
      if (!doc || !factura) return;
      if (descargar) descargarPdf(doc, factura.numero);
      else imprimirPdf(doc);
    } catch (e) {
      await avisar("No se pudo generar el PDF", e instanceof Error ? e.message : "Inténtalo de nuevo.");
    }
    setGenerandoPdf(false);
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link
          href="/admin/facturacion"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3"
        >
          <ChevronLeft />
          Facturación
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">
                Factura {clienta?.nombre ?? factura.id.slice(0, 8)}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${estadoBadge[factura.estado]}`}>
                  {factura.estado}
                </span>
                {v && abierta && (
                  <>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-500 font-medium">{visitaLabel[v.estado]}</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Entrada {hora(v?.created_at ?? factura.created_at)} · {fechaLarga(v?.created_at ?? factura.created_at)}
              {v?.recepcion && ` · abierta por ${v.recepcion.nombre}`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap print:hidden">
            <button
              onClick={() => imprimirFactura(false)}
              disabled={generandoPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <PrintIcon />
              {generandoPdf ? "Generando…" : "Imprimir"}
            </button>
            <button
              onClick={() => imprimirFactura(true)}
              disabled={generandoPdf}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              Descargar PDF
            </button>
            {abierta && (
              <button
                onClick={abrirAgregar}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors"
              >
                + Agregar productos y servicios
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">

          {/* Datos de la clienta */}
          {clienta && (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
                Datos de la clienta
              </p>

              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 shrink-0">
                    {clienta.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{clienta.nombre}</p>
                    <p className="text-xs text-zinc-400">
                      Clienta desde {new Date(clienta.created_at).toLocaleDateString("es-DO", { month: "long", year: "numeric" })} · {visitasClienta} {visitasClienta === 1 ? "visita" : "visitas"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/admin/clientas/${clienta.id}`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors whitespace-nowrap print:hidden"
                >
                  Ver perfil
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <Dato label="Teléfono" value={clienta.telefono} />
                <Dato label="Correo" value={clienta.email ?? "—"} />
                <Dato
                  label="Última visita"
                  value={ultimaVisita ? new Date(ultimaVisita).toLocaleDateString("es-DO", { day: "numeric", month: "short", year: "numeric" }) : "Primera visita"}
                />
              </div>

              {clienta.notas && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Nota de la clienta</p>
                  <p className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3">{clienta.notas}</p>
                </div>
              )}
              {v?.notas && (
                <div>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1">Nota de recepción</p>
                  <p className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-3">{v.notas}</p>
                </div>
              )}
            </div>
          )}

          {/* Datos del servicio */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Datos del servicio
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Dato label="Servicio principal" value={principal?.descripcion ?? "—"} />
              <Dato label="Estilista asignada" value={v?.estilista?.nombre ?? "Sin asignar"} />
              <Dato label="Cita" value={v?.citas ? horaCita(v.citas.hora_inicio) : "Sin cita"} />
              <Dato label="Duración estimada" value={v?.citas?.servicios ? duracion(v.citas.servicios.duracion_minutos) : "—"} />
              <Dato
                label="Depósito"
                value={Number(factura.deposito_aplicado) > 0 ? `${money(Number(factura.deposito_aplicado))} · verificado` : "Sin depósito"}
              />
              {factura.metodo_pago && <Dato label="Método de pago" value={factura.metodo_pago} className="capitalize" />}
            </div>
          </div>

          {/* Servicios y productos agregados */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-zinc-100">
              <div>
                <p className="text-sm font-semibold text-zinc-900">Servicios y productos agregados</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {lineas.length} {lineas.length === 1 ? "línea" : "líneas"} · registradas por el personal que la atendió
                </p>
              </div>
              {abierta && (
                <button
                  onClick={abrirAgregar}
                  className="px-4 py-2 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors print:hidden"
                >
                  + Agregar
                </button>
              )}
            </div>

            <div className="hidden sm:grid grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-x-4 px-5 sm:px-6 py-3 border-b border-zinc-100 bg-zinc-50/50">
              {["Concepto", "Tipo", "Agregado por", "Hora", "Cant.", "Importe"].map((h) => (
                <span key={h} className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
                  {h}
                </span>
              ))}
            </div>

            {lineas.length === 0 && <p className="px-6 py-8 text-sm text-zinc-400">Aún no hay líneas en esta factura.</p>}

            {lineas.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_2fr_1fr_1fr_1fr] gap-x-4 gap-y-1 items-center px-5 sm:px-6 py-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{item.descripcion}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {money(Number(item.precio_unitario))} c/u
                    {abierta && (
                      <button onClick={() => quitarLinea(item)} disabled={procesando} className="ml-2 text-red-500 hover:text-red-700 print:hidden">
                        Quitar
                      </button>
                    )}
                  </p>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    item.tipo === "servicio" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                  }`}>
                    {item.tipo === "servicio" ? "Servicio" : "Producto"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {(item.empleados?.nombre ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-800">{item.empleados?.nombre ?? "—"}</p>
                    <p className="text-xs text-zinc-400">{item.empleados?.roles?.nombre ?? ""}</p>
                  </div>
                </div>
                <span className="text-sm text-zinc-500 sm:block hidden">{hora(item.created_at)}</span>
                <span className="text-sm text-zinc-700 font-medium sm:block hidden">{item.cantidad}</span>
                <span className="text-sm font-semibold text-zinc-900 sm:text-right">{money(Number(item.subtotal))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:w-72 flex flex-col gap-4 shrink-0">

          {/* Resumen de cobro */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Resumen de cobro
            </p>

            <div className="space-y-2.5 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-zinc-500">Servicios ({servicios.length})</span>
                <span className="text-zinc-800 font-medium">{money(suma(servicios))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Productos ({productos.length})</span>
                <span className="text-zinc-800 font-medium">{money(suma(productos))}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-2.5">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-800 font-medium">{money(Number(factura.subtotal))}</span>
              </div>
              {(Number(factura.descuento) > 0 || editaDescuento) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-zinc-500">
                      Descuento
                      {tipoMostrado === "porcentaje" && valorMostrado > 0 ? ` (${valorMostrado}%)` : ""}
                    </span>
                    <span className={`font-semibold ${descuentoN > 0 ? "text-green-700" : "text-zinc-400"}`}>
                      {descuentoN > 0 ? "− " : ""}
                      {money(descuentoN)}
                    </span>
                  </div>
                  {abierta && puedeDescuento && (
                    <div className="flex items-center gap-2 print:hidden">
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={descValor}
                        onChange={(e) => {
                          descEditado.current = true;
                          setDescValor(e.target.value);
                        }}
                        placeholder="Escribe el descuento"
                        aria-label="Descuento"
                        className="flex-1 min-w-0 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                      />
                      <select
                        value={descTipo}
                        onChange={(e) => {
                          descEditado.current = true;
                          setDescTipo(e.target.value as "monto" | "porcentaje");
                        }}
                        aria-label="Tipo de descuento"
                        className="shrink-0 px-2 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400"
                      >
                        <option value="monto">RD$</option>
                        <option value="porcentaje">%</option>
                      </select>
                    </div>
                  )}
                  {editaDescuento && !descValido && (
                    <p className="text-xs text-red-500">
                      {descTipo === "porcentaje" ? "Escribe un porcentaje entre 0 y 100." : "Escribe un monto mayor o igual a 0."}
                    </p>
                  )}
                  {editaDescuento && descValido && (guardandoDesc || descPendiente) && <p className="text-[11px] text-zinc-400">Guardando…</p>}
                </div>
              )}
              {clienta && registroApp && (
                <p className={`text-xs rounded-lg px-3 py-2 ${registroApp.registrada ? "bg-teal-50 text-teal-700" : "bg-zinc-50 text-zinc-400"}`}>
                  {registroApp.registrada && registroApp.fecha
                    ? `Se registró en la app el ${new Date(registroApp.fecha).toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" })} · ${tiempoDeRegistro(registroApp.fecha)}`
                    : registroApp.registrada
                      ? "Registrada en la app"
                      : "No está registrada en la app"}
                </p>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Itbis {itbisPct}%</span>
                <span className="text-zinc-800 font-medium">{money(itbisN)}</span>
              </div>
              {Number(factura.deposito_aplicado) > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Depósito aplicado</span>
                  <span className="text-green-700 font-medium">− {money(Number(factura.deposito_aplicado))}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-zinc-900 text-white rounded-xl px-4 py-3 mb-3">
              <span className="text-xs font-semibold text-zinc-400">{abierta ? "Total a cobrar" : "Total"}</span>
              <span className="text-lg font-bold">{money(totalN)}</span>
            </div>

            {abierta ? (
              <>
                <button
                  onClick={cobrar}
                  disabled={procesando || lineas.length === 0 || guardandoDesc || descPendiente || (editaDescuento && !descValido)}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 disabled:opacity-50 transition-colors print:hidden"
                >
                  Cobrar {money(totalN)}
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-2 print:hidden">
                  Al cobrar se cierra la factura y se calculan las comisiones.
                </p>
                <button
                  onClick={cancelarFactura}
                  disabled={procesando}
                  className="w-full mt-3 text-xs font-semibold text-red-600 hover:text-red-800 print:hidden"
                >
                  Cancelar factura
                </button>
              </>
            ) : (
              <p className="text-xs text-zinc-400 text-center">
                {factura.estado === "cobrada" && factura.cobrada_at
                  ? `Cobrada el ${new Date(factura.cobrada_at).toLocaleDateString("es-DO", { day: "numeric", month: "short" })} a las ${hora(factura.cobrada_at)}${factura.cobrador ? ` por ${factura.cobrador.nombre}` : ""}.`
                  : "Factura cancelada."}
              </p>
            )}
          </div>

          {/* Comisiones */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              {factura.estado === "cobrada" ? "Comisiones generadas" : "Comisiones estimadas"}
            </p>

            {comisiones.length === 0 && <p className="text-xs text-zinc-400">Sin líneas todavía.</p>}
            <div className="space-y-3">
              {comisiones.map((c) => (
                <div key={c.nombre} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold text-zinc-600 shrink-0">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{c.nombre}</p>
                    <p className="text-xs text-zinc-400">
                      {c.lineas} {c.lineas === 1 ? "línea" : "líneas"} · {c.pcts.size === 1 ? `${[...c.pcts][0]}%` : "varios %"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{money(c.monto)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Método de pago */}
          {abierta && (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 print:hidden">
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
                Método de pago
              </p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {(["tarjeta", "efectivo", "transferencia", "mixto"] as MetodoPago[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetodoPago(m)}
                    className={`py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors ${
                      metodoPago === m
                        ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 accent-zinc-900"
                />
                <span className="text-sm text-zinc-600">Enviar factura por WhatsApp</span>
              </label>
            </div>
          )}

          {/* Bitácora */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Bitácora
            </p>

            <div className="space-y-2.5">
              {bitacora.map((entry, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="text-xs font-semibold text-zinc-400 shrink-0 mt-0.5">{hora(entry.at)}</span>
                  <span className="text-xs text-zinc-600">{entry.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel Agregar ── */}
      {agregando && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4 print:hidden" onClick={() => setAgregando(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-zinc-900">Agregar a la factura</p>
                <button onClick={() => setAgregando(false)} className="text-zinc-400 hover:text-zinc-700 text-sm">Cerrar</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(["servicio", "producto"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTipoAgregar(t)}
                    className={`py-2 text-sm font-semibold rounded-xl border-2 transition-colors ${
                      tipoAgregar === t ? "border-zinc-900 bg-zinc-50 text-zinc-900" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {t === "servicio" ? "Servicio" : "Producto"}
                  </button>
                ))}
              </div>
              {tipoAgregar === "servicio" && puedeAgregarAOtros && (
                <div className="mb-3">
                  <label className="text-xs font-semibold text-zinc-500 mb-1 block">¿Quién hizo el servicio? (recibe la comisión)</label>
                  <select
                    value={quienHizo || estilistaVisitaId || ""}
                    onChange={(e) => setQuienHizo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400"
                  >
                    {!estilistaVisitaId && <option value="">Yo (quien cobra)</option>}
                    {empleadosActivos.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar…"
                  className="flex-1 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400"
                />
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                  aria-label="Cantidad"
                  className="w-16 px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
            <div className="overflow-y-auto">
              {!catalogo && <p className="px-5 py-6 text-sm text-zinc-400">Cargando…</p>}
              {catalogo && lista.length === 0 && <p className="px-5 py-6 text-sm text-zinc-400">Sin resultados.</p>}
              {lista.map((c) => (
                <button
                  key={c.id}
                  onClick={() => agregar(c)}
                  disabled={procesando}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3 text-left border-b border-zinc-100 last:border-0 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shrink-0 flex items-center justify-center text-sm font-bold text-zinc-400">
                    {c.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.foto} alt={c.nombre} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      c.nombre.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-900 truncate">{c.nombre}</p>
                    {c.detalle && <p className="text-xs text-zinc-400">{c.detalle}</p>}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 shrink-0">{money(c.precio)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
