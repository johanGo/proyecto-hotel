-- 1. INSERTAR DATOS EN HABITACION
-- Creamos 3 tipos de habitaciones con diferentes capacidades y precios.
INSERT INTO ProyectoChatBot.habitacion (numero_habitacion, tipo, disponible, precio_noche, capacidad) VALUES
('101', 'Sencilla', TRUE, 120000.00, 2),
('202', 'Doble', TRUE, 180000.00, 4),
('303', 'Suite', TRUE, 350000.00, 8);


-- 2. INSERTAR DATOS EN CLIENTE
-- Simulamos dos clientes que van a interactuar con la plataforma.
INSERT INTO ProyectoChatBot.cliente (nombre, apellido, documento_identidad, email, telefono, rol, contraseña) VALUES
('Valentina', 'Saenz', '1034779183', 'v@gmail.com', '3116963961', 'cliente', '123'),
('Sebastian', 'Gonzalez', '52345678', 's@gmail.com', '3159876543', 'cliente', '456');


-- 3. INSERTAR DATOS EN RESERVA
-- Caso 1: Valentina reserva la habitación Doble (ID 2) por 3 noches en Junio.
-- Caso 2: Sebastian reserva la Suite (ID 3) por 2 noches en el mismo mes.
INSERT INTO ProyectoChatBot.reserva (cliente_id, habitacion_id, fecha_entrada, fecha_salida, estado) VALUES
(1, 2, '2026-06-12', '2026-06-15', 'confirmada'),
(2, 3, '2026-06-18', '2026-06-20', 'pendiente');


-- 4. INSERTAR DATOS EN PAGO
-- Registramos el pago que confirma la reserva de Valentina.
-- La reserva de Sebastian se queda sin pago aún porque su estado es 'pendiente'.
INSERT INTO ProyectoChatBot.pago (reserva_id, monto, metodo_pago, estado_pago) VALUES
(1, 540000.00, 'Transferencia', 'completado'); -- 3 noches x 180.000 = 540.000