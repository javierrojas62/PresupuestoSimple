/* ============================================================
   Presupuesto Simple — Lógica principal
   ============================================================ */

'use strict';

// --------------------------------------------------------------
// Estado global de la aplicación
// --------------------------------------------------------------
const state = {
  company: { name: '', cuit: '', email: '', address: '', phone: '', website: '' },
  client:  { name: '', cuit: '', email: '' },
  items: [],
  validDays: 30,
  description: '',
  logoDataUrl: null,
  _idCounter: 0,
};

// --------------------------------------------------------------
// Utilidades
// --------------------------------------------------------------

/** Da formato moneda argentina: $ 1.234,56 */
function formatCurrency(n) {
  return '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Escapa caracteres HTML para prevenir XSS */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

/** Limpia un string para usarlo como nombre de archivo */
function sanitizeFilename(str) {
  return (str || 'presupuesto')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').toLowerCase() || 'presupuesto';
}

/** Formatea una fecha como DD/MM/YYYY */
function formatDate(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// --------------------------------------------------------------
// Referencias DOM (se cachean al iniciar)
// --------------------------------------------------------------
let dom = {};

function cacheDom() {
  dom = {
    companyName    : document.getElementById('company-name'),
    companyCuit    : document.getElementById('company-cuit'),
    companyEmail   : document.getElementById('company-email'),
    companyAddress : document.getElementById('company-address'),
    companyPhone   : document.getElementById('company-phone'),
    companyWebsite : document.getElementById('company-website'),
    clientName     : document.getElementById('client-name'),
    clientCuit     : document.getElementById('client-cuit'),
    clientEmail    : document.getElementById('client-email'),
    itemsBody      : document.getElementById('items-body'),
    totalAmount    : document.getElementById('total-amount'),
    validDays      : document.getElementById('valid-days'),
    issueDate      : document.getElementById('issue-date'),
    validUntil     : document.getElementById('valid-until'),
    description    : document.getElementById('description'),
    logoInput      : document.getElementById('logo-input'),
    logoImg        : document.getElementById('logo-img'),
    logoPreview    : document.getElementById('logo-preview'),
    logoPlaceholder: document.getElementById('logo-placeholder'),
    logoRemove     : document.getElementById('logo-remove'),
    addItemBtn     : document.getElementById('add-item-btn'),
    pdfBtn         : document.getElementById('pdf-btn'),
    resetBtn       : document.getElementById('reset-btn'),
    form           : document.getElementById('invoice-form'),
  };
}

// --------------------------------------------------------------
// Items (filas de productos)
// --------------------------------------------------------------

/** Agrega una fila vacía a la tabla de items */
function addItemRow(product = '', quantity = 1, price = 0) {
  const id = ++state._idCounter;

  state.items.push({ id, product, quantity, price, subtotal: quantity * price });

  const row = document.createElement('tr');
  row.dataset.itemId = id;
  row.innerHTML = `
    <td><input type="text"   class="form-control item-product"  placeholder="Ej: Consultoría" value="${escapeHtml(product)}"></td>
    <td><input type="number" class="form-control item-qty"      min="1"  step="1"  value="${quantity}"></td>
    <td><input type="number" class="form-control item-price"    min="0"  step="0.01" value="${price}"></td>
    <td class="item-subtotal text-end fw-semibold">${formatCurrency(quantity * price)}</td>
    <td class="text-center">
      <button type="button" class="btn btn-outline-danger btn-sm btn-delete-item" title="Eliminar fila">&times;</button>
    </td>
  `;

  dom.itemsBody.appendChild(row);

  // Eventos internos de la fila
  const productInput = row.querySelector('.item-product');
  const qtyInput     = row.querySelector('.item-qty');
  const priceInput   = row.querySelector('.item-price');
  const deleteBtn    = row.querySelector('.btn-delete-item');

  productInput.addEventListener('input', () => {
    const item = state.items.find(i => i.id === id);
    if (item) item.product = productInput.value;
  });

  const recalc = () => {
    const item = state.items.find(i => i.id === id);
    if (!item) return;
    item.quantity = Math.max(1, parseInt(qtyInput.value, 10) || 0);
    item.price    = Math.max(0, parseFloat(priceInput.value) || 0);
    item.subtotal = item.quantity * item.price;
    row.querySelector('.item-subtotal').textContent = formatCurrency(item.subtotal);
    updateTotal();
  };

  qtyInput.addEventListener('input', recalc);
  priceInput.addEventListener('input', recalc);

  deleteBtn.addEventListener('click', () => {
    removeItemRow(id);
  });

  updateTotal();
}

/** Elimina una fila por ID */
function removeItemRow(id) {
  state.items = state.items.filter(i => i.id !== id);
  const row = document.querySelector(`tr[data-item-id="${id}"]`);
  if (row) row.remove();
  updateTotal();
}

// --------------------------------------------------------------
// Cálculos
// --------------------------------------------------------------

/** Recalcula el total general */
function updateTotal() {
  const total = state.items.reduce((sum, i) => sum + i.subtotal, 0);
  dom.totalAmount.textContent = formatCurrency(total);
}

// --------------------------------------------------------------
// Fechas de validez
// --------------------------------------------------------------

function updateDates() {
  const now = new Date();
  const days = parseInt(dom.validDays.value, 10) || 30;
  const until = new Date(now);
  until.setDate(until.getDate() + days);

  dom.issueDate.textContent = formatDate(now);
  dom.validUntil.textContent = formatDate(until);
  state.validDays = days;
}

// --------------------------------------------------------------
// Logo
// --------------------------------------------------------------

function handleLogoUpload(file) {
  // Validar tipo
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(file.type)) {
    alert('Solo se permiten imágenes JPG, PNG, WebP o GIF.');
    return;
  }

  // Validar tamaño (máx 2 MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no debe superar los 2 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.logoDataUrl = e.target.result;
    dom.logoImg.src = state.logoDataUrl;
    dom.logoImg.classList.remove('d-none');
    dom.logoPlaceholder.classList.add('d-none');
    dom.logoRemove.classList.remove('d-none');
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logoDataUrl = null;
  dom.logoImg.src = '';
  dom.logoImg.classList.add('d-none');
  dom.logoPlaceholder.classList.remove('d-none');
  dom.logoRemove.classList.add('d-none');
  dom.logoInput.value = '';
}

// --------------------------------------------------------------
// Sincronizar estado <-> DOM
// --------------------------------------------------------------

function syncStateFromDom() {
  state.company.name    = dom.companyName.value;
  state.company.cuit    = dom.companyCuit.value;
  state.company.email   = dom.companyEmail.value;
  state.company.address = dom.companyAddress.value;
  state.company.phone   = dom.companyPhone.value;
  state.company.website = dom.companyWebsite.value;
  state.client.name     = dom.clientName.value;
  state.client.cuit     = dom.clientCuit.value;
  state.client.email    = dom.clientEmail.value;
  state.description     = dom.description.value;
  state.validDays       = parseInt(dom.validDays.value, 10) || 30;
}

// --------------------------------------------------------------
// Validación del formulario
// --------------------------------------------------------------

function validateForm() {
  let valid = true;

  [dom.companyName, dom.clientName].forEach(el => {
    if (!el.value.trim()) {
      el.classList.add('is-invalid');
      valid = false;
    } else {
      el.classList.remove('is-invalid');
    }
  });

  if (state.items.length === 0) {
    alert('Agregá al menos un producto o servicio.');
    valid = false;
  }

  return valid;
}

// --------------------------------------------------------------
// PDF
// --------------------------------------------------------------

function buildPdfHtml() {
  syncStateFromDom();

  const { company, client, items, description, validDays, logoDataUrl } = state;

  const logoHtml = logoDataUrl
    ? `<img src="${logoDataUrl}" class="pdf-logo-img" alt="Logo">`
    : '';

  const issueDateStr = formatDate(new Date());
  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + validDays);
  const untilStr = formatDate(untilDate);

  const itemsHtml = items.map((item, idx) => `
    <tr>
      <td>${escapeHtml(item.product || '—')}</td>
      <td class="pdf-td-right">${item.quantity}</td>
      <td class="pdf-td-right">${formatCurrency(item.price)}</td>
      <td class="pdf-td-right">${formatCurrency(item.subtotal)}</td>
    </tr>
  `).join('');

  const total = items.reduce((s, i) => s + i.subtotal, 0);

  const notesHtml = description.trim()
    ? `<div class="pdf-notes">
         <div class="pdf-notes-title">Notas</div>
         ${escapeHtml(description)}
       </div>`
    : '';

  return `
    <div class="pdf-invoice">
      <!-- Encabezado: logo + empresa -->
      <div class="pdf-header">
        <div>${logoHtml}</div>
        <div class="pdf-company-data">
          <div class="pdf-company-name">${escapeHtml(company.name || '—')}</div>
          ${company.cuit ? `<p class="pdf-company-detail">CUIT: ${escapeHtml(company.cuit)}</p>` : ''}
          ${company.email ? `<p class="pdf-company-detail">${escapeHtml(company.email)}</p>` : ''}
          ${company.address ? `<p class="pdf-company-detail">${escapeHtml(company.address)}</p>` : ''}
          ${company.phone ? `<p class="pdf-company-detail">Tel: ${escapeHtml(company.phone)}</p>` : ''}
          ${company.website ? `<p class="pdf-company-detail">${escapeHtml(company.website)}</p>` : ''}
        </div>
      </div>

      <!-- Cliente -->
      <div class="pdf-client-section">
        <div class="pdf-client-title">Cliente</div>
        <div class="pdf-client-name">${escapeHtml(client.name || '—')}</div>
        ${client.cuit ? `<p class="pdf-client-detail">CUIT: ${escapeHtml(client.cuit)}</p>` : ''}
        ${client.email ? `<p class="pdf-client-detail">${escapeHtml(client.email)}</p>` : ''}
      </div>

      <!-- Items -->
      <table class="pdf-items-table">
        <thead>
          <tr>
            <th>Producto / Servicio</th>
            <th class="pdf-th-right">Cant.</th>
            <th class="pdf-th-right">Precio Unit.</th>
            <th class="pdf-th-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr class="pdf-total-row">
            <td colspan="3">Total</td>
            <td class="pdf-td-right">${formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Validez -->
      <div class="pdf-valid-row">
        <span>Fecha de emisión: ${issueDateStr}</span>
        <span>Válido hasta: ${untilStr} (${validDays} días)</span>
      </div>

      ${notesHtml}
    </div>
  `;
}

function generatePdf() {
  if (!validateForm()) return;

  dom.pdfBtn.disabled = true;
  dom.pdfBtn.textContent = '⏳ Preparando…';

  syncStateFromDom();
  const html = buildPdfHtml();
  const name = sanitizeFilename(state.client.name);

  // Iframe invisible para imprimir el presupuesto
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; opacity: 0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Presupuesto - ${escapeHtml(state.client.name)}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="css/styles.css">
      <style>
        body { background: #fff; padding: 0; margin: 0; font-family: 'Inter', sans-serif; }
        .app-header, .app-footer, .no-print { display: none !important; }
        @page { margin: 15mm; }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `);
  doc.close();

  // Dar tiempo a que carguen fuentes y estilos
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();

    // Limpiar después del diálogo de impresión
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      dom.pdfBtn.disabled = false;
      dom.pdfBtn.innerHTML = '📄  Descargar PDF';
    }, 1000);
  }, 600);
}

// --------------------------------------------------------------
// Reset
// --------------------------------------------------------------

function resetForm() {
  if (state.items.length > 0 && !confirm('¿Estás seguro? Se borrarán todos los datos ingresados.')) return;

  // Limpiar campos de empresa
  dom.companyName.value = '';
  dom.companyCuit.value = '';
  dom.companyEmail.value = '';
  dom.companyAddress.value = '';
  dom.companyPhone.value = '';
  dom.companyWebsite.value = '';

  // Limpiar campos de cliente
  dom.clientName.value = '';
  dom.clientCuit.value = '';
  dom.clientEmail.value = '';

  // Limpiar items
  dom.itemsBody.innerHTML = '';
  state.items = [];
  state._idCounter = 0;
  addItemRow();

  // Limpiar validez
  dom.validDays.value = 30;
  updateDates();

  // Limpiar descripción
  dom.description.value = '';
  state.description = '';

  // Limpiar logo
  removeLogo();

  // Limpiar validaciones
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

// --------------------------------------------------------------
// Eventos
// --------------------------------------------------------------

function bindEvents() {
  // Sincronizar estado al escribir en inputs de texto
  const textInputs = [
    dom.companyName, dom.companyCuit, dom.companyEmail, dom.companyAddress, dom.companyPhone, dom.companyWebsite,
    dom.clientName, dom.clientCuit, dom.clientEmail,
  ];
  textInputs.forEach(el => {
    if (el) el.addEventListener('input', syncStateFromDom);
  });

  // Descripción
  if (dom.description) {
    dom.description.addEventListener('input', syncStateFromDom);
  }

  // Días de validez
  if (dom.validDays) {
    dom.validDays.addEventListener('input', updateDates);
  }

  // Logo
  if (dom.logoInput) {
    dom.logoInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) handleLogoUpload(e.target.files[0]);
    });
  }

  if (dom.logoRemove) {
    dom.logoRemove.addEventListener('click', removeLogo);
  }

  // Agregar item
  if (dom.addItemBtn) {
    dom.addItemBtn.addEventListener('click', () => addItemRow());
  }

  // PDF
  if (dom.pdfBtn) {
    dom.pdfBtn.addEventListener('click', generatePdf);
  }

  // Reset
  if (dom.resetBtn) {
    dom.resetBtn.addEventListener('click', resetForm);
  }
}

// --------------------------------------------------------------
// Inicialización
// --------------------------------------------------------------

function init() {
  cacheDom();

  if (!dom.itemsBody) {
    console.error('Presupuesto Simple: no se encontró #items-body');
    return;
  }

  // Agregar primera fila vacía
  addItemRow();

  // Fecha por defecto
  updateDates();

  // Vincular eventos
  bindEvents();

  // Sincronizar estado inicial
  syncStateFromDom();

  console.log('✅ Presupuesto Simple iniciado correctamente');
}

// Arrancar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
