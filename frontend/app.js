// Shared helpers used by companies.js and contacts.js

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (res.status === 204) return null;

  let body = null;
  try {
    body = await res.json();
  } catch (_) {
    // no JSON body (e.g. plain error)
  }

  if (!res.ok) {
    throw new Error((body && body.error) || `Request failed (${res.status})`);
  }
  return body;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `fixed bottom-6 right-6 px-4 py-3 rounded-md shadow-lg text-sm font-medium z-50 transition-opacity duration-200 ${
    isError ? 'bg-rose-700 text-white' : 'bg-[#1C2333] text-white'
  }`;
  toast.classList.remove('hidden', 'opacity-0');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.classList.add('opacity-0');
    setTimeout(() => toast.classList.add('hidden'), 200);
  }, 2600);
}

function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function openModal(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  requestAnimationFrame(() => el.classList.remove('opacity-0'));
}

function closeModal(id) {
  const el = document.getElementById(id);
  el.classList.add('opacity-0');
  setTimeout(() => el.classList.add('hidden'), 150);
}

function initials(first, last) {
  return `${(first || '?')[0] || ''}${(last || '')[0] || ''}`.toUpperCase();
}
