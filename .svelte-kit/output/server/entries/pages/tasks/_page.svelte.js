import { e as ensure_array_like, a as attr_class } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml, c as formatDate } from "../../../chunks/api.js";
import { t as toast } from "../../../chunks/stores.js";
import { a as attr, e as escape_html, c as clsx } from "../../../chunks/attributes.js";
import { h as html } from "../../../chunks/html.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let items = [];
    let filter = "all";
    let form = { title: "", description: "", priority: "medium", due_date: "" };
    let selected = /* @__PURE__ */ new Set();
    let loading = true;
    async function loadData() {
      try {
        loading = true;
        const data = await apiClient.get("/tasks");
        items = Array.isArray(data) ? data : [];
      } catch {
        toast("error", "Failed to load tasks");
      }
      loading = false;
    }
    function filtered() {
      return items;
    }
    function statusIcon(s) {
      if (s === "done") return '<svg class="w-5 h-5 text-binos-green" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';
      if (s === "in_progress") return '<svg class="w-5 h-5 text-binos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/><path stroke-width="2" d="M12 6v6l4 2"/></svg>';
      return '<svg class="w-5 h-5 text-binos-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"/></svg>';
    }
    loadData();
    $$renderer2.push(`<div class="space-y-6"><div class="card p-4"><div class="grid grid-cols-1 md:grid-cols-4 gap-3"><input class="input-field md:col-span-2" placeholder="Task title"${attr("value", form.title)}/> `);
    $$renderer2.select({ class: "select-field", value: form.priority }, ($$renderer3) => {
      $$renderer3.option({ value: "low" }, ($$renderer4) => {
        $$renderer4.push(`low`);
      });
      $$renderer3.option({ value: "medium" }, ($$renderer4) => {
        $$renderer4.push(`medium`);
      });
      $$renderer3.option({ value: "high" }, ($$renderer4) => {
        $$renderer4.push(`high`);
      });
    });
    $$renderer2.push(` <input class="input-field" type="date"${attr("value", form.due_date)}/> <textarea class="input-field md:col-span-2" placeholder="Description" rows="2">`);
    const $$body = escape_html(form.description);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> <div class="flex gap-2"><button class="btn-primary btn-sm">${escape_html("Add Task")}</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="tab-bar"><!--[-->`);
    const each_array = ensure_array_like(["all", "pending", "in_progress", "done"]);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let f = each_array[$$index];
      $$renderer2.push(`<button${attr_class(clsx(filter === f ? "tab-item-active" : "tab-item-inactive"))}>${escape_html(f.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))}</button>`);
    }
    $$renderer2.push(`<!--]--></div> `);
    if (selected.size > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200"><span class="text-sm text-red-700">${escape_html(selected.size)} selected</span> <button class="btn-danger btn-sm">Delete Selected</button> <button class="btn-secondary btn-sm">Clear</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-binos-blue"></div></div>`);
    } else if (filtered().length === 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="p-8 text-center text-binos-gray bg-gray-50 rounded-lg">No tasks found</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-3"><!--[-->`);
      const each_array_1 = ensure_array_like(filtered());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let item = each_array_1[$$index_1];
        $$renderer2.push(`<div class="card p-4 flex items-center gap-3"><input type="checkbox" class="w-4 h-4 rounded border-binos-border"${attr("checked", selected.has(item.id), true)}/> <button class="flex-shrink-0">${html(statusIcon(item.status))}</button> <div class="flex-1 min-w-0"><div class="font-medium text-sm">${escape_html(escHtml(item.title))}</div> `);
        if (item.description) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="text-xs text-binos-gray truncate">${escape_html(escHtml(item.description))}</div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <div class="flex items-center gap-2 mt-1 text-xs text-binos-gray"><span${attr_class(`badge badge-${item.priority === "high" ? "red" : item.priority === "medium" ? "orange" : "green"}`)}>${escape_html(item.priority)}</span> `);
        if (item.due_date) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span>Due: ${escape_html(formatDate(item.due_date))}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <span>Created: ${escape_html(formatDate(item.created_at))}</span></div></div> <div class="flex gap-1"><button class="p-1.5 rounded hover:bg-binos-light"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button> <button class="p-1.5 rounded hover:bg-binos-light text-binos-red"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
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
