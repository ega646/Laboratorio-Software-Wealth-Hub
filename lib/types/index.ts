// Tipos que reflejan el modelo de base de datos (Modelo/DataBase.sql)
// adaptado para Supabase (usuarios → auth.users + perfiles)

// ── Catálogo (tablas de solo lectura) ──────────────────────────

export interface Idioma {
  codigo: string
  descripcion: string
}

export interface Divisa {
  codigo: string
  descripcion: string
}

export interface PerfilRiesgo {
  codigo: string
  descripcion: string
}

export interface TipoCuenta {
  codigo: string
  descripcion: string
}

export interface TipoActivo {
  codigo: string
  descripcion: string
  logo: string | null
  riesgocodigo: string
}

export interface Activo {
  codigo: number
  descripcion: string
  tipocodigo: string
  divisacodigo: string
  color: string
  simbolo: string | null
  // joins opcionales
  tiposactivos?: TipoActivo
  divisas?: Divisa
}

export interface ValorHistorico {
  activocodigo: number
  fecha: string
  valor: number
}

export interface Cambio {
  divisaorigen: string
  divisadestino: string
  fecini: string
  fecfin: string | null
  cambio: number
}

// ── Datos de usuario ───────────────────────────────────────────

// Reemplaza la tabla "usuarios" de DataBase.sql
// El email y contraseña viven en auth.users (Supabase Auth)
export interface Perfil {
  id: string                       // UUID → auth.users.id
  nombrecompleto: string
  telefono: string | null
  perfilriesgocodigo: string | null
  divisabasecodigo: string | null
  idiomacodigo: string | null
  formatofecha: string
  ultimoacceso: string
  created_at: string
  // campo extra que se añade desde auth.users al hacer GET /api/perfil
  email?: string
}

export interface Cuenta {
  usuario_id: string
  tipocuentacodigo: string
  numerocuenta: number
  fechaenlace: string | null
  activa: boolean
  apikey_cifrada: string | null
  // join opcional
  tiposcuentas?: TipoCuenta
}

// Posición de un usuario en un activo (tabla activosposeidos)
export interface ActivoPoseido {
  usuario_id: string
  activocodigo: number
  cantidad: number
  fechainicio: string | null
  precio_compra: number
  // joins opcionales
  activos?: Activo
}

// Vista enriquecida que combina ActivoPoseido + precio actual desde valorhistoricoactivo
export interface ActivoPoseidoConPrecio extends ActivoPoseido {
  precio_actual: number
  simbolo_divisa: string
  valor_total: number
  rentabilidad_pct: number
  precio_promedio_compra?: number
}

// Para insertar/actualizar una posición
export type NuevaPosition = {
  activocodigo: number
  cantidad: number
  fechainicio?: string
  precio_compra?: number
}

// Resumen del portfolio calculado por GET /api/portfolio
export interface ResumenPortfolio {
  divisaFinal?: string
  simboloDivisa: string
  patrimonio_total: number,
  distribucion: {
    nombre: string
    valor: number
    porcentaje: number
    color: string
  }[]
  mejor_activo: {
    descripcion: string
    codigo: number
    rentabilidad_pct: number
  } | null
}

// Resumen de la informacion calculada por GET /api/historicalData
export interface HistoricalDataGlobal {
    day:   Date
    value: number
}

// ── UC14: Recomendaciones de cartera ────────────────────────

export type SeveridadRecomendacion = 'info' | 'warn' | 'critical'
export type EstadoRecomendacion = 'activa' | 'ignorada' | 'recordar'
export type TipoRecomendacion = 'desbalance_cartera'

export interface Recomendacion {
  id: number
  usuario_id: string
  tipo: TipoRecomendacion
  severidad: SeveridadRecomendacion
  titulo: string
  mensaje: string
  datos_json: DatosDesbalance | Record<string, unknown>
  estado: EstadoRecomendacion
  fecha_creacion: string
  fecha_recordatorio: string | null
}

// Estructura de datos_json cuando tipo = 'desbalance_cartera'
export interface DatosDesbalance {
  perfil: 'BAJO' | 'MEDIO' | 'ALTO'
  distribucion_actual: {
    tipo: string
    porcentaje: number
    valor: number
  }[]
  distribucion_target: Record<string, number>
  desviaciones: {
    tipo: string
    pctActual: number
    pctTarget: number
    desviacionAbs: number
    severidad: SeveridadRecomendacion
  }[]
}
