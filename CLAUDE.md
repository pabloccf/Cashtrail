# Gestor de Gastos Personales

Aplicación web full-stack para registrar ingresos y gastos, organizarlos por categorías, fijar presupuestos mensuales y ver estadísticas con gráficos. Es un **side project de aprendizaje**: el objetivo principal es que yo entienda lo que se construye, no solo que funcione.

**Principio clave:** la app es solo una herramienta de **registro y control** de mis finanzas personales. Nunca realiza pagos, nunca mueve dinero y no se conecta a bancos ni a ninguna pasarela de pago. Todo lo que hay en ella son anotaciones que hago yo (o que la app crea a partir de mis gastos e ingresos fijos) para tener controlado en qué se va mi dinero.

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
- React 18 + TypeScript + Vite
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

Formato de error común: `{ "error": { "message": string, "details"?: unknown } }`

## Pantallas del frontend

- `/login`, `/register`
- `/dashboard`: resumen del mes, gráficos, últimas transacciones, registros pendientes de confirmar, próximos gastos fijos y saldo disponible estimado (saldo actual menos los gastos fijos que quedan este mes)
- `/transactions`: listado con filtros, búsqueda y paginación. Los registros generados a partir de un fijo se marcan con un icono
- `/recurring`: gestión de gastos e ingresos fijos (crear, editar, activar o desactivar) y total anual en suscripciones
- `/categories`: gestión de categorías
- `/budgets`: presupuestos mensuales con barra de progreso
- `/settings`: perfil, moneda y exportar a CSV

## Convenciones

- TypeScript en modo `strict`. Evitar `any`.
- Componentes de React como funciones, en PascalCase, un componente por archivo.
- Nombres de archivos: componentes en PascalCase (`TransactionCard.tsx`), el resto en camelCase.
- Validar **siempre** con Zod los datos que llegan al backend.
- Respetar el orden de capas descrito en "Arquitectura del backend": solo los repositorios acceden a Prisma.
- Commits en inglés siguiendo Conventional Commits (`feat:`, `fix:`, `refactor:`...).

## Seguridad

- Toda consulta a la base de datos debe filtrar por el `userId` del usuario autenticado. Un usuario nunca puede ver ni modificar datos de otro.
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

- [ ] **Fase 1:** estructura del proyecto, Docker con Postgres, esquema de Prisma y CRUD de transacciones sin login
- [ ] **Fase 2:** autenticación y protección de rutas
- [ ] **Fase 3:** categorías, filtros y paginación
- [ ] **Fase 4:** gastos e ingresos fijos: modelo, CRUD, lógica de generación, endpoint `/jobs/recurring` y confirmación de pendientes
- [ ] **Fase 5:** dashboard con gráficos, endpoints de estadísticas y próximos gastos fijos
- [ ] **Fase 6:** presupuestos y exportar a CSV
- [ ] **Fase 7:** despliegue: Neon, Render, Vercel con rewrite y GitHub Action diaria

Ideas para después: importar extractos bancarios en CSV, tests con Vitest y Playwright, modo oscuro, PWA, categorización automática con IA.
