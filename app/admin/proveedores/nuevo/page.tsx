"use client";

import Link from "next/link";
import { useState } from "react";

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 4L6 8l4 4" />
    </svg>
  );
}

const suministroOptions = ["Cabello remy", "Cabello virgin", "Cintas tape-in", "Microanillos", "Shampoo", "Adhesivos", "Herramientas"];

export default function NuevoProveedorPage() {
  const [nombre,      setNombre]      = useState("");
  const [categoria,   setCategoria]   = useState("Cabello");
  const [rnc,         setRnc]         = useState("");
  const [pais,        setPais]        = useState("República Dominicana");
  const [direccion,   setDireccion]   = useState("");
  const [contacto,    setContacto]    = useState("");
  const [telefono,    setTelefono]    = useState("");
  const [correo,      setCorreo]      = useState("");
  const [moneda,      setMoneda]      = useState("RD$");
  const [formaPago,   setFormaPago]   = useState("Transferencia");
  const [plazo,       setPlazo]       = useState("7 a 10 días");
  const [suministra,  setSuministra]  = useState<string[]>([]);
  const [estado,      setEstado]      = useState<"Activo" | "Inactivo">("Activo");
  const [nota,        setNota]        = useState("");

  function toggleSuministro(item: string) {
    setSuministra((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  return (
    <div className="min-h-full bg-zinc-50 p-5 sm:p-7 lg:p-8">

      {/* ── Header ── */}
      <div className="mb-6">
        <Link href="/admin/proveedores" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors mb-3">
          <ChevronLeft />
          Nuevo proveedor
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900">Nuevo proveedor</h1>
        <p className="text-sm text-zinc-400 mt-1">Queda disponible al registrar entradas de inventario.</p>
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
                  placeholder="Ej. Hair Import RD"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
                  placeholder="1-01-00000-0"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
                  placeholder="Calle, número, sector, ciudad"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
                  placeholder="Nombre y apellido"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
                  placeholder="809 000 0000"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
                  placeholder="contacto@proveedor.com"
                  className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
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
              placeholder="Ej. pedidos mínimos de 10 unidades..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/admin/proveedores"
              className="py-2.5 text-sm font-semibold text-zinc-600 bg-white border border-zinc-200 rounded-xl text-center hover:bg-zinc-50 transition-colors"
            >
              Cancelar
            </Link>
            <button className="py-2.5 text-sm font-semibold text-white bg-zinc-900 rounded-xl hover:bg-zinc-700 transition-colors">
              Guardar proveedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
