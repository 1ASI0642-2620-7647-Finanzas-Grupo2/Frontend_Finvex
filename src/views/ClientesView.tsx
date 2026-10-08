import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Pencil, Plus, Power, PowerOff, Search, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import ClienteForm from '../components/ClienteForm';
import { Button, ConfirmModal, Empty, ErrorState, EstadoBadge, Loading, Modal, PageHeader, Select } from '../components/ui';
import type { Cliente, ClienteDetalle, Moneda } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency } from '../utils/format';

export default function ClientesView() {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [currencies, setCurrencies] = useState<Record<number, Moneda>>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteDetalle | null>(null);
  const [toggle, setToggle] = useState<Cliente | null>(null);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Cliente[]>('/api/clientes');
      setClients(data);
      void Promise.allSettled(data.map((client) => api.get<ClienteDetalle>(`/api/clientes/${client.clienteId}`))).then((results) => {
        setCurrencies(Object.fromEntries(results.flatMap((result) => result.status === 'fulfilled' ? [[result.value.data.clienteId, result.value.data.moneda]] : [])));
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No pudimos cargar los clientes.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const edit = async (client: Cliente) => {
    try {
      const { data } = await api.get<ClienteDetalle>(`/api/clientes/${client.clienteId}`);
      setEditing(data);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'No pudimos cargar al cliente.'));
    }
  };

  const confirmToggle = async () => {
    if (!toggle) return;
    const active = toggle.estado === 'Activo';
    setToggling(true);
    try {
      await api.put(`/api/clientes/${toggle.clienteId}/${active ? 'baja' : 'alta'}`);
      toast.success(active ? 'Cliente dado de baja' : 'Cliente reactivado');
      setToggle(null);
      await load();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'No pudimos cambiar el estado del cliente.'));
    } finally {
      setToggling(false);
    }
  };

  const filtered = clients.filter((client) => `${client.nombres} ${client.dni}`.toLowerCase().includes(search.toLowerCase()) && (!status || client.estado === status));

  return (
    <div>
      <PageHeader eyebrow="Cartera" title="Clientes y créditos" subtitle="Una vista clara de tus relaciones comerciales." actions={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Nuevo cliente</Button>} />
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b p-3 sm:flex-row sm:p-4">
          <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o DNI" aria-label="Buscar clientes" className="min-h-11 w-full rounded-xl border py-2.5 pl-10 pr-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm" /></div>
          <div className="sm:w-48"><Select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filtrar por estado"><option value="">Todos los estados</option><option value="Activo">Activos</option><option value="Inactivo">Inactivos</option></Select></div>
        </div>
        {loading ? <Loading text="Cargando clientes..." /> : error ? <div className="p-4"><ErrorState message={error} onRetry={() => void load()} /></div> : (
          <div className="divide-y">{filtered.length ? filtered.map((client) => (
            <article key={client.clienteId} className={`p-4 hover:bg-slate-50 sm:p-5 ${client.estado === 'Inactivo' ? 'opacity-70' : ''}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <Link to={`/admin/clientes/${client.clienteId}`} className="group min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600"><UserRound className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1"><p className="flex flex-wrap items-center gap-2 break-words font-bold">{client.nombres}<EstadoBadge estado={client.estado} /></p><p className="text-sm text-slate-500">DNI {client.dni}</p></div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-end justify-between gap-2 pl-[3.25rem] sm:justify-start sm:gap-6"><div><p className="text-xs text-slate-500">Deuda actual</p><p className={`break-words font-bold ${client.deudaActual > 0 ? 'text-slate-900' : 'text-slate-500'}`}>{formatCurrency(client.deudaActual, currencies[client.clienteId])}</p></div><div><p className="text-xs text-slate-500">Límite</p><p className="break-words text-sm font-semibold">{formatCurrency(client.limiteCredito, currencies[client.clienteId])}</p></div></div>
                </Link>
                <div className="grid grid-cols-2 gap-2 sm:flex lg:ml-4"><Button variant="secondary" onClick={() => void edit(client)}><Pencil className="h-4 w-4" />Editar</Button>{client.estado === 'Activo' ? <Button variant="danger" onClick={() => setToggle(client)}><PowerOff className="h-4 w-4" />Dar de baja</Button> : <Button variant="secondary" onClick={() => setToggle(client)}><Power className="h-4 w-4" />Dar de alta</Button>}</div>
              </div>
            </article>
          )) : <Empty text={clients.length ? 'Ningún cliente coincide con la búsqueda.' : 'Aún no hay clientes registrados.'}>{!clients.length && <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Registrar el primero</Button>}</Empty>}</div>
        )}
      </div>
      <Modal open={createOpen} title="Nuevo cliente" onClose={() => setCreateOpen(false)} wide><ClienteForm onSaved={() => { setCreateOpen(false); void load(); }} onCancel={() => setCreateOpen(false)} /></Modal>
      <Modal open={!!editing} title="Editar cliente" onClose={() => setEditing(null)} wide>{editing && <ClienteForm key={editing.clienteId} cliente={editing} onSaved={() => { setEditing(null); void load(); }} onCancel={() => setEditing(null)} />}</Modal>
      <ConfirmModal open={!!toggle} title={toggle?.estado === 'Activo' ? 'Dar de baja al cliente' : 'Dar de alta al cliente'} message={toggle?.estado === 'Activo' ? <>¿Seguro que deseas dar de baja a <b>{toggle?.nombres}</b>? No podrá iniciar sesión ni registrar nuevas compras. Su deuda se conserva.</> : <>¿Reactivar a <b>{toggle?.nombres}</b>? Podrá volver a iniciar sesión y comprar.</>} confirmLabel={toggle?.estado === 'Activo' ? 'Dar de baja' : 'Dar de alta'} danger={toggle?.estado === 'Activo'} loading={toggling} onConfirm={() => void confirmToggle()} onClose={() => setToggle(null)} />
    </div>
  );
}
