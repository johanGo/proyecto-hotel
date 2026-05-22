from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from flask import render_template
from pydantic import BaseModel
import mysql.connector
from mysql.connector import Error
from typing import List, Optional
from datetime import date

app = FastAPI(title="API Reservas Hotel - ProyectoChatBot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. Configuración de Base de Datos
# ==========================================
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "root",
    "database": "ProyectoChatBot",
}


def get_db_connection():
    """Dependencia para obtener la conexión a la BD y cerrarla automáticamente"""
    conexion = None
    try:
        conexion = mysql.connector.connect(**DB_CONFIG)
        yield conexion
    except Error as e:
        print(f"Error de base de datos: {e}")
        raise HTTPException(
            status_code=500, detail="Error conectando a la base de datos"
        )
    finally:
        if conexion and conexion.is_connected():
            conexion.close()


# ==========================================
# 2. Esquemas de Datos (Pydantic Models)
# ==========================================
class UsuarioBase(BaseModel):
    nombre: str
    apellido: str
    documento_identidad: str
    email: str
    telefono: str


class HabitacionBase(BaseModel):
    numero_habitacion: int
    tipo: str
    precio_noche: float
    disponible: bool = True


class ReservaBase(BaseModel):
    cliente_id: int
    habitacion_id: int
    fecha_entrada: date
    fecha_salida: date


class PagoBase(BaseModel):
    reserva_id: int
    monto: float
    metodo_pago: str  # ej. 'Transferencia', 'Tarjeta', 'Efectivo'


# ==========================================
# 3. Endpoints (Rutas de la API)
# ==========================================


@app.get("/habitaciones")
def obtener_habitaciones_disponibles(db=Depends(get_db_connection)):
    """Revisar cuántas habitaciones hay disponibles"""
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM habitacion;"
    cursor.execute(query)
    habitaciones = cursor.fetchall()
    cursor.close()

    return {"total_disponibles": len(habitaciones), "habitaciones": habitaciones}

@app.get("/reservas/disponibles")
def obtener_reservas_disponibles(db=Depends(get_db_connection)):
    """Revisar cuántas reservas hay disponibles"""
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM reserva"
    cursor.execute(query)
    reservas = cursor.fetchall()
    cursor.close()

    return {"total_disponibles": len(reservas), "reservas": reservas}

@app.get("/clientes/actuales")
def obtener_clientes_actuales(db=Depends(get_db_connection)):
    """Revisar que clientes estan vigentes"""
    cursor = db.cursor(dictionary=True)
    query = "SELECT * FROM cliente;"
    cursor.execute(query)
    clientes = cursor.fetchall()
    cursor.close()

    return {"vigentes": len(clientes), "clientes": clientes}


@app.delete("/borrar/clientes", status_code=201)
def borrar_clientes(id: int, db=Depends(get_db_connection)):
    """borrar clientes"""
    cursor = db.cursor()
    query = "DELETE FROM cliente WHERE id = %s;"
    valores = (id,)
    try:
        cursor.execute(query, valores)
        db.commit()
        # rowcount te dice cuántas filas se afectaron. Si es 0, el ID no existía.
        if cursor.rowcount > 0:
            resultado = f"✅ Usuario con ID {id} eliminado exitosamente."
        else:
            resultado = print(f"⚠️ No se encontró ningún usuario con el ID {id}.")

        return {"mensaje": resultado}

    except Error as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@app.post("/habitaciones", status_code=201)
def crear_habitacion(habitacion: HabitacionBase, db=Depends(get_db_connection)):
    """Crear una nueva habitación"""
    cursor = db.cursor()
    query = """
        INSERT INTO habitacion (numero_habitacion, tipo, precio_noche, disponible) 
        VALUES (%s, %s, %s, %s)
    """
    valores = (
        habitacion.numero_habitacion,
        habitacion.tipo,
        habitacion.precio_noche,
        habitacion.disponible,
    )

    try:
        cursor.execute(query, valores)
        db.commit()

        return {
            "mensaje": "Habitación creada exitosamente",
            "numero_habitacion": habitacion.numero_habitacion,
        }
    except Error as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@app.post("/usuarios", status_code=201)
def anadir_usuario(usuario: UsuarioBase, db=Depends(get_db_connection)):
    """Añadir un nuevo usuario/cliente"""
    cursor = db.cursor()
    query = "INSERT INTO cliente (nombre, apellido, documento_identidad, email, telefono) VALUES (%s, %s, %s, %s, %s)"
    valores = (
        usuario.nombre,
        usuario.apellido,
        usuario.documento_identidad,
        usuario.email,
        usuario.telefono,
    )

    try:
        cursor.execute(query, valores)
        db.commit()
        return {
            "mensaje": "Usuario creado exitosamente",
            "usuario_id": cursor.lastrowid,
        }
    except Error as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@app.post("/reservas", status_code=201)
def crear_reserva(reserva: ReservaBase, db=Depends(get_db_connection)):
    """Crear una reserva y marcar la habitación como no disponible"""
    cursor = db.cursor()

    try:
        # Iniciamos transacción
        db.start_transaction()

        # 1. Insertar la reserva
        query_reserva = """
            INSERT INTO reserva (cliente_id, habitacion_id, fecha_entrada, fecha_salida, estado) 
            VALUES (%s, %s, %s, %s, 'confirmada')
        """
        valores_reserva = (
            reserva.cliente_id,
            reserva.habitacion_id,
            reserva.fecha_entrada,
            reserva.fecha_salida
        )
        cursor.execute(query_reserva, valores_reserva)
        reserva_id = cursor.lastrowid

        # 2. Actualizar disponibilidad de la habitación
        query_update = (
            "UPDATE habitacion SET disponible = FALSE WHERE id = %s"
        )
        cursor.execute(query_update, (reserva.habitacion_id,))

        db.commit()
        return {"mensaje": "Reserva creada exitosamente", "reserva_id": reserva_id}

    except Error as e:
        db.rollback()  # Si algo falla, deshacemos ambos pasos
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@app.post("/pagos", status_code=201)
def adjuntar_pago(pago: PagoBase, db=Depends(get_db_connection)):
    """Registrar un pago y actualizar el estado de la reserva"""
    cursor = db.cursor()

    try:
        db.start_transaction()

        # 1. Insertar el registro del pago
        query_pago = (
            "INSERT INTO pago (reserva_id, monto, metodo_pago) VALUES (%s, %s, %s)"
        )
        cursor.execute(query_pago, (pago.reserva_id, pago.monto, pago.metodo_pago))
        pago_id = cursor.lastrowid

        # 2. Actualizar el estado de la reserva a "Pagado"
        query_update = "UPDATE reserva SET estado_pago = 'Pagado' WHERE id = %s"
        cursor.execute(query_update, (pago.reserva_id,))

        db.commit()
        return {"mensaje": "Pago registrado y reserva actualizada", "pago_id": pago_id}

    except Error as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cursor.close()


@app.get('/login')
def raiz():
    return render_template('login.html')
