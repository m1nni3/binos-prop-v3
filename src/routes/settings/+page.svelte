<script lang="ts">
  import { toast, readFileAsDataURL } from '$lib/stores';

  let logoPreview = $state('');
  let faviconPreview = $state('');
  let saving = $state(false);

  function loadSettings() {
    try { const s = JSON.parse(localStorage.getItem('POMP_SETTINGS') || '{}'); logoPreview = s.logo || ''; faviconPreview = s.favicon || ''; } catch {}
  }

  function saveSettings(s: Record<string, string>) {
    localStorage.setItem('POMP_SETTINGS', JSON.stringify(s));
    window.dispatchEvent(new CustomEvent('pomp-settings-changed', { detail: s }));
  }

  async function handleLogoUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    logoPreview = await readFileAsDataURL(file);
  }

  async function handleFaviconUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    faviconPreview = await readFileAsDataURL(file);
  }

  function resetLogo() { logoPreview = ''; }
  function resetFavicon() { faviconPreview = ''; }

  function save() {
    saving = true;
    setTimeout(() => {
      saveSettings({ logo: logoPreview, favicon: faviconPreview });
      applyFavicon(faviconPreview);
      saving = false;
      toast('success', 'Settings saved');
    }, 300);
  }

  function applyFavicon(dataUrl: string) {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = dataUrl || '/public/favicon.ico';
  }

  loadSettings();
</script>

<div class="max-w-2xl mx-auto">
  <div class="mb-6">
    <h2 class="page-title">Settings</h2>
    <p class="text-sm text-binos-gray mt-1">Customize your POMP branding - logo and favicon</p>
  </div>

  <div class="card p-6 mb-6">
    <h3 class="font-display font-semibold text-lg mb-4">Branding</h3>
    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-binos-gray mb-2">Logo</label>
        <div class="flex items-start gap-4">
          <div class="w-20 h-20 rounded-xl border-2 border-dashed border-binos-border flex items-center justify-center overflow-hidden flex-shrink-0 bg-binos-light/50">
            {#if logoPreview}
              <img src={logoPreview} class="w-full h-full object-contain" alt="Logo preview">
            {:else}
              <span class="text-binos-gray text-xs text-center px-1">No logo set</span>
            {/if}
          </div>
          <div class="flex flex-col gap-2">
            <label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload Logo
              <input type="file" accept="image/*" class="hidden" onchange={handleLogoUpload}>
            </label>
            {#if logoPreview}
              <button class="btn-secondary btn-sm" onclick={resetLogo}>Remove</button>
            {/if}
            <p class="text-xs text-binos-gray">Recommended: PNG or SVG, max 200x200px</p>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-binos-gray mb-2">Favicon</label>
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg border-2 border-dashed border-binos-border flex items-center justify-center overflow-hidden flex-shrink-0 bg-binos-light/50">
            {#if faviconPreview}
              <img src={faviconPreview} class="w-full h-full object-contain" alt="Favicon preview">
            {:else}
              <span class="text-binos-gray text-xs text-center px-1">None</span>
            {/if}
          </div>
          <div class="flex flex-col gap-2">
            <label class="btn-primary btn-sm cursor-pointer inline-flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> Upload Favicon
              <input type="file" accept="image/*" class="hidden" onchange={handleFaviconUpload}>
            </label>
            {#if faviconPreview}
              <button class="btn-secondary btn-sm" onclick={resetFavicon}>Remove</button>
            {/if}
            <p class="text-xs text-binos-gray">Recommended: PNG or ICO, 32x32px or 64x64px</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex gap-3">
    <button class="btn-primary flex-1 justify-center" onclick={save} disabled={saving}>
      {saving ? 'Saving...' : 'Save Changes'}
    </button>
  </div>
</div>
