import { e as ensure_array_like, a as attr_class, b as stringify } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml, f as formatRelativeTime } from "../../../chunks/api.js";
import { t as toast } from "../../../chunks/stores.js";
import { h as html } from "../../../chunks/html.js";
import { e as escape_html } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activities = [];
    let loading = true;
    const ACTION_ICONS = {
      create: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>',
      update: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>',
      delete: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>',
      login: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/></svg>'
    };
    const ACTION_COLORS = {
      create: "bg-green-100 text-green-600",
      update: "bg-blue-100 text-blue-600",
      delete: "bg-red-100 text-red-600",
      login: "bg-purple-100 text-purple-600"
    };
    async function loadData() {
      try {
        loading = true;
        const data = await apiClient.get("/activity");
        activities = Array.isArray(data) ? data : [];
      } catch {
        toast("error", "Failed to load activity");
      }
      loading = false;
    }
    loadData();
    $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><h2 class="page-title">Activity Feed</h2> <div class="flex gap-2"><button class="btn-secondary btn-sm">Refresh</button> <button class="btn-danger btn-sm">Clear All</button></div></div> `);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array = ensure_array_like(Array(8));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        each_array[$$index];
        $$renderer2.push(`<div class="card p-4 flex items-center gap-3"><div class="w-8 h-8 rounded-full skeleton"></div> <div class="flex-1"><div class="skeleton-text mb-1"></div><div class="skeleton-text w-1/3"></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else if (activities.length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="p-8 text-center text-binos-gray bg-gray-50 rounded-lg">No activity recorded</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(activities);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let a = each_array_1[$$index_1];
        const action = a.action || "update";
        const icon = ACTION_ICONS[action] || ACTION_ICONS.update;
        const color = ACTION_COLORS[action] || ACTION_COLORS.update;
        const entityType = (a.entity_type || "").replace(/_/g, " ");
        $$renderer2.push(`<div class="card p-4 flex items-center gap-3"><div${attr_class(`w-8 h-8 rounded-full flex items-center justify-center ${stringify(color)}`)}>${html(icon)}</div> <div class="flex-1 min-w-0"><div class="text-sm"><span class="font-medium">${escape_html(action.charAt(0).toUpperCase() + action.slice(1))}</span> <span class="text-binos-gray">${escape_html(entityType)}</span> `);
        if (a.entity_label) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="font-medium">${escape_html(escHtml(a.entity_label))}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <div class="text-xs text-binos-gray mt-0.5">${escape_html(formatRelativeTime(a.created_at))} `);
        if (a.actor) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`· ${escape_html(escHtml(a.actor.substring(0, 20)))}`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
