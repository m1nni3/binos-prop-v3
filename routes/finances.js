import { apiClient, formatCurrency, formatNumber, formatDate, escHtml } from '../lib/utils.js';
import { ICONS } from '../lib/icons.js';
import { toast } from '../lib/toast.js';

function getCategoryColor(category) {
  const colors = {
    'Rental Income': '#22c55e',
    'Property Tax': '#3b82f6',
    'Insurance': '#8b5cf6',
    'Maintenance': '#f97316',
    'Management Fee': '#ec4899',
    'Renovation': '#14b8a6',
    'Security': '#eab308',
    'Utilities': '#ef4444',
    'Other Income': '#06b6d4',
  };
  return colors[category] || '#64748b';
}

export function renderFinances(container) {
  let state = {
    chartIncome: null,
    chartBudget: null,
    year: new Date().getFullYear(),
    filterProp: 'all',
    budgets: [],
    monthly: [],
    entries: [],
    properties: [],
    showAddEntryModal: false,
    editCell: null,
    editingValue: '',
    newEntry: { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false },
    loading: true,
    error: null,
    entrySaving: false,
    updateSaving: null,
  };

  async function loadData() {
    try {
      state.loading = true;
      state.error = null;

      const [plData, plMonthly, plEntries, properties] = await Promise.all([
        apiClient.get('/pl'),
        apiClient.get('/pl-monthly'),
        apiClient.get('/pl-entries'),
        apiClient.get('/properties'),
      ]);

      state.budgets = plData || [];
      state.monthly = plMonthly || [];
      state.entries = plEntries || [];
      state.properties = properties || [];
      state.loading = false;
      render();
    } catch (err) {
      state.error = err.message;
      state.loading = false;
      render();
    }
  }

  function getUniqueYears() {
    const years = new Set();
    (state.monthly || []).forEach(m => { if (m.year) years.add(m.year); });
    return Array.from(years).sort((a, b) => b - a);
  }

  function getFilteredData() {
    let filteredBudgets = state.budgets;
    let filteredMonthly = state.monthly;
    let filteredEntries = state.entries;

    if (state.filterProp !== 'all') {
      filteredBudgets = filteredBudgets.filter(b => b.property_id === state.filterProp);
      filteredMonthly = filteredMonthly.filter(m => m.property_id === state.filterProp);
      filteredEntries = filteredEntries.filter(e => e.property_id === state.filterProp);
    }
    if (state.year) {
      filteredMonthly = filteredMonthly.filter(m => m.year === state.year);
      filteredEntries = filteredEntries.filter(e => {
        const y = new Date(e.date).getFullYear();
        return y === state.year;
      });
    }
    return { budgets: filteredBudgets, monthly: filteredMonthly, entries: filteredEntries };
  }

  function renderCharts(filtered) {
    const incomeCtx = container.querySelector('#income-chart');
    const budgetCtx = container.querySelector('#budget-chart');

    if (incomeCtx && state.chartIncome) state.chartIncome.destroy();
    if (budgetCtx && state.chartBudget) state.chartBudget.destroy();

    if (incomeCtx) {
      const data = {
        labels: (filtered.monthly || []).map(m => m.month),
        datasets: [
          {
            label: 'Income',
            data: (filtered.monthly || []).map(m => m.income),
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.1,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: 'Expenses',
            data: (filtered.monthly || []).map(m => m.expenses),
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.1,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };

      state.chartIncome = new Chart(incomeCtx, {
        type: 'line',
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } }, title: { display: false } },
          scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => 'R' + v } } },
        },
      });
    }

    if (budgetCtx) {
      const categories = (filtered.budgets || []).reduce((acc, b) => {
        if (!acc.includes(b.category)) acc.push(b.category);
        return acc;
      }, []);

      const budgetData = categories.map(cat => {
        const b = (filtered.budgets || []).find(b => b.category === cat);
        return b ? b.amount : 0;
      });

      const actualsData = categories.map(cat => {
        const total = (filtered.monthly || []).filter(m => m.category === cat).reduce((sum, m) => sum + (m.amount || 0), 0);
        return total;
      });

      state.chartBudget = new Chart(budgetCtx, {
        type: 'bar',
        data: {
          labels: categories,
          datasets: [
            { label: 'Budget', data: budgetData, backgroundColor: categories.map(getCategoryColor), borderColor: categories.map(getCategoryColor), borderWidth: 1 },
            { label: 'Actuals', data: actualsData, backgroundColor: 'rgba(107, 114, 128, 0.5)', borderColor: '#6b7280', borderWidth: 1 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 20 } }, title: { display: false } },
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => 'R' + v } } },
        },
      });
    }
  }

  function renderBudgetTable(filtered) {
    let html = '<div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border">' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th>' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Budget Amount</th>' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Last Updated</th></tr></thead><tbody>';

    html += (filtered.budgets || []).map(budget => {
      const isEditing = state.editCell && state.editCell.id === budget.id && state.editCell.field === 'amount';
      const inputValue = state.editingValue !== undefined ? state.editingValue : budget.amount;

      return '<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">' +
        '<td class="px-4 py-3 font-medium' + (budget.category === 'Rental Income' ? ' text-green-700' : budget.category === 'Property Tax' ? ' text-blue-700' : '') + '">' + escHtml(budget.category) + '</td>' +
        '<td class="px-4 py-3">' +
        (isEditing ?
          '<div class="flex items-center gap-2"><span class="text-binos-gray">R</span>' +
          '<input type="text" class="input-field px-2 py-1 text-sm w-24" value="' + inputValue + '" data-cell-edit="' + budget.id + '|amount|' + budget.amount + '" autofocus></div>' :
          '<span class="' + (budget.amount >= 0 ? 'amount-positive' : 'amount-negative') + '">' + formatNumber(budget.amount) + '</span>') +
        '</td><td class="px-4 py-3 text-binos-gray text-sm">' + formatDate(budget.last_updated || new Date().toISOString()) + '</td></tr>';
    }).join('');

    return html + '</tbody></table></div>';
  }

  function renderActualsTable(filtered) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const categories = Array.from(new Set((filtered.monthly || []).map(m => m.category)));

    let html = '<div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border">' +
      '<th class="px-4 py-3 text-left font-medium text-binos-gray sticky left-0 bg-white">Category</th>' +
      months.map(m => '<th class="px-2 py-3 text-center font-medium text-binos-gray text-xs">' + m + '</th>').join('') + '</tr></thead><tbody>';

    html += categories.map(cat => {
      const catData = (filtered.monthly || []).filter(m => m.category === cat);
      return '<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">' +
        '<td class="px-4 py-2 font-medium sticky left-0 bg-white' + (cat === 'Rental Income' ? ' text-green-700' : cat === 'Property Tax' ? ' text-blue-700' : '') + '">' + escHtml(cat) + '</td>' +
        months.map(month => {
          const data = catData.find(m => m.month === month) || { amount: 0 };
          const isEditing = state.editCell && state.editCell.id === data.id && state.editCell.field === ('amount_' + month);
          const inputValue = state.editingValue !== undefined ? state.editingValue : (data.amount || 0);
          return '<td class="px-2 py-2 text-center">' +
            (isEditing ?
              '<div class="relative"><span class="absolute left-1 top-1/2 -translate-y-1/2 text-binos-gray text-xs">R</span>' +
              '<input type="text" class="input-field px-1 py-1 text-sm w-20 text-right" value="' + inputValue + '" data-cell-edit="' + (data.id || 'new') + '|amount_' + month + '|' + (data.amount || 0) + '" autofocus></div>' :
              '<span class="' + (data.amount > 0 ? 'amount-positive' : data.amount < 0 ? 'amount-negative' : 'amount-neutral') + '">' + formatNumber(data.amount || 0) + '</span>') +
            '</td>';
        }).join('');
    }).join('');

    return html + '</tbody></table></div>';
  }

  function renderEntriesTable(filtered) {
    let html = '<div class="overflow-hidden"><table class="w-full text-sm"><thead><tr class="bg-binos-light/50 border-b border-binos-border">' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Date</th>' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Category</th>' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Description</th>' +
      '<th class="text-right px-4 py-3 font-medium text-binos-gray">Amount</th>' +
      '<th class="text-left px-4 py-3 font-medium text-binos-gray">Property</th></tr></thead><tbody>';

    html += (filtered.entries || []).map(entry => {
      const isEditing = state.editCell && state.editCell.id === entry.id && state.editCell.field === 'amount';
      const inputValue = state.editingValue !== undefined ? state.editingValue : entry.amount;
      return '<tr class="border-b border-binos-border hover:bg-binos-light/30 transition-colors">' +
        '<td class="px-4 py-3 text-binos-gray">' + formatDate(entry.date) + '</td>' +
        '<td class="px-4 py-3 font-medium">' + escHtml(entry.category) + '</td>' +
        '<td class="px-4 py-3">' + escHtml(entry.description) + '</td>' +
        '<td class="px-4 py-3 text-right">' +
        (isEditing ?
          '<div class="flex items-center justify-end gap-2"><span class="text-binos-gray">R</span>' +
          '<input type="text" class="input-field px-2 py-1 text-sm w-24 text-right" value="' + inputValue + '" data-cell-edit="' + entry.id + '|amount|' + entry.amount + '" autofocus></div>' :
          '<span class="' + (entry.amount > 0 ? 'amount-positive' : 'amount-negative') + '">' + (entry.amount > 0 ? '+' : '') + formatNumber(entry.amount) + '</span>') +
        '</td><td class="px-4 py-3 text-binos-gray">' + escHtml(state.properties.find(p => p.id === entry.property_id)?.scheme_name || entry.property_id) + '</td></tr>';
    }).join('');

    return html + '</tbody></table></div>';
  }

  async function saveNewEntry() {
    state.entrySaving = true;
    render();
    try {
      await apiClient.post('/pl-entries', {
        date: state.newEntry.date,
        category: state.newEntry.category,
        description: state.newEntry.description,
        amount: parseFloat(state.newEntry.amount),
        property_id: state.newEntry.property_id,
        deducted_expenses: state.newEntry.deducted_expenses || false,
      });
      state.entrySaving = false;
      state.showAddEntryModal = false;
      state.newEntry = { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false };
      await loadData();
    } catch (err) {
      toast.error('Failed to save entry');
      state.entrySaving = false;
      render();
    }
  }

  async function saveCellChange(id, field, value) {
    state.updateSaving = id;
    render();

    let targetArray, updateEndpoint;
    if ((state.budgets || []).some(b => b.id === id)) {
      targetArray = state.budgets;
      updateEndpoint = '/pl';
    } else if ((state.monthly || []).some(m => m.id === id)) {
      targetArray = state.monthly;
      updateEndpoint = '/pl-monthly';
    } else if ((state.entries || []).some(e => e.id === id)) {
      targetArray = state.entries;
      updateEndpoint = '/pl-entries';
    }

    const entity = targetArray?.find(e => e.id === id);
    if (!entity) { state.updateSaving = null; return; }

    const updateData = {
      id: entity.id,
      property_id: entity.property_id,
      category: entity.category,
      amount: value,
      last_updated: new Date().toISOString(),
      month: entity.month,
      date: entity.date,
      description: entity.description,
    };

    try {
      await apiClient.put(updateEndpoint, updateData);
      await loadData();
    } catch (err) {
      toast.error('Failed to update');
      state.updateSaving = null;
      await loadData();
    }
  }

  function updateNewEntry(field, value) {
    state.newEntry = { ...state.newEntry, [field]: value };
    render();
  }

  function renderAddEntryModal() {
    if (!state.showAddEntryModal) return '';
    const showDeductedExpenses = state.newEntry.category === 'Rental Income';

    return '<div class="modal-overlay" data-close-entry-modal>' +
      '<div class="modal-content" onclick="event.stopPropagation()">' +
      '<div class="card-header"><h3 class="font-display font-semibold">Add Financial Entry</h3>' +
      '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-close-entry-modal>' +
      '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>' +
      '<div class="card-body"><div class="grid grid-cols-2 gap-4">' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Date</label><input type="date" class="input-field" value="' + (state.newEntry.date || '') + '" data-entry-date></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label><select class="select-field" data-entry-category>' +
      '<option value="">Select category</option>' +
      ['Rental Income', 'Property Tax', 'Insurance', 'Maintenance', 'Management Fee', 'Renovation', 'Security', 'Utilities', 'Other Income'].map(c => '<option value="' + c + '"' + (state.newEntry.category === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></div>' +
      '<div class="col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Description</label><input type="text" class="input-field" value="' + escHtml(state.newEntry.description) + '" data-entry-desc></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Amount</label><input type="text" class="input-field" value="' + escHtml(state.newEntry.amount) + '" data-entry-amount></div>' +
      '<div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label><select class="select-field" data-entry-property>' +
      '<option value="">Select property</option>' +
      (state.properties || []).map(p => '<option value="' + p.id + '"' + (state.newEntry.property_id === p.id ? ' selected' : '') + '>' + escHtml(p.scheme_name) + '</option>').join('') + '</select></div>' +
      (showDeductedExpenses ? '<div class="col-span-2"><label class="flex items-center gap-2">' +
      '<input type="checkbox" class="w-4 h-4 rounded border-binos-border text-binos-blue focus:ring-binos-blue" data-entry-deducted' + (state.newEntry.deducted_expenses ? ' checked' : '') + '>' +
      '<span class="text-sm font-medium">This is a deducted expense</span></label></div>' : '') +
      '</div><div class="flex gap-3 pt-4"><button class="btn-secondary flex-1" data-close-entry-modal>Cancel</button>' +
      '<button class="btn-primary flex-1" data-save-entry' + (state.entrySaving ? ' disabled' : '') + '>' + (state.entrySaving ? 'Saving...' : 'Save') + '</button></div></div></div></div>';
  }

  function render() {
    const filtered = getFilteredData();

    let html = '<div class="space-y-6">' +
      (state.loading ? '<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>' : '') +
      (state.error ? '<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"><div class="font-medium mb-1">Error loading financial data</div><div class="text-sm">' + escHtml(state.error) + '</div></div>' : '');

    if (!state.loading && !state.error) {
      html += '<div class="kpi-row">' +
        '<div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Income</div><div class="text-2xl font-display font-bold amount-positive">R' + ((filtered.monthly || []).reduce((sum, m) => sum + (m.income || 0), 0)).toLocaleString('en-ZA') + '</div><div class="text-xs text-binos-gray mt-1">This ' + state.year + '</div></div>' +
        '<div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Total Expenses</div><div class="text-2xl font-display font-bold amount-negative">R' + ((filtered.monthly || []).reduce((sum, m) => sum + (m.expenses || 0), 0)).toLocaleString('en-ZA') + '</div><div class="text-xs text-binos-gray mt-1">This ' + state.year + '</div></div>' +
        '<div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Net Profit</div><div class="text-2xl font-display font-bold amount-neutral">R' + (((filtered.monthly || []).reduce((sum, m) => sum + (m.income || 0), 0) - (filtered.monthly || []).reduce((sum, m) => sum + (m.expenses || 0), 0))).toLocaleString('en-ZA') + '</div><div class="text-xs text-binos-gray mt-1">This ' + state.year + '</div></div>' +
        '<div class="kpi-card"><div class="text-sm text-binos-gray mb-1">Budget vs Actual</div><div class="text-2xl font-display font-bold amount-positive">' + (((filtered.budgets || []).reduce((sum, b) => sum + (b.amount || 0), 0) - (filtered.monthly || []).reduce((sum, m) => sum + (m.amount || 0), 0))).toLocaleString('en-ZA') + '</div><div class="text-xs text-binos-gray mt-1">Variance</div></div></div>' +

        '<div class="card"><div class="card-header"><h3 class="page-title">Financial Dashboard</h3>' +
        '<div class="flex items-center gap-3">' +
        '<select class="select-field text-sm" data-filter-prop><option value="all">All Properties</option>' +
        (state.properties || []).map(p => '<option value="' + p.id + '"' + (state.filterProp === p.id ? ' selected' : '') + '>' + escHtml(p.scheme_name) + '</option>').join('') + '</select>' +
        '<select class="select-field text-sm" data-filter-year>' +
        getUniqueYears().map(y => '<option value="' + y + '"' + (state.year === y ? ' selected' : '') + '>' + y + '</option>').join('') + '</select>' +
        '<button class="btn-add btn-sm" data-open-entry-modal><span class="mr-1">' + ICONS.plus + '</span> Add Entry</button></div></div>' +
        '<div class="card-body"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
        '<div><h4 class="text-sm font-medium text-binos-gray mb-3">Income vs Expenses</h4><div class="h-80"><canvas id="income-chart"></canvas></div></div>' +
        '<div><h4 class="text-sm font-medium text-binos-gray mb-3">Budget vs Actual</h4><div class="h-80"><canvas id="budget-chart"></canvas></div></div></div></div></div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
        '<div class="card"><div class="card-header"><h3 class="page-title">Budget Breakdown</h3><span class="text-xs text-binos-gray">Click amount to edit</span></div><div class="card-body">' + renderBudgetTable(filtered) + '</div></div>' +
        '<div class="card"><div class="card-header"><h3 class="page-title">Monthly Actuals</h3></div><div class="card-body">' + renderActualsTable(filtered) + '</div></div></div>' +

        '<div class="card"><div class="card-header"><h3 class="page-title">Financial Entries</h3></div><div class="card-body">' + renderEntriesTable(filtered) + '</div></div>';
    }

    html += renderAddEntryModal() + '</div>';
    container.innerHTML = html;

    if (!state.loading && !state.error) renderCharts(filtered);
    attachEvents();
  }

  function attachEvents() {
    // Filter selects
    const fp = container.querySelector('[data-filter-prop]');
    if (fp) fp.onchange = () => { state.filterProp = fp.value; render(); };
    const fy = container.querySelector('[data-filter-year]');
    if (fy) fy.onchange = () => { state.year = parseInt(fy.value); render(); };

    // Entry modal
    container.querySelectorAll('[data-open-entry-modal]').forEach(el => {
      el.onclick = () => { state.showAddEntryModal = true; state.entrySaving = false; render(); };
    });
    container.querySelectorAll('[data-close-entry-modal]').forEach(el => {
      el.onclick = () => { state.showAddEntryModal = false; state.entrySaving = false; state.newEntry = { date: new Date().toISOString().split('T')[0], category: '', description: '', amount: '', property_id: '', deducted_expenses: false }; render(); };
    });
    container.querySelectorAll('[data-save-entry]').forEach(el => {
      el.onclick = () => saveNewEntry();
    });

    // Entry form fields
    const ed = container.querySelector('[data-entry-date]');
    if (ed) ed.onchange = () => updateNewEntry('date', ed.value);
    const ec = container.querySelector('[data-entry-category]');
    if (ec) ec.onchange = () => { state.newEntry.category = ec.value; state.newEntry.deducted_expenses = false; render(); };
    const ede = container.querySelector('[data-entry-desc]');
    if (ede) ede.onchange = () => updateNewEntry('description', ede.value);
    const ea = container.querySelector('[data-entry-amount]');
    if (ea) ea.onchange = () => updateNewEntry('amount', ea.value);
    const ep = container.querySelector('[data-entry-property]');
    if (ep) ep.onchange = () => updateNewEntry('property_id', ep.value);
    const edd = container.querySelector('[data-entry-deducted]');
    if (edd) edd.onchange = () => updateNewEntry('deducted_expenses', edd.checked);

    // Cell editing
    container.querySelectorAll('[data-cell-edit]').forEach(el => {
      const parts = el.getAttribute('data-cell-edit').split('|');
      const id = parts[0];
      const field = parts[1];
      const fallback = parts[2];
      el.addEventListener('focus', () => {
        state.editCell = { id, field };
        state.editingValue = id !== 'new' ? undefined : '';
      });
      el.addEventListener('blur', () => {
        const raw = el.value;
        if (/^-?\d*\.?\d*$/.test(raw)) {
          const val = parseFloat(raw);
          state.editCell = null;
          state.editingValue = '';
          saveCellChange(id, field, val);
        } else {
          state.editCell = null;
          state.editingValue = fallback;
          render();
        }
      });
      el.addEventListener('keypress', e => {
        if (e.key === 'Enter') el.blur();
      });
    });

    // Budget amount click to edit
    container.querySelectorAll('[data-click-cell]').forEach(el => {
      el.onclick = () => {
        const parts = el.getAttribute('data-click-cell').split('|');
        state.editCell = { id: parts[0], field: parts[1] };
        state.editingValue = undefined;
        render();
      };
    });
  }

  loadData();
}