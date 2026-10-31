---
inclusion: always
---

# Roadmap y trabajo pendiente

Lista viva de features acordadas pero no implementadas aún. Mantener actualizada:
cuando algo se empiece, moverlo a un spec; cuando se termine, quitarlo de acá.

## Pendiente

### Sistema de referidos (pospuesto)
Acordado sacarlo del spec `cuponet-admin-v2` por ser una feature grande en sí misma.
Cuando se retome, tendrá su propio spec. Alcance esperado:
- Código de referido por usuario.
- Tracking de quién refirió a quién.
- Ganancias/comisiones generadas por referidos.
- En la gestión de usuarios (admin) ya se dejó espacio para mostrar "cantidad de
  referidos" y "ganancias por referidos" — esas columnas quedan pendientes de datos
  reales hasta que exista este sistema.

## Convenciones de negocio importantes

- **"Puntos" vs "créditos"**: de cara al usuario SIEMPRE se dice **"puntos"** (por
  requisito legal). Internamente (base de datos, RPCs, tipos, código) se mantiene el
  nombre `creditos`. No renombrar la columna ni el código; solo la UI usa "puntos".
- **Ingresos**: el pago del cliente al admin es externo al sistema (efectivo/
  transferencia). El sistema NO registra montos en dinero. Las métricas hablan de
  "puntos cargados", no de "$".
