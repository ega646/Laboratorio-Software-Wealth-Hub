#  Wealth Hub

Wealth Hub es una aplicación avanzada de gestión de patrimonio personal diseñada para consolidar activos de diversas clases (Cripto, Acciones, ETFs, Efectivo) en una única interfaz inteligente. La plataforma permite el seguimiento en tiempo real, análisis de rentabilidad y gestión multi-divisa.

---

##  Requisitos previos

* **Node.js 20** o superior — https://nodejs.org
* **Acceso al proyecto de Supabase** (credenciales proporcionadas por Jose)

---

##  Puesta en marcha

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/ega646/Laboratorio-Software-Wealth-Hub
cd Laboratorio-Software-Wealth-Hub
npm install
```

### 2. Configurar credenciales

```bash
cp .env.local.example .env.local
```

Abrir `.env.local` y rellenar con los valores:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fosephxtagbzyvbluhbv.supabase.co/
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvc2VwaHh0YWdienl2Ymx1aGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NzEwMDMsImV4cCI6MjA5MTQ0NzAwM30.dsSCFpLEMvEwUomfQTmKMt_r8IBf4OyZcuuWNy_Y3js
```

### 3. Arrancar en local

```bash
npm run dev
```

Abre http://localhost:3000 en tu navegador.

---

##  Usuario de prueba

Para explorar las funcionalidades rápidamente sin registrarte, puedes usar:

* **Email:** [prueba@gmail.com](mailto:prueba@gmail.com)
* **Contraseña:** asdasd

---

##  Arquitectura de la API (`/app/api`)

El backend está estructurado de forma modular mediante Route Handlers:

| Ruta                 | Descripción                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| `api/activos`        | Gestión de activos poseídos (Lectura/Escritura)                         |
| `api/activos/[id]`   | Operaciones específicas: detalle y eliminación segura                   |
| `api/cambios`        | Motor de tipos de cambio entre divisas                                  |
| `api/catalogo`       | Listado de activos disponibles en el mercado                            |
| `api/historicalData` | Agregación de datos históricos para gráficas                            |
| `api/perfil`         | Gestión de preferencias y datos del usuario                             |
| `api/portfolio`      | Cálculo de totales, net worth y métricas de cartera                     |
| `api/precios`        | Integración con CoinGecko y Alpha Vantage para actualización de valores |

---

##  Stack Tecnológico

* **Framework:** Next.js 15 (App Router) + TypeScript
* **Backend/Auth:** Supabase (PostgreSQL + Auth + RLS)
* **Estilos:** Tailwind CSS + shadcn/ui
* **Gráficos:** Recharts
* **Iconos:** Lucide React

---

Desarrollado con un enfoque en escalabilidad financiera y experiencia de usuario.

---

##  Sprint Actual — Funcionalidades Implementadas

Durante este sprint se han completado las siguientes funcionalidades clave del sistema:

###  Gestión de Inversiones (UC01, UC02, UC08)

* Añadir inversión desde el dashboard mediante formulario (cantidad, precio y fecha).
* Integración con `POST /api/activos` para persistencia de datos.
* Consulta del catálogo completo de activos (`GET /api/catalogo`) con búsqueda y filtros.
* Validaciones de integridad (cantidad > 0, activos no duplicados).
* Eliminación de inversiones con confirmación mediante modal.
* Actualización dinámica del dashboard tras eliminar activos (sin recarga).
* Página de detalle de inversión con opción de eliminación.

###  Visualización y Análisis (UC02, UC04)

* Componente reutilizable `PriceChart` para gráficos.
* Visualización de precios: compra vs actual con cálculo de rentabilidad (€ y %).
* Gráficos históricos con datos reales (últimos 7 días).
* Gráfico de distribución de activos (pie/donut).
* Selector de rango temporal en gráficas (1W, 1M, 3M, 1Y).
* Visualización del portfolio en divisa base del usuario.

###  Perfil y Configuración (UC03)

* Edición de nombre completo.
* Cambio de contraseña.
* Configuración de divisa base.
* Ajuste del perfil de riesgo del usuario.

###  Multi-divisa y Conversión (UC07)

* Implementación de API de tipos de cambio (`/api/cambios`).
* Función utilitaria de conversión de divisas.
* Conversión automática en el cálculo del portfolio.
* Selector de divisa en dashboard y gráficas.
* Visualización correcta de símbolos (€,$,£).

###  Actualización de Precios (UC05)

* Integración con APIs externas:

  * CoinGecko (criptomonedas)
  * Alpha Vantage (acciones/ETFs)
* Endpoint `/api/precios` para actualización de valores.
* Almacenamiento de precios históricos en base de datos.
* Botón manual de actualización de precios.
* Sistema de actualización automática periódica.
* Gestión segura de API Keys en `.env.local`.

###  Backend y Arquitectura

* Diseño modular de endpoints API bajo `/app/api`.
* Normalización de datos provenientes de APIs externas.
* Uso de Supabase para persistencia y autenticación.

###  Autenticación y Seguridad (UC09)

* Registro de nuevos usuarios.
* Login con email y contraseña.
* Logout.
* Protección de rutas privadas (`/dashboard`, `/profile`) mediante middleware.

---

##  Contribuidores

| Contribuidor | Rol |
| ------------ | --- |
| Equipo Wealth Hub | Desarrollo del proyecto |
| [Claude](https://claude.ai) (Anthropic) | Asistente de IA — apoyo en el aprendizaje y comprensión de TypeScript, un lenguaje nuevo para el equipo durante el desarrollo del proyecto |
