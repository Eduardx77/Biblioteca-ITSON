# Biblioteca ITSON - Sistema de Reservación de Recursos

Proyecto Next.js para simular la gestión de cubículos y PCs en la biblioteca.

## Cómo ejecutar localmente

1. Instala dependencias:

```bash
npm install
```

2. Inicia el entorno de desarrollo:

```bash
npm run dev
```

3. Abre la app en el navegador:

```
http://localhost:3000
```

4. Construye para producción:

```bash
npm run build
```

## Autenticación actual

- El login usa `ID de estudiante` o correo para iniciar sesión.
- Si se configuran las variables de Supabase, el inicio de sesión se realiza con Supabase Auth.
- El ID y la contraseña se guardan localmente en el navegador para recordar el acceso.
- El botón `¿Olvidaste tu contraseña?` envía un enlace de recuperación si Supabase está configurado.

## Variables de entorno para Supabase

Crea un archivo `.env.local` con estas variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_RESET_PASSWORD_REDIRECT_URL=http://localhost:3000
```

> Si despliegas a Vercel, configura las mismas variables en el panel de `Settings > Environment Variables`.

### Configurar Supabase Auth

1. Crea un proyecto en https://app.supabase.com
2. En `Settings > API`, copia el `URL` y la `anon key`.
3. En `Authentication > Settings`, agrega `http://localhost:3000` a los `Redirect URLs`.
4. En `Authentication > Users`, crea estos usuarios con el mismo email y contraseña que están en `lib/store.ts`:
   - `carlos.lopez@itson.edu.mx` / `123456`
   - `maria.garcia@itson.edu.mx` / `123456`
   - `admin@itson.edu.mx` / `admin123`
5. En `Authentication > Settings > Email`, configura un proveedor SMTP para que el reset de contraseña envíe correos reales.

### Cómo funciona en la app

- El login usa el `ID de estudiante` o el correo.
- Si Supabase está configurado, el inicio de sesión se realiza con `supabase.auth.signInWithPassword(...)`.
- El proyecto usa los emails de los usuarios locales para mapear roles (`student` / `admin`).
- Si Supabase no está configurado, la app sigue usando el login simulado local.

### Probar reset de contraseña

1. Inicia la app con `npm run dev`.
2. Ve a `http://localhost:3000`.
3. Haz clic en `¿Olvidaste tu contraseña?`.
4. Ingresa el `ID` o el `correo`.
5. Si Supabase está configurado correctamente, deberías recibir un enlace en el correo.

## Despliegue

La forma más sencilla de subir este proyecto es a Vercel:

1. Crea una cuenta en https://vercel.com
2. Conecta tu repositorio de GitHub, GitLab o Bitbucket
3. Selecciona el proyecto y usa los valores por defecto:
   - Framework: `Next.js`
   - Build command: `npm run build`
   - Output directory: (ninguno, Next.js lo detecta automáticamente)
4. En `Settings > Environment Variables`, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_RESET_PASSWORD_REDIRECT_URL=https://<tu-app>.vercel.app`

### Notas de despliegue

- Si el reset de contraseña no funciona en producción, revisa que el redirect URL en Supabase incluya la URL final de Vercel.
- Si quieres, también puedo ayudarte a generar el `.gitignore` ideal y el flujo de despliegue paso a paso con los comandos de Git.

## Si quieres habilitar contraseña real

Para activar `Olvidaste tu contraseña` y usar credenciales reales en producción necesitas un backend o servicio de autenticación.

Una opción recomendada es Supabase Auth:

- Configurar proyecto en https://app.supabase.com
- Agregar variables de entorno a Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.)
- Reemplazar la lógica de login de `lib/store.ts` por llamadas a Supabase Auth
- Implementar recuperación de contraseña con Supabase `resetPasswordForEmail`

> Nota: en esta versión actual, el proyecto funciona como demo con credenciales locales solo en el navegador.
