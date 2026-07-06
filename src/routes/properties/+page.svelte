<script lang="ts">
  import { apiClient, formatCurrency, formatDate, formatNumber, escHtml } from '$lib/api';
  import { openImageViewer } from '$lib/imageViewer';
  import { toast } from '$lib/stores';

  const PROPERTY_COLORS: Record<string, string> = { Oakdale: 'blue', Malindi: 'green', Indaba: 'purple', Villeroy: 'orange' };
  const PROPERTY_DETAIL_TABS = ['Overview', 'Financials', 'Contacts', 'Maintenance', 'Documents', 'Valuation', 'Insurances', 'Bonds', 'History', 'Notes', 'Mapping', 'Access', 'Tags', 'Timeline'];

  const PROPERTY_SECTIONS: Record<string, string[]> = {
    Overview: ['scheme_name', 'purchase_price', 'purchase_date', 'size', 'beds', 'baths', 'address'],
    Financials: ['value', 'rental_income', 'expenses', 'profit_margin'],
    Contacts: ['primary_contact', 'contact_phone', 'contact_email', 'secondary_contact'],
    Maintenance: ['last_maintenance_date', 'next_maintenance_due', 'maintenance_budget'],
    Documents: ['doc_summary', 'doc_last_updated', 'doc_status'],
    Valuation: ['current_valuation', 'valuation_date', 'valuation_company', 'valuation_agent'],
    Insurances: ['insurance_provider', 'insurance_policy', 'insurance_expires', 'insurance_coverage'],
    Bonds: ['bond_holder', 'bond_amount', 'bond_expiry', 'bond_status'],
    History: ['history_summary', 'first_owned', 'previous_owner', 'acquisition_cost'],
    Notes: ['notes_summary', 'notes_content', 'priority_level'],
    Mapping: ['location_notes', 'gps_coordinates', 'land_size', 'zoning'],
    Access: ['lock_system', 'key_holder', 'access_description'],
    Tags: ['tag_list', 'custom_tags', 'tag_status'],
    Timeline: ['timeline_events'],
  };

  const CURRENCY_FIELDS = ['purchase_price', 'value', 'rental_income', 'expenses', 'profit_margin', 'current_valuation', 'insurance_coverage', 'bond_amount', 'valuation_date', 'deducted_expenses', 'amount_inclusive', 'amount_exclusive'];
  const DATE_FIELDS = ['purchase_date', 'last_maintenance_date', 'next_maintenance_due', 'valuation_date', 'insurance_expires', 'bond_expiry', 'first_owned'];
  const NUMBER_FIELDS = ['size', 'beds', 'baths', 'maintenance_budget'];

  let activeTab = $derived(PROPERTY_DETAIL_TABS[state.tab]);
  let currentFields = $derived(PROPERTY_SECTIONS[activeTab] || []);

  let state = $state({
    properties: [] as any[], selected: null as number | null, detail: null as any, slideLoading: false, tab: 0,
    editing: false, editForm: {} as any, saving: false, searchQuery: '', page: 1, pageSize: 20, loading: true, error: null as string | null,
    showAddModal: false, addProperty: { scheme_name: '', purchase_price: '', purchase_date: '', scheme: '' },
    filters: { scheme: 'all' as string, status: 'all' as string, type: 'all' as string }, sort: 'name',
    showContactModal: false, contactForm: { name: '', phone: '', email: '', category: '', notes: '', property_id: null as number | null }, contactSaving: false,
  });

  async function loadProperties() {
    try { state = { ...state, loading: true, error: null }; const data = await apiClient.get('/properties'); state = { ...state, properties: Array.isArray(data) ? data : [], loading: false }; } catch (err: any) { state = { ...state, error: err.message, loading: false }; }
  }

  function getFiltered() {
    return state.properties.filter(p => {
      const q = state.searchQuery.toLowerCase();
      return (!state.searchQuery || p.scheme_name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)) &&
        (state.filters.scheme === 'all' || p.scheme === state.filters.scheme) &&
        (state.filters.status === 'all' || p.status === state.filters.status) &&
        (state.filters.type === 'all' || p.type === state.filters.type);
    }).sort((a, b) => {
      if (state.sort === 'name') return (a.scheme_name || '').localeCompare(b.scheme_name || '');
      if (state.sort === 'value') return (b.value || 0) - (a.value || 0);
      if (state.sort === 'date') return new Date(b.purchase_date || 0).getTime() - new Date(a.purchase_date || 0).getTime();
      return 0;
    });
  }

  function handleCardClick(propId: number) {
    if (state.selected === propId) return;
    state = { ...state, selected: propId, detail: null, slideLoading: true };
    apiClient.get('/properties/' + propId).then(data => { state = { ...state, detail: data, slideLoading: false }; }).catch((err: any) => { state = { ...state, detail: { error: err.message }, slideLoading: false }; });
  }

  function closePanel() { state = { ...state, selected: null, detail: null, slideLoading: false }; }

  async function saveDetails() {
    state = { ...state, saving: true };
    try { await apiClient.put('/properties', { ...state.editForm, property_id: state.selected }); state = { ...state, editing: false, editForm: {}, saving: false }; await loadProperties(); if (state.detail) { const data = await apiClient.get('/properties/' + state.selected); state = { ...state, detail: data }; } } catch { toast('error', 'Failed to save details'); state = { ...state, saving: false }; }
  }

  function toggleEdit() { state = { ...state, editing: !state.editing, editForm: state.editing ? {} : state.editForm }; }

  function isCurrencyField(f: string) { return CURRENCY_FIELDS.includes(f); }
  function isDateField(f: string) { return DATE_FIELDS.includes(f); }
  function isNumberField(f: string) { return NUMBER_FIELDS.includes(f); }
  function formatFieldLabel(f: string) { return f.replace(/_/g, ' ').replace(/^./, m => m.toUpperCase()); }

  async function saveNewProperty() {
    state = { ...state, saving: true };
    try { await apiClient.post('/properties', state.addProperty); state = { ...state, saving: false, showAddModal: false, addProperty: { scheme_name: '', purchase_price: '', purchase_date: '', scheme: '' } }; await loadProperties(); } catch { toast('error', 'Failed to save property'); state = { ...state, saving: false }; }
  }

  async function deleteContact(contactId: number) {
    try { await apiClient.del('/contacts/' + contactId); if (state.detail) { const data = await apiClient.get('/properties/' + state.selected + '/contacts'); state = { ...state, detail: { ...state.detail, contacts: data } }; } } catch { toast('error', 'Failed to delete contact'); }
  }

  async function saveContact() {
    state = { ...state, contactSaving: true };
    try { await apiClient.post('/contacts', { ...state.contactForm, property_id: state.selected }); state = { ...state, showContactModal: false, contactSaving: false }; if (state.detail) { const data = await apiClient.get('/properties/' + state.selected + '/contacts'); state = { ...state, detail: { ...state.detail, contacts: data } }; } } catch { toast('error', 'Failed to save contact'); state = { ...state, contactSaving: false }; }
  }

  loadProperties();
</script>

<div class="flex h-full">
  <div class="flex-1 overflow-auto">
    <div class="flex items-center justify-between px-5 py-3 border-b border-binos-border bg-white">
      <h2 class="page-title">Properties</h2>
      <button class="btn-primary btn-sm" onclick={() => state = { ...state, showAddModal: true, addProperty: { scheme_name: '', purchase_price: '', purchase_date: '', scheme: '' } }}>+ Add Property</button>
    </div>

    {#if state.loading}
      <div class="flex justify-center py-12"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-binos-blue"></div></div>
    {:else if state.error}
      <div class="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 m-5"><div class="font-medium mb-1">Error loading properties</div><div class="text-sm">{escHtml(state.error)}</div></div>
    {:else}
      <div class="p-5 border-b border-binos-border bg-white/50 flex items-center justify-between gap-3 flex-wrap">
        <div class="text-sm text-binos-gray">Showing {Math.min(state.page, Math.ceil(getFiltered().length / state.pageSize)) > 0 ? (state.page - 1) * state.pageSize + 1 : 0}-{Math.min(state.page * state.pageSize, getFiltered().length)} of {getFiltered().length} properties</div>
        <div class="flex gap-3">
          <div class="relative"><input type="text" placeholder="Search..." class="input-field pl-9 pr-3 py-1.5 text-sm w-48" bind:value={state.searchQuery} oninput={() => state.page = 1}>
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></div>
          <select class="select-field py-1.5 text-sm" bind:value={state.filters.scheme} onchange={() => state.page = 1}><option value="all">All Schemes</option>{#each Object.keys(PROPERTY_COLORS) as k}<option value={k}>{k}</option>{/each}</select>
          <select class="select-field py-1.5 text-sm" bind:value={state.filters.status} onchange={() => state.page = 1}><option value="all">All Status</option><option value="Active">Active</option><option value="Pending">Pending</option><option value="Sold">Sold</option><option value="Under Maintenance">Under Maintenance</option></select>
          <select class="select-field py-1.5 text-sm" bind:value={state.sort}><option value="name">Sort by Name</option><option value="value">Sort by Value</option><option value="date">Sort by Date</option></select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
        {#each getFiltered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize) as p (p.id)}
          {@const colorClass = PROPERTY_COLORS[p.scheme] || 'blue'}
          <div class="card cursor-pointer group" class:ring-2 class:ring-binos-blue={state.selected === p.id} onclick={() => handleCardClick(p.id)}>
            <div class="relative h-40 overflow-hidden rounded-t-card bg-binos-light">
              <div class="w-full h-full flex items-center justify-center text-binos-gray">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              </div>
              <div class="absolute top-2 right-2"><span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-{colorClass}-100 text-{colorClass}-800">{escHtml(p.scheme)}</span></div>
            </div>
            <div class="p-4">
              <h3 class="font-display font-semibold text-lg mb-1 truncate group-hover:text-binos-blue transition-colors">{escHtml(p.scheme_name)}</h3>
              <div class="text-sm text-binos-gray mb-3 truncate">{escHtml(p.address)}</div>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><div class="text-binos-gray text-xs mb-0.5">Purchase Price</div><div class="font-medium amount-neutral">{formatCurrency(p.purchase_price)}</div></div>
                <div><div class="text-binos-gray text-xs mb-0.5">Current Value</div><div class="font-medium amount-positive">{formatCurrency(p.value)}</div></div>
                <div><div class="text-binos-gray text-xs mb-0.5">Size</div><div class="font-medium">{formatNumber(p.size)} m&sup2;</div></div>
                <div><div class="text-binos-gray text-xs mb-0.5">Beds/Baths</div><div class="font-medium">{p.beds || 0}/{p.baths || 0}</div></div>
              </div>
            </div>
          </div>
        {:else}
          <div class="col-span-full p-8 bg-gray-50 rounded-lg border border-gray-200 text-center"><div class="text-binos-gray">No properties found</div></div>
        {/each}
      </div>

      {#if getFiltered().length > 0}
        <div class="px-5 py-4 border-t border-binos-border flex items-center justify-between">
          <div class="text-sm text-binos-gray">Page {state.page} of {Math.ceil(getFiltered().length / state.pageSize)}</div>
          <div class="flex gap-2">
            <button class="btn-secondary btn-sm" disabled={state.page <= 1} onclick={() => state.page--}>Previous</button>
            <button class="btn-secondary btn-sm" disabled={state.page >= Math.ceil(getFiltered().length / state.pageSize)} onclick={() => state.page++}>Next</button>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  {#if state.selected !== null}
    <div class="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white border-l border-binos-border shadow-xl z-30 flex flex-col" id="property-detail-panel">
      <div class="flex items-center justify-between px-5 py-4 border-b border-binos-border bg-white/95 backdrop-blur-sm">
        <div class="flex items-center gap-2">
          <button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={closePanel}>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <h3 class="font-display font-semibold text-lg">Property Details</h3>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-secondary btn-sm" style={state.editing ? 'background:rgba(59,130,246,0.1);color:#3b82f6;border-color:#3b82f6' : ''} onclick={toggleEdit}>{state.editing ? 'Cancel' : 'Edit'}</button>
          <button class="btn-primary btn-sm" disabled={state.saving} onclick={saveDetails}>{state.saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>

      {#if state.slideLoading}
        <div class="flex-1 flex items-center justify-center"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-binos-blue"></div></div>
      {:else if state.detail?.error}
        <div class="flex-1 p-6"><div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"><div class="font-medium mb-1">Error loading property details</div><div class="text-sm">{escHtml(state.detail.error)}</div></div></div>
      {:else if state.detail}
        {@const colorClass = PROPERTY_COLORS[state.detail.scheme] || 'blue'}
        <div class="flex-1 overflow-y-auto">
          <div class="p-5 border-b border-binos-border bg-binos-light/50">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-lg bg-gradient-to-br from-{colorClass}-100 to-{colorClass}-200 flex items-center justify-center text-{colorClass}-700 font-bold text-xl">{(state.detail.scheme?.charAt(0) || 'P').toUpperCase()}</div>
              <div class="flex-1"><h2 class="font-display font-semibold text-xl mb-1">{escHtml(state.detail.scheme_name)}</h2>
                <div class="text-sm text-binos-gray mb-3">{escHtml(state.detail.address)}</div>
                <div class="flex flex-wrap gap-2"><span class="badge badge-blue">{escHtml(state.detail.status)}</span><span class="badge badge-gray">{escHtml(state.detail.type)}</span><span class="badge badge-green">{formatCurrency(state.detail.value)}</span></div></div>
              <div class="text-right"><div class="text-xs text-binos-gray mb-1">Purchase Date</div><div class="text-sm font-medium">{formatDate(state.detail.purchase_date)}</div></div>
            </div>
          </div>

          <div class="border-b border-binos-border bg-white sticky top-0 z-20"><div class="flex overflow-x-auto px-5">
            {#each PROPERTY_DETAIL_TABS as tab, i}
              <button class={state.tab === i ? 'tab-item-active' : 'tab-item-inactive'} onclick={() => state = { ...state, tab: i }}>{tab}</button>
            {/each}
          </div></div>

          <div class="p-5">
            {#if state.editing}
              <div class="bg-binos-light/50 rounded-lg p-4 mb-4"><div class="text-sm font-medium text-binos-gray mb-3">Editing {activeTab}</div>
                <div class="grid grid-cols-2 gap-3">
                  {#each currentFields as field}
                    <div><label class="block text-xs text-binos-gray mb-1.5">{formatFieldLabel(field)}</label>
                      <input type={isDateField(field) ? 'date' : 'text'} class="input-field text-xs" value={state.editForm[field] ?? state.detail[field] ?? ''} oninput={(e) => { state.editForm = { ...state.editForm, [field]: (e.target as HTMLInputElement).value }; }}></div>
                  {/each}
                </div></div>
            {:else}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each currentFields as field}
                  {@const raw = state.detail[field]}
                  <div class="dl-row"><div class="dl-label">{formatFieldLabel(field)}</div>
                    <div class="dl-value">{isCurrencyField(field) ? formatCurrency(raw) : isDateField(field) ? formatDate(raw) : isNumberField(field) ? formatNumber(raw) : raw ?? '\u2014'}</div></div>
                {/each}
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex-1 p-6 text-center text-binos-gray"><div class="w-12 h-12 bg-binos-light rounded-full flex items-center justify-center mx-auto mb-3"><svg class="w-6 h-6 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div><div>No property details available</div></div>
      {/if}
    </div>
  {/if}

  {#if state.showAddModal}
    <div class="modal-overlay" onclick={() => state = { ...state, showAddModal: false }}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="card-header"><h3 class="font-display font-semibold">Add New Property</h3><button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={() => state = { ...state, showAddModal: false }}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="card-body">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Scheme Name</label><input type="text" class="input-field" bind:value={state.addProperty.scheme_name}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Purchase Price</label><input type="text" class="input-field" bind:value={state.addProperty.purchase_price}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Purchase Date</label><input type="date" class="input-field" bind:value={state.addProperty.purchase_date}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Scheme</label><select class="select-field" bind:value={state.addProperty.scheme}><option value="">Select scheme</option>{#each Object.keys(PROPERTY_COLORS) as s}<option value={s}>{s}</option>{/each}</select></div>
            <div class="flex gap-3 pt-2"><button class="btn-secondary flex-1" onclick={() => state = { ...state, showAddModal: false }}>Cancel</button><button class="btn-primary flex-1" disabled={state.saving} onclick={saveNewProperty}>{state.saving ? 'Saving...' : 'Save'}</button></div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  {#if state.showContactModal}
    <div class="modal-overlay" onclick={() => state = { ...state, showContactModal: false }}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="card-header"><h3 class="font-display font-semibold">Add Contact</h3><button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={() => state = { ...state, showContactModal: false }}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="card-body">
          <div class="space-y-4">
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Name</label><input type="text" class="input-field" bind:value={state.contactForm.name}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="text" class="input-field" bind:value={state.contactForm.phone}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field" bind:value={state.contactForm.email}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label><select class="select-field" bind:value={state.contactForm.category}><option value="">Select</option><option value="owner">Owner</option><option value="secondary">Secondary</option></select></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]" bind:value={state.contactForm.notes}></textarea></div>
            <div class="flex gap-3 pt-2"><button class="btn-secondary flex-1" onclick={() => state = { ...state, showContactModal: false }}>Cancel</button><button class="btn-primary flex-1" disabled={state.contactSaving} onclick={saveContact}>{state.contactSaving ? 'Saving...' : 'Save Contact'}</button></div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
