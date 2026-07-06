<script lang="ts">
  import { onMount } from 'svelte';
  onMount(async () => {
    const { goto } = await import('$app/navigation');
    goto('/properties', { replaceState: true });
  });
</script>
