/* ==========================================================================
   js/equipment.js — Equipment & Inventory Exact Table Manager with Add/Delete
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderEquipmentTable();
  await renderFertilizerTable();
  await renderVendorTable();
  await renderUsesTable();
  await renderEquipMaintainTable();
  initEquipmentModal();
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

// 4. Equipment
async function renderEquipmentTable() {
  const tbody = document.getElementById('tbl-equipment-tbody');
  if (!tbody) return;

  const eq = window.ApiClient ? await window.ApiClient.getEquipment() : window.GardenData.getTable('EQUIPMENT');

  tbody.innerHTML = eq.map(item => {
    const id = item.Equipment_ID || item.equipment_id || item.tool_id || 'EQ01';
    const vendorId = item.Vendor_ID || item.vendor_id || 'V001';
    const name = item.Name || item.name || 'Garden Tool';
    const material = item.material || 'Steel';
    const warranty = item.warranty || item.warranty_months ? item.warranty_months + ' months' : '12 months';
    const cost = item.cost || item.Cost || 0;

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><code>${escapeHtml(vendorId)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(material)}</td>
        <td>${escapeHtml(warranty)}</td>
        <td>₹${escapeHtml(cost)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Equipment" onclick="deleteEquipmentRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteEquipmentRow = async function(id) {
  if (confirm(`Delete Equipment "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteEquipment(id);
    else window.GardenData.deleteRow('EQUIPMENT', 'Equipment_ID', id);
    window.showToast('Equipment deleted.', 'danger');
    await renderEquipmentTable();
  }
};

// 5. Fertilizer
async function renderFertilizerTable() {
  const tbody = document.getElementById('tbl-fertilizer-tbody');
  if (!tbody) return;

  const fert = window.ApiClient ? await window.ApiClient.getFertilizers() : window.GardenData.getTable('FERTILIZER');

  tbody.innerHTML = fert.map(f => {
    const id = f.Fertilizer_ID || f.fertilizer_id || 'F001';
    const vendorId = f.Vendor_ID || f.vendor_id || 'V001';
    const name = f.Name || f.name || 'Organic Fertilizer';
    const nutrientType = f.nutrient_type || f.nutrientType || 'NPK';
    const stockLevel = f.stock_level || f.stockLevel || '50 kg';
    const expiryDate = f.Expiry_date || f.expiry_date || f.expiryDate || '2027-01-01';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><code>${escapeHtml(vendorId)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(nutrientType)}</td>
        <td><span class="badge badge-completed">${escapeHtml(stockLevel)}</span></td>
        <td>${escapeHtml(formatDate(expiryDate))}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Fertilizer" onclick="deleteFertilizerRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteFertilizerRow = async function(id) {
  if (confirm(`Delete Fertilizer "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteFertilizer(id);
    else window.GardenData.deleteRow('FERTILIZER', 'Fertilizer_ID', id);
    window.showToast('Fertilizer deleted.', 'danger');
    await renderFertilizerTable();
  }
};

// 8. Vendor
async function renderVendorTable() {
  const tbody = document.getElementById('tbl-vendor-tbody');
  if (!tbody) return;

  const vendors = window.ApiClient ? await window.ApiClient.getVendors() : window.GardenData.getTable('VENDOR');

  tbody.innerHTML = vendors.map(v => {
    const id = v.Vendor_ID || v.vendor_id || 'V001';
    const name = v.Name || v.name || 'Vendor Supplier';
    const contact = v.Contact || v.contact || v.contact_phone || 'N/A';
    const rating = v.performance_rating || v.rating || 4.5;
    const city = v.city || 'Hyderabad';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td>${escapeHtml(contact)}</td>
        <td><span class="badge badge-healthy"><i class="fa-solid fa-star"></i> ${escapeHtml(rating)}/5</span></td>
        <td>${escapeHtml(city)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Vendor" onclick="deleteVendorRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteVendorRow = async function(id) {
  if (confirm(`Delete Vendor "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteVendor(id);
    else window.GardenData.deleteRow('VENDOR', 'Vendor_ID', id);
    window.showToast('Vendor deleted.', 'danger');
    await renderVendorTable();
  }
};

// 21. Uses
async function renderUsesTable() {
  const tbody = document.getElementById('tbl-uses-tbody');
  if (!tbody) return;

  const uses = window.ApiClient ? await window.ApiClient.getUses() : window.GardenData.getTable('USES');

  tbody.innerHTML = uses.map(u => {
    const staffId = u.Staff_ID || u.staff_id || u.worker_id || 'ST001';
    const eqId = u.Equipment_ID || u.equipment_id || u.tool_id || 'EQ01';
    const duration = u.duration || '3 hours';

    return `
      <tr>
        <td><code>${escapeHtml(staffId)}</code></td>
        <td><code>${escapeHtml(eqId)}</code></td>
        <td><span class="badge badge-completed">${escapeHtml(duration)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Uses Record" onclick="deleteUsesRow('${staffId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteUsesRow = async function(id) {
  if (confirm(`Delete Uses record for "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteUses(id);
    else window.GardenData.deleteRow('USES', 'Staff_ID', id);
    window.showToast('Uses record deleted.', 'danger');
    await renderUsesTable();
  }
};

// 22. Equip_Maintain_by
async function renderEquipMaintainTable() {
  const tbody = document.getElementById('tbl-equip-maintain-tbody');
  if (!tbody) return;

  const maintain = window.ApiClient ? await window.ApiClient.getEquipMaintain() : window.GardenData.getTable('EQUIP_MAINTAIN_BY');

  tbody.innerHTML = maintain.map(m => {
    const schId = m.Schedule_ID || m.schedule_id || 'SCH01';
    const eqId = m.Equipment_ID || m.equipment_id || 'EQ01';
    const date = m.Date || m.date || m.log_date || '2026-06-20';
    const cost = m.Cost || m.cost || '$45';

    return `
      <tr>
        <td><code>${escapeHtml(schId)}</code></td>
        <td><code>${escapeHtml(eqId)}</code></td>
        <td>${escapeHtml(formatDate(date))}</td>
        <td><span class="badge badge-warning">${escapeHtml(cost)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Maintenance Record" onclick="deleteEquipMaintainRow('${schId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteEquipMaintainRow = async function(id) {
  if (confirm(`Delete Maintenance Record "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteEquipMaintain(id);
    else window.GardenData.deleteRow('EQUIP_MAINTAIN_BY', 'Schedule_ID', id);
    window.showToast('Maintenance Record deleted.', 'danger');
    await renderEquipMaintainTable();
  }
};

function initEquipmentModal() {
  const modal = document.getElementById('equipment-modal');
  const addBtn = document.getElementById('btn-add-equipment');
  const closeBtn = document.getElementById('eq-modal-close');
  const cancelBtn = document.getElementById('eq-modal-cancel');
  const form = document.getElementById('equipment-form');

  if (!modal || !addBtn) return;

  function closeModal() { modal.classList.remove('active'); form.reset(); }

  addBtn.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newEq = {
      Equipment_ID: 'EQ' + String(Date.now()).slice(-3),
      Vendor_ID: document.getElementById('eq-vendor').value.trim(),
      Name: document.getElementById('eq-name').value.trim(),
      material: document.getElementById('eq-material').value.trim(),
      warranty: document.getElementById('eq-warranty').value.trim(),
      cost: Number(document.getElementById('eq-cost').value)
    };

    window.GardenData.addRow('EQUIPMENT', newEq);
    window.showToast(`Equipment "${newEq.Name}" added!`, 'success');
    closeModal();
    await renderEquipmentTable();
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
