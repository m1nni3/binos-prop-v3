import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'dist/public',
      assets: 'dist/public',
      fallback: 'index.html',
      precompress: false,
      strict: true,
    }),
  },
};

export default config;
