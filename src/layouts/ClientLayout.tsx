import { useState, type ReactNode } from 'react';
import { CircleHelp, FileSpreadsheet, LogOut, Menu, ReceiptText, X } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { useAuthStore } from '../store/authStore';

const tabs = [
  { to: '/cliente/estado-cuenta', label: 'Mi estado de cuenta', icon: ReceiptText },
  { to: '/cliente/listado-corte', label: 'Listado de corte', icon: FileSpreadsheet },
  { to: '/cliente/ayuda', label: 'Ayuda', icon: CircleHelp },
];

export default function ClientLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const clear = useAuthStore((state) => state.clearUser);
  const logout = () => { clear(); navigate('/login'); };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 print:bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-3 sm:px-5">
          <BrandLogo className="h-16 w-28" priority />
          <nav aria-label="Navegación del cliente" className="hidden items-center gap-1 md:flex">
            {tabs.map(({ to, label, icon: Icon }) => <ClientNavLink key={to} to={to} label={label} icon={<Icon className="h-4 w-4" />} />)}
          </nav>
          <div className="flex items-center gap-1">
            <button type="button" onClick={logout} aria-label="Cerrar sesión" className="grid h-11 w-11 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"><LogOut className="h-5 w-5" /></button>
            <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} className="grid h-11 w-11 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 md:hidden">{menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}</button>
          </div>
        </div>
        {menuOpen && <nav aria-label="Navegación móvil del cliente" className="space-y-1 border-t p-3 md:hidden">{tabs.map(({ to, label, icon: Icon }) => <ClientNavLink key={to} to={to} label={label} icon={<Icon className="h-5 w-5" />} onClick={() => setMenuOpen(false)} />)}</nav>}
      </header>
      <main className="mx-auto max-w-5xl px-3 py-5 sm:px-5 sm:py-6 print:max-w-none print:p-0"><Outlet /></main>
    </div>
  );
}

function ClientNavLink({ to, label, icon, onClick }: { to: string; label: string; icon: ReactNode; onClick?: () => void }) {
  return <NavLink to={to} onClick={onClick} className={({ isActive }) => `flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>{icon}{label}</NavLink>;
}
