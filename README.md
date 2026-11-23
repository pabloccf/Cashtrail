# Cashtrail

Aplicación web para llevar el control de tus finanzas personales: registra ingresos y gastos, organízalos por categorías, fija presupuestos mensuales y consulta estadísticas con gráficos.

**👉 Pruébala en [cashtrail-gilt.vercel.app](https://cashtrail-gilt.vercel.app)**

> Cashtrail es solo una herramienta de registro. No realiza pagos, no mueve dinero y no se conecta a bancos.

🚧 **En desarrollo.** Próximamente: gastos compartidos con otra persona (por ejemplo, la pareja).

> La primera carga puede tardar alrededor de un minuto: el servidor está en un plan gratuito y se duerme cuando nadie lo usa.

## Funcionalidades

- **Cuenta con email y contraseña o con Google.** Puedes vincular o desvincular Google desde los ajustes.
- **Ingresos y gastos** con filtros, búsqueda, paginación y selector de mes.
- **Categorías** personalizadas, con color e icono. Al registrarte se crean unas categorías por defecto.
- **Gastos e ingresos fijos** (suscripciones, préstamos, nómina...): se registran solos cada mes o cada año. Si el importe varía, como en la factura de la luz, la app te pide confirmarlo.
- **Presupuestos mensuales** por categoría, con una barra de progreso para ver cuánto te queda.
- **Dashboard** con el resumen del mes, gráficos, registros pendientes y próximos gastos fijos.
- **Exportación a CSV**, preparada para abrirla en Excel.
- **Moneda** a elegir (EUR, USD, GBP o CHF).
- Diseño adaptado a **móvil y escritorio**.

## Tecnologías

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, React Hook Form, Zod, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma, Zod, JWT, Arctic (inicio de sesión con Google)
- **Base de datos:** PostgreSQL
- **Despliegue:** Vercel (frontend), Render (backend), Neon (base de datos) y una GitHub Action diaria que genera los registros fijos

## Ejecutar en local

Requisitos: Node.js 24 y Docker.

```bash
# 1. Variables de entorno (Docker también las lee para crear la base de datos)
cd backend
cp .env.example .env    # rellena los valores

# 2. Base de datos (desde la raíz)
cd ..
docker compose up -d

# 3. Backend
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run dev

# 4. Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```

La app queda en [http://localhost:5173](http://localhost:5173). El inicio de sesión con Google solo funciona en local si rellenas `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` con un cliente OAuth propio.
