import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AdminLayout from './layouts/AdminLayout';
import ClientLayout from './layouts/ClientLayout';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import AdminDashboardView from './views/AdminDashboardView';
import ClientesView from './views/ClientesView';
import DetalleClienteView from './views/DetalleClienteView';
import EstadoCuentaView from './views/EstadoCuentaView';
import type { Role } from './types';
function ProtectedRoute({ role, children }: { role: Role; children: ReactElement }) { const user = useAuthStore((state) => state.user); if (!user) return <Navigate to="/login" replace />; return user.role === role ? children : <Navigate to={user.role === 'Admin' ? '/admin' : '/cliente/estado-cuenta'} replace />; }
export default function App() { return <Routes><Route path="/login" element={<LoginView />} /><Route path="/registro-tienda" element={<RegisterView />} /><Route path="/admin" element={<ProtectedRoute role="Admin"><AdminLayout /></ProtectedRoute>}><Route index element={<AdminDashboardView />} /><Route path="clientes" element={<ClientesView />} /><Route path="clientes/:clienteId" element={<DetalleClienteView />} /></Route><Route path="/cliente" element={<ProtectedRoute role="Cliente"><ClientLayout /></ProtectedRoute>}><Route path="estado-cuenta" element={<EstadoCuentaView />} /></Route><Route path="*" element={<Navigate to="/login" replace />} /></Routes>; }
