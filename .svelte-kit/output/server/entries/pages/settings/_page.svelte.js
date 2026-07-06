import { a as attr, e as escape_html } from "../../../chunks/attributes.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let logoPreview = "";
    let faviconPreview = "";
    let saving = false;
    function loadSettings() {
      try {
        const s = JSON.parse(localStorage.getItem("POMP_SETTINGS") || "{}");
        logoPreview = s.logo || "";
        faviconPreview = s.favicon || "";
      } catch {
      }
    }
    loadSettings();
    $$renderer2.push(`<div class="max-w-2xl mx-auto"><div class="mb-6"><h2 class="page-title">Settings</h2> <p class="text-sm text-binos-gray mt-1">Customize your POMP branding - logo and favicon</p></div> <div class="card p-6 mb-6"><h3 class="font-display font-semibold text-lg mb-4">Branding</h3> <div class="space-y-6"><div><label class="block text-sm font-medium text-binos-gray mb-2">Logo</label> <div class="flex items-start gap-4"><div class="w-20 h-20 rounded-xl border-2 border-dashed border-binos-border flex items-center justify-center overflow-hidden flex-shrink-0 bg-binos-light/50">`);
    if (logoPreview) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", logoPreview)} class="w-full h-full object-contain" alt="Logo preview"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="text-binos-gray text-xs text-center px-1">No logo set</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex flex-col gap-2"><label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Upload Logo <input type="file" accept="image/*" class="hidden"/></label> `);
    if (logoPreview) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="btn-secondary btn-sm">Remove</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <p class="text-xs text-binos-gray">Recommended: PNG or SVG, max 200x200px</p></div></div></div> <div><label class="block text-sm font-medium text-binos-gray mb-2">Favicon</label> <div class="flex items-start gap-4"><div class="w-12 h-12 rounded-lg border-2 border-dashed border-binos-border flex items-center justify-center overflow-hidden flex-shrink-0 bg-binos-light/50">`);
    if (faviconPreview) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img${attr("src", faviconPreview)} class="w-full h-full object-contain" alt="Favicon preview"/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="text-binos-gray text-xs text-center px-1">None</span>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex flex-col gap-2"><label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg> Upload Favicon <input type="file" accept="image/*" class="hidden"/></label> `);
    if (faviconPreview) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="btn-secondary btn-sm">Remove</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <p class="text-xs text-binos-gray">Recommended: PNG or ICO, 32x32px or 64x64px</p></div></div></div></div></div> <div class="flex gap-3"><button class="btn-primary flex-1 justify-center"${attr("disabled", saving, true)}>${escape_html("Save Changes")}</button></div></div>`);
  });
}
export {
  _page as default
};
