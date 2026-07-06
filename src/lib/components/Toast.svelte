<script lang="ts">
  import { notifications } from '../stores';

  const styles: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-binos-blue',
  };
</script>

{#each $notifications as n (n.id)}
  <div class="{styles[n.type] || styles.info} text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium pointer-events-auto animate-slideInRight flex items-center gap-2 max-w-sm">
    {n.message}
  </div>
{/each}
