/* ==========================================================================
   js/main.js — Common UI Logic & Navigation Manager
   Handles mobile sidebar menu, active link highlighting, user header info,
   and visual toast notifications.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initUserSession();
  highlightActiveNav();
});

// Sidebar Mobile Toggle & Responsiveness
function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('sidebar-overlay');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');

  if (mobileBtn && sidebar && overlay) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  }

  if (collapseBtn && sidebar) {
    collapseBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

// User Profile & Logout Handling
function initUserSession() {
  const user = window.GardenData ? window.GardenData.getUser() : null;
  const userNameEl = document.getElementById('topbar-user-name');
  const userRoleEl = document.getElementById('topbar-user-role');
  const logoutBtn = document.getElementById('logout-btn');

  if (user) {
    if (userNameEl) userNameEl.textContent = user.name || 'Gardener';
    if (userRoleEl) userRoleEl.textContent = user.role || 'Supervisor';
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('gms_user');
        window.location.href = 'login.html';
      }
    });
  }
}

// Active Nav Link Highlighting
function highlightActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-item');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? 'fa-circle-check' : (type === 'danger' ? 'fa-circle-exclamation' : 'fa-info-circle');
  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

window.showToast = showToast;
