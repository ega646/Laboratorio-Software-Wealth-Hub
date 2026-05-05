# Checklist de verificación — casos de uso implementados

## UC01 — Añadir activo
Botón "Añadir Inversión" en el dashboard → modal con buscador de activos, cantidad, precio y fecha.

## UC02 — Catálogo y detalle
Ir a `/dashboard/catalogo` → buscar activo, filtrar por tipo.
Hacer click en "Ver posición" de un activo en cartera → gráfico histórico real, ganancia/pérdida, botón eliminar.

## UC03 — Perfil de usuario
Ir a `/profile/edit` → editar nombre, divisa base, perfil de riesgo, contraseña.

## UC04 — Dashboard
Ir a `/dashboard` → ver Net Worth, gráfico histórico real, gráfico de distribución por tipo, mejor activo.
Cambiar divisa con el selector (EUR/USD/GBP) → los valores se recalculan.

## UC05 — Actualización de precios
Botón "Actualizar cartera" en el dashboard → llama a CoinGecko/Alpha Vantage y actualiza `valorhistoricoactivo`.
(Requiere que los activos tengan `simbolo` asignado en la BD.)

## UC07 — Conversión de divisas
Selector de divisa en el dashboard → cambia todos los valores mostrados.

## UC08 — Eliminar activo
Ir al detalle de cualquier activo en cartera → botón "Eliminar de mi cartera" con modal de confirmación.

## UC09 — Sesión
Ir a `/register` → crear cuenta.
Ir a `/login` → entrar.
Intentar acceder a `/dashboard` sin sesión → redirige a `/login`.
