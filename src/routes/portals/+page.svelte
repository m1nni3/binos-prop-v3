<script lang="ts">
  import { apiClient, escHtml } from '$lib/api';

  let loading = $state(true);
  let error = $state<string | null>(null);
  let portals = $state<any[]>([]);
  let visible = $state<Record<string, boolean>>({});
  let copied = $state<string | null>(null);
  let editingId = $state<number | null>(null);
  let showAdd = $state(false);
  let editForm = $state({ type: '', name: '', username: '', password: '', url: '' });

  async function load() {
    loading = true; error = null;
    try {
      const data = await apiClient.get('/portals');
      portals = Array.isArray(data) ? data : [];
    } catch (e: any) { error = e.message || 'Failed to load portals'; }
    loading = false;
  }

  function toggleVisible(id: string) { visible = { ...visible, [id]: !visible[id] }; }

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      copied = id;
      setTimeout(() => copied = null, 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copied = id;
      setTimeout(() => copied = null, 2000);
    });
  }

  function startEdit(p: any) {
    editingId = p.id; showAdd = false;
    editForm = { type: p.type, name: p.name, username: p.username, password: p.password, url: p.url };
  }

  async function saveEdit() {
    try {
      if (editingId) {
        await apiClient.put('/portals/' + editingId, editForm);
        portals = portals.map(p => p.id === editingId ? { ...p, ...editForm } : p);
      } else {
        const portal = await apiClient.post('/portals', editForm);
        portals = [...portals, portal];
      }
      editingId = null; showAdd = false;
      editForm = { type: '', name: '', username: '', password: '', url: '' };
      await load();
    } catch (e: any) { error = e.message || 'Failed to save portal'; }
  }

  function cancelEdit() { editingId = null; showAdd = false; }

  load();
</script>

{#if loading}
  <div class="flex items-center justify-center py-20"><div class="animate-spin w-8 h-8 border-4 border-binos-blue border-t-transparent rounded-full"></div></div>
{:else if error}
  <div class="flex items-center justify-center py-20 text-binos-red">{escHtml(error)}</div>
{:else}
  <div class="space-y-6">
    <div class="flex items-center justify-between"><h2 class="page-title">Portal Passwords</h2><p class="text-sm text-binos-gray">Encrypted, stored in cloud database</p></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each portals as p (p.id)}
        {#if editingId === p.id}
          <div class="card p-4 border-2 border-binos-blue">
            <div class="flex items-center justify-between mb-3"><span class="font-medium">Edit: {escHtml(p.name)}</span></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs text-binos-gray mb-1">Type</label><input class="input-field text-sm" bind:value={editForm.type}></div>
              <div><label class="block text-xs text-binos-gray mb-1">Name</label><input class="input-field text-sm" bind:value={editForm.name}></div>
              <div><label class="block text-xs text-binos-gray mb-1">Username</label><input class="input-field text-sm" bind:value={editForm.username}></div>
              <div><label class="block text-xs text-binos-gray mb-1">Password</label><input class="input-field text-sm" type="text" bind:value={editForm.password}></div>
              <div class="col-span-2"><label class="block text-xs text-binos-gray mb-1">URL</label><input class="input-field text-sm" bind:value={editForm.url}></div>
            </div>
            <div class="flex gap-2 mt-3"><button class="btn-primary btn-sm" onclick={saveEdit}>Save</button><button class="btn-secondary btn-sm" onclick={cancelEdit}>Cancel</button></div>
          </div>
        {:else}
          <div class="card p-4">
            <div class="flex items-start justify-between mb-3">
              <div><span class="badge badge-blue">{escHtml(p.type)}</span></div>
              <button class="text-binos-gray hover:text-binos-blue" onclick={() => startEdit(p)}>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
            </div>
            <h3 class="font-medium mb-3">{escHtml(p.name)}</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-binos-gray">{escHtml(p.username)}</span>
                <button class="text-xs text-binos-blue hover:underline" onclick={() => copyText(p.username, 'u' + p.id)}>{copied === 'u' + p.id ? 'Copied!' : 'Copy'}</button>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-binos-gray">{visible[p.id] ? escHtml(p.password) : '••••••••'}</span>
                <div class="flex gap-1">
                  <button class="text-xs text-binos-gray hover:text-binos-blue" onclick={() => toggleVisible(p.id)}>{visible[p.id] ? 'Hide' : 'Show'}</button>
                  <button class="text-xs text-binos-blue hover:underline" onclick={() => copyText(p.password, 'p' + p.id)}>{copied === 'p' + p.id ? 'Copied!' : 'Copy'}</button>
                </div>
              </div>
            </div>
            {#if p.url}
              <a href={p.url.startsWith('http') ? escHtml(p.url) : '#'} target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-xs text-binos-blue hover:underline">Open {escHtml(p.name)} &rarr;</a>
            {/if}
          </div>
        {/if}
      {/each}

      {#if showAdd}
        <div class="card p-4 border-2 border-binos-green">
          <div class="font-medium mb-3">Add Portal</div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-xs text-binos-gray mb-1">Type</label><input class="input-field text-sm" bind:value={editForm.type}></div>
            <div><label class="block text-xs text-binos-gray mb-1">Name</label><input class="input-field text-sm" bind:value={editForm.name}></div>
            <div><label class="block text-xs text-binos-gray mb-1">Username</label><input class="input-field text-sm" bind:value={editForm.username}></div>
            <div><label class="block text-xs text-binos-gray mb-1">Password</label><input class="input-field text-sm" type="text" bind:value={editForm.password}></div>
            <div class="col-span-2"><label class="block text-xs text-binos-gray mb-1">URL</label><input class="input-field text-sm" bind:value={editForm.url}></div>
          </div>
          <div class="flex gap-2 mt-3"><button class="btn-primary btn-sm" onclick={saveEdit}>Save</button><button class="btn-secondary btn-sm" onclick={cancelEdit}>Cancel</button></div>
        </div>
      {:else}
        <button class="card p-4 border-2 border-dashed border-binos-border flex items-center justify-center text-binos-gray hover:border-binos-green hover:text-binos-green transition-colors" onclick={() => { editingId = null; showAdd = true; editForm = { type: '', name: '', username: '', password: '', url: '' }; }}>
          <div class="text-center">
            <svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <div class="text-sm">Add Portal</div>
          </div>
        </button>
      {/if}
    </div>
  </div>
{/if}
