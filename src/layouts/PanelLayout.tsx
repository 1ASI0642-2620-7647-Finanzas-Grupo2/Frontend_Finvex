import { useState, type ReactNode } from 'react';
import { LogOut, Menu, X } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuthStore } from '../store/authStore';

export interface NavEntry { to: string; label: string; icon: ReactNode; end?: boolean }

export default function PanelLayout({ items, eyebrow, subtitle, initials }: { items: NavEntry[]; eyebrow: string; subtitle: string; initials: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const clear = useAuthStore((state) => state.clearUser);
  const usuario = useAuthStore((state) => state.user?.usuario);
  const logout = () => { clear(); navigate('/login'); };

  const navigation = (onNavigate?: () => void) => (
    <>
      <nav aria-label="Navegación principal" className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => <NavItem key={item.to} {...item} onNavigate={onNavigate} />)}
      </nav>
      <button type="button" onClick={logout} className="m-4 flex min-h-11 items-center gap-3 rounded-xl p-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200">
        <LogOut className="h-5 w-5" />Cerrar sesión
      </button>
    </>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 lg:pl-64 print:bg-white print:pl-0">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col print:hidden">
        <div className="flex h-20 items-center border-b px-6"><BrandLogo className="h-16 w-28" priority /></div>
        {navigation()}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden print:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-[min(19rem,88vw)] flex-col bg-white shadow-2xl" aria-label="Menú móvil">
            <div className="flex h-20 items-center justify-between border-b px-5">
              <BrandLogo className="h-16 w-28" priority />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú" className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"><X className="h-6 w-6" /></button>
            </div>
            {navigation(() => setMenuOpen(false))}
          </aside>
        </div>
      )}

      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b bg-white/95 px-3 backdrop-blur sm:px-5 lg:static lg:h-20 lg:px-10 print:hidden">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 lg:hidden"><Menu className="h-6 w-6" /></button>
            <BrandLogo compact className="h-9 w-9 lg:hidden" />
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-bold uppercase tracking-widest text-indigo-600 sm:text-xs">{eyebrow}</p>
              <p className="hidden truncate text-sm text-slate-500 sm:block">{subtitle}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {usuario && <span className="hidden max-w-44 truncate text-sm text-slate-500 md:inline">{usuario}</span>}
            <div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700" aria-label={`Perfil ${initials}`}>{initials}</div>
          </div>
        </header>
        <div className="min-w-0 p-3 sm:p-5 lg:p-10 print:p-0"><Outlet /></div>
      </main>
    </div>
  );
}

function NavItem({ to, label, icon, end, onNavigate }: NavEntry & { onNavigate?: () => void }) {
  return (
    <NavLink end={end} to={to} onClick={onNavigate} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>{label}
    </NavLink>
  );
}
