export type Role = 'Admin' | 'Cliente';
export type ModalidadCompra = 'FinDeMes' | 'Cuotas';
export interface AuthUser { token: string; role: Role; tiendaId?: number; clienteId?: number; }
export interface Cuota { numero: number; vencimiento: string; cuota: number; interes: number; amortizacion: number; estado: 'Pendiente' | 'Pagada' | 'ConMora'; }
export interface Compra { compraId: number; producto: string; capitalPendiente: number; interesCompensatorio: number; interesMoratorio: number; totalExigible: number; estado: string; cuotas?: Cuota[]; }
export interface EstadoCuenta { clienteId: number; fechaCorte: string; totalExigible: number; compras: Compra[]; }
export interface Cliente { clienteId: number; dni: string; nombres: string; limiteCredito: number; estado: string; deudaActual: number; }
export interface RegisterAdminRequest { ruc: string; razonSocial: string; giro: string; usuario: string; password: string; }
export interface ClienteRequest { dni: string; nombres: string; limiteCredito: number; tipoTasa: string; tasaCompensatoria: number; tasaMoratoria: number; diaCorte: number; diaPago: number; usuario: string; password: string; }
export interface CompraRequest { producto: string; precioCredito: number; modalidad: ModalidadCompra; plazoMeses?: number; fechaCompra: string; }
export interface PagoRequest { monto: number; fechaPago: string; }
