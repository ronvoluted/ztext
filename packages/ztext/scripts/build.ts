import { $ } from "bun";

const ENTRY = "src/index.ts";
const OUT_DIR = "dist";

// Clean output directory
await $`rm -rf ${OUT_DIR}`;

// Bundle ESM with Bun
const result = await Bun.build({
	entrypoints: [ENTRY],
	outdir: OUT_DIR,
	format: "esm",
	minify: true,
	sourcemap: "linked",
	naming: "ztext.js",
});

if (!result.success) {
	console.error("Build failed:");
	for (const log of result.logs) {
		console.error(log);
	}
	process.exit(1);
}

console.log(`Bundled ${OUT_DIR}/ztext.js (${result.outputs[0].size} bytes)`);

// Emit TypeScript declarations via tsc
// tsconfig.build.json overrides target to ESNext for tsc 5.6 compat
await $`bunx tsc -p tsconfig.build.json`;

console.log(`Emitted ${OUT_DIR}/index.d.ts`);
