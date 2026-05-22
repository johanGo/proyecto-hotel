// ── MODAL RESERVA ──
let selectedRoom = '', selectedPrice = 0;

// Modal / summary DOM references (initialized once)
let modalRoomName = document.getElementById('modal-room-name');
let summaryRoom = document.getElementById('summary-room');
let summaryRate = document.getElementById('summary-rate');
let reservaModal = document.getElementById('reserva-modal');
let llegadaEl = document.getElementById('modal-llegada');
let salidaEl = document.getElementById('modal-salida');
let summaryNightsEl = document.getElementById('summary-nights');
let summaryTotalEl = document.getElementById('summary-total');
let confirmModal = document.getElementById('confirm-modal');

function openReservaModal(room, price) {
    console.log('Abriendo modal para:', room, 'con precio:', price);
    selectedRoom = room;
    selectedPrice = Number.isFinite(Number(price)) ? parseInt(price) : 0;

    if (modalRoomName) modalRoomName.textContent = room;
    else console.warn('#modal-room-name no disponible');

    if (summaryRoom) summaryRoom.textContent = room;
    if (summaryRate) summaryRate.textContent = '$' + (selectedPrice || price);

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const checkout = new Date(today); checkout.setDate(checkout.getDate() + 3);
    if (llegadaEl) llegadaEl.value = formatDate(tomorrow);
    if (salidaEl) salidaEl.value = formatDate(checkout);

    updateSummary();

    if (reservaModal) {
        reservaModal.classList.add('open');
        console.log('Reserva modal abierto:', reservaModal);
    } else {
        console.warn('#reserva-modal no disponible');
    }
}

function updateSummary() {
    const llegada = llegadaEl ? llegadaEl.value : null;
    const salida = salidaEl ? salidaEl.value : null;
    if (llegada && salida) {
        const nights = Math.max(1, Math.round((new Date(salida) - new Date(llegada)) / 86400000));
        if (summaryNightsEl) summaryNightsEl.textContent = nights + ' noche' + (nights !== 1 ? 's' : '');
        if (summaryTotalEl) summaryTotalEl.textContent = '$' + (selectedPrice * nights).toLocaleString();
    }
}

if (llegadaEl) llegadaEl.addEventListener('change', updateSummary);
if (salidaEl) salidaEl.addEventListener('change', updateSummary);

function closeModal() { if (reservaModal) reservaModal.classList.remove('open'); }

function confirmarReserva() {
    enviarDatos();
    closeModal();
    setTimeout(() => {
        if (confirmModal) confirmModal.classList.add('open');
        else console.warn('#confirm-modal no disponible');
    }, 150);
}

function closeConfirmModal() { if (confirmModal) confirmModal.classList.remove('open'); }

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

// Click outside modal to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

const container = document.querySelector('.rooms-grid');
const sectionCount = document.querySelector('.section-count');

function renderHabitaciones(datos) {
    if (!container) return;

    if (!datos || !Array.isArray(datos.habitaciones) || datos.habitaciones.length === 0) {
        container.innerHTML = '<p style="padding:24px; color:#fff;">No se encontraron habitaciones disponibles.</p>';
        if (sectionCount) sectionCount.textContent = '0 habitaciones encontradas';
        return;
    }

    if (sectionCount) sectionCount.textContent = `${datos.total_disponibles} habitaciones encontradas`;

    container.innerHTML = datos.habitaciones.map(habitacion => {
        const roomName = habitacion.tipo || `Habitación ${habitacion.numero_habitacion}`;
        const price = Number(habitacion.precio_noche || 0).toFixed(0);
        return `
            <div class="room-card" data-room-name="${roomName.replace(/"/g, '&quot;')}" data-room-price="${price}">
                <div class="room-img" style="background:linear-gradient(135deg,#1a1510 0%,#2a2018 100%);">
                    <span class="room-img-icon">🛏</span>
                    <div class="room-img-badge"><span class="badge badge-gold">Disponible</span></div>
                </div>
                <div class="room-body">
                    <div class="room-type">Habitación ${habitacion.numero_habitacion}</div>
                    <div class="room-name display">${roomName}</div>
                    <div class="room-desc">Precio por noche con amenities incluidas.</div>
                    <div class="room-features">
                        <span class="room-feature">🛏 Cama cómoda</span>
                        <span class="room-feature">🛁 Baño privado</span>
                        <span class="room-feature">🌆 Vista urbana</span>
                        <span class="room-feature">🍽 Desayuno opcional</span>
                    </div>
                    <div class="room-footer">
                        <div class="room-price">
                            <div class="room-price-num display">$${price}</div>
                            <div class="room-price-label">por noche</div>
                        </div>
                        <button type="button" class="btn btn-gold" style="padding:10px 20px; font-size:0.7rem;">Reservar</button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function attachRoomClickHandler() {
    if (!container) return;
    container.addEventListener('click', event => {

        // Evita que el modal active el evento
        if (event.target.closest('.modal-overlay')) return;

        const roomCard = event.target.closest('.room-card[data-room-name][data-room-price]');

        if (!roomCard) return;

        const roomName = roomCard.dataset.roomName;
        const roomPrice = roomCard.dataset.roomPrice;

        openReservaModal(roomName, roomPrice);
    });
}

async function obtenerDatos() {
    try {
        const respuesta = await fetch('http://localhost:8000/habitaciones');

        if (!respuesta.ok) {
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        console.log(datos);
        renderHabitaciones(datos);
    } catch (error) {
        console.error('Hubo un problema:', error);
        if (container) {
            container.innerHTML = '<p style="padding:24px; color:#fff;">No se pudo cargar la información de habitaciones.</p>';
        }
        if (sectionCount) sectionCount.textContent = '0 habitaciones encontradas';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    attachRoomClickHandler();
    obtenerDatos();
});

async function enviarDatos() {
  const url = 'http://localhost:8000/reservas';
  
  // Los datos que queremos enviar
  const nuevaReserva = {
    cliente_id: 1,
    habitacion_id: 1,
    fecha_entrada: '9977-10-01',
    fecha_salida: '9977-10-05'
  };

  try {
    const respuesta = await fetch(url, {
      method: 'POST', // Especificamos que es un POST
      headers: {
        'Content-Type': 'application/json' // Le decimos al servidor que enviamos JSON
      },
      body: JSON.stringify(nuevaReserva) // Convertimos el objeto JS a texto JSON
    });

    const resultado = await respuesta.json();
    console.log('Reserva creada:', resultado);
  } catch (error) {
    console.error('Error al enviar:', error);
  }
}
