/* ==========================================================================
   js/maintenance.js — Operations Exact Table Manager with Add/Delete
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderMaintenanceTable();
  await renderPestControlTable();
  await renderCompostBinTable();
  await renderClimateLogTable();
  await renderAppliesFertilizerTable();
  await renderAppliesPestTable();
  initTaskModal();
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

// 11. Maintenance_Schedule
async function renderMaintenanceTable() {
  const tbody = document.getElementById('tbl-maintenance-tbody');
  if (!tbody) return;

  const tasks = window.ApiClient ? await window.ApiClient.getMaintenance() : window.GardenData.getTable('MAINTENANCE_SCHEDULE');

  tbody.innerHTML = tasks.map(t => {
    const id = t.Schedule_ID || t.schedule_id || t.task_id || 'SCH01';
    const status = t.status || 'Pending';
    const task = t.task || t.title || 'Gardening Action';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><span class="badge ${status === 'Completed' ? 'badge-completed' : 'badge-warning'}">${escapeHtml(status)}</span></td>
        <td><strong>${escapeHtml(task)}</strong></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Task" onclick="deleteMaintenanceRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteMaintenanceRow = async function(id) {
  if (confirm(`Delete Maintenance Task "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteMaintenance(id);
    else window.GardenData.deleteRow('MAINTENANCE_SCHEDULE', 'Schedule_ID', id);
    window.showToast('Maintenance task deleted.', 'danger');
    await renderMaintenanceTable();
  }
};

// 10. Pest_Control
async function renderPestControlTable() {
  const tbody = document.getElementById('tbl-pest-control-tbody');
  if (!tbody) return;

  const pc = window.ApiClient ? await window.ApiClient.getPestControl() : window.GardenData.getTable('PEST_CONTROL');

  tbody.innerHTML = pc.map(item => {
    const id = item.Control_ID || item.control_id || 'PC01';
    const vendorId = item.Vendor_ID || item.vendor_id || 'V001';
    const expDate = item.exp_date || item.expDate || '2027-02-10';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><code>${escapeHtml(vendorId)}</code></td>
        <td>${escapeHtml(formatDate(expDate))}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Pest Control Record" onclick="deletePestControlRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deletePestControlRow = async function(id) {
  if (confirm(`Delete Pest Control Record "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deletePestControl(id);
    else window.GardenData.deleteRow('PEST_CONTROL', 'Control_ID', id);
    window.showToast('Pest Control record deleted.', 'danger');
    await renderPestControlTable();
  }
};

// 16. Compost_Bin
async function renderCompostBinTable() {
  const tbody = document.getElementById('tbl-compost-bin-tbody');
  if (!tbody) return;

  const bins = window.ApiClient ? await window.ApiClient.getCompost() : window.GardenData.getTable('COMPOST_BIN');

  tbody.innerHTML = bins.map(b => {
    const binId = b.Bin_ID || b.bin_id || 'BIN01';
    const secId = b.Section_ID || b.section_id || b.area_id || 'SEC01';
    const capacity = b.Capacity || b.capacity || '500 Liters';
    const type = b.type || 'Vermicompost';

    return `
      <tr>
        <td><code>${escapeHtml(binId)}</code></td>
        <td><code>${escapeHtml(secId)}</code></td>
        <td><span class="badge badge-healthy">${escapeHtml(capacity)}</span></td>
        <td>${escapeHtml(type)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Compost Bin" onclick="deleteCompostBinRow('${binId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteCompostBinRow = async function(id) {
  if (confirm(`Delete Compost Bin "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteCompost(id);
    else window.GardenData.deleteRow('COMPOST_BIN', 'Bin_ID', id);
    window.showToast('Compost bin deleted.', 'danger');
    await renderCompostBinTable();
  }
};

// 17. Climate_Log
async function renderClimateLogTable() {
  const tbody = document.getElementById('tbl-climate-log-tbody');
  if (!tbody) return;

  const logs = window.ApiClient ? await window.ApiClient.getClimate() : window.GardenData.getTable('CLIMATE_LOG');

  tbody.innerHTML = logs.map(c => {
    const date = c.date || c.log_date || '2026-07-24';
    const temp = c.temperature || c.temp || '28°C';
    const hum = c.humidity || '65%';
    const rain = c.rainfall || '0 mm';
    const wind = c.wind || '12 km/h';

    return `
      <tr>
        <td><code>${escapeHtml(formatDate(date))}</code></td>
        <td><strong>${escapeHtml(temp)}</strong></td>
        <td>${escapeHtml(hum)}</td>
        <td><span class="badge badge-healthy">${escapeHtml(rain)}</span></td>
        <td>${escapeHtml(wind)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Climate Log" onclick="deleteClimateLogRow('${date}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteClimateLogRow = async function(date) {
  if (confirm(`Delete Climate Log for "${date}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteClimate(date);
    else window.GardenData.deleteRow('CLIMATE_LOG', 'date', date);
    window.showToast('Climate log deleted.', 'danger');
    await renderClimateLogTable();
  }
};

// 19. Applies_Fertilizer
async function renderAppliesFertilizerTable() {
  const tbody = document.getElementById('tbl-applies-fert-tbody');
  if (!tbody) return;

  const list = window.ApiClient ? await window.ApiClient.getAppliesFertilizer() : window.GardenData.getTable('APPLIES_FERTILIZER');

  tbody.innerHTML = list.map(af => {
    const pId = af.Plant_ID || af.plant_id || 'P001';
    const stId = af.Staff_ID || af.staff_id || af.applied_by || 'ST001';
    const fId = af.Fertilizer_ID || af.fertilizer_id || 'F001';
    const lastDate = af.last_applies_date || af.applied_date || '2026-07-10';
    const amount = af.Amount || af.amount || '250 grams';

    return `
      <tr>
        <td><code>${escapeHtml(pId)}</code></td>
        <td><code>${escapeHtml(stId)}</code></td>
        <td><code>${escapeHtml(fId)}</code></td>
        <td>${escapeHtml(formatDate(lastDate))}</td>
        <td><span class="badge badge-completed">${escapeHtml(amount)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Record" onclick="deleteAppliesFertRow('${pId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteAppliesFertRow = async function(id) {
  if (confirm(`Delete Fertilizer Application Record for "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteAppliesFertilizer(id);
    else window.GardenData.deleteRow('APPLIES_FERTILIZER', 'Plant_ID', id);
    window.showToast('Application record deleted.', 'danger');
    await renderAppliesFertilizerTable();
  }
};

// 20. Applies_pest
async function renderAppliesPestTable() {
  const tbody = document.getElementById('tbl-applies-pest-tbody');
  if (!tbody) return;

  const list = window.ApiClient ? await window.ApiClient.getAppliesPest() : window.GardenData.getTable('APPLIES_PEST');

  tbody.innerHTML = list.map(ap => {
    const pId = ap.Plant_ID || ap.plant_id || 'P001';
    const stId = ap.Staff_ID || ap.staff_id || 'ST001';
    const pestId = ap.pest_ID || ap.pest_id || ap.control_id || 'PC01';
    const lastDate = ap.last_applies_date || ap.applied_date || '2026-07-12';
    const amount = ap.Amount || ap.amount || '100 ml';

    return `
      <tr>
        <td><code>${escapeHtml(pId)}</code></td>
        <td><code>${escapeHtml(stId)}</code></td>
        <td><code>${escapeHtml(pestId)}</code></td>
        <td>${escapeHtml(formatDate(lastDate))}</td>
        <td><span class="badge badge-warning">${escapeHtml(amount)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Record" onclick="deleteAppliesPestRow('${pId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteAppliesPestRow = async function(id) {
  if (confirm(`Delete Pest Application Record for "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteAppliesPest(id);
    else window.GardenData.deleteRow('APPLIES_PEST', 'Plant_ID', id);
    window.showToast('Pest record deleted.', 'danger');
    await renderAppliesPestTable();
  }
};

function initTaskModal() {
  const modal = document.getElementById('task-modal');
  const addBtn = document.getElementById('btn-add-task');
  const closeBtn = document.getElementById('task-modal-close');
  const cancelBtn = document.getElementById('task-modal-cancel');
  const form = document.getElementById('task-form');

  if (!modal || !addBtn) return;

  function closeModal() { modal.classList.remove('active'); form.reset(); }

  addBtn.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newTask = {
      Schedule_ID: 'SCH' + String(Date.now()).slice(-3),
      status: document.getElementById('t-status').value,
      task: document.getElementById('t-task').value.trim()
    };

    window.GardenData.addRow('MAINTENANCE_SCHEDULE', newTask);
    window.showToast(`Task scheduled!`, 'success');
    closeModal();
    await renderMaintenanceTable();
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
