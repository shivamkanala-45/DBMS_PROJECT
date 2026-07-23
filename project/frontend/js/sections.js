/* ==========================================================================
   js/sections.js — Garden Sections Logic
   Renders garden section cards and handles adding new garden sections.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  renderSections();
  initSectionModal();
});

function renderSections() {
  const grid = document.getElementById('sections-grid');
  if (!grid || !window.GardenData) return;

  const sections = window.GardenData.getSections();
  const plants = window.GardenData.getPlants();

  if (sections.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No garden sections found.</div>`;
    return;
  }

  grid.innerHTML = sections.map(sec => {
    // Calculate plant count for this section
    const plantCount = plants.filter(p => p.section === sec.name).length;

    return `
      <div class="content-card">
        <div class="card-header">
          <span class="card-title">${escapeHtml(sec.name)}</span>
          <span class="badge badge-healthy">${escapeHtml(sec.id)}</span>
        </div>
        <div class="card-details">
          <div class="card-details-item">
            <i class="fa-solid fa-ruler-combined" style="color: var(--secondary); width: 18px;"></i>
            <span>Area: <strong>${escapeHtml(sec.area)}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-user-gear" style="color: var(--accent); width: 18px;"></i>
            <span>Supervisor: <strong>${escapeHtml(sec.head || 'Unassigned')}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-droplet" style="color: #3b82f6; width: 18px;"></i>
            <span>Irrigation: <strong>${escapeHtml(sec.irrigation || 'Manual')}</strong></span>
          </div>
          <div class="card-details-item">
            <i class="fa-solid fa-seedling" style="color: var(--primary); width: 18px;"></i>
            <span>Plant Count: <strong>${plantCount} plants</strong></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function initSectionModal() {
  const modal = document.getElementById('section-modal');
  const addBtn = document.getElementById('btn-add-section');
  const closeBtn = document.getElementById('section-modal-close');
  const cancelBtn = document.getElementById('section-modal-cancel');
  const form = document.getElementById('section-form');
  const headSelect = document.getElementById('sec-head');

  if (!modal || !addBtn) return;

  // Populate staff dropdown
  const staff = window.GardenData.getStaff();
  headSelect.innerHTML = staff.map(st => `<option value="${escapeHtml(st.name)}">${escapeHtml(st.name)} (${st.role})</option>`).join('');

  function openModal() {
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
  }

  addBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newSec = {
      name: document.getElementById('sec-name').value.trim(),
      area: document.getElementById('sec-area').value.trim(),
      head: document.getElementById('sec-head').value,
      irrigation: document.getElementById('sec-irrigation').value,
      status: 'Active'
    };

    window.GardenData.addSection(newSec);
    window.showToast(`Garden Section "${newSec.name}" added successfully!`, 'success');
    closeModal();
    renderSections();
  });
}

// Helper: Escape HTML
function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}
