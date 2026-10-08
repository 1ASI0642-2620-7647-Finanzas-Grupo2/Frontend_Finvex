import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, CircleDollarSign, FileSpreadsheet, Pencil, Power, PowerOff, ShoppingBag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import ClienteForm from '../components/ClienteForm';
import CompraForm from '../components/CompraForm';
import { ComprasList } from '../components/Cronograma';
import PagoForm, { Imputacion } from '../components/PagoForm';
import { Button, Card, ConfirmModal, Empty, ErrorState, EstadoBadge, HelpTip, Loading, Modal } from '../components/ui';
import type { ClienteDetalle, EstadoCuenta, PagoHistorial } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency, formatDate, formatPercent } from '../utils/format';
import { HELP } from '../utils/help';
export default function DetalleClienteView() {
  const { clienteId = '' } = useParams();
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null);
  const [state, setState] = useState<EstadoCuenta | null>(null);
  const [error, setError] = useState('');
  const [estadoError, setEstadoError] = useState('');
  const [pagosError, setPagosError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'compra' | 'pago' | 'editar' | 'estado' | null>(null);
  const [toggling, setToggling] = useState(false);
  const [pagos, setPagos] = useState<PagoHistorial[]>([]);
  const load = useCallback(async () => {
    if (!clienteId) return;
    setError('');
    setEstadoError('');
    setPagosError('');
    const [detalle, estado, historial] = await Promise.allSettled([api.get<ClienteDetalle>(`/api/clientes/${clienteId}`), api.get<EstadoCuenta>(`/api/clientes/${clienteId}/estado-cuenta`), api.get<PagoHistorial[]>(`/api/clientes/${clienteId}/pagos`)]);
    if (detalle.status === 'fulfilled') setCliente(detalle.value.data);
    else setError(getErrorMessage(detalle.reason, 'No pudimos cargar al cliente.'));
    if (estado.status === 'fulfilled') setState(estado.value.data);
    else setEstadoError(getErrorMessage(estado.reason, 'No pudimos cargar el estado de cuenta.'));
    if (historial.status === 'fulfilled') setPagos(historial.value.data);
    else setPagosError(getErrorMessage(historial.reason, 'No pudimos cargar el historial de pagos.'));
    setLoading(false);
  }, [clienteId]);
  useEffect(() => {
    setLoading(true);
    void load();
  }, [clienteId, load]);
  const addPago = () => void load();
  const toggleEstado = async () => {
    if (!cliente) return;
    const activo = cliente.estado === 'Activo';
    setToggling(true);
    try {
      const { data } = await api.put<ClienteDetalle>(`/api/clientes/${clienteId}/${activo ? 'baja' : 'alta'}`);
      setCliente(data);
      toast.success(activo ? 'Cliente dado de baja' : 'Cliente reactivado');
      setModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'No pudimos cambiar el estado del cliente.'));
    } finally {
      setToggling(false);
    }
  };
  if (loading) return <Loading text="Cargando cliente..." />;
  if (!cliente)
    return (
      <div>
        <BackLink />
        <ErrorState message={error} onRetry={() => void load()} />
      </div>
    );
  const moneda = cliente.moneda;
  const activo = cliente.estado === 'Activo';
  const enMora = !!state?.compras.some((c) => c.estado === 'Mora' || c.interesMoratorio > 0);
  return (
    <div>
      <BackLink />
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">Cuenta del cliente</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-2 break-words text-2xl font-black sm:gap-3 sm:text-3xl">
            {cliente.nombres}
            <EstadoBadge estado={cliente.estado} />
            {state && <EstadoBadge estado={enMora ? 'Mora' : 'Pendiente'} />}
          </h1>
          <p className="mt-2 break-words text-sm text-slate-500 sm:text-base">
            DNI {cliente.dni} · Usuario {cliente.usuario} · Cliente #{cliente.clienteId}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="secondary" onClick={() => setModal('editar')}>
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          {activo ? (
            <Button variant="danger" onClick={() => setModal('estado')}>
              <PowerOff className="h-4 w-4" />
              Dar de baja
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setModal('estado')}>
              <Power className="h-4 w-4" />
              Dar de alta
            </Button>
          )}
          <Link to="listado-corte" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:px-4">
            <FileSpreadsheet className="h-4 w-4" />
            Listado de corte
          </Link>
          <Button variant="secondary" onClick={() => setModal('pago')} disabled={!state || state.totalExigible <= 0}>
            <CircleDollarSign className="h-4 w-4" />
            Registrar pago
          </Button>
          <Button onClick={() => setModal('compra')} disabled={!activo} title={activo ? undefined : 'El cliente está inactivo'}>
            <ShoppingBag className="h-4 w-4" />
            Registrar compra
          </Button>
        </div>
      </div>
      {!activo && <p className="mb-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600">Este cliente está dado de baja: no puede iniciar sesión ni registrar compras. Puedes seguir cobrando su deuda.</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Límite de crédito" help={HELP.limiteCredito} value={formatCurrency(cliente.limiteCredito, moneda)} />
        <Stat label="Crédito disponible" help={HELP.creditoDisponible} value={formatCurrency(cliente.creditoDisponible, moneda)} tone={cliente.creditoDisponible <= 0 ? 'danger' : 'success'} />
        <Stat label="Deuda actual (capital)" value={formatCurrency(cliente.deudaActual, moneda)} />
        <Stat label="Moneda" help={HELP.moneda} value={moneda === 'USD' ? 'Dólares (US$)' : 'Soles (S/)'} />
      </div>
      <Card className="mb-8">
        <div className="border-b p-5">
          <h2 className="font-bold">Condiciones del crédito</h2>
        </div>
        <dl className="grid gap-x-6 gap-y-4 p-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Item label="Tipo de tasa" help={HELP.tipoTasa}>
            {cliente.tipoTasa === 'Efectiva' ? 'Efectiva anual (TEA)' : 'Nominal anual (TNA)'}
          </Item>
          <Item label="Tasa compensatoria" help={HELP.tasaCompensatoria}>
            {formatPercent(cliente.tasaCompensatoria)}
          </Item>
          <Item label="Tasa moratoria" help={HELP.tasaMoratoria}>
            {formatPercent(cliente.tasaMoratoria)}
          </Item>
          <Item label="Plazo máximo" help={HELP.maxMeses}>
            {cliente.maxMeses} {cliente.maxMeses === 1 ? 'mes' : 'meses'}
          </Item>
          <Item label="Día de corte" help={HELP.diaCorte}>
            Día {cliente.diaCorte}
          </Item>
          <Item label="Hora de corte" help={HELP.horaCorte}>
            {cliente.horaCorte || 'No definida'}
          </Item>
          <Item label="Día de pago" help={HELP.diaPago}>
            Día {cliente.diaPago}
          </Item>
        </dl>
      </Card>
      {estadoError ? (
        <ErrorState message={estadoError} onRetry={() => void load()} />
      ) : (
        state && (
          <>
            <div className={`mb-8 rounded-2xl p-4 text-white sm:p-6 ${enMora ? 'bg-rose-700' : 'bg-slate-950'}`}>
              <p className="flex items-center gap-1.5 text-sm text-white/70">
                Total exigible
                <HelpTip text={HELP.totalExigible} />
              </p>
              <p className="mt-2 break-words text-3xl font-black tabular-nums sm:text-4xl">{formatCurrency(state.totalExigible, moneda)}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-white/70">
                Corte del ciclo: {formatDate(state.fechaCorte)}
                <HelpTip text={HELP.fechaCorte} />
              </p>
            </div>
            <Card>
              <div className="border-b p-5">
                <h2 className="font-bold">Compras pendientes y cronograma</h2>
              </div>
              {state.compras.length ? <ComprasList compras={state.compras} moneda={moneda} /> : <Empty text="El cliente no tiene compras pendientes." />}
            </Card>
          </>
        )
      )}
      <Card className="mt-8">
        <div className="border-b p-5">
          <h2 className="flex items-center gap-1.5 font-bold">
            Historial de pagos persistidos
            <HelpTip text={HELP.imputacion} />
          </h2>
        </div>
        {pagosError ? (
          <div className="p-5">
            <ErrorState message={pagosError} onRetry={() => void load()} />
          </div>
        ) : pagos.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2">
            {pagos.map((p) => (
              <div key={p.id}>
                <p className="mb-2 text-xs text-slate-500">
                  Fecha de pago {formatDate(p.fechaPago)} · pago #{p.id}
                </p>
                <Imputacion pago={p} moneda={moneda} />
              </div>
            ))}
          </div>
        ) : (
          <Empty text="Aún no hay pagos registrados para este cliente." />
        )}
      </Card>
      <Modal open={modal === 'compra'} title="Registrar compra" onClose={() => setModal(null)}>
        <CompraForm
          cliente={cliente}
          onSaved={() => {
            setModal(null);
            void load();
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <Modal open={modal === 'pago'} title="Registrar pago" onClose={() => setModal(null)}>
        {state && <PagoForm clienteId={cliente.clienteId} totalExigible={state.totalExigible} moneda={moneda} onPaid={addPago} onClose={() => setModal(null)} />}
      </Modal>
      <Modal open={modal === 'editar'} title="Editar cliente" onClose={() => setModal(null)} wide>
        <ClienteForm
          cliente={cliente}
          onSaved={(data) => {
            if (data) setCliente(data);
            setModal(null);
            void load();
          }}
          onCancel={() => setModal(null)}
        />
      </Modal>
      <ConfirmModal
        open={modal === 'estado'}
        title={activo ? 'Dar de baja al cliente' : 'Dar de alta al cliente'}
        message={
          activo ? (
            <>
              ¿Seguro que deseas dar de baja a <b>{cliente.nombres}</b>? No podrá iniciar sesión ni registrar nuevas compras. Su deuda se conserva.
            </>
          ) : (
            <>
              ¿Reactivar a <b>{cliente.nombres}</b>?
            </>
          )
        }
        confirmLabel={activo ? 'Dar de baja' : 'Dar de alta'}
        danger={activo}
        loading={toggling}
        onConfirm={() => void toggleEstado()}
        onClose={() => setModal(null)}
      />
    </div>
  );
}
function BackLink() {
  return (
    <Link to="/admin/clientes" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-500">
      <ArrowLeft className="h-4 w-4" />
      Volver a clientes
    </Link>
  );
}
function Stat({ label, value, help, tone }: { label: string; value: string; help?: string; tone?: 'danger' | 'success' }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="flex items-center gap-1.5 text-sm text-slate-500">
        {label}
        {help && <HelpTip text={help} />}
      </p>
      <p className={`mt-1 text-2xl font-black tabular-nums ${tone === 'danger' ? 'text-rose-600' : tone === 'success' ? 'text-emerald-600' : ''}`}>{value}</p>
    </div>
  );
}
function Item({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-slate-500">
        {label}
        {help && <HelpTip text={help} />}
      </dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  );
}
