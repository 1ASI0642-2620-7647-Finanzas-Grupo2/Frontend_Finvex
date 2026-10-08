# FINVEX - cumplimiento del Trabajo Parcial SI642

Fecha de verificación: 8 de octubre de 2026.

## Alcance documental

Se revisó visual y textualmente el informe FINVEX versión (11), en particular las secciones 5.2, 6.1, 6.1.2, 6.2, 6.3, 6.4, 7 y 8. El enunciado oficial `SI642_Enunciado del Trabajo Final 2026-20.pdf` no estuvo disponible en las rutas accesibles; por ello este documento no afirma una comparación completa con ese archivo.

No se modificó el esquema MySQL, no se agregaron migraciones y no se alteraron los resultados esperados de los juegos financieros académicos.

## Matriz de cumplimiento

| Requisito | Frontend / backend | Estado inicial | Corrección | Evidencia |
| --- | --- | --- | --- | --- |
| Contraseña nueva de al menos 8 caracteres | Formularios de tienda/cliente; `AuthService`; `ClienteService` | Permitía 6 | Regla compartida de 8 para alta y cambio; el login no invalida cuentas históricas | Pruebas con 7 y 8 caracteres; 44 pruebas aprobadas |
| RUC y DNI numéricos | Registro de tienda y cliente | Validación parcial | RUC de 11 y DNI de 8 en ambas capas | Pruebas de límites y build TypeScript |
| Longitudes del informe | Tiendas, clientes, productos y compras | Solo obligatoriedad en varios campos | Razón/nombres 2-100, usuario 5-50, descripción 2-100 y unidad 2-20 | Validación compartida y respuestas 400 del API |
| Tasas, moneda, corte, pago y plazo | `ClienteForm`, `ValidacionesCliente` | Reglas principales presentes | Validación de enums, compensatoria > 0, mora >= 0, días 1-28 y plazo 1-36 | Pruebas de límites y smoke real |
| Mora igual a cero | Ayuda contextual y motor | Comportamiento correcto pero poco visible | Se explica que usa la compensatoria; no se cambió el cálculo | Juegos académicos y pruebas del motor |
| Giro del negocio | Registro público y alta por AdminSistema | Texto libre | Selector con Minimarket, Bodega, Panadería, Peluquería, Carnicería y Otro; el API sigue recibiendo un string | Build TypeScript |
| Fecha y hora de compra | `CompraForm`, `CreditosController`, `HoraLima` | Campo manual opcional | Flujo normal automático en el backend con hora de Lima; el campo manual solo aparece al activar simulación | Revisión de contrato y build TypeScript |
| Identidad visual | Login, registro y layouts de los tres roles | Letra F y texto provisional | Logo oficial completo, isotipo compacto y favicon reutilizables | Build Vite y revisión de recursos |
| Navegación móvil | Paneles Admin/AdminSistema y cliente | Barra horizontal en móvil | Drawer accesible para paneles y menú desplegable para cliente | Revisión estructural; navegador local bloqueado |
| Cartera por moneda | `AdminDashboardView` | Sumaba PEN y USD | Totales independientes en soles y dólares | Build TypeScript |
| Productos y modalidades | `ProductosView`, `ProductosController` | Cuotas activadas por defecto | Cuotas desactivadas por defecto; precios, textos, proveedor e imagen validados | Build frontend y smoke de catálogo |
| Compra y crédito disponible | `CompraForm`, `CreditosController`, motor | Funcionaba | Descripción manual 2-100 y modalidad definida; backend sigue siendo autoritativo | Smoke de FinDeMes y Cuotas |
| Ayuda electrónica | Login, registro, tiendas, clientes, productos, compras y pagos | Incompleta | Ayudas centralizadas y coherentes con las restricciones | Build TypeScript |
| Login de cliente simple | `LoginView`, autenticación backend | Pedía RUC en pantalla | Solo usuario y contraseña; el backend resuelve una coincidencia única | Smoke de login, claims y aislamiento |
| Separación entre tiendas | Claims y controladores | Implementada | Conservada con `ClienteId` y `TiendaId`; accesos cruzados rechazados | HTTP 403 verificado en smoke |
| Pagos e historial | API, MySQL y vistas | Implementado | Conservado: pago exacto, prelación e historial persistido | Juegos 1 y 2; historial recuperado |
| Auditoría | Altas, ediciones, estados, compras, pagos y login | Implementada | Revisada; no registra contraseñas ni hashes | Dos pagos auditados en smoke |
| Motor financiero | Backend | Pruebas académicas correctas | Sin duplicación en React ni cambios de fórmulas | Juego 1: 328.97/331.67; Juego 2: 277.73 |
| Límites legales BCRP | Documentación | No implementados | Se documenta la diferencia entre simulación y crédito real | Sin restricción rígida ni cambio de esquema |

## Verificación ejecutada

- `dotnet restore Finvex.sln`: correcto.
- `dotnet build Finvex.sln --no-restore`: 0 advertencias y 0 errores.
- `dotnet test Finvex.sln --no-build --no-restore`: 44 de 44 pruebas aprobadas.
- `npm ci`: correcto; informa 10 vulnerabilidades conocidas (4 moderadas y 6 altas).
- `npm run build`: TypeScript y Vite correctos después de la integración visual y responsive.
- `scripts/SmokeIntegration.ps1`: Swagger, productos, clientes, compras, cronogramas, listados, pagos, historial, login de cliente, separación y auditoría correctos.
- La prueba visual automatizada no pudo acceder al `localhost` del host desde el navegador aislado (`ERR_CONNECTION_TIMED_OUT`). Los intentos headless locales tampoco generaron capturas. La vista se verificó estructuralmente y mediante compilación, pero no se declara una comprobación visual ejecutada.

## Matriz responsive

| Ancho | Login | Registro | Admin/AdminSistema | Cliente | Formularios y modales | Tablas financieras |
| --- | --- | --- | --- | --- | --- | --- |
| 320 px | Revisión estructural | Revisión estructural | Drawer y encabezado revisados en código | Menú desplegable revisado en código | Una columna y acciones apiladas | Scroll horizontal controlado |
| 375 px | Revisión estructural | Revisión estructural | Igual que 320 px | Igual que 320 px | Resúmenes financieros pasan a columnas cuando hay espacio | Scroll horizontal controlado |
| 430 px | Revisión estructural | Revisión estructural | Igual que 320 px | Igual que 320 px | Una columna, controles táctiles | Scroll horizontal controlado |
| 768 px | Revisión estructural | Dos columnas desde 640 px | Drawer hasta 1023 px | Navegación horizontal desde 768 px | Dos columnas cuando corresponde | Scroll disponible sin ocultar columnas |
| 1024 px | Diseño dividido | Dos columnas | Sidebar de escritorio | Navegación horizontal | Modales centrados | Tablas completas o desplazables |
| 1440 px | Diseño dividido | Dos columnas | Sidebar y cuatro métricas | Contenido centrado | Distribución amplia | Información completa |

La matriz describe los puntos de ruptura implementados y revisados estáticamente. No equivale a una prueba visual capturada en navegador.

## Observación para corregir en el informe

La afirmación de la sección 5.2 que atribuye a FINVEX un control para impedir tasas superiores a los máximos vigentes del BCRP excede la implementación actual. Debe reemplazarse por una formulación como: “FINVEX realiza los cálculos académicos con las tasas configuradas; antes de un uso comercial se requiere incorporar una fuente vigente, versionada y auditable de topes legales por periodo, moneda y tipo de operación”. No se añadieron topes rígidos porque romperían los escenarios académicos y podrían quedar desactualizados.

## Calidad de código

- No se encontraron `TODO`, `FIXME`, `console.log`, `debugger` ni referencias autorreferenciales que retirar.
- Se centralizaron límites y ayudas para evitar reglas duplicadas.
- Se conservaron los comentarios técnicos de contratos de API y reglas financieras.
- No se reformatearon masivamente los archivos existentes.

## Limitaciones pendientes

1. Falta comparar con el enunciado oficial del curso cuando sea facilitado.
2. La validación legal de topes BCRP no se aplica automáticamente; los límites varían por periodo, moneda y ámbito jurídico, y el Juego 1 académico entra en conflicto con un tope moratorio real.
3. La unicidad global del usuario de cliente se valida en la aplicación para evitar pedir RUC. El índice actual es único por tienda; cerrar una carrera entre altas simultáneas requeriría cambiar el esquema, lo cual está fuera del alcance autorizado.
4. Las condiciones financieras históricas no quedan congeladas por compra. Corregirlo requiere ampliar el modelo relacional.
5. Las vulnerabilidades de dependencias frontend requieren una actualización mayor separada y pruebas de regresión.

## Git

Frontend y backend se trabajaron en `fix/finvex-integracion`. No se modificó `main`, no se fusionaron ramas y no se usó force push.
