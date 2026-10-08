import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Plus, Power, PowerOff, Search, Store } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import { BusinessTypeField } from '../components/BusinessTypeField';
import { Button, Card, ConfirmModal, Empty, ErrorState, EstadoBadge, Input, Loading, Modal, PageHeader } from '../components/ui';
import type { Tienda, TiendaRequest } from '../types';
import { getErrorMessage } from '../utils/errors';
import { HELP } from '../utils/help';
import { FIELD_LIMITS, validateStore } from '../utils/validation';

const emptyForm: TiendaRequest = { ruc: '', razonSocial: '', giro: 'Minimarket', usuario: '', password: '' };

export default function TiendasView() {
  const [tiendas, setTiendas] = useState<Tienda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TiendaRequest>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toggle, setToggle] = useState<Tienda | null>(null);
  const [toggling, setToggling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get<Tienda[]>('/api/sistema/tiendas');
      setTiendas(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'No pudimos cargar las tiendas.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const update = (key: keyof TiendaRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'ruc' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateStore(form);
    setFormError(invalid);
    if (invalid) return;
    setSaving(true);
    try {
      await api.post<Tienda>('/api/sistema/tiendas', { ...form, razonSocial: form.razonSocial.trim(), giro: form.giro.trim(), usuario: form.usuario.trim() });
      toast.success('Tienda registrada');
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'No pudimos registrar la tienda.');
      setFormError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const confirmToggle = async () => {
    if (!toggle) return;
    setToggling(true);
    try {
      await api.put<Tienda>(`/api/sistema/tiendas/${toggle.id}/${toggle.activo ? 'baja' : 'alta'}`);
      toast.success(toggle.activo ? 'Tienda dada de baja' : 'Tienda reactivada');
      setToggle(null);
      await load();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, 'No pudimos cambiar el estado de la tienda.'));
    } finally {
      setToggling(false);
    }
  };

  const filtered = tiendas.filter((tienda) => `${tienda.razonSocial} ${tienda.ruc} ${tienda.usuario}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader eyebrow="Plataforma" title="Tiendas" subtitle="Comercios registrados en FINVEX." actions={<Button onClick={() => { setForm(emptyForm); setFormError(''); setOpen(true); }}><Plus className="h-4 w-4" />Nueva tienda</Button>} />
      <Card>
        <div className="border-b p-3 sm:p-4">
          <div className="relative max-w-sm"><Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por razón social, RUC o usuario" aria-label="Buscar tiendas" className="min-h-11 w-full rounded-xl border py-2.5 pl-10 pr-3 text-base outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:text-sm" /></div>
        </div>
        {loading ? <Loading text="Cargando tiendas..." /> : error ? <div className="p-4"><ErrorState message={error} onRetry={() => void load()} /></div> : filtered.length ? (
          <div className="table-scroll overflow-x-auto" tabIndex={0} aria-label="Tabla de tiendas, desplaza horizontalmente en pantallas pequeñas">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Tienda</th><th className="px-5 py-3">RUC</th><th className="px-5 py-3">Giro</th><th className="px-5 py-3">Usuario</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead>
              <tbody className="divide-y">{filtered.map((tienda) => <tr key={tienda.id} className={tienda.activo ? '' : 'opacity-70'}><td className="px-5 py-4"><span className="flex items-center gap-3 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Store className="h-4 w-4" /></span>{tienda.razonSocial}</span></td><td className="px-5 py-4 tabular-nums">{tienda.ruc}</td><td className="px-5 py-4 text-slate-500">{tienda.giro}</td><td className="px-5 py-4">{tienda.usuario}</td><td className="px-5 py-4"><EstadoBadge estado={tienda.activo ? 'Activa' : 'Inactiva'} /></td><td className="px-5 py-4 text-right">{tienda.activo ? <Button variant="danger" onClick={() => setToggle(tienda)}><PowerOff className="h-4 w-4" />Dar de baja</Button> : <Button variant="secondary" onClick={() => setToggle(tienda)}><Power className="h-4 w-4" />Dar de alta</Button>}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <Empty text={tiendas.length ? 'Ninguna tienda coincide con la búsqueda.' : 'Aún no hay tiendas registradas.'} />}
      </Card>

      <Modal open={open} title="Nueva tienda" onClose={() => setOpen(false)}>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <Input label="RUC" help={HELP.ruc} value={form.ruc} onChange={update('ruc')} inputMode="numeric" pattern="\d{11}" required />
          <Input label="Razón social" help={HELP.razonSocial} value={form.razonSocial} onChange={update('razonSocial')} minLength={FIELD_LIMITS.nameMin} maxLength={FIELD_LIMITS.nameMax} required />
          <BusinessTypeField value={form.giro} onChange={(giro) => setForm((current) => ({ ...current, giro }))} />
          <Input label="Usuario administrador" help={HELP.usuarioAdministrador} value={form.usuario} onChange={update('usuario')} autoComplete="off" minLength={FIELD_LIMITS.usernameMin} maxLength={FIELD_LIMITS.usernameMax} required />
          <Input label="Contraseña" help={HELP.password} type="password" value={form.password} onChange={update('password')} autoComplete="new-password" minLength={FIELD_LIMITS.passwordMin} required />
          {formError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{formError}</p>}
          <Button type="submit" loading={saving} className="w-full sm:col-span-2">Registrar tienda</Button>
        </form>
      </Modal>
      <ConfirmModal open={!!toggle} title={toggle?.activo ? 'Dar de baja la tienda' : 'Dar de alta la tienda'} message={toggle?.activo ? <>¿Seguro que deseas dar de baja a <b>{toggle?.razonSocial}</b>? Su administrador no podrá iniciar sesión.</> : <>¿Reactivar a <b>{toggle?.razonSocial}</b>? Su administrador podrá volver a iniciar sesión.</>} confirmLabel={toggle?.activo ? 'Dar de baja' : 'Dar de alta'} danger={toggle?.activo} loading={toggling} onConfirm={() => void confirmToggle()} onClose={() => setToggle(null)} />
    </div>
  );
}
