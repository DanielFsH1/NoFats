# Pruebas

## Unitarias

```bash
npm test
```

Cubren reglas puras de producto: umbral de votos, personas elegibles, nombre visible, permisos y apodo diario estable.

## Calidad estatica

```bash
npm run lint
npm run typecheck
```

## E2E

```bash
npm run test:e2e
```

Las pruebas e2e arrancan el servidor local. Para probar contra una URL desplegada:

```bash
set PLAYWRIGHT_SKIP_WEB_SERVER=1
set PLAYWRIGHT_BASE_URL=https://tu-app.vercel.app
npm run test:e2e
```

## QA local con datos reales

Si no tienes `DATABASE_URL` de Neon, configura `PGLITE_DATA_DIR="./.data/pglite"` en `.env.local` y prepara una base local embebida:

```bash
npm run db:migrate:local
npm run db:seed
npm run dev
```

Con eso puedes entrar con el admin definido en `ADMIN_EMAIL` / `ADMIN_PASSWORD`, crear cupos, registrar usuarios de prueba y recorrer la app en navegador.

## Checklist manual recomendado

- Registro por invitacion y uso unico del cupo.
- Login/logout.
- Panel admin y creacion de cupos/perfiles no reales.
- Votaciones con comentarios.
- Apodos directos propios, propuestas de apodos ajenos y eliminacion.
- Posts, respuestas y comentarios.
- Subida de imagen valida e invalida.
- Apodo del dia estable al recargar.
