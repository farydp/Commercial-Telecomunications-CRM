# TrujiConnect

MVP funcional de un mini CRM privado para networking comercial, construido con Next.js App Router, TypeScript, Tailwind CSS y Supabase.

## Incluye

- Login con Supabase Auth por email/password
- UI visible con nombre de perfil y rol interno
- Roles simples `admin` y `user`
- CRUD básico de contactos con captura comercial flexible
- Alerta visual por teléfonos duplicados
- Historial comercial con primera interacción automática, próximos pasos y fechas objetivo
- Dashboard con métricas de seguimiento y actividad reciente
- Placeholder `POST /api/whatsapp-ingest`
- Base preparada para expansión futura a `success_cases`

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Levantar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta las migraciones SQL de [supabase/migrations/20260311_init.sql](/C:/programasFaryd/Automatizaciones/dataBaseTruji/supabase/migrations/20260311_init.sql) y [supabase/migrations/20260311_remove_contact_status.sql](/C:/programasFaryd/Automatizaciones/dataBaseTruji/supabase/migrations/20260311_remove_contact_status.sql) en ese orden.
3. En `Authentication > Users`, crea estos usuarios manualmente:
   - `admin@trujiconnect.local`
   - `santiago@trujiconnect.local`
4. Al crear cada usuario, agrega metadata inicial:

```json
{
  "display_name": "Santiago",
  "role": "user"
}
```

Para el admin usa:

```json
{
  "display_name": "admin",
  "role": "admin"
}
```

5. Define la contraseña de Santiago como `Sant123`.
6. El trigger `handle_new_user` creará automáticamente el perfil visible en `profiles`.

## Modelo de datos

### `profiles`
Perfil visible y rol de cada usuario autenticado.

### `contacts`
Registro comercial flexible. Casi todos los campos son opcionales para no bloquear la captura inicial.

### `contact_updates`
Historial cronológico de notas, interacciones, próximos pasos y fechas objetivo.

### Futuro: `success_cases`
El esquema deja documentada la futura expansión para casos de venta exitosos. No está implementado en UI en este MVP.

## WhatsApp futuro

La integración real no está implementada. La base preparada es:

- Endpoint placeholder: `POST /api/whatsapp-ingest`
- Parser placeholder: [lib/placeholders/whatsapp.ts](/C:/programasFaryd/Automatizaciones/dataBaseTruji/lib/placeholders/whatsapp.ts)
- Estrategia sugerida:
  1. Recibir mensaje o nota libre desde WhatsApp.
  2. Parsear parcialmente campos detectables como teléfono o email.
  3. Insertar en `contacts` los campos detectados.
  4. Guardar el texto completo en `raw_capture`.
  5. Registrar ese contenido como primera interacción en el historial.
  6. Completar manualmente desde la UI los datos faltantes.

## Despliegue en Vercel

El flujo recomendado queda en dos caminos: importando el repo en Vercel o usando CLI para generar previews bajo demanda.

### Variables requeridas

Define en Vercel estas variables para `Preview` y `Production`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Verificacion local antes de deploy

```bash
npm run verify:deploy
```

Ese comando valida variables, corre lint, typecheck y prueba el build local.

### Deploy preview con Vercel CLI

```bash
vercel link
npm run deploy:preview
```

Si necesitas production de forma explicita:

```bash
npm run deploy:prod
```

### Importando el repo en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Configura las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `Preview` y `Production`.
4. Ejecuta un deploy.
5. Verifica que en Supabase el `Site URL` incluya la URL de Vercel si luego agregas recovery o magic links.

Consulta la guia operativa en [docs/deploy-vercel.md](/C:/programasFaryd/Automatizaciones/dataBaseTruji/docs/deploy-vercel.md).

## Notas

- Este MVP asume autenticación por email/password estándar de Supabase.
- La app usa RLS para limitar acceso a usuarios autenticados.
- El indicador visual de desarrollo de Next puede verse en `npm run dev`; no aparece en producción.
- No se implementó integración real con WhatsApp ni módulo completo de casos exitosos, solo la base para la siguiente iteración.

