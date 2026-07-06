<script lang="ts">
  import { apiClient, formatCurrency, formatNumber, formatDate, escHtml } from '$lib/api';
  import { ICONS } from '$lib/icons';
  import { toast } from '$lib/stores';
  import { onMount } from 'svelte';

  let state = $state({
    year: new Date().getFullYear(), filterProp: 'all', budgets: [] as any[], monthly: [] as any[],
    entries: [] as any[], properties: [] as any[], loading: true, error: null as string | null,
    entrySaving: false, showAddEntryModal: false, updateSaving: null as string | null,
    newEntry: { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false },
    editCell: null as { id: string; field: string } | null, editingValue: '',
  });

  let chartIncome: any = null;
  let chartBudget: any = null;

  function getCategoryColor(category: string) {
    const colors: Record<string, string> = { 'Rental Income': '#22c55e', 'Property Tax': '#3b82f6', 'Insurance': '#8b5cf6', 'Maintenance': '#f97316', 'Management Fee': '#ec4899', 'Renovation': '#14b8a6', 'Security': '#eab308', 'Utilities': '#ef4444', 'Other Income': '#06b6d4' };
    return colors[category] || '#64748b';
  }

  async function loadData() {
    try {
      state = { ...state, loading: true, error: null };
      const [plData, plMonthly, plEntries, properties] = await Promise.all([
        apiClient.get('/pl'), apiClient.get('/pl-monthly'), apiClient.get('/pl-entries'), apiClient.get('/properties'),
      ]);
      state = { ...state, budgets: plData || [], monthly: plMonthly || [], entries: plEntries || [], properties: properties || [], loading: false };
    } catch (err: any) { state = { ...state, error: err.message, loading: false }; }
  }

  function getUniqueYears() {
    const years = new Set<number>();
    (state.monthly || []).forEach((m: any) => { if (m.year) years.add(m.year); });
    return Array.from(years).sort((a, b) => b - a);
  }

  function getFiltered() {
    let b = state.budgets, m = state.monthly, e = state.entries;
    if (state.filterProp !== 'all') { b = b.filter((x: any) => x.property_id === state.filterProp); m = m.filter((x: any) => x.property_id === state.filterProp); e = e.filter((x: any) => x.property_id === state.filterProp); }
    if (state.year) { m = m.filter((x: any) => x.year === state.year); e = e.filter((x: any) => new Date(x.date).getFullYear() === state.year); }
    return { budgets: b, monthly: m, entries: e };
  }

  function renderCharts(filtered: any) {
    if (typeof Chart === 'undefined') return;
    if (chartIncome) chartIncome.destroy();
    if (chartBudget) chartBudget.destroy();

    const incomeCanvas = document.getElementById('income-chart') as HTMLCanvasElement;
    if (incomeCanvas) {
      chartIncome = new Chart(incomeCanvas, {
        type: 'line',
        data: { labels: filtered.monthly.map((m: any) => m.month), datasets: [{ label: 'Income', data: filtered.monthly.map((m: any) => m.income), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.1, fill: true, pointRadius: 4, pointHoverRadius: 6 }, { label: 'Expenses', data: filtered.monthly.map((m: any) => m.expenses), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', tension: 0.1, fill: true, pointRadius: 4, pointHoverRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v: any) => 'R' + v } } } },
      });
    }

    const budgetCanvas = document.getElementById('budget-chart') as HTMLCanvasElement;
    if (budgetCanvas) {
      const categories = [...new Set(filtered.budgets.map((b: any) => b.category))];
      chartBudget = new Chart(budgetCanvas, {
        type: 'bar',
        data: { labels: categories, datasets: [{ label: 'Budget', data: categories.map((cat: string) => { const b = filtered.budgets.find((x: any) => x.category === cat); return b ? b.amount : 0; }), backgroundColor: categories.map(getCategoryColor), borderColor: categories.map(getCategoryColor), borderWidth: 1 }, { label: 'Actuals', data: categories.map((cat: string) => filtered.monthly.filter((m: any) => m.category === cat).reduce((s: number, m: any) => s + (m.amount || 0), 0)), backgroundColor: 'rgba(107,114,128,0.5)', borderColor: '#6b7280', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: (v: any) => 'R' + v } } } },
      });
    }
  }

  async function saveNewEntry() {
    state = { ...state, entrySaving: true };
    try {
      await apiClient.post('/pl-entries', { date: state.newEntry.date, category: state.newEntry.category, description: state.newEntry.description, amount: parseFloat(state.newEntry.amount), property_id: state.newEntry.property_id, deducted_expenses: state.newEntry.deducted_expenses || false });
      state = { ...state, entrySaving: false, showAddEntryModal: false, newEntry: { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false } };
      await loadData();
    } catch { toast('error', 'Failed to save entry'); state = { ...state, entrySaving: false }; }
  }

  async function saveCellChange(id: string, _field: string, value: number) {
    state = { ...state, updateSaving: id };
    let targetArray: any[], updateEndpoint: string;
    if (state.budgets.some((b: any) => b.id === id)) { targetArray = state.budgets; updateEndpoint = '/pl'; }
    else if (state.monthly.some((m: any) => m.id === id)) { targetArray = state.monthly; updateEndpoint = '/pl-monthly'; }
    else { targetArray = state.entries; updateEndpoint = '/pl-entries'; }
    const entity = targetArray.find((e: any) => e.id === id);
    if (!entity) { state = { ...state, updateSaving: null }; return; }
    try { await apiClient.put(updateEndpoint, { id: entity.id, amount: value }); await loadData(); } catch { toast('error', 'Failed to update'); state = { ...state, updateSaving: null }; await loadData(); }
  }

  onMount(loadData);
</script>

<svelte:window on:load={() => renderCharts(getFiltered())} />

<div class="space-y-6">
  {#if state.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"><div class="font-medium mb-1">Error loading financial data</div><div class="text-sm">{escHtml(state.error)}</div></div>
  {:else}
    {@const filtered = getFiltered()}
    {@const totalIncome = filtered.monthly.reduce((s: number, m: any) => s + (m.income || 0), 0)}
    {@const totalExpenses = filtered.monthly.reduce((s: number, m: any) => s + (m.expenses || 0), 0)}
    <div class="kpi-row">
      <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Income</div><div class="text-2xl font-display font-bold amount-positive">R{totalIncome.toLocaleString('en-ZA')}</div><div class="text-xs text-binos-gray mt-1">This {state.year}</div></div>
      <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Expenses</div><div class="text-2xl font-display font-bold amount-negative">R{totalExpenses.toLocaleString('en-ZA')}</div><div class="text-xs text-binos-gray mt-1">This {state.year}</div></div>
      <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Net Profit</div><div class="text-2xl font-display font-bold amount-neutral">R{(totalIncome - totalExpenses).toLocaleString('en-ZA')}</div><div class="text-xs text-binos-gray mt-1">This {state.year}</div></div>
      <div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Budget vs Actual</div><div class="text-2xl font-display font-bold amount-positive">{(filtered.budgets.reduce((s: number, b: any) => s + (b.amount || 0), 0) - filtered.monthly.reduce((s: number, m: any) => s + (m.amount || 0), 0)).toLocaleString('en-ZA')}</div><div class="text-xs text-binos-gray mt-1">Variance</div></div>
    </div>

    <div class="card">
      <div class="card-header"><h3 class="page-title">Financial Dashboard</h3>
        <div class="flex items-center gap-3">
          <select class="select-field text-sm" bind:value={state.filterProp}><option value="all">All Properties</option>{#each state.properties as p}<option value={p.id}>{escHtml(p.scheme_name)}</option>{/each}</select>
          <select class="select-field text-sm" bind:value={state.year}>{#each getUniqueYears() as y}<option value={y}>{y}</option>{/each}</select>
          <button class="btn-add btn-sm" onclick={() => state = { ...state, showAddEntryModal: true }}><span class="mr-1">{@html ICONS.plus}</span> Add Entry</button>
        </div>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div><h4 class="text-sm font-medium text-binos-gray mb-3">Income vs Expenses</h4><div class="h-80"><canvas id="income-chart"></canvas></div></div>
          <div><h4 class="text-sm font-medium text-binos-gray mb-3">Budget vs Actual</h4><div class="h-80"><canvas id="budget-chart"></canvas></div></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card"><div class="card-header"><h3 class="page-title">Budget Breakdown</h3><span class="text-xs text-binos-gray">Click amount to edit</span></div>
        <div class="card-body"><div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Budget Amount</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Last Updated</th></tr></thead><tbody>
          {#each filtered.budgets as budget (budget.id)}
            <tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">
              <td class="px-4 py-3 font-medium">{escHtml(budget.category)}</td>
              <td class="px-4 py-3"><span class={budget.amount >= 0 ? 'amount-positive' : 'amount-negative'} ondblclick={() => { state = { ...state, editCell: { id: budget.id, field: 'amount' }, editingValue: String(budget.amount) }; }}>
                {#if state.editCell?.id === budget.id && state.editCell?.field === 'amount'}
                  <div class="flex items-center gap-2"><span class="text-binos-gray">R</span><input type="text" class="input-field px-2 py-1 text-sm w-24" value={state.editingValue} autofocus onblur={(e) => { const v = parseFloat((e.target as HTMLInputElement).value); if (!isNaN(v)) { state = { ...state, editCell: null }; saveCellChange(budget.id, 'amount', v); } else { state = { ...state, editCell: null }; } }} onkeydown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}></div>
                {:else}
                  {formatNumber(budget.amount)}
                {/if}</span></td>
              <td class="px-4 py-3 text-binos-gray text-sm">{formatDate(budget.last_updated || new Date().toISOString())}</td>
            </tr>
          {/each}
        </tbody></table></div></div></div>

      <div class="card"><div class="card-header"><h3 class="page-title">Monthly Actuals</h3></div>
        <div class="card-body"><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="px-4 py-3 text-left font-medium text-binos-gray sticky left-0 bg-binos-light/50">Category</th>
          {#each ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as month}<th class="px-2 py-3 text-center font-medium text-binos-gray text-xs">{month}</th>{/each}</tr></thead><tbody>
          {#each [...new Set(filtered.monthly.map((m: any) => m.category))] as cat}
            {@const catData = filtered.monthly.filter((m: any) => m.category === cat)}
            <tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">
              <td class="px-4 py-2 font-medium sticky left-0 bg-white">{escHtml(cat)}</td>
              {#each ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as month}
                {@const data = catData.find((m: any) => m.month === month) || { amount: 0 }}
                <td class="px-2 py-2 text-center"><span class={data.amount > 0 ? 'amount-positive' : data.amount < 0 ? 'amount-negative' : 'amount-neutral'}>{formatNumber(data.amount || 0)}</span></td>
              {/each}
            </tr>
          {/each}
        </tbody></table></div></div></div>
    </div>

    <div class="card"><div class="card-header"><h3 class="page-title">Financial Entries</h3></div>
      <div class="card-body"><div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border"><th class="text-left px-4 py-3 font-medium text-binos-gray">Date</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Description</th><th class="text-right px-4 py-3 font-medium text-binos-gray">Amount</th><th class="text-left px-4 py-3 font-medium text-binos-gray">Property</th></tr></thead><tbody>
        {#each filtered.entries as entry (entry.id)}
          <tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">
            <td class="px-4 py-3 text-binos-gray">{formatDate(entry.date)}</td>
            <td class="px-4 py-3 font-medium">{escHtml(entry.category)}</td>
            <td class="px-4 py-3">{escHtml(entry.description)}</td>
            <td class="px-4 py-3 text-right"><span class={entry.amount > 0 ? 'amount-positive' : 'amount-negative'} ondblclick={() => { state = { ...state, editCell: { id: entry.id, field: 'amount' }, editingValue: String(entry.amount) }; }}>
              {#if state.editCell?.id === entry.id && state.editCell?.field === 'amount'}
                <div class="flex items-center justify-end gap-2"><span class="text-binos-gray">R</span><input type="text" class="input-field px-2 py-1 text-sm w-24 text-right" value={state.editingValue} autofocus onblur={(e) => { const v = parseFloat((e.target as HTMLInputElement).value); if (!isNaN(v)) { state = { ...state, editCell: null }; saveCellChange(entry.id, 'amount', v); } else { state = { ...state, editCell: null }; } }} onkeydown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}></div>
              {:else}
                {entry.amount > 0 ? '+' : ''}{formatNumber(entry.amount)}
              {/if}</span></td>
            <td class="px-4 py-3 text-binos-gray">{escHtml(state.properties.find((p: any) => p.id === entry.property_id)?.scheme_name || entry.property_id)}</td>
          </tr>
        {/each}
      </tbody></table></div></div></div>

  {/if}

  {#if state.showAddEntryModal}
    {@const showDeductedExpenses = state.newEntry.category === 'Rental Income'}
    <div class="modal-overlay" onclick={() => state = { ...state, showAddEntryModal: false, newEntry: { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false } }}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        <div class="card-header"><h3 class="font-display font-semibold">Add Financial Entry</h3><button class="p-1.5 rounded-lg hover:bg-binos-light" onclick={() => state = { ...state, showAddEntryModal: false }}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="card-body">
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Date</label><input type="date" class="input-field" bind:value={state.newEntry.date}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label><select class="select-field" bind:value={state.newEntry.category} onchange={() => { if (state.newEntry.category !== 'Rental Income') state.newEntry.deducted_expenses = false; }}><option value="">Select category</option>
              {#each ['Rental Income', 'Property Tax', 'Insurance', 'Maintenance', 'Management Fee', 'Renovation', 'Security', 'Utilities', 'Other Income'] as c}<option value={c}>{c}</option>{/each}</select></div>
            <div class="col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Description</label><input type="text" class="input-field" bind:value={state.newEntry.description}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Amount</label><input type="text" class="input-field" bind:value={state.newEntry.amount}></div>
            <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label><select class="select-field" bind:value={state.newEntry.property_id}><option value="">Select property</option>{#each state.properties as p}<option value={p.id}>{escHtml(p.scheme_name)}</option>{/each}</select></div>
            {#if showDeductedExpenses}
              <div class="col-span-2"><label class="flex items-center gap-2"><input type="checkbox" class="w-4 h-4 rounded border-binos-border text-binos-blue focus:ring-binos-blue" bind:checked={state.newEntry.deducted_expenses}><span class="text-sm font-medium">This is a deducted expense</span></label></div>
            {/if}
          </div>
          <div class="flex gap-3 pt-4"><button class="btn-secondary flex-1" onclick={() => state = { ...state, showAddEntryModal: false }}>Cancel</button><button class="btn-primary flex-1" disabled={state.entrySaving} onclick={saveNewEntry}>{state.entrySaving ? 'Saving...' : 'Save'}</button></div>
        </div>
      </div>
    </div>
  {/if}
</div>
