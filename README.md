# Cashtrail

Aplicación web para llevar el control de tus finanzas personales: registra ingresos y gastos, organízalos por categorías, fija presupuestos mensuales y consulta estadísticas con gráficos.

> Cashtrail es solo una herramienta de registro. No realiza pagos, no mueve dinero y no se conecta a bancos.

🚧 **En desarrollo.** Algunas de las funcionalidades descritas aún no están disponibles.

## Funcionalidades

- **Ingresos y gastos** con filtros y búsqueda.
- **Categorías** personalizadas, con color e icono.
- **Gastos e ingresos fijos** (suscripciones, préstamos, nómina...): se registran solos cada mes o cada año. Si el importe varía, como en la factura de la luz, la app te pide confirmarlo.
- **Presupuestos mensuales** por categoría, para ver cuánto te queda.
- **Dashboard** con el resumen del mes, gráficos y próximos gastos fijos.
- **Exportación a CSV**.
- Diseño adaptado a **móvil y escritorio**.

## Tecnologías

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, Recharts
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Base de datos:** PostgreSQL

## Ejecutar en local

Requisitos: Node.js y Docker.

```bash
# Base de datos
docker compose up -d

# Backend
cd backend
cp .env.example .env    # rellena los valores
npm install
npx prisma migrate dev
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
npm run dev
```
