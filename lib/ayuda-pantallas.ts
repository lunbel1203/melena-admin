// Ayuda contextual: qué es cada pantalla y cómo se usa. Se abre con el botón "Ayuda" de la cabecera.
// El manual completo (por rol) está en lib/ayuda.ts; aquí cada pantalla explica solo lo suyo.
// Para una pantalla nueva: agrega una entrada en PANTALLAS con la ruta (sin /admin) como expresión regular.

import type { Bloque } from "@/lib/ayuda";

export type AyudaPantalla = {
  /** Nombre de la pantalla, tal como se ve en el menú */
  titulo: string;
  /** Una o dos frases: para qué sirve esta pantalla */
  resumen: string;
  bloques: Bloque[];
};

const ID = "[^/]+";

const PANTALLAS: [RegExp, AyudaPantalla][] = [
  // ───────────── Resumen ─────────────
  [
    /^resumen$/,
    {
      titulo: "Resumen",
      resumen: "Una vista rápida de cómo va el salón hoy.",
      bloques: [
        {
          titulo: "Qué ves",
          notas: [
            "En el salón ahora: las clientas que ya llegaron y en qué estado están (en espera, en curso o por cobrar).",
            "Requiere acción: lo que está pendiente de atender. Si dice “Todo al día”, no hay nada urgente.",
            "Los indicadores del día y de las clientas con visita en los últimos 90 días.",
          ],
        },
        { titulo: "Cómo usarlo", pasos: ["Revísalo al empezar el día.", "Toca una clienta o un aviso para ir directo a su cita o a su factura.", "Para ver más detalle, usa Agenda, Facturación o Reportes."] },
      ],
    },
  ],

  // ───────────── Agenda ─────────────
  [
    /^agenda$/,
    {
      titulo: "Agenda",
      resumen: "Las citas del día por estilista.",
      bloques: [
        {
          titulo: "Ver la agenda",
          pasos: [
            "Usa las flechas para cambiar de día y mira las citas de cada estilista en su columna.",
            "Pulsa una cita para abrir su detalle.",
            "Las citas con depósito pendiente aparecen como “Depósito pendiente” hasta que se valida el comprobante.",
          ],
          notas: ["Si el día está bloqueado o el salón cierra, la agenda lo indica y no se ofrecen horarios."],
        },
        { titulo: "Crear una cita", pasos: ["Pulsa “Nueva cita” y sigue los pasos: clienta, servicio, estilista, fecha y hora, y depósito."] },
      ],
    },
  ],
  [
    /^agenda\/nueva$/,
    {
      titulo: "Nueva cita",
      resumen: "Reserva una cita para una clienta en cinco pasos.",
      bloques: [
        {
          pasos: [
            "1 · Clienta: búscala por nombre o teléfono. Si no existe, escribe su nombre y teléfono para crearla.",
            "2 · Servicio: elige el servicio. Si pide gramos (método suizo, postura o mantenimiento de tape), escribe cuántos.",
            "3 · Personal disponible: elige la estilista; solo salen las que ofrecen ese servicio.",
            "4 · Fecha y hora: elige un horario libre de esa estilista.",
            "5 · Depósito de reserva: si la cita se paga en el salón se confirma de inmediato; si lleva depósito, adjunta el comprobante y quedará pendiente hasta validarlo.",
            "Escribe una nota para la estilista si hace falta (por ejemplo, cuero sensible) y pulsa “Crear cita”.",
          ],
          notas: [
            "Si el horario ya lo tomaron mientras tanto, el sistema te avisa y debes elegir otro.",
            "Si el teléfono ya existe, el sistema te avisa para que uses la ficha que ya está creada.",
          ],
        },
      ],
    },
  ],
  [
    new RegExp(`^agenda/${ID}$`),
    {
      titulo: "Detalle de la cita",
      resumen: "Todo sobre una cita: su estado, el depósito y lo que puedes hacer con ella.",
      bloques: [
        {
          titulo: "Qué puedes hacer",
          pasos: [
            "Marcar llegada: cuando la clienta llega. Pasa a la lista de espera y se abre su factura (la cita necesita una estilista asignada).",
            "Reagendar: elige una nueva fecha y hora libres.",
            "Cancelar cita: libera el horario y la acción no se puede deshacer.",
            "Enviar recordatorio a la app: avisa a la clienta dentro de la app. Si no usa la app, envíaselo por WhatsApp.",
            "Notificar por WhatsApp: abre el mensaje listo para enviar (se edita en Configuración → Mensajes).",
          ],
        },
        {
          titulo: "Depósito",
          pasos: ["Abre el comprobante para revisarlo.", "Si está correcto, confirma la cita; si no, recházalo y la cita se cancela."],
          notas: ["Abajo ves la línea de tiempo de la cita y los avisos programados (un día y dos horas antes)."],
        },
      ],
    },
  ],

  // ───────────── Depósitos ─────────────
  [
    /^depositos$/,
    {
      titulo: "Depósitos",
      resumen: "Revisa los comprobantes de depósito y confirma o rechaza las citas.",
      bloques: [
        {
          pasos: [
            "Abre la pestaña “Pendientes”.",
            "Abre el comprobante (foto o PDF) y compara el monto con lo declarado.",
            "Si está bien, pulsa “Confirmar cita”: la clienta recibe el aviso y se programan sus recordatorios.",
            "Si no se puede validar, pulsa “Rechazar”: la cita se cancela, el horario queda libre y la clienta recibe un aviso.",
          ],
          notas: ["En los rechazados puedes avisar a la clienta por WhatsApp. Todo queda en la Bitácora: quién validó o rechazó cada depósito."],
        },
      ],
    },
  ],

  // ───────────── Clientas ─────────────
  [
    /^clientas$/,
    {
      titulo: "Clientas",
      resumen: "El directorio de clientas del salón.",
      bloques: [
        {
          pasos: [
            "Escribe el nombre o el teléfono en el buscador.",
            "Abre su ficha para ver visitas, citas, notas e historial.",
            "Pulsa “Nueva clienta” para crear una ficha.",
          ],
          notas: ["Quien pide cuenta en la app llega a “Solicitudes de cuenta”, con un globito rojo en el menú."],
        },
      ],
    },
  ],
  [
    /^clientas\/nueva$/,
    {
      titulo: "Nueva clienta",
      resumen: "Crea la ficha de una clienta.",
      bloques: [
        {
          pasos: [
            "Escribe nombre completo y teléfono.",
            "Agrega su correo si va a tener cuenta en la app: lo necesita para entrar.",
            "Escribe una nota interna si hace falta (alergias, preferencias, referencias de color).",
            "Revisa el resumen y guarda.",
          ],
        },
      ],
    },
  ],
  [
    /^clientas\/solicitudes$/,
    {
      titulo: "Solicitudes de cuenta",
      resumen: "Valida que quien pide cuenta en la app sea clienta del salón y actívala.",
      bloques: [
        {
          pasos: [
            "Abre una solicitud. Si dice “Es clienta”, revisa sus visitas y pulsa “Activar cuenta”.",
            "Si el correo es distinto al de su ficha, elige cuál usar.",
            "Verás el usuario y una contraseña temporal: pulsa “Enviar por WhatsApp”. Esos datos no se vuelven a mostrar.",
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
  ],
  [
    new RegExp(`^clientas/${ID}/editar$`),
    {
      titulo: "Editar clienta",
      resumen: "Cambia los datos de la ficha de una clienta.",
      bloques: [{ pasos: ["Corrige nombre, teléfono, correo o la nota interna.", "Pulsa guardar para aplicar los cambios."], notas: ["Editar y eliminar clientas depende de los permisos de tu rol."] }],
    },
  ],
  [
    new RegExp(`^clientas/${ID}$`),
    {
      titulo: "Ficha de la clienta",
      resumen: "Su historial con el salón.",
      bloques: [
        {
          notas: [
            "Arriba: visitas, total facturado, ticket promedio y próxima cita.",
            "Historial de citas: fecha, servicio, estilista y estado de cada una.",
            "Molestias reportadas: lo que la clienta comunicó después de un servicio.",
            "Datos de contacto: teléfono, correo y nacimiento.",
          ],
        },
        { titulo: "Cambiar sus datos", pasos: ["Pulsa Editar, cambia lo que necesites y guarda."] },
      ],
    },
  ],

  // ───────────── Facturación ─────────────
  [
    /^facturacion$/,
    {
      titulo: "Facturación",
      resumen: "El salón en vivo: quién espera, quién está en atención y quién falta por cobrar.",
      bloques: [
        {
          titulo: "El recorrido de una clienta",
          pasos: [
            "Llega y se marca su llegada (desde la agenda o con “Dar entrada a una clienta”): queda “En espera”.",
            "La estilista la atiende y registra sus servicios. Con “Iniciar atención” pasa a “En atención”.",
            "Al terminar, “Terminar servicio” la pasa a “Por cobrar”.",
            "Abre su factura, revisa, aplica el descuento si corresponde y cobra.",
          ],
        },
        {
          notas: [
            "Arriba ves los totales del día: en espera, en atención, por cobrar y facturado hoy.",
            "La pestaña “Cerradas hoy” muestra las facturas ya cobradas.",
            "Si una visita dice “Falta asignar estilista y servicio”, asígnalos para poder abrir su factura.",
          ],
        },
      ],
    },
  ],
  [
    /^facturacion\/check-in$/,
    {
      titulo: "Check-in de clienta",
      resumen: "Da entrada a una clienta que llegó, con o sin cita.",
      bloques: [
        {
          pasos: [
            "Busca a la clienta por nombre o teléfono. Si es su primera vez, crea su perfil primero.",
            "Elige el servicio.",
            "Elige la estilista (se ve si está libre ahora u ocupada).",
            "Revisa el resumen: duración estimada, total estimado y depósito previo.",
            "Escribe una nota de recepción si hace falta (por ejemplo, cuero sensible) y pulsa “Dar entrada”.",
          ],
          notas: [
            "Al confirmar se abre su factura y la estilista la ve en su app.",
            "Si la cita tenía un depósito verificado, se descuenta de la factura. Si llegó sin reservar, se cobra el total al cerrar.",
          ],
        },
      ],
    },
  ],
  [
    new RegExp(`^facturacion/${ID}$`),
    {
      titulo: "Factura",
      resumen: "Revisa lo que se hizo, aplica el descuento y cobra.",
      bloques: [
        {
          titulo: "Agregar servicios o productos",
          pasos: [
            "Pulsa “Agregar a la factura” y elige Servicio o Producto.",
            "Busca y toca el artículo (puedes poner la cantidad antes).",
            "Si el artículo se cobra por gramo (u otra unidad), te pide la cantidad (por ejemplo, 250 gramos) y muestra el monto antes de agregarlo.",
            "Si a alguien se le olvidó su servicio, en “¿Quién hizo el servicio? (recibe la comisión)” elige a la persona: la línea y la comisión quedan a su nombre.",
          ],
          notas: [
            "Si agregas el mismo artículo otra vez (misma persona y mismo precio), se suma la cantidad (o los gramos) en la línea existente.",
            "Si agregaste algo por error, pulsa “Quitar” en esa línea. Cada quien solo puede quitar lo que él mismo agregó, y solo mientras la factura está abierta; el administrador puede quitar cualquiera.",
            "Cada empleada solo ve los servicios que ella ofrece. Caja, con permiso, ve todos.",
          ],
        },
        {
          titulo: "Descuento",
          pasos: ["En el resumen escribe el descuento y elige si es en RD$ o en %.", "Se guarda solo y el total se actualiza al instante."],
          notas: [
            "Solo los roles con el permiso “Aplicar descuentos en la factura” ven el campo.",
            "Verás si la clienta está registrada en la app y cuántos días lleva registrada.",
            "El descuento no reduce las comisiones. Cada descuento queda en la Bitácora.",
          ],
        },
        {
          titulo: "Cobrar, imprimir y cancelar",
          pasos: [
            "Elige el método de pago (tarjeta, efectivo, transferencia o mixto) y pulsa “Cobrar”.",
            "Después puedes imprimir, descargar el PDF o enviar la factura por WhatsApp.",
            "“Quitar” elimina una línea de una factura abierta. “Cancelar factura” cierra la visita sin cobro.",
          ],
          notas: ["Si la clienta pagó un depósito validado, se descuenta del total automáticamente."],
        },
      ],
    },
  ],

  // ───────────── Personal ─────────────
  [
    /^personal$/,
    {
      titulo: "Personal",
      resumen: "Las empleadas del salón, sus roles y su acceso.",
      bloques: [
        {
          pasos: ["Busca a una empleada o abre su ficha.", "Pulsa “Nueva” para agregar a alguien.", "La columna “Acceso” te dice quién ya tiene cuenta y a qué plataformas entra (panel, app o ambas)."],
        },
      ],
    },
  ],
  [
    /^personal\/nueva$/,
    {
      titulo: "Nueva empleada",
      resumen: "Agrega a una persona al personal.",
      bloques: [
        {
          pasos: [
            "1 · Datos personales: nombre, puesto, teléfono y correo.",
            "2 · Roles: marca todos los que tenga. El primero que marcas es el principal.",
            "3 · Servicios que realiza: así solo esos le salen al registrar en la factura.",
            "4 · Comisión: escríbela solo si es distinta a la de su rol.",
            "Sube su foto si quieres, revisa el resumen y guarda.",
          ],
          notas: ["Para darle acceso (usuario y contraseña), abre su ficha después de crearla."],
        },
      ],
    },
  ],
  [
    new RegExp(`^personal/${ID}/editar$`),
    {
      titulo: "Editar empleada",
      resumen: "Cambia sus datos, roles, servicios o comisión.",
      bloques: [
        {
          pasos: ["Cambia lo que necesites: datos, roles, servicios o comisión.", "Guarda para aplicar los cambios."],
          notas: ["Una empleada con varios roles tiene la suma de los permisos de todos. Los cambios de rol y comisión quedan en la Bitácora."],
        },
      ],
    },
  ],
  [
    new RegExp(`^personal/${ID}$`),
    {
      titulo: "Ficha de la empleada",
      resumen: "Su desempeño del mes, su disponibilidad y su acceso.",
      bloques: [
        {
          notas: [
            "Servicios del mes, facturado y ticket promedio.",
            "Calendario: pulsa un día para bloquearlo o desbloquearlo.",
            "Servicios asignados y comisión.",
            "Acceso y permisos: ahí creas su cuenta (usuario y contraseña temporal) y le envías los datos por WhatsApp.",
          ],
        },
      ],
    },
  ],

  // ───────────── Catálogo ─────────────
  [
    /^catalogo$/,
    {
      titulo: "Catálogo",
      resumen: "Servicios y productos del salón, con sus precios.",
      bloques: [
        {
          pasos: [
            "Cambia entre las pestañas Servicios y Productos.",
            "Usa los filtros para encontrar lo que buscas (categoría, duración, depósito, visibilidad, quién lo ofrece).",
            "Pulsa un artículo para ver su ficha, o “Nuevo servicio” / “Nuevo producto” para crear uno.",
          ],
          notas: ["Lo que se ve en la web y en la app sale de aquí."],
        },
      ],
    },
  ],
  [
    /^catalogo\/nuevo-servicio$/,
    {
      titulo: "Nuevo servicio",
      resumen: "Crea un servicio con su precio y duración.",
      bloques: [
        {
          pasos: [
            "Escribe nombre y descripción.",
            "Elige la categoría (Instalación, Express, Mantenimiento o Taller de costura), la duración y el precio.",
            "Define el depósito, o márcalo como “sin depósito”.",
            "Activa “Pedir gramos al agendar” si la clienta debe indicar cuántos gramos se pone.",
            "Apaga “Mostrar en la web y en la app” si el servicio solo se hace en el salón, sin cita.",
            "Marca quién lo ofrece: esto filtra lo que ve cada empleada al facturar.",
            "Elige la unidad de cobro: unidad, gramo, paquete, capa, línea, pulgada o libra. Si no es “unidad”, escribe de cuántas unidades es el precio (por ejemplo, gramo por cada 100: el precio es el de 100 g).",
          ],
          notas: ["Al facturar, un servicio por gramo pide cuántos gramos son y cobra proporcional: con precio $600 por cada 100 g, 250 g cuestan $1,500."],
        },
      ],
    },
  ],
  [
    /^catalogo\/nuevo-producto$/,
    {
      titulo: "Nuevo producto",
      resumen: "Crea un producto o una línea de cabello.",
      bloques: [
        {
          pasos: [
            "Elige la categoría. Si es cabello, elige tipo, color (de la lista de colores de la línea) y los largos: se crea un producto por cada largo.",
            "Escribe precio, costo, existencias y mínimo.",
            "Elige la unidad de cobro (unidad, gramo, paquete…) y, si no es “unidad”, de cuántas unidades es el precio. Las existencias se llevan en esa misma unidad.",
            "Si no es cabello, sube la foto. Guarda.",
          ],
          notas: [
            "Si falta un color, elige “+ Agregar un color nuevo…” y escríbelo: se suma a la lista de la línea.",
            "El cabello no lleva foto de producto: la foto principal es la de la línea y las de cada color y largo se cargan en Configuración → Inventario.",
          ],
        },
      ],
    },
  ],
  [
    new RegExp(`^catalogo/${ID}/editar$`),
    {
      titulo: "Editar del catálogo",
      resumen: "Cambia los datos, el precio o la foto de un servicio o producto.",
      bloques: [{ pasos: ["Cambia lo que necesites y guarda."], notas: ["Los cambios de precio quedan en la Bitácora, con el precio de antes y el de después."] }],
    },
  ],
  [
    new RegExp(`^catalogo/${ID}$`),
    {
      titulo: "Ficha del catálogo",
      resumen: "El detalle de un servicio o producto.",
      bloques: [
        {
          notas: [
            "Servicio: descripción pública, quién lo ofrece (si no hay nadie marcado, cualquier estilista activa puede ofrecerlo), seguimiento post-servicio y foto.",
            "Producto: stock actual (con aviso de stock bajo), precio, costo y margen.",
          ],
        },
        { titulo: "Cambiar algo", pasos: ["Pulsa Editar, cambia los datos y guarda."] },
      ],
    },
  ],

  // ───────────── Proveedores ─────────────
  [
    /^proveedores$/,
    {
      titulo: "Proveedores",
      resumen: "De dónde viene el cabello y los insumos del salón.",
      bloques: [{ pasos: ["Busca un proveedor por nombre.", "Abre su ficha para ver sus órdenes de compra y los productos que suministra.", "Pulsa “Nuevo” para agregar uno."] }],
    },
  ],
  [
    /^proveedores\/nuevo$/,
    {
      titulo: "Nuevo proveedor",
      resumen: "Registra un proveedor para poder usarlo en las entradas de inventario.",
      bloques: [
        {
          pasos: [
            "Escribe el nombre, el tipo (cabello, insumos, herramientas o cuidado) y su RNC.",
            "Elige el país y escribe la dirección.",
            "Agrega la persona de contacto, su teléfono y su correo.",
            "Escribe las condiciones comerciales (forma de pago) y una nota interna si hace falta.",
            "Guarda.",
          ],
        },
      ],
    },
  ],
  [
    new RegExp(`^proveedores/${ID}/editar$`),
    {
      titulo: "Editar proveedor",
      resumen: "Cambia los datos de un proveedor.",
      bloques: [{ pasos: ["Cambia sus datos de contacto o sus condiciones.", "Guarda."] }],
    },
  ],
  [
    new RegExp(`^proveedores/${ID}$`),
    {
      titulo: "Ficha del proveedor",
      resumen: "Sus compras y sus datos.",
      bloques: [
        {
          notas: [
            "Arriba: órdenes del año, unidades recibidas, costo promedio y compras del año.",
            "Órdenes de compra: su fecha y estado (pendiente, en tránsito o ya recibida). Pulsa una para ver sus líneas.",
            "Productos que suministra, contacto, condiciones y nota interna.",
          ],
        },
      ],
    },
  ],

  // ───────────── Reportes ─────────────
  [
    /^reportes$/,
    {
      titulo: "Reportes",
      resumen: "Ventas, comisiones, descuentos y productos más vendidos.",
      bloques: [
        {
          pasos: [
            "Elige Día, Semana o Mes.",
            "Revisa lo facturado, los servicios, el ticket promedio y las comisiones, comparados con el período anterior.",
            "Más abajo: servicios más solicitados, ingreso por estilista, origen de las citas, descuentos otorgados, productos más vendidos y comisiones por empleada.",
            "“Exportar” descarga el período en un archivo para Excel.",
          ],
        },
      ],
    },
  ],

  // ───────────── Página web ─────────────
  [
    /^pagina-web$/,
    {
      titulo: "Página web",
      resumen: "Cambia los textos y las fotos del sitio sin pedir ayuda.",
      bloques: [
        {
          pasos: ["Elige la sección que quieres cambiar.", "Edita el texto o sube la foto y pulsa “Guardar cambios” de esa tarjeta.", "Revisa el resultado en melenahumanhair.com."],
          notas: ["Los productos y servicios que se ven en la web salen de Catálogo, no de aquí."],
        },
      ],
    },
  ],
  [
    /^pagina-web\/inicio$/,
    {
      titulo: "Web · Inicio",
      resumen: "La portada y las primeras secciones del sitio.",
      bloques: [{ pasos: ["Edita la portada (hero), la franja de garantías de debajo y la sección “Sobre Melena”.", "Pulsa “Guardar cambios” en la tarjeta que modificaste."] }],
    },
  ],
  [
    /^pagina-web\/antes-despues$/,
    {
      titulo: "Web · Antes y después",
      resumen: "Las fotos de resultados que se muestran en el sitio.",
      bloques: [
        {
          pasos: ["Cambia el título de la sección si quieres.", "Sube las fotos: se muestran en el orden en que están.", "Para quitar una foto, pulsa Eliminar."],
          notas: ["Funcionan mejor las fotos verticales (3:4)."],
        },
      ],
    },
  ],
  [
    /^pagina-web\/testimonios$/,
    {
      titulo: "Web · Testimonios",
      resumen: "Las opiniones de clientas que se muestran en el sitio.",
      bloques: [{ pasos: ["Agrega un testimonio con el nombre de la clienta, su texto y las estrellas.", "Usa Editar o Eliminar en los que ya existen.", "Cambia el título de la sección si hace falta."] }],
    },
  ],
  [
    /^pagina-web\/secciones$/,
    {
      titulo: "Web · Formularios y mensajes",
      resumen: "Los textos del formulario de agendar y de los mensajes de WhatsApp del sitio.",
      bloques: [
        {
          pasos: ["Edita las etiquetas del formulario de agendar cita.", "Edita el mensaje de WhatsApp de la consulta de un servicio o de un producto de cabello.", "Edita el texto que aparece después de reservar una cita.", "Guarda cada tarjeta."],
        },
      ],
    },
  ],
  [
    /^pagina-web\/contacto$/,
    {
      titulo: "Web · Contacto y horarios",
      resumen: "Los datos de contacto que ve el público.",
      bloques: [
        {
          pasos: ["Escribe el teléfono, el WhatsApp, el correo y el horario.", "Agrega tus redes sociales.", "Edita los textos de la sección Contacto y guarda."],
          notas: ["Si dejas una red social vacía, no se muestra."],
        },
      ],
    },
  ],
  [
    /^pagina-web\/marca-menu$/,
    {
      titulo: "Web · Marca y menú",
      resumen: "El logo, el menú de arriba y los botones de las fichas.",
      bloques: [
        {
          pasos: ["Sube el logo y el ícono, y cambia el nombre de la marca.", "Edita las opciones del menú del header.", "Edita el texto de los botones de las fichas de servicios y productos.", "Guarda."],
          notas: ["El logo se muestra en el header y en el footer; el ícono, en la pestaña del navegador."],
        },
      ],
    },
  ],
  [
    /^pagina-web\/footer-seo$/,
    {
      titulo: "Web · Footer y buscadores",
      resumen: "El pie del sitio, los datos para Google y las páginas legales.",
      bloques: [
        {
          pasos: [
            "Edita los enlaces de navegación del footer.",
            "Completa los datos para buscadores (Google).",
            "Edita la política de privacidad y la fecha de su última actualización.",
            "Edita lo que ve quien entra a un enlace que no existe (página 404).",
            "Guarda cada tarjeta.",
          ],
        },
      ],
    },
  ],

  // ───────────── App móvil ─────────────
  [
    /^app-movil$/,
    {
      titulo: "App móvil",
      resumen: "Cambia la foto de la pantalla principal de la app de las clientas.",
      bloques: [
        {
          pasos: [
            "Pulsa “Subir foto” y elige la imagen (JPG, PNG o WebP, de cualquier tamaño).",
            "En el visor arrastra la foto para encuadrarla y usa “Acercar”.",
            "Pulsa “Guardar cambios”: el panel la recorta y la comprime.",
          ],
          notas: ["Mientras más grande sea la foto original, más nítida se verá. Recarga la app para ver el cambio."],
        },
      ],
    },
  ],

  // ───────────── Configuración ─────────────
  [
    /^configuracion$/,
    {
      titulo: "Configuración",
      resumen: "Los ajustes generales del salón.",
      bloques: [
        {
          notas: [
            "Negocio: nombre, teléfono, dirección y redes.",
            "Horario: días y horas de atención, feriados y reglas de agenda.",
            "Depósitos: monto, plazo y cuentas bancarias.",
            "Facturación: datos fiscales, ITBIS y pie de la factura.",
            "Comisiones: porcentaje por rol y cómo se calculan.",
            "Recordatorios, Mensajes y Seguimiento: cuándo y qué se le avisa a las clientas.",
            "Inventario: categorías de productos y colores de cabello.",
          ],
        },
        { pasos: ["Elige la sección que quieres cambiar."] },
      ],
    },
  ],
  [
    /^configuracion\/negocio$/,
    {
      titulo: "Negocio y contacto",
      resumen: "Los datos del salón que se muestran en el sitio, la app y las facturas.",
      bloques: [{ pasos: ["Cambia el nombre, la moneda, los teléfonos, la dirección y las redes.", "Guarda: verás “Guardado ✓”."] }],
    },
  ],
  [
    /^configuracion\/horario$/,
    {
      titulo: "Horario del salón",
      resumen: "Los horarios que se ofrecen para agendar en la web y en la app.",
      bloques: [
        {
          pasos: [
            "Marca los días que abre y escribe su apertura y cierre. Si un día está cerrado, no se ofrecen horarios.",
            "Agrega una pausa si hace falta (por ejemplo, el almuerzo).",
            "En “Días especiales y feriados” agrega los cierres u horarios reducidos.",
            "En “Reglas de agenda” ajusta los bloques de agenda, el tiempo entre citas y la anticipación mínima.",
            "Guarda.",
          ],
        },
      ],
    },
  ],
  [
    /^configuracion\/depositos$/,
    {
      titulo: "Depósito de reserva",
      resumen: "Cuánto debe pagar la clienta para confirmar su cita y a dónde transferir.",
      bloques: [
        {
          pasos: [
            "Escribe el monto del depósito y el plazo (en horas) para subir el comprobante.",
            "Elige qué pasa si no se sube a tiempo: liberar el horario o mantener la cita pendiente.",
            "Agrega las cuentas bancarias que verá la clienta.",
            "Elige quién puede verificar depósitos.",
            "Guarda.",
          ],
        },
      ],
    },
  ],
  [
    /^configuracion\/facturacion$/,
    {
      titulo: "Datos fiscales",
      resumen: "Lo que sale en las facturas impresas o enviadas.",
      bloques: [{ pasos: ["Escribe el RNC y la razón social.", "Ajusta el porcentaje de ITBIS.", "Escribe el pie de la factura (por ejemplo, “Gracias por tu visita.”).", "Guarda."] }],
    },
  ],
  [
    /^configuracion\/comisiones$/,
    {
      titulo: "Comisiones",
      resumen: "El porcentaje que gana cada rol y cómo se calcula.",
      bloques: [
        {
          pasos: [
            "Escribe el porcentaje de cada rol, en servicios y en productos.",
            "Elige el corte de comisiones: semanal, quincenal o mensual.",
            "Elige sobre qué se calcula: el subtotal sin ITBIS o el total con ITBIS.",
            "Guarda.",
          ],
          notas: ["Una empleada con un porcentaje propio en su ficha usa ese; si no, usa el de su rol. Con varios roles se toma el más alto."],
        },
      ],
    },
  ],
  [
    /^configuracion\/recordatorios$/,
    {
      titulo: "Recordatorios de cita",
      resumen: "Cuándo se le recuerda la cita a la clienta y por dónde.",
      bloques: [
        {
          pasos: [
            "Define cuántas horas antes se envían el primer y el segundo recordatorio.",
            "Edita el texto que recibe la clienta.",
            "Marca los canales: correo, notificación de la app o WhatsApp.",
            "Guarda.",
          ],
        },
      ],
    },
  ],
  [
    /^configuracion\/mensajes$/,
    {
      titulo: "Mensajes a clientas",
      resumen: "El texto de los mensajes de WhatsApp que se envían desde el panel.",
      bloques: [
        {
          pasos: [
            "Edita el mensaje de cita confirmada, de comprobante rechazado o de recordatorio.",
            "Mira la vista previa con datos de ejemplo.",
            "Guarda.",
          ],
          notas: ["Cada mensaje se usa en el botón de WhatsApp de su pantalla (detalle de la cita o depósitos)."],
        },
      ],
    },
  ],
  [
    /^configuracion\/seguimiento$/,
    {
      titulo: "Seguimiento",
      resumen: "Los avisos que se envían a la clienta después de un servicio.",
      bloques: [
        {
          pasos: ["Edita el mensaje de seguimiento.", "Marca por dónde se envía: correo, notificación de la app o WhatsApp.", "Guarda."],
          notas: ["Abajo ves los seguimientos programados, con su fecha, clienta, servicio y estado."],
        },
      ],
    },
  ],
  [
    /^configuracion\/inventario$/,
    {
      titulo: "Inventario",
      resumen: "Las categorías de productos y los colores de cabello.",
      bloques: [
        {
          pasos: [
            "Crea o edita una categoría: nombre, si se muestra en la web y en qué orden.",
            "Marca “Es cabello” si pide tipo, color y largo (se crea un producto por cada largo).",
            "Para dar fotos a los colores, abre la ficha de la línea de cabello y agrégalos en “Colores y fotos”.",
            "En la ficha de la línea, “Foto” es la foto principal: es la que se ve al abrir el producto y es distinta a las fotos de los colores.",
            "Más abajo, en “Fotos por color y largo”, sube una foto para cada largo de cada color (por ejemplo, el 16\" castaño).",
          ],
          notas: [
            "Los productos de cada color (con sus largos y precios) se crean en Catálogo.",
            "En la web y en la app se ve primero la foto principal; al elegir color y largo cambia a la de esa combinación y, si no hay, a la del color.",
          ],
        },
      ],
    },
  ],

  // ───────────── Seguridad, Bitácora y Perfil ─────────────
  [
    /^seguridad$/,
    {
      titulo: "Seguridad",
      resumen: "Decide qué puede hacer cada rol.",
      bloques: [
        {
          pasos: [
            "Cada columna es un rol y cada fila un permiso, agrupados por módulo.",
            "Marca o desmarca los permisos y pulsa Guardar.",
            "Para un rol nuevo usa “Nuevo rol”.",
          ],
          notas: [
            "Admin tiene todo siempre.",
            "“Acceso al panel” y “Acceso a la app” definen dónde puede entrar cada rol.",
            "Permisos especiales de Facturación: “Agregar servicios a nombre de otra persona” y “Aplicar descuentos en la factura”.",
            "Una empleada con varios roles tiene la suma de los permisos de todos. Los cambios quedan en la Bitácora.",
          ],
        },
      ],
    },
  ],
  [
    /^bitacora$/,
    {
      titulo: "Bitácora",
      resumen: "Quién hizo qué, con fecha y hora.",
      bloques: [
        {
          pasos: ["Elige el período, el tipo de movimiento o la persona, o busca una palabra.", "Pulsa “Ver más” para cargar movimientos anteriores."],
          notas: [
            "Registra accesos, cobros, descuentos, líneas quitadas, cambios de personal, roles y permisos, depósitos, citas, cuentas de clientas y cambios de precio.",
            "No se puede editar ni borrar.",
          ],
        },
      ],
    },
  ],
  [
    /^perfil$/,
    {
      titulo: "Mi perfil",
      resumen: "Tus datos y tu acceso.",
      bloques: [
        {
          pasos: ["Pulsa tu foto para cambiarla.", "Para cambiar tu contraseña, escribe la nueva y guarda: verás “Contraseña actualizada ✓”."],
          notas: ["Ahí también ves tu último acceso."],
        },
      ],
    },
  ],
];

/** Ayuda de la pantalla que corresponde a una ruta del panel (ej. "/admin/facturacion/123"), o null si no tiene. */
export function ayudaDePantalla(pathname: string): AyudaPantalla | null {
  const ruta = pathname.replace(/^\/admin\/?/, "").replace(/\/+$/, "");
  for (const [patron, ayuda] of PANTALLAS) {
    if (patron.test(ruta)) return ayuda;
  }
  return null;
}
