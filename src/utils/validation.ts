import type { RegisterAdminRequest } from '../types';

export const FIELD_LIMITS = {
  passwordMin: 8,
  usernameMin: 5,
  usernameMax: 50,
  nameMin: 2,
  nameMax: 100,
  businessTypeMax: 150,
  brandMax: 100,
  productDescriptionMin: 2,
  productDescriptionMax: 100,
  unitMin: 2,
  unitMax: 20,
  providerMax: 150,
} as const;

export const hasTrimmedLength = (value: string, min: number, max: number) => {
  const length = value.trim().length;
  return length >= min && length <= max;
};

export const validateStore = (form: RegisterAdminRequest): string => {
  if (!/^\d{11}$/.test(form.ruc)) return 'El RUC debe tener 11 dígitos.';
  if (!hasTrimmedLength(form.razonSocial, FIELD_LIMITS.nameMin, FIELD_LIMITS.nameMax))
    return `La razón social debe tener entre ${FIELD_LIMITS.nameMin} y ${FIELD_LIMITS.nameMax} caracteres.`;
  if (!hasTrimmedLength(form.giro, 1, FIELD_LIMITS.businessTypeMax))
    return `El giro del negocio debe tener entre 1 y ${FIELD_LIMITS.businessTypeMax} caracteres.`;
  if (!hasTrimmedLength(form.usuario, FIELD_LIMITS.usernameMin, FIELD_LIMITS.usernameMax))
    return `El usuario debe tener entre ${FIELD_LIMITS.usernameMin} y ${FIELD_LIMITS.usernameMax} caracteres.`;
  if (form.password.length < FIELD_LIMITS.passwordMin)
    return `La contraseña debe tener al menos ${FIELD_LIMITS.passwordMin} caracteres.`;
  return '';
};
