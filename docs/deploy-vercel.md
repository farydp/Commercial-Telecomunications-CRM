# Deploy en Vercel

## Objetivo

Tener un flujo reproducible para preview deploys en Vercel con validacion previa de entorno y build.

## Variables necesarias

Configura estas variables tanto en `Preview` como en `Production`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Flujo recomendado

1. Verifica que la app compile localmente:

```bash
npm run verify:deploy
```

2. Vincula el directorio con tu proyecto de Vercel si aun no existe `.vercel/project.json`:

```bash
vercel link
```

3. Lanza un deploy preview:

```bash
npm run deploy:preview
```

4. Solo si quieres production de forma intencional:

```bash
npm run deploy:prod
```

## Que hace cada script

- `npm run check:env`: valida que las variables minimas de Supabase existan y tengan formato correcto.
- `npm run verify:deploy`: ejecuta validacion de variables, lint, typecheck y build local.
- `npm run deploy:preview`: valida entorno y lanza `vercel deploy -y`.
- `npm run deploy:prod`: valida entorno y lanza `vercel deploy --prod -y`.

## Fallos comunes

### Falta de variables

Si el deploy o el build falla por `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`, agregalas en:

- `Project Settings > Environment Variables` dentro de Vercel.
- O por CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Proyecto no vinculado

Si es la primera vez desde CLI, ejecuta:

```bash
vercel link
```

### Auth de Supabase en Vercel

Si mas adelante agregas magic links, recovery o callbacks externos:

- agrega la URL de Vercel a `Site URL` en Supabase.
- agrega previews o dominios adicionales a la allowlist de redirects si aplica.
