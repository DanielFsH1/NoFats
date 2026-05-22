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

## Checklist manual recomendado

- Registro por invitacion y uso unico del cupo.
- Login/logout.
- Panel admin y creacion de cupos/perfiles no reales.
- Votaciones con comentarios.
- Apodos directos propios, propuestas de apodos ajenos y eliminacion.
- Posts, respuestas y comentarios.
- Subida de imagen valida e invalida.
- Apodo del dia estable al recargar.
