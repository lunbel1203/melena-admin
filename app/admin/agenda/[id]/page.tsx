"use client";

import Link from "next/link";
import { use } from "react";

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 14L6 9l5-5" />
    </svg>
  );
}
function ImagePlaceholderIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300">
      <rect x="3" y="3" width="26" height="26" rx="3" />
      <circle cx="11" cy="11" r="3" />
      <path d="M3 22l7-7 5 5 4-4 10 10" />
    </svg>
  );
}

/* ── Types ── */
type StepStatus = "done" | "pending" | "locked";

interface Step {
  label: string;
  detail: string;
  status: StepStatus;
}

interface AppointmentDetail {
  code: string;
  createdAt: string;
  depositStatus: "Depósito por validar" | "Depósito validado" | "Sin depósito";
  service: string;
  serviceDetail: string;
  dateTime: string;
  endsAt: string;
  stylist: string;
  stylistInitial: string;
  total: string;
  depositAmount: string;
  remaining: string;
  client: string;
  clientInitial: string;
  phone: string;
  visits: number;
  lastService: string;
  note: string;
  steps: Step[];
  notices: { label: string; when: string }[];
  depositBank: string;
  depositDeclared: string;
}

/* ── Mock data ── */
const appointments: Record<string, AppointmentDetail> = {
  a1: {
    code: "C-1001", createdAt: "30 ago desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Retoque tape-in", serviceDetail: "Reposición · 1 h",
    dateTime: "Lun 31 ago · 9:00 am", endsAt: "Termina 10:00 am",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$2,100", depositAmount: "RD$1,000", remaining: "RD$1,100",
    client: "Camila Santos", clientInitial: "C",
    phone: "829 444 0011", visits: 5,
    lastService: "Retoque · ago 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",    detail: "30 ago, 7:10 pm · sitio web", status: "done" },
      { label: "Comprobante subido",    detail: "30 ago, 7:15 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                  status: "done" },
      { label: "Cita confirmada",       detail: "Aviso enviado a la clienta",  status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",   when: "Dom 30 ago, 9:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Lun 31 ago, 7:00 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "BHD · 512-xxxxx-1", depositDeclared: "RD$1,000",
  },
  a2: {
    code: "C-1002", createdAt: "29 ago desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Nano ring", serviceDetail: "Instalación · 3 h",
    dateTime: "Lun 31 ago · 1:30 pm", endsAt: "Termina 4:30 pm",
    stylist: "Sofía Luna", stylistInitial: "S",
    total: "RD$4,800", depositAmount: "RD$1,000", remaining: "RD$3,800",
    client: "Mariana Díaz", clientInitial: "M",
    phone: "849 333 0022", visits: 3,
    lastService: "Nano ring · jul 2026", note: "Cabello fino",
    steps: [
      { label: "Solicitud recibida",    detail: "29 ago, 6:00 pm · sitio web", status: "done" },
      { label: "Comprobante subido",    detail: "29 ago, 6:10 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                  status: "done" },
      { label: "Cita confirmada",       detail: "Aviso enviado a la clienta",  status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Dom 30 ago, 1:30 pm" },
      { label: "Recordatorio · dos horas antes", when: "Lun 31 ago, 11:30 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "Popular · 794-xxxxx-2", depositDeclared: "RD$1,000",
  },
  b1: {
    code: "C-1003", createdAt: "31 ago desde el sitio web",
    depositStatus: "Sin depósito",
    service: "Ponytail", serviceDetail: "Extensión · 30 min",
    dateTime: "Mar 1 sep · 10:00 am", endsAt: "Termina 10:30 am",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$1,900", depositAmount: "RD$0", remaining: "RD$1,900",
    client: "Lucía Mejía", clientInitial: "L",
    phone: "809 555 0033", visits: 1,
    lastService: "Primera visita", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",    detail: "31 ago, 9:00 am · sitio web", status: "done" },
      { label: "Comprobante subido",    detail: "Cobro en salón",              status: "done" },
      { label: "Validación del depósito", detail: "No aplica",                 status: "done" },
      { label: "Cita confirmada",       detail: "Aviso enviado a la clienta",  status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Lun 31 ago, 10:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Mar 1 sep, 8:00 am" },
      { label: "Cita confirmada",                when: "Enviado al crear" },
    ],
    depositBank: "—", depositDeclared: "RD$0",
  },
  b2: {
    code: "C-1004", createdAt: "31 ago desde la app",
    depositStatus: "Depósito validado",
    service: "Tape-in", serviceDetail: "Instalación · 1.5 h",
    dateTime: "Mar 1 sep · 3:00 pm", endsAt: "Termina 4:30 pm",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$3,200", depositAmount: "RD$1,000", remaining: "RD$2,200",
    client: "Andrea Peña", clientInitial: "A",
    phone: "849 777 0044", visits: 7,
    lastService: "Tape-in · ago 2026", note: "Prefiere cintas claras",
    steps: [
      { label: "Solicitud recibida",    detail: "31 ago, 10:00 am · app",     status: "done" },
      { label: "Comprobante subido",    detail: "31 ago, 10:05 am",           status: "done" },
      { label: "Validación del depósito", detail: "Validado",                 status: "done" },
      { label: "Cita confirmada",       detail: "Aviso enviado a la clienta", status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Lun 31 ago, 3:00 pm" },
      { label: "Recordatorio · dos horas antes", when: "Mar 1 sep, 1:00 pm" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "Scotiabank · 321-xxxxx-5", depositDeclared: "RD$1,000",
  },
  c1: {
    code: "C-2840", createdAt: "1 sep desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Nano ring", serviceDetail: "Instalación · 3 h",
    dateTime: "Mié 2 sep · 9:00 am", endsAt: "Termina 12:00 pm",
    stylist: "Sofía Luna", stylistInitial: "S",
    total: "RD$4,800", depositAmount: "RD$1,000", remaining: "RD$3,800",
    client: "Sofía Guerrero", clientInitial: "S",
    phone: "809 222 0055", visits: 2,
    lastService: "Nano ring · jun 2026", note: "Alérgica al níquel",
    steps: [
      { label: "Solicitud recibida",    detail: "1 sep, 5:00 pm · sitio web", status: "done" },
      { label: "Comprobante subido",    detail: "1 sep, 5:08 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                 status: "done" },
      { label: "Cita confirmada",       detail: "Aviso enviado a la clienta", status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Mar 1 sep, 9:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Mié 2 sep, 7:00 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "BHD · 512-xxxxx-7", depositDeclared: "RD$1,000",
  },
  c2: {
    code: "C-2841", createdAt: "1 sep desde el sitio web",
    depositStatus: "Depósito por validar",
    service: 'Tape-in 20"', serviceDetail: "Chocolate ombré · 1.5 h",
    dateTime: "Mié 2 sep · 11:00 am", endsAt: "Termina 12:30 pm",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$3,200", depositAmount: "RD$1,000", remaining: "RD$2,200",
    client: "Valentina Reyes", clientInitial: "V",
    phone: "809 555 0142", visits: 8,
    lastService: "Tape-in · jun 2026", note: "Cuero sensible",
    steps: [
      { label: "Solicitud recibida",      detail: "1 sep, 8:42 pm · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "1 sep, 8:45 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Pendiente de recepción",     status: "pending" },
      { label: "Cita confirmada",         detail: "Dispara el aviso a la clienta", status: "locked" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Mar 2 sep, 11:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Mié 3 sep, 9:00 am" },
      { label: "Cita confirmada",                when: "Al validar el depósito" },
    ],
    depositBank: "Popular · 794-xxxxx-9", depositDeclared: "RD$1,000",
  },
  c3: {
    code: "C-2842", createdAt: "1 sep desde el sitio web",
    depositStatus: "Depósito por validar",
    service: "Tape-in", serviceDetail: "Retoque · 1.5 h",
    dateTime: "Mié 2 sep · 4:30 pm", endsAt: "Termina 6:00 pm",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$3,200", depositAmount: "RD$1,000", remaining: "RD$2,200",
    client: "Lucía Ferrer", clientInitial: "L",
    phone: "829 111 0066", visits: 4,
    lastService: "Tape-in · jul 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",      detail: "1 sep, 9:00 pm · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "1 sep, 9:05 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Pendiente de recepción",     status: "pending" },
      { label: "Cita confirmada",         detail: "Dispara el aviso a la clienta", status: "locked" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Mar 1 sep, 4:30 pm" },
      { label: "Recordatorio · dos horas antes", when: "Mié 2 sep, 2:30 pm" },
      { label: "Cita confirmada",                when: "Al validar el depósito" },
    ],
    depositBank: "BHD · 512-xxxxx-3", depositDeclared: "RD$1,000",
  },
  d1: {
    code: "C-2843", createdAt: "2 sep desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Tape-in", serviceDetail: "Instalación · 1.5 h",
    dateTime: "Jue 3 sep · 9:30 am", endsAt: "Termina 11:00 am",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$3,200", depositAmount: "RD$1,000", remaining: "RD$2,200",
    client: "Paola Reyes", clientInitial: "P",
    phone: "809 888 0077", visits: 6,
    lastService: "Tape-in · ago 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",      detail: "2 sep, 10:00 am · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "2 sep, 10:10 am",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                    status: "done" },
      { label: "Cita confirmada",         detail: "Aviso enviado a la clienta",  status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Mié 2 sep, 9:30 am" },
      { label: "Recordatorio · dos horas antes", when: "Jue 3 sep, 7:30 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "Popular · 794-xxxxx-4", depositDeclared: "RD$1,000",
  },
  d2: {
    code: "C-2844", createdAt: "2 sep desde el sitio web",
    depositStatus: "Sin depósito",
    service: "Ponytail", serviceDetail: "Extensión · 30 min",
    dateTime: "Jue 3 sep · 2:00 pm", endsAt: "Termina 2:30 pm",
    stylist: "Sofía Luna", stylistInitial: "S",
    total: "RD$1,900", depositAmount: "RD$0", remaining: "RD$1,900",
    client: "Gabriela Cruz", clientInitial: "G",
    phone: "849 555 0088", visits: 2,
    lastService: "Ponytail · ago 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",      detail: "2 sep, 11:00 am · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "Cobro en salón",              status: "done" },
      { label: "Validación del depósito", detail: "No aplica",                   status: "done" },
      { label: "Cita confirmada",         detail: "Aviso enviado a la clienta",  status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Mié 2 sep, 2:00 pm" },
      { label: "Recordatorio · dos horas antes", when: "Jue 3 sep, 12:00 pm" },
      { label: "Cita confirmada",                when: "Enviado al crear" },
    ],
    depositBank: "—", depositDeclared: "RD$0",
  },
  e1: {
    code: "C-2845", createdAt: "2 sep desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Nano ring", serviceDetail: "Instalación · 3 h",
    dateTime: "Vie 4 sep · 9:00 am", endsAt: "Termina 12:00 pm",
    stylist: "Sofía Luna", stylistInitial: "S",
    total: "RD$4,800", depositAmount: "RD$1,000", remaining: "RD$3,800",
    client: "Carla Núñez", clientInitial: "C",
    phone: "809 333 0099", visits: 3,
    lastService: "Nano ring · jul 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",      detail: "2 sep, 3:00 pm · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "2 sep, 3:05 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                   status: "done" },
      { label: "Cita confirmada",         detail: "Aviso enviado a la clienta", status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Jue 3 sep, 9:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Vie 4 sep, 7:00 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "BHD · 512-xxxxx-8", depositDeclared: "RD$1,000",
  },
  f1: {
    code: "C-2846", createdAt: "2 sep desde el sitio web",
    depositStatus: "Depósito validado",
    service: "Tape-in", serviceDetail: "Instalación · 1.5 h",
    dateTime: "Sáb 5 sep · 10:00 am", endsAt: "Termina 11:30 am",
    stylist: "Mariana Ríos", stylistInitial: "M",
    total: "RD$3,200", depositAmount: "RD$1,000", remaining: "RD$2,200",
    client: "Renata Morales", clientInitial: "R",
    phone: "829 666 0100", visits: 9,
    lastService: "Tape-in · ago 2026", note: "Sin nota",
    steps: [
      { label: "Solicitud recibida",      detail: "2 sep, 4:00 pm · sitio web", status: "done" },
      { label: "Comprobante subido",      detail: "2 sep, 4:08 pm",             status: "done" },
      { label: "Validación del depósito", detail: "Validado",                   status: "done" },
      { label: "Cita confirmada",         detail: "Aviso enviado a la clienta", status: "done" },
    ],
    notices: [
      { label: "Recordatorio · un día antes",    when: "Vie 4 sep, 10:00 am" },
      { label: "Recordatorio · dos horas antes", when: "Sáb 5 sep, 8:00 am" },
      { label: "Cita confirmada",                when: "Enviado al validar" },
    ],
    depositBank: "Scotiabank · 321-xxxxx-6", depositDeclared: "RD$1,000",
  },
};

/* ── Step icon ── */
function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6l3 3 5-5" />
        </svg>
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center shrink-0">
        <div className="w-2 h-2 rounded-full bg-orange-400" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full border-2 border-zinc-200 shrink-0" />
  );
}

/* ── Section label ── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-4">
      {children}
    </p>
  );
}

/* ── Page ── */
export default function CitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const appt = appointments[id];

  if (!appt) {
    return (
      <div className="min-h-full bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-sm">Cita no encontrada</p>
          <Link href="/admin/agenda" className="text-sm font-medium text-zinc-900 underline mt-2 inline-block">
            Volver a la agenda
          </Link>
        </div>
      </div>
    );
  }

  const isPendingDeposit = appt.depositStatus === "Depósito por validar";

  return (
    <div className="min-h-full bg-zinc-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-zinc-200 px-5 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/agenda" className="text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
            <BackIcon />
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-zinc-900">Cita #{appt.code}</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Creada el {appt.createdAt}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isPendingDeposit && (
              <span className="text-sm font-medium text-orange-500 border border-orange-200 px-3 py-2 rounded-xl bg-orange-50 whitespace-nowrap">
                {appt.depositStatus}
              </span>
            )}
            <button className="text-sm font-semibold text-zinc-700 border border-zinc-200 px-4 py-2 rounded-xl hover:bg-zinc-50 transition-colors whitespace-nowrap">
              Reagendar
            </button>
            <button className="text-sm font-semibold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-zinc-700 transition-colors whitespace-nowrap">
              Confirmar cita
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-5 lg:p-7 flex flex-col lg:flex-row gap-5 max-w-[1100px] mx-auto">

        {/* ══ LEFT COLUMN ══ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">

              {/* Servicio */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Servicio</p>
                <p className="text-sm font-semibold text-zinc-900">{appt.service}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{appt.serviceDetail}</p>
              </div>

              {/* Fecha y hora */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Fecha y hora</p>
                <p className="text-sm font-semibold text-zinc-900">{appt.dateTime}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{appt.endsAt}</p>
              </div>

              {/* Estilista */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Estilista</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-600 shrink-0">
                    {appt.stylistInitial}
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{appt.stylist}</span>
                </div>
              </div>

              {/* Total */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-400 mb-1">Total</p>
                <p className="text-sm font-semibold text-zinc-900">{appt.total}</p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Depósito {appt.depositAmount} · resta {appt.remaining}
                </p>
              </div>
            </div>
          </div>

          {/* Estado de la cita */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Estado de la cita</SectionLabel>
            <div className="space-y-4">
              {appt.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <StepIcon status={step.status} />
                  <div className="min-w-0 pt-0.5">
                    <p className={`text-sm font-semibold leading-none ${
                      step.status === "pending" ? "text-orange-500" :
                      step.status === "locked"  ? "text-zinc-300"   : "text-zinc-900"
                    }`}>
                      {step.label}
                    </p>
                    <p className={`text-xs mt-1 ${
                      step.status === "locked" ? "text-zinc-300" : "text-zinc-400"
                    }`}>
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Avisos programados */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Avisos programados</SectionLabel>
            <div className="space-y-3">
              {appt.notices.map((n, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-zinc-700">{n.label}</span>
                  <span className="text-xs text-zinc-400 text-right whitespace-nowrap">{n.when}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div className="lg:w-[320px] shrink-0 space-y-4">

          {/* Client card */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-zinc-200 flex items-center justify-center text-base font-bold text-zinc-600 shrink-0">
                {appt.clientInitial}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-zinc-900">{appt.client}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{appt.phone} · {appt.visits} visitas</p>
              </div>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">Último servicio</span>
                <span className="text-xs font-medium text-zinc-700 text-right">{appt.lastService}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">Nota</span>
                <span className="text-xs font-medium text-zinc-700 text-right">{appt.note}</span>
              </div>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
              Ver perfil completo
            </button>
          </div>

          {/* Comprobante */}
          <div className="bg-white rounded-2xl border border-zinc-200 p-5">
            <SectionLabel>Comprobante del depósito</SectionLabel>

            {/* Upload area */}
            <div className="border-2 border-dashed border-zinc-200 rounded-xl py-8 flex flex-col items-center gap-2 mb-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer">
              <ImagePlaceholderIcon />
              <p className="text-sm text-zinc-500 font-medium mt-1">Comprobante de transferencia</p>
              <p className="text-xs text-zinc-400">or browse files</p>
            </div>

            {/* Meta */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">Monto declarado</span>
                <span className="text-xs font-bold text-zinc-900">{appt.depositDeclared}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-zinc-400">Banco</span>
                <span className="text-xs font-medium text-zinc-700 text-right">{appt.depositBank}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5">
              <button className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors">
                Rechazar
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 transition-colors">
                Validar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
