# Finvex Frontend

Frontend React + TypeScript para gestionar créditos directos en comercios minoristas.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend .NET 9 ejecutándose en `http://localhost:5105`

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Vite proxifica `/api` hacia `http://localhost:5105` para evitar problemas de CORS en desarrollo.

## Build

```bash
npm run build
npm run preview
```

## Rutas

- `/login`: acceso como dueño o cliente.
- `/registro-tienda`: registro de una tienda.
- `/admin`: dashboard del administrador.
- `/admin/clientes`: clientes y créditos.
- `/admin/clientes/:clienteId`: compras, pagos y cronogramas.
- `/cliente/estado-cuenta`: estado de cuenta mobile-first.

## API consumida

- `POST /api/auth/register/admin`
- `POST /api/auth/login/admin`
- `POST /api/auth/login/cliente`
- `POST /api/clientes`
- `POST /api/clientes/{clienteId}/compras`
- `POST /api/clientes/{clienteId}/pagos`
- `GET /api/clientes/{clienteId}/estado-cuenta`

La lógica financiera se calcula exclusivamente en el backend.

## Configuración opcional

Para usar otra URL de API crea `.env.local`:

```env
VITE_API_URL=http://localhost:5105
```

En ese caso el backend debe permitir CORS desde `http://localhost:5173`.

## Credenciales de registro de ejemplo

```json
{
  "ruc": "20601234567",
  "razonSocial": "Bodega Los Andes S.A.C.",
  "giro": "Venta de abarrotes",
  "usuario": "admin.losandes",
  "password": "LosAndes2026!"
}
```
