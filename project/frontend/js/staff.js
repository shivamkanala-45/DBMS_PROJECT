/* ==========================================================================
   js/staff.js — Staff & Security Exact Table Manager with Add/Delete
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  initTabs();
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderStaffTable();
  await renderSecurityTable();
  await renderWorkshopTable();
  await renderAttendsTable();
  initStaffModal();
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

// 3. Staff
async function renderStaffTable() {
  const tbody = document.getElementById('tbl-staff-tbody');
  if (!tbody) return;

  const staff = window.ApiClient ? await window.ApiClient.getStaff() : window.GardenData.getTable('STAFF');

  if (staff.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No staff records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = staff.map(st => {
    const id = st.Staff_ID || st.staff_id || st.worker_id || 'ST001';
    const name = st.Name || st.name || st.full_name || 'Staff Member';
    const role = st.role || 'Gardener';
    const dob = st.DOB || st.dob || st.date_of_birth || '1990-01-01';
    const contact = st.contact || st.contact_phone || 'N/A';
    const salary = st.salary || 30000;

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><strong>${escapeHtml(name)}</strong></td>
        <td><span class="badge badge-healthy">${escapeHtml(role)}</span></td>
        <td>${escapeHtml(formatDate(dob))}</td>
        <td>${escapeHtml(contact)}</td>
        <td>₹${escapeHtml(salary)}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Staff" onclick="deleteStaffRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteStaffRow = async function(id) {
  if (confirm(`Delete Staff Member "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteStaff(id);
    else window.GardenData.deleteRow('STAFF', 'Staff_ID', id);
    window.showToast('Staff member deleted.', 'danger');
    await renderStaffTable();
  }
};

// 14. Security_Group
async function renderSecurityTable() {
  const tbody = document.getElementById('tbl-security-tbody');
  if (!tbody) return;

  const sec = window.ApiClient ? await window.ApiClient.getSecurity() : window.GardenData.getTable('SECURITY_GROUP');

  tbody.innerHTML = sec.map(s => {
    const id = s.Security_ID || s.security_id || 'SG01';
    const count = s.Number_of_Guard || s.number_of_guard || s.guards || 4;
    const shift = s.Shift || s.shift || 'Morning';

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><strong>${escapeHtml(count)} Guards</strong></td>
        <td><span class="badge badge-completed">${escapeHtml(shift)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Security Group" onclick="deleteSecurityRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteSecurityRow = async function(id) {
  if (confirm(`Delete Security Group "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteSecurity(id);
    else window.GardenData.deleteRow('SECURITY_GROUP', 'Security_ID', id);
    window.showToast('Security group deleted.', 'danger');
    await renderSecurityTable();
  }
};

// 9. Workshop
async function renderWorkshopTable() {
  const tbody = document.getElementById('tbl-workshop-tbody');
  if (!tbody) return;

  const ws = window.ApiClient ? await window.ApiClient.getWorkshops() : window.GardenData.getTable('WORKSHOP');

  tbody.innerHTML = ws.map(w => {
    const id = w.Workshop_ID || w.workshop_id || w.event_id || 'WS01';
    const topic = w.Topic || w.topic || w.title || 'Composting Basics';
    const date = w.Date || w.date || w.event_date || '2026-08-05';
    const duration = w.Duration || w.duration || '2 hours';
    const fees = w.fees !== undefined ? w.fees : (w.fee || '$0');

    return `
      <tr>
        <td><code>${escapeHtml(id)}</code></td>
        <td><strong>${escapeHtml(topic)}</strong></td>
        <td>${escapeHtml(formatDate(date))}</td>
        <td>${escapeHtml(duration)}</td>
        <td><span class="badge badge-healthy">${escapeHtml(fees)}</span></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Workshop" onclick="deleteWorkshopRow('${id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteWorkshopRow = async function(id) {
  if (confirm(`Delete Workshop "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteWorkshop(id);
    else window.GardenData.deleteRow('WORKSHOP', 'Workshop_ID', id);
    window.showToast('Workshop deleted.', 'danger');
    await renderWorkshopTable();
  }
};

// 18. Attends
async function renderAttendsTable() {
  const tbody = document.getElementById('tbl-attends-tbody');
  if (!tbody) return;

  const attends = window.ApiClient ? await window.ApiClient.getAttends() : window.GardenData.getTable('ATTENDS');

  tbody.innerHTML = attends.map(a => {
    const stId = a.Staff_ID || a.staff_id || 'ST001';
    const wsId = a.Workshop_ID || a.workshop_id || 'WS01';

    return `
      <tr>
        <td><code>${escapeHtml(stId)}</code></td>
        <td><code>${escapeHtml(wsId)}</code></td>
        <td>
          <button class="btn btn-danger btn-sm btn-icon" title="Delete Attendance" onclick="deleteAttendsRow('${stId}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteAttendsRow = async function(id) {
  if (confirm(`Delete Attendance record for "${id}"?`)) {
    if (window.ApiClient) await window.ApiClient.deleteAttends(id);
    else window.GardenData.deleteRow('ATTENDS', 'Staff_ID', id);
    window.showToast('Attendance record deleted.', 'danger');
    await renderAttendsTable();
  }
};

function initStaffModal() {
  const modal = document.getElementById('staff-modal');
  const addBtn = document.getElementById('btn-add-staff');
  const closeBtn = document.getElementById('staff-modal-close');
  const cancelBtn = document.getElementById('staff-modal-cancel');
  const form = document.getElementById('staff-form');

  if (!modal || !addBtn) return;

  function closeModal() { modal.classList.remove('active'); form.reset(); }

  addBtn.addEventListener('click', () => modal.classList.add('active'));
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newMember = {
      Staff_ID: 'ST' + String(Date.now()).slice(-3),
      Name: document.getElementById('st-name').value.trim(),
      role: document.getElementById('st-role').value,
      DOB: document.getElementById('st-dob').value,
      contact: document.getElementById('st-contact').value.trim(),
      salary: Number(document.getElementById('st-salary').value)
    };

    window.GardenData.addRow('STAFF', newMember);
    window.showToast(`Staff member "${newMember.Name}" added!`, 'success');
    closeModal();
    await renderStaffTable();
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
