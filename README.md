# HabitUp

Plataforma de retos individuales y en equipo para promover el crecimiento personal.

## Características

- Landing page con secciones informativas y CTAs
- Registro e inicio de sesión (usuario/email + contraseña)
- Recuperación de contraseña por correo (Resend) o link en consola en desarrollo
- Recordatorios por email para completar objetivos diarios (cron horario por zona horaria)
- Dashboard con bottom navigation (Home, Retos, Perfil, +)
- Crear retos (alimenticio, deportivo, intelectual, otro)
- Objetivos diarios con seguimiento y estados (completo, casi, incompleto)
- Invitaciones por link o código
- Ranking por días completados
- Modal de felicitaciones cada 7 días consecutivos
- Perfil con badges y gestión de cuenta

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
npm run db:push
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copia `.env.example` a `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
SESSION_SECRET="change-me-to-a-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="false"
RESEND_API_KEY=""
EMAIL_FROM="HabitUp <onboarding@resend.dev>"
```

> **Recuperación de contraseña:** sin `RESEND_API_KEY`, al solicitar recuperación el enlace aparece en la consola del servidor (`npm run dev`). En producción configura [Resend](https://resend.com) y verifica tu dominio en `EMAIL_FROM`.

> **Recordatorios de objetivos:** Vercel ejecuta `/api/cron/goal-reminders` cada hora. A las **20:00 hora local** de cada usuario (configurable con `GOAL_REMINDER_HOUR`) se envía un correo si tiene retos activos con objetivos incompletos hoy. Requiere `RESEND_API_KEY` y `CRON_SECRET` en Vercel.

> **Nota:** La app usa **PostgreSQL** (no SQLite). En local puedes usar [Neon](https://neon.tech) gratis y pegar la connection string en `DATABASE_URL`.

## Despliegue en Vercel

### 1. Base de datos (PostgreSQL)

Vercel no soporta SQLite. Crea una base gratuita en una de estas opciones:

- **[Neon](https://neon.tech)** (recomendado) → copia la connection string
- **Vercel Postgres** → en tu proyecto Vercel: Storage → Create Database → Postgres
- **Supabase** → Settings → Database → Connection string (URI)

### 2. Subir el código a GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3. Importar en Vercel

1. Entra en [vercel.com/new](https://vercel.com/new)
2. Importa el repositorio de GitHub
3. Framework preset: **Next.js** (detectado automáticamente)
4. En **Environment Variables**, añade:

| Variable | Valor |
|----------|--------|
| `DATABASE_URL` | Tu connection string de PostgreSQL |
| `SESSION_SECRET` | String aleatorio largo (ej. `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | `https://tu-proyecto.vercel.app` (actualiza tras el primer deploy) |

Opcionales (Google OAuth):

| Variable | Valor |
|----------|--------|
| `GOOGLE_CLIENT_ID` | Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | `true` |

5. Click **Deploy**

El build ejecuta `prisma migrate deploy` automáticamente para crear las tablas.

### 4. Después del deploy

1. Actualiza `NEXT_PUBLIC_APP_URL` con tu URL real de Vercel y redeploy
2. Si usas Google OAuth, añade en Google Cloud la redirect URI:
   `https://tu-proyecto.vercel.app/api/auth/google/callback`

### Deploy con CLI (alternativa)

```bash
npm i -g vercel
vercel login
vercel
# Sigue el asistente y configura las variables de entorno cuando te lo pida
vercel --prod
```

## Inicio de sesión con Google

1. Ve a [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Crea un proyecto (o usa uno existente)
3. Configura la **OAuth consent screen** (External, nombre de app, email de soporte)
4. Crea credenciales → **OAuth client ID** → tipo **Web application**
5. En **Authorized redirect URIs** añade:
   - `http://localhost:3000/api/auth/google/callback` (desarrollo)
   - `https://tu-dominio.com/api/auth/google/callback` (producción)
6. Copia Client ID y Client Secret a tu `.env`:
   ```
   GOOGLE_CLIENT_ID="tu-client-id"
   GOOGLE_CLIENT_SECRET="tu-client-secret"
   NEXT_PUBLIC_GOOGLE_AUTH_ENABLED="true"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
7. Reinicia el servidor de desarrollo

## Estructura

```
src/
  app/           # Rutas Next.js App Router
  actions/       # Server actions (auth, retos)
  components/    # UI y componentes de app
  lib/           # Utilidades, DB, auth
prisma/          # Esquema PostgreSQL + migraciones
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (+ migraciones) |
| `npm run db:migrate` | Aplicar migraciones en producción |
| `npm run db:push` | Sincronizar esquema (solo desarrollo) |
| `npm run db:studio` | Explorar base de datos |
