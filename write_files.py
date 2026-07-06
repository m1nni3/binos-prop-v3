#!/usr/bin/env python3
import os

base = "/Users/m1nni3/Library/Application Support/Jan/data/new copy/routes"
os.makedirs(base, exist_ok=True)

contacts = """import { apiClient, escHtml } from '../lib/utils.js';
import { ICONS } from '../lib/icons.js';
import { toast } from '../lib/toast.js';

const PROPERTY_COLORS = {
  Oakdale: 'blue',
  Malindi: 'green',
  Indaba: 'purple',
  Villeroy: 'orange',
};

export function renderContacts(container) {
  let state = {
    contacts: [],
    filterProp: 'all',
    filterRole: 'all',
    filterCompany: 'all',
    showForm: false,
    editingId: null,
    form: {
      name: '', role: '', company: '', office: '', phone: '', office_number: '',
      email: '', address: '', website: '', category: '', notes: '', property_id: null,
      applyOffice: false,
    },
    page: 1,
    pageSize: 12,
    loading: true,
    error: null,
    properties: [],
    showDeleteConfirm: null,
    saving: false,
  };

  let urlPropertyId = null;

  async function loadData() {
    try {
      state.loading = true;
      state.error = null;
      const [contactsData, propertiesData] = await Promise.all([
        apiClient.get('/contacts'),
        apiClient.get('/properties'),
      ]);
      state.contacts = Array.isArray(contactsData) ? contactsData : [];
      state.properties = propertiesData || [];
      state.loading = false;
      render();
    } catch (err) {
      state.error = err.message;
      state.loading = false;
      render();
    }
  }

  function uniqueValues(field) {
    return [...new Set(state.contacts.map(c => c[field]).filter(Boolean))].sort();
  }

  function getFilteredContacts() {
    return state.contacts.filter(contact => {
      const matchesProp = state.filterProp === 'all' || contact.property_id == state.filterProp;
      const matchesRole = state.filterRole === 'all' || contact.role === state.filterRole;
      const matchesCompany = state.filterCompany === 'all' || contact.company === state.filterCompany;
      return matchesProp && matchesRole && matchesCompany;
    });
  }

  function getPaginatedContacts() {
    const filtered = getFilteredContacts();
    const total = filtered.length;
    const start = (state.page - 1) * state.pageSize;
    return { contacts: filtered.slice(start, start + state.pageSize), total, hasPrev: state.page > 1, hasNext: state.page * state.pageSize < total };
  }

  function showFormFn() {
    state.showForm = true;
    state.editingId = null;
    state.form = { name: '', role: '', company: '', office: '', phone: '', office_number: '', email: '', address: '', website: '', category: '', notes: '', property_id: null, applyOffice: false };
    if (urlPropertyId) state.form.property_id = urlPropertyId;
    render();
  }

  function editContact(id) {
    const contact = state.contacts.find(c => c.id === id);
    if (!contact) return;
    state.showForm = true;
    state.editingId = id;
    state.form = { ...contact, applyOffice: false };
    render();
  }

  function deleteContactFn(id) {
    state.showDeleteConfirm = id;
    render();
  }

  async function confirmDelete(id) {
    state.showDeleteConfirm = null;
    if (!id) return;
    try {
      await apiClient.del('/contacts/' + id);
      state.contacts = state.contacts.filter(c => c.id !== id);
      render();
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  }

  function closeForm() {
    state.showForm = false;
    state.editingId = null;
    state.form = { name: '', role: '', company: '', office: '', phone: '', office_number: '', email: '', address: '', website: '', category: '', notes: '', property_id: null, applyOffice: false };
    render();
  }

  async function saveContact() {
    if (!state.form.name) return;
    state.saving = true;
    try {
      const body = { ...state.form };
      delete body.applyOffice;
      if (state.editingId) {
        await apiClient.put('/contacts/' + state.editingId, body);
      } else {
        await apiClient.post('/contacts', body);
      }
      if (state.form.applyOffice && state.form.office) {
        const officeKey = state.form.office.trim();
        const batchUpdates = state.contacts
          .filter(c => c.office === officeKey && c.id !== state.editingId)
          .map(c => apiClient.put('/contacts/' + c.id, { ...c, address: state.form.address || c.address, website: state.form.website || c.website, office_number: state.form.office_number || c.office_number }));
        await Promise.allSettled(batchUpdates);
      }
      state.saving = false;
      closeForm();
      await loadData();
    } catch (err) {
      toast.error('Failed to save contact');
      state.saving = false;
      render();
    }
  }

  function exportCSV() {
    const headers = ['Name', 'Role', 'Company', 'Office', 'Phone', 'Office Number', 'Email', 'Address', 'Website', 'Category', 'Property', 'Notes'];
    const rows = state.contacts.map(c => {
      const property = state.properties.find(p => p.id == c.property_id);
      return [c.name, c.role || '', c.company || '', c.office || '', c.phone || '', c.office_number || '', c.email || '', c.address || '', c.website || '', c.category || '', property?.scheme_name || '', c.notes || ''];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(cell => '"' + String(cell).replace(/"/g, '""') + '"').join(','))].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function render() {
    const paginated = getPaginatedContacts();
    const roles = uniqueValues('role');
    const companies = uniqueValues('company');

    let html = '<div class="flex flex-col h-full">';
    if (state.loading) {
      html += '<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>';
    }
    if (state.error) {
      html += '<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mx-5 mt-5"><div class="font-medium mb-1">Error</div><div class="text-sm">' + state.error + '</div></div>';
    }
    if (!state.loading && !state.error) {
      html += '<div class="px-5 py-4 border-b border-binos-border bg-white"><div class="flex flex-wrap items-center justify-between gap-4"><div class="flex flex-wrap items-center gap-3">' +
        '<select class="select-field py-2 pr-8 text-sm" data-filter-prop><option value="all">All Properties</option>' + state.properties.map(p => '<option value="' + p.id + '" ' + (state.filterProp == p.id ? 'selected' : '') + '>' + escHtml(p.scheme_name) + '</option>').join('') + '</select>' +
        '<select class="select-field py-2 pr-8 text-sm" data-filter-role><option value="all">All Roles</option>' + roles.map(r => '<option value="' + escHtml(r) + '" ' + (state.filterRole === r ? 'selected' : '') + '>' + escHtml(r) + '</option>').join('') + '</select>' +
        '<select class="select-field py-2 pr-8 text-sm" data-filter-company><option value="all">All Companies</option>' + companies.map(c => '<option value="' + escHtml(c) + '" ' + (state.filterCompany === c ? 'selected' : '') + '>' + escHtml(c) + '</option>').join('') + '</select>' +
        '</div><div class="flex items-center gap-3"><button class="btn-primary btn-sm" data-show-form><span class="mr-1">' + ICONS.plus + '</span> Add Contact</button>' +
        '<button class="btn-secondary btn-sm" data-export-csv><span class="mr-1">' + ICONS.download + '</span> Export CSV</button></div></div></div>' +
        '<div class="flex-1 overflow-auto"><div class="p-5">' +(paginated.contacts.length === 0 ? '<div class="p-8 bg-gray-50 rounded-lg border text-center"><div class="text-binos-gray">No contacts found</div></div>' : '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' + paginated.contacts.map(contactCard).join('') + '</div>') + '</div></div>';
      if (paginated.total > 0) {
        html += '<div class="px-5 py-4 border-t border-binos-border bg-white flex items-center justify-between text-sm"><span class="text-binos-gray">Showing ' + ((state.page - 1) * state.pageSize + 1) + '-' + Math.min(state.page * state.pageSize, paginated.total) + ' of ' + paginated.total + '</span>' +
          '<div class="flex gap-2"><button class="btn-secondary btn-sm" ' + (!paginated.hasPrev ? 'disabled' : '') + ' data-prev-page>Previous</button>' +
          '<button class="btn-secondary btn-sm" ' + (!paginated.hasNext ? 'disabled' : '') + ' data-next-page>Next</button></div></div>';
      }
    }
    html += renderFormModal();
    html += renderDeleteModal();
    html += '</div>';
    container.innerHTML = html;
    attachEvents();
  }

  function contactCard(contact) {
    const property = state.properties.find(p => p.id == contact.property_id);
    const colorClass = property ? (PROPERTY_COLORS[property.scheme] || 'blue') : 'blue';
    return '<div class="card p-4 hover:shadow-card-hover transition-shadow border-l-4 border-' + colorClass + '-500">' +
      '<div class="flex items-start justify-between mb-2"><div class="flex items-center gap-3 min-w-0">' +
      '<div class="w-10 h-10 rounded-full bg-' + colorClass + '-100 flex items-center justify-center flex-shrink-0">' +
      '<svg class=" superficial use h-5 text-' + colorClass + '-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>' +
      '<div class="min-w-0"><h3 class="font-display font-medium leading-tight truncate">' + escHtml(contact.name) + '</h3>' + (contact.role ? '<div class="text-xs text-binos-gray truncate">' + escHtml(contact.role) + '</div>' : '') + '</div></div>' +
      (contact.category ? '<span class="badge badge-blue flex-shrink-0">' + escHtml(contact.category) + '</span>' : '') + '</div>' + 
      '<div class="space-y-1.5 text-sm">' +
      (contact.company ? '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg><span>' + escHtml(contact.company) + (contact.office ? ' <span class="text-binos-gray/60">/</span> ' + escHtml(contact.office) : '') + '</span></div>' : '') +
      (property ? '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg><span>' + escHtml(property.scheme_name) + '</span></div>' : '') +
      (contact.phone ? '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><a href="tel:' + escHtml(contact.phone) + '" class="hover:text-binos-blue transition-colors">' + escHtml(contact.phone) + '</a></div>' : '') +
      (contact.email ? '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:' + escHtml(contact.email) + '" class="hover:text-binos-blue transition-colors truncate">' + escHtml(contact.email) + '</a></div>' : '') +
      (contact.address ? '<div class="flex items-start gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span class="text-xs">' + escHtml(contact.address) + '</span></div>' : '') +
      (contact.website ? '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg><a href="' + escHtml(contact.website) + '" target="_blank" rel="noopener noreferrer" class="hover:text-binos-blue transition-colors truncate">' + escHtml(contact.website) + '</a></div>' : '') +
      '</div>' +
      '<div class="mt-3 flex gap-2"><button class="btn-secondary btn-sm py-1.5 px-3" data-edit-contact="' + contact.id + '">Edit</button>' +
      '<button class="btn-danger btn-sm py-1.5 px-3" data-delete-contact="' + contact.id + '">Delete</button></div></div>';
  }

  function renderFormModal() {
    if (!state.showForm) return '';
    return '<div class="modal-overlay" data-close-form><div class="modal-content max-w-2xl">' +
      '<div class="card-header"><h3 class="font-display font-semibold">' + (state.editingId ? 'Edit Contact' : 'Add New Contact') + '</h3>' +
      '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-close-form><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>' +
      '<div class="card-body"><div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
      '<div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Name *</label><input type="text" class="input-field" data-form-field="name" value="' + escHtml(state.form.name) + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Role / Job Title</label><input type="text" class="input-field" data-form-field="role" value="' + escHtml(state.form.role || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label>' +
      '<select class="select-field" data-form-field="category"><option value="">Select category</option><option value="owner" ' + (state.form.category === 'owner' ? 'selected' : '') + '>Owner</option><option value="secondary" ' + (state.form.category === 'secondary' ? 'selected' : '') + '>Secondary</option><option value="technician" ' + (state.form.category === 'technician' ? 'selected' : '') + '>Technician</option><option value="provider" ' + (state.form.category === 'provider' ? 'selected' : '') + '>Provider</option><option value="company" ' + (state.form.category === 'company' ? 'selected' : '') + '>Company</option></select></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Company</label><input type="text" class="input-field" data-form-field="company" value="' + escHtml(state.form.company || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office</label><input type="text" class="input-field" placeholder="e.g. Durban, Cape Town" data-form-field="office" value="' + escHtml(state.form.office || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text reactive-binos-gray mb-1.5">Telephone</label><input type="tel" class="input-field" data-form-field="phone" value="' + escHtml(state.form.phone || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office Number</label><input type="tel" class="input-field" data-form-field="office_number" value="' + escHtml(state.form.office_number || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field" data-form-field="email" value="' + escHtml(state.form.email || '') + '"></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label><select class="select-field" data-form-field="property_id"><option value="">Select property</option>' + state.properties.map(p => '<option value="' + p.id + '" ' + (state.form.property_id == p.id ? 'selected' : '') + '>' + escHtml(p.scheme_name) + '</option>').join('') + '</select></div>' +
      '<div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Address</label><input type="text" class="input-field" data-form-field="address" value="' + escHtml(state.form.address || '') + '"></div>' +
      '<div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Website</label><input type="url" class="input-field" data-form-field="website" value="' + escHtml(state.form.website || '') + '"></div>' +
      '<div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]" data-form-field="notes">' + escHtml(state.form.notes || '') + '</textarea></div>' +
      (state.form.office ? '<div class="md:col-span-2 pt-2 border-t border-binos-border/50"><label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" class="mt-0.5 rounded border-binos-border text-binos-blue focus:ring-binos-blue/30" data-form-field="applyOffice" ' + (state.form.applyOffice ? 'checked' : '') + '><div><div class="text-sm font-medium text-binos-navy">Apply to all contacts from this office</div><div class="text-xs text-binos-gray">Update address, website, and office number for all contacts with the same office (' + escHtml(state.form.office) + ')</div></div></label></div>' : '') +
      '</div><div class="flex gap-3 pt-6"><button class="btn-secondary flex-1" data-close-form>Cancel</button><button class="btn-primary flex-1" data-save-contact ' + (!state.form.name ? 'disabled' : '') + '>Save Contact</button></div></div></div></div>';
  }

  function renderDeleteModal() {
    if (!state.showDeleteConfirm) return '';
    return '<div class="modal-overlay" data-cancel-delete><div class="modal-content max-w-md">' +
      '<div class="p-6"><div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></div>' +
      '<h3 class="font-display font-semibold text-center mb-2">Delete Contact</h3>' +
      '<p class="text-binos-gray text-sm text-center mb-6">Are you sure you want to delete <span class="font-medium text-binos-navy">' + escHtml(state.contacts.find(c => c.id === state.showDeleteConfirm)?.name || '') + '</span>? This action cannot be undone.</p>' +
      '<div class="flex gap-3"><button class="btn-secondary flex-1" data-cancel-delete>Cancel</button><button class="btn-danger flex-1" data-confirm-delete="' + state.showDeleteConfirm + '">Delete</button></div></div></div></div>';
  }

  function attachEvents() {
    container.querySelectorAll('[data-filter-prop]').forEach(el => {
      el.onchange = () => { state.filterProp = el.value; state.page = 1; render(); };
    });
    container.querySelectorAll('[data-filter-role]').forEach(el => {
      el.onchange = () => { state.filterRole = el.value; state.page = 1; render(); };
    });
    container.querySelectorAll('[data-filter-company]').forEach(el => {
      el.onchange = () => { state.filterCompany = el.value; state.page = 1; render(); };
    });
    container.querySelectorAll('[data-prev-page]').forEach(el => {
      el.onclick = () => { if (state.page > 1) { state.page--; render(); } };
    });
    container.querySelectorAll('[data-next-page]').forEach(el => {
      el.onclick = () => { if (state.page * state.pageSize < paginated.total) { state.page++; render(); } };
    });
    container.querySelectorAll('[data-show-form]').forEach(el => {
      el.onclick = () => showFormFn();
    });
    container.querySelectorAll('[data-export-csv]').forEach(el => {
      el.onclick = () => exportCSV();
    });
    container.querySelectorAll('[data-edit-contact]').forEach(el => {
      el.onclick = () => editContact(parseInt(el.getAttribute('data-edit-contact')));
    });
    container.querySelectorAll('[data-delete-contact]').forEach(el => {
      el.onclick = () => deleteContactFn(parseInt(el.getAttribute('data-delete-contact')));
    });
    container.querySelectorAll('[data-close-form]').forEach(el => {
      el.onclick = () => closeForm();
    });
    container.querySelectorAll('[data-save-contact]').forEach(el => {
      el.onclick = () => saveContact();
    });
    container.querySelectorAll('[data-confirm-delete]').forEach(el => {
      el.onclick = () => confirmDelete(parseInt(el.getAttribute('data-confirm-delete')));
    });
    container.querySelectorAll('[data-cancel-delete]').forEach(el => {
      el.onclick = () => { state.showDeleteConfirm = null; render(); };
    });
    container.querySelectorAll('[data-form-field]').forEach(el => {
      const field = el.getAttribute('data-form-field');
      if (el.type === 'checkbox') {
        el.onchange = () => { state.form[field] = el.checked; render(); };
      } else {
        el.onchange = () => { state.form[field] = el.value; render(); };
      }
    });
  }

  loadData();
}
"""

with open(os.path.join(base, 'contacts.js'), 'w') as f:
    f.write(contacts)

print("Wrote contacts.js")
