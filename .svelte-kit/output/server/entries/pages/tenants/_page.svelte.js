import { e as ensure_array_like, a as attr_class } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml } from "../../../chunks/api.js";
import { I as ICONS } from "../../../chunks/icons.js";
import { e as escape_html, a as attr } from "../../../chunks/attributes.js";
import { h as html } from "../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let state = {
      tenants: [],
      filterProp: "all",
      showForm: false,
      editingId: null,
      inspectModal: null,
      page: 1,
      pageSize: 10,
      loading: true,
      error: null,
      properties: [],
      form: {
        name: "",
        phone: "",
        email: "",
        property_id: null,
        lease_start: "",
        lease_end: "",
        lease_file: "",
        notes: ""
      },
      inspectForm: { date: "", notes: "", type: "report" }
    };
    async function loadData() {
      try {
        state = { ...state, loading: true, error: null };
        const [td, pd] = await Promise.all([apiClient.get("/tenants"), apiClient.get("/properties")]);
        state = {
          ...state,
          tenants: Array.isArray(td) ? td : [],
          properties: pd || [],
          loading: false
        };
      } catch (err) {
        state = { ...state, error: err.message, loading: false };
      }
    }
    function getFiltered() {
      return state.tenants.filter((t) => state.filterProp === "all" || t.property_id == state.filterProp);
    }
    function getPaginated() {
      const f = getFiltered(), s = (state.page - 1) * state.pageSize;
      return {
        items: f.slice(s, s + state.pageSize),
        total: f.length,
        hasPrev: state.page > 1,
        hasNext: state.page * state.pageSize < f.length
      };
    }
    loadData();
    $$renderer2.push(`<div class="flex flex-col h-full">`);
    if (state.loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>`);
    } else if (state.error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mx-5 mt-5"><div class="font-medium mb-1">Error</div><div class="text-sm">${escape_html(state.error)}</div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="px-5 py-4 border-b border-binos-border bg-white"><div class="flex flex-wrap items-center justify-between gap-4"><div class="flex flex-wrap items-center gap-3">`);
      $$renderer2.select(
        {
          class: "select-field py-2 pr-8 text-sm",
          value: state.filterProp,
          onchange: () => {
            state.page = 1;
          }
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All Properties`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(state.properties);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let p = each_array[$$index];
            $$renderer3.option({ value: p.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(p.scheme_name)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <button class="btn-primary btn-sm"><span class="mr-1">${html(ICONS.plus)}</span> Add Tenant</button></div></div> <div class="flex-1 overflow-auto"><div class="p-5">`);
      const each_array_1 = ensure_array_like(getPaginated().items);
      if (each_array_1.length !== 0) {
        $$renderer2.push("<!--[-->");
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let t = each_array_1[$$index_1];
          const now = Date.now();
          const end = t.lease_end ? new Date(t.lease_end).getTime() : null;
          const active = end ? now < end : true;
          $$renderer2.push(`<div class="card p-4 mb-4 hover:shadow-card-hover transition-shadow"><div class="flex items-start justify-between mb-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full bg-binos-green/10 flex items-center justify-center"><svg class="w-5 h-5 text-binos-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div> <div><h3 class="font-medium leading-tight">${escape_html(escHtml(t.name))}</h3><div class="text-xs text-binos-gray">${escape_html(t.property_id ? state.properties.find((p) => p.id == t.property_id)?.scheme_name || "Unknown" : "Unknown")}</div></div></div> <span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`)}>${escape_html(active ? "Active" : "Expired")}</span></div> <div class="flex gap-2 mt-3"><button class="btn-secondary btn-sm py-1.5 px-3">Edit</button> <button class="btn-danger btn-sm py-1.5 px-3">Delete</button></div></div>`);
        }
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="p-8 bg-gray-50 rounded-lg border text-center"><div class="text-binos-gray">No tenants found</div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (getPaginated().total > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="px-5 py-4 border-t border-binos-border bg-white flex items-center justify-between text-sm"><span class="text-binos-gray">Showing ${escape_html((state.page - 1) * state.pageSize + 1)}-${escape_html(Math.min(state.page * state.pageSize, getPaginated().total))} of ${escape_html(getPaginated().total)}</span> <div class="flex gap-2"><button class="btn-secondary btn-sm"${attr("disabled", !getPaginated().hasPrev, true)}>Previous</button> <button class="btn-secondary btn-sm"${attr("disabled", !getPaginated().hasNext, true)}>Next</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (state.showForm) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content max-w-lg"><div class="card-header flex items-center justify-between"><h3 class="font-display font-semibold">${escape_html(state.editingId ? "Edit Tenant" : "Add Tenant")}</h3> <button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="card-body"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Name *</label><input type="text" class="input-field"${attr("value", state.form.name)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="tel" class="input-field"${attr("value", state.form.phone)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field"${attr("value", state.form.email)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease Start</label><input type="date" class="input-field"${attr("value", state.form.lease_start)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease End</label><input type="date" class="input-field"${attr("value", state.form.lease_end)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label> `);
      $$renderer2.select({ class: "select-field", value: state.form.property_id }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select property`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(state.properties);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let p = each_array_2[$$index_2];
          $$renderer3.option({ value: p.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(p.scheme_name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Lease File URL</label><input type="url" class="input-field" placeholder="Link to lease doc"${attr("value", state.form.lease_file)}/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]">`);
      const $$body = escape_html(state.form.notes);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div></div> <div class="flex gap-3 pt-6"><button class="btn-secondary flex-1">Cancel</button> <button class="btn-primary flex-1"${attr("disabled", !state.form.name, true)}>Save</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (state.inspectModal) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content max-w-lg"><div class="card-header flex items-center justify-between"><h3 class="font-display font-semibold">${escape_html(escHtml(state.inspectModal.tenant?.name || ""))} - Inspection</h3> <button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="card-body max-h-[70vh] overflow-y-auto"><div class="mt-4 pt-4 border-t border-binos-border"><label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Upload File <input type="file" accept="image/*,.pdf,.doc,.docx" class="hidden"/></label></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
