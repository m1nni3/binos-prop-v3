import { g as getContext, e as ensure_array_like, s as store_get, a as attr_class, b as stringify, u as unsubscribe_stores } from "../../chunks/index2.js";
import "clsx";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../chunks/root.js";
import "../../chunks/state.svelte.js";
import { I as ICONS } from "../../chunks/icons.js";
import { n as notifications } from "../../chunks/stores.js";
import { e as escape_html, a as attr } from "../../chunks/attributes.js";
import { h as html } from "../../chunks/html.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function Toast($$renderer) {
  var $$store_subs;
  const styles = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-binos-blue"
  };
  $$renderer.push(`<!--[-->`);
  const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$notifications", notifications));
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let n = each_array[$$index];
    $$renderer.push(`<div${attr_class(`${stringify(styles[n.type] || styles.info)} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-slideInRight flex items-center gap-2 max-w-sm`)}>${escape_html(n.message)}</div>`);
  }
  $$renderer.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const navSections = [
      {
        label: "Management",
        items: [
          {
            name: "Properties",
            path: "/properties",
            icon: "building2",
            color: "blue"
          },
          {
            name: "Finances",
            path: "/finances",
            icon: "chart",
            color: "green"
          },
          {
            name: "Contacts",
            path: "/contacts",
            icon: "phone",
            color: "orange"
          },
          {
            name: "Maintenance",
            path: "/maintenance",
            icon: "wrench",
            color: "yellow"
          }
        ]
      },
      {
        label: "Operations",
        items: [
          {
            name: "Petty Cash",
            path: "/petty-cash",
            icon: "wallet",
            color: "purple"
          },
          { name: "Tasks", path: "/tasks", icon: "check", color: "teal" },
          {
            name: "Activity",
            path: "/activity",
            icon: "bell",
            color: "pink"
          },
          {
            name: "Tenants",
            path: "/tenants",
            icon: "user",
            color: "green"
          }
        ]
      },
      {
        label: "Reports",
        items: [
          {
            name: "Debrief",
            path: "/debrief",
            icon: "message",
            color: "cyan"
          }
        ]
      }
    ];
    const extraLinks = [
      {
        name: "Portals",
        path: "/portals",
        icon: "globe",
        color: "cyan"
      },
      {
        name: "Settings",
        path: "/settings",
        icon: "settings",
        color: "gray"
      }
    ];
    let settings = {};
    function isActive(path) {
      return store_get($$store_subs ??= {}, "$page", page).url.pathname === path;
    }
    $$renderer2.push(`<div id="sidebar-overlay"${attr_class("fixed inset-0 bg-black/50 z-40 hidden lg:hidden", void 0, { "hidden": true })}></div> <aside id="sidebar"${attr_class("fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-binos-sidebar-gradient-from to-binos-sidebar-gradient-to flex flex-col transition-transform duration-300 lg:translate-x-0", void 0, { "-translate-x-full": true })}><div class="flex items-center gap-3 px-5 py-5 border-b border-white/10 sidebar-logo-area">`);
    if (settings.logo) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", settings.logo)} class="h-9 w-auto max-w-[160px] object-contain" alt="Logo"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="w-9 h-9 rounded-lg bg-gradient-to-br from-binos-blue to-binos-purple flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div> <div><div class="text-white font-display font-bold text-lg leading-tight">Binos</div> <div class="text-binos-gray text-xs">Property Management</div></div>`);
    }
    $$renderer2.push(`<!--]--></div> <nav class="flex-1 overflow-y-auto px-3 py-4"><!--[-->`);
    const each_array = ensure_array_like(navSections);
    for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
      let section = each_array[$$index_1];
      $$renderer2.push(`<div class="mb-6"><div class="px-3 mb-2 text-xs font-semibold text-binos-gray uppercase tracking-wider">${escape_html(section.label)}</div> <!--[-->`);
      const each_array_1 = ensure_array_like(section.items);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let item = each_array_1[$$index];
        $$renderer2.push(`<a${attr("href", item.path)}${attr_class("sidebar-link mb-1", void 0, { "active": isActive(item.path) })}><span${attr_class(`sidebar-icon-${stringify(item.color)}`)}>${html(ICONS[item.icon])}</span> <span>${escape_html(item.name)}</span></a>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="mt-auto border-t border-white/10 pt-4 space-y-1"><!--[-->`);
    const each_array_2 = ensure_array_like(extraLinks);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let item = each_array_2[$$index_2];
      $$renderer2.push(`<a${attr("href", item.path)}${attr_class("sidebar-link mb-1", void 0, { "active": isActive(item.path) })}><span${attr_class(`sidebar-icon-${stringify(item.color)}`)}>${html(ICONS[item.icon])}</span> <span>${escape_html(item.name)}</span></a>`);
    }
    $$renderer2.push(`<!--]--></div></nav></aside> <div class="lg:ml-64 min-h-screen"><header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-binos-border"><div class="flex items-center justify-between px-4 lg:px-6 py-3"><div class="flex items-center gap-3"><button class="lg:hidden p-2 rounded-lg hover:bg-binos-light">${html(ICONS.menu)}</button> <div class="relative hidden sm:block"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-binos-gray">${html(ICONS.search)}</span> <input type="text" placeholder="Search properties, contacts..." class="pl-10 pr-4 py-2 bg-binos-light border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-binos-blue/30 focus:outline-none"/></div></div> <div class="flex items-center gap-4"><button class="relative p-2 rounded-lg hover:bg-binos-light">${html(ICONS.bell)} <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-binos-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span></button> <div class="flex items-center gap-2 pl-4 border-l border-binos-border"><div class="w-8 h-8 rounded-full bg-gradient-to-br from-binos-blue to-binos-purple flex items-center justify-center"><span class="text-white text-sm font-medium">MP</span></div> <span class="hidden sm:inline text-sm font-medium">MP</span></div></div></div></header> <main id="page-content" class="p-4 lg:p-6">`);
    children($$renderer2);
    $$renderer2.push(`<!----></main></div> <div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">`);
    Toast($$renderer2);
    $$renderer2.push(`<!----></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _layout as default
};
