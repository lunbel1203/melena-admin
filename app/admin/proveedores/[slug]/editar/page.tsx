"use client";

import Link from "next/link";
import { use, useState } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

type SupplierBase = {
  nombre: string;
  categoria: string;
  rnc: string;
  pais: string;
  direccion: string;
  contacto: string;
  telefono: string;
  correo: string;
  moneda: string;
  formaPago: string;
  plazo: string;
  suministra: string[];
  estado: "Activo" | "Inactivo";
  nota: string;
};

const supplierBase: Record<string, SupplierBase> = {
  "hair-import-rd": {
    nombre: "Hair Import RD", categoria: "Cabello",
    rnc: "1-01-84210-3", pais: "República Dominicana",
    direccion: "Calle El Conde 48, Zona Colonial, Santo Domingo",
    contacto: "Rafael Guzmán", telefono: "809 555 7712", correo: "ventas@hairimport.do",
    moneda: "RD$", formaPago: "Transferencia", plazo: "7 a 10 días",
    suministra: ["Cabello remy", "Cabello virgin"],
    estado: "Activo",
    nota: "Pedido mínimo de 6 unidades. Avisar con una semana de anticipación para colores personalizados.",
  },
  "virgin-hair-co": {
    nombre: "Virgin Hair Co.", categoria: "Cabello",
    rnc: "N/A", pais: "Estados Unidos",
    direccion: "2850 NW 36th St, Miami, FL 33142",
    contacto: "Marie Johnson", telefono: "+1 305 555 0134", correo: "orders@virginhairco.com",
    moneda: "USD", formaPago: "Transferencia", plazo: "15 a 20 días",
    suministra: ["Cabello virgin", "Cabello remy"],
    estado: "Activo",
    nota: "Pedidos en USD. Incluye costo de envío internacional.",
  },
  "adhesivos-pro": {
    nombre: "Adhesivos Pro", categoria: "Insumos",
    rnc: "1-31-05820-1", pais: "República Dominicana",
    direccion: "Ave. Las Carreras 12, Los Jardines, Santiago",
    contacto: "Carlos Méndez", telefono: "809 555 3390", correo: "ventas@adhesivosPro.do",
    moneda: "RD$", formaPago: "Efectivo", plazo: "3 a 5 días",
    suministra: ["Cintas tape-in", "Adhesivos"],
    estado: "Activo",
    nota: "Entrega directa al salón. Llamar antes de enviar.",
  },
  "beauty-supply-dr": {
    nombre: "Beauty Supply DR", categoria: "Insumos",
    rnc: "1-01-23456-7", pais: "República Dominicana",
    direccion: "C/ Beller 34, Gazcue, Santo Domingo",
    contacto: "Lidia Castillo", telefono: "809 555 8801", correo: "info@beautysupplydr.com",
    moneda: "RD$", formaPago: "Transferencia", plazo: "1 a 3 días",
    suministra: ["Microanillos", "Shampoo"],
    estado: "Activo",
    nota: "Proveedor de confianza para insumos de mantenimiento.",
  },
  "remy-trading": {
    nombre: "Remy Trading", categoria: "Cabello",
    rnc: "N/A", pais: "Panamá",
    direccion: "Calle 50, Torre Global Bank, Panamá City",
    contacto: "José Vargas", telefono: "+507 555 2210", correo: "jvargas@remytrading.pa",
    moneda: "USD", formaPago: "Crédito 30 días", plazo: "+30 días",
    suministra: ["Cabello remy"],
    estado: "Inactivo",
    nota: "Actualmente inactivo. Último pedido en marzo 2026.",
  },
};

const suministroOptions = ["Cabello remy", "Cabello virgin", "Cintas tape-in", "Microanillos", "Shampoo", "Adhesivos", "Herramientas"];

export default function EditarProveedorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const base = supplierBase[slug];

  const [nombre,      setNombre]      = useState(base?.nombre      ?? "");
  const [categoria,   setCategoria]   = useState(base?.categoria   ?? "Cabello");
  const [rnc,         setRnc]         = useState(base?.rnc         ?? "");
  const [pais,        setPais]        = useState(base?.pais        ?? "República Dominicana");
  const [direccion,   setDireccion]   = useState(base?.direccion   ?? "");
  const [contacto,    setContacto]    = useState(base?.contacto    ?? "");
  const [telefono,    setTelefono]    = useState(base?.telefono    ?? "");
  const [correo,      setCorreo]      = useState(base?.correo      ?? "");
  const [moneda,      setMoneda]      = useState(base?.moneda      ?? "RD$");
  const [formaPago,   setFormaPago]   = useState(base?.formaPago   ?? "Transferencia");
  const [plazo,       setPlazo]       = useState(base?.plazo       ?? "7 a 10 días");
  const [suministra,  setSuministra]  = useState<string[]>(base?.suministra ?? []);
  const [estado,      setEstado]      = useState<"Activo" | "Inactivo">(base?.estado ?? "Activo");
  const [nota,        setNota]        = useState(base?.nota        ?? "");

  function toggleSuministro(item: string) {
    setSuministra((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  if (!base) {
    return (
      <div className="min-h-full bg-zinc-50 p-8">
        <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 mb-4 transition-colors">
          <ChevronLeft /> Proveedores
        </Link>
        <p className="text-sm text-zinc-500">Proveedor no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link href={`/admin/proveedores/${slug}`} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3">
          <ChevronLeft />
          {base.nombre}
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Editar proveedor</h1>
        <p className="text-sm text-zinc-400 mt-1">{base.nombre}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">

        {/* ── Left column ── */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Datos del proveedor */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Datos del proveedor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Nombre comercial
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Categoría
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 appearance-none"
                >
                  <option>Cabello</option>
                  <option>Insumos</option>
                  <option>Herramientas</option>
                  <option>Cuidado</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  RNC o identificación
                </label>
                <input
                  type="text"
                  value={rnc}
                  onChange={(e) => setRnc(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  País
                </label>
                <select
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 appearance-none"
                >
                  <option>República Dominicana</option>
                  <option>Estados Unidos</option>
                  <option>Panamá</option>
                  <option>México</option>
                  <option>Colombia</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Dirección
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Persona de contacto
                </label>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Correo
                </label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          </div>

          {/* Condiciones comerciales */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-zinc-900 mb-4">Condiciones comerciales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Moneda
                </label>
                <select
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 appearance-none"
                >
                  <option>RD$</option>
                  <option>USD</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Forma de pago
                </label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 appearance-none"
                >
                  <option>Transferencia</option>
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Crédito 30 días</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Plazo de entrega
                </label>
                <select
                  value={plazo}
                  onChange={(e) => setPlazo(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 appearance-none"
                >
                  <option>1 a 3 días</option>
                  <option>3 a 5 días</option>
                  <option>7 a 10 días</option>
                  <option>15 a 20 días</option>
                  <option>+30 días</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="lg:w-72 flex flex-col gap-4">

          {/* Qué suministra */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Qué suministra
            </p>
            <div className="flex flex-wrap gap-2">
              {suministroOptions.map((item) => {
                const selected = suministra.includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleSuministro(item)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      selected
                        ? "bg-zinc-900 text-white"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Estado */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Estado
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEstado("Activo")}
                className={`py-2 text-sm font-semibold rounded-xl transition-colors ${
                  estado === "Activo"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                Activo
              </button>
              <button
                onClick={() => setEstado("Inactivo")}
                className={`py-2 text-sm font-semibold rounded-xl transition-colors ${
                  estado === "Inactivo"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                Inactivo
              </button>
            </div>
          </div>

          {/* Nota interna */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">
              Nota interna
            </p>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/admin/proveedores/${slug}`}
              className="py-2.5 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
