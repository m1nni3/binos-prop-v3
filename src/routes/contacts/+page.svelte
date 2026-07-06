<script lang="ts">
  import { apiClient, escHtml, exportCSV } from '$lib/api';
  import { ICONS } from '$lib/icons';
  import { toast } from '$lib/stores';

  let state = $state({
    contacts: [] as any[], filterProp: 'all', filterRole: 'all', filterCompany: 'all',
    showForm: false, editingId: null as number | null, page: 1, pageSize: 12, loading: true, error: null as string | null, properties: [] as any[], showDeleteConfirm: null as number | null,
    form: { name: '', role: '', company: '', office: '', phone: '', office_number: '', email: '', address: '', website: '', category: '', notes: '', property_id: null as string | null, applyOffice: false },
  });

  async function loadData() {
    try {
      state = { ...state, loading: true, error: null };
      const [contactsData, propertiesData] = await Promise.all([apiClient.get('/contacts'), apiClient.get('/properties')]);
      state = { ...state, contacts: Array.isArray(contactsData) ? contactsData : [], properties: propertiesData || [], loading: false };
    } catch (err: any) { state = { ...state, error: err.message, loading: false }; }
  }

  function uniqueValues(field: string) { return [...new Set(state.contacts.map(c => c[field]).filter(Boolean))].sort(); }

  function getFiltered() {
    return state.contacts.filter(c =>
      (state.filterProp === 'all' || c.property_id == state.filterProp) &&
      (state.filterRole === 'all' || c.role === state.filterRole) &&
      (state.filterCompany === 'all' || c.company === state.filterCompany));
  }

  function getPaginated() { const f = getFiltered(), s = (state.page - 1) * state.pageSize; return { contacts: f.slice(s, s + state.pageSize), total: f.length, hasPrev: state.page > 1, hasNext: state.page * state.pageSize < f.length }; }

  function showForm() { state = { ...state, showForm: true, editingId: null, form: { name: '', role: '', company: '', office: '', phone: '', office_number: '', email: '', address: '', website: '', category: '', notes: '', property_id: null, applyOffice: false } }; }
  function editContact(id: number) { const c = state.contacts.find(x => x.id === id); if (c) state = { ...state, showForm: true, editingId: id, form: { ...c, applyOffice: false } }; }
  function deleteContact(id: number) { state = { ...state, showDeleteConfirm: id }; }
  async function confirmDelete(id: number) { state = { ...state, showDeleteConfirm: null }; try { await apiClient.del('/contacts/' + id); state.contacts = state.contacts.filter(c => c.id !== id); } catch { toast('error', 'Failed to delete contact'); } }
  function closeForm() { state = { ...state, showForm: false, editingId: null, form: { name: '', role: '', company: '', office: '', phone: '', office_number: '', email: '', address: '', website: '', category: '', notes: '', property_id: null, applyOffice: false } }; }
  async function saveContact() {
    if (!state.form.name) return;
    try {
      const body = { ...state.form }; delete (body as any).applyOffice;
      if (state.editingId) await apiClient.put('/contacts/' + state.editingId, body);
      else await apiClient.post('/contacts', body);
      if (state.form.applyOffice && state.form.office) {
        const officeKey = state.form.office.trim();
        await Promise.allSettled(state.contacts.filter(c => c.office === officeKey && c.id !== state.editingId).map(c => apiClient.put('/contacts/' + c.id, { ...c, address: state.form.address || c.address, website: state.form.website || c.website, office_number: state.form.office_number || c.office_number })));
      }
      closeForm(); await loadData();
    } catch { toast('error', 'Failed to save contact'); }
  }

  loadData();
</script>

<div class="flex flex-col h-full">
  {#if state.loading}
    <div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>
  {:else if state.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mx-5 mt-5"><div class="font-medium mb-1">Error loading contacts</div><div class="text-sm">{state.error}</div></div>
  {:else}
    <div class="px-5 py-4 border-b border-binos-border bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <select class="select-field py-2 pr-8 text-sm" bind:value={state.filterProp} onchange={() => { state.page = 1; }}><option value="all">All Properties</option>{#each state.properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}</select>
          <select class="select-field py-2 pr-8 text-sm" bind:value={state.filterRole} onchange={() => { state.page = 1; }}><option value="all">All Roles</option>{#each uniqueValues('role') as r}<option value={r}>{r}</option>{/each}</select>
          <select class="select-field py-2 pr-8 text-sm" bind:value={state.filterCompany} onchange={() => { state.page = 1; }}><option value="all">All Companies</option>{#each uniqueValues('company') as c}<option value={c}>{c}</option>{/each}</select>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn-primary btn-sm" onclick={showForm}><span class="mr-1">{@html ICONS.plus}</span> Add Contact</button>
          <button class="btn-secondary btn-sm" onclick={() => exportCSV(['Name','Role','Company','Office','Phone','Office Number','Email','Address','Website','Category','Property','Notes'], state.contacts.map(c => { const p = state.properties.find(x => x.id == c.property_id); return [c.name, c.role||'', c.company||'', c.office||'', c.phone||'', c.office_number||'', c.email||'', c.address||'', c.website||'', c.category||'', p?.scheme_name||'', c.notes||'']; }), 'contacts.csv')}>
            <span class="mr-1">{@html ICONS.download}</span> Export CSV
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div class="p-5">
        {#each getPaginated().contacts as c (c.id)}
          {@const property = state.properties.find(p => p.id == c.property_id)}
          <div class="card p-4 mb-4 hover:shadow-card-hover transition-shadow border-l-4 border-{property ? (['Oakdale','Malindi','Indaba','Villeroy'].includes(property.scheme) ? ({Oakdale:'blue',Malindi:'green',Indaba:'purple',Villeroy:'orange'} as any)[property.scheme] : 'blue') : 'blue'}-500">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div>
                <div class="min-w-0"><h3 class="font-display font-medium leading-tight truncate">{escHtml(c.name)}</h3>{#if c.role}<div class="text-xs text-binos-gray truncate">{escHtml(c.role)}</div>{/if}</div></div>
              {#if c.category}<span class="badge badge-blue flex-shrink-0">{escHtml(c.category)}</span>{/if}
            </div>
            <div class="mt-3 flex gap-2">
              <button class="btn-secondary btn-sm py-1.5 px-3" onclick={() => editContact(c.id)}>Edit</button>
              <button class="btn-danger btn-sm py-1.5 px-3" onclick={() => deleteContact(c.id)}>Delete</button>
            </div>
          </div>
        {:else}
          <div class="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center"><div class="text-binos-gray">No contacts found</div></div>
        {/each}
      </div>
    </div>

    {#if getPaginated().total > 0}
      <div class="px-5 py-4 border-t border-binos-border bg-white"><div class="flex items-center justify-between"><span class="text-sm text-binos-gray">Showing {(state.page-1)*state.pageSize+1}-{Math.min(state.page*state.pageSize, getPaginated().total)} of {getPaginated().total}</span>
        <div class="flex gap-2"><button class="btn-secondary btn-sm" disabled={!getPaginated().hasPrev} onclick={() => state.page--}>Previous</button><button class="btn-secondary btn-sm" disabled={!getPaginated().hasNext} onclick={() => state.page++}>Next</button></div></div></div>
    {/if}
  {/if}

  {#if state.showForm}
    <div class="modal-overlay" onclick={closeForm}><div class="modal-content max-w-2xl" onclick={(e) => e.stopPropagation()}>
      <div class="card-header"><h3 class="font-display font-semibold">{state.editingId ? 'Edit Contact' : 'Add New Contact'}</h3><button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={closeForm}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Name *</label><input type="text" class="input-field" bind:value={state.form.name}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Role</label><input type="text" class="input-field" bind:value={state.form.role}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label><select class="select-field" bind:value={state.form.category}><option value="">Select</option><option value="owner">Owner</option><option value="secondary">Secondary</option><option value="technician">Technician</option><option value="provider">Provider</option></select></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Company</label><input type="text" class="input-field" bind:value={state.form.company}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office</label><input type="text" class="input-field" bind:value={state.form.office}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="tel" class="input-field" bind:value={state.form.phone}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office Number</label><input type="tel" class="input-field" bind:value={state.form.office_number}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field" bind:value={state.form.email}></div>
          <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label><select class="select-field" bind:value={state.form.property_id}><option value="">Select property</option>{#each state.properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}</select></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Address</label><input type="text" class="input-field" bind:value={state.form.address}></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Website</label><input type="url" class="input-field" bind:value={state.form.website}></div>
          <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]" bind:value={state.form.notes}></textarea></div>
          {#if state.form.office}
            <div class="md:col-span-2 pt-2 border-t border-binos-border/50">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" class="mt-0.5 rounded border-binos-border text-binos-blue focus:ring-binos-blue/30" bind:checked={state.form.applyOffice}>
                <div><div class="text-sm font-medium text-binos-navy">Apply to all contacts from this office</div><div class="text-xs text-binos-gray">Update address, website, and office number for all contacts with the same office</div></div>
              </label>
            </div>
          {/if}
        </div>
        <div class="flex gap-3 pt-6"><button class="btn-secondary flex-1" onclick={closeForm}>Cancel</button><button class="btn-primary flex-1" onclick={saveContact} disabled={!state.form.name}>Save Contact</button></div>
      </div>
    </div></div>
  {/if}

  {#if state.showDeleteConfirm}
    <div class="modal-overlay" onclick={() => state = { ...state, showDeleteConfirm: null }}><div class="modal-content max-w-md" onclick={(e) => e.stopPropagation()}>
      <div class="p-6"><div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></div>
        <h3 class="font-display font-semibold text-center mb-2">Delete Contact</h3><p class="text-binos-gray text-sm text-center mb-6">Are you sure you want to delete <span class="font-medium text-binos-navy">{state.contacts.find(c => c.id === state.showDeleteConfirm)?.name}</span>? This action cannot be undone.</p>
        <div class="flex gap-3"><button class="btn-secondary flex-1" onclick={() => state = { ...state, showDeleteConfirm: null }}>Cancel</button><button class="btn-danger flex-1" onclick={() => confirmDelete(state.showDeleteConfirm!)}>Delete</button></div>
      </div>
    </div></div>
  {/if}
</div>
