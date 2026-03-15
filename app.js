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
//  EXPORTAR PNG — dibuja el flyer en canvas nativo
//  usando fuentes del sistema (sin depender de Google Fonts)
// ============================================
async function exportPNG() {
  if (!isAdmin) { openLogin(); return; }
  showToast('⏳ Generando PNG...', '#c8891e');

  // Leer valores actuales del flyer
  const badge    = document.getElementById('fl-badge').textContent;
  const subtitle = document.getElementById('fl-subtitle').textContent;
  const line1    = document.getElementById('fl-line1').textContent;
  const line2    = document.getElementById('fl-line2').textContent;
  const precio   = document.getElementById('fl-price').textContent;
  const fecha    = document.getElementById('fl-date').innerText.replace('\n',' ');
  const hora     = document.getElementById('fl-time').textContent;
  const zona     = document.getElementById('fl-zona').innerText.replace('\n',' ');
  const tel1     = document.getElementById('fl-tel1').textContent;
  const tel2     = document.getElementById('fl-tel2').textContent;
  const footer   = document.getElementById('fl-footer').textContent;

  // Foto del plato (si fue cargada)
  const imgEl = document.querySelector('#photoInner img');

  const W = 430 * 3, H = 800 * 3;
  const cv = document.createElement('canvas');
  cv.width  = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  const s = 3; // escala

  // ── Fondo madera con gradiente
  const gBg = ctx.createLinearGradient(0, 0, W, H);
  gBg.addColorStop(0,    '#5a2d12');
  gBg.addColorStop(0.20, '#3d1a08');
  gBg.addColorStop(0.35, '#6b3518');
  gBg.addColorStop(0.50, '#3a1809');
  gBg.addColorStop(0.60, '#7a4020');
  gBg.addColorStop(0.75, '#3b1c0a');
  gBg.addColorStop(0.90, '#5c2e12');
  gBg.addColorStop(1,    '#2e1206');
  ctx.fillStyle = gBg;
  ctx.fillRect(0, 0, W, H);

  // Vetas de madera
  ctx.save();
  for (let i = 0; i < H; i += 30 * s) {
    ctx.strokeStyle = 'rgba(180,100,30,0.06)';
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(W, i + 20 * s);
    ctx.stroke();
  }
  ctx.restore();

  // ── Franjas Ecuador (arriba)
  ctx.fillStyle = '#FFD100'; ctx.fillRect(0, 0, W * 0.5, 14 * s);
  ctx.fillStyle = '#003DA5'; ctx.fillRect(W * 0.5, 0, W * 0.25, 14 * s);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W * 0.75, 0, W * 0.25, 14 * s);

  // ── Franjas Ecuador (abajo)
  ctx.fillStyle = '#FFD100'; ctx.fillRect(0, H - 14 * s, W * 0.5, 14 * s);
  ctx.fillStyle = '#003DA5'; ctx.fillRect(W * 0.5, H - 14 * s, W * 0.25, 14 * s);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W * 0.75, H - 14 * s, W * 0.25, 14 * s);

  // ── Borde ornamental
  ctx.strokeStyle = 'rgba(200,137,30,0.55)';
  ctx.lineWidth = 1.5 * s;
  ctx.strokeRect(16 * s, 16 * s, (430 - 32) * s, (800 - 32) * s);
  ctx.strokeStyle = 'rgba(200,137,30,0.25)';
  ctx.lineWidth = 1 * s;
  ctx.strokeRect(20 * s, 20 * s, (430 - 40) * s, (800 - 40) * s);

  // Helper: línea divisora
  function divider(y) {
    const gd = ctx.createLinearGradient(0, 0, W, 0);
    gd.addColorStop(0,   'transparent');
    gd.addColorStop(0.5, 'rgba(200,137,30,0.6)');
    gd.addColorStop(1,   'transparent');
    ctx.strokeStyle = gd;
    ctx.lineWidth = 1 * s;
    ctx.beginPath();
    ctx.moveTo(40 * s, y * s);
    ctx.lineTo((430 - 40) * s, y * s);
    ctx.stroke();
  }

  // Helper: texto centrado
  function cText(txt, y, font, color, maxW) {
    ctx.font  = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (maxW) {
      ctx.fillText(txt, W / 2, y * s, maxW * s);
    } else {
      ctx.fillText(txt, W / 2, y * s);
    }
  }

  // ── BADGE
  ctx.font = `bold ${11 * s}px 'Georgia', serif`;
  ctx.fillStyle = 'rgba(240,180,74,0.9)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(badge.toUpperCase(), W / 2, 55 * s);
  divider(65);

  // ── SUBTITLE
  ctx.font = `italic ${22 * s}px Georgia, serif`;
  ctx.fillStyle = 'rgba(245,230,200,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(subtitle, W / 2, 80 * s);

  // ── NOMBRE PLATO
  ctx.font = `bold ${52 * s}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = '#f5e6c8';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8 * s;
  ctx.shadowOffsetY = 4 * s;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(line1, W / 2, 120 * s);

  ctx.font = `bold italic ${44 * s}px Georgia, 'Times New Roman', serif`;
  ctx.fillStyle = '#f0b84a';
  ctx.fillText(line2, W / 2, 168 * s);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  divider(192);

  // ── FOTO DEL PLATO
  const frameX = 80 * s, frameY = 200 * s;
  const frameW = 270 * s, frameH = 270 * s;

  // Marco madera
  const gFrame = ctx.createLinearGradient(frameX - 10 * s, 0, frameX + frameW + 10 * s, 0);
  gFrame.addColorStop(0, '#7a4020'); gFrame.addColorStop(0.5, '#5a2c10'); gFrame.addColorStop(1, '#7a4020');
  ctx.fillStyle = gFrame;
  ctx.fillRect(frameX - 10 * s, frameY - 10 * s, frameW + 20 * s, frameH + 20 * s);

  ctx.fillStyle = '#3b1f0e';
  ctx.fillRect(frameX - 4 * s, frameY - 4 * s, frameW + 8 * s, frameH + 8 * s);

  if (imgEl && imgEl.complete) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameW, frameH);
    ctx.clip();
    ctx.drawImage(imgEl, frameX, frameY, frameW, frameH);
    ctx.restore();
  } else {
    // Placeholder si no hay foto
    const gPh = ctx.createLinearGradient(frameX, frameY, frameX + frameW, frameY + frameH);
    gPh.addColorStop(0, '#4a2810'); gPh.addColorStop(1, '#2a1206');
    ctx.fillStyle = gPh;
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.font = `${60 * s}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('🍽️', W / 2, (frameY / s + frameH / s / 2) * s);
  }

  divider(490);

  // ── PRECIO
  const pX = 115 * s, pY = 498 * s, pW = 200 * s, pH = 54 * s;
  ctx.fillStyle = '#f5e6c8';
  ctx.fillRect(pX, pY, pW, pH);
  ctx.strokeStyle = '#c8891e'; ctx.lineWidth = 2 * s;
  ctx.strokeRect(pX, pY, pW, pH);

  ctx.font = `bold ${40 * s}px Georgia, serif`;
  ctx.fillStyle = '#3b1f0e';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(precio, W / 2, (pY / s + pH / s / 2) * s);

  ctx.font = `bold ${9 * s}px Arial, sans-serif`;
  ctx.fillStyle = '#6b3a1f';
  ctx.fillText('POR PLATO', W / 2, (pY / s + pH / s / 2 + 22) * s);

  divider(565);

  // ── GRID INFO (fecha / zona / teléfonos)
  function infoCard(x, y, w, h, icon, label, val, sub) {
    ctx.strokeStyle = 'rgba(200,137,30,0.35)';
    ctx.lineWidth = 1 * s;
    ctx.strokeRect(x * s, y * s, w * s, h * s);

    // línea dorada arriba
    const gl = ctx.createLinearGradient(x * s, 0, (x + w) * s, 0);
    gl.addColorStop(0,'transparent'); gl.addColorStop(0.5,'rgba(200,137,30,0.7)'); gl.addColorStop(1,'transparent');
    ctx.strokeStyle = gl; ctx.lineWidth = 2 * s;
    ctx.beginPath(); ctx.moveTo(x * s, y * s); ctx.lineTo((x + w) * s, y * s); ctx.stroke();

    const cx = (x + w / 2) * s;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

    ctx.font = `${16 * s}px serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(icon, cx, (y + 14) * s);

    ctx.font = `bold ${7 * s}px Arial, sans-serif`;
    ctx.fillStyle = '#f0b84a';
    ctx.fillText(label.toUpperCase(), cx, (y + 26) * s);

    ctx.font = `bold ${11 * s}px Georgia, serif`;
    ctx.fillStyle = '#f5e6c8';
    ctx.fillText(val, cx, (y + 38) * s);

    if (sub) {
      ctx.font = `${9 * s}px Arial, sans-serif`;
      ctx.fillStyle = '#e8d0a0';
      ctx.fillText(sub, cx, (y + 50) * s);
    }
  }

  infoCard(35, 572, 170, 65, '📅', 'Cuándo', fecha, hora);
  infoCard(225, 572, 170, 65, '📍', 'Retiro', zona, '');

  // Card teléfonos ancho completo
  infoCard(35, 647, 360, 55, '📞', 'Reservas', tel1 + '   ' + tel2, '');

  divider(716);

  // ── FOOTER
  ctx.font = `italic ${14 * s}px Georgia, serif`;
  ctx.fillStyle = 'rgba(200,137,30,0.75)';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(footer, W / 2, 730 * s);

  // ── Descargar
  await new Promise(r => setTimeout(r, 100));
  const a = document.createElement('a');
  a.download = 'flyer-comida-solidaria.png';
  a.href = cv.toDataURL('image/png', 1.0);
  a.click();
  showToast('📥 ¡PNG descargado!', '#c8891e');
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
