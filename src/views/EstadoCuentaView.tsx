import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronUp, CircleAlert, FileSpreadsheet, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { CuotasTable, estadoCompra } from '../components/Cronograma';
import { Imputacion } from '../components/PagoForm';
import { Empty, ErrorState, EstadoBadge, HelpTip, Loading } from '../components/ui';
import { useAuthStore } from '../store/authStore';
import type { EstadoCuenta, Moneda, PagoHistorial } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency, formatDate } from '../utils/format';
import { HELP } from '../utils/help';
export default function EstadoCuentaView() {
  const clienteId = useAuthStore((s) => s.user?.clienteId);
  const [state, setState] = useState<EstadoCuenta | null>(null);
  const [pagos, setPagos] = useState<PagoHistorial[]>([]);
  const [error, setError] = useState('');
  const [open, setOpen] = useState<number | null>(null);
  const load = useCallback(async () => {
    if (!clienteId) {
      setError('Tu sesión no tiene un cliente asociado. Vuelve a iniciar sesión.');
      return;
    }
    setError('');
    const [estado, historial] = await Promise.allSettled([api.get<EstadoCuenta>(`/api/clientes/${clienteId}/estado-cuenta`), api.get<PagoHistorial[]>(`/api/clientes/${clienteId}/pagos`)]);
    if (estado.status === 'fulfilled') setState(estado.value.data);
    else setError(getErrorMessage(estado.reason, 'No pudimos cargar tu estado de cuenta.'));
    if (historial.status === 'fulfilled') setPagos(historial.value.data);
  }, [clienteId]);
  useEffect(() => {
    void load();
  }, [load]);
  if (error) return <ErrorState message={error} onRetry={clienteId ? load : undefined} />;
  if (!state) return <Loading text="Cargando tu estado de cuenta..." />;
  const capital = state.compras.reduce((s, x) => s + x.capitalPendiente, 0);
  const interest = state.compras.reduce((s, x) => s + x.interesCompensatorio, 0);
  const late = state.compras.reduce((s, x) => s + x.interesMoratorio, 0);
  const enMora = late > 0 || state.compras.some((c) => c.estado === 'Mora');
  return (
    <div>
      <section className={`rounded-3xl p-6 text-white shadow-lg ${enMora ? 'bg-rose-600' : 'bg-indigo-600'}`}>
        <p className="flex items-center gap-1.5 text-sm text-white/80">
          Total a pagar
          <HelpTip text={HELP.montoPago} />
        </p>
        <p className="mt-2 text-4xl font-black tabular-nums">{formatCurrency(state.totalExigible, state.moneda)}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Fecha de corte: {formatDate(state.fechaCorte)}
            <HelpTip text={HELP.fechaCorte} />
          </span>
          <span className="rounded-full bg-white/15 px-3 py-1 font-semibold text-white">{enMora ? 'En mora' : 'Al día'}</span>
        </div>
      </section>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <Summary label="Capital" value={capital} moneda={state.moneda} />
        <Summary label="Interés" help={HELP.interesCompensatorio} value={interest} moneda={state.moneda} />
        <Summary label="Mora" help={HELP.interesMoratorio} value={late} moneda={state.moneda} danger />
      </div>
      <section className="mt-8">
        <div className="mb-4 flex justify-between">
          <div>
            <h2 className="text-lg font-black">Tus compras</h2>
            <p className="text-sm text-slate-500">{state.compras.length} operaciones pendientes</p>
          </div>
          <Landmark className="h-5 w-5 text-slate-300" />
        </div>
        {state.compras.length ? (
          <div className="space-y-3">
            {state.compras.map((item) => (
              <article key={item.compraId} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                <button onClick={() => setOpen(open === item.compraId ? null : item.compraId)} className="flex w-full items-center gap-3 p-4 text-left">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 font-bold text-indigo-600">{item.producto[0]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{item.producto}</p>
                    <p className="text-xs text-slate-500">Capital pendiente {formatCurrency(item.capitalPendiente, state.moneda)}</p>
                  </div>
                  <div className="text-right">
                    <b className="tabular-nums">{formatCurrency(item.totalExigible, state.moneda)}</b>
                    <div className="mt-1">
                      <EstadoBadge estado={estadoCompra(item)} />
                    </div>
                  </div>
                  {item.cuotas?.length ? open === item.compraId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" /> : null}
                </button>
                {open === item.compraId && item.cuotas && item.cuotas.length > 0 && (
                  <div className="border-t bg-slate-50 px-2 py-3">
                    <CuotasTable cuotas={item.cuotas} moneda={state.moneda} />
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white">
            <Empty text="No tienes compras pendientes. ¡Estás al día!" />
          </div>
        )}
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-black">Historial de pagos</h2>
        {pagos.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {pagos.map((pago) => (
              <article key={pago.id} className="rounded-2xl border bg-white p-4 shadow-sm">
                <p className="mb-2 text-xs text-slate-500">
                  {formatDate(pago.fechaPago)} · pago #{pago.id}
                </p>
                <Imputacion pago={pago} moneda={state.moneda} />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border bg-white">
            <Empty text="Aún no tienes pagos registrados." />
          </div>
        )}
      </section>
      {enMora && (
        <div className="mt-6 flex gap-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">
          <CircleAlert className="h-5 w-5 shrink-0" />
          Tu cuenta tiene intereses moratorios. Acércate a la tienda para pagar el monto exacto.
        </div>
      )}
      <Link to="/cliente/listado-corte" className="mt-6 flex items-center justify-center gap-2 rounded-2xl border bg-white p-4 text-sm font-semibold text-indigo-600">
        <FileSpreadsheet className="h-4 w-4" />
        Ver mi listado de corte
      </Link>
    </div>
  );
}
function Summary({ label, value, danger, help, moneda }: { label: string; value: number; danger?: boolean; help?: string; moneda?: Moneda }) {
  return (
    <div className={`rounded-2xl border p-3 ${danger && value > 0 ? 'border-rose-100 bg-rose-50' : 'bg-white'}`}>
      <p className="flex items-center gap-1 text-xs text-slate-500">
        {label}
        {help && <HelpTip text={help} />}
      </p>
      <p className={`mt-1 text-sm font-black tabular-nums ${danger && value > 0 ? 'text-rose-600' : ''}`}>{formatCurrency(value, moneda)}</p>
    </div>
  );
}
