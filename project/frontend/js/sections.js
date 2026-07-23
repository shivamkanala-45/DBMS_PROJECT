/* ==========================================================================
   js/sections.js — Garden Sections Logic
   Renders garden section cards and handles search, edit, and add functions.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderSections();
  initSectionModal();
  document.getElementById('search-sections-grid')?.addEventListener('input', renderSections);
});

function renderSections() {
  const grid = document.getElementById('sections-grid');
  if (!grid || !window.GardenData) return;

  let sections = window.GardenData.getSections();
  const plants = window.GardenData.getPlants();
  const query = (document.getElementById('search-sections-grid')?.value || '').toLowerCase().trim();

  if (query) {
    sections = sections.filter(sec => 
      (sec.name || '').toLowerCase().includes(query) ||
      (sec.id || '').toLowerCase().includes(query) ||
      (sec.area || '').toLowerCase().includes(query) ||
      (sec.head || '').toLowerCase().includes(query) ||
      (sec.irrigation || '').toLowerCase().includes(query)
    );
  }

  if (sections.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 32px;">No matching garden sections found.</div>`;
    return;
  }

  grid.innerHTML = sections.map(sec => {
    const plantCount = plants.filter(p => p.section === sec.name || p.Section_ID === sec.id).length;

    return `
      <div class="content-card" style="position: relative;">
        <div class="card-header" style="display: flex; align-items: center; justify-content: space-between;">
          <span class="card-title">${escapeHtml(sec.name)}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge badge-healthy">${escapeHtml(sec.id || 'SEC')}</span>
            <button class="btn btn-edit btn-sm btn-icon" title="Edit Section" onclick="editSectionCard('${escapeHtml(sec.id || sec.name)}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
          </div>
        </div>
        <div class="card-details">
          <div class="card-details-item">
            <i class="fa-solid fa-ruler-combined" style="color: var(--accent-light); width: 18px;"></i>
            <span>Area: <strong>${escapeHtml(sec.area)}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-user-gear" style="color: var(--accent-primary); width: 18px;"></i>
            <span>Supervisor: <strong>${escapeHtml(sec.head || 'Unassigned')}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-droplet" style="color: #3b82f6; width: 18px;"></i>
            <span>Irrigation: <strong>${escapeHtml(sec.irrigation || 'Manual')}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-seedling" style="color: var(--accent-light); width: 18px;"></i>
            <span>Plant Count: <strong>${plantCount} plants</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.editSectionCard = function(secIdOrName) {
  const sections = window.GardenData.getSections();
  const sec = sections.find(s => String(s.id || s.name || '').toLowerCase() === String(secIdOrName).toLowerCase());
  if (!sec) return;

  const modal = document.getElementById('section-modal');
  document.getElementById('section-modal-title').textContent = 'Edit Garden Section';
  document.getElementById('sec-id').value = sec.id || sec.name;
  document.getElementById('sec-name').value = sec.name || '';
  document.getElementById('sec-area').value = sec.area || '';
  document.getElementById('sec-head').value = sec.head || '';
  document.getElementById('sec-irrigation').value = sec.irrigation || 'Drip System';

  modal.classList.add('active');
};

function initSectionModal() {
  const modal = document.getElementById('section-modal');
  const addBtn = document.getElementById('btn-add-section');
  const closeBtn = document.getElementById('section-modal-close');
  const cancelBtn = document.getElementById('section-modal-cancel');
  const form = document.getElementById('section-form');
  const headSelect = document.getElementById('sec-head');

  if (!modal || !addBtn) return;

  const staff = window.GardenData.getStaff();
  headSelect.innerHTML = staff.map(st => `<option value="${escapeHtml(st.name)}">${escapeHtml(st.name)} (${st.role})</option>`).join('');

  function openModal() {
    form.reset();
    document.getElementById('sec-id').value = '';
    document.getElementById('section-modal-title').textContent = 'Add New Garden Section';
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
    document.getElementById('sec-id').value = '';
    document.getElementById('section-modal-title').textContent = 'Add New Garden Section';
  }

  addBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('sec-id').value.trim();
    const secData = {
      name: document.getElementById('sec-name').value.trim(),
      area: document.getElementById('sec-area').value.trim(),
      head: document.getElementById('sec-head').value,
      irrigation: document.getElementById('sec-irrigation').value,
      status: 'Active'
    };

    if (editId) {
      secData.id = editId;
      window.GardenData.updateRow('GARDEN_SECTION', 'Section_ID', editId, secData);
      window.showToast(`Garden Section "${secData.name}" updated!`, 'success');
    } else {
      secData.id = 'SEC0' + (window.GardenData.getSections().length + 1);
      window.GardenData.addSection(secData);
      window.showToast(`Garden Section "${secData.name}" added!`, 'success');
    }

    closeModal();
    renderSections();
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}
