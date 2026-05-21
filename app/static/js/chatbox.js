const botResponses = {
    'disponibilidad': ['Por supuesto. ¿Para qué fechas le gustaría consultar disponibilidad?', 'Tenemos habitaciones disponibles del 17 al 25 de mayo. ¿Prefiere una suite o habitación estándar?'],
    'reserva': ['Con mucho gusto. Para realizar su reserva necesito: fechas de llegada y salida, y el tipo de habitación. ¿Tiene alguna preferencia?', '¿Cuántas noches planea hospedarse con nosotros?'],
    'cancelar': ['Entendido. Para cancelar su reserva necesito su código de confirmación (formato #RES-XXXX). ¿Lo tiene a mano?'],
    'mis reservas': ['Consultando sus reservas activas... Tiene 1 reserva activa: Suite Presidencial del 20 al 23 de mayo. Código #RES-0089.'],
    'precio': ['Nuestras tarifas por noche son: Suite Presidencial $750, Junior Suite $420, Habitación Deluxe $280. ¿Le interesa alguna en particular?'],
    'default': ['Entendido. ¿Hay algo más en lo que pueda ayudarle?', 'Por supuesto. Puede preguntarme sobre disponibilidad, tarifas, reservas o nuestros servicios.', 'Gracias por contactarnos. Estoy aquí para ayudarle con cualquier consulta sobre su estadía.']
};

const botonChat = document.getElementById("chat-toggle");
botonChat.addEventListener('click', toggleChat);

let chatOpen = false;

function toggleChat() {
    console.log('suu')
    chatOpen = !chatOpen;
    document.getElementById('chatbot-window').classList.toggle('open', chatOpen);
    document.getElementById('chat-icon').textContent = chatOpen ? '✕' : '💬';
}

function getTime() {
    return new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(text, role) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg ' + role;

    if (role === 'bot') {
        div.innerHTML = `
        <div class="chat-avatar" style="width:28px;height:28px;font-size:0.7rem;flex-shrink:0;">✦</div>
        <div>
          <div class="msg-bubble">${text}</div>
          <div class="msg-time">${getTime()}</div>
        </div>`;
    } else {
        div.innerHTML = `
        <div>
          <div class="msg-bubble">${text}</div>
          <div class="msg-time" style="text-align:right;">${getTime()}</div>
        </div>`;
    }
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function addTyping() {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg bot'; div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="chat-avatar" style="width:28px;height:28px;font-size:0.7rem;flex-shrink:0;">✦</div>
      <div class="msg-bubble">
        <div class="chat-typing">
          <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
        </div>
      </div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
}

function getBotResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('disponib') || lower.includes('libre') || lower.includes('hay')) return botResponses.disponibilidad;
    if (lower.includes('reserv') || lower.includes('apartar') || lower.includes('book')) return botResponses.reserva;
    if (lower.includes('cancel')) return botResponses.cancelar;
    if (lower.includes('mis reservas') || lower.includes('mi reserva') || lower.includes('ver reserva')) return botResponses['mis reservas'];
    if (lower.includes('precio') || lower.includes('cuánto') || lower.includes('valor') || lower.includes('tarifa')) return botResponses.precio;
    return botResponses.default;
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    document.getElementById('chat-suggestions').style.display = 'none';

    addMessage(text, 'user');
    addTyping();

    setTimeout(() => {
        removeTyping();
        const responses = getBotResponse(text);
        const reply = responses[Math.floor(Math.random() * responses.length)];
        addMessage(reply, 'bot');
    }, 1000 + Math.random() * 600);
}

function sendSuggestion(el) {
    const text = el.textContent;
    document.getElementById('chat-input').value = text;
    sendMessage();
}

// ── INIT ──
// document.getElementById('chat-toggle').style.display = 'none';

// Set today's date minimum for date inputs
const todayStr = new Date().toISOString().split('T')[0];
document.querySelectorAll('input[type=date]').forEach(i => i.min = todayStr);