import { apiClient, formatDate, formatCurrency, escHtml } from '../lib/utils.js';
import { openImageViewer } from '../lib/image-viewer.js';
import { toast } from '../lib/toast.js';
import { fetchWithTimeout } from '../lib/fetch-with-timeout.js';

export function renderMaintenance(container) {
  let data = [];
  let selectedItem = null;
  let detailView = 'view';
  let filterProp = 'all';
  let filterCategory = 'all';
  let currentPage = 1;
  const itemsPerPage = 10;
  let loading = true;
  let error = null;
  let properties = [];
  let fileModal = null;
  let uploadQueue = {};

  const CATEGORIES = {
    roof: { color: 'blue', label: 'Roof' },
    plumbing: { color: 'cyan', label: 'Plumbing' },
    electrical: { color: 'yellow', label: 'Electrical' },
    hvac: { color: 'green', label: 'HVAC' },
    painting: { color: 'pink', label: 'Painting' },
    flooring: { color: 'orange', label: 'Flooring' },
    windows: { color: 'purple', label: 'Windows' },
  };

  function catInfo(c) { return CATEGORIES[c] || { color: 'gray', label: c }; }
  function propName(id) { return properties.find(p => p.id === id)?.scheme_name || 'Unknown'; }

  function filtered() {
    return data.filter(i =>
      (filterProp === 'all' || i.property_id === filterProp) &&
      (filterCategory === 'all' || i.category === filterCategory)
    );
  }

  function paginated() {
    const f = filtered(), s = (currentPage - 1) * itemsPerPage;
    const items = f.slice(s, s + itemsPerPage);
    return { items, total: f.length, hasPrev: currentPage > 1, hasNext: currentPage * itemsPerPage < f.length };
  }

  function statusBadge(s) {
    const cls = s === 'completed' ? 'bg-green-100 text-green-800' : s === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800';
    return '<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + cls + '">' + s.replace('_', ' ') + '</span>';
  }

  function renderCard(item) {
    const ci = catInfo(item.category), pn = propName(item.property_id), sel = selectedItem === item.id;
    const imgCount = (item.images || []).length;
    const repCount = (item.reports || []).length;
    const invCount = (item.invoices || []).length;
    return '<div class="card p-4 cursor-pointer transition-all ' + (sel ? 'ring-2 ring-binos-blue shadow-card-hover' : '') + '" data-select="' + item.id + '">' +
      '<div class="flex items-start justify-between mb-3"><div class="flex items-center gap-2">' +
      '<div class="w-8 h-8 rounded-full bg-' + ci.color + '-100 flex items-center justify-center text-' + ci.color + '-700">' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35[...]
      '</div><div><h3 class="font-medium text-base leading-tight mb-1">' + escHtml(item.title) + '</h3>' +
      '<div class="text-xs text-binos-gray">' + pn + '</div></div></div>' +
      '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-' + ci.color + '-100 text-' + ci.color + '-800">' + ci.label + '</span></div>' +
      '<div class="space-y-2 text-sm">' +
      '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-w[...]
      '<div class="flex items-center gap-2 text-binos-gray"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-w[...]
      (item.priority === 'high' ? '<div class="flex items-center gap-2 text-red-700"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-[...]
      '</div>' +
      '<div class="mt-3 flex items-center gap-3 border-t border-binos-border/50 pt-3">' +
      '<button class="inline-flex items-center gap-1 text-xs text-binos-gray hover:text-binos-blue transition-colors" data-file-modal=\'{"id":"' + item.id + '","type":"images"}\'>' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-[...]
      '<button class="inline-flex items-center gap-1 text-xs text-binos-gray hover:text-binos-blue transition-colors" data-file-modal=\'{"id":"' + item.id + '","type":"reports"}\'>' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0[...]
      '<button class="inline-flex items-center gap-1 text-xs text-binos-gray hover:text-binos-blue transition-colors" data-file-modal=\'{"id":"' + item.id + '","type":"invoices"}\'>' +
      '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2[...]
      '</div></div>';
  }

  function renderFileModal() {
    if (!fileModal) return '';
    const item = data.find(i => i.id == fileModal.id);
    if (!item) return '';
    const files = item[fileModal.type] || [];
    const typeLabel = fileModal.type === 'images' ? 'Images' : fileModal.type === 'reports' ? 'Reports' : 'Invoices';
    const acceptType = fileModal.type === 'images' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx';
    const isImage = fileModal.type === 'images';

    let html = '<div class="modal-overlay" data-close-modal>' +
      '<div class="modal-content max-w-lg" onclick="event.stopPropagation()">' +
      '<div class="card-header flex items-center justify-between"><h3 class="font-display font-semibold">' + escHtml(item.title) + ' — ' + typeLabel + '</h3>' +
      '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-close-modal><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoi[...]
      '<div class="card-body max-h-[70vh] overflow-y-auto">';

    if (files.length === 0) {
      html += '<div class="text-center py-8 text-binos-gray">No ' + typeLabel.toLowerCase() + ' uploaded yet</div>';
    } else {
      if (isImage) {
        html += '<div class="grid grid-cols-2 gap-3">';
        files.forEach((f, i) => {
          html += '<div class="relative group"><img src="' + escHtml(f.url) + '" class="w-full h-32 object-cover rounded-lg border border-binos-border cursor-pointer" data-file-view=\'' + JSON.str[...],
          html += '<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">' +
            '<button class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-binos-light" data-file-view=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>',
          html += '<button class="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-binos-light" data-file-download=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>',
          html += '<button class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600" data-file-delete=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>' +
            '</button></div></div>';
        });
        html += '</div>';
      } else {
        html += '<div class="space-y-2">';
        files.forEach((f, i) => {
          const name = f.name || f.url.split('/').pop() || 'file-' + (i + 1);
          html += '<div class="card p-3 flex items-center justify-between">' +
            '<div class="flex items-center gap-3 min-w-0"><svg class="w-5 h-5 text-binos-gray flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" str[...],
          html += '<span class="text-sm truncate">' + escHtml(name) + '</span></div>' +
            '<div class="flex gap-1 flex-shrink-0">' +
            '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-file-view=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>',
          html += '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-file-download=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>',
          html += '<button class="p-1.5 rounded-lg hover:bg-red-50" data-file-delete=\'' + JSON.stringify({ idx: i, type: fileModal.type, id: item.id }) + '\'>' +
            '</button></div></div>';
        });
        html += '</div>';
      }
    }

    html += '<div class="mt-4 pt-4 border-t border-binos-border">' +
      '<label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stro[...]
      '<input type="file" accept="' + acceptType + '" ' + (fileModal.type === 'images' ? 'multiple' : '') + ' class="hidden" data-file-upload=\'' + JSON.stringify({ type: fileModal.type, id: item.id }) + '\'>' +
      '</div></div></div>';
    return html;
  }

  function renderDetail() {
    if (!selectedItem) return '';
    const item = data.find(i => i.id === selectedItem);
    if (!item) return '';
    const ci = catInfo(item.category);
    let html = '<div class="fixed inset-y-0 right-0 w-full lg:w-2/5 bg-white border-l border-binos-border shadow-xl z-30 flex flex-col">' +
      '<div class="flex items-center justify-between px-5 py-4 border-b border-binos-border"><div class="flex items-center gap-2">' +
      '<button class="p-1.5 rounded-lg hover:bg-binos-light" data-close-panel><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejo[...]
    if (detailView === 'view') {
      html += '<div class="flex-1 overflow-y-auto p-5">' +
        '<h2 class="font-semibold text-xl mb-2">' + escHtml(item.title) + '</h2>' +
        '<div class="flex flex-wrap gap-2 mb-4"><span class="badge bg-' + ci.color + '-100 text-' + ci.color + '-800">' + ci.label + '</span>' +
        '<span class="badge ' + (item.priority === 'high' ? 'badge-red' : 'badge-green') + '">' + item.priority + ' priority</span></div>' +
        '<div class="space-y-3 text-sm">' +
        '<div class="dl-row"><div class="dl-label">Property</div><div class="dl-value">' + propName(item.property_id) + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Date</div><div class="dl-value">' + formatDate(item.date) + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Location</div><div class="dl-value">' + escHtml(item.location) + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Description</div><div class="dl-value">' + escHtml(item.description) + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Technician</div><div class="dl-value">' + escHtml(item.technician || '') + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Cost</div><div class="dl-value amount-' + (item.cost > 0 ? 'negative' : 'neutral') + '">' + formatCurrency(item.cost) + '</div></div>' +
        '<div class="dl-row"><div class="dl-label">Status</div><div class="dl-value">' + statusBadge(item.status) + '</div></div>' +
        '</div></div>';
    } else {
      const fileType = detailView;
      const files = item[fileType] || [];
      const isImage = fileType === 'images';
      const typeLabel = fileType === 'images' ? 'Images' : fileType === 'reports' ? 'Reports' : 'Invoices';
      html += '<div class="flex-1 overflow-y-auto p-5"><h4 class="font-medium mb-3">' + typeLabel + '</h4>';
      if (files.length === 0) {
        html += '<div class="text-center py-8 text-binos-gray">No ' + typeLabel.toLowerCase() + ' uploaded yet</div>';
      } else if (isImage) {
        html += '<div class="grid grid-cols-2 gap-3">' + files.map((f, i) =>
          '<div class="relative"><img src="' + escHtml(f.url) + '" class="w-full h-32 object-cover rounded-lg border border-binos-border cursor-pointer" data-file-view=\'' + JSON.stringify({ idx:[...]) + '
          '<button class="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center" data-delete-file=\'' + JSON.stringify({ idx: i, type: fileTyp[...]) + '\'>\n' +
          '</button></div>'
        ).join('') + '</div>';
      } else {
        html += '<div class="space-y-2">' + files.map((f, i) => {
          const name = f.name || f.url.split('/').pop() || 'file-' + (i + 1);
          return '<div class="card p-3 flex items-center justify-between"><span class="text-sm truncate">' + escHtml(name) + '</span>' +
            '<button class="p-1.5 rounded-lg hover:bg-red-50" data-delete-file=\'' + JSON.stringify({ idx: i, type: fileType, id: item.id }) + '\'><svg class="w-4 h-4 text-red-500" fill="no[...]
        }).join('') + '</div>';
      }
      const accept = isImage ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx';
      html += '<label class="btn-add btn-sm mt-4 cursor-pointer inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="ro[...]
        '<input type="file" accept="' + accept + '" ' + (isImage ? 'multiple' : '') + ' class="hidden" data-panel-upload=\'' + JSON.stringify({ type: fileType, id: item.id }) + '\'></label>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  async function loadData() {
    try {
      loading = true; error = null;
      const [md, pd] = await Promise.all([apiClient.get('/maintenance'), apiClient.get('/properties')]);
      data = Array.isArray(md) ? md : [];
      properties = pd || [];
      loading = false;
    } catch (e) { error = e.message; loading = false; }
    render();
  }

  async function uploadFile(id, type, file) {
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', type);
      fd.append('maintenance_id', String(id));
      const res = await fetchWithTimeout('/api/maintenance/' + id + '/files', { method: 'POST', body: fd }, 20000);
      if (!res.ok) throw new Error('Upload failed');
      await loadData();
    } catch (e) {
      console.error('uploadFile error', e);
      toast.error('Upload failed');
    }
  }

  async function deleteFile(id, type, idx) {
    try {
      const item = data.find(i => i.id == id);
      if (!item) return;
      const file = (item[type] || [])[idx];
      if (!file) return;
      await apiClient.put('/maintenance/' + id + '/files', { type, idx, active: false });
      const itemIdx = data.findIndex(i => i.id == id);
      if (itemIdx !== -1) {
        data[itemIdx][type].splice(idx, 1);
        render();
      }
    } catch (e) {
      toast.error('Failed to delete file');
    }
  }

  function render() {
    const p = paginated();
    let html = '<div class="flex h-full"><div class="w-full lg:w-2/5 border-r border-binos-border bg-white flex flex-col">' +
      '<div class="p-5 border-b border-binos-border bg-binos-light/50">' +
      '<h2 class="page-title">Maintenance</h2>' +
      '<div class="text-sm text-binos-gray mt-1">Track and manage property maintenance requests</div>' +
      '<div class="mt-4 flex flex-wrap gap-3">' +
      '<select class="select-field py-2 text-sm" data-filter-prop><option value="all">All Properties</option>' +
      properties.map(pr => '<option value="' + pr.id + '"' + (filterProp === pr.id ? ' selected' : '') + '>' + pr.scheme_name + '</option>').join('') + '</select>' +
      '<select class="select-field py-2 text-sm" data-filter-cat><option value="all">All Categories</option>' +
      ['roof','plumbing','electrical','hvac','painting','flooring','windows'].map(c => '<option value="' + c + '"' + (filterCategory === c ? ' selected' : '') + '>' + catInfo(c).label + '</option[...]
      '</div></div>';

    if (loading) html += '<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>';
    else if (error) html += '<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-5">' + error + '</div>';
    else {
      html += '<div class="flex-1 overflow-y-auto divide-y divide-binos-border/50">' + p.items.map(renderCard).join('') + '</div>';
      if (p.total > 0) html += '<div class="px-5 py-4 border-t border-binos-border flex items-center justify-between text-sm">' +
        '<span class="text-binos-gray">Showing ' + ((currentPage-1)*itemsPerPage+1) + '-' + Math.min(currentPage*itemsPerPage, p.total) + ' of ' + p.total + '</span>' +
        '<div class="flex gap-2"><button class="btn-secondary btn-sm" data-prev ' + (!p.hasPrev ? 'disabled' : '') + '>Previous</button>' +
        '<button class="btn-secondary btn-sm" data-next ' + (!p.hasNext ? 'disabled' : '') + '>Next</button></div></div>';
    }
    html += '</div><div class="hidden lg:block lg:w-3/5 relative">' + renderDetail() + '</div></div>' + renderFileModal();
    container.innerHTML = html;
    attachEvents();
  }

  function handleFileAction(el, attr) {
    const val = el.getAttribute(attr);
    if (!val) return null;
    try { return JSON.parse(val); } catch { return null; }
  }

  function attachEvents() {
    container.querySelectorAll('[data-select]').forEach(el => {
      el.onclick = () => { selectedItem = el.dataset.select; detailView = 'view'; render(); };
    });
    container.querySelectorAll('[data-close-panel]').forEach(el => {
      el.onclick = () => { selectedItem = null; render(); };
    });
    container.querySelectorAll('[data-view]').forEach(el => {
      el.onclick = () => { detailView = el.dataset.view; render(); };
    });
    container.querySelectorAll('[data-close-modal]').forEach(el => {
      el.onclick = () => { fileModal = null; render(); };
    });
    container.querySelectorAll('[data-file-modal]').forEach(el => {
      el.onclick = () => {
        const val = handleFileAction(el, 'data-file-modal');
        if (val) { fileModal = val; render(); }
      };
    });
    container.querySelectorAll('[data-file-view]').forEach(el => {
      el.onclick = () => {
        const val = handleFileAction(el, 'data-file-view');
        if (!val) return;
        const item = data.find(i => i.id == val.id);
        if (!item) return;
        const file = (item[val.type] || [])[val.idx];
        if (!file) return;
        if (val.type === 'images') {
          openImageViewer({
            url: file.url,
            name: file.name,
            onReplace(newFile) {
              uploadFile(val.id, val.type, newFile);
            },
            onDelete() {
              deleteFile(val.id, val.type, val.idx);
            },
          });
        } else {
          window.open(file.url, '_blank');
        }
      };
    });
    container.querySelectorAll('[data-file-download]').forEach(el => {
      el.onclick = () => {
        const val = handleFileAction(el, 'data-file-download');
        if (!val) return;
        const item = data.find(i => i.id == val.id);
        if (!item) return;
        const file = (item[val.type] || [])[val.idx];
        if (file) {
          const a = document.createElement('a');
          a.href = file.url;
          a.download = file.name || file.url.split('/').pop() || 'file';
          a.click();
        }
      };
    });
    container.querySelectorAll('[data-file-delete]').forEach(el => {
      el.onclick = () => {
        const val = handleFileAction(el, 'data-file-delete');
        if (val) deleteFile(val.id, val.type, val.idx);
      };
    });
    container.querySelectorAll('[data-file-upload]').forEach(el => {
      el.onchange = () => {
        const val = handleFileAction(el, 'data-file-upload');
        if (!val || !el.files.length) return;
        for (const file of el.files) uploadFile(val.id, val.type, file);
        el.value = '';
      };
    });
    container.querySelectorAll('[data-panel-upload]').forEach(el => {
      el.onchange = () => {
        const val = handleFileAction(el, 'data-panel-upload');
        if (!val || !el.files.length) return;
        for (const file of el.files) uploadFile(val.id, val.type, file);
        el.value = '';
      };
    });
    container.querySelectorAll('[data-delete-file]').forEach(el => {
      el.onclick = () => {
        const val = handleFileAction(el, 'data-delete-file');
        if (val) deleteFile(val.id, val.type, val.idx);
      };
    });
    const fp = container.querySelector('[data-filter-prop]');
    if (fp) fp.onchange = () => { filterProp = fp.value; currentPage = 1; render(); };
    const fc = container.querySelector('[data-filter-cat]');
    if (fc) fc.onchange = () => { filterCategory = fc.value; currentPage = 1; render(); };
    const prev = container.querySelector('[data-prev]');
    if (prev) prev.onclick = () => { if (currentPage > 1) { currentPage--; render(); } };
    const next = container.querySelector('[data-next]');
    if (next) next.onclick = () => { const p = paginated(); if (p.hasNext) { currentPage++; render(); } };
  }

  loadData();
}
