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

## Cron

`vercel.json` registra `/api/cron/daily-nicknames` a las `06:05 UTC`. La ruta exige:

```http
Authorization: Bearer CRON_SECRET
```

## Notas

El build es seguro sin variables porque el cliente DB se inicializa de forma lazy. La aplicacion en runtime si requiere `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BLOB_READ_WRITE_TOKEN` y `CRON_SECRET`.
