import { sveltekit } from "@sveltejs/kit/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			ztext: resolve(__dirname, "../ztext/src/index.ts"),
		},
	},
	server: {
		fs: {
			allow: [resolve(__dirname, "../ztext")],
		},
	},
});
