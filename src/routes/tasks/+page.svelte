<script lang="ts">
  import { apiClient, formatDate, escHtml } from '$lib/api';
  import { toast } from '$lib/stores';

  let items = $state<any[]>([]);
  let filter = $state('all');
  let editingId = $state<number | null>(null);
  let form = $state({ title: '', description: '', priority: 'medium', due_date: '' });
  let confirmDelete = $state<number | null>(null);
  let selected = $state<Set<number>>(new Set());
  let loading = $state(true);

  async function loadData() {
    try {
      loading = true;
      const data = await apiClient.get('/tasks');
      items = Array.isArray(data) ? data : [];
    } catch { toast('error', 'Failed to load tasks'); }
    loading = false;
  }

  function filtered() {
    if (filter === 'all') return items;
    return items.filter(i => i.status === filter);
  }

  async function cycleStatus(item: any) {
    const order = ['pending', 'in_progress', 'done'];
    const idx = order.indexOf(item.status);
    item.status = order[(idx + 1) % order.length];
    await apiClient.put('/tasks/' + item.id, { status: item.status }).catch(() => {});
  }

  function statusIcon(s: string) {
    if (s === 'done') return '<svg class="w-5 h-5 text-binos-green" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';
    if (s === 'in_progress') return '<svg class="w-5 h-5 text-binos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M12 6v6l4 2"/></svg>';
    return '<svg class="w-5 h-5 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/></svg>';
  }

  async function saveTask() {
    if (!form.title) return;
    if (editingId) {
      await apiClient.put('/tasks/' + editingId, form);
    } else {
      await apiClient.post('/tasks', { ...form, status: 'pending' });
    }
    editingId = null;
    form = { title: '', description: '', priority: 'medium', due_date: '' };
    loadData();
  }

  function editTask(item: any) {
    editingId = item.id;
    form = { title: item.title, description: item.description || '', priority: item.priority || 'medium', due_date: item.due_date || '' };
  }

  async function deleteTask(id: number) {
    try { await apiClient.del('/tasks/' + id); confirmDelete = null; loadData(); } catch { toast('error', 'Failed to delete task'); }
  }

  async function bulkDelete() {
    try { await Promise.allSettled(Array.from(selected).map(id => apiClient.del('/tasks/' + id))); selected = new Set(); loadData(); } catch { toast('error', 'Failed to bulk delete tasks'); }
  }

  loadData();
</script>

<div class="space-y-6">
  <div class="card p-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input class="input-field md:col-span-2" placeholder="Task title" bind:value={form.title}>
      <select class="select-field" bind:value={form.priority}>
        <option value="low">low</option><option value="medium">medium</option><option value="high">high</option>
      </select>
      <input class="input-field" type="date" bind:value={form.due_date}>
      <textarea class="input-field md:col-span-2" placeholder="Description" bind:value={form.description} rows="2"></textarea>
      <div class="flex gap-2">
        <button class="btn-primary btn-sm" onclick={saveTask}>{editingId ? 'Update' : 'Add Task'}</button>
        {#if editingId}<button class="btn-secondary btn-sm" onclick={() => { editingId = null; form = { title: '', description: '', priority: 'medium', due_date: '' }; }}>Cancel</button>{/if}
      </div>
    </div>
  </div>

  <div class="tab-bar">
    {#each ['all', 'pending', 'in_progress', 'done'] as f}
      <button class={filter === f ? 'tab-item-active' : 'tab-item-inactive'} onclick={() => filter = f}>
        {f.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </button>
    {/each}
  </div>

  {#if selected.size > 0}
    <div class="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
      <span class="text-sm text-red-700">{selected.size} selected</span>
      <button class="btn-danger btn-sm" onclick={bulkDelete}>Delete Selected</button>
      <button class="btn-secondary btn-sm" onclick={() => selected = new Set()}>Clear</button>
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>
  {:else if filtered().length === 0}
    <div class="p-8 text-center text-binos-gray bg-gray-50 rounded-lg">No tasks found</div>
  {:else}
    <div class="space-y-3">
      {#each filtered() as item (item.id)}
        <div class="card p-4 flex items-center gap-3">
          <input type="checkbox" class="w-4 h-4 rounded border-binos-border" checked={selected.has(item.id)} onchange={() => { if (selected.has(item.id)) selected.delete(item.id); else selected.add(item.id); selected = selected; }}>
          <button onclick={() => cycleStatus(item)} class="flex-shrink-0">{@html statusIcon(item.status)}</button>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm">{escHtml(item.title)}</div>
            {#if item.description}<div class="text-xs text-binos-gray truncate">{escHtml(item.description)}</div>{/if}
            <div class="flex items-center gap-2 mt-1 text-xs text-binos-gray">
              <span class="badge badge-{item.priority === 'high' ? 'red' : item.priority === 'medium' ? 'orange' : 'green'}">{item.priority}</span>
              {#if item.due_date}<span>Due: {formatDate(item.due_date)}</span>{/if}
              <span>Created: {formatDate(item.created_at)}</span>
            </div>
          </div>
          <div class="flex gap-1">
            <button class="p-1.5 rounded hover:bg-binos-light" onclick={() => editTask(item)}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button class="p-1.5 rounded hover:bg-binos-light text-binos-red" onclick={() => confirmDelete = item.id}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if confirmDelete}
    <div class="modal-overlay" onclick={() => confirmDelete = null}>
      <div class="modal-content max-w-md" onclick={(e) => e.stopPropagation()}>
        <div class="p-6 text-center">
          <h3 class="font-semibold mb-2">Delete Task?</h3>
          <p class="text-sm text-binos-gray mb-4">This action cannot be undone.</p>
          <div class="flex gap-3 justify-center">
            <button class="btn-secondary btn-sm" onclick={() => confirmDelete = null}>Cancel</button>
            <button class="btn-danger btn-sm" onclick={() => deleteTask(confirmDelete!)}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
