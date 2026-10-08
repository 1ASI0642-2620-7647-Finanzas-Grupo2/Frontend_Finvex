export type Role = 'Admin' | 'Cliente' | 'AdminSistema';
export type ModalidadCompra = 'FinDeMes' | 'Cuotas';
export type TipoTasa = 'Nominal' | 'Efectiva';
export type Moneda = 'PEN' | 'USD';
export type EstadoDeuda = 'Pendiente' | 'Pagada' | 'Mora';
export type EstadoRegistro = 'Activo' | 'Inactivo';
export interface AuthUser {
  token: string;
  role: Role;
  id?: number;
  usuario?: string;
  tiendaId?: number | null;
  clienteId?: number | null;
  expiraEn?: string;
}
export interface LoginRequest {
  usuario: string;
  password: string;
}
export interface LoginResponse {
  token: string;
  rol: Role;
  id: number;
  tiendaId: number | null;
  clienteId: number | null;
  expiraEn: string;
}
export interface Cuota {
  numero: number;
  vencimiento: string;
  cuota: number;
  interes: number;
  amortizacion: number;
  estado: EstadoDeuda;
}
export interface Compra {
  compraId: number;
  producto: string;
  capitalPendiente: number;
  interesCompensatorio: number;
  interesMoratorio: number;
  totalExigible: number;
  estado: EstadoDeuda;
  cuotas?: Cuota[] | null;
}
export interface EstadoCuenta {
  clienteId: number;
  moneda: Moneda;
  fechaCorte: string;
  totalExigible: number;
  compras: Compra[];
}
export interface Cliente {
  clienteId: number;
  dni: string;
  nombres: string;
  limiteCredito: number;
  estado: EstadoRegistro | string;
  deudaActual: number;
}
export interface ClienteDetalle extends Cliente {
  usuario: string;
  creditoDisponible: number;
  tipoTasa: TipoTasa;
  tasaCompensatoria: number;
  tasaMoratoria: number;
  diaCorte: number;
  diaPago: number;
  moneda: Moneda;
  maxMeses: number;
  horaCorte: string;
}
export interface RegisterAdminRequest {
  ruc: string;
  razonSocial: string;
  giro: string;
  usuario: string;
  password: string;
}
export interface RegistroResponse {
  id: number;
  usuario: string;
  mensaje: string;
}
export interface ClienteRequest {
  dni: string;
  nombres: string;
  limiteCredito: number;
  tipoTasa: TipoTasa;
  tasaCompensatoria: number;
  tasaMoratoria: number;
  diaCorte: number;
  diaPago: number;
  usuario: string;
  password: string;
  moneda?: Moneda;
  maxMeses?: number;
  horaCorte?: string;
}
export type ClienteUpdateRequest = Omit<ClienteRequest, 'usuario' | 'password'> & { password?: string };
export interface CompraRequest {
  producto: string;
  precioCredito: number;
  modalidad: ModalidadCompra;
  plazoMeses: number;
  fechaCompra?: string;
  productoId?: number;
  cantidad?: number;
}
export interface CompraResponse {
  id: number;
  producto: string;
  precioCredito: number;
  modalidad: ModalidadCompra;
  estado: EstadoDeuda;
}
export interface PagoRequest {
  monto: number;
  fechaPago?: string;
}
export interface PagoResponse {
  monto: number;
  imputacionMora: number;
  imputacionInteres: number;
  imputacionCapital: number;
}
export interface PagoHistorial extends PagoResponse {
  id: number;
  fechaPago: string;
}
export interface Producto {
  id: number;
  proveedor: string | null;
  marca: string;
  descripcion: string;
  unidadMedida: string;
  imagenUrl: string | null;
  precioContado: number;
  precioLista: number;
  permiteFinDeMes: boolean;
  permiteCuotas: boolean;
  activo: boolean;
}
export interface ProductoRequest {
  marca: string;
  descripcion: string;
  unidadMedida: string;
  precioContado: number;
  precioLista: number;
  permiteFinDeMes: boolean;
  permiteCuotas: boolean;
  proveedor?: string;
}
export type TipoItemListado = 'Compra' | 'Cuota' | 'InteresMora';
export interface ItemListadoPago {
  tipo: TipoItemListado;
  compraId?: number | null;
  nroCuota?: number | null;
  descripcion: string;
  fecha: string;
  capital: number;
  dias: number;
  interesCompensatorio: number;
  monto: number;
}
export interface ListadoPago {
  clienteId: number;
  fechaCorte: string;
  fechaPago: string;
  fechaCalculo: string;
  total: number;
  items: ItemListadoPago[];
  listadoPagoId?: number | null;
  fechaGeneracionUtc?: string | null;
}
export interface Tienda {
  id: number;
  ruc: string;
  razonSocial: string;
  giro: string;
  usuario: string;
  activo: boolean;
  estado: string;
}
export type TiendaRequest = RegisterAdminRequest;
export const ACCIONES_AUDITORIA = ['LoginCorrecto', 'LoginFallido', 'Alta', 'Edicion', 'Baja', 'Reactivacion', 'Compra', 'Pago'] as const;
export type AccionAuditoria = (typeof ACCIONES_AUDITORIA)[number];
export interface Operacion {
  id: number;
  tiendaId?: number | null;
  actorRol: string;
  actorId?: number | null;
  accion: AccionAuditoria | string;
  entidad: string;
  entidadId?: number | null;
  detalle?: string | null;
  fechaUtc: string;
  fechaLima: string;
}
export interface Pagina<T> {
  items: T[];
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
}
