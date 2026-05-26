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

## Seguridad interna

- `next.config.ts` aplica headers globales: `nosniff`, `DENY` para iframes, `Referrer-Policy`, `Permissions-Policy` y `Content-Security-Policy-Report-Only`.
- `serverActions.allowedOrigins` limita acciones a produccion, previews de Vercel y localhost; `bodySizeLimit` reduce payloads enormes.
- `src/lib/security/request.ts` valida `Origin`/`Host` en acciones sensibles.
- `src/lib/security/rate-limit.ts` aplica limites suaves por IP o usuario para login, invitaciones, votos, posts, comentarios, apodos, postulaciones y fotos. Los bloqueos quedan auditados.
- `src/lib/security/text.ts` normaliza Unicode, elimina caracteres invisibles/control y recorta textos antes de validarlos.
- `src/lib/security/image.ts` valida el contenido real de las imagenes con Sharp y rechaza formatos peligrosos antes de optimizar a WebP.
- Las APIs de medios no muestran datos privados a usuarios sin sesion y devuelven `404` cuando un recurso privado no debe revelarse.

## Personas y perfiles

La tabla `people` representa tanto usuarios reales como perfiles no reales. `kind` nunca se muestra en UI publica; solo se usa para permisos y votacion. Los perfiles no reales no tienen fila de usuario ni credenciales.

## Votaciones

Todas las propuestas sensibles usan `proposals` y `proposal_votes`. Los porcentajes se guardan en `app_settings` y se pueden cambiar desde el panel admin. El umbral por defecto sigue siendo 30%:

```ts
Math.max(1, Math.floor(realUserCount * (percentage / 100) + 0.5))
```

El creador puede votar y cada usuario real activo vota una sola vez por propuesta.

## Textos configurables

`app_settings` guarda `site_copy` y `voting`. Admin puede aplicar cambios directos y cualquier usuario real puede proponer `UPDATE_SITE_COPY`; al aprobarse, se actualizan titulo, login, comentario pequeno y textos principales del inicio. Estos cambios dejan actividad y auditoria.

## Apodo del dia

`/api/cron/daily-nicknames` corre diario. Tambien se materializa lazy al cargar vistas. Para cada persona, gana el apodo con mas postulaciones; empates por postulacion mas antigua y hash estable. Si no hay postulaciones, se elige un apodo aprobado por hash estable.
