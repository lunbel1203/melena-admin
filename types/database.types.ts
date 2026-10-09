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
      bitacora: {
        Row: {
          accion: string
          actor: string
          categoria: string
          created_at: string
          descripcion: string
          detalle: Json | null
          empleado_id: string | null
          entidad: string | null
          entidad_id: string | null
          id: number
          usuario_id: string | null
        }
        Insert: {
          accion: string
          actor: string
          categoria: string
          created_at?: string
          descripcion: string
          detalle?: Json | null
          empleado_id?: string | null
          entidad?: string | null
          entidad_id?: string | null
          id?: never
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          actor?: string
          categoria?: string
          created_at?: string
          descripcion?: string
          detalle?: Json | null
          empleado_id?: string | null
          entidad?: string | null
          entidad_id?: string | null
          id?: never
          usuario_id?: string | null
        }
        Relationships: []
      }
      categoria_colores: {
        Row: {
          categoria_id: string
          created_at: string
          foto_url: string | null
          id: string
          nombre: string
          orden: number
        }
        Insert: {
          categoria_id: string
          created_at?: string
          foto_url?: string | null
          id?: string
          nombre: string
          orden?: number
        }
        Update: {
          categoria_id?: string
          created_at?: string
          foto_url?: string | null
          id?: string
          nombre?: string
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "categoria_colores_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_productos"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_productos: {
        Row: {
          activo: boolean
          created_at: string
          es_cabello: boolean
          id: string
          nombre: string
          web_descripcion: string | null
          web_foto_url: string | null
          web_nota: string | null
          web_orden: number
          web_visible: boolean
        }
        Insert: {
          activo?: boolean
          created_at?: string
          es_cabello?: boolean
          id?: string
          nombre: string
          web_descripcion?: string | null
          web_foto_url?: string | null
          web_nota?: string | null
          web_orden?: number
          web_visible?: boolean
        }
        Update: {
          activo?: boolean
          created_at?: string
          es_cabello?: boolean
          id?: string
          nombre?: string
          web_descripcion?: string | null
          web_foto_url?: string | null
          web_nota?: string | null
          web_orden?: number
          web_visible?: boolean
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
          origen: string | null
          gramos: number | null
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
          origen?: string | null
          gramos?: number | null
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
          origen?: string | null
          gramos?: number | null
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
          debe_cambiar_password: boolean
          email: string | null
          fecha_nacimiento: string | null
          id: string
          nombre: string
          notas: string | null
          telefono: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          debe_cambiar_password?: boolean
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre: string
          notas?: string | null
          telefono: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          debe_cambiar_password?: boolean
          email?: string | null
          fecha_nacimiento?: string | null
          id?: string
          nombre?: string
          notas?: string | null
          telefono?: string
          updated_at?: string
          user_id?: string | null
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
      empleados_roles: {
        Row: {
          empleado_id: string
          rol_id: string
        }
        Insert: {
          empleado_id: string
          rol_id: string
        }
        Update: {
          empleado_id?: string
          rol_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "empleados_roles_empleado_id_fkey"
            columns: ["empleado_id"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empleados_roles_rol_id_fkey"
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
          pie_factura: string
          razon_social: string | null
          rnc: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          itbis_porcentaje?: number
          pie_factura?: string
          razon_social?: string | null
          rnc?: string | null
          updated_at?: string
        }
        Update: {
          id?: boolean
          itbis_porcentaje?: number
          pie_factura?: string
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
          descuento: number
          descuento_tipo: string
          descuento_valor: number
          estado: Database["public"]["Enums"]["estado_factura"]
          id: string
          itbis: number
          metodo_pago: string | null
          numero: number
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
          descuento?: number
          descuento_tipo?: string
          descuento_valor?: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
          itbis?: number
          metodo_pago?: string | null
          numero?: number
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
          descuento?: number
          descuento_tipo?: string
          descuento_valor?: number
          estado?: Database["public"]["Enums"]["estado_factura"]
          id?: string
          itbis?: number
          metodo_pago?: string | null
          numero?: number
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
          mensaje_cita_confirmada: string
          mensaje_deposito_rechazado: string
          mensaje_recordatorio_cita: string
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
          mensaje_cita_confirmada?: string
          mensaje_deposito_rechazado?: string
          mensaje_recordatorio_cita?: string
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
          mensaje_cita_confirmada?: string
          mensaje_deposito_rechazado?: string
          mensaje_recordatorio_cita?: string
          moneda?: string
          nombre_comercial?: string
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      notificaciones_clientas: {
        Row: {
          cita_id: string | null
          clienta_id: string
          created_at: string
          id: string
          leida_at: string | null
          mensaje: string
          tipo: string
          titulo: string
        }
        Insert: {
          cita_id?: string | null
          clienta_id: string
          created_at?: string
          id?: string
          leida_at?: string | null
          mensaje: string
          tipo: string
          titulo: string
        }
        Update: {
          cita_id?: string | null
          clienta_id?: string
          created_at?: string
          id?: string
          leida_at?: string | null
          mensaje?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_clientas_cita_id_fkey"
            columns: ["cita_id"]
            isOneToOne: false
            referencedRelation: "citas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_clientas_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_compra: {
        Row: {
          creada_por: string | null
          created_at: string
          estado: string
          fecha: string
          id: string
          notas: string | null
          proveedor_id: string
          recibida_at: string | null
          total: number
        }
        Insert: {
          creada_por?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          notas?: string | null
          proveedor_id: string
          recibida_at?: string | null
          total?: number
        }
        Update: {
          creada_por?: string | null
          created_at?: string
          estado?: string
          fecha?: string
          id?: string
          notas?: string | null
          proveedor_id?: string
          recibida_at?: string | null
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_compra_creada_por_fkey"
            columns: ["creada_por"]
            isOneToOne: false
            referencedRelation: "empleados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_compra_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      ordenes_compra_lineas: {
        Row: {
          cantidad: number
          costo_unitario: number
          descripcion: string
          id: string
          orden_id: string
          producto_id: string | null
          subtotal: number | null
        }
        Insert: {
          cantidad: number
          costo_unitario: number
          descripcion: string
          id?: string
          orden_id: string
          producto_id?: string | null
          subtotal?: number | null
        }
        Update: {
          cantidad?: number
          costo_unitario?: number
          descripcion?: string
          id?: string
          orden_id?: string
          producto_id?: string | null
          subtotal?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_compra_lineas_orden_id_fkey"
            columns: ["orden_id"]
            isOneToOne: false
            referencedRelation: "ordenes_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_compra_lineas_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
        ]
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
          categoria: string
          contacto: string | null
          created_at: string
          direccion: string | null
          email: string | null
          forma_pago: string
          id: string
          moneda: string
          nombre: string
          nota: string | null
          pais: string
          plazo_entrega: string
          rnc: string | null
          suministra: string[]
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          categoria?: string
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          forma_pago?: string
          id?: string
          moneda?: string
          nombre: string
          nota?: string | null
          pais?: string
          plazo_entrega?: string
          rnc?: string | null
          suministra?: string[]
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          categoria?: string
          contacto?: string | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          forma_pago?: string
          id?: string
          moneda?: string
          nombre?: string
          nota?: string | null
          pais?: string
          plazo_entrega?: string
          rnc?: string | null
          suministra?: string[]
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
      solicitudes_cuenta: {
        Row: {
          clienta_id: string | null
          created_at: string
          email: string
          estado: string
          id: string
          nombre: string
          nota: string | null
          resuelta_at: string | null
          resuelta_por: string | null
          telefono: string
        }
        Insert: {
          clienta_id?: string | null
          created_at?: string
          email: string
          estado?: string
          id?: string
          nombre: string
          nota?: string | null
          resuelta_at?: string | null
          resuelta_por?: string | null
          telefono: string
        }
        Update: {
          clienta_id?: string | null
          created_at?: string
          email?: string
          estado?: string
          id?: string
          nombre?: string
          nota?: string | null
          resuelta_at?: string | null
          resuelta_por?: string | null
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_cuenta_clienta_id_fkey"
            columns: ["clienta_id"]
            isOneToOne: false
            referencedRelation: "clientas"
            referencedColumns: ["id"]
          },
        ]
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
          mostrar_en_web: boolean
          nombre: string
          precio: number
          slug: string
          web_dura: string | null
          web_foto_antes: string | null
          web_foto_despues: string | null
          web_foto_proceso: string | null
          web_incluye: string[]
          web_orden: number
          web_precio_desde: boolean
          pide_gramos: boolean
          web_retoque: string | null
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
          mostrar_en_web?: boolean
          nombre: string
          precio: number
          slug: string
          web_dura?: string | null
          web_foto_antes?: string | null
          web_foto_despues?: string | null
          web_foto_proceso?: string | null
          web_incluye?: string[]
          web_orden?: number
          web_precio_desde?: boolean
          pide_gramos?: boolean
          web_retoque?: string | null
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
          mostrar_en_web?: boolean
          nombre?: string
          precio?: number
          slug?: string
          web_dura?: string | null
          web_foto_antes?: string | null
          web_foto_despues?: string | null
          web_foto_proceso?: string | null
          web_incluye?: string[]
          web_orden?: number
          web_precio_desde?: boolean
          pide_gramos?: boolean
          web_retoque?: string | null
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
          atencion_inicio_at: string | null
          cita_id: string | null
          clienta_id: string
          created_at: string
          empleado_recepcion_id: string
          estado: Database["public"]["Enums"]["estado_visita"]
          estilista_id: string | null
          id: string
          notas: string | null
          servicio_fin_at: string | null
        }
        Insert: {
          atencion_inicio_at?: string | null
          cita_id?: string | null
          clienta_id: string
          created_at?: string
          empleado_recepcion_id: string
          estado?: Database["public"]["Enums"]["estado_visita"]
          estilista_id?: string | null
          id?: string
          notas?: string | null
          servicio_fin_at?: string | null
        }
        Update: {
          atencion_inicio_at?: string | null
          cita_id?: string | null
          clienta_id?: string
          created_at?: string
          empleado_recepcion_id?: string
          estado?: Database["public"]["Enums"]["estado_visita"]
          estilista_id?: string | null
          id?: string
          notas?: string | null
          servicio_fin_at?: string | null
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
      web_antes_despues: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          foto_url: string
          id: string
          orden: number
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url: string
          id?: string
          orden?: number
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          foto_url?: string
          id?: string
          orden?: number
        }
        Relationships: []
      }
      web_contenido: {
        Row: {
          clave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          clave: string
          updated_at?: string
          valor?: Json
        }
        Update: {
          clave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      web_testimonios: {
        Row: {
          activo: boolean
          created_at: string
          estrellas: number
          id: string
          nombre: string
          orden: number
          texto: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          estrellas?: number
          id?: string
          nombre: string
          orden?: number
          texto: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          estrellas?: number
          id?: string
          nombre?: string
          orden?: number
          texto?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_mis_datos: {
        Args: {
          p_fecha_nacimiento?: string
          p_nombre: string
          p_telefono: string
        }
        Returns: undefined
      }
      aplicar_descuento_factura: {
        Args: { p_factura_id: string; p_tipo: string; p_valor: number }
        Returns: undefined
      }
      registro_app_clienta: {
        Args: { p_clienta_id: string }
        Returns: { registrada: boolean; fecha: string | null }[]
      }
      solicitar_cuenta_app: {
        Args: { p_email: string; p_nombre: string; p_telefono: string }
        Returns: undefined
      }
      listar_solicitudes_cuenta: {
        Args: { p_estado?: string }
        Returns: {
          id: string
          nombre: string
          telefono: string
          email: string
          estado: string
          nota: string | null
          created_at: string
          resuelta_at: string | null
          clienta_id: string | null
          clienta_nombre: string | null
          clienta_telefono: string | null
          clienta_email: string | null
          clienta_tiene_cuenta: boolean | null
          clienta_visitas: number | null
          clienta_ultima_visita: string | null
          coincide_por: string | null
        }[]
      }
      resolver_solicitud_cuenta: {
        Args: { p_estado: string; p_id: string; p_nota?: string }
        Returns: undefined
      }
      registrar_acceso: { Args: { p_origen: string }; Returns: undefined }
      app_imagen_bienvenida: { Args: never; Returns: string }
      agregar_linea_factura: {
        Args: {
          p_cantidad?: number
          p_empleado_id?: string
          p_factura_id: string
          p_item_id: string
          p_tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Returns: string
      }
      aplicar_recepcion_orden: {
        Args: { p_orden_id: string }
        Returns: undefined
      }
      cambiar_estado_orden_compra: {
        Args: { p_estado: string; p_orden_id: string }
        Returns: undefined
      }
      cancelar_mi_cita: { Args: { p_cita_id: string }; Returns: undefined }
      catalogo_web: { Args: never; Returns: Json }
      clienta_id_actual: { Args: never; Returns: string }
      cobrar_factura: {
        Args: { p_factura_id: string; p_metodo_pago: string }
        Returns: undefined
      }
      contenido_web: { Args: never; Returns: Json }
      crear_cita_clienta: {
        Args: {
          p_comprobante_path?: string
          p_gramos?: number
          p_empleado_id: string
          p_fecha: string
          p_hora_inicio: string
          p_notas?: string
          p_servicio_id: string
        }
        Returns: string
      }
      crear_cita_publica: {
        Args: {
          p_comprobante_url: string
          p_email: string
          p_gramos?: number
          p_empleado_id: string
          p_fecha: string
          p_hora_fin: string
          p_hora_inicio: string
          p_nombre: string
          p_notas: string
          p_servicio_id: string
          p_telefono: string
        }
        Returns: string
      }
      crear_orden_compra: {
        Args: {
          p_estado: string
          p_fecha: string
          p_lineas: Json
          p_notas: string
          p_proveedor_id: string
        }
        Returns: string
      }
      dar_entrada_clienta: {
        Args: {
          p_cita_id?: string
          p_clienta_id: string
          p_estilista_id: string
          p_notas?: string
          p_servicio_id: string
          p_visita_id?: string
        }
        Returns: string
      }
      empleado_id_actual: { Args: never; Returns: string }
      enviar_recordatorio_cita: {
        Args: { p_cita_id: string }
        Returns: boolean
      }
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
      estilistas_publicos: {
        Args: { p_servicio_id: string }
        Returns: {
          foto_url: string
          id: string
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
      horarios_disponibles_rango: {
        Args: {
          p_dias?: number
          p_duracion_minutos: number
          p_empleado_id: string
        }
        Returns: {
          fecha: string
          hora_inicio: string
        }[]
      }
      invocar_edge_function: {
        Args: { p_body: Json; p_nombre: string }
        Returns: undefined
      }
      marcar_notificaciones_leidas: { Args: never; Returns: undefined }
      marcar_password_cambiada: { Args: never; Returns: undefined }
      mi_cabello: {
        Args: never
        Returns: {
          color: string
          instalada: string
          largo: number
          proximo_mantenimiento: string
          servicio: string
          tipo_cabello: Database["public"]["Enums"]["tipo_cabello"]
        }[]
      }
      mi_historial: {
        Args: { p_limite?: number }
        Returns: {
          detalle: string
          estilista: string
          fecha: string
          id: string
          servicio: string
        }[]
      }
      mis_checkins_pendientes: {
        Args: never
        Returns: {
          dia_programado: number
          estilista_nombre: string
          id: string
          instalada: string
          servicio_nombre: string
        }[]
      }
      mis_citas: {
        Args: never
        Returns: {
          deposito_estado: Database["public"]["Enums"]["estado_deposito"]
          deposito_limite: string
          deposito_monto: number
          empleado_id: string
          empleado_nombre: string
          estado: Database["public"]["Enums"]["estado_cita"]
          fecha: string
          hora_fin: string
          hora_inicio: string
          id: string
          requiere_deposito: boolean
          servicio_id: string
          servicio_nombre: string
        }[]
      }
      mis_notificaciones: {
        Args: never
        Returns: {
          cita_id: string
          created_at: string
          id: string
          leida: boolean
          mensaje: string
          tipo: string
          titulo: string
        }[]
      }
      mis_notificaciones_sin_leer: { Args: never; Returns: number }
      mis_permisos: { Args: never; Returns: string[] }
      mis_roles: { Args: never; Returns: string[] }
      mis_reportes_molestia: {
        Args: never
        Returns: {
          created_at: string
          descripcion: string
          estado: Database["public"]["Enums"]["estado_ticket"]
          id: string
          intensidad: number
          tipos_molestia: string[]
        }[]
      }
      porcentaje_comision_efectivo: {
        Args: {
          p_empleado_id: string
          p_tipo: Database["public"]["Enums"]["tipo_linea_factura"]
        }
        Returns: number
      }
      reagendar_mi_cita: {
        Args: { p_cita_id: string; p_fecha: string; p_hora_inicio: string }
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
      responder_mi_checkin: {
        Args: {
          p_check_in_id: string
          p_descripcion?: string
          p_foto_path?: string
          p_intensidad?: number
          p_respuesta: Database["public"]["Enums"]["respuesta_checkin"]
          p_tipos_molestia?: string[]
        }
        Returns: string
      }
      servicios_web: { Args: never; Returns: Json }
      subir_comprobante_cita: {
        Args: { p_cita_id: string; p_comprobante_path: string }
        Returns: undefined
      }
      texto_cita: { Args: { p_fecha: string; p_hora: string }; Returns: string }
      tiene_permiso: { Args: { p_clave: string }; Returns: boolean }
      tipo_de_usuario: { Args: never; Returns: string }
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
      estado_visita: "en_espera" | "en_atencion" | "por_cobrar" | "cerrada"
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
      estado_visita: ["en_espera", "en_atencion", "por_cobrar", "cerrada"],
      respuesta_checkin: ["bien", "molestia"],
      tipo_cabello: ["virgin", "remy"],
      tipo_linea_factura: ["servicio", "producto"],
    },
  },
} as const
