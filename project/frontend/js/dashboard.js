/* ==========================================================================
   js/dashboard.js — Dashboard Page Logic (Live PostgreSQL Counts & Shortcuts)
   Renders live metrics, recent plant additions, and urgent tasks.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  if (window.ApiClient) await window.ApiClient.checkHealth();
  await renderDashboard();
  initQuickAddModal();
  document.getElementById('search-dash-plants')?.addEventListener('input', renderDashboard);
});

// Render Dashboard Data
async function renderDashboard() {
  if (!window.GardenData) return;

  const plants = window.ApiClient ? await window.ApiClient.getPlants() : window.GardenData.getTable('PLANT');
  const sections = window.ApiClient ? await window.ApiClient.getSections() : window.GardenData.getTable('GARDEN_SECTION');
  const staff = window.ApiClient ? await window.ApiClient.getStaff() : window.GardenData.getTable('STAFF');
  const tasks = window.ApiClient ? await window.ApiClient.getMaintenance() : window.GardenData.getTable('MAINTENANCE_SCHEDULE');

  // Update Stat Counters
  document.getElementById('stat-total-plants').textContent = plants.length || 0;
  document.getElementById('stat-total-sections').textContent = sections.length || 0;
  document.getElementById('stat-total-staff').textContent = staff.length || 0;
  
  const pendingCount = tasks.filter(t => (t.status || 'Pending') === 'Pending').length;
  document.getElementById('stat-pending-tasks').textContent = pendingCount;

  // Render Recent Plants Table (Top 5 or filtered)
  const recentTable = document.getElementById('recent-plants-tbody');
  const dashQuery = (document.getElementById('search-dash-plants')?.value || '').toLowerCase().trim();
  let filteredPlants = dashQuery ? plants.filter(p => (p.Name || p.name || '').toLowerCase().includes(dashQuery) || (p.Section_ID || p.section_id || '').toLowerCase().includes(dashQuery)) : plants.slice(0, 5);

  if (filteredPlants.length === 0) {
    recentTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">No matching plants.</td></tr>`;
  } else {
    recentTable.innerHTML = filteredPlants.map(plant => `
      <tr>
        <td><strong>${escapeHtml(plant.Name || plant.name || 'Plant')}</strong></td>
        <td><span class="badge badge-completed">${escapeHtml(plant.category || 'Flower')}</span></td>
        <td><code>${escapeHtml(plant.Section_ID || plant.section_id || plant.area_id || 'SEC01')}</code></td>
        <td><span class="badge badge-healthy">${escapeHtml(plant.status || 'Healthy')}</span></td>
      </tr>
    `).join('');
  }

  // Render Urgent Tasks Table (Pending Tasks)
  const urgentTable = document.getElementById('urgent-tasks-tbody');
  const urgentTasks = tasks.filter(t => (t.status || 'Pending') === 'Pending').slice(0, 5);

  if (urgentTasks.length === 0) {
    urgentTable.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending tasks right now! 🎉</td></tr>`;
  } else {
    urgentTable.innerHTML = urgentTasks.map(task => `
      <tr>
        <td><strong>${escapeHtml(task.task || task.title)}</strong></td>
        <td><code>${escapeHtml(task.Schedule_ID || task.schedule_id || task.task_id || 'SCH')}</code></td>
        <td><span class="badge badge-warning">High</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="completeDashboardTask('${task.Schedule_ID || task.schedule_id || task.task_id}')">
            <i class="fa-solid fa-check"></i> Done
          </button>
        </td>
      </tr>
    `).join('');
  }
}

// Complete task from Dashboard
window.completeDashboardTask = async function(taskId) {
  if (window.ApiClient) {
    await window.ApiClient.deleteMaintenance(taskId);
  } else {
    window.GardenData.deleteRow('MAINTENANCE_SCHEDULE', 'Schedule_ID', taskId);
  }
  window.showToast('Task marked as completed!', 'success');
  await renderDashboard();
};

// Quick Add Plant Modal Handler
function initQuickAddModal() {
  const modal = document.getElementById('quick-add-modal');
  const openBtn = document.getElementById('btn-quick-add');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('quick-add-form');

  if (!modal || !openBtn) return;

  function openModal() { modal.classList.add('active'); }
  function closeModal() { modal.classList.remove('active'); form.reset(); }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPlant = {
      Plant_ID: 'P' + String(Date.now()).slice(-3),
      Name: document.getElementById('plant-name').value.trim(),
      Section_ID: 'SEC01',
      Staff_ID: 'ST001',
      System_ID: 'IS01',
      Date_Planted: new Date().toISOString().split('T')[0],
      status: document.getElementById('plant-status').value
    };

    window.GardenData.addRow('PLANT', newPlant);
    window.showToast(`Plant "${newPlant.Name}" added successfully!`, 'success');
    closeModal();
    await renderDashboard();
  });
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, match => {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return map[match];
  });
}
