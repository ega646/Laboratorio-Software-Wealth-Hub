# Checklist de configuración manual en Supabase

Todo lo que hay en esta lista **no se puede hacer desde el código** y debe hacerse desde el panel web de Supabase antes de arrancar la aplicación.

---

## Paso 1 — Ejecutar los SQL (en orden)

Ir a **Supabase → SQL Editor** y ejecutar estos archivos en orden:

- [ ] `00_tablas.sql` — Crea las tablas `perfiles`, `activos` y `divisas`
- [ ] `01_rls_y_trigger.sql` — Activa RLS, crea políticas de seguridad y el trigger automático de perfil
- [ ] `02_datos_iniciales.sql` — Inserta las divisas base

---

## Paso 2 — Configurar autenticación

Ir a **Supabase → Authentication → Providers**:

- [ ] Verificar que **Email** está habilitado (viene activo por defecto)
- [ ] En **Email → Confirm email**: decidir si se requiere confirmación de email al registrarse. Para desarrollo, se recomienda **desactivarlo** para no tener que verificar correos.

---

## Paso 3 — Obtener las credenciales del proyecto

Ir a **Supabase → Settings → API**:

- [ ] Copiar la **Project URL** (ej: `https://xxxx.supabase.co`)
- [ ] Copiar la **anon/public key** (empieza con `eyJ...`)
- [ ] Crear el archivo `.env.local` copiando `.env.local.example` y pegando los valores

---

## Paso 4 — Instalar dependencias en el frontend

Desde la terminal, en la raíz del repositorio:

```bash
npm install
```

Los paquetes `@supabase/supabase-js` y `@supabase/ssr` ya están declarados en `package.json`, solo hay que instalarlos.

---

## Paso 5 — Verificar que todo funciona

- [ ] Arrancar el servidor: `npm run dev`
- [ ] Ir a `/register` y crear una cuenta
- [ ] Verificar en **Supabase → Authentication → Users** que el usuario apareció
- [ ] Verificar en **Supabase → Table Editor → perfiles** que se creó automáticamente una fila (gracias al trigger)
- [ ] Iniciar sesión con ese usuario en `/login`
- [ ] Confirmar que el dashboard redirige correctamente

---

## Paso 6 — Eliminar el proyecto Java (cuando todo funcione)

- [ ] Confirmar que todos los endpoints de TypeScript funcionan
- [ ] Borrar la carpeta `Controlador/` del repositorio
- [ ] Hacer commit: `chore: remove java backend, migrated to supabase client`

---

## Notas importantes

- El archivo `.env.local` **nunca se sube al repositorio** (ya está en `.gitignore`)
- Las credenciales de Supabase las gestiona Jose (Lead) y las comparte de forma segura con el equipo
- La `anon key` es pública por diseño (solo permite lo que RLS autoriza), pero la `service_role key` es secreta y NO debe usarse en el frontend
