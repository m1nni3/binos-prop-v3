import { e as ensure_array_like, a as attr_class, a5 as attr_style, a4 as derived, b as stringify } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml, d as formatCurrency, b as formatNumber, c as formatDate } from "../../../chunks/api.js";
import { e as escape_html, a as attr, c as clsx } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const PROPERTY_COLORS = {
      Oakdale: "blue",
      Malindi: "green",
      Indaba: "purple",
      Villeroy: "orange"
    };
    const PROPERTY_DETAIL_TABS = [
      "Overview",
      "Financials",
      "Contacts",
      "Maintenance",
      "Documents",
      "Valuation",
      "Insurances",
      "Bonds",
      "History",
      "Notes",
      "Mapping",
      "Access",
      "Tags",
      "Timeline"
    ];
    const PROPERTY_SECTIONS = {
      Overview: [
        "scheme_name",
        "purchase_price",
        "purchase_date",
        "size",
        "beds",
        "baths",
        "address"
      ],
      Financials: ["value", "rental_income", "expenses", "profit_margin"],
      Contacts: [
        "primary_contact",
        "contact_phone",
        "contact_email",
        "secondary_contact"
      ],
      Maintenance: [
        "last_maintenance_date",
        "next_maintenance_due",
        "maintenance_budget"
      ],
      Documents: ["doc_summary", "doc_last_updated", "doc_status"],
      Valuation: [
        "current_valuation",
        "valuation_date",
        "valuation_company",
        "valuation_agent"
      ],
      Insurances: [
        "insurance_provider",
        "insurance_policy",
        "insurance_expires",
        "insurance_coverage"
      ],
      Bonds: ["bond_holder", "bond_amount", "bond_expiry", "bond_status"],
      History: [
        "history_summary",
        "first_owned",
        "previous_owner",
        "acquisition_cost"
      ],
      Notes: ["notes_summary", "notes_content", "priority_level"],
      Mapping: ["location_notes", "gps_coordinates", "land_size", "zoning"],
      Access: ["lock_system", "key_holder", "access_description"],
      Tags: ["tag_list", "custom_tags", "tag_status"],
      Timeline: ["timeline_events"]
    };
    const CURRENCY_FIELDS = [
      "purchase_price",
      "value",
      "rental_income",
      "expenses",
      "profit_margin",
      "current_valuation",
      "insurance_coverage",
      "bond_amount",
      "valuation_date",
      "deducted_expenses",
      "amount_inclusive",
      "amount_exclusive"
    ];
    const DATE_FIELDS = [
      "purchase_date",
      "last_maintenance_date",
      "next_maintenance_due",
      "valuation_date",
      "insurance_expires",
      "bond_expiry",
      "first_owned"
    ];
    const NUMBER_FIELDS = ["size", "beds", "baths", "maintenance_budget"];
    let activeTab = derived(() => PROPERTY_DETAIL_TABS[state.tab]);
    let currentFields = derived(() => PROPERTY_SECTIONS[activeTab()] || []);
    let state = {
      properties: [],
      selected: null,
      detail: null,
      slideLoading: false,
      tab: 0,
      editing: false,
      editForm: {},
      saving: false,
      searchQuery: "",
      page: 1,
      pageSize: 20,
      loading: true,
      error: null,
      showAddModal: false,
      addProperty: {
        scheme_name: "",
        purchase_price: "",
        purchase_date: "",
        scheme: ""
      },
      filters: { scheme: "all", status: "all", type: "all" },
      sort: "name",
      showContactModal: false,
      contactForm: {
        name: "",
        phone: "",
        email: "",
        category: "",
        notes: "",
        property_id: null
      },
      contactSaving: false
    };
    async function loadProperties() {
      try {
        state = { ...state, loading: true, error: null };
        const data = await apiClient.get("/properties");
        state = {
          ...state,
          properties: Array.isArray(data) ? data : [],
          loading: false
        };
      } catch (err) {
        state = { ...state, error: err.message, loading: false };
      }
    }
    function getFiltered() {
      return state.properties.filter((p) => {
        const q = state.searchQuery.toLowerCase();
        return (!state.searchQuery || p.scheme_name?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)) && (state.filters.scheme === "all" || p.scheme === state.filters.scheme) && (state.filters.status === "all" || p.status === state.filters.status) && (state.filters.type === "all" || p.type === state.filters.type);
      }).sort((a, b) => {
        if (state.sort === "name") return (a.scheme_name || "").localeCompare(b.scheme_name || "");
        if (state.sort === "value") return (b.value || 0) - (a.value || 0);
        if (state.sort === "date") return new Date(b.purchase_date || 0).getTime() - new Date(a.purchase_date || 0).getTime();
        return 0;
      });
    }
    function isCurrencyField(f) {
      return CURRENCY_FIELDS.includes(f);
    }
    function isDateField(f) {
      return DATE_FIELDS.includes(f);
    }
    function isNumberField(f) {
      return NUMBER_FIELDS.includes(f);
    }
    function formatFieldLabel(f) {
      return f.replace(/_/g, " ").replace(/^./, (m) => m.toUpperCase());
    }
    loadProperties();
    $$renderer2.push(`<div class="flex h-full"><div class="flex-1 overflow-auto"><div class="flex items-center justify-between px-5 py-3 border-b border-binos-border bg-white"><h2 class="page-title">Properties</h2> <button class="btn-primary btn-sm">+ Add Property</button></div> `);
    if (state.loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex justify-center py-12"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-binos-blue"></div></div>`);
    } else if (state.error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700 m-5"><div class="font-medium mb-1">Error loading properties</div><div class="text-sm">${escape_html(escHtml(state.error))}</div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="p-5 border-b border-binos-border bg-white/50 flex items-center justify-between gap-3 flex-wrap"><div class="text-sm text-binos-gray">Showing ${escape_html(Math.min(state.page, Math.ceil(getFiltered().length / state.pageSize)) > 0 ? (state.page - 1) * state.pageSize + 1 : 0)}-${escape_html(Math.min(state.page * state.pageSize, getFiltered().length))} of ${escape_html(getFiltered().length)} properties</div> <div class="flex gap-3"><div class="relative"><input type="text" placeholder="Search..." class="input-field pl-9 pr-3 py-1.5 text-sm w-48"${attr("value", state.searchQuery)}/> <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> `);
      $$renderer2.select(
        {
          class: "select-field py-1.5 text-sm",
          value: state.filters.scheme,
          onchange: () => state.page = 1
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All Schemes`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(Object.keys(PROPERTY_COLORS));
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let k = each_array[$$index];
            $$renderer3.option({ value: k }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(k)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
        }
      );
      $$renderer2.push(` `);
      $$renderer2.select(
        {
          class: "select-field py-1.5 text-sm",
          value: state.filters.status,
          onchange: () => state.page = 1
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All Status`);
          });
          $$renderer3.option({ value: "Active" }, ($$renderer4) => {
            $$renderer4.push(`Active`);
          });
          $$renderer3.option({ value: "Pending" }, ($$renderer4) => {
            $$renderer4.push(`Pending`);
          });
          $$renderer3.option({ value: "Sold" }, ($$renderer4) => {
            $$renderer4.push(`Sold`);
          });
          $$renderer3.option({ value: "Under Maintenance" }, ($$renderer4) => {
            $$renderer4.push(`Under Maintenance`);
          });
        }
      );
      $$renderer2.push(` `);
      $$renderer2.select({ class: "select-field py-1.5 text-sm", value: state.sort }, ($$renderer3) => {
        $$renderer3.option({ value: "name" }, ($$renderer4) => {
          $$renderer4.push(`Sort by Name`);
        });
        $$renderer3.option({ value: "value" }, ($$renderer4) => {
          $$renderer4.push(`Sort by Value`);
        });
        $$renderer3.option({ value: "date" }, ($$renderer4) => {
          $$renderer4.push(`Sort by Date`);
        });
      });
      $$renderer2.push(`</div></div> <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">`);
      const each_array_1 = ensure_array_like(getFiltered().slice((state.page - 1) * state.pageSize, state.page * state.pageSize));
      if (each_array_1.length !== 0) {
        $$renderer2.push("<!--[-->");
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let p = each_array_1[$$index_1];
          const colorClass = PROPERTY_COLORS[p.scheme] || "blue";
          $$renderer2.push(`<div${attr_class("card cursor-pointer group", void 0, { "ring-2": ring - 2, "ring-binos-blue": state.selected === p.id })}><div class="relative h-40 overflow-hidden rounded-t-card bg-binos-light"><div class="w-full h-full flex items-center justify-center text-binos-gray"><svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div> <div class="absolute top-2 right-2"><span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${stringify(colorClass)}-100 text-${stringify(colorClass)}-800`)}>${escape_html(escHtml(p.scheme))}</span></div></div> <div class="p-4"><h3 class="font-display font-semibold text-lg mb-1 truncate group-hover:text-binos-blue transition-colors">${escape_html(escHtml(p.scheme_name))}</h3> <div class="text-sm text-binos-gray mb-3 truncate">${escape_html(escHtml(p.address))}</div> <div class="grid grid-cols-2 gap-3 text-sm"><div><div class="text-binos-gray text-xs mb-0.5">Purchase Price</div><div class="font-medium amount-neutral">${escape_html(formatCurrency(p.purchase_price))}</div></div> <div><div class="text-binos-gray text-xs mb-0.5">Current Value</div><div class="font-medium amount-positive">${escape_html(formatCurrency(p.value))}</div></div> <div><div class="text-binos-gray text-xs mb-0.5">Size</div><div class="font-medium">${escape_html(formatNumber(p.size))} m²</div></div> <div><div class="text-binos-gray text-xs mb-0.5">Beds/Baths</div><div class="font-medium">${escape_html(p.beds || 0)}/${escape_html(p.baths || 0)}</div></div></div></div></div>`);
        }
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="col-span-full p-8 bg-gray-50 rounded-lg border border-gray-200 text-center"><div class="text-binos-gray">No properties found</div></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (getFiltered().length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="px-5 py-4 border-t border-binos-border flex items-center justify-between"><div class="text-sm text-binos-gray">Page ${escape_html(state.page)} of ${escape_html(Math.ceil(getFiltered().length / state.pageSize))}</div> <div class="flex gap-2"><button class="btn-secondary btn-sm"${attr("disabled", state.page <= 1, true)}>Previous</button> <button class="btn-secondary btn-sm"${attr("disabled", state.page >= Math.ceil(getFiltered().length / state.pageSize), true)}>Next</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (state.selected !== null) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="fixed inset-y-0 right-0 w-full lg:w-[600px] bg-white border-l border-binos-border shadow-xl z-30 flex flex-col" id="property-detail-panel"><div class="flex items-center justify-between px-5 py-4 border-b border-binos-border bg-white/95 backdrop-blur-sm"><div class="flex items-center gap-2"><button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button> <h3 class="font-display font-semibold text-lg">Property Details</h3></div> <div class="flex items-center gap-2"><button class="btn-secondary btn-sm"${attr_style(state.editing ? "background:rgba(59,130,246,0.1);color:#3b82f6;border-color:#3b82f6" : "")}>${escape_html(state.editing ? "Cancel" : "Edit")}</button> <button class="btn-primary btn-sm"${attr("disabled", state.saving, true)}>${escape_html(state.saving ? "Saving..." : "Save")}</button></div></div> `);
      if (state.slideLoading) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex-1 flex items-center justify-center"><div class="animate-spin rounded-full h-10 w-10 border-b-2 border-binos-blue"></div></div>`);
      } else if (state.detail?.error) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="flex-1 p-6"><div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"><div class="font-medium mb-1">Error loading property details</div><div class="text-sm">${escape_html(escHtml(state.detail.error))}</div></div></div>`);
      } else if (state.detail) {
        $$renderer2.push("<!--[2-->");
        const colorClass = PROPERTY_COLORS[state.detail.scheme] || "blue";
        $$renderer2.push(`<div class="flex-1 overflow-y-auto"><div class="p-5 border-b border-binos-border bg-binos-light/50"><div class="flex items-start gap-4"><div${attr_class(`w-16 h-16 rounded-lg bg-gradient-to-br from-${stringify(colorClass)}-100 to-${stringify(colorClass)}-200 flex items-center justify-center text-${stringify(colorClass)}-700 font-bold text-xl`)}>${escape_html((state.detail.scheme?.charAt(0) || "P").toUpperCase())}</div> <div class="flex-1"><h2 class="font-display font-semibold text-xl mb-1">${escape_html(escHtml(state.detail.scheme_name))}</h2> <div class="text-sm text-binos-gray mb-3">${escape_html(escHtml(state.detail.address))}</div> <div class="flex flex-wrap gap-2"><span class="badge badge-blue">${escape_html(escHtml(state.detail.status))}</span><span class="badge badge-gray">${escape_html(escHtml(state.detail.type))}</span><span class="badge badge-green">${escape_html(formatCurrency(state.detail.value))}</span></div></div> <div class="text-right"><div class="text-xs text-binos-gray mb-1">Purchase Date</div><div class="text-sm font-medium">${escape_html(formatDate(state.detail.purchase_date))}</div></div></div></div> <div class="border-b border-binos-border bg-white sticky top-0 z-20"><div class="flex overflow-x-auto px-5"><!--[-->`);
        const each_array_2 = ensure_array_like(PROPERTY_DETAIL_TABS);
        for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
          let tab = each_array_2[i];
          $$renderer2.push(`<button${attr_class(clsx(state.tab === i ? "tab-item-active" : "tab-item-inactive"))}>${escape_html(tab)}</button>`);
        }
        $$renderer2.push(`<!--]--></div></div> <div class="p-5">`);
        if (state.editing) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="bg-binos-light/50 rounded-lg p-4 mb-4"><div class="text-sm font-medium text-binos-gray mb-3">Editing ${escape_html(activeTab())}</div> <div class="grid grid-cols-2 gap-3"><!--[-->`);
          const each_array_3 = ensure_array_like(currentFields());
          for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
            let field = each_array_3[$$index_3];
            $$renderer2.push(`<div><label class="block text-xs text-binos-gray mb-1.5">${escape_html(formatFieldLabel(field))}</label> <input${attr("type", isDateField(field) ? "date" : "text")} class="input-field text-xs"${attr("value", state.editForm[field] ?? state.detail[field] ?? "")}/></div>`);
          }
          $$renderer2.push(`<!--]--></div></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><!--[-->`);
          const each_array_4 = ensure_array_like(currentFields());
          for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
            let field = each_array_4[$$index_4];
            const raw = state.detail[field];
            $$renderer2.push(`<div class="dl-row"><div class="dl-label">${escape_html(formatFieldLabel(field))}</div> <div class="dl-value">${escape_html(isCurrencyField(field) ? formatCurrency(raw) : isDateField(field) ? formatDate(raw) : isNumberField(field) ? formatNumber(raw) : raw ?? "—")}</div></div>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<div class="flex-1 p-6 text-center text-binos-gray"><div class="w-12 h-12 bg-binos-light rounded-full flex items-center justify-center mx-auto mb-3"><svg class="w-6 h-6 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div><div>No property details available</div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (state.showAddModal) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content"><div class="card-header"><h3 class="font-display font-semibold">Add New Property</h3><button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="card-body"><div class="space-y-4"><div><label class="block text-sm font-medium text-binos-gray mb-1.5">Scheme Name</label><input type="text" class="input-field"${attr("value", state.addProperty.scheme_name)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Purchase Price</label><input type="text" class="input-field"${attr("value", state.addProperty.purchase_price)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Purchase Date</label><input type="date" class="input-field"${attr("value", state.addProperty.purchase_date)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Scheme</label>`);
      $$renderer2.select({ class: "select-field", value: state.addProperty.scheme }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select scheme`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_5 = ensure_array_like(Object.keys(PROPERTY_COLORS));
        for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
          let s = each_array_5[$$index_5];
          $$renderer3.option({ value: s }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(s)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      });
      $$renderer2.push(`</div> <div class="flex gap-3 pt-2"><button class="btn-secondary flex-1">Cancel</button><button class="btn-primary flex-1"${attr("disabled", state.saving, true)}>${escape_html(state.saving ? "Saving..." : "Save")}</button></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (state.showContactModal) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="modal-overlay"><div class="modal-content"><div class="card-header"><h3 class="font-display font-semibold">Add Contact</h3><button class="p-1.5 rounded-lg hover:bg-binos-light"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="card-body"><div class="space-y-4"><div><label class="block text-sm font-medium text-binos-gray mb-1.5">Name</label><input type="text" class="input-field"${attr("value", state.contactForm.name)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Phone</label><input type="text" class="input-field"${attr("value", state.contactForm.phone)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Email</label><input type="email" class="input-field"${attr("value", state.contactForm.email)}/></div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Category</label>`);
      $$renderer2.select({ class: "select-field", value: state.contactForm.category }, ($$renderer3) => {
        $$renderer3.option({ value: "" }, ($$renderer4) => {
          $$renderer4.push(`Select`);
        });
        $$renderer3.option({ value: "owner" }, ($$renderer4) => {
          $$renderer4.push(`Owner`);
        });
        $$renderer3.option({ value: "secondary" }, ($$renderer4) => {
          $$renderer4.push(`Secondary`);
        });
      });
      $$renderer2.push(`</div> <div><label class="block text-sm font-medium text-binos-gray mb-1.5">Notes</label><textarea class="input-field min-h-[80px]">`);
      const $$body = escape_html(state.contactForm.notes);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea></div> <div class="flex gap-3 pt-2"><button class="btn-secondary flex-1">Cancel</button><button class="btn-primary flex-1"${attr("disabled", state.contactSaving, true)}>${escape_html(state.contactSaving ? "Saving..." : "Save Contact")}</button></div></div></div></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
