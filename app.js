// ============================================
//  app.js — Comida Solidaria
//  usuario: root  |  contraseña: 00899Bryan
// ============================================

const _U = 'root';
const _H = btoa(btoa('00899Bryan') + ':yk_25');
const _hash = p => btoa(btoa(p) + ':yk_25');

let isAdmin = false;
let waOwner = '5491139283936';

// ── Mostrar/ocultar barra admin usando style directo (evita conflictos CSS)
function showAdminBar() {
  const bar = document.getElementById('actionBar');
  bar.style.cssText = 'display:flex; gap:12px; flex-wrap:wrap; justify-content:center; width:100%; max-width:430px;';
}
function hideAdminBar() {
  document.getElementById('actionBar').style.cssText = 'display:none';
}

// ============================================
//  LOGIN
// ============================================
function openLogin() {
  document.getElementById('loginOverlay').classList.add('open');
  setTimeout(() => document.getElementById('l-user').focus(), 120);
}

function closeLogin() {
  document.getElementById('loginOverlay').classList.remove('open');
  document.getElementById('l-user').value = '';
  document.getElementById('l-pass').value = '';
  document.getElementById('loginError').classList.remove('show');
}

function doLogin() {
  const u = document.getElementById('l-user').value.trim();
  const p = document.getElementById('l-pass').value;

  if (u === _U && _hash(p) === _H) {
    isAdmin = true;
    closeLogin();

    // Mostrar barra de botones
    showAdminBar();

    // Ocultar botón discreto, mostrar chip logout
    document.getElementById('adminTrigger').style.display = 'none';
    document.getElementById('logoutChip').classList.add('visible');

    // Activar modo admin en el flyer
    document.getElementById('flyer').classList.add('admin-mode');

    showToast('✅ Bienvenido, ' + u + '!', '#c8891e');
  } else {
    document.getElementById('loginError').classList.add('show');
    const box = document.getElementById('loginBox');
    box.classList.add('shake');
    document.getElementById('l-pass').value = '';
    setTimeout(() => box.classList.remove('shake'), 450);
  }
}

function doLogout() {
  isAdmin = false;
  hideAdminBar();
  document.getElementById('adminTrigger').style.display = 'flex';
  document.getElementById('logoutChip').classList.remove('visible');
  document.getElementById('flyer').classList.remove('admin-mode');
  showToast('👋 Sesión cerrada', '#555');
}

// ============================================
//  PANEL EDICIÓN
// ============================================
function openPanel() {
  if (!isAdmin) { openLogin(); return; }
  document.getElementById('panelOverlay').classList.add('open');
}

function closePanel() {
  document.getElementById('panelOverlay').classList.remove('open');
}

function applyChanges() {
  const g = id => document.getElementById(id).value.trim();

  document.getElementById('fl-badge').textContent    = g('e-badge');
  document.getElementById('fl-subtitle').textContent = g('e-subtitle');
  document.getElementById('fl-line1').textContent    = g('e-line1');
  document.getElementById('fl-line2').textContent    = g('e-line2');
  document.getElementById('fl-price').textContent    = g('e-price');
  document.getElementById('fl-time').textContent     = g('e-time');
  document.getElementById('fl-tel1').textContent     = g('e-tel1');
  document.getElementById('fl-tel2').textContent     = g('e-tel2');
  document.getElementById('fl-footer').textContent   = g('e-footer');
  document.getElementById('fl-zona').innerHTML       = g('e-zona').replace(' ', '<br>');

  const parts = g('e-date').split(' ');
  const mid   = Math.ceil(parts.length / 2);
  document.getElementById('fl-date').innerHTML =
    parts.slice(0, mid).join(' ') + '<br>' + parts.slice(mid).join(' ');

  waOwner = g('e-waowner');
  closePanel();
  showToast('✅ ¡Flyer actualizado!', '#c8891e');
}

// ============================================
//  FOTO (solo en modo admin)
// ============================================
function handlePhotoClick() {
  if (!isAdmin) return;
  document.getElementById('photoInput').click();
}

// ============================================
//  EXPORTAR PNG — espera fuentes antes de renderizar
// ============================================
async function exportPNG() {
  if (!isAdmin) { openLogin(); return; }
  showToast('⏳ Preparando exportación...', '#c8891e');

  // 1. Esperar que todas las fuentes estén listas
  await document.fonts.ready;

  // 2. Pequeña pausa extra para que los emojis y renders terminen
  await new Promise(r => setTimeout(r, 400));

  showToast('⏳ Generando PNG...', '#c8891e');

  try {
    const canvas = await html2canvas(document.getElementById('flyer'), {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#3b1f0e',
      logging: false,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // Aseguramos que el clon tenga todos los estilos de fuentes cargados
        const style = clonedDoc.createElement('style');
        style.textContent = `
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Cabin:wght@400;700&family=Satisfy&display=swap');
          * { -webkit-font-smoothing: antialiased; }
        `;
        clonedDoc.head.appendChild(style);
      }
    });

    const a = document.createElement('a');
    a.download = 'flyer-comida-solidaria.png';
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
    showToast('📥 ¡PNG descargado!', '#c8891e');

  } catch (err) {
    console.error(err);
    showToast('❌ Error al exportar', '#c0392b');
  }
}

// ============================================
//  RESERVA WHATSAPP
// ============================================
function enviarReserva() {
  const nombre = document.getElementById('r-nombre').value.trim();
  const tel    = document.getElementById('r-tel').value.trim();
  const dir    = document.getElementById('r-dir').value.trim();
  const cant   = document.getElementById('r-cant').value || '1';
  const hora   = document.getElementById('r-hora').value.trim();
  const nota   = document.getElementById('r-nota').value.trim();

  if (!nombre || !tel || !dir) {
    showToast('⚠️ Completá nombre, teléfono y dirección', '#e67e22');
    return;
  }

  const plato  = document.getElementById('fl-line1').textContent + ' ' +
                 document.getElementById('fl-line2').textContent;
  const precio = document.getElementById('fl-price').textContent;
  const fecha  = document.getElementById('fl-date').innerText.replace('\n', ' ');
  const zona   = document.getElementById('fl-zona').innerText.replace('\n', ' ');

  const msg =
`🍽️ *NUEVA RESERVA – Comida Solidaria*
──────────────────────
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${tel}
📍 *Dirección:* ${dir}
🍗 *Plato:* ${plato}
🔢 *Cantidad:* ${cant} plato(s)
💰 *Precio:* ${precio} × ${cant}
🕐 *Horario:* ${hora || 'A confirmar'}
📅 *Fecha:* ${fecha}
🗺️ *Retiro:* ${zona}${nota ? '\n📝 *Nota:* ' + nota : ''}
──────────────────────
¡Gracias por tu reserva! 🙏`;

  window.open(`https://wa.me/${waOwner}?text=${encodeURIComponent(msg)}`, '_blank');
  showToast('✅ Abriendo WhatsApp...', '#25d366');
}

// ============================================
//  TOAST
// ============================================
function showToast(msg, color) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = color || '#25d366';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ============================================
//  EVENTOS AL CARGAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // Cerrar overlays clickeando fuera
  document.getElementById('panelOverlay').addEventListener('click', function(e) {
    if (e.target === this) closePanel();
  });
  document.getElementById('loginOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeLogin();
  });

  // Enter en login
  ['l-user', 'l-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  });

  // Cargar foto
  document.getElementById('photoInput').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('photoInner').innerHTML =
        `<img src="${e.target.result}" alt="Foto del plato">`;
    };
    reader.readAsDataURL(file);
  });

});
