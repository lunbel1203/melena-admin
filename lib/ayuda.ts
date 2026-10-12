// Manual de ayuda del panel, organizado por rol.
// Los nombres de rol son los de Seguridad: si se crea un rol nuevo, quien lo tenga ve los temas generales
// y puede abrir "Todo el manual".

export const ROLES = ["Admin", "Cajera", "Asesora Capilar", "Gestora de citas", "Taller de costura", "Shamponier", "Sala de postura"] as const;
export type Rol = (typeof ROLES)[number];

export type Bloque = { titulo?: string; pasos?: string[]; notas?: string[] };
export type Tema = {
  id: string;
  titulo: string;
  resumen: string;
  /** Roles a los que se les muestra (vacío o ausente = todos) */
  roles?: Rol[];
  bloques: Bloque[];
};

export const GUIA_ROLES: Record<Rol, { descripcion: string; tareas: string[] }> = {
  Admin: {
    descripcion: "Acceso total al panel y a la app: ves y configuras todo el salón.",
    tareas: [
      "Crear al personal, asignar roles y permisos (Seguridad).",
      "Revisar quién hizo qué en la Bitácora.",
      "Mantener el catálogo, la página web, la imagen de la app y la configuración.",
      "Revisar reportes: ventas, comisiones, descuentos y productos.",
      "Activar las cuentas de las clientas que piden entrar a la app.",
    ],
  },
  Cajera: {
    descripcion: "Caja y recepción: cobras, validas depósitos y manejas la agenda y las clientas.",
    tareas: [
      "Dar la llegada a la clienta y cobrar su factura.",
      "Agregar a la factura el servicio que alguien olvidó, a nombre de quien lo hizo.",
      "Aplicar descuentos (si tu rol tiene el permiso).",
      "Validar los comprobantes de depósito y confirmar las citas.",
      "Activar la cuenta de la app de las clientas que la solicitan.",
    ],
  },
  "Asesora Capilar": {
    descripcion: "Asesoras y vendes: consultas la agenda, las clientas y el catálogo, y agregas productos a la factura.",
    tareas: [
      "Buscar clientas y crear su ficha.",
      "Consultar el catálogo: colores, largos y precios.",
      "Agregar los productos que vendes a la factura de la clienta.",
      "Ver la agenda del día.",
    ],
  },
  "Gestora de citas": {
    descripcion: "Gestionas la agenda: creas, confirmas, reagendas y cancelas citas, y validas depósitos.",
    tareas: [
      "Crear y mover citas; enviar recordatorios y avisos por WhatsApp.",
      "Validar los comprobantes de depósito.",
      "Crear y editar clientas; activar sus cuentas de la app.",
      "Marcar la llegada de la clienta cuando llega al salón.",
    ],
  },
  "Taller de costura": {
    descripcion: "Trabajas en el taller: registras en la factura los servicios que haces y ves tu comisión del día en la app.",
    tareas: [
      "En la app: Salón → la clienta → Agregar, y eliges tu servicio (producción a máquina, costura, clips…).",
      "Ver en Ingresos cuánto llevas hoy en comisión.",
    ],
  },
  Shamponier: {
    descripcion: "Lavas el cabello y las extensiones: registras tu servicio en la factura de la clienta y ves tu comisión del día.",
    tareas: [
      "En la app: Salón → la clienta → Agregar, y eliges tu servicio.",
      "Ver en Ingresos cuánto llevas hoy en comisión.",
    ],
  },
  "Sala de postura": {
    descripcion: "Instalas y das mantenimiento a las extensiones: atiendes a tus clientas y registras tus servicios.",
    tareas: [
      "Ver tu agenda y tus clientas del día.",
      "Atender a la clienta que llegó y agregar tus servicios a su factura.",
      "Marcar tus días y horas no disponibles (Perfil → Mi disponibilidad en la app).",
      "Ver tu comisión del día en Ingresos.",
    ],
  },
};

const CAJA: Rol[] = ["Admin", "Cajera"];
const AGENDA: Rol[] = ["Admin", "Cajera", "Gestora de citas"];

export const TEMAS: Tema[] = [
  {
    id: "primeros-pasos",
    titulo: "Primeros pasos",
    resumen: "Cómo entrar, qué ves en el menú y cómo cerrar sesión.",
    bloques: [
      {
        titulo: "Entrar al panel",
        pasos: [
          "Abre admin.melenahumanhair.com.",
          "Escribe tu correo y tu contraseña (los que te dio el administrador) y pulsa “Entrar al panel”.",
          "Si no recuerdas tu contraseña, usa “¿Olvidaste tu contraseña?” en esa misma pantalla.",
        ],
        notas: [
          "El menú de la izquierda solo muestra los módulos que tu rol permite. Si necesitas otro, pídeselo al administrador (Seguridad).",
          "Tu nombre y tus roles aparecen abajo a la izquierda; ahí también entras a tu Perfil.",
        ],
      },
      {
        titulo: "Panel y app: una sola cuenta",
        notas: [
          "El mismo usuario sirve para el panel y para la app del personal, según lo que permita tu rol.",
          "Si tu rol no incluye el panel, al intentar entrar verás un aviso de “sin acceso”: usa la app del teléfono.",
        ],
      },
    ],
  },
  {
    id: "agenda",
    titulo: "Agenda y citas",
    resumen: "Ver, crear, confirmar, mover y cancelar citas.",
    roles: [...AGENDA, "Asesora Capilar", "Sala de postura"],
    bloques: [
      {
        titulo: "Ver la agenda",
        pasos: ["Entra a Agenda.", "Cambia entre día y semana, y filtra por estilista si lo necesitas.", "Pulsa una cita para abrir su detalle."],
        notas: ["Las citas con depósito pendiente aparecen como “Depósito pendiente” hasta que se valida el comprobante."],
      },
      {
        titulo: "Crear una cita",
        pasos: [
          "En Agenda pulsa “Nueva cita”.",
          "Elige la clienta (o crea una nueva con nombre y teléfono).",
          "Elige el servicio. Si el servicio pide gramos (método suizo, postura o mantenimiento de tape), escribe cuántos: el sistema muestra los paquetes de 100 g.",
          "Elige la estilista: solo salen las que ofrecen ese servicio.",
          "Elige el día y una hora libre.",
          "Elige cómo se paga: “Se paga en el salón” confirma la cita de inmediato; con depósito, sube el comprobante y la cita queda pendiente hasta validarlo.",
          "Pulsa crear.",
        ],
        notas: ["Los servicios que no se agendan (los de taller, por ejemplo) no tienen cita: se agregan a la factura cuando la clienta ya está en el salón."],
      },
      {
        titulo: "Gestionar una cita",
        pasos: [
          "Abre la cita desde la agenda.",
          "Confirmar: cuando el depósito está validado o se paga en el salón.",
          "Reagendar: elige otra fecha y hora libres.",
          "Cancelar o eliminar: la cita libera el horario. Cancelar deja constancia; eliminar la borra.",
          "WhatsApp / Notificar por WhatsApp: abre el mensaje listo para enviar a la clienta (se edita en Configuración → Mensajes).",
          "Enviar recordatorio: avisa a la clienta dentro de la app y por WhatsApp.",
        ],
      },
      {
        titulo: "Cuando la clienta llega",
        pasos: ["Abre su cita de hoy y pulsa “Marcar llegada”.", "Pasa a la lista de espera del salón y se abre su factura.", "Desde ahí pulsa “Llegó · Ver en facturación”."],
      },
    ],
  },
  {
    id: "depositos",
    titulo: "Validar depósitos",
    resumen: "Revisar el comprobante y confirmar o rechazar la cita.",
    roles: AGENDA,
    bloques: [
      {
        pasos: [
          "Entra a Depósitos y abre la pestaña “Pendientes”.",
          "Abre el comprobante (foto o PDF) y compara el monto con lo declarado.",
          "Si está bien, pulsa “Confirmar cita”: la clienta recibe el aviso y se programan sus recordatorios.",
          "Si no se puede validar, pulsa “Rechazar”: la cita se cancela, el horario queda libre y la clienta recibe un aviso.",
        ],
        notas: ["Todo queda en la Bitácora: quién validó o rechazó cada depósito."],
      },
    ],
  },
  {
    id: "clientas",
    titulo: "Clientas",
    resumen: "Buscar, crear y editar fichas; invitar a la app.",
    roles: [...AGENDA, "Asesora Capilar", "Sala de postura", "Taller de costura", "Shamponier"],
    bloques: [
      {
        titulo: "Buscar y ver una clienta",
        pasos: ["Entra a Clientas y escribe su nombre o teléfono en el buscador.", "Abre su ficha para ver visitas, citas, notas e historial."],
      },
      {
        titulo: "Crear o editar",
        pasos: ["Pulsa “+ Nueva clienta” y llena nombre y teléfono (el correo es necesario para darle cuenta en la app).", "Para cambiar datos, abre la ficha y pulsa Editar."],
        notas: ["Crear, editar y eliminar dependen de los permisos de tu rol."],
      },
    ],
  },
  {
    id: "solicitudes-cuenta",
    titulo: "Solicitudes de cuenta de la app",
    resumen: "Validar que quien pide la cuenta sea clienta y activarla.",
    roles: AGENDA,
    bloques: [
      {
        titulo: "Cómo funciona",
        notas: [
          "Quien descarga la app y toca “Crear cuenta” deja su nombre, teléfono y correo. Esa solicitud llega a Clientas → Solicitudes de cuenta (con un globito rojo en el menú).",
          "El sistema busca por teléfono o correo si ya es clienta del salón.",
        ],
      },
      {
        titulo: "Activar una cuenta",
        pasos: [
          "Entra a Clientas → Solicitudes de cuenta.",
          "Si dice “Es clienta”, revisa sus visitas y pulsa “Activar cuenta”.",
          "Si el correo es distinto al de su ficha, elige cuál usar.",
          "Aparece el usuario y una contraseña temporal: pulsa “Enviar por WhatsApp”. Esos datos no se vuelven a mostrar.",
          "La clienta entra a la app y elige su propia contraseña.",
        ],
      },
      {
        titulo: "Si no aparece como clienta",
        pasos: [
          "Pulsa “Buscar clienta” y búscala por nombre o teléfono: si ya es clienta pero dejó otro dato, vincúlala y actívala.",
          "Si no es clienta, pulsa “Rechazar”: no se crea ninguna cuenta y la persona no recibe aviso.",
        ],
      },
    ],
  },
  {
    id: "facturacion-cobro",
    titulo: "Facturación y cobro",
    resumen: "De la llegada de la clienta al cobro, con descuento y PDF.",
    roles: [...CAJA, "Asesora Capilar", "Sala de postura", "Taller de costura", "Shamponier"],
    bloques: [
      {
        titulo: "El recorrido de una clienta",
        pasos: [
          "Llega y se marca su llegada (agenda o Facturación → check-in): queda “en espera”.",
          "La estilista la atiende y registra sus servicios en la app.",
          "Al terminar pasa a “Por cobrar”.",
          "Caja abre la factura, revisa, aplica el descuento si corresponde y cobra.",
        ],
      },
      {
        titulo: "Agregar servicios o productos",
        pasos: [
          "Abre la factura y pulsa “+ Agregar productos y servicios”.",
          "Elige Servicio o Producto, busca y toca el artículo (puedes poner la cantidad antes).",
        ],
        notas: [
          "Si agregas el mismo artículo otra vez (misma persona y mismo precio), no se crea otra línea: se suma la cantidad.",
          "Cada empleada solo ve los servicios que ella ofrece. Caja (con el permiso “Agregar servicios a nombre de otra persona”) ve todos.",
        ],
      },
      {
        titulo: "Si a alguien se le olvidó su servicio (caja)",
        pasos: [
          "Pulsa “+ Agregar productos y servicios” → Servicio.",
          "En “¿Quién hizo el servicio?” elige a la persona (por defecto sale la estilista de la visita).",
          "Toca el servicio. La línea y la comisión quedan a nombre de esa persona.",
        ],
      },
      {
        titulo: "Descuento",
        pasos: [
          "En el resumen de cobro escribe el descuento en el campo y elige RD$ o %.",
          "Se actualiza al instante: se resta antes del ITBIS y cambia el total a cobrar.",
        ],
        notas: [
          "Solo los roles con el permiso “Aplicar descuentos en la factura” ven el campo.",
          "Debajo del descuento verás si la clienta está registrada en la app y cuántos días lleva registrada.",
          "El descuento no reduce las comisiones: se calculan sobre cada servicio.",
          "Cada descuento queda en la Bitácora.",
        ],
      },
      {
        titulo: "Cobrar, imprimir y cancelar",
        pasos: [
          "Elige el método de pago (tarjeta, efectivo, transferencia o mixto) y pulsa “Cobrar”.",
          "Después puedes “Imprimir” o “Descargar PDF”.",
          "“Quitar” elimina una línea de una factura abierta; “Cancelar factura” cierra la visita sin cobro.",
        ],
        notas: ["Si la clienta pagó un depósito validado, se descuenta del total automáticamente."],
      },
    ],
  },
  {
    id: "personal",
    titulo: "Personal, roles y comisiones",
    resumen: "Crear empleadas, asignar varios roles y entregar su acceso.",
    roles: ["Admin"],
    bloques: [
      {
        titulo: "Agregar a una empleada",
        pasos: [
          "Entra a Personal y pulsa “+ Nueva”.",
          "Escribe nombre, teléfono, correo y puesto.",
          "Marca sus roles: puede tener varios (por ejemplo Cajera y Asesora Capilar). El primero que marcas es el principal.",
          "Escribe su comisión solo si es distinta a la de su rol.",
          "Marca los servicios que realiza (así solo esos le salen al registrar).",
          "Guarda.",
        ],
      },
      {
        titulo: "Darle acceso",
        pasos: [
          "Abre su ficha y crea su cuenta (usuario y contraseña temporal).",
          "Envíale los datos por WhatsApp: los roles definen si entra a la app, al panel o a ambos.",
        ],
        notas: ["En el listado, la columna “Acceso” te dice quién ya tiene cuenta y a qué plataformas entra."],
      },
      {
        titulo: "Ver su desempeño",
        notas: ["En su ficha ves los servicios y lo facturado del mes y su comisión total acumulada hasta hoy. En la app, ella solo ve su comisión del día."],
      },
    ],
  },
  {
    id: "catalogo",
    titulo: "Catálogo: productos y servicios",
    resumen: "Precios, fotos, colores, categorías y quién ofrece cada servicio.",
    roles: ["Admin", "Asesora Capilar"],
    bloques: [
      {
        titulo: "Servicios",
        pasos: [
          "Catálogo → pestaña Servicios → “+ Nuevo servicio”.",
          "Escribe nombre, descripción, categoría (Instalación, Express, Mantenimiento o Taller de costura), duración y precio.",
          "Define el depósito (o marca “sin depósito”).",
          "Activa “Pedir gramos al agendar” si la clienta debe indicar cuántos gramos se pone.",
          "Apaga “Mostrar en la web y en la app” si el servicio solo se hace en el salón, sin cita.",
          "Marca quién lo ofrece (esto filtra lo que ve cada empleada al facturar).",
        ],
        notas: ["Usa los filtros (categoría, duración, depósito, visibilidad, quién lo ofrece) para encontrar servicios sin dueña o solo de salón."],
      },
      {
        titulo: "Productos y cabello",
        pasos: [
          "Pestaña Productos → “+ Nuevo producto”.",
          "Elige la categoría. Si es cabello, elige tipo, color y los largos: se crea un producto por cada largo.",
          "Escribe precio, costo, existencias y mínimo; sube la foto.",
        ],
      },
      {
        titulo: "Colores con foto",
        pasos: [
          "Configuración → Inventario → abre la ficha de la línea de cabello.",
          "En “Colores y fotos” agrega un color y sube su foto.",
          "Crea los productos de ese color en Catálogo (así tienen largos y precios).",
        ],
        notas: ["En la web y en la app, al elegir un color la foto principal cambia a la de ese color."],
      },
    ],
  },
  {
    id: "reportes",
    titulo: "Reportes",
    resumen: "Ventas, comisiones, descuentos y productos más vendidos.",
    roles: ["Admin"],
    bloques: [
      {
        pasos: [
          "Entra a Reportes y elige Día, Semana o Mes.",
          "Revisa lo facturado, los servicios, el ticket promedio y las comisiones, comparados con el período anterior.",
          "Más abajo: servicios más solicitados, ingreso por estilista, origen de las citas, descuentos otorgados, productos más vendidos y comisiones por empleada.",
          "“Exportar” descarga el período en un archivo para Excel.",
        ],
      },
    ],
  },
  {
    id: "pagina-web",
    titulo: "Página web",
    resumen: "Cambiar los textos y fotos del sitio sin pedir ayuda.",
    roles: ["Admin"],
    bloques: [
      {
        pasos: [
          "Entra a Página web y elige la sección: Inicio, Antes y después, Testimonios, Servicios y catálogo, Contacto y horarios, Marca y menú, o Footer y buscadores.",
          "Edita el texto o sube la foto y pulsa “Guardar cambios” de esa tarjeta.",
          "Revisa el sitio en melenahumanhair.com.",
        ],
        notas: ["Los productos y servicios que se ven en la web salen de Catálogo, no de aquí."],
      },
    ],
  },
  {
    id: "app-movil",
    titulo: "App móvil: imagen de bienvenida",
    resumen: "Cambiar la foto de la pantalla principal de la app.",
    roles: ["Admin"],
    bloques: [
      {
        pasos: [
          "Entra a App móvil.",
          "Pulsa “Subir foto” y elige la imagen (cualquier tamaño, JPG, PNG o WebP).",
          "En el visor arrastra la foto para encuadrarla y usa “Acercar”.",
          "Pulsa “Guardar cambios”: el panel la recorta a 1170 × 1350 px y la comprime a menos de 350 KB.",
        ],
        notas: ["Mientras más grande sea la foto original, más nítida se verá. Recarga la app para ver el cambio."],
      },
    ],
  },
  {
    id: "configuracion",
    titulo: "Configuración",
    resumen: "Datos del negocio, horarios, depósitos, impuestos, comisiones y mensajes.",
    roles: ["Admin"],
    bloques: [
      {
        titulo: "Secciones",
        notas: [
          "Negocio: nombre, teléfono, dirección, redes.",
          "Horario: días y horas de atención.",
          "Depósitos: monto, plazo y cuentas bancarias que ve la clienta.",
          "Facturación: RNC, razón social, porcentaje de ITBIS y el pie de la factura.",
          "Comisiones: porcentaje por defecto de cada rol (en servicios y productos).",
          "Recordatorios y Mensajes: cuándo avisar a las clientas y el texto de cada mensaje de WhatsApp.",
          "Seguimiento: los avisos posteriores a cada servicio.",
          "Inventario: categorías de productos, ficha web de cada línea de cabello y sus colores.",
        ],
      },
    ],
  },
  {
    id: "seguridad",
    titulo: "Seguridad: roles y permisos",
    resumen: "Decidir qué puede hacer cada rol.",
    roles: ["Admin"],
    bloques: [
      {
        pasos: [
          "Entra a Seguridad: cada columna es un rol y cada fila un permiso, agrupados por módulo.",
          "Marca o desmarca los permisos y pulsa Guardar.",
          "Para un rol nuevo usa “Nuevo rol”.",
        ],
        notas: [
          "Admin tiene todo siempre.",
          "Permisos especiales de Facturación: “Agregar servicios a nombre de otra persona” y “Aplicar descuentos en la factura”.",
          "“Acceso al panel” y “Acceso a la app” definen dónde puede entrar cada rol.",
          "Una empleada con varios roles tiene la suma de los permisos de todos.",
        ],
      },
    ],
  },
  {
    id: "bitacora",
    titulo: "Bitácora",
    resumen: "Quién hizo qué, con fecha y hora.",
    roles: ["Admin"],
    bloques: [
      {
        pasos: [
          "Entra a Bitácora (debajo de Seguridad).",
          "Elige el período, el tipo de movimiento o la persona, o busca una palabra.",
          "Pulsa “Ver más” para cargar movimientos anteriores.",
        ],
        notas: ["Registra accesos, cobros, descuentos, líneas quitadas, cambios de personal, roles y permisos, depósitos, citas, cuentas de clientas y cambios de precio. No se puede editar ni borrar."],
      },
    ],
  },
  {
    id: "problemas",
    titulo: "Si algo no funciona",
    resumen: "Soluciones rápidas a los problemas más comunes.",
    bloques: [
      {
        notas: [
          "No ves un módulo: tu rol no lo incluye. Pídele al administrador el permiso en Seguridad.",
          "Un dato no se actualiza: recarga la página (Cmd/Ctrl + Shift + R).",
          "“No tienes permiso…”: esa acción necesita un permiso que tu rol no tiene.",
          "No puedes entrar: usa “¿Olvidaste tu contraseña?” o pide al administrador que restablezca tu acceso.",
          "Una factura no deja cobrar: revisa que tenga líneas y, si usas descuento, espera a que termine de guardarse.",
        ],
      },
    ],
  },
];

/** Temas que le tocan a un conjunto de roles (los temas sin lista de roles son para todos). */
export function temasParaRoles(roles: string[], todos: boolean): Tema[] {
  if (todos) return TEMAS;
  return TEMAS.filter((t) => !t.roles || t.roles.length === 0 || t.roles.some((r) => roles.includes(r)));
}
