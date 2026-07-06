<script lang="ts">
  import { apiClient, formatCurrency, formatDate, escHtml } from '$lib/api';
  import { toast } from '$lib/stores';

  let data = $state<Record<string, any[]>>({ income: [], expenses: [] });
  let filterProp = $state('all');
  let properties = $state<any[]>([]);
  let showIncome = $state(false);
  let showExpense = $state(false);
  let incForm = $state({ amount: '', description: '', property_id: '', date: new Date().toISOString().split('T')[0] });
  let expForm = $state({ amount: '', description: '', property_id: '', date: new Date().toISOString().split('T')[0], category: '' });

  async function loadData() {
    try {
      const [inc, exp, props] = await Promise.all([
        apiClient.get('/petty-cash/income'),
        apiClient.get('/petty-cash/expenses'),
        apiClient.get('/properties'),
      ]);
      data = { income: Array.isArray(inc) ? inc : [], expenses: Array.isArray(exp) ? exp : [] };
      properties = props || [];
    } catch { toast('error', 'Failed to load petty cash'); }
  }

  function filteredIncome() { return data.income.filter(i => filterProp === 'all' || i.property_id === filterProp); }
  function filteredExpenses() { return data.expenses.filter(e => filterProp === 'all' || e.property_id === filterProp); }
  function totalIncome() { return filteredIncome().reduce((s, i) => s + (parseFloat(i.amount) || 0), 0); }
  function totalExpenses() { return filteredExpenses().reduce((s, e) => s + (parseFloat(e.amount) || 0), 0); }
  function balance() { return totalIncome() - totalExpenses(); }
  function propName(id: string) { return properties.find(p => p.id === id)?.scheme_name || 'Unknown'; }

  async function addIncome() {
    if (!incForm.amount) return;
    try {
      await apiClient.post('/petty-cash/income', { ...incForm, amount: parseFloat(incForm.amount) });
      incForm = { amount: '', description: '', property_id: '', date: new Date().toISOString().split('T')[0] };
      showIncome = false;
      loadData();
    } catch { toast('error', 'Failed to add income'); }
  }

  async function addExpense() {
    if (!expForm.amount) return;
    try {
      await apiClient.post('/petty-cash/expenses', { ...expForm, amount: parseFloat(expForm.amount) });
      expForm = { amount: '', description: '', property_id: '', date: new Date().toISOString().split('T')[0], category: '' };
      showExpense = false;
      loadData();
    } catch { toast('error', 'Failed to add expense'); }
  }

  async function deleteItem(type: string, id: string) {
    if (!confirm('Delete this entry?')) return;
    try { await apiClient.del('/petty-cash/' + type + '/' + id); loadData(); } catch { toast('error', 'Failed to delete entry'); }
  }

  loadData();
</script>

<div class="space-y-6">
  <div class="kpi-row">
    <div class="kpi-card border-l-binos-green"><div class="text-sm text-binos-gray mb-1">Total Income</div><div class="text-2xl font-display font-bold amount-positive">{formatCurrency(totalIncome())}</div></div>
    <div class="kpi-card border-l-binos-red"><div class="text-sm text-binos-gray mb-1">Total Expenses</div><div class="text-2xl font-display font-bold amount-negative">{formatCurrency(totalExpenses())}</div></div>
    <div class="kpi-card border-l-binos-blue"><div class="text-sm text-binos-gray mb-1">Balance</div><div class="text-2xl font-display font-bold amount-neutral">{formatCurrency(balance())}</div></div>
  </div>

  <div class="flex items-center gap-3">
    <select class="select-field py-2 text-sm" bind:value={filterProp}>
      <option value="all">All Properties</option>
      {#each properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}
    </select>
    <button class="btn-add btn-sm" onclick={() => showIncome = !showIncome}>+ Income</button>
    <button class="btn-secondary btn-sm" onclick={() => showExpense = !showExpense}>+ Expense</button>
  </div>

  {#if showIncome}
    <div class="card p-4">
      <h4 class="font-medium mb-3">Add Income</h4>
      <div class="grid grid-cols-2 gap-3">
        <input class="input-field" placeholder="Amount" bind:value={incForm.amount}>
        <input class="input-field" type="date" bind:value={incForm.date}>
        <input class="input-field col-span-2" placeholder="Description" bind:value={incForm.description}>
        <select class="select-field" bind:value={incForm.property_id}><option value="">Property</option>{#each properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}</select>
      </div>
      <div class="flex gap-3 mt-3"><button class="btn-primary btn-sm" onclick={addIncome}>Save</button><button class="btn-secondary btn-sm" onclick={() => showIncome = false}>Cancel</button></div>
    </div>
  {/if}

  {#if showExpense}
    <div class="card p-4">
      <h4 class="font-medium mb-3">Add Expense</h4>
      <div class="grid grid-cols-2 gap-3">
        <input class="input-field" placeholder="Amount" bind:value={expForm.amount}>
        <input class="input-field" type="date" bind:value={expForm.date}>
        <input class="input-field col-span-2" placeholder="Description" bind:value={expForm.description}>
        <select class="select-field" bind:value={expForm.property_id}><option value="">Property</option>{#each properties as p}<option value={p.id}>{p.scheme_name}</option>{/each}</select>
        <input class="input-field" placeholder="Category" bind:value={expForm.category}>
      </div>
      <div class="flex gap-3 mt-3"><button class="btn-primary btn-sm" onclick={addExpense}>Save</button><button class="btn-secondary btn-sm" onclick={() => showExpense = false}>Cancel</button></div>
    </div>
  {/if}

  <div class="card">
    <div class="card-header"><h3 class="font-medium">Entries</h3></div>
    <div class="divide-y divide-binos-border/50">
      {#each [...filteredIncome().map(e => ({ ...e, type: 'income' })), ...filteredExpenses().map(e => ({ ...e, type: 'expense' }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) as e}
        <div class="flex items-center justify-between px-5 py-3 border-l-4" class:border-l-binos-green={e.type === 'income'} class:border-l-binos-red={e.type !== 'income'}>
          <div>
            <div class="font-medium text-sm">{escHtml(e.description)}</div>
            <div class="text-xs text-binos-gray">{propName(e.property_id)} &middot; {formatDate(e.date)}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold" class:amount-positive={e.type === 'income'} class:amount-negative={e.type !== 'income'}>
              {e.type === 'income' ? '+' : '-'}{formatCurrency(e.amount)}
            </span>
            <button class="text-binos-gray hover:text-binos-red" onclick={() => deleteItem(e.type === 'income' ? 'income' : 'expenses', e.id)}>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      {:else}
        <div class="p-6 text-center text-binos-gray">No entries found</div>
      {/each}
    </div>
  </div>
</div>
