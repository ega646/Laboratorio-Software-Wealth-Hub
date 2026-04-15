# Documento de Migración — Wealth Hub

**Para:** Marc Sastre (Especialista Backend)  
**Fecha:** Abril 2026  
**Contexto:** El equipo decidió migrar el controlador de Java/Spring Boot a TypeScript usando el cliente oficial de Supabase, aprovechando que la aplicación estaba en etapa inicial y el cambio ahorra semanas de trabajo (auth, sesiones, seguridad, realtime ya resueltos por Supabase).

---

## Qué cambió y por qué

| Antes | Ahora |
|---|---|
| `Controlador/` — Spring Boot en Java | Eliminado. Su lógica vive en `app/api/` |
| Conexión JDBC directa a PostgreSQL | Cliente oficial `@supabase/supabase-js` |
| Auth manual (passwords en texto plano) | Supabase Auth (bcrypt automático, JWT, sesiones) |
| Servidor Java separado (.jar) | Solo Vercel — un único despliegue |
| Sin protección de rutas | Middleware de Next.js con verificación de sesión |

---

## Nueva arquitectura

```
/ (raíz del repo — proyecto Next.js)
├── app/
│   ├── api/               ← El nuevo "Controlador" (TypeScript)
│   │   ├── activos/       ← GET listar, POST crear
│   │   │   └── [id]/      ← GET detalle, DELETE borrar
│   │   ├── portfolio/     ← GET resumen financiero calculado
│   │   └── perfil/        ← GET obtener, PUT actualizar
│   ├── (auth)/            ← login y register (usan Supabase Auth)
│   ├── dashboard/         ← datos reales desde /api/activos
│   └── profile/           ← datos reales desde /api/perfil
├── lib/
│   ├── supabase/
│   │   ├── client.ts      ← cliente para el browser
│   │   └── server.ts      ← cliente para API Routes
│   ├── context/
│   │   └── AuthContext.tsx ← sesión con Supabase Auth
│   └── types/
│       └── index.ts       ← tipos TypeScript (Activo, Perfil, Divisa)
├── middleware.ts           ← protege /dashboard y /profile
├── Documentacion/         ← documentación del proyecto
└── Modelo/                ← esquema SQL y scripts de migración
```

**Supabase actúa como:** base de datos PostgreSQL + sistema de autenticación + seguridad por filas (RLS).

---

## Equivalencias Java → TypeScript

### Controladores

| Java (`Controlador/`) | TypeScript (`app/api/`) |
|---|---|
| `ActivoControlador.java` → `GET /api/activos/usuario/{id}` | `activos/route.ts` → `GET /api/activos` |
| `ActivoControlador.java` → `POST /api/activos/add` | `activos/route.ts` → `POST /api/activos` |
| `ActivoControlador.java` → `DELETE /api/activos/delete/{id}` | `activos/[id]/route.ts` → `DELETE /api/activos/{id}` |
| `PortofolioControlador.java` → `GET /api/activos/patrimonio/{id}` | `portfolio/route.ts` → `GET /api/portfolio` |
| `UsuarioControlador.java` → `POST /api/usuarios/login` | **Eliminado** — `supabase.auth.signInWithPassword()` |
| `UsuarioControlador.java` → `POST /api/usuarios/registro` | **Eliminado** — `supabase.auth.signUp()` |
| `UsuarioControlador.java` → `GET /api/usuarios/{id}` | `perfil/route.ts` → `GET /api/perfil` |
| `UsuarioControlador.java` → `PUT /api/usuarios/actualizar` | `perfil/route.ts` → `PUT /api/perfil` |

> El login y registro no necesitan API Route porque el cliente de Supabase los llama directamente desde el browser de forma segura.

### Modelos / Clases

| Java | TypeScript |
|---|---|
| `modelo/Usuario.java` | `lib/types/index.ts` → interfaz `Perfil` |
| `modelo/Activo.java` | `lib/types/index.ts` → interfaz `Activo` |
| `modelo/BD/clases/tabla/Divisas.java` | `lib/types/index.ts` → interfaz `Divisa` |
| `repositorio/UsuarioRepository.java` | Reemplazado por consultas directas `supabase.from('perfiles')` |
| `repositorio/ActivoRepository.java` | Reemplazado por consultas directas `supabase.from('activos')` |
| `servicio/UsuarioServicio.java` | Reemplazado por `supabase.auth.*` |
| `modelo/BD/apoyo/ConexionSupaBase.java` | Reemplazado por `lib/supabase/client.ts` y `server.ts` |

---

## El modelo de base de datos

### Situación actual

`DataBase.sql` y `ValoresPrueba.sql` **ya están importados en Supabase** (tablas y datos de prueba presentes).
Los scripts en `Modelo/supabase/` son scripts de **migración incremental** que extienden ese modelo:

| Archivo | Qué hace | Cuándo ejecutar |
|---|---|---|
| `Modelo/DataBase.sql` | Esquema completo original del equipo | Ya importado ✅ |
| `Modelo/ValoresPrueba.sql` | Datos de prueba del modelo original | Ya importado ✅ |
| `Modelo/supabase/00_tablas.sql` | ALTER TABLE + CREATE TABLE `perfiles` | Ejecutar una vez |
| `Modelo/supabase/01_rls_y_trigger.sql` | RLS + trigger `handle_new_user` | Ejecutar una vez |
| `Modelo/supabase/02_datos_iniciales.sql` | Colores de activos, tipos de cuenta exchange | Ejecutar una vez |

### Cambios sobre el modelo original

| Tabla / columna | Cambio |
|---|---|
| `usuarios` | Se conserva intacta (datos legacy). Los nuevos usuarios usan `auth.users` (Supabase Auth) |
| Nueva tabla `perfiles` | Almacena los datos de perfil vinculados a `auth.users.id` (UUID) |
| `activos.color` | Nueva columna `VARCHAR(7)` para el color del activo en la UI |
| `activosposeidos.usuario_id` | Nueva columna `UUID → auth.users.id` (los nuevos registros usan esto) |
| `activosposeidos.precio_compra` | Nueva columna `NUMERIC` con el precio de adquisición |
| `cuentas.usuario_id` | Nueva columna `UUID → auth.users.id` |
| `cuentas.apikey_cifrada` | Nueva columna `TEXT` para API keys de exchanges |
| Nuevas filas en `tiposcuentas` | `BINANCE`, `COINBASE`, `IBKR` (para cuentas vinculadas) |

> **Importante:** Las filas antiguas de `activosposeidos` y `cuentas` (vinculadas por `emailusuario`) tienen `usuario_id = NULL`. Las políticas RLS filtran automáticamente esas filas — ningún usuario nuevo las verá. Son datos legacy que pueden eliminarse cuando dejen de ser necesarios.

---

## Cómo hacer una consulta en TypeScript (equivalente a Java)

### Antes — Java con JDBC
```java
Connection con = ConexionSupaBase.obtieneConexion();
Statement stmt = con.createStatement();
ResultSet rs = stmt.executeQuery("SELECT * FROM activos WHERE usuario_id = ?");
```

### Ahora — TypeScript con Supabase

**En una API Route (servidor):**
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('activos')
  .select('*')
  .eq('usuario_id', user.id)
```

**En un componente React (browser):**
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('activos')
  .select('*')
```

### Operaciones CRUD

```typescript
// INSERT
const { data } = await supabase.from('activos').insert({ nombre: 'Bitcoin', ... }).select().single()

// UPDATE
const { data } = await supabase.from('activos').update({ precio_actual: 65000 }).eq('id', id)

// DELETE
await supabase.from('activos').delete().eq('id', id)
```

---

## Seguridad: qué reemplaza qué

El código Java no tenía seguridad real. El nuevo sistema tiene dos capas:

**1. Middleware (`middleware.ts`):** intercepta cada request. Si el usuario no está autenticado e intenta acceder a `/dashboard` o `/profile`, lo redirige a `/login` automáticamente.

**2. Row Level Security (RLS) en Supabase:** a nivel de base de datos, cada usuario solo puede leer y modificar sus propios datos. Aunque alguien manipule una API Route, Supabase rechaza cualquier consulta que intente acceder a datos de otro usuario.

---

## Cómo arrancar el proyecto

```bash
# 1. Instalar dependencias
cd Vista
npm install

# 2. Crear las credenciales (Jose te las comparte)
cp .env.local.example .env.local
# Editar .env.local con la URL y anon key de Supabase

# 3. Ejecutar en local
npm run dev
```

Antes de arrancar, Jose (Lead) debe haber ejecutado los SQLs en Supabase. Ver checklist en `Modelo/supabase/CHECKLIST.md`.

---

## Qué queda por hacer (pendiente de implementar)

El modelo de datos está completo. Las siguientes funcionalidades tienen la tabla en Supabase pero aún no tienen la API Route en Next.js:

| Funcionalidad | Tabla Supabase | Cómo implementarla |
|---|---|---|
| **Precios en tiempo real** | `valorhistoricoactivo` | API Route `app/api/precios/route.ts` que llama a Binance/Alpha Vantage y hace INSERT en `valorhistoricoactivo`. API Keys en `.env.local` sin `NEXT_PUBLIC_`. |
| **Conversión de divisas** | `cambios` | API Route que consulta `cambios` con la divisa base del usuario y convierte los valores del portfolio. |
| **Vinculación de exchanges** | `cuentas` + `tiposcuentas` | API Route que gestiona las API Keys cifradas (`apikey_cifrada`) por usuario. |
| **Perfil completo** (idioma, teléfono) | `perfiles`, `idiomas` | Extender el formulario de edición de perfil con los campos `telefono`, `idiomacodigo`, `formatofecha`. |

Cada uno es un endpoint nuevo en `app/api/` siguiendo el mismo patrón de los existentes.

---

## Carpeta Controlador

La carpeta `Controlador/` con el proyecto Java ya no es necesaria. Se puede eliminar del repositorio una vez confirmado que todo funciona. El commit de eliminación debería ser:

```
chore: remove java backend, migrated to typescript + supabase client
```
