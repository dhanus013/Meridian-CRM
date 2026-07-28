let contacts = [];
let allCompanies = [];
let pendingDeleteId = null;

async function loadCompaniesForDropdowns() {
  try {
    allCompanies = await apiRequest('/companies');
    const filterSelect = document.getElementById('companyFilter');
    const formSelect = document.getElementById('fCompany');

    const options = allCompanies.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    filterSelect.insertAdjacentHTML('beforeend', options);
    formSelect.insertAdjacentHTML('beforeend', options);
  } catch (err) {
    showToast(err.message, true);
  }
}

async function loadContacts() {
  try {
    const search = document.getElementById('searchInput').value;
    const companyId = document.getElementById('companyFilter').value;
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (companyId) params.set('company_id', companyId);

    const query = params.toString() ? `?${params.toString()}` : '';
    contacts = await apiRequest(`/contacts${query}`);
    renderContacts();
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderContacts() {
  const body = document.getElementById('contactsBody');
  const empty = document.getElementById('emptyState');

  if (contacts.length === 0) {
    body.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  body.innerHTML = contacts.map(c => `
    <tr class="ledger-row hover:bg-[#F6F5F1]/60">
      <td class="px-5 py-3">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 shrink-0 rounded-full bg-[#E4F1EF] text-[#0F5C56] text-xs font-medium flex items-center justify-center">${initials(c.first_name, c.last_name)}</span>
          <span class="font-medium">${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</span>
        </div>
      </td>
      <td class="px-5 py-3 text-[#6E778A]">${escapeHtml(c.company_name) || '—'}</td>
      <td class="px-5 py-3 text-[#6E778A]">${escapeHtml(c.job_title) || '—'}</td>
      <td class="px-5 py-3 font-data text-xs text-[#6E778A]">${escapeHtml(c.email) || '—'}</td>
      <td class="px-5 py-3 font-data text-xs text-[#6E778A]">${escapeHtml(c.phone) || '—'}</td>
      <td class="px-5 py-3 text-right space-x-3">
        <button onclick="openEditModal(${c.id})" class="text-xs font-medium text-[#0F5C56] hover:underline">Edit</button>
        <button onclick="openDeleteModal(${c.id})" class="text-xs font-medium text-rose-700 hover:underline">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openCreateModal() {
  document.getElementById('modalTitle').textContent = 'New contact';
  document.getElementById('contactForm').reset();
  document.getElementById('contactId').value = '';
  openModal('contactModal');
}

function openEditModal(id) {
  const c = contacts.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalTitle').textContent = 'Edit contact';
  document.getElementById('contactId').value = c.id;
  document.getElementById('fFirstName').value = c.first_name || '';
  document.getElementById('fLastName').value = c.last_name || '';
  document.getElementById('fCompany').value = c.company_id || '';
  document.getElementById('fTitle').value = c.job_title || '';
  document.getElementById('fEmail').value = c.email || '';
  document.getElementById('fPhone').value = c.phone || '';
  document.getElementById('fNotes').value = c.notes || '';
  openModal('contactModal');
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  openModal('deleteModal');
}

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('contactId').value;
  const payload = {
    first_name: document.getElementById('fFirstName').value,
    last_name: document.getElementById('fLastName').value,
    company_id: document.getElementById('fCompany').value || null,
    job_title: document.getElementById('fTitle').value,
    email: document.getElementById('fEmail').value,
    phone: document.getElementById('fPhone').value,
    notes: document.getElementById('fNotes').value
  };

  try {
    if (id) {
      await apiRequest(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Contact updated');
    } else {
      await apiRequest('/contacts', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Contact added');
    }
    closeModal('contactModal');
    loadContacts();
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await apiRequest(`/contacts/${pendingDeleteId}`, { method: 'DELETE' });
    showToast('Contact removed');
    closeModal('deleteModal');
    loadContacts();
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('searchInput').addEventListener('input', debounce(loadContacts, 300));
document.getElementById('companyFilter').addEventListener('change', loadContacts);

(async function init() {
  await loadCompaniesForDropdowns();
  await loadContacts();
})();
