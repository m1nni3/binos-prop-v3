import { e as ensure_array_like, a as attr_class, b as stringify } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml } from "../../../chunks/api.js";
import { I as ICONS } from "../../../chunks/icons.js";
import { e as escape_html, a as attr } from "../../../chunks/attributes.js";
import { h as html } from "../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let state = {
      contacts: [],
      filterProp: "all",
      filterRole: "all",
      filterCompany: "all",
      showForm: false,
      editingId: null,
      page: 1,
      pageSize: 12,
      loading: true,
      error: null,
      properties: [],
      showDeleteConfirm: null,
      form: {
        name: "",
        role: "",
        company: "",
        office: "",
        phone: "",
        office_number: "",
        email: "",
        address: "",
        website: "",
        category: "",
        notes: "",
        property_id: null,
        applyOffice: false
      }
    };
    async function loadData() {
      try {
        state = { ...state, loading: true, error: null };
        const [contactsData, propertiesData] = await Promise.all([apiClient.get("/contacts"), apiClient.get("/properties")]);
        state = {
          ...state,
          contacts: Array.isArray(contactsData) ? contactsData : [],
          properties: propertiesData || [],
          loading: false
        };
      } catch (err) {
        state = { ...state, error: err.message, loading: false };
      }
    }
    function uniqueValues(field) {
      return [
        ...new Set(state.contacts.map((c) => c[field]).filter(Boolean))
      ].sort();
    }
    function getFiltered() {
      return state.contacts.filter((c) => (state.filterProp === "all" || c.property_id == state.filterProp) && (state.filterRole === "all" || c.role === state.filterRole) && (state.filterCompany === "all" || c.company === state.filterCompany));
    }
    function getPaginated() {
      const f = getFiltered(), s = (state.page - 1) * state.pageSize;
      return {
        contacts: f.slice(s, s + state.pageSize),
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
      $$renderer2.push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mx-5 mt-5"><div class="font-medium mb-1">Error loading contacts</div><div class="text-sm">${escape_html(state.error)}</div></div>`);
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
      $$renderer2.push(` `);
      $$renderer2.select(
        {
          class: "select-field py-2 pr-8 text-sm",
          value: state.filterRole,
          onchange: () => {
            state.page = 1;
          }
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All Roles`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_1 = ensure_array_like(uniqueValues("role"));
          for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
            let r = each_array_1[$$index_1];
            $$renderer3.option({ value: r }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(r)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(` `);
      $$renderer2.select(
        {
          class: "select-field py-2 pr-8 text-sm",
          value: state.filterCompany,
          onchange: () => {
            state.page = 1;
          }
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All Companies`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array_2 = ensure_array_like(uniqueValues("company"));
          for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
            let c = each_array_2[$$index_2];
            $$renderer3.option({ value: c }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(c)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(`</div> <div class="flex items-center gap-3"><button class="btn-primary btn-sm"><span class="mr-1">${html(ICONS.plus)}</span> Add Contact</button> <button class="btn-secondary btn-sm"><span class="mr-1">${html(ICONS.download)}</span> Export CSV</button></div></div></div> <div class="flex-1 overflow-auto"><div class="p-5">`);
      const each_array_3 = ensure_array_like(getPaginated().contacts);
      if (each_array_3.length !== 0) {
        $$renderer2.push("<!--[-->");
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let c = each_array_3[$$index_3];
          const property = state.properties.find((p) => p.id == c.property_id);
          $$renderer2.push(`<div${attr_class(`card p-4 mb-4 hover:shadow-card-hover transition-shadow border-l-4 border-${stringify(property ? ["Oakdale", "Malindi", "Indaba", "Villeroy"].includes(property.scheme) ? {
            Oakdale: "blue",
            Malindi: "green",
            Indaba: "purple",
            Villeroy: "orange"
          }[property.scheme] : "blue" : "blue")}-500`)}><div class="flex items-start justify-between mb-2"><div class="flex items-center gap-3 min-w-0"><div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"><svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div> <div class="min-w-0"><h3 class="font-display font-medium leading-tight truncate">${escape_html(escHtml(c.name))}</h3>`);
          if (c.role) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="text-xs text-binos-gray truncate">${escape_html(escHtml(c.role))}</div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div></div> `);
          if (c.category) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="badge badge-blue flex-shrink-0">${escape_html(escHtml(c.category))}</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div> <div class="mt-3 flex gap-2"><button class="btn-secondary btn-sm py-1.5 px-3">Edit</button> <button class="btn-danger btn-sm py-1.5 px-3">Delete</button></div></div>`);
        }
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center"><div class="text-binos-gray">No contacts found</div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div> `);
      if (getPaginated().total > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="px-5 py-4 border-t border-binos-border bg-white"><div class="flex items-center justify-between"><span class="text-sm text-binos-gray">Showing ${escape_html((state.page - 1) * state.pageSize + 1)}-${escape_html(Math.min(state.page * state.pageSize, getPaginated().total))} of ${escape_html(getPaginated().total)}</span> <div class="flex gap-2"><button class="btn-secondary btn-sm"${attr("disabled", !getPaginated().hasPrev, true)}>Previous</button><button class="btn-secondary btn-sm"${attr("disabled", !getPaginated().hasNext, true)}>Next</button></div></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (state.showForm) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content max-w-2xl"><div class="card-header"><h3 class="font-display font-semibold">${escape_html(state.editingId ? "Edit Contact" : "Add New Contact")}</h3><button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="card-body"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Name *</label><input type="text" class="input-field"${attr("value", state.form.name)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Role</label><input type="text" class="input-field"${attr("value", state.form.role)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label>`);
      $$renderer2.select({ class: "select-field", value: state.form.category }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select`);
        });
        $$renderer3.option({ value: "owner" }, ($$renderer4) => {
          $$renderer4.push(`Owner`);
        });
        $$renderer3.option({ value: "secondary" }, ($$renderer4) => {
          $$renderer4.push(`Secondary`);
        });
        $$renderer3.option({ value: "technician" }, ($$renderer4) => {
          $$renderer4.push(`Technician`);
        });
        $$renderer3.option({ value: "provider" }, ($$renderer4) => {
          $$renderer4.push(`Provider`);
        });
      });
      $$renderer2.push(`</div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Company</label><input type="text" class="input-field"${attr("value", state.form.company)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office</label><input type="text" class="input-field"${attr("value", state.form.office)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="tel" class="input-field"${attr("value", state.form.phone)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Office Number</label><input type="tel" class="input-field"${attr("value", state.form.office_number)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field"${attr("value", state.form.email)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Property</label>`);
      $$renderer2.select({ class: "select-field", value: state.form.property_id }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select property`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_4 = ensure_array_like(state.properties);
        for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
          let p = each_array_4[$$index_4];
          $$renderer3.option({ value: p.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(p.scheme_name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Address</label><input type="text" class="input-field"${attr("value", state.form.address)}/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Website</label><input type="url" class="input-field"${attr("value", state.form.website)}/></div> <div class="md:col-span-2"><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]">`);
      const $$body = escape_html(state.form.notes);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div> `);
      if (state.form.office) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="md:col-span-2 pt-2 border-t border-binos-border/50"><label class="flex items-start gap-3 cursor-pointer"><input type="checkbox" class="mt-0.5 rounded border-binos-border text-binos-blue focus:ring-binos-blue/30"${attr("checked", state.form.applyOffice, true)}/> <div><div class="text-sm font-medium text-binos-navy">Apply to all contacts from this office</div><div class="text-xs text-binos-gray">Update address, website, and office number for all contacts with the same office</div></div></label></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <div class="flex gap-3 pt-6"><button class="btn-secondary flex-1">Cancel</button><button class="btn-primary flex-1"${attr("disabled", !state.form.name, true)}>Save Contact</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (state.showDeleteConfirm) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content max-w-md"><div class="p-6"><div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></div> <h3 class="font-display font-semibold text-center mb-2">Delete Contact</h3><p class="text-binos-gray text-sm text-center mb-6">Are you sure you want to delete <span class="font-medium text-binos-navy">${escape_html(state.contacts.find((c) => c.id === state.showDeleteConfirm)?.name)}</span>? This action cannot be undone.</p> <div class="flex gap-3"><button class="btn-secondary flex-1">Cancel</button><button class="btn-danger flex-1">Delete</button></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
