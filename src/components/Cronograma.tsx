import { useState } from 'react';
import { ChevronDown, ChevronRight, Package, CalendarDays } from 'lucide-react';
import { EstadoBadge, HelpTip } from './ui';
import type { Compra, Cuota, Moneda } from '../types';
import { formatCurrency, formatDate, parseDate, toDateInput } from '../utils/format';
import { HELP } from '../utils/help';

export const estadoCompra = (c: Compra): string => (c.estado === 'Mora' || c.interesMoratorio > 0 ? 'Mora' : c.estado);
const vencida = (cuota: Cuota) => cuota.estado !== 'Pagada' && toDateInput(parseDate(cuota.vencimiento)) < toDateInput();
const estadoCuota = (c: Cuota) => c.estado === 'Pendiente' && vencida(c) ? 'Mora' : c.estado;

export function CuotasTable({ cuotas, moneda }: { cuotas: Cuota[]; moneda?: Moneda }) {
  const totals = cuotas.reduce((sum, c) => ({ cuota: sum.cuota + c.cuota, interes: sum.interes + c.interes, capital: sum.capital + c.amortizacion }), { cuota: 0, interes: 0, capital: 0 });
  return <div className="schedule">
    <div className="space-y-3 md:hidden">
      {cuotas.map(c => <article key={c.numero} className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3"><span className="font-bold">Cuota {c.numero}</span><EstadoBadge estado={estadoCuota(c)} /></div>
        <p className="mt-2 flex items-center gap-2 text-xs text-slate-500"><CalendarDays className="h-3.5 w-3.5" />{formatDate(c.vencimiento)}</p>
        <p className="my-3 text-xl font-bold tabular-nums">{formatCurrency(c.cuota, moneda)}</p>
        <dl className="grid grid-cols-2 gap-3 border-t pt-3 text-xs"><div><dt className="text-slate-500">Interés</dt><dd className="mt-1 font-semibold tabular-nums">{formatCurrency(c.interes, moneda)}</dd></div><div><dt className="text-slate-500">Amortización</dt><dd className="mt-1 font-semibold tabular-nums">{formatCurrency(c.amortizacion, moneda)}</dd></div></dl>
      </article>)}
      <div className="rounded-xl bg-indigo-50 p-4 text-sm"><span className="text-indigo-700">Total de cuotas mostradas</span><strong className="mt-1 block tabular-nums text-indigo-950">{formatCurrency(totals.cuota, moneda)}</strong><p className="mt-2 text-xs text-indigo-700">Interés {formatCurrency(totals.interes, moneda)} · Capital {formatCurrency(totals.capital, moneda)}</p></div>
    </div>
    <div className="hidden max-h-[32rem] overflow-auto rounded-xl border border-slate-200 md:block">
      <table className="w-full text-left text-sm"><caption className="sr-only">Cronograma de cuotas mostradas</caption>
        <thead className="sticky top-0 z-10 bg-slate-100 text-[11px] uppercase tracking-wider text-slate-500"><tr>{['N.º', 'Vencimiento', 'Cuota', 'Interés', 'Amortización', 'Estado'].map((label, i) => <th scope="col" key={label} className={`px-4 py-3 ${i >= 2 && i <= 4 ? 'text-right' : ''}`}>{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{cuotas.map(c => <tr key={c.numero} className={estadoCuota(c) === 'Mora' ? 'bg-rose-50/70' : 'odd:bg-white even:bg-slate-50/70'}><td className="px-4 py-3 font-semibold">{c.numero}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(c.vencimiento)}</td><td className="px-4 py-3 text-right font-bold tabular-nums">{formatCurrency(c.cuota, moneda)}</td><td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatCurrency(c.interes, moneda)}</td><td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatCurrency(c.amortizacion, moneda)}</td><td className="px-4 py-3"><EstadoBadge estado={estadoCuota(c)} /></td></tr>)}</tbody>
        <tfoot className="border-t bg-indigo-50/80 text-indigo-950"><tr><th scope="row" colSpan={2} className="px-4 py-4 text-xs font-semibold">Total de cuotas mostradas</th><td className="px-4 py-4 text-right font-bold tabular-nums">{formatCurrency(totals.cuota, moneda)}</td><td className="px-4 py-4 text-right tabular-nums">{formatCurrency(totals.interes, moneda)}</td><td className="px-4 py-4 text-right tabular-nums">{formatCurrency(totals.capital, moneda)}</td><td /></tr></tfoot>
      </table>
    </div>
  </div>;
}

export function ComprasList({ compras, moneda }: { compras: Compra[]; moneda?: Moneda }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  return <div className="space-y-4 p-4 sm:p-5">{compras.map(item => {
    const hasCuotas = !!item.cuotas?.length;
    const open = expanded === item.compraId;
    const panelId = `cronograma-${item.compraId}`;
    return <article key={item.compraId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Package className="h-5 w-5" /></span><div><h3 className="break-words font-bold text-slate-900">{item.producto}</h3><p className="mt-1 text-xs text-slate-500">{hasCuotas ? `${item.cuotas!.length} cuota(s) pendiente(s)` : 'Compra con pago único'}</p></div></div>
        <div className="flex items-center gap-3"><EstadoBadge estado={estadoCompra(item)} /><span className="text-lg font-bold tabular-nums">{formatCurrency(item.totalExigible, moneda)}</span></div>
      </div><dl className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 sm:gap-4">{[['Capital pendiente', item.capitalPendiente, undefined], ['Interés', item.interesCompensatorio, HELP.interesCompensatorio], ['Mora', item.interesMoratorio, HELP.interesMoratorio]].map(([label, value, help]) => <div key={String(label)}><dt className="flex items-center gap-1 text-[11px] text-slate-500 sm:text-xs">{label}{help && <HelpTip text={String(help)} />}</dt><dd className={`mt-1 text-sm font-semibold tabular-nums ${label === 'Mora' && Number(value) > 0 ? 'text-rose-700' : 'text-slate-700'}`}>{formatCurrency(Number(value), moneda)}</dd></div>)}</dl>
      {hasCuotas && <button type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setExpanded(open ? null : item.compraId)} className="mt-4 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}{open ? 'Ocultar cronograma' : 'Ver cronograma'}</button>}
      </div>{open && item.cuotas && <div id={panelId} className="border-t border-slate-100 bg-slate-50 p-3 sm:p-5"><CuotasTable cuotas={item.cuotas} moneda={moneda} /></div>}
    </article>;
  })}</div>;
}