# Finvex Frontend

Frontend React + TypeScript para gestionar créditos directos en comercios minoristas.

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend .NET 9 ejecutándose en `http://localhost:5105` (Swagger en `http://localhost:5105/swagger`)

## Instalación y ejecución

```bash
npm i
npm run dev
```

Abre `http://localhost:5173`.

Vite proxifica `/api` y `/uploads` hacia `http://localhost:5105` para evitar problemas de CORS en desarrollo. `/uploads` sirve las imágenes de productos.

## Build

```bash
npm run build
npm run preview
```

## Roles y acceso

| Rol | Login | Inicio |
| --- | --- | --- |
| Dueño de tienda (`Admin`) | `POST /api/auth/login/admin` | `/admin` |
| Cliente (`Cliente`) | `POST /api/auth/login/cliente` | `/cliente/estado-cuenta` |
| Administrador del sistema (`AdminSistema`) | `POST /api/auth/login/sistema` | `/sistema/tiendas` |

En la pantalla de inicio de sesión se elige el rol (Dueño, Cliente o Sistema).

### Credenciales de desarrollo del AdminSistema

- Usuario: `sistema`
- Contraseña: la definida en `appsettings.Development.json` del backend.

## Rutas

- `/login`: acceso por rol.
- `/registro-tienda`: registro de una tienda.
- `/admin`: resumen de la cartera.
- `/admin/clientes`: clientes, alta, edición, baja y reactivación.
- `/admin/clientes/:clienteId`: condiciones del crédito, estado de cuenta, cronograma, compras y pagos exactos.
- `/admin/clientes/:clienteId/listado-corte`: listado de corte (consultar, generar, imprimir, exportar CSV).
- `/admin/productos`: catálogo con imágenes, alta, edición, baja y reactivación.
- `/admin/auditoria`: operaciones de la tienda.
- `/admin/ayuda`: glosario financiero.
- `/cliente/estado-cuenta`: estado de cuenta y cronograma del cliente.
- `/cliente/listado-corte`: listado de corte del cliente.
- `/cliente/ayuda`: glosario financiero.
- `/sistema/tiendas`: tiendas de la plataforma.
- `/sistema/auditoria`: operaciones de todas las tiendas.
- `/sistema/ayuda`: glosario financiero.

## Convenciones con el backend

- JSON en camelCase; los enums viajan como texto (`Nominal`/`Efectiva`, `FinDeMes`/`Cuotas`, `Pendiente`/`Pagada`/`Mora`, `PEN`/`USD`).
- Las tasas se escriben en % en la interfaz y se envían como fracción (36 % → `0.36`).
- Las fechas que elige el usuario se envían en hora local con formato `YYYY-MM-DDTHH:mm:ss`.
- Los pagos deben ser exactos; si el monto no coincide, se muestra el monto que indica el backend.

La lógica financiera se calcula exclusivamente en el backend.

## Configuración opcional

Para usar otra URL de API crea `.env.local`:

```env
VITE_API_URL=http://localhost:5105
```

En ese caso el backend debe permitir CORS desde `http://localhost:5173`.

## Datos de registro de ejemplo

```json
{
  "ruc": "20601234567",
  "razonSocial": "Bodega Los Andes S.A.C.",
  "giro": "Venta de abarrotes",
  "usuario": "admin.losandes",
  "password": "LosAndes2026!"
}
```
