import { CircleHelp, History, Store } from 'lucide-react';
import PanelLayout, { type NavEntry } from './PanelLayout';
const items: NavEntry[] = [{ to: '/sistema/tiendas', label: 'Tiendas', icon: <Store /> }, { to: '/sistema/auditoria', label: 'Auditoría', icon: <History /> }, { to: '/sistema/ayuda', label: 'Ayuda', icon: <CircleHelp /> }];
export default function SistemaLayout() { return <PanelLayout items={items} eyebrow="Administración del sistema" subtitle="Gestiona las tiendas de la plataforma." initials="SA" />; }
