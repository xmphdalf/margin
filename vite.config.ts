import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	// tailwindcss MUST come before sveltekit
	plugins: [tailwindcss(), sveltekit()]
});
