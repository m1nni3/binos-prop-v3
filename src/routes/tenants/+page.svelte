<script lang="ts">
  import { apiClient, formatDate, escHtml } from '$lib/api';
  import { ICONS } from '$lib/icons';
  import { openImageViewer } from '$lib/imageViewer';
  import { toast } from '$lib/stores';

  let state = $state({
    tenants: [] as any[], filterProp: 'all', showForm: false, editingId: null as number | null,
    inspectModal: null as any, page: 1, pageSize: 10, loading: true, error: null as string | null, properties: [] as any[],
    form: { name: '', phone: '', email: '', property_id: null as string | null, lease_start: '', lease_end: '', lease_file: '', notes: '' },
    inspectForm: { date: '', notes: '', type: 'report' },
  });

  async function loadData() {
    try {
      state = { ...state, loading: true, error: null };
      const [td, pd] = await Promise.all([apiClient.get('/tenants'), apiClient.get('/properties')]);
      state = { ...state, tenants: Array.isArray(td) ? td : [], properties: pd || [], loading: false };
    } catch (err: any) { state = { ...state, error: err.message, loading: false }; }
  }

  function getFiltered() { return state.tenants.filter(t => state.filterProp === 'all' || t.property_id == state.filterProp); }
  function getPaginated() { const f = getFiltered(), s = (state.page - 1) * state.pageSize; return { items: f.slice(s, s + state.pageSize), total: f.length, hasPrev: state.page > 1, hasNext: state.page * state.pageSize < f.length }; }

  function showForm(id?: number) {
    if (id) { const t = state.tenants.find(x => x.id === id); if (t) state = { ...state, editingId: id, form: { name: t.name, phone: t.phone || '', email: t.email || '', property_id: t.property_id || null, lease_start: t.lease_start || '', lease_end: t.lease_end || '', lease_file: t.lease_file || '', notes: t.notes || '' } }; }
    else state = { ...state, editingId: null, form: { name: '', phone: '', email: '', property_id: null, lease_start: '', lease_end: '', lease_file: '', notes: '' } };
    state = { ...state, showForm: true };
  }

  function closeForm() { state = { ...state, showForm: false, editingId: null }; }

  async function saveTenant() {
    if (!state.form.name) return;
    try {
      if (state.editingId) await apiClient.put('/tenants/' + state.editingId, state.form);
      else await apiClient.post('/tenants', state.form);
      closeForm(); await loadData();
    } catch { toast('error', 'Failed to save tenant'); }
  }

  function deleteTenant(id: string) {
    if (!confirm('Delete this tenant? It will be marked as inactive.')) return;
    apiClient.put('/tenants/' + id, { active: false }).then(() => loadData()).catch(() => toast('error', 'Failed to delete tenant'));
  }

  async function uploadInspect(id: string, type: string, file: File) {
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('type', type);
      fd.append('date', state.inspectForm.date || new Date().toISOString().split('T')[0]);
      fd.append('notes', state.inspectForm.notes || '');
      await fetch('/api/tenants/' + id + '/inspection', { method: 'POST', body: fd });
      await loadData();
    } catch { toast('error', 'Upload failed'); }
  }

  async function deleteInspect(id: string, type: string, url: string) {
    try { await apiClient.put('/tenants/' + id + '/inspection', { type, url, active: false }); await loadData(); } catch { toast('error', 'Failed to delete inspection item'); }
  }

  loadData();
</script>

<div class="flex flex-col h-full">
  {#if state.loading}
    <div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>
  {:else if state.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mx-5 mt-5"><div class="font-medium mb-1">Error</div><div class="text-sm">{state.error}</div></div>
  {:else}
    <div class="px-5 py-4 border-b border-binos-border bg-white">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <select class="select-field py-2 pr-8 text-sm" bind:value={state.filterProp} onchange={() => { state.page = 1; }}>
            <option value="all">All Properties</option>
            {#each state.properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}
          </select>
        </div>
        <button class="btn-primary btn-sm" onclick={() => showForm()}><span class="mr-1">{@html ICONS.plus}</span> Add Tenant</button>
      </div>
    </div>

    <div class="flex-1 overflow-auto">
      <div class="p-5">
        {#each getPaginated().items as t (t.id)}
          {@const now = Date.now()}
          {@const end = t.lease_end ? new Date(t.lease_end).getTime() : null}
          {@const active = end ? now < end : true}
          <div class="card p-4 mb-4 hover:shadow-card-hover transition-shadow">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-binos-green/10 flex items-center justify-center">
                  <svg class="w-5 h-5 text-binos-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                </div>
                <div><h3 class="font-medium leading-tight">{escHtml(t.name)}</h3><div class="text-xs text-binos-gray">{t.property_id ? state.properties.find(p => p.id == t.property_id)?.scheme_name || 'Unknown' : 'Unknown'}</div></div>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">{active ? 'Active' : 'Expired'}</span>
            </div>
            <div class="flex gap-2 mt-3">
              <button class="btn-secondary btn-sm py-1.5 px-3" onclick={() => showForm(t.id)}>Edit</button>
              <button class="btn-danger btn-sm py-1.5 px-3" onclick={() => deleteTenant(t.id)}>Delete</button>
            </div>
          </div>
        {:else}
          <div class="p-8 bg-gray-50 rounded-lg border text-center"><div class="text-binos-gray">No tenants found</div></div>
        {/each}
      </div>
    </div>

    {#if getPaginated().total > 0}
      <div class="px-5 py-4 border-t border-binos-border bg-white flex items-center justify-between text-sm">
        <span class="text-binos-gray">Showing {(state.page - 1) * state.pageSize + 1}-{Math.min(state.page * state.pageSize, getPaginated().total)} of {getPaginated().total}</span>
        <div class="flex gap-2">
          <button class="btn-secondary btn-sm" disabled={!getPaginated().hasPrev} onclick={() => state.page--}>Previous</button>
          <button class="btn-secondary btn-sm" disabled={!getPaginated().hasNext} onclick={() => state.page++}>Next</button>
        </div>
      </div>
    {/if}
  {/if}

  {#if state.showForm}
    <div class="modal-overlay" onclick={closeForm}>
      <div class="modal-content max-w-lg" onclick={(e) => e.stopPropagation()}>
        <div class="card-header flex items-center justify-between">
          <h3 class="font-display font-semibold">{state.editingId ? 'Edit Tenant' : 'Add Tenant'}</h3>
          <button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={closeForm}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="card-body">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Name *</label><input type="text" class="input-field" bind:value={state.form.name}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="tel" class="input-field" bind:value={state.form.phone}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field" bind:value={state.form.email}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease Start</label><input type="date" class="input-field" bind:value={state.form.lease_start}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease End</label><input type="date" class="input-field" bind:value={state.form.lease_end}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label>
              <select class="select-field" bind:value={state.form.property_id}>
                <option value="">Select property</option>
                {#each state.properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}
              </select></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease File URL</label><input type="url" class="input-field" placeholder="Link to lease doc" bind:value={state.form.lease_file}></div>
            <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]" bind:value={state.form.notes}></textarea></div>
          </div>
          <div class="flex gap-3 pt-6">
            <button class="btn-secondary flex-1" onclick={closeForm}>Cancel</button>
            <button class="btn-primary flex-1" onclick={saveTenant} disabled={!state.form.name}>Save</button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if state.inspectModal}
    <div class="modal-overlay" onclick={() => state = { ...state, inspectModal: null }}>
      <div class="modal-content max-w-lg" onclick={(e) => e.stopPropagation()}>
        <div class="card-header flex items-center justify-between">
          <h3 class="font-display font-semibold">{escHtml(state.inspectModal.tenant?.name || '')} - Inspection</h3>
          <button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={() => state = { ...state, inspectModal: null }}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="card-body max-h-[70vh] overflow-y-auto">
          <div class="mt-4 pt-4 border-t border-binos-border">
            <label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload File
              <input type="file" accept="image/*,.pdf,.doc,.docx" class="hidden">
            </label>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
