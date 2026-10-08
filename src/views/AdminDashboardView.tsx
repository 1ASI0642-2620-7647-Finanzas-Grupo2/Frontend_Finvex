import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, CircleDollarSign, CreditCard, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/axios';
import { ErrorState } from '../components/ui';
import type { Cliente, ClienteDetalle, Moneda, Operacion, Pagina } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency, toDateInput } from '../utils/format';

type CarteraPorMoneda = Record<Moneda, number>;
const emptyPortfolio: CarteraPorMoneda = { PEN: 0, USD: 0 };

export default function AdminDashboardView() {
  const [clientes, setClientes] = useState<Cliente[] | null>(null);
  const [cartera, setCartera] = useState<CarteraPorMoneda | null>(null);
  const [pagosMes, setPagosMes] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get<Cliente[]>('/api/clientes');
        setClientes(data);
        const details = await Promise.allSettled(data.map((client) => api.get<ClienteDetalle>(`/api/clientes/${client.clienteId}`)));
        const totals = details.reduce<CarteraPorMoneda>((result, detail) => {
          if (detail.status === 'fulfilled') result[detail.value.data.moneda] += detail.value.data.deudaActual;
          return result;
        }, { ...emptyPortfolio });
        setCartera(totals);
        if (details.some((detail) => detail.status === 'rejected')) setError('No se pudo determinar la moneda de todos los clientes; la cartera muestra solo los saldos identificados.');
      } catch (requestError) {
        setError(getErrorMessage(requestError, 'No pudimos cargar el resumen.'));
      }
    };

    void loadSummary();
    const today = new Date();
    api.get<Pagina<Operacion>>('/api/auditoria', { params: { desde: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)), hasta: toDateInput(today), accion: 'Pago', pagina: 1, tamanoPagina: 1 } })
      .then(({ data }) => setPagosMes(data.totalRegistros))
      .catch(() => setPagosMes(null));
  }, []);

  const activos = clientes?.filter((client) => client.estado === 'Activo').length ?? 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600 sm:text-sm">Resumen general</p><h1 className="mt-2 break-words text-2xl font-black sm:text-3xl">{greeting}, administrador</h1><p className="mt-2 text-sm text-slate-500 sm:text-base">Esto es lo que pasa con tu cartera.</p></div>
        <Link to="clientes" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 sm:w-auto">Ver clientes <ArrowUpRight className="h-4 w-4" /></Link>
      </div>
      {error && <div className="mb-6"><ErrorState message={error} /></div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={<CircleDollarSign />} label="Cartera en soles (capital)" value={cartera ? formatCurrency(cartera.PEN, 'PEN') : '...'} />
        <Metric icon={<CircleDollarSign />} label="Cartera en dólares (capital)" value={cartera ? formatCurrency(cartera.USD, 'USD') : '...'} />
        <Metric icon={<Users />} label="Clientes activos" value={clientes ? String(activos) : '...'} />
        <Metric icon={<CreditCard />} label="Pagos registrados este mes" value={pagosMes === null ? '...' : String(pagosMes)} />
      </div>
      {clientes && clientes.length === 0 && <div className="mt-8 rounded-2xl border border-dashed bg-white p-6 text-center sm:p-10"><CircleDollarSign className="mx-auto h-10 w-10 text-indigo-600" /><h2 className="mt-4 text-lg font-bold">Tu cartera empieza aquí</h2><p className="mt-2 text-sm text-slate-500">Registra tu primer cliente y empieza a construir crédito.</p></div>}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="min-w-0 rounded-2xl border bg-white p-5 shadow-sm"><div className="mb-5 text-indigo-600">{icon}</div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 break-words text-2xl font-black tabular-nums">{value}</p></div>;
}
