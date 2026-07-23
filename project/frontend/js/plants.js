/* ==========================================================================
   js/plants.js — Cultivation Tables Manager with Search, Edit & Delete
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
  document.getElementById('search-plant')?.addEventListener('input', renderPlantTable);
  document.getElementById('search-section')?.addEventListener('input', renderSectionTable);
  document.getElementById('search-irrigation-sys')?.addEventListener('input', renderIrrigationSysTable);
  document.getElementById('search-irrigation-type')?.addEventListener('input', renderIrrigationTypeTable);
  document.getElementById('search-dead-plant')?.addEventListener('input', renderDeadPlantTable);
}

// 1. Plant
async function renderPlantTable() {
  const tbody = document.getElementById('tbl-plant-tbody');
  if (!tbody) return;

  let plants = window.ApiClient ? await window.ApiClient.getPlants() : window.GardenData.getTable('PLANT');
  const query = (document.getElementById('search-plant')?.value || '').toLowerCase().trim();

  if (query) {
    plants = plants.filter(p => 
      (p.Plant_ID || p.plant_id || '').toLowerCase().includes(query) ||
      (p.Name || p.name || '').toLowerCase().includes(query) ||
      (p.Section_ID || p.section_id || '').toLowerCase().includes(query) ||
      (p.Staff_ID || p.staff_id || '').toLowerCase().includes(query) ||
      (p.System_ID || p.system_id || '').toLowerCase().includes(query)
    );
  }

  if (plants.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching plants found.</td></tr>`;
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
          <div class="action-btns">
            <button class="btn btn-edit btn-sm btn-icon" title="Edit Plant" onclick="editPlantRow('${id}')">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-icon" title="Delete Plant" onclick="deletePlantRow('${id}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.editPlantRow = async function(id) {
  const plants = window.ApiClient ? await window.ApiClient.getPlants() : window.GardenData.getTable('PLANT');
  const plant = plants.find(p => String(p.Plant_ID || p.plant_id || '').toLowerCase() === String(id).toLowerCase());
  if (!plant) return;

  const modal = document.getElementById('plant-modal');
  document.getElementById('plant-modal-title').textContent = 'Edit Plant Record';
  document.getElementById('plant-modal-submit').textContent = 'Update Plant';
  document.getElementById('form-p-id').value = id;
  document.getElementById('form-p-name').value = plant.Name || plant.name || '';
  document.getElementById('form-p-sec').value = plant.Section_ID || plant.section_id || 'SEC01';
  document.getElementById('form-p-staff').value = plant.Staff_ID || plant.staff_id || 'ST001';
  document.getElementById('form-p-sys').value = plant.System_ID || plant.system_id || 'IS01';
  document.getElementById('form-p-date').value = (plant.Date_Planted || plant.date_planted || '').split('T')[0];

  modal.classList.add('active');
};

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

  let sections = window.ApiClient ? await window.ApiClient.getSections() : window.GardenData.getTable('GARDEN_SECTION');
  const query = (document.getElementById('search-section')?.value || '').toLowerCase().trim();

  if (query) {
    sections = sections.filter(s =>
      (s.Section_ID || s.section_id || '').toLowerCase().includes(query) ||
      (s.Name || s.name || '').toLowerCase().includes(query) ||
      (s.Security_ID || s.security_id || '').toLowerCase().includes(query)
    );
  }

  if (sections.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching sections found.</td></tr>`;
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
          <div class="action-btns">
            <button class="btn btn-danger btn-sm btn-icon" title="Delete Section" onclick="deleteSectionRow('${secId}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
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

  let systems = window.ApiClient ? await window.ApiClient.getIrrigationSystems() : window.GardenData.getTable('IRRIGATION_SYSTEM');
  const query = (document.getElementById('search-irrigation-sys')?.value || '').toLowerCase().trim();

  if (query) {
    systems = systems.filter(is =>
      (is.System_ID || is.system_id || '').toLowerCase().includes(query) ||
      (is.Type_name || is.type_name || '').toLowerCase().includes(query)
    );
  }

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

  let types = window.ApiClient ? await window.ApiClient.getIrrigationTypes() : window.GardenData.getTable('IRRIGATION_TYPE');
  const query = (document.getElementById('search-irrigation-type')?.value || '').toLowerCase().trim();

  if (query) {
    types = types.filter(it =>
      (it.Type_name || it.type_name || '').toLowerCase().includes(query) ||
      (it.water_usage || '').toLowerCase().includes(query)
    );
  }

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

  let dead = window.ApiClient ? await window.ApiClient.getDeadPlants() : window.GardenData.getTable('DEAD_PLANT_RECORD');
  const query = (document.getElementById('search-dead-plant')?.value || '').toLowerCase().trim();

  if (query) {
    dead = dead.filter(d =>
      (d.Record_ID || d.record_id || '').toLowerCase().includes(query) ||
      (d.Plant_ID || d.plant_id || '').toLowerCase().includes(query) ||
      (d.Reason || d.reason || '').toLowerCase().includes(query)
    );
  }

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

  function closeModal() {
    modal.classList.remove('active');
    form.reset();
    document.getElementById('form-p-id').value = '';
    document.getElementById('plant-modal-title').textContent = 'Add New Plant';
    document.getElementById('plant-modal-submit').textContent = 'Save Plant';
  }

  addBtn.addEventListener('click', () => {
    form.reset();
    document.getElementById('form-p-id').value = '';
    document.getElementById('plant-modal-title').textContent = 'Add New Plant';
    document.getElementById('plant-modal-submit').textContent = 'Save Plant';
    document.getElementById('form-p-date').value = new Date().toISOString().split('T')[0];
    modal.classList.add('active');
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('form-p-id').value.trim();
    const plantData = {
      Section_ID: document.getElementById('form-p-sec').value.trim(),
      Staff_ID: document.getElementById('form-p-staff').value.trim(),
      System_ID: document.getElementById('form-p-sys').value.trim(),
      Name: document.getElementById('form-p-name').value.trim(),
      Date_Planted: document.getElementById('form-p-date').value,
      status: 'Healthy'
    };

    if (editId) {
      plantData.Plant_ID = editId;
      if (window.ApiClient) await window.ApiClient.updatePlant(editId, plantData);
      else window.GardenData.updateRow('PLANT', 'Plant_ID', editId, plantData);
      window.showToast(`Plant "${plantData.Name}" updated!`, 'success');
    } else {
      plantData.Plant_ID = 'P' + String(Date.now()).slice(-3);
      window.GardenData.addRow('PLANT', plantData);
      window.showToast(`Plant "${plantData.Name}" added!`, 'success');
    }

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
