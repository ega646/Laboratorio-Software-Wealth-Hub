# Checklist de configuración en Supabase

Todo lo que hay en esta lista **no se puede hacer desde el código** y debe hacerse desde el panel web de Supabase antes de arrancar la aplicación.

---

## Paso 1 — Ejecutar los SQL (en orden)

Ir a **Supabase → SQL Editor** y ejecutar estos archivos en orden:

- [ ] `00_tablas.sql` — Añade columnas nuevas, crea la tabla `perfiles`, elimina `usuarios`
- [ ] `01_rls_y_trigger.sql` — Activa RLS, crea políticas de seguridad y el trigger automático de perfil
- [ ] `02_datos_iniciales.sql` — Asigna colores a los activos y añade tipos de cuenta para exchanges

---

## Paso 2 — Configurar autenticación

Ir a **Supabase → Authentication → Providers → Email**:

- [ ] Verificar que **Email** está habilitado (viene activo por defecto)
- [ ] **Desactivar "Confirm email"** para desarrollo — así no hace falta verificar el correo al registrarse

---

## Paso 3 — Obtener las credenciales del proyecto

Ir a **Supabase → Settings → API**:

- [ ] Copiar la **Project URL** (ej: `https://xxxx.supabase.co`)
- [ ] Copiar la **anon/public key** (empieza con `eyJ...`)
- [ ] Crear el archivo `.env.local` copiando `.env.local.example` y pegando los valores

---

## Paso 4 — Instalar dependencias y arrancar

Desde la terminal, en la raíz del repositorio:

```bash
npm install
npm run dev
```

---

## Paso 5 — Verificar que todo funciona

- [ ] Ir a `/register` y crear una cuenta
- [ ] Verificar en **Supabase → Authentication → Users** que el usuario apareció
- [ ] Verificar en **Supabase → Table Editor → perfiles** que se creó automáticamente una fila (gracias al trigger)
- [ ] Iniciar sesión en `/login`
- [ ] Confirmar que redirige al dashboard correctamente

---

## Notas importantes

- El archivo `.env.local` **nunca se sube al repositorio** (está en `.gitignore`)
- Las credenciales de Supabase las gestiona Jose (Lead) y las comparte de forma segura con el equipo
- La `anon key` es pública por diseño (solo permite lo que RLS autoriza), pero la `service_role key` es secreta y NO debe usarse en el frontend
