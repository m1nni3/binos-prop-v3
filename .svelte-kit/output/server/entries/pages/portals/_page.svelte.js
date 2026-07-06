import { e as ensure_array_like } from "../../../chunks/index2.js";
import { a as apiClient, e as escHtml } from "../../../chunks/api.js";
import { e as escape_html, a as attr } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let loading = true;
    let error = null;
    let portals = [];
    let visible = {};
    let copied = null;
    let editingId = null;
    let editForm = { type: "", name: "", username: "", password: "", url: "" };
    async function load() {
      loading = true;
      error = null;
      try {
        const data = await apiClient.get("/portals");
        portals = Array.isArray(data) ? data : [];
      } catch (e) {
        error = e.message || "Failed to load portals";
      }
      loading = false;
    }
    load();
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-20"><div class="animate-spin w-8 h-8 border-4 border-binos-blue border-t-transparent rounded-full"></div></div>`);
    } else if (error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-20 text-binos-red">${escape_html(escHtml(error))}</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="space-y-6"><div class="flex items-center justify-between"><h2 class="page-title">Portal Passwords</h2><p class="text-sm text-binos-gray">Encrypted, stored in cloud database</p></div> <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><!--[-->`);
      const each_array = ensure_array_like(portals);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let p = each_array[$$index];
        if (editingId === p.id) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="card p-4 border-2 border-binos-blue"><div class="flex items-center justify-between mb-3"><span class="font-medium">Edit: ${escape_html(escHtml(p.name))}</span></div> <div class="grid grid-cols-2 gap-3"><div><label class="block text-xs text-binos-gray mb-1">Type</label><input class="input-field text-sm"${attr("value", editForm.type)}/></div> <div><label class="block text-xs text-binos-gray mb-1">Name</label><input class="input-field text-sm"${attr("value", editForm.name)}/></div> <div><label class="block text-xs text-binos-gray mb-1">Username</label><input class="input-field text-sm"${attr("value", editForm.username)}/></div> <div><label class="block text-xs text-binos-gray mb-1">Password</label><input class="input-field text-sm" type="text"${attr("value", editForm.password)}/></div> <div class="col-span-2"><label class="block text-xs text-binos-gray mb-1">URL</label><input class="input-field text-sm"${attr("value", editForm.url)}/></div></div> <div class="flex gap-2 mt-3"><button class="btn-primary btn-sm">Save</button><button class="btn-secondary btn-sm">Cancel</button></div></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<div class="card p-4"><div class="flex items-start justify-between mb-3"><div><span class="badge badge-blue">${escape_html(escHtml(p.type))}</span></div> <button class="text-binos-gray hover:text-binos-blue"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button></div> <h3 class="font-medium mb-3">${escape_html(escHtml(p.name))}</h3> <div class="space-y-2 text-sm"><div class="flex items-center justify-between"><span class="text-binos-gray">${escape_html(escHtml(p.username))}</span> <button class="text-xs text-binos-blue hover:underline">${escape_html(copied === "u" + p.id ? "Copied!" : "Copy")}</button></div> <div class="flex items-center justify-between"><span class="text-binos-gray">${escape_html(visible[p.id] ? escHtml(p.password) : "••••••••")}</span> <div class="flex gap-1"><button class="text-xs text-binos-gray hover:text-binos-blue">${escape_html(visible[p.id] ? "Hide" : "Show")}</button> <button class="text-xs text-binos-blue hover:underline">${escape_html(copied === "p" + p.id ? "Copied!" : "Copy")}</button></div></div></div> `);
          if (p.url) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<a${attr("href", p.url.startsWith("http") ? escHtml(p.url) : "#")} target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-xs text-binos-blue hover:underline">Open ${escape_html(escHtml(p.name))} →</a>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<button class="card p-4 border-2 border-dashed border-binos-border flex items-center justify-center text-binos-gray hover:border-binos-green hover:text-binos-green transition-colors"><div class="text-center"><svg class="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> <div class="text-sm">Add Portal</div></div></button>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
