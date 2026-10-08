# FINVEX Frontend

Interfaz React + TypeScript para administrar créditos directos de comercios minoristas. La lógica financiera vive exclusivamente en la API ASP.NET Core.

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- Backend FINVEX ejecutándose en `http://localhost:5105`.
- MySQL 8 disponible para el backend.

## Instalación y ejecución

```powershell
npm ci
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. En desarrollo, Vite redirige `/api` y `/uploads` a `http://localhost:5105`; no es necesario dispersar URLs absolutas en los componentes.

Para usar otra API, cree un archivo local no versionado `.env.local`:

```env
VITE_API_URL=http://localhost:5105
```

Si se usa una URL absoluta, el backend debe permitir el origen del frontend mediante CORS.

## Compilación

```powershell
npm run build
npm run preview
```

El proyecto no incorpora actualmente un runner de pruebas frontend. La verificación automatizada disponible es el chequeo TypeScript incluido en `npm run build`; las reglas financieras están cubiertas por las pruebas xUnit del backend.

## Roles e inicio de sesión

| Rol | Endpoint | Inicio |
| --- | --- | --- |
| `AdminSistema` | `POST /api/auth/login/sistema` | `/sistema/tiendas` |
| `Admin` | `POST /api/auth/login/admin` | `/admin` |
| `Cliente` | `POST /api/auth/login/cliente` | `/cliente/estado-cuenta` |

El acceso de cliente solicita únicamente usuario y contraseña. Los usuarios de cliente nuevos son únicos en FINVEX; si existieran cuentas históricas ambiguas, la API rechaza el acceso sin revelar información de otras tiendas.

No hay credenciales reales en este repositorio. El usuario de sistema y todas las contraseñas se configuran localmente en el backend.

## Rutas principales

- `/registro-tienda`: alta de una tienda y su administrador.
- `/admin`: resumen de cartera.
- `/admin/clientes`: alta, edición, baja y reactivación.
- `/admin/clientes/:clienteId`: condiciones, compras, cronograma, pagos exactos e historial persistido.
- `/admin/clientes/:clienteId/listado-corte`: consulta, generación, impresión y CSV.
- `/admin/productos`: catálogo e imágenes.
- `/admin/auditoria`: operaciones de la tienda.
- `/cliente/estado-cuenta`: obligaciones, cronograma e historial del cliente autenticado.
- `/cliente/listado-corte`: listado de corte propio.
- `/sistema/tiendas`: administración global de tiendas.

## Contrato con la API

- JSON en camelCase.
- Enums como texto: `Nominal`, `Efectiva`, `FinDeMes`, `Cuotas`, `PEN` y `USD`.
- Las tasas se muestran como porcentaje, pero se envían como fracción: 36 % → `0.36`.
- Corte y pago admiten días enteros de 1 a 28.
- La tasa compensatoria debe ser mayor que cero; la moratoria puede ser cero.
- El plazo máximo es de 1 a 36 meses.
- DNI: ocho dígitos; RUC: once dígitos.
- Contraseñas nuevas y cambios de contraseña: mínimo ocho caracteres.
- Los pagos deben coincidir exactamente con el total exigible informado por la API.
- El frontend valida el crédito disponible, pero el backend conserva la validación autoritativa.
- El historial se consulta con `GET /api/clientes/{clienteId}/pagos`; no se usa `sessionStorage` como fuente de verdad.

La matriz completa de vistas, endpoints, DTO, errores y persistencia está en `docs/Integracion.md` del repositorio backend.

## Flujo de demostración

1. Inicie MySQL y el backend.
2. Ejecute `npm ci` y `npm run dev`.
3. Registre una tienda ficticia e inicie sesión como `Admin`.
4. Registre productos y un cliente con reglas de crédito.
5. Registre compras FinDeMes y Cuotas; revise estado de cuenta y cronograma.
6. Genere el listado de corte y registre el monto exacto.
7. Cierre sesión e ingrese como cliente con su usuario y contraseña.
8. Compruebe historial, separación por tienda y auditoría.

## Problemas conocidos

- `npm audit` informa vulnerabilidades transitivas de dependencias de build y React Router. Las correcciones automáticas disponibles implican actualizaciones mayores (Tailwind 4 y React Router 7), por lo que deben abordarse en una migración separada y probada.
- Las condiciones financieras históricas no están congeladas por compra; consulte la documentación del backend antes de editar tasas o fechas de clientes con obligaciones vigentes.

## Datos ficticios de ejemplo

```json
{
  "ruc": "20601234567",
  "razonSocial": "Bodega Los Andes S.A.C.",
  "giro": "Venta de abarrotes",
  "usuario": "admin.losandes",
  "password": "Ejemplo-Seguro-2026!"
}
```

No use estas credenciales de ejemplo fuera de un entorno local.
