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
- Lucide (`lucide-react`) para los iconos
- Fuente Inter, cargada desde Google Fonts en `index.html`

**Backend** (`/backend`)
- Node.js + Express + TypeScript
- Prisma como ORM
- Zod para validar los datos de entrada
- JWT en cookie httpOnly para la autenticación, contraseñas con bcrypt
- Inicio de sesión con Google (OAuth 2.0 + OpenID Connect con PKCE) con **Arctic** (`arctic` 3.x), ver "Inicio de sesión con Google"
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
npx prisma generate         # Regenerar el cliente (Prisma 7 no lo hace tras migrate dev)
npx prisma studio           # Ver la base de datos en el navegador

# Frontend (desde /frontend)
npm run dev                 # Servidor de Vite
npm run build               # Build de producción
npm run lint

# Formato (desde /frontend o /backend)
npm run format              # Formatea todos los archivos con Prettier
npm run format:check        # Solo comprueba, sin cambiar nada
```

## Modelo de datos

- **User**: id, email (único), passwordHash (opcional: es `null` si se registró con Google y no ha creado contraseña), name, currency (por defecto "EUR"), createdAt
  - `currency` solo admite las monedas de `src/constants/currencies.ts` (EUR, USD, GBP, CHF): todas con 2 decimales y con un símbolo propio. Solo cambia cómo se **muestran** los importes; nunca se convierte ninguna cantidad. El frontend tiene una copia de la lista en `src/utils/currency.ts` (mantenerlas sincronizadas).
- **AuthAccount**: id, userId, provider (`AuthProvider`: de momento solo GOOGLE), providerAccountId (el `sub` de Google), createdAt. Único por provider + providerAccountId (una cuenta de Google pertenece a un solo usuario) y por userId + provider (un usuario tiene como mucho una cuenta de Google). Se borra en cascada con el usuario.
- **Category**: id, userId, name, color, icon, type (EXPENSE | INCOME)
- **Transaction**: id, userId, categoryId, recurringTransactionId (opcional), amount, description, date, type (EXPENSE | INCOME), status (CONFIRMED | PENDING), createdAt
  - Una "transacción" es solo un **registro o apunte** de un gasto o ingreso, nunca un pago.
- **RecurringTransaction** (gastos e ingresos fijos): id, userId, categoryId, amount, description, type (EXPENSE | INCOME), frequency (MONTHLY | YEARLY), dayOfMonth, monthOfYear (solo si es anual), startDate, endDate (opcional), mode (AUTO | CONFIRM), active, lastGeneratedAt
  - Ejemplos: préstamo del coche (con `endDate`), Spotify (sin `endDate`), nómina (ingreso).
- **Budget**: id, userId, categoryId, amount, month (1-12), year, createdAt (único por userId + categoryId + month + year)
  - Solo para categorías de **gasto**. Es una referencia para comparar: nunca bloquea ni cambia ningún registro.
  - Lo gastado (`spent`) se calcula con los gastos `CONFIRMED` de la categoría en ese mes, con la misma consulta que las estadísticas, para que las cifras coincidan siempre.
  - Cada mes empieza vacío. "Copiar del mes anterior" copia los presupuestos del mes previo; las categorías que ya tienen presupuesto ese mes conservan el suyo.

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
- `PUT /auth/me`: actualiza el perfil (`{ name, currency }`). El email y la contraseña no se cambian aquí
- `GET /auth/google` y `GET /auth/google/callback`: inicio de sesión (y alta) con Google. Son **navegaciones del navegador**, no llamadas con `fetch`: siempre responden con una redirección, y los errores van en la URL (`/login?error=google_cancelled | google_failed | email_not_verified | account_exists`)
- `GET /auth/google/link` (con sesión): el mismo flujo para vincular Google a la cuenta. Vuelve a `/settings?google=linked` o `/settings?google_error=google_cancelled | google_failed | google_in_use | already_linked`
- `GET /auth/methods`: `{ hasPassword, providers }`, para `/settings`. Es una consulta aparte de `/auth/me` para no cambiar el `User` que devuelven el login y el registro
- `DELETE /auth/methods/google`: desvincula Google. 409 si es el único método para entrar (no tiene contraseña)
- `POST /auth/password` (`{ password }`): crea una contraseña a quien no la tiene (mismas reglas que el registro). 409 si ya tiene una; cambiar una contraseña existente no está implementado
- `GET|POST /transactions`, `PUT|DELETE /transactions/:id`
  - `GET` admite filtros: `from`, `to`, `category`, `type`, `status`, `q` (búsqueda en la descripción, sin distinguir mayúsculas), `page` y `pageSize` (solo 10, 25 o 50; por defecto 25)
- `GET /transactions/export`: descarga un CSV con los mismos filtros que el listado, sin paginar (ver "Exportar a CSV")
- `PATCH /transactions/:id/confirm`: confirma un registro pendiente (opcionalmente con un importe ajustado)
- `GET|POST /recurring`, `PUT|DELETE /recurring/:id`, `PATCH /recurring/:id/toggle` (activar o desactivar)
- `GET /recurring/upcoming?days=30`: próximos gastos e ingresos fijos
- `GET|POST /categories`, `PUT|DELETE /categories/:id`
- `GET /budgets?month=YYYY-MM` (obligatorio; cada presupuesto incluye su categoría y `spent`), `POST /budgets` (`{ categoryId, amount, month }`), `PUT /budgets/:id` (solo `{ amount }`: otra categoría u otro mes es otro presupuesto), `DELETE /budgets/:id`
- `POST /budgets/copy` (`{ month }`): copia los presupuestos del mes anterior y devuelve `{ copied }`. Repetirla no duplica nada
- Los meses viajan siempre como `"YYYY-MM"` (estadísticas, presupuestos y URL del frontend); la base de datos guarda los presupuestos con `month` y `year` enteros
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

### Exportar a CSV

- Pensado para Excel en español: separador `;`, coma decimal, fechas `dd/mm/aaaa`, saltos de línea `\r\n` y BOM UTF-8 al principio (sin él, Excel muestra mal los acentos). La utilidad genérica vive en `src/lib/csv.ts`.
- Columnas: Fecha, Tipo, Categoría, Descripción, `Importe (€)` y "Pendiente de confirmar" (Sí / No). Orden cronológico ascendente.
- El importe va **con signo** (negativo en los gastos) para poder sumarlo en la hoja. El símbolo de la moneda del usuario va en el título de la columna, nunca en cada celda: algunas hojas de cálculo leerían `-12,50 €` como texto y no podrían sumarlo.
- **Inyección de fórmulas CSV:** los textos que escribe el usuario (categoría y descripción) pasan por `escapeFormula`, que antepone `'` si empiezan por `=`, `+`, `-`, `@`, tabulador o retorno de carro. Nunca se aplica a los números que genera la app.
- Respuesta con `Content-Disposition: attachment` (el nombre del archivo lo decide el controlador según el rango) y `Cache-Control: no-store`.
- El frontend lo descarga con `fetch` + `Blob` (`apiClient.download` y `utils/download.ts`), no con un enlace directo, para mostrar los errores como en el resto de la app.

## Pantallas del frontend

- `/login`, `/register`: formulario con email y contraseña y, encima, "Continuar con Google" (`GoogleSignInButton`, un enlace y no un botón). `/login` muestra los errores de Google según `?error=`
- `/privacy`: política de privacidad. **Pública**, con o sin sesión (fuera de `GuestRoute` y `ProtectedRoute`), porque Google la enlaza desde su pantalla de consentimiento y es obligatoria para publicar la app en Google Cloud. Enlazada al pie de `/login` y `/register`. Si cambia lo que la app guarda o con quién lo comparte, hay que actualizarla (y su fecha)
- `/dashboard`: saludo con el nombre, resumen del mes (el balance como cifra protagonista en `BalanceHero`, con ingresos y gastos dentro), gráficos, últimas transacciones, registros pendientes de confirmar, próximos gastos fijos y saldo disponible estimado (saldo actual menos los gastos fijos que quedan este mes)
- `/transactions`: listado con filtros, búsqueda y paginación. Los registros generados a partir de un fijo se marcan con un icono
  - En móvil, las transacciones se agrupan por día con cabeceras fijas al hacer scroll ("Hoy", "Ayer", "Lunes, 16 de noviembre"): `GroupedTransactionList`. En escritorio, tabla.
  - Por defecto muestra solo el **mes actual**, con un selector de mes (flechas para ir a meses anteriores o siguientes) y un botón "Ver todo" para quitar el límite. El mes va en la URL (`?month=2026-10` o `?month=all`); el mes actual no se escribe.
  - Si se elige un rango "Desde/Hasta" en los filtros, este manda sobre el mes ("Rango de fechas personalizado").
  - La búsqueda y los filtros actúan dentro del mes elegido; si no hay resultados, se ofrece "Buscar en todos los meses".
  - El usuario elige cuántas transacciones ver por página (10, 25 o 50). La elección va en la URL (`?pageSize=`) y se recuerda en `localStorage`.
- `/recurring`: gestión de gastos e ingresos fijos (crear, editar, activar o desactivar) y total anual en suscripciones
- `/categories`: gestión de categorías
- `/budgets`: presupuestos mensuales con barra de progreso
  - Selector de mes con el mes en la URL (`?month=`), como en el dashboard. Tarjeta "Total del mes" y una tarjeta por presupuesto.
  - Barra verde por debajo del 80 %, ámbar desde el 80 % hasta el límite y roja si se pasa; el rojo siempre va acompañado de texto ("Te has pasado…").
  - Si el mes no tiene presupuestos, se ofrece "Copiar los de <mes anterior>".
- `/settings`: perfil (nombre y moneda; el email solo se muestra), "Inicio de sesión" (`SignInMethodsSection`: contraseña y Google; vincular, desvincular y crear contraseña), exportar a CSV (este mes, mes anterior, año actual o todo), enlace a Categorías en móvil y, si no pertenezco a ningún espacio, "Crear espacio compartido" y "Unirme con un código"
- Los importes se formatean siempre con el hook `useMoney()`, que usa la moneda del usuario (de la caché de `/auth/me`) con `currencyDisplay: 'narrowSymbol'` (€, $, £), igual que el CSV. Nunca escribir "€" a mano en los componentes.

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
- **Formato con Prettier**, con un `.prettierrc.json` por paquete que respeta su estilo: el frontend **sin** punto y coma y el backend **con** punto y coma. En los dos, comillas simples, 120 caracteres y comas finales. No formatear a mano: VS Code formatea al guardar (`.vscode/settings.json`) y, si no, `npm run format`. Prettier va con la versión exacta (sin `^`) porque cada versión puede formatear distinto.
- Los commits que solo reformatean se añaden a `.git-blame-ignore-revs`, para que `git blame` los ignore.

## Seguridad

- Toda consulta a la base de datos debe filtrar por el `userId` del usuario autenticado. Un usuario nunca puede ver ni modificar datos de otro.
- En los espacios compartidos, toda consulta debe comprobar que el usuario autenticado es **miembro** del espacio. Un miembro nunca puede ver los datos personales del otro.
- Nunca devolver `passwordHash` en las respuestas.
- Los secretos (JWT_SECRET, DATABASE_URL) van en `.env`, que está en `.gitignore`. Mantener un `.env.example` actualizado.

### Inicio de sesión con Google

- **Flujo:** `GET /auth/google` genera `state` y `codeVerifier` (PKCE), los guarda en la cookie temporal `google_oauth` (httpOnly, `sameSite: "lax"`, 10 minutos, solo en la ruta `/api/auth/google`) y redirige a Google. El callback comprueba que el `state` coincide con el de la cookie (protección CSRF), borra la cookie (un solo uso), cambia el `code` por los tokens enviando el `codeVerifier` y lee el id_token. Al terminar crea la misma cookie de sesión JWT que el login normal.
- **La redirect URI va al dominio del frontend** (`APP_URL/api/auth/google/callback`, por el proxy de Vite o el rewrite de Vercel), nunca al de Render, para que las cookies sean del mismo sitio y funcionen en Safari. En Google Cloud están registradas las dos: `http://localhost:5173/...` y `https://cashtrail-gilt.vercel.app/...`. Se comparan carácter a carácter.
- **Identificar siempre por el `sub` de Google** (`providerAccountId`), nunca por email: el email de una cuenta de Google puede cambiar.
- **Nunca vincular automáticamente por email**, aunque Google lo marque como verificado. El registro de Cashtrail no verifica emails, así que alguien podría registrarse con el email de otra persona y quedarse con su cuenta cuando esta entrara con Google (*pre-account hijacking*). Si el email ya existe, el callback redirige a `/login?error=account_exists` y el dueño vincula Google desde `/settings`, con la sesión iniciada.
- Solo se crea una cuenta con Google si `email_verified` es `true`. El alta crea el usuario, su `AuthAccount` y las categorías por defecto en un solo *nested write*.
- **Vincular:** la cookie guarda también `linkUserId`, y el callback exige que el usuario con sesión sea el mismo que empezó. El email de Google no tiene que coincidir con el de la cuenta.
- **Desvincular** solo si queda otro método para entrar (una contraseña). El frontend deshabilita el botón y el backend responde 409.
- Un usuario sin contraseña que intenta el login normal recibe el mismo 401 genérico, y bcrypt se ejecuta igual con el hash ficticio: no se revela cómo entra cada cuenta.
- `decodeIdToken` de Arctic no comprueba la firma del id_token. Es correcto porque llega directamente del endpoint de tokens de Google por HTTPS, en una petición autenticada con el `client_secret`. Los claims se validan con Zod, incluido que `aud` sea nuestro Client ID.
- Toda la integración con Arctic vive en `src/lib/google.ts`; la cookie temporal, en `src/lib/oauthCookie.ts`.
- En el frontend, la caché de los métodos usa la clave `['authMethods']` y **no** `['auth', …]`: `setSessionUser` conserva al cerrar sesión las consultas que empiezan por `'auth'`.

### Repositorio y secretos

El repositorio de GitHub es **privado** por ahora, pero puede hacerse público en el futuro, y entonces todo el historial de commits sería visible. Por eso, desde el primer commit:

- **Nunca** hagas commit de archivos `.env` ni de ningún archivo con secretos reales (contraseñas, `JWT_SECRET`, `CRON_SECRET`, URLs de conexión de Neon, tokens o claves de API).
- **Nunca** escribas secretos directamente en el código, en comentarios, en tests ni en este CLAUDE.md. Léelos siempre de `process.env`.
- Antes de cada commit, revisa los archivos que se van a incluir y avísame si alguno parece contener un secreto.
- El `.gitignore` de la raíz debe incluir como mínimo: `node_modules`, `.env`, `.env.*` (excepto `.env.example`), `dist` y `.DS_Store`.
- `.env.example` solo contiene los nombres de las variables con valores de ejemplo o vacíos.
- Si un secreto llega a subirse por error, avísame enseguida: no basta con borrarlo en un commit nuevo, hay que **cambiarlo** (generar uno nuevo) porque queda en el historial.

## Sistema de diseño (frontend)

Estilo "moderno y suave": tarjetas blancas sin borde con sombra suave sobre fondo `slate-50`, esquinas redondeadas (`rounded-2xl` en tarjetas, `rounded-xl` en botones y campos) y color de marca índigo.

**Tokens** (`src/index.css`, bloque `@theme` de Tailwind v4). Son la única fuente de los valores de diseño:

- `brand-50…950`: color de marca (índigo). Se usa para acciones, enlaces, foco y navegación activa. **Nunca** para ingresos o gastos: el verde (`emerald`) es ingreso o éxito y el rojo (`rose`) es gasto o error, y la marca se mantiene aparte para que esos colores destaquen.
- `shadow-card` (tarjetas), `shadow-elevated` (modales, tooltips, toasts) y `shadow-brand` (botón flotante "+" y logotipo).
- `--font-sans`: Inter.
- Utilidad propia `select-chevron` (`@utility`): la flecha de los `<select>`.
- Preparado para un modo oscuro futuro: los colores salen de tokens, no de valores escritos en cada componente.

**Componentes base** (`src/components/`). Usarlos siempre en lugar de repetir clases:

- `Button`: variantes `primary`, `secondary`, `ghost` y `danger`, y tamaños `md` y `sm` (los dos de 44px de alto). Por defecto es `type="button"`; los de envío llevan `type="submit"` explícito.
- `Card`: la superficie de todos los bloques. Padding por prop (`none`, `md` o `lg`) y `as` (`div`, `section` o `li`).
- `SectionCard`: `Card` con título y enlace opcional ("Ver todas ›"), para los bloques del dashboard.
- `StatCard` (cifra con icono) y `BalanceHero` (la cifra protagonista sobre el degradado de marca: **una sola por vista**).
- `ErrorState`: error de carga con "Reintentar". `ListSkeleton` y `Skeleton`: placeholders con la forma del contenido mientras carga, en lugar de "Cargando…".
- `EmptyState`: lista vacía con icono, título, pista y la acción para salir de ese estado (crear el primero, ver otros meses…).
- `ChartTooltip`: el marco común de los tooltips de los gráficos (el valor en negrita delante y la serie detrás, identificada con una rayita de su color).
- `BrandLogo` (variante `inverted` para fondos de color) y `UserAvatar` (iniciales).
- **Regla de `className`:** en `Button`, `Card` y similares, `className` es solo para el **layout** (ancho, márgenes, `flex`, `gap`…), nunca para colores, padding o `display`. Dos clases de Tailwind para la misma propiedad no se pisan por su orden en el atributo, sino por su orden en el CSS generado. Para ocultar un `Button` según el tamaño de pantalla, envolverlo en un `div` con `hidden md:block`.

**Estilos compartidos** (`src/utils/`), como cadenas de clases y no como componentes, porque cada formulario tiene su propio marcado:

- `formStyles.ts`: `fieldClass` (inputs), `selectClass`, `labelClass`, `fieldErrorClass` y `fieldSurfaceClass` (la superficie sin padding, para campos con su propio padding como `SearchInput`). `TextField` los envuelve para los casos simples. Todo campo nuevo usa estas clases.
- `dialogStyles.ts`: `dialogClass`, la forma de los `<dialog>`. En móvil es un *bottom sheet* que sube desde abajo; en escritorio, una ventana centrada. `Modal` y `ConfirmDialog` lo usan, y cada uno añade su ancho (`md:max-w-lg`, `md:max-w-sm`).

**Avisos (toasts):** `useToast()` (contexto en `hooks/useToast.ts`, con `ToastProvider` envolviendo la app en `main.tsx`). Tras cada acción que guarda, borra, confirma o copia, mostrar `toast.success('…')` en el mismo `onSuccess` que cierra el modal. Los **errores** se muestran dentro del formulario o diálogo, junto a lo que ha fallado, y no en un toast.

**Animaciones:** transición entre páginas con `<ViewTransition>` de React en `AppLayout` (no la prop `viewTransition` de React Router, que está deprecada). Lleva `key={pathname}` y `default="none"` para que los cambios de filtros o de mes dentro de una página no se animen. Toda animación respeta `prefers-reduced-motion` (`motion-reduce:`).

## Diseño responsive

- Diseñar primero para móvil y ampliar con `md:` y `lg:`.
- Navegación: barra inferior con iconos en móvil, barra lateral en escritorio.
  - La barra inferior tiene solo **4 secciones** de uso diario (Inicio, Transacciones, Fijos y Presupuestos), para que las etiquetas quepan enteras. Ajustes va como icono en la barra superior del móvil, y Categorías se abre desde Ajustes. En escritorio, todas están en la barra lateral.
  - Se controla con `inBottomBar` en la lista `navItems` de `AppLayout.tsx`. Antes de añadir una sección nueva a la barra inferior, comprobar que sigue cabiendo en 360px.
  - La barra lateral (`Sidebar.tsx`) se pliega y despliega con el botón ☰ de arriba. Plegada, muestra solo los iconos, con el nombre en un tooltip. La elección se guarda en `localStorage` (`utils/sidebar.ts`). Sin elección previa, empieza plegada en tablet (`md`) y desplegada en pantallas grandes (`lg`).
  - El logotipo lleva a `/dashboard`, en la barra lateral y en la barra superior del móvil.
  - La barra superior del móvil tiene una altura fija (`h-14`): las cabeceras de día de `/transactions` se pegan justo debajo (`top-14`). Si cambia su altura, hay que cambiar las dos.
- Transacciones: lista de tarjetas en móvil, tabla en escritorio.
- Botón flotante "+" en móvil para añadir una transacción.
- Gráficos siempre dentro de `ResponsiveContainer` de Recharts.
- Botones y elementos táctiles de al menos 44px de alto.

## Despliegue

Todo en planes gratuitos. El despliegue lo hago yo manualmente (crear cuentas, conectar el repo, configurar variables). Tu papel es preparar los archivos de configuración y explicarme los pasos.

| Pieza | Servicio | Notas |
|---|---|---|
| Frontend | Vercel (`https://cashtrail-gilt.vercel.app`) | Root directory: `frontend`, preset Vite. Se despliega en cada push a `main` |
| Backend | Render, Web Service gratuito (`https://cashtrail-api-r8v6.onrender.com`) | Root directory: `backend`, región Frankfurt, health check en `/api/health`. Se despliega en cada push a `main` que toque `backend/`. Se duerme tras 15 min sin tráfico y tarda ~1 min en despertar |
| Base de datos | Neon, plan gratuito (región Frankfurt, PostgreSQL 17) | La misma versión que en Docker. No usar la base de datos gratuita de Render, porque caduca y se borra. Se suspende tras 5 min sin consultas |

Backend y base de datos en la misma región para que cada consulta tarde ~1 ms. Las URLs públicas no son secretas; las credenciales, sí (ver "Variables de entorno").

### Rewrite en Vercel (mismo dominio para las cookies)

Safari (iPhone/iPad) bloquea las cookies entre dominios distintos. Para evitarlo, el frontend **nunca** llama directamente a la URL de Render: todas las peticiones van a `/api/...` en el propio dominio de Vercel, y `frontend/vercel.json` las reenvía al backend:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://cashtrail-api-r8v6.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

La segunda regla hace que React Router funcione al recargar cualquier ruta. Vercel sirve antes los archivos que existen (`/assets/...`, `/favicon.svg`), así que esa regla solo captura las rutas de la app. El orden importa: la regla de `/api` tiene que ir primero. Si cambia la URL de Render, hay que cambiarla aquí y en el secret `BACKEND_URL`. En local, el proxy de Vite (`server.proxy` en `vite.config.ts`) hace lo mismo hacia `http://localhost:3000`, así el código del frontend usa siempre rutas relativas (`/api/...`).

Configuración de la cookie de sesión: `httpOnly: true`, `sameSite: "lax"`, `secure: true` en producción, `path: "/"`.

### Tarea diaria con GitHub Action

`.github/workflows/daily-recurring.yml` se ejecuta una vez al día a las **05:17 UTC** (no a una hora en punto: GitHub retrasa los workflows programados a esas horas) y también manualmente (`workflow_dispatch`, botón "Run workflow" en la pestaña Actions). Pasos:

1. Llamar a `GET /api/health` para despertar el servidor, con reintentos y un tiempo de espera amplio (`curl --retry 5 --retry-delay 20 --retry-all-errors --max-time 120`), porque Render puede tardar en arrancar. `--retry-all-errors` hace falta porque `--retry` no reintenta las conexiones rechazadas mientras arranca.
2. Llamar a `POST /api/jobs/recurring` con la cabecera `x-cron-secret`.
3. Fallar el workflow si la respuesta no es 200, para que GitHub me avise por email. El endpoint responde 500 si falla algún fijo.

Más detalles:

- `BACKEND_URL` apunta a Render directamente, no a Vercel: aquí no hay cookies y el rewrite sería un salto más.
- Los secretos se pasan con `env:` y el script los lee como variables del shell, nunca como `${{ secrets.X }}` dentro del script (evita la inyección de código en el script).
- `permissions: {}` (el `GITHUB_TOKEN` no necesita acceso al repositorio), `timeout-minutes: 10` y `concurrency` para que nunca haya dos ejecuciones a la vez.

La URL del backend y `CRON_SECRET` se guardan como secrets del repositorio, nunca en el código.

### Variables de entorno

**Backend (Render):** `DATABASE_URL` (conexión con pooling de Neon), `DIRECT_URL` (conexión directa de Neon, para las migraciones de Prisma), `JWT_SECRET`, `CRON_SECRET`, `APP_URL` (`https://cashtrail-gilt.vercel.app`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` y `NODE_ENV=production`. `PORT` no se define: la pone Render. El servidor no arranca si falta alguna (salvo `DIRECT_URL`, que solo usa la CLI).

- La **app** usa `DATABASE_URL` (en `src/lib/prisma.ts`, a través del adaptador). La **CLI de Prisma** usa `DIRECT_URL` y, si no existe, `DATABASE_URL` (en `prisma.config.ts`). Las migraciones necesitan la conexión directa porque el pooler de Neon (PgBouncer en modo transacción) no mantiene la sesión que usa el motor de migraciones. En local `DIRECT_URL` es opcional.
- `JWT_SECRET` y `CRON_SECRET` de producción son **distintos** de los de local. El `CRON_SECRET` de Render y el de GitHub tienen que ser el mismo.

**GitHub (secrets del repo):** `BACKEND_URL`, `CRON_SECRET`.

**Vercel:** ninguna. La URL del backend está en `vercel.json`.

### Build y arranque en Render

- Build: `npm ci --include=dev && npx prisma generate && npx prisma migrate deploy && npm run build`
  - `--include=dev` es obligatorio: las variables de entorno también existen durante el build y, con `NODE_ENV=production`, npm no instala las `devDependencies`, donde están `prisma` y `typescript`. Sin ellas `npx` descargaría la última versión de Prisma (no la 7).
  - `npm ci` instala exactamente lo que dice el `package-lock.json`.
  - Las migraciones van en el build porque el "Pre-Deploy Command" de Render es de pago. Si una migración falla, el build falla y Render mantiene la versión anterior.
- Start: `npm start` (ejecuta el JavaScript compilado en `dist/`)
- La versión de Node la fija `engines.node` (`24.x`) en `backend/package.json`.
- En producción se usa `prisma migrate deploy`, **nunca** `prisma migrate dev`.

### Base de datos de producción

- Para lanzar un comando de Prisma contra Neon desde mi máquina, poner la URL directa solo en la terminal con `read -rs "DIRECT_URL?…"` + `export DIRECT_URL` (no queda en el historial ni en ningún archivo), y hacer `unset DIRECT_URL` al terminar. `dotenv` no pisa las variables que ya existen.
- **Nunca** guardar las URLs de Neon en `.env`, ni lanzar `prisma migrate dev` o el seed contra producción (el seed crea usuarios con una contraseña conocida).
- Los usuarios de los seeds solo existen en local. En producción, cada uno se registra desde `/register`.

## Hoja de ruta

- [x] **Fase 1:** estructura del proyecto y CRUD de transacciones sin login
  - [x] Estructura del proyecto, Docker con Postgres, esquema de Prisma (User, Category y Transaction), primera migración, cliente de Prisma y seed con un usuario de prueba y categorías
  - [x] Backend: CRUD de transacciones (rutas, controladores, servicios, repositorios, validación con Zod y middleware de errores) usando temporalmente el usuario del seed
  - [x] Frontend: proxy de Vite, React Router, TanStack Query y página `/transactions` con lista y formulario
- [x] **Fase 2:** autenticación y protección de rutas. El registro crea las categorías por defecto del usuario: crear `src/constants/defaultCategories.ts` con la lista de "Categorías por defecto" y adaptar el seed existente para que use esa misma lista.
- [x] **Fase 3:** categorías, filtros y paginación
- [x] **Fase 4:** gastos e ingresos fijos: modelo, CRUD, lógica de generación, endpoint `/jobs/recurring` y confirmación de pendientes
- [x] **Fase 5:** dashboard con gráficos, endpoints de estadísticas y próximos gastos fijos
- [x] **Fase 6:** presupuestos y exportar a CSV, más la página `/settings` con perfil y moneda
- [x] **Rediseño visual** (antes de la Fase 7): tokens de diseño, componentes base, barra lateral plegable, transiciones entre páginas, dashboard con hero, campos unificados, bottom sheets, estados vacíos, agrupación por día, login con panel de marca, toasts, favicon y Prettier (ver "Sistema de diseño")
- [x] **Fase 7:** despliegue: Neon, Render, Vercel con rewrite y GitHub Action diaria
- [x] **Fase 7.5:** registro e inicio de sesión con Google (OAuth 2.0 / OpenID Connect con PKCE, con Arctic): modelo `AuthAccount`, flujo en el backend, botón en `/login` y `/register`, y métodos de inicio de sesión en `/settings` (vincular, desvincular y crear contraseña). Ver "Inicio de sesión con Google". Microsoft, opcional y más adelante (bastaría con añadirlo al enum `AuthProvider`). Se descartan Apple (de pago y usa `form_post`, incompatible con la cookie `sameSite: "lax"`), Facebook y X.
- [ ] **Fase 8:** gastos compartidos: espacios compartidos, invitaciones, gastos con reparto y cuenta común, balance y saldos, categorías y gastos fijos compartidos, dashboard compartido y presupuestos compartidos. Dividirla en subfases al planificarla.

Ideas para después: cambiar la contraseña y el email desde `/settings` (pidiendo la contraseña actual), límite de intentos en `/auth/login` y `/auth/register` (ahora el registro está abierto a cualquiera con la URL y no hay protección contra fuerza bruta; necesitaría `app.set('trust proxy', 1)` en Render), dividir el bundle del frontend por rutas con `lazy()`, importar extractos bancarios en CSV, tests con Vitest y Playwright, modo oscuro (los tokens ya lo dejan preparado), PWA (el icono de iOS ya existe: `public/apple-touch-icon.png`, 180×180, cuadrado y sin transparencia; si cambia el logotipo, hay que regenerarlo junto con `favicon.svg`), atajos de teclado en escritorio (`N` para nueva transacción, `/` para buscar), categorización automática con IA.
