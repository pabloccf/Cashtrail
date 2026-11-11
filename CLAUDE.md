# Cashtrail: gestor de gastos personales y compartidos

Aplicación web full-stack para registrar ingresos y gastos, organizarlos por categorías, fijar presupuestos mensuales y ver estadísticas con gráficos. Además de los gastos personales, permite llevar **gastos compartidos** con otra persona (por ejemplo, la pareja) en un espacio compartido. Es un **side project de aprendizaje**: el objetivo principal es que yo entienda lo que se construye, no solo que funcione.

**Principio clave:** la app es solo una herramienta de **registro y control** de finanzas. Nunca realiza pagos, nunca mueve dinero y no se conecta a bancos ni a ninguna pasarela de pago. Todo lo que hay en ella son anotaciones que hago yo (o que la app crea a partir de los gastos e ingresos fijos) para tener controlado en qué se va el dinero. Esto incluye los gastos compartidos: los balances y las deudas entre miembros son solo cálculos, y "saldar" una deuda es apuntar que ya se ha pagado por fuera de la app.

## Cómo quiero que trabajes conmigo

- Responde siempre en **español**. El código, los nombres de variables y los commits, en **inglés**.
- Trabaja en **pasos pequeños**. Antes de una funcionalidad grande, propón un plan y espera mi confirmación.
- Después de escribir código, **explica brevemente** qué hace y por qué lo has hecho así, sobre todo si usas un concepto nuevo para mí.
- Si hay varias formas de hacer algo, coméntame las alternativas y por qué eliges una.
- No instales dependencias nuevas sin preguntarme antes.
- No modifiques archivos fuera de la tarea que te he pedido.
- Si ves un error o una mala práctica en mi código, dímelo aunque no te lo haya preguntado.

## Stack

**Frontend** (`/frontend`)
- React 19 + TypeScript + Vite
- Tailwind CSS (enfoque mobile-first)
- React Router para las rutas
- TanStack Query para las peticiones al backend
- React Hook Form + Zod para formularios y validación
- Recharts para los gráficos

**Backend** (`/backend`)
- Node.js + Express + TypeScript
- Prisma como ORM
- Zod para validar los datos de entrada
- JWT en cookie httpOnly para la autenticación, contraseñas con bcrypt
- La generación diaria de registros fijos se lanza desde un endpoint protegido, llamado una vez al día por una GitHub Action (ver "Despliegue")

**Base de datos**
- PostgreSQL, levantado en local con Docker (`docker-compose.yml` en la raíz)

### Versiones fijadas

- **TypeScript 6 (`~6.0.3`)** en frontend y backend. No subir a TypeScript 7: aún no es compatible con typescript-eslint. El `~` solo permite parches (6.0.x).
- **Prisma 7** (`prisma`, `@prisma/client` y `@prisma/adapter-pg`). No actualizar a versiones posteriores: cambian la API de `prisma.config.ts` y casi toda la documentación disponible es de la 7.
  - La configuración va en `prisma.config.ts` (la URL de la base de datos va ahí, no en `schema.prisma`).
  - El generador `prisma-client` crea el cliente en `src/generated/prisma` (ignorado en git).
  - Requiere el adaptador de PostgreSQL (`@prisma/adapter-pg`) al crear el cliente y `"type": "module"` en el `package.json`.
- Backend con `"module": "nodenext"`: los imports relativos llevan extensión `.js` aunque el archivo sea `.ts`.

## Estructura del proyecto

```
/
├── CLAUDE.md
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── daily-recurring.yml   # Llamada diaria al endpoint de fijos
├── frontend/
│   ├── vercel.json               # Rewrite de /api al backend de Render
│   └── src/
│       ├── components/    # Componentes reutilizables (Button, Modal, Card...)
│       ├── pages/         # Una carpeta por pantalla
│       ├── hooks/         # Hooks personalizados (useTransactions, useAuth...)
│       ├── api/           # Funciones que llaman al backend
│       ├── types/         # Tipos compartidos
│       └── utils/         # Utilidades (formateo de dinero, fechas...)
└── backend/
    ├── prisma/
    │   └── schema.prisma
    └── src/
        ├── routes/        # Definición de rutas de Express
        ├── controllers/   # Reciben la petición y devuelven la respuesta
        ├── services/      # Lógica de negocio
        ├── repositories/  # Acceso a la base de datos con Prisma
        ├── lib/           # Cliente de Prisma y utilidades compartidas
        ├── constants/     # Constantes (categorías por defecto...)
        ├── middlewares/   # Auth, validación, manejo de errores
        ├── schemas/       # Esquemas de Zod
        ├── jobs/          # Tareas programadas (generación de registros fijos)
        └── index.ts
```

## Arquitectura del backend

Monolito con **arquitectura en capas**. No usar microservicios, ni arquitectura hexagonal completa, ni DDD: para el tamaño de este proyecto añadirían complejidad sin beneficio.

Cada petición recorre las capas siempre en este orden, y cada capa solo llama a la siguiente:

```
Ruta → Middlewares → Controlador → Servicio → Repositorio → Prisma → PostgreSQL
```

- **Rutas** (`routes/`): asocian cada URL y método HTTP a un controlador y le aplican los middlewares (autenticación, validación). Sin lógica.
- **Middlewares** (`middlewares/`): autenticación, validación con Zod y manejo centralizado de errores.
- **Controladores** (`controllers/`): leen los datos de la petición (`params`, `query`, `body`, usuario autenticado), llaman al servicio y devuelven la respuesta con el código HTTP adecuado. No contienen lógica de negocio ni acceden a Prisma.
- **Servicios** (`services/`): la lógica de negocio y las reglas de la app (comprobar que una categoría pertenece al usuario, calcular totales, generar los registros de gastos fijos...). No saben nada de Express (no reciben `req` ni `res`) ni importan Prisma directamente.
- **Repositorios** (`repositories/`): la única capa que usa el cliente de Prisma. Funciones pequeñas y con nombres claros (`findByUser`, `create`, `update`, `delete`...). Sin lógica de negocio. Siempre reciben el `userId` para filtrar.

Reglas:

- Un archivo por recurso en cada capa: `transaction.routes.ts`, `transaction.controller.ts`, `transaction.service.ts`, `transaction.repository.ts`.
- Los errores de negocio se lanzan desde los servicios con una clase propia (por ejemplo `AppError` con mensaje y código HTTP) y los recoge el middleware de errores. Los controladores no usan `try/catch` para formatear errores.
- El cliente de Prisma se crea una sola vez en `src/lib/prisma.ts` y solo lo importan los repositorios.
- Si una funcionalidad tiene poca lógica, el servicio puede limitarse a llamar al repositorio. Aun así se mantiene la capa, por coherencia.

## Comandos

```bash
# Base de datos
docker compose up -d

# Backend (desde /backend)
npm run dev                 # Servidor en modo desarrollo
npx prisma migrate dev      # Crear y aplicar migraciones
npx prisma studio           # Ver la base de datos en el navegador

# Frontend (desde /frontend)
npm run dev                 # Servidor de Vite
npm run build               # Build de producción
npm run lint
```

## Modelo de datos

- **User**: id, email (único), passwordHash, name, currency (por defecto "EUR"), createdAt
- **Category**: id, userId, name, color, icon, type (EXPENSE | INCOME)
- **Transaction**: id, userId, categoryId, recurringTransactionId (opcional), amount, description, date, type (EXPENSE | INCOME), status (CONFIRMED | PENDING), createdAt
  - Una "transacción" es solo un **registro o apunte** de un gasto o ingreso, nunca un pago.
- **RecurringTransaction** (gastos e ingresos fijos): id, userId, categoryId, amount, description, type (EXPENSE | INCOME), frequency (MONTHLY | YEARLY), dayOfMonth, monthOfYear (solo si es anual), startDate, endDate (opcional), mode (AUTO | CONFIRM), active, lastGeneratedAt
  - Ejemplos: préstamo del coche (con `endDate`), Spotify (sin `endDate`), nómina (ingreso).
- **Budget**: id, userId, categoryId, amount, month, year (único por userId + categoryId + month + year)

### Categorías por defecto

Las categorías pertenecen a cada usuario (o a un espacio compartido, ver "Gastos compartidos"). No hay categorías globales compartidas entre usuarios.

- Al **registrarse**, la app crea automáticamente un conjunto de categorías por defecto para ese usuario. A partir de ahí son suyas: puede editarlas (nombre, color, icono), borrarlas y crear otras nuevas.
- La lista vive en `src/constants/defaultCategories.ts` y es la única fuente: la usan tanto el registro como el seed de desarrollo, sin duplicarla.
- El registro crea el usuario y sus categorías de forma **atómica** (un *nested write* de Prisma, que se ejecuta en una sola transacción de base de datos), para que nunca quede un usuario sin categorías si algo falla.
- Lista inicial:
  - Gastos: Vivienda, Supermercado, Restaurantes, Transporte, Coche, Suscripciones, Ocio, Salud, Ropa, Regalos, Otros.
  - Ingresos: Nómina, Extras, Otros ingresos.
  - Cada una con su color e icono.
- **Borrar una categoría con movimientos:** no se permite si tiene transacciones, gastos fijos o presupuestos asociados. El backend responde con un error (409) que indica cuántos movimientos tiene, y el frontend muestra un aviso pidiendo moverlos a otra categoría antes de borrarla.
- El nombre de una categoría es único por usuario y tipo (no puede haber dos "Ocio" de gastos para el mismo usuario).

### Gastos e ingresos fijos

Son "plantillas" a partir de las cuales la app crea registros en mi historial para que no tenga que apuntarlos a mano cada mes. Solo crean anotaciones dentro de la app, no pagan ni cobran nada.

- La lógica de generación vive en `src/jobs/generateRecurring.ts` y revisa qué gastos o ingresos fijos tocan (desde `lastGeneratedAt` hasta hoy) y crea los registros correspondientes.
- Se ejecuta en dos momentos: al arrancar el servidor y cuando se llama al endpoint `POST /api/jobs/recurring` (una vez al día, desde la GitHub Action).
- Según el campo `mode`:
  - `AUTO`: el registro se crea directamente como `CONFIRMED`. Para importes que no cambian (Spotify, préstamo).
  - `CONFIRM`: el registro se crea como `PENDING` y la app me pide que lo confirme o ajuste el importe. Para importes que varían (luz, agua).
- Los registros `PENDING` **no cuentan** en los totales ni en las estadísticas hasta que los confirmo.
- No se generan registros antes de `startDate`, después de `endDate` ni si `active` es `false`.
- Si `dayOfMonth` no existe en ese mes (por ejemplo, el 31 en febrero), se usa el último día del mes.
- La generación debe ser **idempotente**: si la tarea se ejecuta dos veces el mismo día, no se duplica ningún registro. Usar `lastGeneratedAt` y una restricción única (recurringTransactionId + date).
- Si el servidor ha estado apagado, al arrancar se generan los registros de los días que faltaron.

### Gastos compartidos (espacios compartidos) — Fase 8

Un **espacio compartido** permite a dos usuarios, cada uno con su propia cuenta, apuntar y ver juntos los gastos comunes (alquiler, compra, cenas, viajes...). Internamente se llama "espacio compartido" para que el diseño sirva en el futuro para pisos compartidos o viajes, pero en la interfaz el apartado se llama **"Gastos compartidos"** y de momento está limitado a **2 miembros**, y cada usuario puede pertenecer como máximo a **un** espacio.

**Privacidad:** los gastos personales de cada miembro son siempre privados. En el espacio solo está lo que se apunta en él.

**Modelos** (se diseñarán en detalle en el plan de la Fase 8):

- **SharedSpace**: id, name, defaultPaymentSource (MEMBER | JOINT_ACCOUNT), createdAt
- **SharedSpaceMember**: id, spaceId, userId, role (OWNER | MEMBER), joinedAt (único por spaceId + userId)
- **SharedSpaceInvite**: id, spaceId, code (único), createdById, expiresAt, usedAt
- **SharedExpense**: id, spaceId, categoryId, createdById, amount, description, date, paymentSource (MEMBER | JOINT_ACCOUNT), paidById (obligatorio si es MEMBER, nulo si es JOINT_ACCOUNT), splitType (EQUAL | PERCENTAGE | AMOUNT), createdAt
- **SharedExpenseSplit**: id, expenseId, userId, amount. La suma de los repartos debe ser igual al importe del gasto (validarlo en el servicio).
- **Settlement** (saldar deudas): id, spaceId, fromUserId, toUserId, amount, date, note
- **JointAccountContribution** (aportaciones a la cuenta común, opcional): id, spaceId, userId, amount, date, description
- Las **categorías del espacio** reutilizan el modelo `Category` con `sharedSpaceId` en lugar de `userId` (exactamente uno de los dos). Al crear el espacio se crean sus categorías por defecto, igual que con los usuarios.
- Los **gastos fijos** y los **presupuestos compartidos** reutilizan `RecurringTransaction` y `Budget` con un `sharedSpaceId` opcional, de la misma forma. Decidir los detalles en el plan de la fase.

**Cómo funciona:**

- Uno de los dos crea el espacio desde `/settings` y genera un **código de invitación** (caduca a las 48 horas y solo se puede usar una vez). El otro se une introduciendo el código o abriendo el enlace.
- Mientras el usuario no pertenezca a ningún espacio, el apartado "Gastos compartidos" **no aparece** en la navegación. En `/settings` solo se muestran los botones "Crear espacio compartido" y "Unirme con un código".
- Al apuntar un gasto compartido se indica **quién ha pagado**: uno de los miembros o la **cuenta común**. Por defecto se usa el `defaultPaymentSource` del espacio, que se puede cambiar en sus ajustes (útil si casi todo se paga desde la cuenta común).
- **Reparto:** a partes iguales, por porcentajes o por importes concretos. Al convertir porcentajes a céntimos, el céntimo sobrante por redondeo se asigna a quien pagó, para que la suma cuadre siempre.

**Balance ("quién debe a quién"):**

- Solo cuentan los gastos pagados por un **miembro**. Por cada uno, el que pagó tiene a su favor la parte del otro.
- Los gastos pagados desde la **cuenta común no afectan al balance**: el dinero ya era de los dos. Sí cuentan en las estadísticas.
- Los `Settlement` restan del balance. Saldar es solo un apunte; el dinero se pasa por fuera de la app.
- Si el balance es cero y nunca se ha pagado nada por separado, el bloque de balance puede ocultarse.

**Relación con las finanzas personales:**

- En el dashboard personal, una opción permite incluir "mi parte de los gastos compartidos" en las estadísticas. Está **desactivada por defecto** para no contar dos veces el dinero si las aportaciones a la cuenta común ya se apuntan como gasto personal.

**Salir del espacio:** un miembro puede salir. Si el balance no es cero, se le avisa antes. Los gastos del espacio se conservan para el miembro que se queda.

**Importante:** los importes se guardan como **enteros en céntimos** (12,50 € → `1250`). Nunca usar `float` para dinero. La conversión a euros se hace solo al mostrarlo en el frontend.

## API

Todas las rutas empiezan por `/api`. Todas salvo las de registro y login requieren autenticación.

- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET|POST /transactions`, `PUT|DELETE /transactions/:id`
  - `GET` admite filtros: `from`, `to`, `category`, `type`, `status`, `page`
- `PATCH /transactions/:id/confirm`: confirma un registro pendiente (opcionalmente con un importe ajustado)
- `GET|POST /recurring`, `PUT|DELETE /recurring/:id`, `PATCH /recurring/:id/toggle` (activar o desactivar)
- `GET /recurring/upcoming?days=30`: próximos gastos e ingresos fijos
- `GET|POST /categories`, `PUT|DELETE /categories/:id`
- `GET|POST /budgets`, `PUT /budgets/:id` (filtro por `month` y `year`)
- `GET /stats/summary`, `GET /stats/by-category`, `GET /stats/monthly`
- `POST /jobs/recurring`: genera los registros fijos pendientes. **No** usa la autenticación de usuario: exige la cabecera `x-cron-secret` con el valor de la variable `CRON_SECRET`; si no coincide, responde 401. Debe ser idempotente.
- `GET /health`: responde `{ "status": "ok" }`. Sin autenticación. Sirve para comprobar que el servidor está despierto.

**Espacios compartidos (Fase 8).** Todas las rutas con `:spaceId` pasan por un middleware que comprueba que el usuario autenticado es miembro de ese espacio; si no lo es, responde 404 (no 403, para no revelar que el espacio existe).

- `POST /shared-spaces`, `GET /shared-spaces/me` (el espacio del usuario, o `null`), `PUT /shared-spaces/:spaceId`, `DELETE /shared-spaces/:spaceId` (solo OWNER)
- `POST /shared-spaces/:spaceId/invites` (genera un código), `POST /shared-spaces/join` (body: `{ code }`), `POST /shared-spaces/:spaceId/leave`
- `GET|POST /shared-spaces/:spaceId/expenses`, `PUT|DELETE /shared-spaces/:spaceId/expenses/:expenseId`
- `GET|POST /shared-spaces/:spaceId/categories`, `PUT|DELETE /shared-spaces/:spaceId/categories/:id`
- `GET /shared-spaces/:spaceId/balance`
- `GET|POST /shared-spaces/:spaceId/settlements`
- `GET|POST /shared-spaces/:spaceId/contributions`
- `GET /shared-spaces/:spaceId/stats/summary`, `/stats/by-category`, `/stats/monthly`, `/stats/by-payer` (cuenta común frente a cada miembro)

Formato de error común: `{ "error": { "message": string, "details"?: unknown } }`

## Pantallas del frontend

- `/login`, `/register`
- `/dashboard`: resumen del mes, gráficos, últimas transacciones, registros pendientes de confirmar, próximos gastos fijos y saldo disponible estimado (saldo actual menos los gastos fijos que quedan este mes)
- `/transactions`: listado con filtros, búsqueda y paginación. Los registros generados a partir de un fijo se marcan con un icono
- `/recurring`: gestión de gastos e ingresos fijos (crear, editar, activar o desactivar) y total anual en suscripciones
- `/categories`: gestión de categorías
- `/budgets`: presupuestos mensuales con barra de progreso
- `/settings`: perfil, moneda, exportar a CSV y, si no pertenezco a ningún espacio, "Crear espacio compartido" y "Unirme con un código"

**Apartado "Gastos compartidos" (Fase 8)**, visible en la navegación solo si el usuario pertenece a un espacio:

- `/shared`: dashboard del espacio: total del mes, gastos por categoría, evolución mensual, cuenta común frente a lo pagado por cada miembro, balance y próximos gastos fijos compartidos
- `/shared/expenses`: listado de gastos compartidos con filtros; al crear uno se elige quién pagó (miembro o cuenta común) y el reparto
- `/shared/balance`: quién debe a quién, historial de pagos para saldar y botón "Saldar"
- `/shared/settings`: nombre del espacio, miembros, invitar, opción de pago por defecto, categorías y salir del espacio
- `/shared/join/:code`: unirse a un espacio desde un enlace de invitación

**Componentes reutilizables:** los gráficos y tarjetas del dashboard personal deben recibir los datos por props, sin depender de dónde vienen, para reutilizarlos tal cual en el dashboard compartido.

## Convenciones

- TypeScript en modo `strict`. Evitar `any`.
- Componentes de React como funciones, en PascalCase, un componente por archivo.
- Nombres de archivos: componentes en PascalCase (`TransactionCard.tsx`), el resto en camelCase.
- Validar **siempre** con Zod los datos que llegan al backend.
- Respetar el orden de capas descrito en "Arquitectura del backend": solo los repositorios acceden a Prisma.
- Commits en inglés siguiendo Conventional Commits (`feat:`, `fix:`, `refactor:`...).

## Seguridad

- Toda consulta a la base de datos debe filtrar por el `userId` del usuario autenticado. Un usuario nunca puede ver ni modificar datos de otro.
- En los espacios compartidos, toda consulta debe comprobar que el usuario autenticado es **miembro** del espacio. Un miembro nunca puede ver los datos personales del otro.
- Nunca devolver `passwordHash` en las respuestas.
- Los secretos (JWT_SECRET, DATABASE_URL) van en `.env`, que está en `.gitignore`. Mantener un `.env.example` actualizado.

### Repositorio y secretos

El repositorio de GitHub es **privado** por ahora, pero puede hacerse público en el futuro, y entonces todo el historial de commits sería visible. Por eso, desde el primer commit:

- **Nunca** hagas commit de archivos `.env` ni de ningún archivo con secretos reales (contraseñas, `JWT_SECRET`, `CRON_SECRET`, URLs de conexión de Neon, tokens o claves de API).
- **Nunca** escribas secretos directamente en el código, en comentarios, en tests ni en este CLAUDE.md. Léelos siempre de `process.env`.
- Antes de cada commit, revisa los archivos que se van a incluir y avísame si alguno parece contener un secreto.
- El `.gitignore` de la raíz debe incluir como mínimo: `node_modules`, `.env`, `.env.*` (excepto `.env.example`), `dist` y `.DS_Store`.
- `.env.example` solo contiene los nombres de las variables con valores de ejemplo o vacíos.
- Si un secreto llega a subirse por error, avísame enseguida: no basta con borrarlo en un commit nuevo, hay que **cambiarlo** (generar uno nuevo) porque queda en el historial.

## Diseño responsive

- Diseñar primero para móvil y ampliar con `md:` y `lg:`.
- Navegación: barra inferior con iconos en móvil, barra lateral en escritorio.
- Transacciones: lista de tarjetas en móvil, tabla en escritorio.
- Botón flotante "+" en móvil para añadir una transacción.
- Gráficos siempre dentro de `ResponsiveContainer` de Recharts.
- Botones y elementos táctiles de al menos 44px de alto.

## Despliegue

Todo en planes gratuitos. El despliegue lo hago yo manualmente (crear cuentas, conectar el repo, configurar variables). Tu papel es preparar los archivos de configuración y explicarme los pasos.

| Pieza | Servicio | Notas |
|---|---|---|
| Frontend | Vercel | Root directory: `frontend`. Se despliega en cada push a `main` |
| Backend | Render (Web Service gratuito) | Root directory: `backend`. Se duerme tras 15 min sin tráfico y tarda ~1 min en despertar |
| Base de datos | Neon (plan gratuito) | PostgreSQL. No usar la base de datos gratuita de Render, porque caduca y se borra |

### Rewrite en Vercel (mismo dominio para las cookies)

Safari (iPhone/iPad) bloquea las cookies entre dominios distintos. Para evitarlo, el frontend **nunca** llama directamente a la URL de Render: todas las peticiones van a `/api/...` en el propio dominio de Vercel, y `frontend/vercel.json` las reenvía al backend:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://URL-DEL-BACKEND.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

La segunda regla hace que React Router funcione al recargar cualquier ruta. En local, el proxy de Vite (`server.proxy` en `vite.config.ts`) hace lo mismo hacia `http://localhost:3000`, así el código del frontend usa siempre rutas relativas (`/api/...`).

Configuración de la cookie de sesión: `httpOnly: true`, `sameSite: "lax"`, `secure: true` en producción, `path: "/"`.

### Tarea diaria con GitHub Action

`.github/workflows/daily-recurring.yml` se ejecuta una vez al día (`schedule` con cron, por ejemplo a las 05:00 UTC) y también manualmente (`workflow_dispatch`). Pasos:

1. Llamar a `GET /api/health` para despertar el servidor, con reintentos y un tiempo de espera amplio (`curl --retry 5 --retry-delay 20 --max-time 120`), porque Render puede tardar en arrancar.
2. Llamar a `POST /api/jobs/recurring` con la cabecera `x-cron-secret: ${{ secrets.CRON_SECRET }}`.
3. Fallar el workflow si la respuesta no es 200, para que GitHub me avise por email.

La URL del backend y `CRON_SECRET` se guardan como secrets del repositorio, nunca en el código.

### Variables de entorno

**Backend (Render):** `DATABASE_URL` (conexión con pooling de Neon), `DIRECT_URL` (conexión directa de Neon, para las migraciones de Prisma), `JWT_SECRET`, `CRON_SECRET`, `NODE_ENV=production`.

**GitHub (secrets del repo):** `BACKEND_URL`, `CRON_SECRET`.

### Build y arranque en Render

- Build: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
- Start: `npm start` (ejecuta el JavaScript compilado en `dist/`)
- En producción se usa `prisma migrate deploy`, **nunca** `prisma migrate dev`.

## Hoja de ruta

- [x] **Fase 1:** estructura del proyecto y CRUD de transacciones sin login
  - [x] Estructura del proyecto, Docker con Postgres, esquema de Prisma (User, Category y Transaction), primera migración, cliente de Prisma y seed con un usuario de prueba y categorías
  - [x] Backend: CRUD de transacciones (rutas, controladores, servicios, repositorios, validación con Zod y middleware de errores) usando temporalmente el usuario del seed
  - [x] Frontend: proxy de Vite, React Router, TanStack Query y página `/transactions` con lista y formulario
- [ ] **Fase 2:** autenticación y protección de rutas. El registro crea las categorías por defecto del usuario: crear `src/constants/defaultCategories.ts` con la lista de "Categorías por defecto" y adaptar el seed existente para que use esa misma lista.
- [ ] **Fase 3:** categorías, filtros y paginación
- [ ] **Fase 4:** gastos e ingresos fijos: modelo, CRUD, lógica de generación, endpoint `/jobs/recurring` y confirmación de pendientes
- [ ] **Fase 5:** dashboard con gráficos, endpoints de estadísticas y próximos gastos fijos
- [ ] **Fase 6:** presupuestos y exportar a CSV
- [ ] **Fase 7:** despliegue: Neon, Render, Vercel con rewrite y GitHub Action diaria
- [ ] **Fase 8:** gastos compartidos: espacios compartidos, invitaciones, gastos con reparto y cuenta común, balance y saldos, categorías y gastos fijos compartidos, dashboard compartido y presupuestos compartidos. Dividirla en subfases al planificarla.

Ideas para después: importar extractos bancarios en CSV, tests con Vitest y Playwright, modo oscuro, PWA, categorización automática con IA.
