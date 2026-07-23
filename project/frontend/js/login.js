/* ==========================================================================
   js/login.js — Login Screen Logic
   Stores session in localStorage and redirects user to Dashboard index.html.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim() || 'Gardener';
    const role = document.getElementById('user-role').value || 'Head Supervisor';

    const user = {
      name: username === 'admin' ? 'Ravi Kumar' : username,
      role: role,
      email: `${username.toLowerCase()}@campus.edu`
    };

    if (window.GardenData) {
      window.GardenData.setUser(user);
    } else {
      localStorage.setItem('gms_user', JSON.stringify(user));
    }

    window.location.href = 'index.html';
  });
});
