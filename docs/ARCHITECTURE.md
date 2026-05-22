# Arquitectura

## Capas

- `src/app`: rutas publicas, rutas privadas, APIs y cron.
- `src/components`: componentes reutilizables de UI.
- `src/lib/db`: esquema Drizzle y cliente Neon lazy.
- `src/lib/actions`: Server Actions con validacion de permisos.
- `src/lib/data`: consultas y materializacion del apodo del dia.
- `src/lib/product`: reglas puras testeadas.

## Privacidad

`proxy.ts` redirige visitantes sin cookie a `/login`. Ese bloqueo es solo optimista. Cada layout privado, Server Action y Route Handler vuelve a validar sesion con Better Auth.

Las imagenes se suben a Vercel Blob con `access: "private"` y se sirven por `/api/media/[id]`, que exige sesion.

## Personas y perfiles

La tabla `people` representa tanto usuarios reales como perfiles no reales. `kind` nunca se muestra en UI publica; solo se usa para permisos y votacion. Los perfiles no reales no tienen fila de usuario ni credenciales.

## Votaciones

Todas las propuestas sensibles usan `proposals` y `proposal_votes`. El umbral es:

```ts
Math.max(1, Math.floor(realUserCount * 0.3 + 0.5))
```

El creador puede votar y cada usuario real activo vota una sola vez por propuesta.

## Apodo del dia

`/api/cron/daily-nicknames` corre diario. Tambien se materializa lazy al cargar vistas. Para cada persona, gana el apodo con mas postulaciones; empates por postulacion mas antigua y hash estable. Si no hay postulaciones, se elige un apodo aprobado por hash estable.
