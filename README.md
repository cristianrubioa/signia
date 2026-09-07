# Signia

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

Generador de firmas de correo HTML, limpias y compatibles con clientes de email, en menos de un minuto. Todo corre en el navegador — sin backend, sin cuenta, sin tracking.

## Correr local

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Comando           | Qué hace                              |
| ------------------ | -------------------------------------- |
| `npm run dev`       | Servidor de desarrollo (Vite)          |
| `npm run build`     | Type-check + build de producción       |
| `npm run preview`   | Sirve el build de producción localmente |
| `npm run lint`      | Lint con oxlint                        |
| `npm run test`      | Tests con Vitest (piso de 80% coverage) |

## Stack

React 19 + TypeScript + Vite + Tailwind 4. Sin backend: los datos de la firma se guardan en `localStorage` del navegador. Única dependencia de runtime más allá de React: `js-yaml`, para el import/export de configuración.

## Deploy

Vercel detecta el preset de Vite automáticamente — `npm run build` genera `dist/`, sin config extra. No hay rutas del lado del cliente (una sola página), así que tampoco hace falta un rewrite de SPA.
