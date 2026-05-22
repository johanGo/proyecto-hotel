// ── MODAL RESERVA ──
let selectedRoom = '', selectedPrice = 0;


function openReservaModal(room, price) {
    selectedRoom = room; selectedPrice = parseInt(price);
    document.getElementById('modal-room-name').textContent = room;
    document.getElementById('summary-room').textContent = room;
    document.getElementById('summary-rate').textContent = '$' + price;
    updateSummary();
    document.getElementById('reserva-modal').classList.add('open');

    // Set default dates
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const checkout = new Date(today); checkout.setDate(checkout.getDate() + 3);
    document.getElementById('modal-llegada').value = formatDate(tomorrow);
    document.getElementById('modal-salida').value = formatDate(checkout);
    updateSummary();
}

function updateSummary() {
    const llegada = document.getElementById('modal-llegada').value;
    const salida = document.getElementById('modal-salida').value;
    if (llegada && salida) {
        const nights = Math.max(1, Math.round((new Date(salida) - new Date(llegada)) / 86400000));
        document.getElementById('summary-nights').textContent = nights + ' noche' + (nights !== 1 ? 's' : '');
        document.getElementById('summary-total').textContent = '$' + (selectedPrice * nights).toLocaleString();
    }
}

document.getElementById('modal-llegada').addEventListener('change', updateSummary);
document.getElementById('modal-salida').addEventListener('change', updateSummary);

function closeModal() { document.getElementById('reserva-modal').classList.remove('open'); }

function confirmarReserva() {
    closeModal();
    setTimeout(() => {
        document.getElementById('confirm-modal').classList.add('open');
    }, 150);
}

function closeConfirmModal() { document.getElementById('confirm-modal').classList.remove('open'); }

function formatDate(d) {
    return d.toISOString().split('T')[0];
}

// Click outside modal to close
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});