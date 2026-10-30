-- =============================================================
-- Cuponet · Seed de datos de catálogo
-- Planes, comercios, cupones y sorteos de ejemplo.
-- No incluye usuarios: los crea Supabase Auth al registrarse.
-- Idempotente: se puede re-ejecutar sin duplicar.
-- =============================================================

-- ---------- Planes ----------
insert into public.planes (id, nombre, meses, costo_creditos) values
  ('plan1', 'Plan 1',     1,  100),
  ('plan3', 'Plan 3',     3,  250),
  ('black', 'Plan Black', 12, 800)
on conflict (id) do update
  set nombre = excluded.nombre,
      meses = excluded.meses,
      costo_creditos = excluded.costo_creditos;

-- ---------- Comercios ----------
insert into public.comercios (id, nombre, instagram_url) values
  ('11111111-1111-1111-1111-111111111111', 'Sabores del Centro', 'https://instagram.com/saboresdelcentro'),
  ('22222222-2222-2222-2222-222222222222', 'Café Aroma',         'https://instagram.com/cafearoma'),
  ('33333333-3333-3333-3333-333333333333', 'Gimnasio FitLife',   'https://instagram.com/fitlife'),
  ('44444444-4444-4444-4444-444444444444', 'Moda Urbana',        'https://instagram.com/modaurbana')
on conflict (id) do nothing;

-- ---------- Cupones ----------
insert into public.cupones (id, comercio_id, titulo, descripcion, descuento, vencimiento) values
  ('aaaaaaa1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '30% en comida', '30% de descuento en todo el menú de almuerzo.', '30%', now() + interval '15 days'),
  ('aaaaaaa1-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222',
   '2x1 en cafés', 'Llevá dos cafés pagando uno, de lunes a viernes.', '2x1', now() + interval '7 days'),
  ('aaaaaaa1-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   '50% primera cuota', 'Mitad de precio en tu primer mes de gimnasio.', '50%', now() + interval '30 days'),
  ('aaaaaaa1-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444',
   '25% en indumentaria', '25% off en toda la colección de temporada.', '25%', now() + interval '3 days'),
  -- Cupón vencido para probar el bloqueo de canje
  ('aaaaaaa1-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   '15% en cenas (vencido)', 'Promoción expirada, no debería poder canjearse.', '15%', now() - interval '2 days')
on conflict (id) do nothing;

-- ---------- Sorteos ----------
insert into public.sorteos
  (id, titulo, producto_principal, productos_secundarios, cierre, numeros_en_juego, costo_creditos, estado) values
  ('bbbbbbb1-0000-0000-0000-000000000001', 'Sorteo del mes', 'Smart TV 50''',
   array['Auriculares inalámbricos', 'Gift card $5.000'], now() + interval '5 days', 100, 50, 'activo'),
  ('bbbbbbb1-0000-0000-0000-000000000002', 'Sorteo gamer', 'Consola de videojuegos',
   array['Joystick extra'], now() + interval '10 days', 200, 80, 'activo'),
  -- Próximo a cerrar para probar el cierre por tiempo
  ('bbbbbbb1-0000-0000-0000-000000000003', 'Sorteo flash', 'Cafetera express',
   array[]::text[], now() + interval '2 hours', 50, 30, 'activo')
on conflict (id) do nothing;
