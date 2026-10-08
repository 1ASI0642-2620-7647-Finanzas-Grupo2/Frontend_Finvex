import { useState } from 'react';
import { Input, Select } from './ui';
import { HELP } from '../utils/help';
import { FIELD_LIMITS } from '../utils/validation';

export const BUSINESS_TYPES = ['Minimarket', 'Bodega', 'Panadería', 'Peluquería', 'Carnicería'] as const;

export function BusinessTypeField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const predefined = BUSINESS_TYPES.includes(value as (typeof BUSINESS_TYPES)[number]);
  const [custom, setCustom] = useState(Boolean(value) && !predefined);
  const selection = custom ? 'Otro' : value;

  return (
    <div className="space-y-3">
      <Select label="Giro del negocio" help={HELP.giro} value={selection} onChange={(event) => { const isCustom = event.target.value === 'Otro'; setCustom(isCustom); onChange(isCustom ? '' : event.target.value); }} required>
        <option value="">Selecciona una opción</option>
        {BUSINESS_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
        <option value="Otro">Otro</option>
      </Select>
      {selection === 'Otro' && (
        <Input
          label="Especifica el giro"
          help={HELP.giroOtro}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={FIELD_LIMITS.businessTypeMax}
          autoFocus
          required
        />
      )}
    </div>
  );
}
