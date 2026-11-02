# Plan de implementación — Responsive

- [x] 1. Contenedor raíz y padding escalado
  - Quitar `max-w-md` global del AppShell; agregar `md:max-w-none`.
  - Escalar padding de página: `p-4 md:p-6 lg:p-8`.
  - _Requisitos: RR1_

- [x] 2. Sidebar del cliente (ClienteSidebar)
  - Crear `ClienteSidebar.tsx`: nav vertical con los 4 ítems del cliente.
  - `w-16 md:w-56`: en md solo íconos, en lg ícono + label.
  - _Requisitos: RR2_

- [x] 3. Sidebar del admin (AdminSidebar)
  - Crear `AdminSidebar.tsx`: nav vertical con grupos Resumen/Gestión/Operación/Métricas.
  - `w-16 md:w-64`: en md solo íconos, en lg ícono + label + nombre de grupo.
  - _Requisitos: RR3_

- [x] 4. AppShell responsive
  - En md+: layout `flex-row` con sidebar lateral + main `flex-1`.
  - Ocultar bottom nav en md+ (`md:hidden`).
  - Mostrar ClienteSidebar o AdminSidebar según rol en md+.
  - Header ocupa ancho completo.
  - _Requisitos: RR1, RR2, RR3_

- [ ] 5. Grids de tarjetas — app cliente
  - Home: accesos en `grid-cols-2 lg:grid-cols-3`.
  - Cupones: listado en `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
  - Sorteos: listado en `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
  - _Requisitos: RR4_

- [ ] 6. Grids de tarjetas — panel admin
  - Dashboard métricas: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
  - Estadísticas métricas: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`.
  - _Requisitos: RR4_

- [ ] 7. Tabla de usuarios en desktop
  - `AdminUsuarios`: tabla HTML en md+, tarjetas apiladas en móvil (condición `hidden md:table`).
  - _Requisitos: RR4_

- [ ] 8. Formularios en 2 columnas (md+)
  - `AdminCupones`, `AdminSorteos`, `AdminComercios`: campos en `grid md:grid-cols-2` en md+.
  - _Requisitos: RR4_

- [ ] 9. Tipografía y espaciado escalados
  - Títulos principales: `text-lg md:text-xl lg:text-2xl`.
  - Gaps de sección: `gap-4 md:gap-6`.
  - _Requisitos: RR5_

- [ ] 10. Verificación y no-regresión
  - Probar 375px, 768px, 1440px en DevTools.
  - `npm run build` sin errores.
  - Confirmar que móvil no cambió.
  - _Requisitos: RR6_
