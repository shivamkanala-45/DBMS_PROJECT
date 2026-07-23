/* ==========================================================================
   js/visitors.js — Visitors & Access Manager with Search & Delete
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderVisitorTable();
  await renderVisitorCardTable();
  await renderVisitorAccessTable();
  initSearchListeners();
});

function initTabs() {
  const tabs = document.querySelectorAll('.tab-item');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.getAttribute('data-tab'))?.classList.add('active');
    });
  });
}

function initSearchListeners() {
  document.getElementById('search-visitor')?.addEventListener('input', renderVisitorTable);
  document.getElementById('search-visitor-card')?.addEventListener('input', renderVisitorCardTable);
  document.getElementById('search-visitor-access')?.addEventListener('input', renderVisitorAccessTable);
}

// 12. Visitor
async function renderVisitorTable() {
  const tbody = document.getElementById('tbl-visitor-tbody');
  if (!tbody) return;

  let visitors = window.ApiClient ? await window.ApiClient.getVisitors() : window.GardenData.getTable('VISITOR');
  const query = (document.getElementById('search-visitor')?.value || '').toLowerCase().trim();

  if (query) {
    visitors = visitors.filter(v =>
      (v.Visitor_ID || v.visitor_id || '').toLowerCase().includes(query) ||
      (v.Card_ID || v.card_id || '').toLowerCase().includes(query) ||
      (v.Name || v.name || '').toLowerCase().includes(query) ||
      (v.Contact || v.contact || '').toLowerCase().includes(query) ||
      (v.profession || '').toLowerCase().includes(query)
    );
  }

  if (visitors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching visitors logged.</td></tr>`;
    return;
  }

  tbody.innerHTML = visitors.map(v => {
    const id = v.Visitor_ID || v.visitor_id || 'VIS01';
    const cardId = v.Card_ID || v.card_id || 'CARD101';
    const name = v.Name || v.name || v.full_name || 'Guest Visitor';
    const contact = v.Contact || v.contact || v.contact_phone || 'N/A';
    const profession = v.profession || 'Guest';
    const from = v.from || v.organization || 'Campus Guest';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><code>${escapeHtml(cardId)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(contact)}</td>
        <td><span class="badge badge-completed">${escapeHtml(profession)}</span></td>
        <td>${escapeHtml(from)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Visitor" onclick="deleteVisitorRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteVisitorRow = async function(id) {
  if (confirm(`Delete Visitor "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteVisitor(id);
    else window.GardenData.deleteRow('VISITOR', 'Visitor_ID', id);
    window.showToast('Visitor deleted.', 'danger');
    await renderVisitorTable();
  }
};

// 13. Visitor_Card
async function renderVisitorCardTable() {
  const tbody = document.getElementById('tbl-visitor-card-tbody');
  if (!tbody) return;

  let cards = window.ApiClient ? await window.ApiClient.getVisitorCards() : window.GardenData.getTable('VISITOR_CARD');
  const query = (document.getElementById('search-visitor-card')?.value || '').toLowerCase().trim();

  if (query) {
    cards = cards.filter(c =>
      (c.Card_ID || c.card_id || '').toLowerCase().includes(query) ||
      (c.type || '').toLowerCase().includes(query) ||
      (c.Security_ID || c.security_id || '').toLowerCase().includes(query)
    );
  }

  tbody.innerHTML = cards.map(c => {
    const id = c.Card_ID || c.card_id || 'CARD101';
    const type = c.type || 'Day Pass';
    const allowed = c.number_of_people_allowed || c.allowed_people || 1;
    const fees = c.fees || c.fee || '$5';
    const entry = c.entry_time || '09:00 AM';
    const exit = c.exit_time || '05:00 PM';
    const secId = c.Security_ID || c.security_id || 'SG01';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><strong>${escapeHtml(type)}</strong></td>
        <td><span class="badge badge-healthy">${escapeHtml(allowed)} people</span></td>
        <td>${escapeHtml(fees)}</td>
        <td>${escapeHtml(entry)}</td>
        <td>${escapeHtml(exit)}</td>
        <td><code>${escapeHtml(secId)}</code></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Card" onclick="deleteVisitorCardRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteVisitorCardRow = async function(id) {
  if (confirm(`Delete Visitor Card "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteVisitorCard(id);
    else window.GardenData.deleteRow('VISITOR_CARD', 'Card_ID', id);
    window.showToast('Visitor Card deleted.', 'danger');
    await renderVisitorCardTable();
  }
};

// 23. Visitor_Access
async function renderVisitorAccessTable() {
  const tbody = document.getElementById('tbl-visitor-access-tbody');
  if (!tbody) return;

  let access = window.ApiClient ? await window.ApiClient.getVisitorAccess() : window.GardenData.getTable('VISITOR_ACCESS');
  const query = (document.getElementById('search-visitor-access')?.value || '').toLowerCase().trim();

  if (query) {
    access = access.filter(a =>
      (a.Visitor_ID || a.visitor_id || '').toLowerCase().includes(query) ||
      (a.Section_ID || a.section_id || '').toLowerCase().includes(query) ||
      (a.purpose || '').toLowerCase().includes(query)
    );
  }

  tbody.innerHTML = access.map(a => {
    const vId = a.Visitor_ID || a.visitor_id || 'VIS01';
    const secId = a.Section_ID || a.section_id || a.area_id || 'SEC01';
    const purpose = a.purpose || 'Campus Visit';

    return `
      <tr>
        <td><code>${escapeHtml(vId)}</code></td>
        <td><code>${escapeHtml(secId)}</code></td>
        <td><span class="badge badge-warning">${escapeHtml(purpose)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Access Log" onclick="deleteVisitorAccessRow('${vId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteVisitorAccessRow = async function(id) {
  if (confirm(`Delete Visitor Access Log for "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteVisitorAccess(id);
    else window.GardenData.deleteRow('VISITOR_ACCESS', 'Visitor_ID', id);
    window.showToast('Access log deleted.', 'danger');
    await renderVisitorAccessTable();
  }
};

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}
