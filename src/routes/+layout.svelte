<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { sidebarOpen } from '$lib/stores';
  import { ICONS } from '$lib/icons';
  import Toast from '$lib/components/Toast.svelte';
  import '../app.css';
  import { onMount } from 'svelte';

  const navSections = [
    {
      label: 'Management',
      items: [
        { name: 'Properties', path: '/properties', icon: 'building2', color: 'blue' },
        { name: 'Finances', path: '/finances', icon: 'chart', color: 'green' },
        { name: 'Contacts', path: '/contacts', icon: 'phone', color: 'orange' },
        { name: 'Maintenance', path: '/maintenance', icon: 'wrench', color: 'yellow' },
      ],
    },
    {
      label: 'Operations',
      items: [
        { name: 'Petty Cash', path: '/petty-cash', icon: 'wallet', color: 'purple' },
        { name: 'Tasks', path: '/tasks', icon: 'check', color: 'teal' },
        { name: 'Activity', path: '/activity', icon: 'bell', color: 'pink' },
        { name: 'Tenants', path: '/tenants', icon: 'user', color: 'green' },
      ],
    },
    {
      label: 'Reports',
      items: [
        { name: 'Debrief', path: '/debrief', icon: 'message', color: 'cyan' },
      ],
    },
  ];

  const extraLinks = [
    { name: 'Portals', path: '/portals', icon: 'globe', color: 'cyan' },
    { name: 'Settings', path: '/settings', icon: 'settings', color: 'gray' },
  ];

  let settings: Record<string, string> = $state({});
  let sidebarOpenLocal = $state(false);

  function toggleSidebar() {
    sidebarOpenLocal = !sidebarOpenLocal;
  }

  function isActive(path: string) {
    return $page.url.pathname === path;
  }

  function handleSearch(e: Event) {
    const input = e.target as HTMLInputElement;
    if (e instanceof KeyboardEvent && e.key === 'Enter' && input.value.trim()) {
      sessionStorage.setItem('globalSearch', input.value.trim());
      goto('/properties');
    }
  }

  let goto: (path: string) => void;

  onMount(async () => {
    const { goto: g } = await import('$app/navigation');
    goto = g;
    try {
      settings = JSON.parse(localStorage.getItem('POMP_SETTINGS') || '{}');
    } catch {}
    window.addEventListener('pomp-settings-changed', (e: Event) => {
      settings = (e as CustomEvent).detail;
    });
  });
</script>

<div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" class:hidden={!sidebarOpenLocal} onclick={toggleSidebar}></div>

<aside id="sidebar" class="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-binos-sidebar-gradient-from to-binos-sidebar-gradient-to flex flex-col transition-transform duration-300 lg:translate-x-0" class:-translate-x-full={!sidebarOpenLocal}>
  <div class="flex items-center gap-3 px-5 py-5 border-b border-white/10 sidebar-logo-area">
    {#if settings.logo}
      <img src={settings.logo} class="h-9 w-auto max-w-[160px] object-contain" alt="Logo">
    {:else}
      <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-binos-blue to-binos-purple flex items-center justify-center">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
      </div>
      <div>
        <div class="text-white font-display font-bold text-lg leading-tight">Binos</div>
        <div class="text-binos-gray text-xs">Property Management</div>
      </div>
    {/if}
  </div>

  <nav class="flex-1 overflow-y-auto px-3 py-4">
    {#each navSections as section}
      <div class="mb-6">
        <div class="px-3 mb-2 text-xs font-semibold text-binos-gray uppercase tracking-wider">{section.label}</div>
        {#each section.items as item}
          <a href={item.path} class="sidebar-link mb-1" class:active={isActive(item.path)}>
            <span class="sidebar-icon-{item.color}">{@html ICONS[item.icon]}</span>
            <span>{item.name}</span>
          </a>
        {/each}
      </div>
    {/each}

    <div class="mt-auto border-t border-white/10 pt-4 space-y-1">
      {#each extraLinks as item}
        <a href={item.path} class="sidebar-link mb-1" class:active={isActive(item.path)}>
          <span class="sidebar-icon-{item.color}">{@html ICONS[item.icon]}</span>
          <span>{item.name}</span>
        </a>
      {/each}
    </div>
  </nav>
</aside>

<div class="lg:ml-64 min-h-screen">
  <header class="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-binos-border">
    <div class="flex items-center justify-between px-4 lg:px-6 py-3">
      <div class="flex items-center gap-3">
        <button class="lg:hidden p-2 rounded-lg hover:bg-binos-light" onclick={toggleSidebar}>
          {@html ICONS.menu}
        </button>
        <div class="relative hidden sm:block">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-binos-gray">{@html ICONS.search}</span>
          <input type="text" placeholder="Search properties, contacts..." class="pl-10 pr-4 py-2 bg-binos-light border-0 rounded-lg text-sm w-64 focus:ring-2 focus:ring-binos-blue/30 focus:outline-none" onkeydown={handleSearch}>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <button class="relative p-2 rounded-lg hover:bg-binos-light">
          {@html ICONS.bell}
          <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-binos-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>
        <div class="flex items-center gap-2 pl-4 border-l border-binos-border">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-binos-blue to-binos-purple flex items-center justify-center">
            <span class="text-white text-sm font-medium">MP</span>
          </div>
          <span class="hidden sm:inline text-sm font-medium">MP</span>
        </div>
      </div>
    </div>
  </header>

  <main id="page-content" class="p-4 lg:p-6">
    {@render children()}
  </main>
</div>

<div class="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
  <Toast />
</div>


