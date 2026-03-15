// ============================================
//  app.js — Comida Solidaria + Firebase
//  usuario: root  |  contraseña: 00899Bryan
// ============================================

// ── Firebase config (SDK compat, funciona con script tag)
const firebaseConfig = {
  apiKey:            "AIzaSyCFeEqn07p5631fTt4JtCXtqBETAjeQfGI",
  authDomain:        "app-de-menu.firebaseapp.com",
  projectId:         "app-de-menu",
  storageBucket:     "app-de-menu.firebasestorage.app",
  messagingSenderId: "958368843204",
  appId:             "1:958368843204:web:fe1cc6cca1252a462ad091"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const FLYER_REF = db.collection('flyer').doc('config');

// ── Auth
const _U    = 'root';
const _H    = btoa(btoa('00899Bryan') + ':yk_25');
const _hash = p => btoa(btoa(p) + ':yk_25');

let isAdmin = false;
let waOwner = '5491139283936';

// ============================================
//  FIREBASE — cargar datos al iniciar
// ============================================
async function cargarDesdeFirebase() {
  try {
    const snap = await FLYER_REF.get();
    if (!snap.exists) {
      console.log('Firebase: no hay datos guardados aún');
      return;
    }
    const d = snap.data();

    // Aplicar al DOM
    if (d.badge)    setText('fl-badge',    d.badge);
    if (d.subtitle) setText('fl-subtitle', d.subtitle);
    if (d.line1)    setText('fl-line1',    d.line1);
    if (d.line2)    setText('fl-line2',    d.line2);
    if (d.price)    setText('fl-price',    d.price);
    if (d.time)     setText('fl-time',     d.time);
    if (d.tel1)     setText('fl-tel1',     d.tel1);
    if (d.tel2)     setText('fl-tel2',     d.tel2);
    if (d.footer)   setText('fl-footer',   d.footer);
    if (d.zona)     setHTML('fl-zona',     d.zona);
    if (d.date)     setHTML('fl-date',     d.date);
    if (d.waOwner)  waOwner = d.waOwner;
    if (d.foto)     setHTML('photoInner',  `<img src="${d.foto}" alt="Foto del plato">`);

    // Llenar inputs del panel con los datos guardados
    if (d.badge)    setVal('e-badge',    d.badge);
    if (d.subtitle) setVal('e-subtitle', d.subtitle);
    if (d.line1)    setVal('e-line1',    d.line1);
    if (d.line2)    setVal('e-line2',    d.line2);
    if (d.price)    setVal('e-price',    d.price);
    if (d.time)     setVal('e-time',     d.time);
    if (d.tel1)     setVal('e-tel1',     d.tel1);
    if (d.tel2)     setVal('e-tel2',     d.tel2);
    if (d.footer)   setVal('e-footer',   d.footer);
    if (d.zonaRaw)  setVal('e-zona',     d.zonaRaw);
    if (d.dateRaw)  setVal('e-date',     d.dateRaw);
    if (d.waOwner)  setVal('e-waowner',  d.waOwner);

    console.log('✅ Datos cargados desde Firebase:', new Date(d.updatedAt).toLocaleString());

  } catch (err) {
    console.error('Firebase: error al cargar datos →', err);
  }
}

// ── Guardar en Firebase
async function guardarEnFirebase(datos) {
  try {
    await FLYER_REF.set(datos, { merge: true });
    console.log('✅ Guardado en Firebase');
    return true;
  } catch (err) {
    console.error('Firebase: error al guardar →', err);
    showToast('⚠️ Error al guardar en la nube', '#e67e22');
    return false;
  }
}

// ── Helpers DOM
const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML   = val; };
const setVal  = (id, val) => { const el = document.getElementById(id); if (el) el.value       = val; };
const getVal  = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };

// ============================================
//  ADMIN BAR
// ============================================
function showAdminBar() {
  document.getElementById('actionBar').style.cssText =
    'display:flex;gap:12px;flex-wrap:wrap;justify-content:center;width:100%;max-width:430px;';
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
  setVal('l-user', '');
  setVal('l-pass', '');
  document.getElementById('loginError').classList.remove('show');
}

function doLogin() {
  const u = getVal('l-user');
  const p = document.getElementById('l-pass').value;

  if (u === _U && _hash(p) === _H) {
    isAdmin = true;
    closeLogin();
    showAdminBar();
    document.getElementById('adminTrigger').style.display = 'none';
    document.getElementById('logoutChip').classList.add('visible');
    document.getElementById('flyer').classList.add('admin-mode');
    showToast('✅ Bienvenido, ' + u + '!', '#c8891e');
  } else {
    document.getElementById('loginError').classList.add('show');
    const box = document.getElementById('loginBox');
    box.classList.add('shake');
    setVal('l-pass', '');
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

async function applyChanges() {
  const badge    = getVal('e-badge');
  const subtitle = getVal('e-subtitle');
  const line1    = getVal('e-line1');
  const line2    = getVal('e-line2');
  const price    = getVal('e-price');
  const time     = getVal('e-time');
  const tel1     = getVal('e-tel1');
  const tel2     = getVal('e-tel2');
  const footer   = getVal('e-footer');
  const zonaRaw  = getVal('e-zona');
  const dateRaw  = getVal('e-date');
  const wa       = getVal('e-waowner');

  // Construir HTML de zona y fecha
  const zonaHTML = zonaRaw.replace(' ', '<br>');
  const parts    = dateRaw.split(' ');
  const mid      = Math.ceil(parts.length / 2);
  const dateHTML = parts.slice(0, mid).join(' ') + '<br>' + parts.slice(mid).join(' ');

  // Aplicar al DOM
  setText('fl-badge',    badge);
  setText('fl-subtitle', subtitle);
  setText('fl-line1',    line1);
  setText('fl-line2',    line2);
  setText('fl-price',    price);
  setText('fl-time',     time);
  setText('fl-tel1',     tel1);
  setText('fl-tel2',     tel2);
  setText('fl-footer',   footer);
  setHTML('fl-zona',     zonaHTML);
  setHTML('fl-date',     dateHTML);
  waOwner = wa;

  // Foto actual (base64 si fue subida)
  const imgEl   = document.querySelector('#photoInner img');
  const fotoB64 = imgEl ? imgEl.src : null;

  showToast('💾 Guardando en Firebase...', '#c8891e');

  const ok = await guardarEnFirebase({
    badge, subtitle, line1, line2,
    price, time, tel1, tel2, footer,
    zonaRaw, dateRaw,
    zona:    zonaHTML,
    date:    dateHTML,
    waOwner: wa,
    foto:    fotoB64,
    updatedAt: new Date().toISOString()
  });

  closePanel();
  if (ok) {
    showToast('✅ ¡Guardado en la nube! 🔥', '#27ae60');
  }
}

// ============================================
//  FOTO
// ============================================
function handlePhotoClick() {
  if (!isAdmin) return;
  document.getElementById('photoInput').click();
}

// ============================================
//  EXPORTAR PNG — canvas nativo (sin Google Fonts)
// ============================================
async function exportPNG() {
  if (!isAdmin) { openLogin(); return; }
  showToast('⏳ Generando PNG...', '#c8891e');

  const badge    = document.getElementById('fl-badge').textContent;
  const subtitle = document.getElementById('fl-subtitle').textContent;
  const line1    = document.getElementById('fl-line1').textContent;
  const line2    = document.getElementById('fl-line2').textContent;
  const precio   = document.getElementById('fl-price').textContent;
  const fecha    = document.getElementById('fl-date').innerText.replace('\n', ' ');
  const hora     = document.getElementById('fl-time').textContent;
  const zona     = document.getElementById('fl-zona').innerText.replace('\n', ' ');
  const tel1     = document.getElementById('fl-tel1').textContent;
  const tel2     = document.getElementById('fl-tel2').textContent;
  const footer   = document.getElementById('fl-footer').textContent;
  const imgEl    = document.querySelector('#photoInner img');

  const W = 430 * 3, H = 800 * 3, s = 3;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  // Fondo madera
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

  // Vetas
  for (let i = 0; i < H; i += 30 * s) {
    ctx.strokeStyle = 'rgba(180,100,30,0.06)';
    ctx.lineWidth   = 2 * s;
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i + 20 * s); ctx.stroke();
  }

  // Franjas Ecuador arriba y abajo
  [[0], [H - 14 * s]].forEach(([y]) => {
    ctx.fillStyle = '#FFD100'; ctx.fillRect(0,         y, W * 0.5,  14 * s);
    ctx.fillStyle = '#003DA5'; ctx.fillRect(W * 0.5,   y, W * 0.25, 14 * s);
    ctx.fillStyle = '#C8102E'; ctx.fillRect(W * 0.75,  y, W * 0.25, 14 * s);
  });

  // Borde ornamental
  ctx.strokeStyle = 'rgba(200,137,30,0.55)'; ctx.lineWidth = 1.5 * s;
  ctx.strokeRect(16*s, 16*s, (430-32)*s, (800-32)*s);
  ctx.strokeStyle = 'rgba(200,137,30,0.25)'; ctx.lineWidth = 1 * s;
  ctx.strokeRect(20*s, 20*s, (430-40)*s, (800-40)*s);

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  const divider = y => {
    const gd = ctx.createLinearGradient(0, 0, W, 0);
    gd.addColorStop(0, 'transparent');
    gd.addColorStop(0.5, 'rgba(200,137,30,0.6)');
    gd.addColorStop(1, 'transparent');
    ctx.strokeStyle = gd; ctx.lineWidth = 1 * s;
    ctx.beginPath(); ctx.moveTo(40*s, y*s); ctx.lineTo((430-40)*s, y*s); ctx.stroke();
  };

  // Badge
  ctx.font = `bold ${11*s}px Georgia,serif`;
  ctx.fillStyle = 'rgba(240,180,74,0.9)';
  ctx.fillText(badge.toUpperCase(), W/2, 55*s);
  divider(65);

  // Subtítulo
  ctx.font = `italic ${22*s}px Georgia,serif`;
  ctx.fillStyle = 'rgba(245,230,200,0.85)';
  ctx.fillText(subtitle, W/2, 80*s);

  // Nombre plato
  ctx.font = `bold ${52*s}px Georgia,serif`;
  ctx.fillStyle = '#f5e6c8';
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 8*s; ctx.shadowOffsetY = 4*s;
  ctx.fillText(line1, W/2, 120*s);
  ctx.font = `bold italic ${44*s}px Georgia,serif`;
  ctx.fillStyle = '#f0b84a';
  ctx.fillText(line2, W/2, 168*s);
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  divider(192);

  // Marco foto
  const fX = 80*s, fY = 200*s, fW = 270*s, fH = 270*s;
  const gF = ctx.createLinearGradient(fX, 0, fX+fW, 0);
  gF.addColorStop(0, '#7a4020'); gF.addColorStop(0.5, '#5a2c10'); gF.addColorStop(1, '#7a4020');
  ctx.fillStyle = gF;
  ctx.fillRect(fX-10*s, fY-10*s, fW+20*s, fH+20*s);
  ctx.fillStyle = '#3b1f0e';
  ctx.fillRect(fX-4*s,  fY-4*s,  fW+8*s,  fH+8*s);

  if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(fX, fY, fW, fH); ctx.clip();
    ctx.drawImage(imgEl, fX, fY, fW, fH);
    ctx.restore();
  } else {
    const gPh = ctx.createLinearGradient(fX, fY, fX+fW, fY+fH);
    gPh.addColorStop(0, '#4a2810'); gPh.addColorStop(1, '#2a1206');
    ctx.fillStyle = gPh;
    ctx.fillRect(fX, fY, fW, fH);
    ctx.font = `${60*s}px serif`;
    ctx.fillText('🍽️', W/2, fY + fH/2);
  }
  divider(490);

  // Precio
  const pX=115*s, pY=498*s, pW=200*s, pH=54*s;
  ctx.fillStyle = '#f5e6c8'; ctx.fillRect(pX, pY, pW, pH);
  ctx.strokeStyle = '#c8891e'; ctx.lineWidth = 2*s; ctx.strokeRect(pX, pY, pW, pH);
  ctx.font = `bold ${40*s}px Georgia,serif`; ctx.fillStyle = '#3b1f0e';
  ctx.fillText(precio, W/2, pY + pH/2);
  ctx.font = `bold ${9*s}px Arial,sans-serif`; ctx.fillStyle = '#6b3a1f';
  ctx.fillText('POR PLATO', W/2, pY + pH/2 + 22*s);
  divider(565);

  // Cards info
  const infoCard = (x, y, w, h, icon, label, val, sub) => {
    ctx.strokeStyle = 'rgba(200,137,30,0.35)'; ctx.lineWidth = 1*s;
    ctx.strokeRect(x*s, y*s, w*s, h*s);
    const gl = ctx.createLinearGradient(x*s, 0, (x+w)*s, 0);
    gl.addColorStop(0, 'transparent');
    gl.addColorStop(0.5, 'rgba(200,137,30,0.7)');
    gl.addColorStop(1, 'transparent');
    ctx.strokeStyle = gl; ctx.lineWidth = 2*s;
    ctx.beginPath(); ctx.moveTo(x*s, y*s); ctx.lineTo((x+w)*s, y*s); ctx.stroke();
    const cx = (x + w/2) * s;
    ctx.font = `${16*s}px serif`;         ctx.fillStyle = '#fff';     ctx.fillText(icon,            cx, (y+14)*s);
    ctx.font = `bold ${7*s}px Arial`;     ctx.fillStyle = '#f0b84a';  ctx.fillText(label.toUpperCase(), cx, (y+26)*s);
    ctx.font = `bold ${11*s}px Georgia`;  ctx.fillStyle = '#f5e6c8';  ctx.fillText(val,             cx, (y+38)*s);
    if (sub) { ctx.font = `${9*s}px Arial`; ctx.fillStyle = '#e8d0a0'; ctx.fillText(sub, cx, (y+50)*s); }
  };

  infoCard(35,  572, 170, 65, '📅', 'Cuándo',   fecha, hora);
  infoCard(225, 572, 170, 65, '📍', 'Retiro',    zona,  '');
  infoCard(35,  647, 360, 55, '📞', 'Reservas',  tel1 + '   ' + tel2, '');
  divider(716);

  // Footer
  ctx.font = `italic ${14*s}px Georgia,serif`;
  ctx.fillStyle = 'rgba(200,137,30,0.75)';
  ctx.fillText(footer, W/2, 730*s);

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
  const nombre = getVal('r-nombre');
  const tel    = getVal('r-tel');
  const dir    = getVal('r-dir');
  const cant   = document.getElementById('r-cant').value || '1';
  const hora   = getVal('r-hora');
  const nota   = getVal('r-nota');

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
//  INIT AL CARGAR
// ============================================
document.addEventListener('DOMContentLoaded', async () => {

  // 1. Cargar datos guardados desde Firebase
  await cargarDesdeFirebase();

  // 2. Cerrar modales al hacer click fuera
  document.getElementById('panelOverlay').addEventListener('click', function(e) {
    if (e.target === this) closePanel();
  });
  document.getElementById('loginOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeLogin();
  });

  // 3. Enter en el login
  ['l-user', 'l-pass'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  });

  // 4. Subir foto y guardar en Firebase automáticamente
  document.getElementById('photoInput').addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      const b64 = e.target.result;
      setHTML('photoInner', `<img src="${b64}" alt="Foto del plato">`);
      showToast('💾 Guardando foto...', '#c8891e');
      const ok = await guardarEnFirebase({ foto: b64, updatedAt: new Date().toISOString() });
      if (ok) showToast('✅ Foto guardada en la nube 🔥', '#27ae60');
    };
    reader.readAsDataURL(file);
  });

});
