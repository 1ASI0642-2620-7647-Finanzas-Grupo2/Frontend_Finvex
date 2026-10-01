import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, Role } from '../types';
interface AuthState { user: AuthUser | null; setUser: (user: AuthUser) => void; clearUser: () => void; }
export const useAuthStore = create<AuthState>()(persist((set) => ({ user: null, setUser: (user) => set({ user }), clearUser: () => set({ user: null }) }), { name: 'finvex-auth' }));
export const homeFor = (role: Role): string => (role === 'Admin' ? '/admin' : role === 'AdminSistema' ? '/sistema/tiendas' : '/cliente/estado-cuenta');
export const isExpired = (user: AuthUser): boolean => !!user.expiraEn && new Date(user.expiraEn).getTime() <= Date.now();
