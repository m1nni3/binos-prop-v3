import { e as ensure_array_like, a as attr_class, b as stringify } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml } from "../../../chunks/api.js";
import { e as escape_html, a as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let data = [];
    let selectedItem = null;
    let filterProp = "all";
    let filterCategory = "all";
    let currentPage = 1;
    const itemsPerPage = 10;
    let loading = true;
    let error = null;
    let properties = [];
    const CATEGORIES = {
      roof: { color: "blue", label: "Roof" },
      plumbing: { color: "cyan", label: "Plumbing" },
      electrical: { color: "yellow", label: "Electrical" },
      hvac: { color: "green", label: "HVAC" },
      painting: { color: "pink", label: "Painting" },
      flooring: { color: "orange", label: "Flooring" },
      windows: { color: "purple", label: "Windows" }
    };
    function catInfo(c) {
      return CATEGORIES[c] || { color: "gray", label: c };
    }
    function propName(id) {
      return properties.find((p) => p.id === id)?.scheme_name || "Unknown";
    }
    function filtered() {
      return data.filter((i) => filterCategory === "all");
    }
    function paginated() {
      const f = filtered(), s = (currentPage - 1) * itemsPerPage;
      return {
        items: f.slice(s, s + itemsPerPage),
        total: f.length,
        hasPrev: currentPage > 1,
        hasNext: currentPage * itemsPerPage < f.length
      };
    }
    async function loadData() {
      try {
        loading = true;
        error = null;
        const [md, pd] = await Promise.all([apiClient.get("/maintenance"), apiClient.get("/properties")]);
        data = Array.isArray(md) ? md : [];
        properties = pd || [];
        loading = false;
      } catch (e) {
        error = e.message;
        loading = false;
      }
    }
    loadData();
    $$renderer2.push(`<div class="flex h-full"><div class="w-full lg:w-2/5 border-r border-binos-border bg-white flex flex-col"><div class="p-5 border-b border-binos-border bg-binos-light/50"><h2 class="page-title">Maintenance</h2> <div class="text-sm text-binos-gray mt-1">Track and manage property maintenance requests</div> <div class="mt-4 flex flex-wrap gap-3">`);
    $$renderer2.select(
      {
        class: "select-field py-2 text-sm",
        value: filterProp,
        onchange: () => currentPage = 1
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`All Properties`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array = ensure_array_like(properties);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let pr = each_array[$$index];
          $$renderer3.option({ value: pr.id }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(pr.scheme_name)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(` `);
    $$renderer2.select(
      {
        class: "select-field py-2 text-sm",
        value: filterCategory,
        onchange: () => currentPage = 1
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all" }, ($$renderer4) => {
          $$renderer4.push(`All Categories`);
        });
        $$renderer3.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(Object.entries(CATEGORIES));
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let [key, val] = each_array_1[$$index_1];
          $$renderer3.option({ value: key }, ($$renderer4) => {
            $$renderer4.push(`${escape_html(val.label)}`);
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
    );
    $$renderer2.push(`</div></div> `);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>`);
    } else if (error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-5">${escape_html(error)}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex-1 overflow-y-auto divide-y divide-binos-border/50"><!--[-->`);
      const each_array_2 = ensure_array_like(paginated().items);
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let item = each_array_2[$$index_2];
        const ci = catInfo(item.category);
        const sel = selectedItem === item.id;
        $$renderer2.push(`<div${attr_class("card p-4 cursor-pointer transition-all", void 0, { "ring-2": ring - 2, "ring-binos-blue": sel })}><div class="flex items-start justify-between mb-3"><div class="flex items-center gap-2"><div${attr_class(`w-8 h-8 rounded-full bg-${stringify(ci.color)}-100 flex items-center justify-center text-${stringify(ci.color)}-700`)}><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div> <div><h3 class="font-medium text-base leading-tight mb-1">${escape_html(escHtml(item.title))}</h3><div class="text-xs text-binos-gray">${escape_html(propName(item.property_id))}</div></div></div> <span${attr_class(`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${stringify(ci.color)}-100 text-${stringify(ci.color)}-800`)}>${escape_html(ci.label)}</span></div></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (paginated().total > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="px-5 py-4 border-t border-binos-border flex items-center justify-between text-sm"><span class="text-binos-gray">Showing ${escape_html((currentPage - 1) * itemsPerPage + 1)}-${escape_html(Math.min(currentPage * itemsPerPage, paginated().total))} of ${escape_html(paginated().total)}</span> <div class="flex gap-2"><button class="btn-secondary btn-sm"${attr("disabled", !paginated().hasPrev, true)}>Previous</button><button class="btn-secondary btn-sm"${attr("disabled", !paginated().hasNext, true)}>Next</button></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div> <div class="hidden lg:block lg:w-3/5 relative">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
export {
  _page as default
};
