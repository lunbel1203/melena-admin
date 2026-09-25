export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      categorias_productos: {
        Row: {
          activo: boolean
          created_at: string
          es_cabello: boolean
          id: string
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          es_cabello?: boolean
          id?: string
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          es_cabello?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          clienta_id: string
          created_at: string
          dia_programado: number
          enviado_at: string | null
          estado: Database["public"]["Enums"]["estado_checkin"]
          factura_id: string
          fecha_programada: string
          id: string
          respondido_at: string | null
          respuesta: Database["public"]["Enums"]["respuesta_checkin"] | null
          servicio_id: string
        }
        Insert: {
          clienta_id: string
          created_at?: string
          dia_programado: number
          enviado_at?: string | null
          estado?: Database["public"]["Enums"]["estado_checkin"]
          factura_id: string
          fecha_programada: string
          id?: string
          respondido_at?: string | null
          respuesta?: Database["public"]["Enums"]["respuesta_checkin"] | null
          servicio_id: string
        }
        Update: {
          clienta_id?: string
          created_at?: string
          dia_programado?: number
          enviado_at?: string | null
          estado?: Database["public"]["Enums"]["estado_checkin"]
          factura_id?: string
          fecha_programada?: string
          id?: string
          respondido_at?: string | null
          respuesta?: Database["public"]["Enums"]["respuesta_checkin"] | null
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "check_ins_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      citas: {
        Row: {
          clienta_id: string
          created_at: string
          empleado_id: string | null
          estado: Database["public"]["Enums"]["estado_cita"]
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          notas: string | null
          rango: unknown
          recordatorio_24h_enviado: boolean
          recordatorio_2h_enviado: boolean
          servicio_id: string
          updated_at: string
        }
        Insert: {
          clienta_id: string
          created_at?: string
          empleado_id?: string | null
          estado?: Database["public"]["Enums"]["estado_cita"]
          fecha: string
          hora_fin: string
          hora_inicio: string
          id?: string
          notas?: string | null
          rango?: unknown
          recordatorio_24h_enviado?: boolean
          recordatorio_2h_enviado?: boolean
          servicio_id: string
          updated_at?: string
        }
        Update: {
          clienta_id?: string
          created_at?: string
          empleado_id?: string | null
          estado?: Database["public"]["Enums"]["estado_cita"]
          fecha?: string
          hora_fin?: string
          hora_inicio?: string
          id?: string
          notas?: string | null
          rango?: unknown
          recordatorio_24h_enviado?: boolean
          recordatorio_2h_enviado?: boolean
          servicio_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "citas_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citas_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      clientas: {
        Row: {
          created_at: string
          email: string | null
          fecha_nacimiento: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      comisiones: {
        Row: {
          created_at: string
          empleado_id: string
          factura_id: string
          id: string
          linea_factura_id: string
          monto: number
          pagada: boolean
          porcentaje: number
        }
        Insert: {
          created_at?: string
          empleado_id: string
          factura_id: string
          id?: string
          linea_factura_id: string
          monto: number
          pagada?: boolean
          porcentaje: number
        }
        Update: {
          created_at?: string
          empleado_id?: string
          factura_id?: string
          id?: string
          linea_factura_id?: string
          monto?: number
          pagada?: boolean
          porcentaje?: number
        }
        Relationships: [
          {
            foreignKeyName: "comisiones_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comisiones_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comisiones_linea_factura_id_fkey"
            columns: ["linea_factura_id"]
            isOneToOne: true
            referencedRelation: "lineas_factura"
            referencedColumns: ["id"]
          },
        ]
      }
      comisiones_config: {
        Row: {
          calcular_sobre: string
          corte: string
          id: boolean
          updated_at: string
        }
        Insert: {
          calcular_sobre?: string
          corte?: string
          id?: boolean
          updated_at?: string
        }
        Update: {
          calcular_sobre?: string
          corte?: string
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      comisiones_default_rol: {
        Row: {
          porcentaje: number
          rol_id: string
          tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Insert: {
          porcentaje?: number
          rol_id: string
          tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Update: {
          porcentaje?: number
          rol_id?: string
          tipo?: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Relationships: [
          {
            foreignKeyName: "comisiones_default_rol_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      cuentas_bancarias: {
        Row: {
          activa: boolean
          banco: string
          created_at: string
          id: string
          numero_cuenta: string
          tipo_cuenta: string
          titular: string
        }
        Insert: {
          activa?: boolean
          banco: string
          created_at?: string
          id?: string
          numero_cuenta: string
          tipo_cuenta: string
          titular?: string
        }
        Update: {
          activa?: boolean
          banco?: string
          created_at?: string
          id?: string
          numero_cuenta?: string
          tipo_cuenta?: string
          titular?: string
        }
        Relationships: []
      }
      deposito_config: {
        Row: {
          accion_si_no_sube_a_tiempo: string
          id: boolean
          monto: number
          plazo_horas: number
          reembolsable_hasta_horas: number | null
          updated_at: string
        }
        Insert: {
          accion_si_no_sube_a_tiempo?: string
          id?: boolean
          monto?: number
          plazo_horas?: number
          reembolsable_hasta_horas?: number | null
          updated_at?: string
        }
        Update: {
          accion_si_no_sube_a_tiempo?: string
          id?: boolean
          monto?: number
          plazo_horas?: number
          reembolsable_hasta_horas?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      depositos: {
        Row: {
          cita_id: string
          comprobante_url: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_deposito"]
          id: string
          monto: number
          notas_verificacion: string | null
          verificado_at: string | null
          verificado_por: string | null
        }
        Insert: {
          cita_id: string
          comprobante_url: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_deposito"]
          id?: string
          monto?: number
          notas_verificacion?: string | null
          verificado_at?: string | null
          verificado_por?: string | null
        }
        Update: {
          cita_id?: string
          comprobante_url?: string
          created_at?: string
          estado?: Database["public"]["Enums"]["estado_deposito"]
          id?: string
          monto?: number
          notas_verificacion?: string | null
          verificado_at?: string | null
          verificado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "depositos_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: false
            referencedRelation: "citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "depositos_verificado_por_fkey"
            columns: ["verificado_por"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      dias_especiales: {
        Row: {
          cerrado: boolean
          created_at: string
          fecha: string
          hora_apertura_especial: string | null
          hora_cierre_especial: string | null
          id: string
          nombre: string
        }
        Insert: {
          cerrado?: boolean
          created_at?: string
          fecha: string
          hora_apertura_especial?: string | null
          hora_cierre_especial?: string | null
          id?: string
          nombre: string
        }
        Update: {
          cerrado?: boolean
          created_at?: string
          fecha?: string
          hora_apertura_especial?: string | null
          hora_cierre_especial?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      disponibilidad_empleados: {
        Row: {
          created_at: string
          dia_completo: boolean
          empleado_id: string
          fecha: string
          hora_fin: string | null
          hora_inicio: string | null
          id: string
          motivo: string | null
        }
        Insert: {
          created_at?: string
          dia_completo?: boolean
          empleado_id: string
          fecha: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          motivo?: string | null
        }
        Update: {
          created_at?: string
          dia_completo?: boolean
          empleado_id?: string
          fecha?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: string
          motivo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidad_empleados_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      dispositivos_push: {
        Row: {
          clienta_id: string | null
          created_at: string
          empleado_id: string | null
          expo_push_token: string
          id: string
        }
        Insert: {
          clienta_id?: string | null
          created_at?: string
          empleado_id?: string | null
          expo_push_token: string
          id?: string
        }
        Update: {
          clienta_id?: string | null
          created_at?: string
          empleado_id?: string | null
          expo_push_token?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispositivos_push_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispositivos_push_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
      empleados: {
        Row: {
          activo: boolean
          created_at: string
          email: string | null
          foto_url: string | null
          id: string
          nombre: string
          porcentaje_comision: number | null
          puesto: string | null
          rol_id: string
          telefono: string | null
          user_id: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nombre: string
          porcentaje_comision?: number | null
          puesto?: string | null
          rol_id: string
          telefono?: string | null
          user_id?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          email?: string | null
          foto_url?: string | null
          id?: string
          nombre?: string
          porcentaje_comision?: number | null
          puesto?: string | null
          rol_id?: string
          telefono?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empleados_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      facturacion_config: {
        Row: {
          id: boolean
          itbis_porcentaje: number
          razon_social: string | null
          rnc: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          itbis_porcentaje?: number
          razon_social?: string | null
          rnc?: string | null
          updated_at?: string
        }
        Update: {
          id?: boolean
          itbis_porcentaje?: number
          razon_social?: string | null
          rnc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      facturas: {
        Row: {
          clienta_id: string
          cobrada_at: string | null
          cobrada_por: string | null
          created_at: string
          deposito_aplicado: number
          estado: Database["public"]["Enums"]["estado_factura"]
          id: string
          itbis: number
          subtotal: number
          total: number
          visita_id: string
        }
        Insert: {
          clienta_id: string
          cobrada_at?: string | null
          cobrada_por?: string | null
          created_at?: string
          deposito_aplicado?: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
          itbis?: number
          subtotal?: number
          total?: number
          visita_id: string
        }
        Update: {
          clienta_id?: string
          cobrada_at?: string | null
          cobrada_por?: string | null
          created_at?: string
          deposito_aplicado?: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
          itbis?: number
          subtotal?: number
          total?: number
          visita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facturas_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_cobrada_por_fkey"
            columns: ["cobrada_por"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facturas_visita_id_fkey"
            columns: ["visita_id"]
            isOneToOne: true
            referencedRelation: "visitas"
            referencedColumns: ["id"]
          },
        ]
      }
      horario_semanal: {
        Row: {
          abierto: boolean
          apertura: string | null
          cierre: string | null
          dia_semana: number
          pausa_fin: string | null
          pausa_inicio: string | null
        }
        Insert: {
          abierto?: boolean
          apertura?: string | null
          cierre?: string | null
          dia_semana: number
          pausa_fin?: string | null
          pausa_inicio?: string | null
        }
        Update: {
          abierto?: boolean
          apertura?: string | null
          cierre?: string | null
          dia_semana?: number
          pausa_fin?: string | null
          pausa_inicio?: string | null
        }
        Relationships: []
      }
      lineas_factura: {
        Row: {
          cantidad: number
          created_at: string
          descripcion: string
          empleado_id: string
          factura_id: string
          id: string
          porcentaje_comision: number
          precio_unitario: number
          producto_id: string | null
          servicio_id: string | null
          subtotal: number | null
          tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Insert: {
          cantidad?: number
          created_at?: string
          descripcion: string
          empleado_id: string
          factura_id: string
          id?: string
          porcentaje_comision?: number
          precio_unitario: number
          producto_id?: string | null
          servicio_id?: string | null
          subtotal?: number | null
          tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Update: {
          cantidad?: number
          created_at?: string
          descripcion?: string
          empleado_id?: string
          factura_id?: string
          id?: string
          porcentaje_comision?: number
          precio_unitario?: number
          producto_id?: string | null
          servicio_id?: string | null
          subtotal?: number | null
          tipo?: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Relationships: [
          {
            foreignKeyName: "lineas_factura_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineas_factura_factura_id_fkey"
            columns: ["factura_id"]
            isOneToOne: false
            referencedRelation: "facturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineas_factura_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lineas_factura_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      negocio_config: {
        Row: {
          direccion: string | null
          id: boolean
          instagram: string | null
          moneda: string
          nombre_comercial: string
          telefono: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          direccion?: string | null
          id?: boolean
          instagram?: string | null
          moneda?: string
          nombre_comercial?: string
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          direccion?: string | null
          id?: boolean
          instagram?: string | null
          moneda?: string
          nombre_comercial?: string
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      permisos_catalogo: {
        Row: {
          clave: string
          etiqueta: string
          modulo: string
          orden: number
        }
        Insert: {
          clave: string
          etiqueta: string
          modulo: string
          orden?: number
        }
        Update: {
          clave?: string
          etiqueta?: string
          modulo?: string
          orden?: number
        }
        Relationships: []
      }
      productos: {
        Row: {
          activo: boolean
          categoria: string
          color: string | null
          costo: number | null
          created_at: string
          descripcion: string | null
          foto_url: string | null
          id: string
          largo_pulgadas: number | null
          nombre: string
          precio: number
          proveedor_id: string | null
          slug: string
          stock: number
          stock_minimo: number
          tipo_cabello: Database["public"]["Enums"]["tipo_cabello"] | null
        }
        Insert: {
          activo?: boolean
          categoria?: string
          color?: string | null
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: string
          largo_pulgadas?: number | null
          nombre: string
          precio: number
          proveedor_id?: string | null
          slug: string
          stock?: number
          stock_minimo?: number
          tipo_cabello?: Database["public"]["Enums"]["tipo_cabello"] | null
        }
        Update: {
          activo?: boolean
          categoria?: string
          color?: string | null
          costo?: number | null
          created_at?: string
          descripcion?: string | null
          foto_url?: string | null
          id?: string
          largo_pulgadas?: number | null
          nombre?: string
          precio?: number
          proveedor_id?: string | null
          slug?: string
          stock?: number
          stock_minimo?: number
          tipo_cabello?: Database["public"]["Enums"]["tipo_cabello"] | null
        }
        Relationships: [
          {
            foreignKeyName: "productos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      proveedores: {
        Row: {
          activo: boolean
          contacto: string | null
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          nombre: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
      recordatorios_config: {
        Row: {
          canal_email: boolean
          canal_push: boolean
          canal_whatsapp: boolean
          id: boolean
          mensaje_plantilla: string
          recordatorio_24h_activo: boolean
          recordatorio_24h_horas: number
          recordatorio_2h_activo: boolean
          recordatorio_2h_horas: number
          updated_at: string
        }
        Insert: {
          canal_email?: boolean
          canal_push?: boolean
          canal_whatsapp?: boolean
          id?: boolean
          mensaje_plantilla?: string
          recordatorio_24h_activo?: boolean
          recordatorio_24h_horas?: number
          recordatorio_2h_activo?: boolean
          recordatorio_2h_horas?: number
          updated_at?: string
        }
        Update: {
          canal_email?: boolean
          canal_push?: boolean
          canal_whatsapp?: boolean
          id?: boolean
          mensaje_plantilla?: string
          recordatorio_24h_activo?: boolean
          recordatorio_24h_horas?: number
          recordatorio_2h_activo?: boolean
          recordatorio_2h_horas?: number
          updated_at?: string
        }
        Relationships: []
      }
      reglas_agenda: {
        Row: {
          aceptar_clientas_sin_cita: boolean
          anticipacion_minima_horas: number
          bloque_minutos: number
          cancelar_sin_penalidad_horas: number
          id: boolean
          permitir_cualquier_estilista: boolean
          reservar_hasta_dias: number
          sugerir_otra_estilista: boolean
          tiempo_entre_citas_minutos: number
          updated_at: string
          zona_horaria: string
        }
        Insert: {
          aceptar_clientas_sin_cita?: boolean
          anticipacion_minima_horas?: number
          bloque_minutos?: number
          cancelar_sin_penalidad_horas?: number
          id?: boolean
          permitir_cualquier_estilista?: boolean
          reservar_hasta_dias?: number
          sugerir_otra_estilista?: boolean
          tiempo_entre_citas_minutos?: number
          updated_at?: string
          zona_horaria?: string
        }
        Update: {
          aceptar_clientas_sin_cita?: boolean
          anticipacion_minima_horas?: number
          bloque_minutos?: number
          cancelar_sin_penalidad_horas?: number
          id?: boolean
          permitir_cualquier_estilista?: boolean
          reservar_hasta_dias?: number
          sugerir_otra_estilista?: boolean
          tiempo_entre_citas_minutos?: number
          updated_at?: string
          zona_horaria?: string
        }
        Relationships: []
      }
      rol_permisos: {
        Row: {
          permiso_clave: string
          rol_id: string
        }
        Insert: {
          permiso_clave: string
          rol_id: string
        }
        Update: {
          permiso_clave?: string
          rol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rol_permisos_permiso_clave_fkey"
            columns: ["permiso_clave"]
            isOneToOne: false
            referencedRelation: "permisos_catalogo"
            referencedColumns: ["clave"]
          },
          {
            foreignKeyName: "rol_permisos_rol_id_fkey"
            columns: ["rol_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          es_admin_total: boolean
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          es_admin_total?: boolean
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          es_admin_total?: boolean
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      seguimiento_config: {
        Row: {
          canal_email: boolean
          canal_push: boolean
          canal_whatsapp: boolean
          id: boolean
          mensaje_plantilla: string
          updated_at: string
        }
        Insert: {
          canal_email?: boolean
          canal_push?: boolean
          canal_whatsapp?: boolean
          id?: boolean
          mensaje_plantilla?: string
          updated_at?: string
        }
        Update: {
          canal_email?: boolean
          canal_push?: boolean
          canal_whatsapp?: boolean
          id?: boolean
          mensaje_plantilla?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicios: {
        Row: {
          activo: boolean
          categoria: string | null
          created_at: string
          deposito_monto: number | null
          deposito_requerido: boolean
          descripcion: string | null
          dias_seguimiento: number[]
          duracion_minutos: number
          foto_url: string | null
          id: string
          nombre: string
          precio: number
          slug: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          deposito_monto?: number | null
          deposito_requerido?: boolean
          descripcion?: string | null
          dias_seguimiento?: number[]
          duracion_minutos?: number
          foto_url?: string | null
          id?: string
          nombre: string
          precio: number
          slug: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          created_at?: string
          deposito_monto?: number | null
          deposito_requerido?: boolean
          descripcion?: string | null
          dias_seguimiento?: number[]
          duracion_minutos?: number
          foto_url?: string | null
          id?: string
          nombre?: string
          precio?: number
          slug?: string
        }
        Relationships: []
      }
      servicios_empleados: {
        Row: {
          created_at: string
          empleado_id: string
          servicio_id: string
        }
        Insert: {
          created_at?: string
          empleado_id: string
          servicio_id: string
        }
        Update: {
          created_at?: string
          empleado_id?: string
          servicio_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicios_empleados_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicios_empleados_servicio_id_fkey"
            columns: ["servicio_id"]
            isOneToOne: false
            referencedRelation: "servicios"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_molestia: {
        Row: {
          atendido_por: string | null
          check_in_id: string
          clienta_id: string
          created_at: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_ticket"]
          foto_url: string | null
          id: string
          intensidad: number
          resuelto_at: string | null
          tipos_molestia: string[]
        }
        Insert: {
          atendido_por?: string | null
          check_in_id: string
          clienta_id: string
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_ticket"]
          foto_url?: string | null
          id?: string
          intensidad: number
          resuelto_at?: string | null
          tipos_molestia?: string[]
        }
        Update: {
          atendido_por?: string | null
          check_in_id?: string
          clienta_id?: string
          created_at?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_ticket"]
          foto_url?: string | null
          id?: string
          intensidad?: number
          resuelto_at?: string | null
          tipos_molestia?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tickets_molestia_atendido_por_fkey"
            columns: ["atendido_por"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_molestia_check_in_id_fkey"
            columns: ["check_in_id"]
            isOneToOne: false
            referencedRelation: "check_ins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_molestia_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          cita_id: string | null
          clienta_id: string
          created_at: string
          empleado_recepcion_id: string
          estilista_id: string | null
          id: string
        }
        Insert: {
          cita_id?: string | null
          clienta_id: string
          created_at?: string
          empleado_recepcion_id: string
          estilista_id?: string | null
          id?: string
        }
        Update: {
          cita_id?: string | null
          clienta_id?: string
          created_at?: string
          empleado_recepcion_id?: string
          estilista_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visitas_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: false
            referencedRelation: "citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_empleado_recepcion_id_fkey"
            columns: ["empleado_recepcion_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_estilista_id_fkey"
            columns: ["estilista_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      empleado_id_actual: { Args: never; Returns: string }
      es_admin: { Args: never; Returns: boolean }
      es_recepcion_o_caja: { Args: never; Returns: boolean }
      es_staff: { Args: never; Returns: boolean }
      estilistas_disponibles: {
        Args: {
          p_fecha: string
          p_hora_fin: string
          p_hora_inicio: string
          p_servicio_id: string
        }
        Returns: {
          empleado_id: string
          foto_url: string
          nombre: string
        }[]
      }
      horario_salon: {
        Args: { p_fecha: string }
        Returns: {
          abierto: boolean
          apertura: string
          cierre: string
          pausa_fin: string
          pausa_inicio: string
        }[]
      }
      horarios_disponibles_estilista: {
        Args: {
          p_duracion_minutos: number
          p_empleado_id: string
          p_fecha: string
        }
        Returns: {
          hora_fin: string
          hora_inicio: string
        }[]
      }
      invocar_edge_function: {
        Args: { p_body: Json; p_nombre: string }
        Returns: undefined
      }
      responder_checkin: {
        Args: {
          p_check_in_id: string
          p_descripcion?: string
          p_foto_url?: string
          p_intensidad?: number
          p_respuesta: Database["public"]["Enums"]["respuesta_checkin"]
          p_tipos_molestia?: string[]
        }
        Returns: string
      }
      tiene_permiso: { Args: { p_clave: string }; Returns: boolean }
    }
    Enums: {
      estado_checkin: "pendiente" | "enviado" | "respondido"
      estado_cita:
        | "pendiente_confirmacion"
        | "confirmada"
        | "cancelada"
        | "completada"
        | "no_show"
      estado_deposito: "pendiente" | "verificado" | "rechazado"
      estado_factura: "abierta" | "cobrada" | "cancelada"
      estado_ticket: "abierto" | "en_proceso" | "resuelto"
      respuesta_checkin: "bien" | "molestia"
      tipo_cabello: "virgin" | "remy"
      tipo_linea_factura: "servicio" | "producto"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_checkin: ["pendiente", "enviado", "respondido"],
      estado_cita: [
        "pendiente_confirmacion",
        "confirmada",
        "cancelada",
        "completada",
        "no_show",
      ],
      estado_deposito: ["pendiente", "verificado", "rechazado"],
      estado_factura: ["abierta", "cobrada", "cancelada"],
      estado_ticket: ["abierto", "en_proceso", "resuelto"],
      respuesta_checkin: ["bien", "molestia"],
      tipo_cabello: ["virgin", "remy"],
      tipo_linea_factura: ["servicio", "producto"],
    },
  },
} as const
