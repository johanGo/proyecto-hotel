SELECT id, numero_habitacion, tipo, precio_noche, capacidad 
FROM ProyectoChatBot.habitacion 
WHERE capacidad >= 2 -- Filtra por los huéspedes que pide el usuario
  AND id NOT IN (
    -- Este subquery busca qué habitaciones ya están ocupadas en ese rango de fechas
    SELECT habitacion_id 
    FROM ProyectoChatBot.reserva
    WHERE estado = 'confirmada'
      AND NOT (fecha_salida <= '2026-06-13' OR fecha_entrada >= '2026-06-16')
);