
create database ProyectoChatBot;
-- 1. TABLA DE HABITACION 
-- Guarda la información de las habitaciones
CREATE TABLE ProyectoChatBot.habitacion (
    id INT AUTO_INCREMENT,
    numero_habitacion VARCHAR(10) NOT NULL,
    tipo VARCHAR(50),
    disponible BOOLEAN DEFAULT TRUE,
    precio_noche DECIMAL(10,2),
    capacidad TINYINT UNSIGNED NOT NULL DEFAULT 2,
    PRIMARY KEY (id)
)ENGINE=InnoDB;

-- 2. TABLA DE CLIENTES (Huéspedes)
-- Guarda la información de las personas que interactúan con el bot o la plataforma.
CREATE TABLE ProyectoChatBot.cliente (
    id INT AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    documento_identidad VARCHAR(20) NOT NULL UNIQUE, -- Cédula, Pasaporte, etc.
    email VARCHAR(150) UNIQUE,
    rol ENUM('cliente', 'admin') NOT NULL,
    contraseña VARCHAR(20) NOT NULL, -- Para autenticación (si se implementa)
    telefono VARCHAR(20),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;


-- 3. TABLA DE RESERVAS
-- Es la tabla intermedia clave. Enlaza un cliente con una habitación y bloquea las fechas.
CREATE TABLE ProyectoChatBot.reserva (
        id INT AUTO_INCREMENT,
        cliente_id INT NOT NULL,
    habitacion_id INT NOT NULL,
    fecha_entrada DATE NOT NULL,
    fecha_salida DATE NOT NULL,
    -- 'pendiente' (creada por el bot), 'confirmada' (pagada), 'cancelada', 'check_in', 'check_out'
    estado VARCHAR(20) DEFAULT 'pendiente', 
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    -- Relaciones (Llaves Foráneas)
    FOREIGN KEY (cliente_id) REFERENCES ProyectoChatBot.cliente(id) ON DELETE RESTRICT,
    -- Si se borra una habitación, se borran sus reservas para evitar datos huérfanos
    FOREIGN KEY (habitacion_id) REFERENCES ProyectoChatBot.habitacion(id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 4. TABLA DE PAGOS (Altamente recomendada)
-- Crucial si el ChatBot va a validar si el usuario ya transfirió o pagó para confirmar el cupo.
CREATE TABLE ProyectoChatBot.pago (
    id INT AUTO_INCREMENT,
    reserva_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(30), -- 'Transferencia', 'Tarjeta', 'Efectivo', etc.
    estado_pago VARCHAR(20) DEFAULT 'completado', -- 'completado', 'reembolsado', 'fallido'
    PRIMARY KEY (id),
    FOREIGN KEY (reserva_id) REFERENCES ProyectoChatBot.reserva(id) ON DELETE CASCADE
) ENGINE=InnoDB;


