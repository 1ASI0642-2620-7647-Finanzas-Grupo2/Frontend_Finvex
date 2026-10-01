import { BarChart3, CircleHelp, History, Package, Users } from 'lucide-react';
import PanelLayout, { type NavEntry } from './PanelLayout';
const items: NavEntry[] = [{ to: '/admin', label: 'Resumen', icon: <BarChart3 />, end: true }, { to: '/admin/clientes', label: 'Clientes y créditos', icon: <Users /> }, { to: '/admin/productos', label: 'Productos', icon: <Package /> }, { to: '/admin/auditoria', label: 'Auditoría', icon: <History /> }, { to: '/admin/ayuda', label: 'Ayuda', icon: <CircleHelp /> }];
export default function AdminLayout() { return <PanelLayout items={items} eyebrow="Espacio del negocio" subtitle="Controla tus créditos con claridad." initials="AD" />; }
