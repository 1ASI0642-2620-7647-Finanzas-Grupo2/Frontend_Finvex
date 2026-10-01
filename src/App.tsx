import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { homeFor, isExpired, useAuthStore } from './store/authStore';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import SistemaLayout from './layouts/SistemaLayout';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import AdminDashboardView from './views/AdminDashboardView';
import ClientesView from './views/ClientesView';
import DetalleClienteView from './views/DetalleClienteView';
import EstadoCuentaView from './views/EstadoCuentaView';
import TiendasView from './views/TiendasView';
import ProductosView from './views/ProductosView';
import ListadoCorteView from './views/ListadoCorteView';
import AuditoriaView from './views/AuditoriaView';
import AyudaView from './views/AyudaView';
import type { Role } from './types';
function ProtectedRoute({ role, children }: { role: Role; children: ReactElement }) { const user = useAuthStore((state) => state.user); if (!user || isExpired(user)) return <Navigate to={user ? `/login?rol=${user.role}&expirada=1` : '/login'} replace />; return user.role === role ? children : <Navigate to={homeFor(user.role)} replace />; }
function HomeRedirect() { const user = useAuthStore((state) => state.user); return <Navigate to={user && !isExpired(user) ? homeFor(user.role) : '/login'} replace />; }
export default function App() { return <Routes><Route path="/" element={<HomeRedirect />} /><Route path="/login" element={<LoginView />} /><Route path="/registro-tienda" element={<RegisterView />} /><Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>}><Route index element={<AdminDashboardView />} /><Route path="clientes" element={<ClientesView />} /><Route path="clientes/:clienteId" element={<DetalleClienteView />} /><Route path="clientes/:clienteId/listado-corte" element={<ListadoCorteView />} /><Route path="productos" element={<ProductosView />} /><Route path="auditoria" element={<AuditoriaView />} /><Route path="ayuda" element={<AyudaView />} /></Route><Route path="/cliente" element={<ProtectedRoute role="Cliente"><ClientLayout /></ProtectedRoute>}><Route index element={<Navigate to="estado-cuenta" replace />} /><Route path="estado-cuenta" element={<EstadoCuentaView />} /><Route path="listado-corte" element={<ListadoCorteView />} /><Route path="ayuda" element={<AyudaView />} /></Route><Route path="/sistema" element={<ProtectedRoute role="AdminSistema"><SistemaLayout /></ProtectedRoute>}><Route index element={<Navigate to="tiendas" replace />} /><Route path="tiendas" element={<TiendasView />} /><Route path="auditoria" element={<AuditoriaView />} /><Route path="ayuda" element={<AyudaView />} /></Route><Route path="*" element={<HomeRedirect />} /></Routes>; }
