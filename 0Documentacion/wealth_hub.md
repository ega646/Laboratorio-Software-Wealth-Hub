# Wealth Hub — Documentación del Proyecto

---

## 1. Problema a Resolver y Stakeholders

### 1.1. ¿Qué es?

**Wealth Hub** es una plataforma web de inteligencia financiera y consolidación de patrimonio de tipo *read-only*. Su objetivo principal es unificar la dispersión de activos de un inversor moderno (Criptomonedas, Acciones, ETFs y Efectivo) en una sola interfaz inteligente.

La plataforma se diferencia de un simple rastreador de carteras al integrar tres capas de valor de ingeniería:

- **Capa de Agregación Automática:** Conexión mediante APIs de solo lectura con exchanges (ej. Binance) y proveedores de datos de mercado en tiempo real para mantener el saldo y la valoración de la cartera siempre actualizados sin intervención manual.
- **Capa de Simulación y Proyección (Backtesting):** Un motor que permite al usuario simular escenarios hipotéticos (*"¿Qué habría pasado si hubiera invertido en X hace un año?"*) o proyectar el crecimiento de su cartera actual frente a la inflación y diferentes tipos de interés compuesto.
- **Capa de Optimización Basada en Datos:** Implementación de algoritmos de análisis de riesgo que evalúan la diversificación de la cartera y sugieren ajustes para optimizar la frontera de eficiencia (maximizar retorno para un nivel de riesgo dado).

### 1.2. ¿Qué problema resuelve?

Invertir en el mundo moderno es muy complicado y hace falta demasiada información que los usuarios de pie no pueden reunir fácilmente:

- **Fragmentación:** El capital está disperso en demasiadas plataformas, perdiendo la visión del "Net Worth" total.
- **Barrera de Información:** El análisis de riesgo y el backtesting requiere conocimientos técnicos que el usuario promedio no tiene.
- **Complejidad Operativa:** El seguimiento manual en hojas de cálculo es lento, propenso a errores y nunca está actualizado al minuto.

### 1.3. ¿Quién financia la aplicación? (Stakeholders)

- **Socios Fundadores (Nosotros):** Aportamos el capital intelectual, el desarrollo del stack tecnológico (Next.js/Supabase) y la gestión operativa.
- **Inversores (Business Angels / Venture Capital):** Buscamos perfiles interesados en FinTech que aporten capital semilla para escalar la infraestructura y cubrir costes de APIs premium.
- **Usuarios Finales (Stakeholders Indirectos):** Inversores minoristas y entusiastas de las finanzas que validan el producto (Product-Market Fit).

### 1.4. ¿Beneficios del proyecto?

- **Mejores Resultados:** Gracias a los modelos de "Frontera Eficiente", el usuario reduce su exposición al riesgo y optimiza sus retornos a largo plazo.
- **Escalabilidad:** Un modelo SaaS bajo arquitectura Serverless que permite crecer a bajo coste.
- **Eficiencia Temporal:** Automatización total. El usuario ahorra horas de gestión manual cada semana.
- **Seguridad y Confianza:** Al ser una plataforma de solo lectura, el riesgo de pérdida de fondos es cero. Privacidad total mediante cifrado AES-256.

---

## 2. Alcance del Proyecto

El alcance de Wealth Hub comprende el desarrollo de una solución integral para la agregación, monitorización y optimización de activos financieros dispersos, bajo una arquitectura serverless de alta eficiencia.

### 2.1. Hitos del Proyecto

Se definen cinco fases críticas de control, cada una vinculada a un entregable técnico verificable:

| Hito | Descripción | Semana |
|------|-------------|--------|
| **M1** | Definición de Arquitectura y Diseño de interfaz | Semana 3 |
| **M2** | Integración de Datos y Conectividad | Semana 6 |
| **M3** | Despliegue del Motor Analítico y de Simulación | Semana 9 |
| **M4** | Pruebas de Calidad y Optimización | Semana 13 |
| **M5** | Despliegue final de producto | Semana 14 |

**M1 — Definición de Arquitectura y Diseño de interfaz (Semana 3):**
- Finalización del diagrama de entidad-relación (ERD) y esquema de base de datos.
- Diseño de la experiencia de usuario (UI/UX) y flujos de usuario.
- Definición del protocolo de cifrado para la protección de claves API.

**M2 — Integración de Datos y Conectividad (Semana 6):**
- Desarrollo de conectores API para la ingesta de datos en tiempo real (Cripto/Stocks).
- Implementación de servicios de normalización de datos multiactivo.
- Habilitación del sistema de autenticación y perfiles de usuario.

**M3 — Despliegue del Motor Analítico y de Simulación (Semana 9):**
- Integración de módulos de cálculo de rentabilidad neta y proyecciones de interés compuesto.
- Despliegue del simulador de escenarios (Backtesting y Forward-looking).
- Generación de plantillas de inversión (perfiles de riesgo: Conservador, Moderado, Agresivo).
- Implementación del algoritmo de reequilibrio de activos basado en perfiles de riesgo.

**M4 — Pruebas de Calidad y Optimización (Semana 13):**
- Pruebas de carga y optimización de latencia.
- Ejecución de auditorías de seguridad sobre el manejo de API Keys.

**M5 — Despliegue final de producto (Semana 14):**
- Despliegue final en producción (Vercel/Cloud).

### 2.2. Funcionalidades Principales (Use Cases)

| ID | Caso de Uso | Descripción Técnica |
|----|-------------|---------------------|
| **CU-01** | Agregación Automática | El sistema deberá agregar y normalizar saldos de múltiples fuentes (APIs externas y carga manual) en una única divisa base mediante servicios de conversión en tiempo real. |
| **CU-02** | Visualización de Dashboard | Visualización del Net Worth total, distribución porcentual por clase de activo, gráfico de fluctuación histórica del patrimonio y rendimiento histórico (Time-Weighted Return). |
| **CU-03** | Análisis de Perfil de Riesgo | Comparativa interactiva entre la cartera real del usuario y modelos ideales (Conservador, Moderado, Agresivo) recomendados por expertos. |
| **CU-04** | Simulación Proyectiva (Forward-looking) | Cálculo de crecimiento patrimonial basado en aportaciones periódicas y tasas de retorno estimadas (interés compuesto). |
| **CU-05** | Simulación Histórica (Backtesting) | Análisis del comportamiento de la cartera actual frente a eventos de mercado pasados (ej. crisis financieras previas). |
| **CU-06** | Optimización de Cartera | Sugerencias automáticas para mejorar la diversificación y reducir la exposición a activos de alta volatilidad. |
| **CU-07** | Gestión Segura de Credenciales | Interfaz para la vinculación/desvinculación de API Keys con almacenamiento cifrado at-rest y permisos exclusivos de lectura. |

### 2.3. Exclusiones y Límites (Out of Scope)

Para mitigar riesgos operativos y legales, el proyecto excluye explícitamente:

- **Transaccionalidad Financiera:** El sistema no tiene capacidad de escritura en exchanges o bancos; no se permite la ejecución de órdenes de compra/venta.
- **Custodia de Claves Privadas:** No se almacenarán seeds o claves privadas de wallets de criptomonedas, únicamente claves API de lectura.
- **Soporte Multidispositivo Nativo:** El alcance se limita a una aplicación web responsive. No se contempla el desarrollo ni publicación de binarios para iOS o Android.
- **Asesoría Financiera Automatizada:** El sistema provee cálculos matemáticos y estadísticos, pero no constituye un servicio de asesoramiento financiero regulado bajo normativa MiFID II o similar.

### 2.4. Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | Next.js, Tailwind CSS, Shadcn/ui, Recharts |
| **Backend & DB** | Supabase (PostgreSQL), autenticación, almacenamiento cifrado |
| **Lógica de Procesamiento** | Edge Functions (TypeScript) |
| **Integración de Datos** | APIs REST/Websockets de Binance, Alpha Vantage o Yahoo Finance |
| **Seguridad** | AES-256, TLS 1.3, Row Level Security (RLS) |
| **Infraestructura** | Vercel (despliegue automatizado) |

---

## 2. Revisión del Alcance

### 2.1. Análisis del Estado del Arte y Competencia

| Competidor | Fortalezas | Carencias / Debilidades | Diferencial Wealth Hub |
|------------|------------|-------------------------|------------------------|
| **Exchanges (Binance/Coinbase)** | Alta liquidez y datos en tiempo real. | Visión sesgada (solo cripto). No integran activos bancarios o bolsa tradicional. | **Visión Holística:** Unificamos cripto, acciones y efectivo en una sola métrica de Net Worth. |
| **Delta / Blockfolio** | Excelente seguimiento de precios y alertas. | Se limita a ser un "espejo" del saldo. Carece de herramientas de proyección y comparativas de riesgo. | **Simulación Dinámica:** Permitimos testear cambios en la cartera (Backtesting) antes de ejecutarlos en el mercado real. |
| **Excel / Hojas de Cálculo** | Personalización total y coste cero. | Entrada de datos manual, errores de fórmula y desactualización de precios. | **Automatización Real-Time:** Eliminamos el error humano mediante sincronización vía API. |

### 2.2. Resumen del Alcance

El alcance de Wealth Hub se ha delimitado para resolver el problema de la fragmentación patrimonial. Para garantizar la entrega en la Semana 14, el alcance se cierra en los siguientes bloques funcionales:

- **Agregación Multifuente (CU-01/CU-07):** Sincronización automatizada con Binance y APIs de mercados financieros. Gestión de credenciales bajo cifrado AES-256.
- **Dashboard de Inteligencia (CU-02):** Monitorización de fluctuación de Net Worth y rendimiento histórico. Visualización de unidades, valoración actual y distribución por clase de activo.
- **Módulo de Simulación Avanzada (CU-04/CU-05):** Capacidad de realizar proyecciones a futuro y pruebas históricas.
- **Optimizador de Cartera (CU-03/CU-06):** Comparativa contra perfiles de riesgo estandarizados y sugerencias de rebalanceo.

### 2.3. Justificación de Exclusiones

Se mantiene la exclusión de la transaccionalidad y la custodia de fondos por las siguientes razones estratégicas:

- Permite centrar el esfuerzo de desarrollo en el motor de análisis y la experiencia de usuario (el valor diferencial).
- Elimina la complejidad legal y regulatoria que impediría el despliegue del producto en el plazo de un semestre académico.
- Garantiza la seguridad absoluta del usuario al operar bajo un modelo Read-Only.

### 2.4. Resumen y Conclusión del Flujo

El flujo del programa es el siguiente: se accede al panel introductorio de la página web, el usuario inicia sesión o se registra en el panel del login y es redirigido a su dashboard principal. Desde allí, el usuario puede:

- Observar las características generales de los activos (tanto propios como de otros).
- Entrar al panel de detalle de una inversión específica.
- Entrar al panel de perfil para modificar su información personal o cerrar sesión.

---

## 3. Arquitectura y Tecnologías

### 3.1. Solución Elegida

Para llevar a cabo el proyecto se ha decidido emplear una **arquitectura cliente-servidor desacoplada** compuesta de las siguientes partes principales:

- **Frontend (cliente):** Desarrollado con React, encargado de la interfaz de usuario, presentación de los datos y comunicación con el backend.
- **Backend (servidor):** Desarrollado en Java, responsable de la lógica de negocio, agregación de datos desde APIs externas y acceso a la base de datos.
- **Base de datos:** De tipo relacional, desplegada a través de Supabase (PostgreSQL).

Este enfoque ofrece las siguientes ventajas:

- **Alta modularidad:** Los participantes pueden trabajar independientemente en los distintos componentes.
- **Escalabilidad:** Flujos de comunicaciones claros y separación de tareas facilitan localizar posibles cuellos de botella.
- **Facilidades de mantenimiento:** Diseño con partes bien definidas simplifica localizar puntos de fallo y posibles mejoras.

### 3.2. Patrones de Diseño

#### 3.2.1. Modelo Vista Controlador (MVC)

El patrón principal de la aplicación, que separa el sistema en tres componentes:

- **Modelo:** Representa los datos y la lógica asociada (inversiones, históricos, predicciones).
- **Vista:** Interfaz gráfica que muestra la información al usuario.
- **Controlador:** Gestiona las peticiones del usuario y coordina las acciones entre la vista y el modelo. Incluye también la conexión con APIs externas.

#### 3.2.2. DAO (Data Access Object)

Empleado para abstraer el acceso a la base de datos. Ventajas:

- Desacopla la lógica de negocio del sistema de almacenamiento.
- Permite realizar cambios en la base de datos sin afectar al resto del sistema.
- Facilita la reutilización de código al agregar datos de diferentes fuentes.

#### 3.2.3. Singleton

Empleado para gestionar los recursos compartidos (conexiones a la BD principalmente) y garantizar que de los mismos exista una única instancia, evitando conflictos en la manipulación de datos por múltiples fuentes.

#### 3.2.4. Factory Method

Empleo de una única clase abstracta instanciada según el caso para crear objetos relacionados con diferentes fuentes de datos externas que comparten características mínimas comunes (APIs de criptomonedas, bolsas, ETFs).

### 3.3. Tecnologías a Utilizar

#### 3.3.1. Frontend
- **React** — Librería para construir interfaces de usuario dinámicas y basadas en componentes.
- **HTML5** — Estructura de las páginas web.
- **Tailwind CSS** — Estilización y diseño visual.
- Librerías de visualización de datos (Recharts).

#### 3.3.2. Backend
- **Java** — Lenguaje principal del servidor.
- **Spring Boot** — Framework para el desarrollo de APIs REST y gestión de dependencias.
- **APIs externas de datos financieros** — Precios de activos, históricos e indicadores financieros.

#### 3.3.3. Base de Datos
- **PostgreSQL** — Base de datos relacional para almacenar datos de simulaciones e históricos.
- **Despliegue mediante Supabase.**

#### 3.3.4. Comunicación
- **API REST con formato JSON** para las comunicaciones entre frontend y backend.

### 3.4. División en Componentes

| Componente | Función | Responsable |
|------------|---------|-------------|
| **Adquisición de datos** | Conectarse a APIs externas, descargar datos financieros, normalizar la información y enviarla al sistema de almacenamiento. | Marc Sastre (Especialista Backend) |
| **Gestión de datos** | Almacenar los datos en la base de datos, gestionar consultas y actualizar históricos de precios. | Jose Diaz (Full-Stack Lead) |
| **Análisis y predicción** | Procesar datos históricos, aplicar algoritmos de predicción y generar estimaciones de evolución de activos. | Jose Diaz / Marc Sastre |
| **Visualización** | Mostrar gráficos de evolución de inversiones, visualizar carteras y mostrar predicciones futuras. | Joaquin Esperon (Especialista Frontend) |
| **Gestión de conexiones / Usuarios** | Autenticación de conexiones, perfiles de usuario y carteras personalizadas. | Enrique Grau (Especialista Pruebas y Seguridad) |

### 3.5. Modelo C4

Para definir y visualizar correctamente la arquitectura de la aplicación se ha realizado un modelo C4. No se ha incluido el nivel 4 en este punto al suponer un nivel de detalle demasiado específico que no aporta valor en esta etapa del proyecto.

> El resultado del modelo C4 se ha añadido como anexo al documento original.

---

## 4. Way of Working (WoW)

El *Way of Working* de Wealth Hub define cómo el equipo interactúa con el código y entre sí para garantizar un producto financiero fiable, seguro y escalable.

### 4.1. Responsabilidades en el Flujo de Trabajo

Cada miembro tiene un área de propiedad clara, lo que permite trabajar en paralelo sin solapamientos:

- **Jose** *(Project Manager & Lead):* Responsable de la arquitectura y la integración final. Supervisa que el código en `develop` y `master` sea coherente.
- **Joaquin** *(Especialista Frontend):* Responsable de la UI/UX en React.
- **Marc** *(Especialista Backend):* Responsable de la lógica en Java y conectores APIs. Garantiza la integridad de los datos financieros.
- **Enrique** *(Especialista Pruebas y Seguridad):* Define los tests, audita la seguridad de las API Keys y da el visto bueno final a los Pull Requests.

### 4.2. Estrategia de Control de Versiones

Estructura de **6 ramas** para aislar el desarrollo y proteger la estabilidad de la aplicación:

- `master` *(Producción):* Contiene exclusivamente el código estable que ha pasado por todos los hitos. Solo el Lead tiene permisos de escritura.
- `develop` *(Integración):* Rama central de trabajo en equipo. Aquí se fusionan las funcionalidades validadas de cada miembro.
- **Ramas Personales:** Cada desarrollador trabaja en su propia rama, permitiendo commits constantes sin afectar al resto del equipo.

#### 4.2.1. Protocolo de Gestión de Conflictos

- **Sincronización:** Es obligatorio realizar `git pull origin develop` hacia la rama personal al inicio de cada jornada.
- **Pull Requests:** Para pasar código de una rama personal a `develop`, es indispensable abrir un PR que debe ser aprobado en revisión de calidad o arquitectura.
- **Resolución de conflictos:** Si dos ramas modifican el mismo archivo, el último en intentar el merge es responsable de resolver el conflicto manualmente en su entorno local antes de reintentar la subida.

### 4.3. Normas de Calidad y Umbrales de Aceptación

| Métrica | Umbral |
|---------|--------|
| Cobertura general (Code Coverage) | Mínimo **75%** |
| Lógica crítica del Backend | Mínimo **90%** |
| Tests unitarios e integración en `develop` | **100%** de éxito |
| Validación de cálculos de rentabilidad | **0%** de margen de error |
| Seguridad (escaneo de secretos GitHub) | Sin API Keys expuestas |

### 4.4. Workflow del Ciclo de Vida del Desarrollo

1. **Definición y Asignación:** Jose (PM) desglosa los requisitos en tarjetas de Trello, definiendo endpoints y lógica de componentes. Se establece el *Definition of Done* (DoD).
2. **Desarrollo en Aislamiento:** El especialista trabaja en su rama personal de GitHub.
3. **Sincronización y Testing Local:** Cada desarrollador ejecuta pruebas en su entorno local (JUnit para Java, Jest para React).
4. **PR & Code Review:** Se solicita un Pull Request hacia `develop`. Enrique realiza una revisión de código.
5. **Integración en Staging:** Se despliega el frontend compilado y el backend de Java en un entorno compartido para validar la comunicación API REST real con Supabase.
6. **Merge y Cierre de Hito:** Una vez validada la funcionalidad, se realiza el merge a `develop`. Al finalizar cada hito, se promociona el código a `master`.

### 4.5. Política de Despliegue (CI/CD)

- **Entorno de Datos:** Uso de Supabase como base de datos centralizada en la nube, compartida por todos los entornos.
- **Despliegue del Frontend:** Automatizado en Vercel. Cada merge en `master` dispara una build de producción (`npm run build`).
- **Despliegue del Backend:** El servicio Java se empaqueta en un `.jar` y se despliega en un servidor de aplicaciones con conexión segura a Supabase mediante variables de entorno cifradas.
- **Rollback:**
  - *Frontend:* Vercel mantiene un historial de despliegues para revertir de forma instantánea.
  - *Backend:* Se mantiene un backup del último `.jar` estable. RTO estimado de menos de 5 minutos.
