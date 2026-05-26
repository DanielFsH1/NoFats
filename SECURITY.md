# Seguridad

NoFats es un proyecto privado. No publiques secretos, `.env.local`, dumps de base de datos ni tokens de Vercel/Neon/Blob.

## Reportar problemas

Reporta vulnerabilidades directamente al administrador del repositorio o por un issue privado si el repo ya esta en privado. Incluye pasos de reproduccion, URL afectada y alcance estimado.

## Controles actuales

- Autenticacion requerida para contenido social.
- Admin oculto de superficies sociales y fuera de votaciones.
- Blob privado para fotos y rutas autenticadas para servirlas.
- Headers de seguridad y CSP en modo reporte.
- Validacion de origen para Server Actions.
- Rate limiting suave por IP o usuario.
- Sanitizacion centralizada de texto.
- Validacion real de imagenes con Sharp y conversion a WebP.
- Auditoria para acciones relevantes e intentos bloqueados.

## Operacion segura

- Mantener el repositorio privado e invitar colaboradores desde GitHub.
- Revisar PRs antes de fusionar a `main`.
- Correr `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` y, cuando aplique, `npm run test:e2e`.
- Rotar secretos si se filtran o si alguien deja de colaborar en el proyecto.
