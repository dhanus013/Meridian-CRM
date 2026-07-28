let companies = [];
let pendingDeleteId = null;

async function loadCompanies(search = '') {
  try {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    companies = await apiRequest(`/companies${query}`);
    renderCompanies();
    renderStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderStats() {
  document.getElementById('statCompanies').textContent = companies.length;
  const totalContacts = companies.reduce((sum, c) => sum + Number(c.contact_count || 0), 0);
  document.getElementById('statContacts').textContent = totalContacts;
  const industries = new Set(companies.map(c => c.industry).filter(Boolean));
  document.getElementById('statIndustries').textContent = industries.size;
}

function renderCompanies() {
  const body = document.getElementById('companiesBody');
  const empty = document.getElementById('emptyState');

  if (companies.length === 0) {
    body.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  body.innerHTML = companies.map(c => `
    <tr class="ledger-row hover:bg-[#F6F5F1]/60">
      <td class="px-5 py-3 font-medium">${escapeHtml(c.name)}</td>
      <td class="px-5 py-3 text-[#6E778A]">${escapeHtml(c.industry) || '—'}</td>
      <td class="px-5 py-3 font-data text-xs text-[#6E778A]">${escapeHtml(c.website) || '—'}</td>
      <td class="px-5 py-3 font-data text-xs text-[#6E778A]">${escapeHtml(c.phone) || '—'}</td>
      <td class="px-5 py-3 text-center">
        <span class="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-[#E4F1EF] text-[#0F5C56] text-xs font-medium">${c.contact_count}</span>
      </td>
      <td class="px-5 py-3 text-right space-x-3">
        <button onclick="openEditModal(${c.id})" class="text-xs font-medium text-[#0F5C56] hover:underline">Edit</button>
        <button onclick="openDeleteModal(${c.id})" class="text-xs font-medium text-rose-700 hover:underline">Delete</button>
      </td>
    </tr>
  `).join('');
}

function openCreateModal() {
  document.getElementById('modalTitle').textContent = 'New company';
  document.getElementById('companyForm').reset();
  document.getElementById('companyId').value = '';
  openModal('companyModal');
}

function openEditModal(id) {
  const c = companies.find(x => x.id === id);
  if (!c) return;
  document.getElementById('modalTitle').textContent = 'Edit company';
  document.getElementById('companyId').value = c.id;
  document.getElementById('fName').value = c.name || '';
  document.getElementById('fIndustry').value = c.industry || '';
  document.getElementById('fWebsite').value = c.website || '';
  document.getElementById('fPhone').value = c.phone || '';
  document.getElementById('fAddress').value = c.address || '';
  openModal('companyModal');
}

function openDeleteModal(id) {
  pendingDeleteId = id;
  openModal('deleteModal');
}

document.getElementById('companyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('companyId').value;
  const payload = {
    name: document.getElementById('fName').value,
    industry: document.getElementById('fIndustry').value,
    website: document.getElementById('fWebsite').value,
    phone: document.getElementById('fPhone').value,
    address: document.getElementById('fAddress').value
  };

  try {
    if (id) {
      await apiRequest(`/companies/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Company updated');
    } else {
      await apiRequest('/companies', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Company added');
    }
    closeModal('companyModal');
    loadCompanies(document.getElementById('searchInput').value);
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!pendingDeleteId) return;
  try {
    await apiRequest(`/companies/${pendingDeleteId}`, { method: 'DELETE' });
    showToast('Company removed');
    closeModal('deleteModal');
    loadCompanies(document.getElementById('searchInput').value);
  } catch (err) {
    showToast(err.message, true);
  }
});

document.getElementById('searchInput').addEventListener('input', debounce((e) => {
  loadCompanies(e.target.value);
}, 300));

loadCompanies();
