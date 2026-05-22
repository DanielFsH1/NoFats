# Contribuir a NoFats

## Primer setup

```bash
git clone https://github.com/DanielFsH1/NoFats.git
cd NoFats
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Para pruebas locales sin Neon, usa `PGLITE_DATA_DIR="./.data/pglite"` en `.env.local` y cambia el paso de migracion por:

```bash
npm run db:migrate:local
```

## Flujo Git

- `main` es la rama estable y despliega a produccion.
- Crea ramas con nombres claros: `feature/galeria`, `fix/votacion-duplicada`.
- Antes de subir cambios corre:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Pull Requests

- Explica que cambio hiciste y como lo probaste.
- Incluye capturas si cambias UI.
- No subas `.env.local`, tokens, dumps de base de datos ni secretos.
- No modifiques migraciones ya aplicadas sin coordinarlo.

## Zonas delicadas

- `src/lib/db/schema.ts`: cambios aqui requieren migracion.
- `src/lib/actions/*`: todas las mutaciones deben validar sesion y permisos.
- `src/lib/product/rules.ts`: reglas de votacion, nombres y apodo diario.
- `src/app/api/media/[id]/route.ts`: protege imagenes privadas.
