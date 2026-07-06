<script lang="ts">
  import { apiClient, formatDate, formatCurrency, escHtml } from '$lib/api';
  import { openImageViewer } from '$lib/imageViewer';
  import { toast } from '$lib/stores';

  let data = $state<any[]>([]);
  let selectedItem = $state<number | null>(null);
  let detailView = $state('view');
  let filterProp = $state('all');
  let filterCategory = $state('all');
  let currentPage = $state(1);
  const itemsPerPage = 10;
  let loading = $state(true);
  let error = $state<string | null>(null);
  let properties = $state<any[]>([]);
  let fileModal = $state<any>(null);

  const CATEGORIES: Record<string, { color: string; label: string }> = { roof: { color: 'blue', label: 'Roof' }, plumbing: { color: 'cyan', label: 'Plumbing' }, electrical: { color: 'yellow', label: 'Electrical' }, hvac: { color: 'green', label: 'HVAC' }, painting: { color: 'pink', label: 'Painting' }, flooring: { color: 'orange', label: 'Flooring' }, windows: { color: 'purple', label: 'Windows' } };
  function catInfo(c: string) { return CATEGORIES[c] || { color: 'gray', label: c }; }
  function propName(id: string) { return properties.find(p => p.id === id)?.scheme_name || 'Unknown'; }

  function filtered() { return data.filter(i => (filterProp === 'all' || i.property_id === filterProp) && (filterCategory === 'all' || i.category === filterCategory)); }
  function paginated() { const f = filtered(), s = (currentPage - 1) * itemsPerPage; return { items: f.slice(s, s + itemsPerPage), total: f.length, hasPrev: currentPage > 1, hasNext: currentPage * itemsPerPage < f.length }; }

  function statusBadge(s: string) {
    const cls = s === 'completed' ? 'bg-green-100 text-green-800' : s === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    return '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + cls + '">' + s.replace('_', ' ') + '</span>';
  }

  async function loadData() {
    try { loading = true; error = null; const [md, pd] = await Promise.all([apiClient.get('/maintenance'), apiClient.get('/properties')]); data = Array.isArray(md) ? md : []; properties = pd || []; loading = false; } catch (e: any) { error = e.message; loading = false; }
  }

  async function uploadFile(id: string, type: string, file: File) {
    try { const fd = new FormData(); fd.append('file', file); fd.append('type', type); fd.append('maintenance_id', String(id)); await fetch('/api/maintenance/' + id + '/files', { method: 'POST', body: fd }); await loadData(); } catch { toast('error', 'Upload failed'); }
  }

  async function deleteFile(id: string, type: string, idx: number) {
    try { const item = data.find(i => i.id == id); if (!item) return; const file = (item[type] || [])[idx]; if (!file) return; await apiClient.put('/maintenance/' + id + '/files', { type, idx, active: false }); await loadData(); } catch { toast('error', 'Failed to delete file'); }
  }

  loadData();
</script>

<div class="flex h-full">
  <div class="w-full lg:w-2/5 border-r border-binos-border bg-white flex flex-col">
    <div class="p-5 border-b border-binos-border bg-binos-light/50">
      <h2 class="page-title">Maintenance</h2>
      <div class="text-sm text-binos-gray mt-1">Track and manage property maintenance requests</div>
      <div class="mt-4 flex flex-wrap gap-3">
        <select class="select-field py-2 text-sm" bind:value={filterProp} onchange={() => currentPage = 1}><option value="all">All Properties</option>{#each properties as pr}<option value={pr.id}>{pr.scheme_name}</option>{/each}</select>
        <select class="select-field py-2 text-sm" bind:value={filterCategory} onchange={() => currentPage = 1}><option value="all">All Categories</option>{#each Object.entries(CATEGORIES) as [key, val]}<option value={key}>{val.label}</option>{/each}</select>
      </div>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>
    {:else if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-5">{error}</div>
    {:else}
      <div class="flex-1 overflow-y-auto divide-y divide-binos-border/50">
        {#each paginated().items as item (item.id)}
          {@const ci = catInfo(item.category)}
          {@const sel = selectedItem === item.id}
          <div class="card p-4 cursor-pointer transition-all" class:ring-2 class:ring-binos-blue={sel} onclick={() => { selectedItem = item.id; detailView = 'view'; }}>
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-{ci.color}-100 flex items-center justify-center text-{ci.color}-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div><h3 class="font-medium text-base leading-tight mb-1">{escHtml(item.title)}</h3><div class="text-xs text-binos-gray">{propName(item.property_id)}</div></div>
              </div>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-{ci.color}-100 text-{ci.color}-800">{ci.label}</span>
            </div>
          </div>
        {/each}
      </div>
      {#if paginated().total > 0}
        <div class="px-5 py-4 border-t border-binos-border flex items-center justify-between text-sm">
          <span class="text-binos-gray">Showing {(currentPage-1)*itemsPerPage+1}-{Math.min(currentPage*itemsPerPage, paginated().total)} of {paginated().total}</span>
          <div class="flex gap-2"><button class="btn-secondary btn-sm" disabled={!paginated().hasPrev} onclick={() => currentPage--}>Previous</button><button class="btn-secondary btn-sm" disabled={!paginated().hasNext} onclick={() => currentPage++}>Next</button></div>
        </div>
      {/if}
    {/if}
  </div>

  <div class="hidden lg:block lg:w-3/5 relative">
    {#if selectedItem !== null}
      {@const item = data.find(i => i.id === selectedItem)}
      {#if item}
        {@const ci = catInfo(item.category)}
        <div class="fixed inset-y-0 right-0 w-full lg:w-2/5 bg-white border-l border-binos-border shadow-xl z-30 flex flex-col">
          <div class="flex items-center justify-between px-5 py-4 border-b border-binos-border">
            <div class="flex items-center gap-2">
              <button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={() => selectedItem = null}>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <h3 class="font-semibold text-lg">Maintenance Details</h3>
            </div>
            <div class="flex gap-2">
              <button class="btn-secondary btn-sm" style={detailView === 'view' ? 'background:rgba(59,130,246,0.1);color:#3b82f6' : ''} onclick={() => detailView = 'view'}>Details</button>
              <button class="btn-secondary btn-sm" onclick={() => detailView = 'images'}>Images</button>
              <button class="btn-secondary btn-sm" onclick={() => detailView = 'reports'}>Reports</button>
              <button class="btn-secondary btn-sm" onclick={() => detailView = 'invoices'}>Invoices</button>
            </div>
          </div>
          {#if detailView === 'view'}
            <div class="flex-1 overflow-y-auto p-5">
              <h2 class="font-semibold text-xl mb-2">{escHtml(item.title)}</h2>
              <div class="flex flex-wrap gap-2 mb-4"><span class="badge bg-{ci.color}-100 text-{ci.color}-800">{ci.label}</span><span class="badge {item.priority === 'high' ? 'badge-red' : 'badge-green'}">{item.priority} priority</span></div>
              <div class="space-y-3 text-sm">
                <div class="dl-row"><div class="dl-label">Property</div><div class="dl-value">{propName(item.property_id)}</div></div>
                <div class="dl-row"><div class="dl-label">Date</div><div class="dl-value">{formatDate(item.date)}</div></div>
                <div class="dl-row"><div class="dl-label">Location</div><div class="dl-value">{escHtml(item.location)}</div></div>
                <div class="dl-row"><div class="dl-label">Description</div><div class="dl-value">{escHtml(item.description)}</div></div>
                <div class="dl-row"><div class="dl-label">Technician</div><div class="dl-value">{escHtml(item.technician || '')}</div></div>
                <div class="dl-row"><div class="dl-label">Cost</div><div class="dl-value amount-negative">{formatCurrency(item.cost)}</div></div>
                <div class="dl-row"><div class="dl-label">Status</div><div class="dl-value">{@html statusBadge(item.status)}</div></div>
              </div>
            </div>
          {:else}
            {@const fileType = detailView}
            {@const files = item[fileType] || []}
            {@const isImage = fileType === 'images'}
            {@const typeLabel = fileType === 'images' ? 'Images' : fileType === 'reports' ? 'Reports' : 'Invoices'}
            <div class="flex-1 overflow-y-auto p-5">
              <h4 class="font-medium mb-3">{typeLabel}</h4>
              {#if files.length === 0}
                <div class="text-center py-8 text-binos-gray">No {typeLabel.toLowerCase()} uploaded yet</div>
              {:else if isImage}
                <div class="grid grid-cols-2 gap-3">
                  {#each files as f, i}
                    <div class="relative"><img src={f.url} class="w-full h-32 object-cover rounded-lg border border-binos-border cursor-pointer" onclick={() => openImageViewer({ url: f.url, name: f.name, onReplace: (nf) => uploadFile(item.id, fileType, nf), onDelete: () => deleteFile(item.id, fileType, i) })}>
                      <button class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" onclick={() => deleteFile(item.id, fileType, i)}>x</button></div>
                  {/each}
                </div>
              {:else}
                <div class="space-y-2">
                  {#each files as f, i}
                    <div class="card p-3 flex items-center justify-between"><span class="text-sm truncate">{f.name || f.url.split('/').pop() || 'file-' + (i+1)}</span>
                      <button class="p-1.5 rounded-lg hover:bg-red-50" onclick={() => deleteFile(item.id, fileType, i)}><svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
                  {/each}
                </div>
              {/if}
              <label class="btn-add btn-sm mt-4 cursor-pointer inline-flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Upload {typeLabel.slice(0, -1)}
                <input type="file" accept={isImage ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx'} multiple={isImage} class="hidden" onchange={(e) => { const el = e.target as HTMLInputElement; if (el.files?.length) for (const f of el.files) uploadFile(item.id, fileType, f); el.value = ''; }}>
              </label>
            </div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>
</div>
