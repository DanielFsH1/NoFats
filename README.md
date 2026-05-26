# NoFats

NoFats es una red social privada para un grupo de amigos: perfiles, apodos, apodo del dia, publicaciones, comentarios, fotos, propuestas y votaciones comunitarias.

La app tambien permite ajustar desde administracion los porcentajes de aprobacion/rechazo y cambiar los textos principales de la web. Los usuarios normales pueden proponer cambios de titulo, mensaje principal y comentarios visibles; esos cambios pasan por la misma votacion comunitaria.

## Stack

- Next.js App Router, React, TypeScript y Tailwind CSS.
- Better Auth con correo y contrasena.
- Neon Postgres con Drizzle ORM.
- Vercel Blob privado para imagenes.
- Sharp para optimizacion de imagenes.
- Vitest y Playwright para pruebas.

## Desarrollo local

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

La app abre en [http://localhost:3000](http://localhost:3000). Crea el administrador inicial con las variables `ADMIN_*` y entra con `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Si no tienes Neon configurado localmente, puedes usar la base embebida de QA:

```bash
# en .env.local deja PGLITE_DATA_DIR="./.data/pglite" y no definas DATABASE_URL
npm run db:migrate:local
npm run db:seed
npm run dev
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run db:generate
npm run db:migrate
npm run db:migrate:local
npm run db:seed
npm run test:e2e
```

## Variables

Todas las variables estan documentadas en `.env.example`.

- `DATABASE_URL`: conexion Neon Postgres.
- `PGLITE_DATA_DIR`: base local embebida opcional para QA sin Neon.
- `BETTER_AUTH_SECRET`: secreto de Better Auth.
- `BETTER_AUTH_URL`: URL base local o de produccion.
- `BLOB_READ_WRITE_TOKEN`: token del store Vercel Blob.
- `CRON_SECRET`: secreto para `/api/cron/daily-nicknames`.
- `ADMIN_*`: datos del primer administrador.

## Seguridad

NoFats esta pensada como app privada. Las rutas internas exigen sesion, las imagenes se guardan en Blob privado y se sirven solo por APIs autenticadas. Ademas hay headers de seguridad globales, CSP en modo reporte, bloqueo contra clickjacking, validacion de origen para acciones sensibles, rate limiting suave, sanitizacion de textos, validacion real de imagenes con Sharp y auditoria de intentos bloqueados.

El repositorio puede quedar privado sin afectar el deploy si Vercel conserva la autorizacion de GitHub. En GitHub ve a Settings > General > Danger Zone > Change visibility y cambialo a privado; despues invita a tus amigos desde Settings > Collaborators and teams. Verifica en Vercel > Project Settings > Git que `DanielFsH1/NoFats` siga conectado.

## Configuracion dentro de la app

- Admin > Umbrales de votacion: cambia el porcentaje requerido para aprobar y rechazar propuestas.
- Admin > Textos principales: cambia directo el titulo de la web, el mensaje grande del login, el comentario pequeno y textos del inicio.
- Votos > Proponer textos: cualquier usuario real puede enviar esos cambios a votacion.
- Los cambios aprobados se guardan en `app_settings` y quedan auditados.

## Flujo de colaboracion

1. Clona el repo y crea `.env.local`.
2. Crea una rama desde `main`: `git checkout -b feature/mi-cambio`.
3. Corre `npm run lint`, `npm run typecheck`, `npm test` y, cuando aplique, `npm run test:e2e`.
4. Haz commits pequenos y abre un Pull Request.
5. Al fusionar a `main`, Vercel despliega automaticamente si el proyecto esta conectado al repo de GitHub.

Mas detalles en `CONTRIBUTING.md` y `docs/DEPLOYMENT.md`.
