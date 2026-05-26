# Despliegue

## Vercel

1. Crea o conecta el proyecto de Vercel al repo `DanielFsH1/NoFats`.
2. Provisiona Neon Postgres y Vercel Blob desde Vercel Marketplace.
3. Configura variables de `.env.example` en Production y Preview.
4. Ejecuta migraciones:

```bash
npm run db:migrate
npm run db:seed
```

5. Despliega con Git integration o manualmente:

```bash
npx vercel --prod
```

## Deploy automatico

Cuando Vercel esta conectado a GitHub:

- Push a ramas crea Preview Deployments.
- Merge a `main` crea Production Deployment.
- Logs: Vercel Dashboard > Project > Deployments > Logs.

Proyecto preparado:

- Team: `team_Z9E8nPASuMWC0N04VYyA3gHe`.
- Proyecto Vercel: `nofats`.
- URL esperada de produccion: `https://nofats.vercel.app`.
- Repo GitHub: `https://github.com/DanielFsH1/NoFats`.

Si la opcion "Connected Git Repository" no aparece conectada, entra a Vercel > Project Settings > Git > Connected Git Repository y selecciona `DanielFsH1/NoFats`. Despues cada merge a `main` despliega produccion automaticamente.

## Repositorio privado

El repo puede cambiarse a privado porque el proyecto ya esta conectado a Vercel. Pasos recomendados:

1. En GitHub: Repository Settings > General > Danger Zone > Change visibility > Private.
2. En GitHub: Settings > Collaborators and teams > Add people, invita a tus amigos por usuario o correo.
3. En Vercel: Project Settings > Git, confirma que `Connected Git Repository` siga apuntando a `DanielFsH1/NoFats`.
4. Abre un PR de prueba o empuja una rama para confirmar que Vercel crea Preview Deployments.

Si Vercel pierde acceso despues de hacerlo privado, reconecta GitHub desde Project Settings > Git con la misma cuenta que tiene permisos sobre el repo.

## Seguridad de despliegue

La CSP esta en modo `Report-Only` para observar problemas sin romper la UI. Cuando los reportes esten limpios se puede pasar a CSP estricta. Las Server Actions aceptan origenes de produccion, previews `*.vercel.app` y localhost. Mantener `CRON_SECRET`, `BETTER_AUTH_SECRET`, `DATABASE_URL` y `BLOB_READ_WRITE_TOKEN` solo en Vercel/env local, nunca en Git.

## Cron

`vercel.json` registra `/api/cron/daily-nicknames` a las `06:05 UTC`. La ruta exige:

```http
Authorization: Bearer CRON_SECRET
```

## Notas

El build es seguro sin variables porque el cliente DB se inicializa de forma lazy. La aplicacion en runtime si requiere `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BLOB_READ_WRITE_TOKEN` y `CRON_SECRET`.

Vercel Blob puede crearse con:

```bash
npx vercel blob create-store nofats-media --access private --region iad1 --yes --environment production --environment preview --environment development
```

Si Neon Marketplace solicita aceptar terminos, abre la URL que imprime Vercel CLI, acepta los terminos y vuelve a ejecutar:

```bash
npx vercel integration add neon --name nofats-db --plan free_v3 --metadata region=iad1 --metadata auth=false --format=json
```
