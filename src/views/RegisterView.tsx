import { useEffect, useState, type FormEvent } from 'react';
import { CircleCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import BrandLogo from '../components/BrandLogo';
import { BusinessTypeField } from '../components/BusinessTypeField';
import { Button, Input } from '../components/ui';
import type { RegisterAdminRequest, RegistroResponse } from '../types';
import { getErrorMessage } from '../utils/errors';
import { HELP } from '../utils/help';
import { FIELD_LIMITS, validateStore } from '../utils/validation';

const emptyForm: RegisterAdminRequest = { ruc: '', razonSocial: '', giro: 'Minimarket', usuario: '', password: '' };

export default function RegisterView() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterAdminRequest>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate('/login?rol=Admin'), 2000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const update = (key: keyof RegisterAdminRequest) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = key === 'ruc' ? event.target.value.replace(/\D/g, '').slice(0, 11) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const invalid = validateStore(form);
    setError(invalid);
    if (invalid) return;
    setLoading(true);
    try {
      const { data } = await api.post<RegistroResponse>('/api/auth/register/admin', { ...form, razonSocial: form.razonSocial.trim(), giro: form.giro.trim(), usuario: form.usuario.trim() });
      const message = data?.mensaje || 'Tienda registrada correctamente.';
      setDone(message);
      toast.success(message);
    } catch (requestError) {
      const message = getErrorMessage(requestError, 'No pudimos registrar la tienda.');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-5 sm:py-10">
      <div className="mx-auto max-w-xl">
        <Link to="/login" aria-label="Volver al inicio de sesión"><BrandLogo className="h-20 w-32" priority /></Link>
        <div className="mt-5 rounded-2xl border bg-white p-4 shadow-sm sm:mt-8 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 sm:text-sm">Comienza con orden</p>
          <h1 className="mt-2 text-2xl font-black sm:text-3xl">Registra tu negocio</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Crea tu espacio para vender a crédito.</p>
          {done ? (
            <div className="mt-8 rounded-2xl bg-emerald-50 p-5 text-emerald-800 sm:p-6">
              <CircleCheck className="mb-3 h-8 w-8" /><p className="font-bold">{done}</p>
              <p className="mt-1 text-sm">Te llevamos al inicio de sesión...</p>
              <Link to="/login?rol=Admin" className="mt-4 inline-flex min-h-11 items-center font-bold text-indigo-600">Ir ahora</Link>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-8 grid gap-5 sm:grid-cols-2">
              <Input label="RUC" help={HELP.ruc} value={form.ruc} onChange={update('ruc')} inputMode="numeric" pattern="\d{11}" title="El RUC debe tener 11 dígitos" required />
              <Input label="Razón social" help={HELP.razonSocial} value={form.razonSocial} onChange={update('razonSocial')} minLength={FIELD_LIMITS.nameMin} maxLength={FIELD_LIMITS.nameMax} required />
              <BusinessTypeField value={form.giro} onChange={(giro) => setForm((current) => ({ ...current, giro }))} />
              <Input label="Usuario administrador" help={HELP.usuarioAdministrador} value={form.usuario} onChange={update('usuario')} autoComplete="username" minLength={FIELD_LIMITS.usernameMin} maxLength={FIELD_LIMITS.usernameMax} required />
              <Input label="Contraseña" help={HELP.password} type="password" value={form.password} onChange={update('password')} autoComplete="new-password" required minLength={FIELD_LIMITS.passwordMin} />
              {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 sm:col-span-2">{error}</p>}
              <Button loading={loading} type="submit" className="w-full sm:col-span-2">Crear mi cuenta</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
