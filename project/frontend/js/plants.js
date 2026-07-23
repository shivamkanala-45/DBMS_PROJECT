/* ==========================================================================
   js/plants.js — Cultivation Tables Manager with Add & Delete across all tables
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderPlantTable();
  await renderSectionTable();
  await renderIrrigationSysTable();
  await renderIrrigationTypeTable();
  await renderDeadPlantTable();
  initPlantModal();
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

// 1. Plant
async function renderPlantTable() {
  const tbody = document.getElementById('tbl-plant-tbody');
  if (!tbody) return;

  const plants = window.ApiClient ? await window.ApiClient.getPlants() : window.GardenData.getTable('PLANT');

  if (plants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No plants found.</td></tr>`;
    return;
  }

  tbody.innerHTML = plants.map(p => {
    const id = p.Plant_ID || p.plant_id || 'P001';
    const secId = p.Section_ID || p.section_id || p.area_id || 'SEC01';
    const staffId = p.Staff_ID || p.staff_id || p.assigned_worker_id || 'ST001';
    const sysId = p.System_ID || p.system_id || p.irrigation_type_id || 'IS01';
    const name = p.Name || p.name || 'Plant';
    const datePlanted = p.Date_Planted || p.date_planted || '2023-01-15';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><code>${escapeHtml(secId)}</code></td>
        <td><code>${escapeHtml(staffId)}</code></td>
        <td><code>${escapeHtml(sysId)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(formatDate(datePlanted))}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Plant" onclick="deletePlantRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deletePlantRow = async function(id) {
  if (confirm(`Delete plant "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deletePlant(id);
    else window.GardenData.deleteRow('PLANT', 'Plant_ID', id);
    window.showToast('Plant deleted.', 'danger');
    await renderPlantTable();
  }
};

// 2. Garden_Section
async function renderSectionTable() {
  const tbody = document.getElementById('tbl-section-tbody');
  if (!tbody) return;

  const sections = window.ApiClient ? await window.ApiClient.getSections() : window.GardenData.getTable('GARDEN_SECTION');

  if (sections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No sections found.</td></tr>`;
    return;
  }

  tbody.innerHTML = sections.map(s => {
    const secId = s.Section_ID || s.section_id || s.area_id || 'SEC01';
    const secGroup = s.Security_ID || s.security_id || 'SG01';
    const name = s.Name || s.name || 'Garden Section';
    const area = s.Area || s.area || s.area_sqft || 500;
    const signboard = s.sign_board !== undefined ? (s.sign_board ? 'Yes' : 'No') : (s.has_signboard ? 'Yes' : 'No');

    return `
      <tr>
        <td><code>${escapeHtml(secId)}</code></td>
        <td><code>${escapeHtml(secGroup)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(area)} sq ft</td>
        <td><span class="badge ${signboard === 'Yes' ? 'badge-healthy' : 'badge-pending'}">${escapeHtml(signboard)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Section" onclick="deleteSectionRow('${secId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteSectionRow = async function(id) {
  if (confirm(`Delete section "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteSection(id);
    else window.GardenData.deleteRow('GARDEN_SECTION', 'Section_ID', id);
    window.showToast('Section deleted.', 'danger');
    await renderSectionTable();
  }
};

// 6. Irrigation_System
async function renderIrrigationSysTable() {
  const tbody = document.getElementById('tbl-irrigation-sys-tbody');
  if (!tbody) return;

  const systems = window.ApiClient ? await window.ApiClient.getIrrigationSystems() : window.GardenData.getTable('IRRIGATION_SYSTEM');

  tbody.innerHTML = systems.map(is => {
    const sysId = is.System_ID || is.system_id || 'IS01';
    return `
      <tr>
        <td><code>${escapeHtml(sysId)}</code></td>
        <td>${escapeHtml(formatDate(is.date || is.created_at || '2024-01-10'))}</td>
        <td><span class="badge badge-completed">${escapeHtml(is.Type_name || is.type_name || 'Drip')}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete System" onclick="deleteIrrigationSysRow('${sysId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteIrrigationSysRow = async function(id) {
  if (confirm(`Delete Irrigation System "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteIrrigationSystem(id);
    else window.GardenData.deleteRow('IRRIGATION_SYSTEM', 'System_ID', id);
    window.showToast('Irrigation System deleted.', 'danger');
    await renderIrrigationSysTable();
  }
};

// 7. Irrigation_Type
async function renderIrrigationTypeTable() {
  const tbody = document.getElementById('tbl-irrigation-type-tbody');
  if (!tbody) return;

  const types = window.ApiClient ? await window.ApiClient.getIrrigationTypes() : window.GardenData.getTable('IRRIGATION_TYPE');

  tbody.innerHTML = types.map(it => {
    const typeName = it.Type_name || it.type_name || 'Drip';
    const waterUsage = it.water_usage || it.water_usage_level || 'Low';

    return `
      <tr>
        <td><strong>${escapeHtml(typeName)}</strong></td>
        <td><span class="badge ${waterUsage === 'High' ? 'badge-critical' : (waterUsage === 'Medium' ? 'badge-warning' : 'badge-healthy')}">${escapeHtml(waterUsage)} Usage</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Type" onclick="deleteIrrigationTypeRow('${typeName}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteIrrigationTypeRow = async function(name) {
  if (confirm(`Delete Irrigation Type "${name}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteIrrigationType(name);
    else window.GardenData.deleteRow('IRRIGATION_TYPE', 'Type_name', name);
    window.showToast('Irrigation Type deleted.', 'danger');
    await renderIrrigationTypeTable();
  }
};

// 15. Dead_Plant_Record
async function renderDeadPlantTable() {
  const tbody = document.getElementById('tbl-dead-plant-tbody');
  if (!tbody) return;

  const dead = window.ApiClient ? await window.ApiClient.getDeadPlants() : window.GardenData.getTable('DEAD_PLANT_RECORD');

  tbody.innerHTML = dead.map(d => {
    const recId = d.Record_ID || d.record_id || 'DR01';
    return `
      <tr>
        <td><code>${escapeHtml(recId)}</code></td>
        <td><code>${escapeHtml(d.Plant_ID || d.plant_id || 'P001')}</code></td>
        <td>${escapeHtml(formatDate(d.Date_Recorded || d.date_recorded || '2026-02-01'))}</td>
        <td><span class="badge badge-critical">${escapeHtml(d.Reason || d.reason || 'Root rot')}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Record" onclick="deleteDeadPlantRow('${recId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteDeadPlantRow = async function(id) {
  if (confirm(`Delete Record "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteDeadPlant(id);
    else window.GardenData.deleteRow('DEAD_PLANT_RECORD', 'Record_ID', id);
    window.showToast('Dead Plant Record deleted.', 'danger');
    await renderDeadPlantTable();
  }
};

function initPlantModal() {
  const modal = document.getElementById('plant-modal');
  const addBtn = document.getElementById('btn-add-plant');
  const closeBtn = document.getElementById('plant-modal-close');
  const cancelBtn = document.getElementById('plant-modal-cancel');
  const form = document.getElementById('plant-form');

  if (!modal || !addBtn) return;

  function closeModal() { modal.classList.remove('active'); form.reset(); }

  addBtn.addEventListener('click', () => {
    document.getElementById('form-p-date').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPlant = {
      Plant_ID: 'P' + String(Date.now()).slice(-3),
      Section_ID: document.getElementById('form-p-sec').value.trim(),
      Staff_ID: document.getElementById('form-p-staff').value.trim(),
      System_ID: document.getElementById('form-p-sys').value.trim(),
      Name: document.getElementById('form-p-name').value.trim(),
      Date_Planted: document.getElementById('form-p-date').value,
      status: 'Healthy'
    };

    window.GardenData.addRow('PLANT', newPlant);
    window.showToast(`Plant "${newPlant.Name}" added!`, 'success');
    closeModal();
    await renderPlantTable();
  });
}

function formatDate(val) {
  if (!val) return '—';
  if (typeof val === 'string' && val.includes('T')) return val.split('T')[0];
  return String(val);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}
