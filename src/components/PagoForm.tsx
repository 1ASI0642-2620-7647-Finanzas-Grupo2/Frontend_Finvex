import { useState, type FormEvent } from 'react';
import { CircleCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios';
import { Button, HelpTip, Input } from './ui';
import type { Moneda, PagoRequest, PagoResponse } from '../types';
import { getErrorMessage } from '../utils/errors';
import { formatCurrency, formatDate, round2, toApiDateTime, toDateInput } from '../utils/format';
import { HELP } from '../utils/help';

export interface PagoRegistrado extends PagoResponse {
  fechaPago: string;
  registradoEn: string;
}

type PagoFormProps = {
  clienteId: number;
  totalExigible: number;
  fechaProximoPago?: string | null;
  exigibleHoy?: number;
  moneda?: Moneda;
  onPaid: (pago: PagoRegistrado) => void;
  onClose: () => void;
};

const AYUDA_PROXIMO_PAGO =
  'El importe previsto corresponde al próximo vencimiento. Un pago solo puede registrarse cuando existan montos exigibles en la fecha indicada y su importe debe coincidir exactamente.';

const extraerMonto = (message: string): string | null => {
  const sinFechas = message
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?/g, ' ');
  const matches = [...sinFechas.matchAll(/(?:^|[^\d.,])(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2})(?![\d.])/g)];
  if (!matches.length) return null;
  const last = matches[matches.length - 1];
  const value = Number(`${last[1].replace(/,/g, '')}.${last[2]}`);
  return value > 0 ? value.toFixed(2) : null;
};

export function Imputacion({ pago, moneda }: { pago: PagoResponse; moneda?: Moneda }) {
  return (
    <dl className="divide-y rounded-xl border text-sm">
      {([
        ['1. Mora', pago.imputacionMora],
        ['2. Interés compensatorio', pago.imputacionInteres],
        ['3. Capital', pago.imputacionCapital]
      ] as const).map(([label, value]) => (
        <div key={label} className="flex justify-between px-4 py-2.5">
          <dt className="text-slate-500">{label}</dt>
          <dd className="font-semibold tabular-nums">{formatCurrency(value, moneda)}</dd>
        </div>
      ))}
      <div className="flex justify-between bg-slate-50 px-4 py-2.5">
        <dt className="font-bold">Total pagado</dt>
        <dd className="font-black tabular-nums">{formatCurrency(pago.monto, moneda)}</dd>
      </div>
    </dl>
  );
}

export default function PagoForm({
  clienteId,
  totalExigible,
  fechaProximoPago,
  exigibleHoy = 0,
  moneda,
  onPaid,
  onClose
}: PagoFormProps) {
  const [monto, setMonto] = useState(totalExigible.toFixed(2));
  const [fecha, setFecha] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [exacto, setExacto] = useState<string | null>(null);
  const [result, setResult] = useState<PagoRegistrado | null>(null);

  const hayExigibleHoy = exigibleHoy > 0;
  const fechaVencimiento = fechaProximoPago?.slice(0, 10);
  const pagoAntesDelVencimiento =
    !hayExigibleHoy && !!fechaVencimiento && !!fecha && fecha < fechaVencimiento;

  const limpiarError = () => {
    setError('');
    setExacto(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    limpiarError();
    const value = round2(Number(monto));

    if (!(value > 0)) {
      setError('El monto debe ser mayor que cero.');
      return;
    }

    setSaving(true);
    try {
      const body: PagoRequest = { monto: value, fechaPago: toApiDateTime(fecha) };
      const { data } = await api.post<PagoResponse>(`/api/clientes/${clienteId}/pagos`, body);
      const pago: PagoRegistrado = {
        ...data,
        fechaPago: fecha || toDateInput(),
        registradoEn: new Date().toISOString()
      };
      setResult(pago);
      toast.success('Pago registrado');
      onPaid(pago);
    } catch (err) {
      const message = getErrorMessage(err, 'No pudimos registrar el pago.');
      setError(message);
      setExacto(extraerMonto(message));
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <CircleCheck className="h-6 w-6" />
          <div>
            <p className="font-bold">Pago registrado</p>
            <p className="text-sm">Así se imputó el pago (mora → interés → capital):</p>
          </div>
        </div>
        <Imputacion pago={result} moneda={moneda} />
        <Button className="w-full" onClick={onClose}>Listo</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
        El pago debe ser exacto y se imputará primero a la mora, luego al interés y finalmente al capital.
        <HelpTip text={HELP.imputacion} />
      </p>

      <div className="flex flex-col gap-2 rounded-xl border p-4 text-sm min-[375px]:flex-row min-[375px]:items-center min-[375px]:justify-between">
        <span className="flex items-center gap-1.5 text-slate-500">
          {hayExigibleHoy ? 'Total exigible hoy' : 'Importe del próximo pago previsto'}
          <HelpTip text={AYUDA_PROXIMO_PAGO} />
        </span>
        <b className="break-words text-lg tabular-nums">
          {formatCurrency(hayExigibleHoy ? exigibleHoy : totalExigible, moneda)}
        </b>
      </div>

      {!hayExigibleHoy && fechaVencimiento && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          No existen montos exigibles hoy. El próximo vencimiento es el{' '}
          <strong>{formatDate(fechaVencimiento)}</strong>.
          Si introduces una fecha futura para simular el pago, el sistema registrará esa operación en la base de datos.
        </p>
      )}

      <Input
        label="Monto a pagar"
        help={HELP.montoPago}
        type="number"
        min="0.01"
        step="0.01"
        value={monto}
        onChange={(event) => { setMonto(event.target.value); limpiarError(); }}
        required
      />
      <Input
        label="Fecha de pago"
        help={HELP.fechaPago}
        type="date"
        value={fecha}
        onChange={(event) => { setFecha(event.target.value); limpiarError(); }}
      />

      {fecha && fecha !== toDateInput() && (
        <p className="text-xs text-amber-700">
          Con otra fecha el importe exacto puede variar; si no coincide, el servidor te indicará el importe correcto.
        </p>
      )}
      {pagoAntesDelVencimiento && (
        <p className="text-xs text-amber-700">
          La fecha seleccionada es anterior al próximo vencimiento y puede no tener montos exigibles.
        </p>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
          <p>{error}</p>
          {exacto && exacto !== Number(monto).toFixed(2) && (
            <button
              type="button"
              onClick={() => { setMonto(exacto); limpiarError(); }}
              className="mt-2 min-h-11 font-bold underline"
            >
              Usar {formatCurrency(Number(exacto), moneda)}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
          Cancelar
        </Button>
        <Button loading={saving} type="submit" className="flex-1">
          Confirmar pago
        </Button>
      </div>
    </form>
  );
}
